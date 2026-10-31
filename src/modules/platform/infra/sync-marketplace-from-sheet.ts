/**
 * Sync Partner Marketplace data từ Google Sheets (private, Service Account auth)
 * Infra layer — zero domain import ORM, dùng env vars cho credentials
 * POST /api/v1/platform/marketplace/sync
 */

import fs from "fs"
import path from "path"
import { google } from "googleapis"
import { getGoogleSheetsAuth } from "@/core/google/google-sheets-auth"
import type { PartnerStoreMarketplaceEntity } from "../domain/partner-marketplace.types"

const DATA_FILE_PATH = path.resolve(
  process.cwd(),
  "src/modules/platform/domain/partner-marketplace-data.json"
)

export interface SyncMarketplaceResult {
  added: number
  updated: number
  total: number
  durationMs: number
  error?: string
}

function splitList(val: string): string[] {
  if (!val || val === "không" || val === "không có") return []
  return val
    .split(/[,;/]/)
    .map((v) => v.trim())
    .filter(Boolean)
}

function extractDriveIds(rawUrls: string): string[] {
  const matches = rawUrls.match(/id=([a-zA-Z0-9_-]+)/g)
  if (!matches) return []
  return matches.map((m) => m.replace("id=", ""))
}

// ─── Row → Entity (75 cột, căn cứ actual sheet structure) ────────────────────

export function rowToEntity(row: string[], index: number): PartnerStoreMarketplaceEntity {
  const id = `store-mp-${String(index + 1).padStart(3, "0")}`
  const c = (idx: number) => (row[idx] ?? "").toString().trim()
  const rawImageUrls = c(62)
  const driveImageIds = extractDriveIds(rawImageUrls)

  return {
    id,
    audit: {
      timestamp: c(0),
      specialist: c(1),
      surveyDate: c(2),
      surveyType: c(3),
      notes: c(4) || undefined,
    },
    identity: {
      shopName: c(5) || `Cửa hàng #${index + 1}`,
      legalName: c(6) || undefined,
      taxCode: c(7) || undefined,
      ownerName: c(8) || c(5),
      contactPerson: c(9),
      operatingYears: c(10),
      scale: c(11),
      legalCompliance: c(12) || undefined,
    },
    contact: {
      phone: c(13),
      email: c(14) || undefined,
      address: c(15),
      googleMaps: c(16) || undefined,
    },
    digital: {
      facebook: c(17) || undefined,
      tiktok: c(18) || undefined,
      website: c(19) || undefined,
      googleReview: c(20) || undefined,
      facebookFollowers: c(21) || undefined,
      tiktokFollowers: c(22) || undefined,
      postingFrequency: c(23) || undefined,
      onlineOrderChannels: c(24) || undefined,
      adsAndLivestream: c(25) || undefined,
    },
    business: {
      monthlyRevenue: c(26) || undefined,
      dailyOrdersNormal: c(27) || undefined,
      dailyOrdersPeak: c(28) || undefined,
      aov: c(29) || undefined,
      targetCustomers: c(30) || undefined,
      b2bShare: c(31) || undefined,
      customerSources: c(32) || undefined,
      paymentMethods: c(33) || undefined,
      challenges: c(34) || undefined,
      goals12m: c(35) || undefined,
      algExpectations: c(36) || undefined,
      cooperationWishes: c(37) || undefined,
    },
    production: {
      productLines: splitList(c(38)),
      mainProductLine: c(39) || undefined,
      floristCount: c(40) || undefined,
      leadFloristExperience: c(41) || undefined,
      maxCapacityNormal: c(42) || undefined,
      maxCapacityPeak: c(43) || undefined,
      flowerSupply: c(44) || undefined,
      mainFlowerSource: c(45) || undefined,
      importFrequency: c(46) || undefined,
      rareFlowerAbility: c(47) || undefined,
      inboundProcess: c(48) || undefined,
      freshnessDuration: c(49) || undefined,
      lossRateEstimate: c(50) || undefined,
      nearExpireHandling: c(51) || undefined,
    },
    facilityAndDelivery: {
      coolers: c(52) || undefined,
      coldStorage: c(53) || undefined,
      premises: c(54) || undefined,
      space: c(55) || undefined,
      equipment: c(56) || undefined,
      staffing: c(57) || undefined,
      deliveryVehicles: c(58) || undefined,
      deliveryRadius: c(59) || undefined,
      deliveryCommitmentTime: c(60) || undefined,
      coldDeliveryAbility: c(61) || undefined,
      deliveryFeePolicy: c(62) || undefined,
    },
    media: {
      requiredPhotoTypes: c(63) || undefined,
      rawImageUrls: rawImageUrls || undefined,
      driveImageIds,
      requiredDocuments: c(64) || undefined,
    },
    scoreAndTier: {
      skillAndCraftScore: c(65) || undefined,
      processFacilityScore: c(66) || undefined,
      supplyStorageScore: c(67) || undefined,
      productionDeliveryScore: c(68) || undefined,
      legalDigitalScore: c(69) || undefined,
      disciplineCooperationScore: c(70) || undefined,
      totalScore: c(71) || undefined,
      suggestedTier: c(72) || "Hạng Tiêu Chuẩn",
      additionalNotes: c(73) || undefined,
    },
  }
}

// ─── Main sync function ───────────────────────────────────────────────────────

export async function syncMarketplaceFromSheet(): Promise<SyncMarketplaceResult> {
  const startAt = Date.now()

  const sheetId = process.env.PARTNER_SURVEY_SHEET_ID
  const sheetGid = process.env.PARTNER_SURVEY_SHEET_GID

  if (!sheetId) {
    return {
      added: 0,
      updated: 0,
      total: 0,
      durationMs: Date.now() - startAt,
      error: "Thiếu env: PARTNER_SURVEY_SHEET_ID",
    }
  }

  // Authenticate via Service Account
  let auth
  try {
    auth = getGoogleSheetsAuth()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { added: 0, updated: 0, total: 0, durationMs: Date.now() - startAt, error: msg }
  }

  const sheetsApi = google.sheets({ version: "v4", auth })

  // Discover sheet tab name from GID (nếu có) hoặc dùng tab đầu tiên
  let sheetRange = "A:BW" // 75 cột = A đến BW
  if (sheetGid) {
    try {
      const meta = await sheetsApi.spreadsheets.get({ spreadsheetId: sheetId })
      const tab = meta.data.sheets?.find(
        (s) => String(s.properties?.sheetId) === sheetGid
      )
      if (tab?.properties?.title) {
        sheetRange = `'${tab.properties.title}'!A:BW`
      }
    } catch {
      // Fall back to default range — will still work on first sheet
    }
  }

  // Fetch data
  let rows: string[][]
  try {
    const response = await sheetsApi.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: sheetRange,
    })
    rows = (response.data.values ?? []) as string[][]
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return {
      added: 0,
      updated: 0,
      total: 0,
      durationMs: Date.now() - startAt,
      error: `Lỗi đọc Google Sheets API: ${msg}`,
    }
  }

  if (rows.length < 2) {
    return {
      added: 0,
      updated: 0,
      total: 0,
      durationMs: Date.now() - startAt,
      error: "Sheet trống hoặc chỉ có header — không có dữ liệu để đồng bộ.",
    }
  }

  // Row 0 = header, data từ row 1
  const dataRows = rows.slice(1).filter((row) => row.some((cell) => (cell ?? "").trim().length > 0))

  // Load existing data for upsert
  let existing: PartnerStoreMarketplaceEntity[] = []
  try {
    const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8")
    existing = JSON.parse(raw) as PartnerStoreMarketplaceEntity[]
  } catch {
    existing = []
  }

  const existingByName = new Map<string, PartnerStoreMarketplaceEntity>()
  for (const s of existing) {
    existingByName.set(s.identity.shopName.toLowerCase().trim(), s)
  }

  let added = 0
  let updated = 0
  const merged: PartnerStoreMarketplaceEntity[] = []

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    if (!row) continue
    const entity = rowToEntity(row, i)
    const key = entity.identity.shopName.toLowerCase().trim()
    const prev = existingByName.get(key)

    if (prev) {
      merged.push({ ...entity, id: prev.id })
      updated++
    } else {
      merged.push(entity)
      added++
    }
  }

  // Ghi file JSON
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8")
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return {
      added: 0,
      updated: 0,
      total: 0,
      durationMs: Date.now() - startAt,
      error: `Không thể ghi file dữ liệu: ${msg}`,
    }
  }

  return { added, updated, total: merged.length, durationMs: Date.now() - startAt }
}

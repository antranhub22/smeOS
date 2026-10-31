/**
 * Parse và import file Excel (.xlsx, .xls, .csv) chứa dữ liệu khảo sát đối tác
 * Sử dụng thư viện xlsx (SheetJS) đã tích hợp sẵn trong repo
 */

import fs from "fs"
import path from "path"
import * as XLSX from "xlsx"
import type { PartnerStoreMarketplaceEntity } from "../domain/partner-marketplace.types"
import { rowToEntity } from "./sync-marketplace-from-sheet"

const DATA_FILE_PATH = path.resolve(
  process.cwd(),
  "src/modules/platform/domain/partner-marketplace-data.json"
)

export interface ImportMarketplaceExcelResult {
  added: number
  updated: number
  total: number
  durationMs: number
  error?: string
}

export async function importMarketplaceExcel(
  fileBuffer: Buffer
): Promise<ImportMarketplaceExcelResult> {
  const startAt = Date.now()

  let workbook: XLSX.WorkBook
  try {
    workbook = XLSX.read(fileBuffer, { type: "buffer" })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return {
      added: 0,
      updated: 0,
      total: 0,
      durationMs: Date.now() - startAt,
      error: `Không thể đọc file Excel: ${msg}`,
    }
  }

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    return {
      added: 0,
      updated: 0,
      total: 0,
      durationMs: Date.now() - startAt,
      error: "File Excel không có bất kỳ sheet dữ liệu nào.",
    }
  }

  const worksheet = workbook.Sheets[sheetName]
  if (!worksheet) {
    return {
      added: 0,
      updated: 0,
      total: 0,
      durationMs: Date.now() - startAt,
      error: "Không tìm thấy dữ liệu trong sheet.",
    }
  }

  // Chuyển sheet sang dạng mảng 2 chiều string[][]
  const rawRows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
    header: 1,
    defval: "",
    raw: false,
  })

  if (rawRows.length < 2) {
    return {
      added: 0,
      updated: 0,
      total: 0,
      durationMs: Date.now() - startAt,
      error: "File Excel cần có ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu.",
    }
  }

  // Bỏ qua dòng header (dòng 0), lọc các dòng có dữ liệu
  const dataRows = rawRows
    .slice(1)
    .filter((row) => Array.isArray(row) && row.some((cell) => String(cell).trim().length > 0))

  // Nạp dữ liệu cũ để thực hiện upsert theo tên shop
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
    // Ép kiểu các ô về string[]
    const stringRow = row.map((c) => String(c ?? "").trim())
    const entity = rowToEntity(stringRow, i)
    const key = entity.identity.shopName.toLowerCase().trim()
    const prev = existingByName.get(key)

    if (prev) {
      // Giữ nguyên ID và ảnh đã tải nếu có
      merged.push({
        ...entity,
        id: prev.id,
        media: {
          ...entity.media,
          coverPhotoUrl: prev.media.coverPhotoUrl ?? entity.media.coverPhotoUrl,
          photoGalleryUrls: prev.media.photoGalleryUrls ?? entity.media.photoGalleryUrls,
        },
      })
      updated++
    } else {
      merged.push(entity)
      added++
    }
  }

  // Lưu lại vào file JSON
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(merged, null, 2), "utf-8")
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return {
      added: 0,
      updated: 0,
      total: 0,
      durationMs: Date.now() - startAt,
      error: `Lỗi ghi file dữ liệu: ${msg}`,
    }
  }

  return {
    added,
    updated,
    total: merged.length,
    durationMs: Date.now() - startAt,
  }
}


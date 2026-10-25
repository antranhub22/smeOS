/**
 * SMEOS Platform Admin — Get Org Actual Records (Platform-Level)
 *
 * Trả về bản ghi thực tế (không phải schema metadata) của từng domain:
 * - catalog: danh sách sản phẩm đầy đủ
 * - orders: danh sách đơn hàng
 * - members: danh sách thành viên
 * - branches: danh sách chi nhánh
 * - customers: danh sách khách hàng
 * - jobs: danh sách AI generation jobs
 *
 * Sử dụng cursor-based pagination (max 100/page theo A10).
 * Platform Admin có quyền xem RAW không qua DSA.
 */

import { prisma } from "@/core/tenancy/infra/prisma"
import type { PlatformContext } from "@/core/platform/platform-context"
import { requirePlatformCapability } from "@/core/platform/platform-capabilities"
import { signStorageUrl } from "@/modules/assets/infra/storage-signing"
import { driveThumbProxySrc } from "@/modules/greeting-card/domain/drive-thumb"

export type RecordDomain =
  | "catalog"
  | "orders"
  | "members"
  | "branches"
  | "customers"
  | "jobs"
  | "spreadsheets"

export interface RecordColumn {
  readonly key: string
  readonly label: string
  readonly type: "text" | "number" | "date" | "badge" | "money" | "image"
}

export interface PlatformOrgRecordsResult {
  readonly domain: RecordDomain
  readonly columns: readonly RecordColumn[]
  readonly rows: readonly Record<string, unknown>[]
  readonly total: number
  readonly page: number
  readonly pageSize: number
  readonly totalPages: number
}

const PAGE_SIZE = 100

export async function getPlatformOrgRecords(
  pctx: PlatformContext,
  orgId: string,
  domain: RecordDomain,
  page = 1
): Promise<PlatformOrgRecordsResult> {
  requirePlatformCapability(pctx, "N1")

  const skip = (page - 1) * PAGE_SIZE

  switch (domain) {
    case "catalog": {
      const [total, products] = await Promise.all([
        prisma.products.count({ where: { organization_id: orgId } }),
        prisma.products.findMany({
          where: { organization_id: orgId },
          orderBy: { created_at: "desc" },
          skip,
          take: PAGE_SIZE,
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
            shape: true,
            status: true,
            attributes: true,
            created_at: true,
            images: {
              where: { role: "MAIN" },
              take: 1,
              select: { asset_id: true },
            },
          },
        }),
      ])

      // Batch-load storage_key cho tất cả main images
      const assetIds = products
        .map((p) => p.images[0]?.asset_id)
        .filter((id): id is string => Boolean(id))

      const assets = await prisma.assets.findMany({
        where: { id: { in: assetIds } },
        select: { id: true, storage_key: true, thumb_key: true },
      })
      const assetMap = new Map(assets.map((a) => [a.id, a]))

      const exp = Date.now() + 86_400_000 // 24h signed URL

      return {
        domain,
        columns: [
          { key: "image_thumb", label: "Ảnh", type: "image" },
          { key: "code", label: "Mã SP", type: "text" },
          { key: "name", label: "Tên sản phẩm", type: "text" },
          { key: "category", label: "Danh mục", type: "text" },
          { key: "shape", label: "Kiểu dáng", type: "text" },
          { key: "status", label: "Trạng thái", type: "badge" },
          { key: "price_vnd", label: "Giá (VNĐ)", type: "money" },
          { key: "image_url", label: "URL ảnh gốc", type: "text" },
          { key: "created_at", label: "Tạo lúc", type: "date" },
        ],
        rows: products.map((p) => {
          const attrs = (p.attributes as Record<string, unknown> | null) ?? {}
          const assetId = p.images[0]?.asset_id
          const asset = assetId ? assetMap.get(assetId) : undefined
          const thumbKey = asset?.thumb_key ?? asset?.storage_key
          const mainKey = asset?.storage_key

          const storageThumbUrl = thumbKey
            ? `/api/v1/storage/${thumbKey}?exp=${exp}&sig=${signStorageUrl(thumbKey, exp)}`
            : null
          const storageImageUrl = mainKey
            ? `/api/v1/storage/${mainKey}?exp=${exp}&sig=${signStorageUrl(mainKey, exp)}`
            : null

          const attrImageUrl = typeof attrs.imageUrl === "string" && attrs.imageUrl ? attrs.imageUrl : null
          const rawDriveLink =
            (typeof attrs.drive_link === "string" && attrs.drive_link) ||
            (typeof attrs.driveLink === "string" && attrs.driveLink) ||
            (typeof attrs.drive_url === "string" && attrs.drive_url) ||
            null
          const driveProxyUrl = driveThumbProxySrc(rawDriveLink)

          const thumbUrl = storageThumbUrl ?? attrImageUrl ?? driveProxyUrl ?? null
          const imageUrl = storageImageUrl ?? attrImageUrl ?? rawDriveLink ?? null

          return {
            id: p.id,
            image_thumb: thumbUrl ?? "—",
            code: p.code,
            name: p.name,
            category: p.category ?? "—",
            shape: p.shape ?? "—",
            status: p.status,
            price_vnd:
              typeof attrs.price_vnd === "number"
                ? attrs.price_vnd
                : typeof attrs.price === "number"
                ? attrs.price
                : "—",
            image_url: imageUrl ?? "—",
            created_at: p.created_at.toISOString(),
          }
        }),
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
      }
    }

    case "orders": {
      const [total, orders] = await Promise.all([
        prisma.orders.count({ where: { organization_id: orgId } }),
        prisma.orders.findMany({
          where: { organization_id: orgId },
          orderBy: { created_at: "desc" },
          skip,
          take: PAGE_SIZE,
          select: {
            id: true,
            code: true,
            status: true,
            production_status: true,
            delivery_status: true,
            total_vnd: true,
            paid_vnd: true,
            balance_vnd: true,
            card_message: true,
            source: true,
            created_at: true,
            customer: { select: { name: true, phone: true } },
          },
        }),
      ])
      return {
        domain,
        columns: [
          { key: "code", label: "Mã đơn", type: "text" },
          { key: "customer_name", label: "Khách hàng", type: "text" },
          { key: "customer_phone", label: "SĐT", type: "text" },
          { key: "status", label: "Trạng thái", type: "badge" },
          { key: "production_status", label: "Sản xuất", type: "badge" },
          { key: "total_vnd", label: "Tổng tiền (VNĐ)", type: "money" },
          { key: "paid_vnd", label: "Đã thu (VNĐ)", type: "money" },
          { key: "source", label: "Nguồn", type: "text" },
          { key: "created_at", label: "Tạo lúc", type: "date" },
        ],
        rows: orders.map((o) => ({
          id: o.id,
          code: o.code,
          customer_name: o.customer?.name ?? "Khách lẻ",
          customer_phone: o.customer?.phone ?? "—",
          status: o.status,
          production_status: o.production_status,
          total_vnd: Number(o.total_vnd),
          paid_vnd: Number(o.paid_vnd),
          balance_vnd: Number(o.balance_vnd),
          source: o.source ?? "MANUAL",
          created_at: o.created_at.toISOString(),
        })),
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
      }
    }

    case "members": {
      const [total, members] = await Promise.all([
        prisma.memberships.count({ where: { organization_id: orgId } }),
        prisma.memberships.findMany({
          where: { organization_id: orgId },
          orderBy: { invited_at: "desc" },
          skip,
          take: PAGE_SIZE,
          select: {
            id: true,
            status: true,
            role_id: true,
            invited_at: true,
            joined_at: true,
            user: { select: { name: true, email: true } },
          },
        }),
      ])
      return {
        domain,
        columns: [
          { key: "name", label: "Tên thành viên", type: "text" },
          { key: "email", label: "Email", type: "text" },
          { key: "role_id", label: "Vai trò", type: "badge" },
          { key: "status", label: "Trạng thái", type: "badge" },
          { key: "invited_at", label: "Mời lúc", type: "date" },
          { key: "joined_at", label: "Tham gia lúc", type: "date" },
        ],
        rows: members.map((m) => ({
          id: m.id,
          name: m.user.name,
          email: m.user.email ?? "—",
          role_id: m.role_id,
          status: m.status,
          invited_at: m.invited_at.toISOString(),
          joined_at: m.joined_at?.toISOString() ?? "—",
        })),
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
      }
    }

    case "branches": {
      const [total, branches] = await Promise.all([
        prisma.branches.count({ where: { organization_id: orgId } }),
        prisma.branches.findMany({
          where: { organization_id: orgId },
          orderBy: { created_at: "asc" },
          skip,
          take: PAGE_SIZE,
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
            is_active: true,
            created_at: true,
            _count: { select: { inventory: true } },
          },
        }),
      ])
      return {
        domain,
        columns: [
          { key: "code", label: "Mã chi nhánh", type: "text" },
          { key: "name", label: "Tên chi nhánh", type: "text" },
          { key: "address", label: "Địa chỉ", type: "text" },
          { key: "is_active", label: "Hoạt động", type: "badge" },
          { key: "inventory_count", label: "Tồn kho", type: "number" },
          { key: "created_at", label: "Tạo lúc", type: "date" },
        ],
        rows: branches.map((b) => ({
          id: b.id,
          code: b.code,
          name: b.name,
          address: b.address ?? "—",
          is_active: b.is_active ? "Hoạt động" : "Tạm dừng",
          inventory_count: b._count.inventory,
          created_at: b.created_at.toISOString(),
        })),
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
      }
    }

    case "customers": {
      const [total, customers] = await Promise.all([
        prisma.customers.count({ where: { organization_id: orgId } }),
        prisma.customers.findMany({
          where: { organization_id: orgId },
          orderBy: { created_at: "desc" },
          skip,
          take: PAGE_SIZE,
          select: {
            id: true,
            code: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            tier: true,
            notes: true,
            total_spent: true,
            order_count: true,
            created_at: true,
          },
        }),
      ])
      return {
        domain,
        columns: [
          { key: "code", label: "Mã KH", type: "text" },
          { key: "name", label: "Tên khách hàng", type: "text" },
          { key: "phone", label: "SĐT", type: "text" },
          { key: "email", label: "Email", type: "text" },
          { key: "tier", label: "Hạng", type: "badge" },
          { key: "total_spent", label: "Tổng chi (VNĐ)", type: "money" },
          { key: "order_count", label: "Số đơn", type: "number" },
          { key: "address", label: "Địa chỉ", type: "text" },
          { key: "created_at", label: "Tạo lúc", type: "date" },
        ],
        rows: customers.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          phone: c.phone ?? "—",
          email: c.email ?? "—",
          tier: c.tier,
          total_spent: Number(c.total_spent),
          order_count: c.order_count,
          address: c.address ?? "—",
          created_at: c.created_at.toISOString(),
        })),
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
      }
    }

    case "jobs": {
      const [total, jobs] = await Promise.all([
        prisma.generation_jobs.count({ where: { organization_id: orgId } }),
        prisma.generation_jobs.findMany({
          where: { organization_id: orgId },
          orderBy: { created_at: "desc" },
          skip,
          take: PAGE_SIZE,
          select: {
            id: true,
            feature: true,
            status: true,
            stage: true,
            result: true,
            attempts: true,
            user_id: true,
            created_at: true,
            started_at: true,
            completed_at: true,
          },
        }),
      ])
      return {
        domain,
        columns: [
          { key: "feature", label: "Tính năng AI", type: "text" },
          { key: "status", label: "Trạng thái", type: "badge" },
          { key: "stage", label: "Giai đoạn", type: "text" },
          { key: "result", label: "Kết quả", type: "badge" },
          { key: "attempts", label: "Số lần thử", type: "number" },
          { key: "duration_s", label: "Thời gian (s)", type: "number" },
          { key: "created_at", label: "Tạo lúc", type: "date" },
        ],
        rows: jobs.map((j) => ({
          id: j.id,
          feature: j.feature,
          status: j.status,
          stage: j.stage ?? "—",
          result: j.result ?? "—",
          attempts: j.attempts,
          duration_s:
            j.started_at && j.completed_at
              ? Math.round(
                  (j.completed_at.getTime() - j.started_at.getTime()) / 1000
                )
              : "—",
          created_at: j.created_at.toISOString(),
        })),
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
      }
    }

    case "spreadsheets": {
      const exp = Date.now() + 86_400_000 // 24h
      const [total, files] = await Promise.all([
        prisma.assets.count({
          where: {
            organization_id: orgId,
            mime_type: {
              in: [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
                "text/csv",
              ],
            },
          },
        }),
        prisma.assets.findMany({
          where: {
            organization_id: orgId,
            mime_type: {
              in: [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
                "text/csv",
              ],
            },
          },
          orderBy: { version: "desc" },
          skip,
          take: PAGE_SIZE,
          select: {
            id: true,
            storage_key: true,
            mime_type: true,
            file_size: true,
            parameters: true,
            version: true,
            state: true,
          },
        }),
      ])

      return {
        domain,
        columns: [
          { key: "filename", label: "Tên file gốc", type: "text" },
          { key: "extension", label: "Định dạng", type: "badge" },
          { key: "file_size_formatted", label: "Dung lượng", type: "text" },
          { key: "security_status", label: "Bảo mật & Quét", type: "badge" },
          { key: "download_url", label: "Tải file về", type: "text" },
        ],
        rows: files.map((f) => {
          const params = (f.parameters as Record<string, unknown> | null) ?? {}
          const originalName = typeof params.original_filename === "string" ? params.original_filename : f.storage_key.split("/").pop() ?? f.id
          const ext = f.storage_key.split(".").pop()?.toUpperCase() ?? "XLSX"
          const sizeKb = f.file_size ? `${(f.file_size / 1024).toFixed(1)} KB` : "—"
          const sig = signStorageUrl(f.storage_key, exp)
          const downloadUrl = `/api/v1/storage/${f.storage_key}?exp=${exp}&sig=${sig}`

          return {
            id: f.id,
            filename: originalName,
            extension: ext,
            file_size_formatted: sizeKb,
            security_status: "Đã quét an toàn",
            download_url: downloadUrl,
          }
        }),
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
      }
    }
  }
}

/** Xuất toàn bộ records dưới dạng CSV (không phân trang) */
export async function exportPlatformOrgRecordsCsv(
  pctx: PlatformContext,
  orgId: string,
  domain: RecordDomain
): Promise<string> {
  requirePlatformCapability(pctx, "N1")

  // Lấy tất cả, không phân trang (phục vụ export)
  const result = await getPlatformOrgRecords(pctx, orgId, domain, 1)
  const allRows =
    result.total <= PAGE_SIZE
      ? result.rows
      : await (async () => {
          const pages = Math.ceil(result.total / PAGE_SIZE)
          const allData: Record<string, unknown>[] = [...result.rows]
          for (let p = 2; p <= pages; p++) {
            const r = await getPlatformOrgRecords(pctx, orgId, domain, p)
            allData.push(...r.rows)
          }
          return allData
        })()

  const headers = result.columns.map((c) => c.label)
  const keys = result.columns.map((c) => c.key)

  const csvLines = [
    headers.join(","),
    ...allRows.map((row) =>
      keys
        .map((k) => {
          const val = row[k] ?? ""
          const s = String(val).replace(/"/g, '""')
          return s.includes(",") || s.includes("\n") || s.includes('"') ? `"${s}"` : s
        })
        .join(",")
    ),
  ]

  return csvLines.join("\n")
}

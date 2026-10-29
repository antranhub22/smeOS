import { afterAll, beforeEach, describe, expect, it } from "vitest"

import type { TenantContext } from "@/core/tenancy"
import { countPayloadReferences } from "@/modules/assets/infra/payload-references"
import { deleteAssetAndEnqueuePayloads, listPendingOutbox } from "@/modules/assets/infra/payload-outbox"
import { setLegalHoldUntil } from "@/modules/assets/infra/legal-hold"
import { findExpiredTrashedAssets } from "@/modules/storage/infra/expired-trash-query"

import { disconnectDatabase, prisma, resetDatabase } from "../helpers/database"
import { createTenant, type Tenant } from "../helpers/fixtures"

/** SDAGF P1 — hàng đợi xoá payload, thùng rác theo cột, legal hold. */
describe("cách ly tenant — vòng đời kho tệp (SDAGF P1)", () => {
  let a: Tenant
  let b: Tenant

  beforeEach(async () => {
    await resetDatabase()
    a = await createTenant("alpha")
    b = await createTenant("beta")
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  async function seedAsset(ctx: TenantContext, data: { storageKey?: string; purgeAfter?: Date; hold?: Date } = {}) {
    const id = crypto.randomUUID()
    return prisma.assets.create({
      data: {
        id,
        organization_id: ctx.organizationId,
        kind: "ORIGINAL",
        state: data.purgeAfter ? "ARCHIVED" : "READY",
        storage_key: data.storageKey ?? `org/${ctx.organizationId}/unfiled/${id}.jpg`,
        mime_type: "image/jpeg",
        created_by: ctx.userId,
        purge_after: data.purgeAfter ?? null,
        legal_hold_until: data.hold ?? null,
      },
    })
  }

  it("xoá asset của tổ chức khác: không xoá gì, không ghi hàng đợi", async () => {
    const asset = await seedAsset(a.ctx)
    expect(await deleteAssetAndEnqueuePayloads(b.ctx, asset, "asset.delete")).toBe(false)
    expect(await prisma.assets.count({ where: { id: asset.id } })).toBe(1)
    expect(await prisma.storage_outbox.count()).toBe(0)
    expect(await prisma.audit_logs.count({ where: { entity_id: asset.id } })).toBe(0)
  })

  it("xoá asset: dòng mất và hàng đợi có khoá payload trong cùng transaction", async () => {
    const asset = await seedAsset(a.ctx)
    expect(await deleteAssetAndEnqueuePayloads(a.ctx, asset, "trash.permanent_delete")).toBe(true)
    expect(await prisma.assets.count({ where: { id: asset.id } })).toBe(0)
    const audit = await prisma.audit_logs.findMany({ where: { entity_id: asset.id } })
    expect(audit).toEqual([expect.objectContaining({ organization_id: a.organizationId, action: "trash.permanent_delete" })])
    const pending = await listPendingOutbox(10)
    expect(pending).toEqual([expect.objectContaining({ organization_id: a.organizationId, storage_key: asset.storage_key })])
  })

  it("đếm tham chiếu chỉ trong tổ chức của phiên; Master dùng chung tệp được đếm", async () => {
    const original = await seedAsset(a.ctx)
    await seedAsset(a.ctx, { storageKey: original.storage_key })
    expect(await countPayloadReferences(a.ctx, original.storage_key)).toBe(2)
    expect(await countPayloadReferences(b.ctx, original.storage_key)).toBe(0)
  })

  it("quét thùng rác: chỉ lấy asset quá hạn và không còn legal hold", async () => {
    const now = new Date()
    const past = new Date(now.getTime() - 86400000)
    const future = new Date(now.getTime() + 86400000)
    const expired = await seedAsset(a.ctx, { purgeAfter: past })
    await seedAsset(a.ctx, { purgeAfter: future })
    await seedAsset(b.ctx, { purgeAfter: past, hold: future })
    const found = await findExpiredTrashedAssets(now, 10)
    expect(found.map((x) => x.id)).toEqual([expired.id])
  })

  it("legal hold chỉ đặt được cho asset đúng tổ chức", async () => {
    const asset = await seedAsset(a.ctx)
    const until = new Date(Date.now() + 86400000)
    expect(await setLegalHoldUntil(b.organizationId, asset.id, until)).toBeNull()
    expect(await setLegalHoldUntil(a.organizationId, asset.id, until)).toEqual({ before: null })
    const row = await prisma.assets.findUnique({ where: { id: asset.id } })
    expect(row?.legal_hold_until?.getTime()).toBe(until.getTime())
  })
})

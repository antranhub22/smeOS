import { afterAll, beforeEach, describe, expect, it } from "vitest"

import { GovernanceRepository } from "@/modules/integration-hub/infra/governance-repository"
import { NotificationHardLockRepository } from "@/modules/notification/infra/notification-hard-lock-repository"

import { disconnectDatabase, prisma, resetDatabase } from "../helpers/database"

/**
 * ADR-012 D-T5, bước T-6b: `scope_id` lưu theo địa chỉ phạm vi chuẩn (`platform`, `industry:<key>`, `org:<id>`);
 * domain/API vẫn dùng dạng cũ ("GLOBAL", id tổ chức). Dòng dạng cũ (bản cũ ghi trong lúc deploy) vẫn đọc/xoá được.
 */
describe("khoá phạm vi dạng D-T5", () => {
  beforeEach(async () => {
    await resetDatabase()
    await prisma.notification_hard_locks.deleteMany({})
    await prisma.integration_governance.deleteMany({})
  })

  afterAll(async () => {
    await prisma.notification_hard_locks.deleteMany({})
    await prisma.integration_governance.deleteMany({})
    await disconnectDatabase()
  })

  it("khoá thông báo: ghi dạng mới, đọc trả dạng domain; dòng dạng cũ vẫn đọc và xoá được", async () => {
    const repo = new NotificationHardLockRepository()
    await repo.setHardLock({ eventKey: "order.created", channel: "EMAIL", tier: "MOTHER", scopeId: "GLOBAL", enabled: false, lockedBy: "u" })
    await repo.setHardLock({ eventKey: "order.created", channel: "EMAIL", tier: "CHAIN", scopeId: "org-a", enabled: false, lockedBy: "u" })
    expect((await prisma.notification_hard_locks.findMany({ orderBy: { tier: "asc" } })).map((r) => r.scope_id)).toEqual(["org:org-a", "platform"])

    expect((await repo.getHardLocks({ scopeId: "GLOBAL" })).map((l) => l.scopeId)).toEqual(["GLOBAL"])
    expect((await repo.getHardLocks({ scopeId: "org-a" })).map((l) => l.scopeId)).toEqual(["org-a"])

    await prisma.notification_hard_locks.create({
      data: { event_key: "order.paid", channel: "EMAIL", tier: "STORE", scope_id: "org-b", enabled: false, locked_by: "u" },
    })
    expect((await repo.getHardLocks({ scopeId: "org-b" })).map((l) => l.eventKey)).toEqual(["order.paid"])
    await repo.deleteHardLock("order.paid", "EMAIL", "STORE", "org-b")
    expect(await prisma.notification_hard_locks.count({ where: { scope_id: "org-b" } })).toBe(0)
  })

  it("quản trị tích hợp: ghi dạng mới, đọc theo phạm vi domain; ALLOW_OWN xoá cả dòng dạng cũ", async () => {
    const repo = new GovernanceRepository()
    await repo.set({ connectorKey: "zalo", tier: "MOTHER", scopeId: "GLOBAL", mode: "FORBID", updatedBy: "u" })
    await repo.set({ connectorKey: "zalo", tier: "INDUSTRY", scopeId: "industry:FLORAL", mode: "FORBID", updatedBy: "u" })
    await repo.set({ connectorKey: "zalo", tier: "CHAIN", scopeId: "chain-1", mode: "INHERIT_ONLY", updatedBy: "u" })
    expect((await prisma.integration_governance.findMany()).map((r) => r.scope_id).sort()).toEqual(["industry:FLORAL", "org:chain-1", "platform"])

    const rows = await repo.listForScopes(["GLOBAL", "industry:FLORAL", "chain-1"])
    expect(rows.map((r) => r.scopeId).sort()).toEqual(["GLOBAL", "chain-1", "industry:FLORAL"])

    await prisma.integration_governance.create({ data: { connector_key: "sms", tier: "CHAIN", scope_id: "chain-1", mode: "FORBID", updated_by: "u" } })
    expect((await repo.listForScopes(["chain-1"])).map((r) => r.connectorKey).sort()).toEqual(["sms", "zalo"])
    await repo.set({ connectorKey: "sms", tier: "CHAIN", scopeId: "chain-1", mode: "ALLOW_OWN", updatedBy: "u" })
    expect(await prisma.integration_governance.count({ where: { connector_key: "sms" } })).toBe(0)
  })
})

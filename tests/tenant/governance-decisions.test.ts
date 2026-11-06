import { afterAll, beforeEach, describe, expect, it } from "vitest"

import { PUT as putMatrix } from "@/app/api/v1/organizations/current/governance-matrix/route"
import { PATCH as patchOrganization } from "@/app/api/v1/organizations/current/route"
import { PUT as putIntegration } from "@/app/api/v1/integrations/governance/route"
import { DELETE as deleteOrgLock, POST as postOrgLock } from "@/app/api/v1/notification/org-hard-locks/route"
import {
  identityKey,
  integrationRecord,
  matrixRecords,
  notificationLockRecord,
  notificationVisibilityRecord,
  type DecisionRecord,
} from "@/core/governance/decision-record"
import { currentDecisions } from "@/core/governance/infra/decision-log"
import { NotificationPreferenceRepository } from "@/modules/notification/infra/notification-preference-repository"
import { parseDecisions } from "@/modules/organization/domain/governance-decisions"
import { saveMotherGovernance } from "@/modules/organization/infra/governance-decisions-repository"

import { disconnectDatabase, prisma, resetDatabase } from "../helpers/database"
import { createTenant, linkPartner, makeChainOrganization, withSession, type Tenant } from "../helpers/fixtures"

/**
 * ADR-012 D-T10, bước T-7a: mọi đường ghi quyết định theo tầng ghi kép `governance_decisions` trong cùng giao dịch.
 * Chốt: sau mỗi chuỗi thao tác qua route thật, quyết định hiện hành của bảng mới TRÙNG KHỚP nơi lưu cũ (cùng quy ước
 * với phần chép của migration `*_governance_decisions`). T-7b sẽ chuyển đọc sang bảng mới dựa trên chốt này.
 */
describe("governance_decisions — ghi kép khớp nơi lưu cũ", () => {
  let chain: Tenant
  let store: Tenant

  beforeEach(async () => {
    await resetDatabase()
    await prisma.platform_settings.deleteMany({ where: { key: { startsWith: "governance_matrix:" } } })
    chain = await createTenant("chuoi")
    store = await createTenant("cua-hang")
    await makeChainOrganization(chain)
    await linkPartner(chain, store, { code: "P-01" })
  })

  afterAll(async () => {
    await prisma.platform_settings.deleteMany({ where: { key: { startsWith: "governance_matrix:" } } })
    await disconnectDatabase()
  })

  /** Quyết định đang hiệu lực đọc từ nơi lưu cũ, đổi sang bản ghi như migration T-7a. */
  async function legacyProjection(): Promise<DecisionRecord[]> {
    const out: DecisionRecord[] = []
    for (const org of await prisma.organizations.findMany({ select: { id: true, type: true, settings: true } })) {
      const matrix = ((org.settings as Record<string, unknown> | null)?.governance_matrix ?? {}) as Record<string, unknown>
      for (const [system, raw] of Object.entries(matrix)) {
        const tier = org.type === "CHAIN" ? "CHAIN" : "STORE"
        out.push(...matrixRecords({ system, tier, scope: `org:${org.id}`, decisions: parseDecisions(raw), decidedBy: null }))
      }
    }
    for (const p of await prisma.platform_settings.findMany({ where: { key: { startsWith: "governance_matrix:" } } })) {
      const system = p.key.slice("governance_matrix:".length)
      out.push(...matrixRecords({ system, tier: "MOTHER", scope: "platform", decisions: parseDecisions(p.value), decidedBy: null }))
    }
    for (const h of await prisma.notification_hard_locks.findMany()) {
      out.push(notificationLockRecord({ eventKey: h.event_key, channel: h.channel, tier: h.tier as "MOTHER", scopeId: h.scope_id, enabled: h.enabled, reason: h.reason, decidedBy: null }))
    }
    for (const v of await prisma.notification_event_visibility.findMany()) {
      out.push(notificationVisibilityRecord({ eventKey: v.event_key, targetTier: v.tier, visible: v.visible, decidedBy: null }))
    }
    for (const g of await prisma.integration_governance.findMany()) {
      out.push(integrationRecord({ connectorKey: g.connector_key, tier: g.tier as "MOTHER", scopeId: g.scope_id, mode: g.mode, decidedBy: null }))
    }
    return out
  }

  // JSONB không giữ thứ tự khoá — so theo khoá đã xếp
  const stable = (v: DecisionRecord["value"]) => JSON.stringify(v === null ? null : Object.fromEntries(Object.entries(v).sort()))
  const view = (rs: readonly DecisionRecord[]) => rs.map((r) => `${identityKey(r)}=${stable(r.value)}`).sort()
  async function expectInSync() {
    expect(view(await currentDecisions(prisma, {}))).toEqual(view(await legacyProjection()))
  }

  const matrixUrl = "http://localhost/api/v1/organizations/current/governance-matrix?system=PAYMENTS"
  const saveMatrix = (t: Tenant, decisions: unknown) =>
    putMatrix(withSession(matrixUrl, t.token, { method: "PUT", body: JSON.stringify({ decisions }) }))

  it("ma trận của chuỗi, của cửa hàng và của Mẹ: ghi, đổi, bỏ mục — bảng mới luôn khớp; mục bỏ thành dòng gỡ", async () => {
    expect((await saveMatrix(chain, { overrides: { vietqr: false }, locks: { deposit_min: { enabled: true } } })).status).toBe(200)
    expect((await saveMatrix(store, { overrides: { cod: true }, locks: {} })).status).toBe(200)
    await saveMotherGovernance("PAYMENTS", { overrides: {}, locks: { bank_transfer: { enabled: true } } }, null)
    await expectInSync()

    expect((await saveMatrix(chain, { overrides: { vietqr: true }, locks: {} })).status).toBe(200)
    await expectInSync()
    const removed = await prisma.governance_decisions.findMany({
      where: { scope: `org:${chain.organizationId}`, decision_key: "deposit_min" },
      orderBy: { version: "asc" },
    })
    expect(removed.map((r) => r.value)).toEqual([{ enabled: true }, null])
    expect(removed[1]?.decided_by).toBe(chain.userId)

    // Lưu lại đúng tập cũ không thêm dòng
    const before = await prisma.governance_decisions.count()
    await saveMatrix(chain, { overrides: { vietqr: true }, locks: {} })
    expect(await prisma.governance_decisions.count()).toBe(before)
  })

  it("ma trận bị cấp trên từ chối (422) không để lại dòng nào", async () => {
    await saveMatrix(chain, { overrides: {}, locks: { deposit_min: { enabled: true } } })
    const before = await prisma.governance_decisions.count()
    expect((await saveMatrix(store, { overrides: { deposit_min: false }, locks: {} })).status).toBe(422)
    expect(await prisma.governance_decisions.count()).toBe(before)
  })

  it("PATCH settings không ghi thẳng được governance_matrix (bỏ qua kiểm khoá và ghi kép)", async () => {
    const res = await patchOrganization(
      withSession("http://localhost/api/v1/organizations/current", store.token, {
        method: "PATCH",
        body: JSON.stringify({ settings: { governance_matrix: { PAYMENTS: { overrides: { deposit_min: false }, locks: {} } } } }),
      }),
    )
    expect(res.status).toBe(403)
    await expectInSync()
  })

  it("khoá cứng thông báo của chuỗi: đặt, đổi, gỡ — bảng mới khớp; dòng gỡ ghi người gỡ", async () => {
    const url = "http://localhost/api/v1/notification/org-hard-locks"
    const send = (method: string, body: unknown) => withSession(url, chain.token, { method, body: JSON.stringify(body) })
    expect((await postOrgLock(send("POST", { eventKey: "ORDER_RECEIVED", channel: "EMAIL", enabled: false, reason: "Bảo trì" }))).status).toBe(200)
    await expectInSync()
    expect((await postOrgLock(send("POST", { eventKey: "ORDER_RECEIVED", channel: "EMAIL", enabled: true }))).status).toBe(200)
    await expectInSync()
    expect((await deleteOrgLock(send("DELETE", { eventKey: "ORDER_RECEIVED", channel: "EMAIL" }))).status).toBe(200)
    await expectInSync()
    const last = await prisma.governance_decisions.findFirst({ where: { system: "notification.hard_lock" }, orderBy: { version: "desc" } })
    expect(last).toMatchObject({ scope: `org:${chain.organizationId}`, tier: "CHAIN", value: null, decided_by: chain.userId })
  })

  it("hiển thị sự kiện theo tầng (quyết định của Mẹ) khớp bảng mới", async () => {
    const repo = new NotificationPreferenceRepository()
    await repo.setEventVisibility("ORDER_RECEIVED", "STORE", false, "op-1")
    await repo.setEventVisibility("ORDER_RECEIVED", "STORE", true, "op-1")
    await expectInSync()
    expect(await prisma.governance_decisions.count({ where: { system: "notification.visibility" } })).toBe(2)
  })

  it("khoá tích hợp của chuỗi: FORBID → INHERIT_ONLY → ALLOW_OWN (gỡ) — bảng mới khớp", async () => {
    const put = (mode: string) =>
      putIntegration(withSession("http://localhost/api/v1/integrations/governance", chain.token, {
        method: "PUT",
        body: JSON.stringify({ connectorKey: "zalo_oa", mode }),
      }))
    for (const mode of ["FORBID", "INHERIT_ONLY", "ALLOW_OWN"]) {
      expect((await put(mode)).status).toBe(200)
      await expectInSync()
    }
    const rows = await prisma.governance_decisions.findMany({ where: { system: "integration" }, orderBy: { version: "asc" } })
    expect(rows.map((r) => r.value)).toEqual([{ mode: "FORBID" }, { mode: "INHERIT_ONLY" }, null])
  })
})

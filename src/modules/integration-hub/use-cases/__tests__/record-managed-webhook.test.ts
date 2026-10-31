import { describe, expect, it } from "vitest"
import { recordManagedWebhook, type ManagedWebhookOutcome } from "../record-managed-webhook"
import { replayEvent } from "../connection-events"
import { disconnectConnection } from "../manage-connection"
import { getIntegrationHub } from "../get-integration-hub"
import { ctxOf, makeFakeDeps } from "./fake-hub-deps"

const base: ManagedWebhookOutcome = {
  organizationId: "org-a",
  connectorKey: "facebook_messenger",
  externalAccountId: "page-1",
  displayName: "Trang Facebook",
  externalEventId: "mid-1",
  eventType: "message",
  ok: true,
}

describe("Nhật ký webhook của tích hợp sẵn có (Facebook, Zalo OA)", () => {
  it("tin xử lý được ghi DONE, không lưu nội dung, dùng chung một dòng theo dõi", async () => {
    const { deps, connections, events } = makeFakeDeps()
    await recordManagedWebhook(base, deps)
    await recordManagedWebhook({ ...base, externalEventId: "mid-2" }, deps)
    expect(connections).toHaveLength(1)
    expect(connections[0]).toMatchObject({ managed: true, credentialEncrypted: null, status: "ACTIVE" })
    expect(events.map((e) => e.status)).toEqual(["DONE", "DONE"])
    expect(events[0]!.payload).toEqual({})
  })

  it("tin lỗi ghi DEAD, kết nối chuyển Chập chờn và báo một lần; tin ổn sau đó đưa về Đang hoạt động", async () => {
    const { deps, connections } = makeFakeDeps()
    await recordManagedWebhook({ ...base, ok: false, errorCode: "REPLY_FAILED" }, deps)
    await recordManagedWebhook({ ...base, externalEventId: "mid-2", ok: false }, deps)
    expect(connections[0]!.status).toBe("DEGRADED")
    expect(deps.notify).toHaveBeenCalledTimes(1)
    await recordManagedWebhook({ ...base, externalEventId: "mid-3" }, deps)
    expect(connections[0]!.status).toBe("ACTIVE")
  })

  it("không bao giờ ném lỗi về route webhook", async () => {
    const { deps } = makeFakeDeps()
    deps.connections.ensureManaged = async () => {
      throw new Error("db down")
    }
    await expect(recordManagedWebhook(base, deps)).resolves.toBeUndefined()
  })

  it("dòng theo dõi không ngắt/thử lại được từ Hub và không hiện như kết nối thường", async () => {
    const { deps, connections, events } = makeFakeDeps()
    await recordManagedWebhook({ ...base, ok: false }, deps)
    const orgA = ctxOf("org-a")
    await expect(replayEvent(orgA, events[0]!.id, deps)).rejects.toMatchObject({ code: "UNPROCESSABLE_ENTITY" })
    await expect(disconnectConnection(orgA, connections[0]!.id, deps)).rejects.toMatchObject({ code: "UNPROCESSABLE_ENTITY" })
    const hub = await getIntegrationHub(orgA, deps)
    expect(hub.connections).toHaveLength(0)
    expect(hub.managedLogs).toHaveLength(1)
    expect((await getIntegrationHub(ctxOf("org-b"), deps)).managedLogs).toHaveLength(0)
  })
})

import { createHash, createHmac } from "node:crypto"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { handleIncomingChannelMessage, findActiveByFbPageId, findActiveByZaloOaId, claimIdempotencyKey } = vi.hoisted(() => {
  const seen = new Set<string>()
  return {
    handleIncomingChannelMessage: vi.fn(async () => ({ replyText: "Dạ" })),
    findActiveByFbPageId: vi.fn(),
    findActiveByZaloOaId: vi.fn(),
    claimIdempotencyKey: vi.fn(async (org: string, scope: string, key: string) => {
      const k = `${org}|${scope}|${key}`
      if (seen.has(k)) return false
      seen.add(k)
      return true
    }),
  }
})
vi.mock("@/core/idempotency/infra/idempotency-repository", () => ({ claimIdempotencyKey }))
vi.mock("@/modules/chat-assistant/use-cases/handle-incoming-channel-message", () => ({ handleIncomingChannelMessage }))
vi.mock("@/modules/chat-assistant/infra/chat-channel-repository", () => ({
  ChatChannelRepository: vi.fn().mockImplementation(function () {
    return { findActiveByFbPageId, findActiveByZaloOaId }
  }),
}))

import { POST as facebookPost, GET as facebookGet } from "@/app/api/v1/chat/webhooks/facebook/route"
import { POST as zaloPost } from "@/app/api/v1/chat/webhooks/zalo/route"
import { matchesVerifyToken, verifyFacebookSignature } from "@/core/http/webhook-signature"
import type { NextRequest } from "next/server"

const req = (url: string, body: string, headers: Record<string, string> = {}) =>
  new Request(url, { method: "POST", body, headers }) as unknown as NextRequest

/** AUD-028: webhook chat chỉ nhận sự kiện có chữ ký hợp lệ; không thì không gọi AI, không gửi tin. */
describe("chữ ký webhook chat Facebook/Zalo", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}")))
    findActiveByFbPageId.mockResolvedValue({ organizationId: "org-1", config: {} })
    findActiveByZaloOaId.mockResolvedValue({
      organizationId: "org-1",
      config: { zaloAppId: "app-9", zaloSecretKey: "oa-secret" },
    })
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    handleIncomingChannelMessage.mockClear()
  })

  it("verifyFacebookSignature: đúng HMAC → true; sai, thiếu header hoặc thiếu secret → false", () => {
    const body = '{"object":"page"}'
    const sig = "sha256=" + createHmac("sha256", "app-secret").update(body).digest("hex")
    expect(verifyFacebookSignature(body, sig, "app-secret")).toBe(true)
    expect(verifyFacebookSignature(body + " ", sig, "app-secret")).toBe(false)
    expect(verifyFacebookSignature(body, null, "app-secret")).toBe(false)
    expect(verifyFacebookSignature(body, sig, undefined)).toBe(false)
  })

  it("verify token: không còn giá trị mặc định viết cứng", () => {
    expect(matchesVerifyToken("floraos_facebook_verify_token", undefined)).toBe(false)
    expect(matchesVerifyToken("abc", "abc")).toBe(true)
  })

  const fbBody = JSON.stringify({ object: "page", entry: [{ id: "page-1", messaging: [{ sender: { id: "u1" }, message: { text: "Giá bao nhiêu?" } }] }] })

  it("Facebook: không chữ ký → 401, không gọi AI", async () => {
    vi.stubEnv("FB_APP_SECRET", "app-secret")
    const res = await facebookPost(req("http://x/api/v1/chat/webhooks/facebook", fbBody))
    expect(res.status).toBe(401)
    expect(handleIncomingChannelMessage).not.toHaveBeenCalled()
  })

  it("Facebook: chưa cấu hình FB_APP_SECRET → 401 (đóng hẳn)", async () => {
    const sig = "sha256=" + createHmac("sha256", "x").update(fbBody).digest("hex")
    const res = await facebookPost(req("http://x/api/v1/chat/webhooks/facebook", fbBody, { "x-hub-signature-256": sig }))
    expect(res.status).toBe(401)
  })

  it("Facebook: chữ ký đúng → xử lý tin nhắn", async () => {
    vi.stubEnv("FB_APP_SECRET", "app-secret")
    const sig = "sha256=" + createHmac("sha256", "app-secret").update(fbBody).digest("hex")
    const res = await facebookPost(req("http://x/api/v1/chat/webhooks/facebook", fbBody, { "x-hub-signature-256": sig }))
    expect(res.status).toBe(200)
    expect(handleIncomingChannelMessage).toHaveBeenCalledOnce()
  })

  it("Facebook GET: verify token mặc định cũ không còn mở được webhook", async () => {
    const url = "http://x/api/v1/chat/webhooks/facebook?hub.mode=subscribe&hub.verify_token=floraos_facebook_verify_token&hub.challenge=42"
    const res = await facebookGet(new Request(url) as unknown as NextRequest)
    expect(res.status).toBe(403)
  })

  const zaloEvent = (ts: string) =>
    JSON.stringify({ event_name: "user_send_text", app_id: "app-9", oa_id: "oa-1", timestamp: ts, sender: { id: "z1" }, message: { text: "Còn hàng không?" } })
  const zaloMac = (body: string, ts: string) => "mac=" + createHash("sha256").update("app-9" + body + ts + "oa-secret").digest("hex")

  it("Zalo: chữ ký sai → 401, không gọi AI", async () => {
    const ts = String(Date.now())
    const body = zaloEvent(ts)
    const res = await zaloPost(req("http://x/api/v1/chat/webhooks/zalo", body, { "x-zevent-signature": "mac=deadbeef" }))
    expect(res.status).toBe(401)
    expect(handleIncomingChannelMessage).not.toHaveBeenCalled()
  })

  it("Zalo: chữ ký đúng theo secret của OA tiệm → xử lý; sự kiện cũ (phát lại) → 401", async () => {
    const ts = String(Date.now())
    const body = zaloEvent(ts)
    const ok = await zaloPost(req("http://x/api/v1/chat/webhooks/zalo", body, { "x-zevent-signature": zaloMac(body, ts) }))
    expect(ok.status).toBe(200)
    expect(handleIncomingChannelMessage).toHaveBeenCalledOnce()

    const old = String(Date.now() - 24 * 60 * 60 * 1000)
    const oldBody = zaloEvent(old)
    const replay = await zaloPost(req("http://x/api/v1/chat/webhooks/zalo", oldBody, { "x-zevent-signature": zaloMac(oldBody, old) }))
    expect(replay.status).toBe(401)
  })

  it("E5.3: cùng một tin (mid / msg_id) gửi lại → chỉ trả lời một lần", async () => {
    vi.stubEnv("FB_APP_SECRET", "app-secret")
    const fb = JSON.stringify({ object: "page", entry: [{ id: "page-1", messaging: [{ sender: { id: "u1" }, message: { mid: "m.fb-1", text: "Giá?" } }] }] })
    const sig = "sha256=" + createHmac("sha256", "app-secret").update(fb).digest("hex")
    for (let i = 0; i < 2; i++) {
      expect((await facebookPost(req("http://x/api/v1/chat/webhooks/facebook", fb, { "x-hub-signature-256": sig }))).status).toBe(200)
    }
    expect(handleIncomingChannelMessage).toHaveBeenCalledOnce()

    handleIncomingChannelMessage.mockClear()
    const ts = String(Date.now())
    const zalo = JSON.stringify({ event_name: "user_send_text", app_id: "app-9", oa_id: "oa-1", timestamp: ts, sender: { id: "z1" }, message: { msg_id: "z-1", text: "Còn hàng?" } })
    for (let i = 0; i < 2; i++) {
      expect((await zaloPost(req("http://x/api/v1/chat/webhooks/zalo", zalo, { "x-zevent-signature": zaloMac(zalo, ts) }))).status).toBe(200)
    }
    expect(handleIncomingChannelMessage).toHaveBeenCalledOnce()
    expect(claimIdempotencyKey).toHaveBeenCalledWith("org-1", "webhook.zalo", "z-1")
  })
})


import { afterEach, describe, expect, it, vi } from "vitest"

import { postJson } from "@/components/creative-studio/revise-client"

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("postJson — gọi API sửa lại của Creative Studio", () => {
  it("gửi JSON kèm khoá idempotency khi có và trả thân phản hồi", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ job_id: "j1" }), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
    await expect(postJson<{ job_id: string }>("/api/x", { a: 1 }, "k-1")).resolves.toEqual({ job_id: "j1" })
    expect(fetchMock).toHaveBeenCalledWith("/api/x", {
      method: "POST",
      headers: { "Content-Type": "application/json", "idempotency-key": "k-1" },
      body: JSON.stringify({ a: 1 }),
    })
  })

  it("không có khoá thì không gửi header idempotency", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => new Response("{}", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
    await postJson("/api/x", {})
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ headers: { "Content-Type": "application/json" } })
  })

  it("lỗi máy chủ: ném thông điệp của API, không có thì mã HTTP", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: { message: "Hết credit" } }), { status: 402 })))
    await expect(postJson("/api/x", {})).rejects.toThrow("Hết credit")
    vi.stubGlobal("fetch", vi.fn(async () => new Response("not json", { status: 500 })))
    await expect(postJson("/api/x", {})).rejects.toThrow("HTTP 500")
  })
})

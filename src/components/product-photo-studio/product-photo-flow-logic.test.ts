import { describe, expect, it } from "vitest"
import {
  MAX_POLLS,
  POLL_INTERVAL_MS,
  parseCreatedPhotoJob,
  parsePolledPhotoJob,
  photoJobStorageKey,
} from "./product-photo-flow-logic"

describe("hợp đồng API công cụ Tạo ảnh sản phẩm (pilot 03c)", () => {
  it("đọc đúng phản hồi tạo job thật của API (không bọc data)", () => {
    expect(parseCreatedPhotoJob({ job_id: "j1", status: "PENDING", usage: { cost_credit: 2, balance_after: 18 } })).toEqual({
      jobId: "j1",
      costCredit: 2,
      balanceAfter: 18,
    })
  })

  it("vẫn đọc được nếu API bọc data; thiếu job id thì null", () => {
    expect(parseCreatedPhotoJob({ data: { jobId: "j2" } })?.jobId).toBe("j2")
    expect(parseCreatedPhotoJob({ status: "PENDING" })).toBeNull()
    expect(parseCreatedPhotoJob(null)).toBeNull()
  })

  it("trạng thái poll ánh xạ qua task-state; chỉ có kết quả khi đã xong", () => {
    expect(parsePolledPhotoJob({ status: "PROCESSING" })).toEqual({ state: "running", result: null, error: null })
    const done = parsePolledPhotoJob({ status: "COMPLETED", masterUrl: "u" })
    expect(done.state).toBe("succeeded")
    expect(done.result?.masterUrl).toBe("u")
    expect(parsePolledPhotoJob({ status: "FAILED", error: "Ảnh quá mờ" })).toMatchObject({ state: "failed", error: "Ảnh quá mờ" })
  })

  it("trạng thái lạ không bị coi là xong", () => {
    expect(parsePolledPhotoJob({ status: "WHATEVER" }).state).toBeNull()
  })

  it("vòng hỏi lại có giới hạn ~5 phút và khoá nhớ gắn tổ chức", () => {
    expect(MAX_POLLS * POLL_INTERVAL_MS).toBe(300_000)
    expect(photoJobStorageKey("org-a")).toBe("smeos.anh-san-pham.lastJobId__org-a")
    expect(photoJobStorageKey(null)).toBeNull()
  })
})

import { describe, expect, it } from "vitest"

import { telegramLinkCode } from "../../infra/telegram-link-code"
import { toBranchCandidate } from "../../infra/chain-branch-repository"
import { chatsWithLinkCode } from "../telegram-dispatch-link"

describe("liên kết nhóm Telegram theo tổ chức", () => {
  it("mỗi tổ chức một mã, ổn định giữa các lần gọi", () => {
    expect(telegramLinkCode("org-a")).toBe(telegramLinkCode("org-a"))
    expect(telegramLinkCode("org-a")).not.toBe(telegramLinkCode("org-b"))
    expect(telegramLinkCode("org-a")).toMatch(/^SMEOS-[0-9A-F]{10}$/)
  })

  it("chỉ nhóm đã nhắn đúng mã của tổ chức mới được tính, nhóm của tenant khác bị loại", () => {
    const codeA = telegramLinkCode("org-a")
    const codeB = telegramLinkCode("org-b")
    const chats = chatsWithLinkCode(
      [
        { chatId: "-100", title: "Nhóm A", type: "group", text: `liên kết ${codeA.toLowerCase()}` },
        { chatId: "-200", title: "Nhóm B", type: "group", text: codeB },
        { chatId: "-300", title: "Nhóm lạ", type: "group", text: "Xin chào" },
        { chatId: "-100", title: "Nhóm A", type: "group", text: codeA },
      ],
      codeA
    )
    expect(chats).toEqual([{ id: "-100", title: "Nhóm A", type: "group" }])
  })

  it("kênh chi nhánh chỉ giữ giá trị chuỗi, bỏ giá trị sai kiểu", () => {
    const row = {
      branch_code: "CN1", name: "Chi nhánh 1", address: null, latitude: 10.7, longitude: null,
      quality_score: 88, active_jobs_count: 1, max_concurrent_jobs: 5, is_active: true,
      channels: { telegramChatId: "-111", zaloPhone: 42, phone: null },
    }
    const candidate = toBranchCandidate(row)
    expect(candidate.branchId).toBe("CN1")
    expect(candidate.location).toBeNull()
    expect(candidate.channels).toEqual({ telegramChatId: "-111", phone: undefined, zaloPhone: undefined, messengerId: undefined })
    expect(toBranchCandidate({ ...row, channels: ["sai"] }).channels).toEqual({})
  })
})

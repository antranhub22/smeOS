import { describe, expect, it } from "vitest"

import { telegramLinkCode } from "../../infra/telegram-link-code"
import { chatsWithLinkCode, configuredBranchChatIds } from "../telegram-dispatch-link"

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

  it("đọc chat ID chi nhánh đã cấu hình, bỏ giá trị rỗng/sai kiểu", () => {
    expect(
      configuredBranchChatIds({
        chain_branches: [
          { channels: { telegramChatId: "-111" } },
          { channels: { telegramChatId: "  " } },
          { channels: {} },
          { channels: { telegramChatId: 42 } },
        ],
      })
    ).toEqual(["-111"])
    expect(configuredBranchChatIds(null)).toEqual([])
  })
})

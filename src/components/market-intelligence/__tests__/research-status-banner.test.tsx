import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { ResearchStatusBanner } from "../research-status-banner"

describe("Banner phiên quét Xu hướng thị trường (03c UX-016, đợt A-5)", () => {
  it("báo trạng thái cho trình đọc màn hình và dùng từ vựng chuẩn", () => {
    const running = renderToStaticMarkup(<ResearchStatusBanner status={{ state: "running", message: "m" }} />)
    expect(running).toContain('role="status"')
    expect(running).toContain("Đang thu thập dữ liệu")
    const failed = renderToStaticMarkup(<ResearchStatusBanner status={{ state: "failed", message: "chậm" }} />)
    expect(failed).toContain('role="alert"')
    expect(failed).toContain("Nghiên cứu chưa xong được")
  })

  it("hết lượt hỏi mà phiên chưa xong thì không để banner đang chạy mãi", () => {
    const src = readFileSync(join(__dirname, "../use-market-intelligence-data.ts"), "utf-8")
    const timeoutBlock = src.slice(src.indexOf("if (attempts >= 25)"), src.indexOf("}, 2000)"))
    expect(timeoutBlock).toContain('state: "failed"')
  })
})

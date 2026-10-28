import { expect, test } from "@playwright/test"
import { createTestUserAndLogin } from "./helpers"

test.describe("UX Role-based Homepage (03b Role UX §4)", () => {
  test("vai Điều hành (dieu_hanh, PRODUCTION) vào trang chủ lựa chọn công việc của cửa hàng", async ({ page }) => {
    await createTestUserAndLogin(page, {
      roleKey: "dieu_hanh",
      workspaceKind: "PRODUCTION",
    })
    await page.goto("/")

    // Trang chủ chủ tiệm: "Bạn muốn làm gì?" (Journey-First 30/09/2026); từ PO 27/10/2026 lưới lựa chọn
    // là Thư viện công cụ chia theo nhóm (role-ux-catalog: TOOLKIT_HOME) thay cho thẻ "Xem báo cáo".
    await expect(page.getByRole("heading", { level: 1, name: /Bạn muốn làm gì/i })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole("heading", { level: 2, name: /^Nhóm 1/ })).toBeVisible()
    await expect(page.getByRole("heading", { level: 3 }).first()).toBeVisible()
  })

  test("vai Bán hàng (sale, PRODUCTION) vào trang chủ Pipeline Workspace", async ({ page }) => {
    await createTestUserAndLogin(page, {
      roleKey: "sale",
      workspaceKind: "PRODUCTION",
    })
    await page.goto("/")

    // Kiểm tra khối "Khách cần liên hệ" hoặc nút tạo đơn
    const contactBlock = page.locator("text=/Khách cần liên hệ|Tạo đơn nhanh|Tạo đơn/i")
    await expect(contactBlock.first()).toBeVisible({ timeout: 15_000 })
  })

  test("vai Điều phối (dieu_phoi, PRODUCTION) ở lại trang chủ chuỗi, không tự chuyển sang /dieu-phoi", async ({ page }) => {
    await createTestUserAndLogin(page, {
      roleKey: "dieu_phoi",
      workspaceKind: "PRODUCTION",
    })
    await page.goto("/")

    // PO 23/10/2026: mọi vai luôn thấy trang chủ sau đăng nhập; /dieu-phoi mở từ menu
    await expect(page.getByRole("heading", { level: 1, name: /Bạn muốn làm gì/i })).toBeVisible({ timeout: 15_000 })
    await expect(page).not.toHaveURL(/\/dieu-phoi/)
  })
})

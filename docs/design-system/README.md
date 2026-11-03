# smeOS Design System — Single Source of Truth (SSOT)

> **Cấp thẩm quyền:** `CANONICAL` · **Cấp bậc tài liệu:** `Level 3` · **Phiên bản:** `1.0.0-draft` (theo ADR-011)  
> **Chủ quản:** Product Owner / Lead UI-UX Architect  
> **Nguyên tắc cốt lõi:** **Code là nguồn sự thật**. Tài liệu này đóng vai trò chỉ mục trung tâm và hợp đồng quy chuẩn (Contract) cho toàn bộ giao diện của nền tảng SaaS Đa ngành SMEOS.

---

## 1. Triết lý Thiết kế & Nguyên tắc Bất biến

1. **Multi-Industry First**: Mọi component và layout thiết kế trung tính hoặc thích ứng động theo `IndustryPluginContract`. Cấm hardcode tên ngành hoặc màu sắc đặc thù vào component lõi.
2. **Zero Hardcoded Aesthetics**: 100% thuộc tính thẩm mỹ (màu, font, bo góc, bóng đổ) phải tiêu thụ thông qua **Design Tokens ngữ nghĩa**. Cấm màu Tailwind gốc (`bg-red-500`, `text-blue-600`...) và 12 thang màu alias (`cool`, `blush`, `mint`...).
3. **Server-Side Theme Resolution**: Theme được phân giải tại máy chủ và gắn vào `<html data-theme data-density>`. Không tiêm inline style ở client, không gây hiện tượng nháy giao diện (FOUC).
4. **Mobile-First & Touch Target Compliance**:
   - Vùng chạm sàn tuyệt đối 24px (WCAG 2.5.8).
   - Mọi điều khiển chính và điều khiển trên con trỏ thô (`pointer: coarse`) bắt buộc ≥ 44px.
   - Hỗ trợ chuẩn 6 khổ màn hình: 360, 390, 768, 1024, 1280, 1440px.
5. **Universal Headless Primitive**: Chuẩn hóa toàn bộ thành phần tương tác trên `@base-ui/react` (1.9.0) và biểu tượng Phosphor qua `@/components/ui/icons`.

---

## 2. Bản đồ Chỉ mục Hệ thống (Design System Index)

| Thành phần | Vị trí Mã nguồn (SSOT) | Đặc tả Quy chuẩn & Hợp đồng | Trạng thái |
|---|---|---|:---:|
| **Design Tokens** | `src/styles/tokens/*.css` (`globals.css`) | [tokens.md](tokens.md) *(sinh tự động từ CSS)* | 🟡 Đang hoàn thiện GĐ 1 |
| **Component Primitives** | `src/components/ui/` | [components/](components/) *(Hợp đồng từng component)* | 🟡 Đang hoàn thiện GĐ 2 |
| **Bố cục & Archetypes** | `src/components/layout/` | [layouts.md](layouts.md) *(Archetype A–F, AppShell)* | 🟡 Đang hoàn thiện GĐ 3 |
| **Quy chuẩn Responsive** | `src/styles/tokens/breakpoints.css` | [responsive.md](responsive.md) *(360px → 1440px)* | 🟢 Chuẩn hóa ADR-011 |
| **Quy chuẩn Trợ năng (A11y)**| `src/components/ui/live-region.tsx` | [accessibility.md](accessibility.md) *(WCAG 2.2 AA)* | 🟢 Chuẩn hóa ADR-011 |
| **Hợp đồng Màn hình** | `docs/dac-ta/screen-contracts/` | `docs/dac-ta/screen-contracts/_TEMPLATE.md` | 🟡 Di trú v2 GĐ 4 |
| **Lịch sử & Thay đổi** | `CHANGELOG.md` | [CHANGELOG.md](CHANGELOG.md) | 🟢 Bắt đầu từ v1.0.0 |
| **Nhật ký Audit Gốc** | `docs/design-system/audit-log.md` | [audit-log.md](audit-log.md) *(MEUX Deep Audit)* | 📁 Lưu trữ tham khảo |

---

## 3. Chính sách Quản trị Token & Component (Governance)

- **Quy trình thêm/sửa Token**:
  - Tuyệt đối cấm lập trình viên hoặc AI Agent tự ý bổ sung token vào `globals.css`.
  - Mọi thay đổi hoặc bổ sung token phải thông qua Pull Request chạm vào `src/styles/tokens/`, được kiểm tra độ tương phản tự động và có **PO phê duyệt** (`CODEOWNERS`).
- **Quy trình Deprecation**:
  - Không xóa bỏ đột ngột component hoặc prop đang dùng.
  - Phải gắn thẻ `@deprecated` kèm hướng dẫn thay thế trong ít nhất một bản minor trước khi gỡ bỏ ở bản major tiếp theo.

---

## 4. Các Cổng Kiểm soát Tự động (Automated Gates)

Mọi đóng góp mã nguồn liên quan đến giao diện bắt buộc vượt qua các cổng kiểm soát:
1. `npm run lint:ux -- --check`: Kiểm chuẩn 100% token ngữ nghĩa, cỡ chữ, chống jargon và chống alias lách luật.
2. `npm run check:screen-contracts`: Đảm bảo mọi `page.tsx` đều có Screen Contract v2 hợp lệ.
3. `npm run test:e2e:ux`: Chạy kiểm thử tự động visual snapshot 2 khổ (390px, 1280px) và quét `axe-core` đạt 0 lỗi Critical/Serious.
4. `npm run check:layers`: Ngăn ngừa vi phạm ranh giới kiến trúc (cấm UI import trực tiếp từ `infra/`).

---

## 5. Tài liệu Lưu trữ Lịch sử (Archive)

Toàn bộ các bản nháp, báo cáo audit cũ và tài liệu chuyển đổi giai đoạn tháng 10/2026 đã được lưu trữ an toàn tại:
`docs/archive/historical/ui-ux-2026-10/`.
Các tài liệu trong thư mục archive mang tính chất tham khảo lịch sử, **không phải là nguồn sự thật** cho phát triển hiện tại.


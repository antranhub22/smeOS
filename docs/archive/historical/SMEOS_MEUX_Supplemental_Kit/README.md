> [!NOTE]
> **LƯU TRỮ — không còn hiệu lực riêng.** Đã hợp nhất vào `docs/dac-ta/03c-ux-progressive-disclosure.md` (PD6) và `docs/dac-ta/ux-patterns/` (`page-archetypes.md`, `visual-review.md`) — PO duyệt 29/10/2026. Báo cáo mapping: `docs/ui-ux/MEUX_AUDIT_MAPPING.md`.

# SMEOS Minimalist Enterprise UX — Supplemental Kit

**Mục đích:** Bộ tài liệu bổ sung để AI coding agent audit và nâng cấp bộ tiêu chuẩn UX hiện tại của SMEOS theo hướng giao diện nghiệp vụ tối giản, giảm nhiễu thị giác, tối ưu mật độ thông tin và hiển thị theo ngữ cảnh.

## Nguyên tắc sử dụng

Đây là **bộ tài liệu bổ sung**, không phải yêu cầu thay thế toàn bộ tiêu chuẩn hiện có. Agent phải kiểm tra repository và tài liệu hiện hành trước khi chỉnh sửa, xác định nguồn sự thật (source of truth), sau đó tích hợp các quy tắc phù hợp, giải quyết xung đột và cập nhật liên kết.

Không mặc định rằng các thư mục, tên file, framework frontend hoặc design tokens được nêu trong tài liệu này đã tồn tại trong repository. Agent phải phát hiện cấu trúc thực tế trước khi hành động.

## Danh mục

1. `01_MEUX_PRINCIPLES.md` — Nguyên tắc UX tối giản cho SMEOS.
2. `02_INFORMATION_DENSITY_AND_HIERARCHY.md` — Mật độ thông tin và phân cấp thị giác.
3. `03_PROGRESSIVE_DISCLOSURE_AND_CONTEXTUAL_UI.md` — Hiển thị theo nhu cầu và ngữ cảnh.
4. `04_COMPONENTS_AND_DESIGN_TOKENS.md` — Component, tokens và tính nhất quán.
5. `05_ACCESSIBILITY_AND_RESPONSIVE_RULES.md` — Accessibility và responsive UX.
6. `06_UX_AUDIT_AND_LINT_RULES.md` — Checklist audit và quy tắc lint.
7. `07_ACCEPTANCE_AND_ROLLOUT.md` — Tiêu chí nghiệm thu, rollout và bảo vệ hồi quy.
8. `08_AGENT_EXECUTION_PROTOCOL.md` — Quy trình thực thi cho AI coding agent.
9. `MASTER_PROMPT_VI.md` — Prompt tổng để giao agent thực hiện công việc.

## Bổ sung định hướng thị giác

Dùng ảnh SePay mà người dùng cung cấp làm tham chiếu về bố cục, phân cấp thị giác và mức độ tập trung vào tác vụ; không sao chép pixel-for-pixel. VDLS bổ sung mẫu bố cục theo loại trang, quy tắc shell/workspace, bề mặt, copywriting và checklist review. Agent phải audit source of truth hiện tại, thí điểm một trang đại diện và xin phê duyệt trước rollout diện rộng.

## Cách dùng

- Đưa ZIP này cho AI coding agent cùng repository SMEOS.
- Dùng `MASTER_PROMPT_VI.md` làm chỉ dẫn thực thi.
- Yêu cầu agent làm theo pha: **Audit → Mapping → Proposal → Approval Gate → Implementation → Validation → Handover**.
- Nếu agent có quyền sửa code, không cho phép triển khai thay đổi diện rộng trước khi hoàn tất audit và trình bày kế hoạch.
- Nếu thiếu quyền, dữ liệu, hoặc có xung đột tiêu chuẩn chưa thể giải quyết, agent phải ghi rõ thay vì tự suy đoán.

## Phân loại quy tắc

- **MUST:** Bắt buộc, trừ khi có ngoại lệ được ghi nhận và phê duyệt.
- **SHOULD:** Nên áp dụng; nếu không áp dụng cần có lý do.
- **MAY:** Tùy chọn theo ngữ cảnh.

## Lưu ý

“MEUX” là tên làm việc đề xuất cho phần mở rộng UX nội bộ, không phải tiêu chuẩn quốc tế hoặc framework bên ngoài đã được chứng nhận. Các quy tắc định lượng trong bộ tài liệu là baseline nội bộ để kiểm chứng và điều chỉnh qua usability testing, không được trình bày như yêu cầu phổ quát của WCAG hay tổ chức tiêu chuẩn khác.

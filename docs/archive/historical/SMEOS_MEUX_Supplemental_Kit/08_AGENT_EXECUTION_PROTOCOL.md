# 08 — AI Coding Agent Execution Protocol

## Phase 0 — Establish context
1. Xác định repository, branch, trạng thái working tree và hướng dẫn dự án.
2. Tìm tài liệu UX/Design System/Accessibility/Frontend architecture/Testing hiện có.
3. Phát hiện framework, component library, token system và lint/test scripts.
4. Không giả định tên file hoặc cấu trúc thư mục trước khi kiểm tra.

## Phase 1 — Audit only
Chưa sửa code hoặc viết đè tài liệu. Xuất báo cáo gồm:
- Inventory tài liệu liên quan.
- Source of truth hiện tại.
- Quy tắc hiện hữu tương ứng với MEUX.
- Khoảng trống, trùng lặp và xung đột.
- Các trang/component đại diện cần audit.
- Rủi ro và tác động dự kiến.

## Phase 2 — Mapping & proposal
Tạo bảng:
- Chủ đề.
- Quy định hiện tại.
- Trạng thái: Keep / Extend / Revise / Consolidate / Missing.
- Đề xuất.
- Tài liệu đích.
- Lý do.
- Ảnh hưởng.
- Cần phê duyệt? (Yes/No).

Phân biệt xung đột thực sự với khác biệt ngữ cảnh. Không xóa quy tắc hiện hành chỉ vì bộ bổ sung có câu chữ khác.

## Phase 3 — Approval gate
Nếu môi trường có người dùng phê duyệt trực tiếp, dừng trước thay đổi diện rộng và trình bày kế hoạch. Nếu được yêu cầu tự thực hiện trong phạm vi đã ủy quyền, chỉ triển khai các thay đổi tài liệu ít rủi ro, có thể đảo ngược; không tự quyết định các xung đột nghiệp vụ hoặc phá vỡ tương thích.

## Phase 4 — Documentation integration
- Tích hợp MEUX vào tài liệu chuẩn hiện hành.
- Chỉnh sửa tài liệu tổng quan/index.
- Cập nhật liên kết và thuật ngữ.
- Ghi quyết định và changelog.
- Giữ một source of truth, tránh tạo bộ tài liệu song song không được liên kết.
- Nếu chưa thể tích hợp an toàn, giữ phần bổ sung riêng và ghi rõ lý do.

## Phase 4B — Visual Design & Layout Standard
- Đọc `09_VISUAL_DESIGN_AND_LAYOUT_STANDARD.md` và `10_VISUAL_REFERENCE_REVIEW_CHECKLIST.md`.
- Đối chiếu với shell, tokens, component library và tiêu chuẩn UX hiện hành; không tạo source of truth song song.
- Ánh xạ các đặc điểm ảnh tham chiếu thành quy tắc có thể tái sử dụng: navigation shell, page header, focused workspace, restrained containers, concise copy và primary action.
- Xác định archetype cho các trang đại diện.
- Ghi rõ điểm nào là quy tắc chung, điểm nào chỉ phù hợp một loại tác vụ.

## Phase 5 — Implementation proposal
Chọn một trang đại diện. Trình bày:
- Vấn đề và bằng chứng.
- Wireframe hoặc cấu trúc đề xuất.
- Component/token được tái sử dụng.
- Các trường được hiển thị/thu gọn và điều kiện.
- Tác động responsive/accessibility.
- Test plan và rollback.

Không tự động sửa hàng loạt mọi trang chỉ từ một ví dụ.

Trước rollout, review pilot bằng checklist trong `10_VISUAL_REFERENCE_REVIEW_CHECKLIST.md`. Không dùng cảm nhận chủ quan hoặc screenshot similarity làm bằng chứng duy nhất.

## Phase 6 — Validation
Chạy các lệnh kiểm tra phù hợp với project scripts:
- Lint.
- Typecheck.
- Unit/component tests.
- Build.
- Accessibility checks.
- E2E/smoke tests nếu có.

Không tuyên bố test đã chạy nếu chưa chạy. Ghi rõ test thất bại, test không có hoặc bị chặn.

## Phase 7 — Handover
Bàn giao:
- Tóm tắt thay đổi.
- Danh sách tài liệu đã sửa/thêm.
- Mapping/decision log.
- Kết quả kiểm thử.
- Vấn đề còn lại.
- Rủi ro và rollback.
- Các bước tiếp theo theo thứ tự ưu tiên.

## Quy tắc an toàn
- Không lộ secrets hoặc dữ liệu khách hàng trong báo cáo.
- Không đổi business logic ngoài phạm vi.
- Không xóa dữ liệu, migration hoặc file hàng loạt.
- Không tự tạo chuẩn mới mâu thuẫn với source of truth.
- Không tuyên bố enterprise-grade hoặc WCAG-compliant chỉ dựa trên review trực quan.

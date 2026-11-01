# SMEOS UX Standard — Progressive Disclosure System
**Phiên bản:** 1.0 (bộ tiêu chuẩn đề xuất)  
**Ngôn ngữ:** Tiếng Việt  
**Đối tượng:** Product owner, UX/UI designer, frontend/backend developer, QA và AI coding agent  
**Phạm vi:** Toàn bộ sản phẩm SMEOS và các tầng/không gian sản phẩm liên quan.

## Mục đích
Thiết lập một hệ thống UX thống nhất để người dùng — đặc biệt là chủ cửa hàng hoa — hoàn thành công việc nhanh, ít phải suy nghĩ về kỹ thuật và không bị quá tải bởi lựa chọn. Progressive Disclosure là nguyên tắc tổ chức thông tin và chức năng theo nhu cầu, không phải lý do để che giấu trạng thái, điều kiện quan trọng hoặc thông tin cần thiết để ra quyết định.

## Tài liệu trong bộ
1. `01-ux-principles.md` — nguyên tắc nền tảng và thuật ngữ.
2. `02-progressive-disclosure.md` — quy tắc phân tầng L1–L4.
3. `03-interaction-patterns.md` — mẫu tương tác chuẩn.
4. `04-component-standards.md` — tiêu chuẩn component và hợp đồng hành vi.
5. `05-mobile-accessibility.md` — mobile, responsive và accessibility.
6. `06-ux-audit-checklist.md` — quy trình audit và mẫu ghi nhận.
7. `07-acceptance-criteria.md` — tiêu chí nghiệm thu và Definition of Done.
8. `08-governance.md` — quản trị tiêu chuẩn, ngoại lệ và phiên bản.
9. `patterns/` — đặc tả chi tiết cho từng pattern.
10. `templates/` — biểu mẫu audit, pilot và báo cáo.
11. `ANTIGRAVITY_MASTER_PROMPT.md` — prompt tổng để giao Antigravity thực hiện theo 5 giai đoạn.

## Quy tắc sử dụng
- Đây là **tiêu chuẩn mục tiêu đề xuất**, không khẳng định SMEOS hiện tại đã tuân thủ.
- Trước khi thay đổi code, agent phải audit repository, xác minh stack, kiến trúc, component hiện có và cách chạy/test.
- Không tự ý thay đổi business logic, API contract, schema, authentication, authorization, thanh toán hoặc dữ liệu thật trong công việc chuẩn hóa UX.
- Không đại tu toàn bộ hệ thống trong một lần. Thực hiện tuần tự theo 5 giai đoạn và có cổng phê duyệt.
- Mọi phát hiện audit phải kèm bằng chứng có thể kiểm tra: đường dẫn file, component/route, ảnh chụp hoặc bước tái hiện, khi khả thi.
- Khi chưa đủ bằng chứng, ghi `Chưa xác minh`; không suy đoán thành sự thật.
- Tất cả tài liệu cần được điều chỉnh theo cấu trúc repository thực tế sau khi agent kiểm tra.

## Quy trình 5 giai đoạn
1. Audit hiện trạng.
2. Ban hành UX Standard cho dự án.
3. Chuẩn hóa component và pattern tái sử dụng.
4. Pilot một luồng đại diện, đo lường và xác minh.
5. Rollout toàn hệ thống, governance và audit định kỳ.

## Nguyên tắc phê duyệt
Mỗi giai đoạn tạo ra báo cáo, danh sách quyết định và đầu ra cụ thể. Chỉ chuyển giai đoạn khi đạt điều kiện Exit Gate trong `08-governance.md` và người dùng/owner phê duyệt, trừ khi owner đã ủy quyền rõ ràng cho agent thực hiện cả quy trình trong phạm vi không rủi ro.

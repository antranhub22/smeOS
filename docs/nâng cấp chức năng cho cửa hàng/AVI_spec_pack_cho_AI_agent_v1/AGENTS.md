# AGENTS.md — Luật làm việc cho AI agent

Tệp này được đọc ở đầu mỗi phiên. Ngắn có chủ đích. Chi tiết nằm ở `docs/spec/`.

## 1. Bản đồ tài liệu (đọc theo thứ tự)
1. `docs/spec/00-overview.md` — bối cảnh, thuật ngữ, bốn tầng, bảng ranh giới.
2. `docs/spec/requirements.md` — mọi yêu cầu có mã `REQ-*` (nguồn sự thật duy nhất của "phải làm gì").
3. `docs/adr/` — quyết định đã chốt (`ADR-0xx`) và quyết định CHƯA chốt (`ADR-D*`).
4. `docs/plan/phase-N.md` — nhiệm vụ của giai đoạn hiện tại.
5. `docs/spec/traceability.md` — bạn phải cập nhật bảng này.

## 2. Luật bất biến (không được vi phạm, không cần hỏi lại)
- R1. Chỉ phụ thuộc xuống tầng dưới: Product → Domain Modules → Platform → Infrastructure. Cấm phụ thuộc ngược tầng và vòng.
- R2. Module chỉ truy cập schema/bảng của chính nó. Module khác dùng API hoặc event.
- R3. Mỗi nghiệp vụ/dữ liệu có đúng một system of record (xem bảng ở `00-overview.md`). Không sao chép logic để "tiện".
- R4. Chain OS không ghi vào bản ghi đơn gốc của Store OS. Chain đề nghị, Store quyết định.
- R5. Định mức chuẩn chỉ nằm ở Industry Pack; Store OS chỉ đọc.
- R6. Mọi sự kiện đồng bộ dùng event envelope trong `docs/spec/contracts/`. Cấm tự chế định dạng.
- R7. Sự kiện ghi qua transactional outbox, cùng giao dịch với dữ liệu nghiệp vụ.
- R8. Dữ liệu lớp L3 (cá nhân/nhạy cảm) KHÔNG đồng bộ mặc định. Không thêm trường vào Connector Profile nếu chưa có phân loại và duyệt.
- R9. Không hard-code secret. Không dùng chung credential giữa instance/khách.
- R10. Không tạo nhánh/fork theo khách hàng. Tùy biến đi qua cấu hình → extension → repo customer-deploy.
- R11. Không tách repo, không đổi sang microservices. Đó là quyết định của con người (REQ-ARCH-010/011).

## 3. Điều agent KHÔNG ĐƯỢC TỰ QUYẾT — phải DỪNG và hỏi
- Bất kỳ mục nào ở `docs/adr/ADR-D*.md` (đang mở: D1–D5).
- Thêm/đổi trường dữ liệu có thể là dữ liệu cá nhân.
- Ngoại lệ so với R1–R11.
- Yêu cầu mâu thuẫn nhau hoặc mơ hồ: ghi vào `docs/plan/questions.md` rồi dừng phần đó, làm phần không bị ảnh hưởng.
Không được "chọn tạm cho chạy" rồi làm tiếp.

## 4. Quy trình mỗi nhiệm vụ
1. Đọc nhiệm vụ trong `docs/plan/phase-N.md`: lấy danh sách REQ, file được phép sửa, lệnh kiểm tra.
2. Chỉ sửa trong phạm vi được phép. Nếu cần ngoài phạm vi, dừng và ghi câu hỏi.
3. Viết hoặc cập nhật test chứng minh từng REQ liên quan TRƯỚC hoặc CÙNG LÚC với code.
4. Chạy lệnh kiểm tra của nhiệm vụ; sửa đến khi xanh. Không tắt, bỏ qua hay làm yếu test để qua.
5. Cập nhật `traceability.md`: nhiệm vụ, bằng chứng (đường dẫn test/file), trạng thái.
6. Báo cáo ngắn: đã làm gì, REQ nào DONE, REQ nào còn, câu hỏi mở.

## 5. Định nghĩa "xong" (Definition of Done)
Một REQ chỉ DONE khi: (a) có bằng chứng chạy được trong `traceability.md`; (b) CI xanh, gồm architecture tests; (c) không đụng vùng cấm của nhiệm vụ. Không được tuyên bố xong chỉ vì code đã viết.

## 6. Lệnh chuẩn
Các lệnh dưới đây là CHỖ GIỮ CHỖ; sẽ được định nghĩa ở giai đoạn 2 (ADR-D2). Trước đó, nhiệm vụ nào cần lệnh thì nhiệm vụ tự nêu lệnh.
- `make test` / `make test-arch` / `make test-contract` / `make lint` / `make sbom`

## 7. Giai đoạn hiện tại
Xem `docs/plan/CURRENT.md`. Mặc định: **Giai đoạn 1 — Kiểm kê (chỉ đọc, không sửa code nghiệp vụ).**

## 8. Phong cách
Tài liệu bằng tiếng Việt; định danh, tên package, tên sự kiện bằng tiếng Anh. Commit nhỏ, mỗi commit nêu mã REQ.

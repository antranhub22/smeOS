# 07 · Tích hợp AI & sinh nội dung

## 1. Cổng AI duy nhất
- Mọi lời gọi AI đi qua **một gateway**: giải năng lực → kiểm chính sách/quyền riêng tư → chọn mô hình → chạy → chấm điểm → ghi sổ (chi phí, mô hình, kết quả). Route/use-case/script **không** gọi SDK nhà cung cấp.
- Gateway thuần (không ORM), nhận phụ thuộc qua wiring; adapter nhà cung cấp chỉ ở `adapters/`.
- **Mức riêng tư suy từ loại dữ liệu đi vào**, không nhận từ client; có sàn riêng tư chặn gửi dữ liệu nhạy cảm cho nhà cung cấp không phù hợp.
- **Lọc giấy phép mô hình** trước khi chọn.
- **Mọi retry/fallback/escalation có giới hạn** (số lần, chi phí).
- Test kiến trúc chặn gọi thẳng nhà cung cấp (`fetch` tới API, đọc API key trong module nghiệp vụ).

## 2. Sinh nội dung cho khách
1. **Prompt có phiên bản, đăng ký ở một registry** (`active`); giữ bản cũ để quay lại bằng một dòng.
2. **Hình dạng đầu ra cố định** (JSON schema); đổi prompt không đổi schema.
3. **Chỉ dùng sự thật đã khai báo**: tên, giá, ảnh, cam kết, ưu đãi lấy từ dữ liệu thật; ghi chú bán hàng đã duyệt được đưa vào prompt.
4. **Bộ kiểm chữ quyết định (deterministic)** sau AI: sáo ngữ, **cam kết không khai báo**, từ cấm theo ngành → gộp vào **một** lần thử lại; còn vi phạm → bỏ câu đó hoặc quay về mẫu.
5. **Mẫu dự phòng** (khi AI lỗi/không đạt) cũng phải qua bộ kiểm chữ — test tất cả biến thể; viết cụ thể, không chọn ngẫu nhiên từ kho sáo ngữ.
6. **Ghi log** `promptId`, `promptVersion`, nguồn (`ai`/`template`), lý do — **không** ghi nội dung hay dữ liệu khách.
7. Dữ liệu người dùng vào prompt dạng JSON string có giới hạn độ dài, đánh dấu là dữ liệu.
8. **AI không tự xuất bản** và không tự đặt ưu đãi/thời hạn.
9. AI lỗi không chặn nghiệp vụ thiết yếu nếu có thể (vd. kiểm ảnh lỗi → cho qua kèm ghi chú), nhưng phải hiện rõ.

## 3. Checklist prompt mới
- [ ] Đăng ký ở registry, có phiên bản
- [ ] Schema đầu ra + normalize
- [ ] Bộ kiểm chữ áp dụng + test
- [ ] Mẫu dự phòng qua bộ kiểm chữ
- [ ] Log phiên bản/nguồn, không log nội dung
- [ ] Đi qua gateway, có capability

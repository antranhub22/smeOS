# 08 · Mở rộng theo ngành (vertical plugin) & tính giá

## 1. Plugin ngành
- Mỗi ngành = **một tệp plugin** theo một hợp đồng (contract) thuần: định danh, thuật ngữ, taxonomy (danh mục, dịp, khoảng giá, preset giá), cấu hình AI (trọng tâm thị giác), quy tắc phí làm thay, hồ sơ tính giá… Thêm ngành **không** đổi schema, không rải `if (ngành === …)`.
- Một registry đăng ký mọi plugin; mã ngành nhận từ người dùng phải tồn tại trong registry.
- Khối ngành chưa hỗ trợ khai `null` → UI ẩn mục đó, không giả lập.
- Một **ngành tham chiếu** được đặc tả đầy đủ trước; ngành khác bổ sung dần.
- **Cấm hardcode thuật ngữ ngành** trong core/domain/UI chung — dùng thuật ngữ từ plugin; ratchet đếm vi phạm (chỉ giảm).
- Kiểm tự động: mỗi tệp ngành đã đăng ký, contract đủ khối, prompt/schema AI của worker theo ngành hợp lệ.

## 2. Tính giá (costing)
1. Cấu hình theo ngành: nhóm nguyên liệu, hao hụt mặc định, mô hình công, chi phí chung, preset kịch bản giá, làm tròn, tính dễ hỏng, adapter BOM.
2. **Không bao giờ đoán giá thiếu**: nguyên liệu chưa có giá → báo thiếu, không điền 0 hay trung bình.
3. Kịch bản giá (vd. ba mức) là gợi ý; **áp giá thật cần xác nhận + audit**.
4. Nhu cầu mua gộp từ đơn/công thức; phát hiện thay đổi giá nguyên liệu → cảnh báo.
5. Nhập nguyên liệu từ bảng tính (dán từ Excel) có kiểm từng dòng, lịch sử giá.
6. Domain tính giá thuần, test đủ.

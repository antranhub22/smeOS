# 01 · Quản trị phân tầng cho SaaS nhiều cấp

Áp dụng khi một nền tảng phục vụ nhiều cấp khách hàng lồng nhau, ví dụ: nền tảng → ngành/vertical → chuỗi → cửa hàng/chi nhánh.

## 1. Mô hình

| Tầng | Vai trò | Ví dụ quyết định |
|---|---|---|
| **Nền tảng (Mother)** | Luật toàn sàn, trần cứng, bật/tắt module/kênh | Trần chiết khấu 50%, bắt buộc ảnh QC |
| **Ngành (Vertical)** | Mặc định & thuật ngữ theo ngành — thường là **cấu hình code (plugin)**, không phải một tổ chức | Tên vai trò thợ, đơn vị, preset giá |
| **Chuỗi (Chain)** | Cấu hình chung cho chi nhánh/đối tác thuộc chuỗi | Khoá công cụ, chính sách chung |
| **Cửa hàng (Store)** | Vận hành thực tế; chỉ ghi đè trong phạm vi được phép | Bật/tắt ưu đãi của riêng tiệm |

## 2. Năm quy tắc bất biến

1. **Kế thừa, không nhân bản.** Tầng dưới chỉ lưu phần **ghi đè (delta)**. Không có ghi đè → dùng tầng trên gần nhất → mặc định hệ thống. "Khôi phục mặc định" = xoá ghi đè.
2. **Khoá tầng trên thắng tuyệt đối.** Khoá (`lock`) ở tầng trên cố định giá trị cho mọi tầng dưới; tầng trên cùng có khoá thắng. Luật bất biến của nền tảng là **khoá dựng sẵn trong code**, đứng trước mọi khoá đã lưu — kể cả quyết định nền tảng đã lưu cũng không mở được.
3. **Kiểm tra ở server khi ghi.** API lưu quyết định phải từ chối (422 kèm danh sách vi phạm) khi tầng dưới ghi đè mục bị khoá hoặc khoá mục không được phép khoá ở cấp đó. Ẩn trên UI không phải là cưỡng chế.
4. **Một nơi xác định tầng.** Hàm duy nhất `tierOf(tổ chức, vai trò)` dùng cho điều hướng, ma trận quản trị, thông báo, trang chủ. Kiểu `Tier` khai báo **một lần**.
5. **Một động cơ phân giải.** Mỗi hệ thống quản trị (ưu đãi, chính sách, thông báo…) dùng chung một hàm thuần `effectiveDecision(key, mặc định, của mình, tầng, các tầng trên)`. Không viết resolver riêng cho từng hệ thống.

## 3. Ba trục độc lập — không trộn

| Trục | Trả lời | Nơi kiểm |
|---|---|---|
| **Phân quyền (RBAC)** | Người này được làm việc này không? | Mã năng lực (capability), không theo tên vai trò UI |
| **Gói dịch vụ (Entitlement)** | Tổ chức đã trả tiền cho tính năng này không? | Bảng gói → tính năng |
| **Quản trị phân tầng (Governance)** | Tầng trên có cho phép/ép giá trị này không? | Động cơ phân giải ở §2 |

Khoá công cụ của chuỗi cho chi nhánh là **entitlement theo tầng**: phải chặn cả trang lẫn API của công cụ đó ở server; API dùng chung giữa nhiều công cụ không khoá theo một công cụ.

## 4. Cấu trúc code

- `domain/`: danh mục mục quản trị, động cơ phân giải, khoá dựng sẵn, kiểm vi phạm — **thuần, không ORM**.
- `infra/`: đọc quyết định từng tầng (tối đa vài truy vấn; gom nhiều hệ thống trong một lần cho luồng công khai).
- `use-cases/`: xác định tầng từ phiên, kiểm vi phạm, ghi + **audit log** (trước/sau).
- UI: một hook/màn ma trận dùng chung, nhận `tier`; hiển thị "bị khoá bởi <tầng>" và lý do.
- Luồng công khai (trang khách): lỗi đọc tầng trên → vẫn áp luật dựng sẵn, không làm hỏng trang.

## 5. Xem trước tầng (cho người vận hành)

Chỉ đổi **khuôn trải nghiệm** (điều hướng, trang chủ); không đổi tổ chức, quyền hay dữ liệu. Mọi API vẫn dùng phiên thật. Yêu cầu một capability nền tảng riêng.

## 6. Checklist khi thêm một hệ thống được quản trị

- [ ] Thêm vào danh mục hệ thống + key hợp lệ (regex, giới hạn số key)
- [ ] Khoá dựng sẵn của nền tảng (nếu có) khai báo trong code
- [ ] Dùng động cơ phân giải chung, không viết mới
- [ ] API ghi kiểm vi phạm ở server + audit log
- [ ] Luồng đọc thật **áp** quyết định (không chỉ lưu); chưa áp thì UI ghi rõ "đã lưu, chưa áp dụng"
- [ ] Test: khoá tầng trên thắng ghi đè; tầng dưới không mở được khoá; khoá dựng sẵn không mở được; cách ly tenant

## 7. Lỗi thường gặp

- Hai động cơ phân giải song song → một cái chết, tài liệu trỏ nhầm cái chết.
- Kiểu `Tier` và hàm xác định tầng nhân bản → các màn xếp cùng tổ chức vào tầng khác nhau.
- Tầng trong tài liệu (vd. "Ngành") không có quan hệ dữ liệu thật → kế thừa ghi trên giấy nhưng không chạy.
- Khoá chỉ ẩn menu, gõ URL vẫn vào được.

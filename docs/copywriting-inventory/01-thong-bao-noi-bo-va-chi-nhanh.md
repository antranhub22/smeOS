# Kiểm kê nội dung — Tin nhắn nội bộ & tin gửi chi nhánh/cửa hàng

> Phạm vi: tin nhắn **nội bộ gửi nhân viên** (Điều hành / Sale / Điều phối) và tin gửi
> **chi nhánh/cửa hàng trong chuỗi** (gia công, giao hàng, shipper). Không gồm tin gửi khách.
> Theo SOP 4 bước của skill `copywriting-governance`. Bước này chỉ kiểm kê và đề xuất câu chữ —
> **chưa sửa code**, chờ Chủ sản phẩm (PO) duyệt nội dung "CHUẨN HÓA (Mới)" trước khi triển khai.

*Quy ước mã Loại*: `TTL` (Tiêu đề thông báo), `BOD` (Nội dung thông báo), `BTN` (Nút hành động), `CRD` (Thẻ việc trong hộp việc).

---

## Phát hiện chính (vi phạm & trùng lặp)

1. **Không có một bộ mẫu chung** — nội dung tin nằm rải ở ≥ 20 file khác nhau (`staff-notification-matrix.ts`, `industry-notification-formatter.ts`, `chain-dispatch-policy.ts`, và trực tiếp trong > 10 use-case). Mỗi nơi tự viết câu, không gọi về một nguồn.
2. **Một ý — nhiều cách viết khác nhau.** Ví dụ "tiếp nhận đơn" được viết: *"Đơn đã được tiếp nhận!"*, *"Đã tiếp nhận đơn hàng"*, *"Bếp tiếp nhận đơn và bắt đầu chế biến"*, *"Tiếp nhận thành công"* — không theo một cấu trúc câu chung.
3. **Vi phạm R12 (cấm jargon kỹ thuật) ngay trong nội dung gửi cửa hàng:** mẫu `prepReminder` trong `chain-dispatch-policy.ts:109` viết *"chuẩn bị hoa và nguyên vật liệu theo định lượng **BOM**"* — nhân viên chi nhánh không biết BOM là gì.
4. **Mã kỹ thuật lộ ra tiêu đề** (vi phạm R8), lặp ở hầu hết tin nhắc/báo động:
   `[NHẮC LẦN 2 - KHẨN CẤP #1234]`, `[CẢNH BÁO ĐỎ - THIẾU SHIPPER #1234]`, `[BÁO ĐỘNG ĐIỀU PHỐI #1234]`, `[Chưa nhận] ...` — ký hiệu ngoặc vuông + viết hoa toàn bộ là quy ước lập trình, không phải câu tiếng Việt tự nhiên.
5. **Cùng một mức báo động (khẩn cấp lần 2 / báo đỏ) nhưng mỗi luồng gọi tên khác nhau**: "NHẮC LẦN 2 - KHẨN CẤP", "NHẮC LẦN 2 - GIAO HÀNG KHẨN", "NHẮC LẦN 2 - KHẨN", "CẢNH BÁO ĐỎ", "CẢNH BÁO NGUY CƠ TRỄ HẠN", "BÁO ĐỘNG ĐIỀU PHỐI" — 6 tên gọi cho đúng 2 cấp độ (nhắc lần 2, và báo động cho Điều phối).
6. **ALL CAPS tràn lan trong nút bấm và câu nhắc** (`NHẬP THÔNG TIN SHIPPER NGAY (LẦN 2)`, `TẢI ẢNH THÀNH PHẨM NGAY (LẦN 2)`, `CHƯA CÓ THÔNG TIN SHIPPER!`) — vi phạm quy tắc Sentence case.
7. **Emoji dùng không nhất quán** — có tin gắn 1 emoji, có tin gắn 2–3 emoji + dấu `!` liên tiếp; không theo quy tắc nào.
8. **Tên gọi vai trò lệch nhau khi nói với chi nhánh**: có nơi gọi "Chi nhánh", có nơi gọi "Cửa hàng", có nơi gọi "Điểm Điều phối" cho cùng một đối tượng.

**Đề xuất chuẩn hệ thống** (áp dụng xuyên suốt các dòng CHUẨN HÓA dưới đây):
- Cấu trúc câu cố định: **`[1 emoji trạng thái] <Việc cần làm>: <bối cảnh đơn>`** — không dùng ngoặc vuông chứa mã kỹ thuật, không ALL CAPS.
- 3 cấp độ nhắc, đặt tên **giống nhau mọi luồng**: *(không tiền tố)* → **"Nhắc lần 2"** → **"Khẩn cấp"**.
- Luôn gọi là **"Chi nhánh"** khi nói trong hệ thống chuỗi (vì đang nói với/về chi nhánh); gọi là **"Cửa hàng"** chỉ khi ngữ cảnh là 1 cửa hàng đơn lẻ không thuộc chuỗi.
- Mỗi tin tối đa 1 emoji mở đầu, không chấm cảm nhiều dấu liên tiếp.

---

## A. Tin điều phối chi nhánh gia công (nguồn: `domain/chain-dispatch-policy.ts`)

Đây là bộ gần nhất với "mẫu chuẩn" hiện có — đã tách khỏi use-case, có biến nội suy `{{orderCode}}`. Cần sửa câu chữ tại đây, không phải ở từng use-case.

| Mã Copy | Loại | Vị trí | Nội dung HIỆN TẠI | Nội dung CHUẨN HÓA (Mới) | Ghi chú |
|---|---|---|---|---|---|
| `DISP-BOD-01` | `BOD` | `inviteSubcontract` | `🌸 [ĐƠN GIA CÔNG MỚI] Đơn hàng #{{orderCode}}\n📍 Giao tại: {{deliveryAddress}}\n⏰ Thời gian giao: {{deliveryTime}}\n💰 Thù lao gia công: {{subcontractPriceVnd}}\n⏳ Hạn nhận đơn: {{timeoutMinutes}} phút` | `🌸 Có đơn gia công mới #{{orderCode}}\nGiao tại: {{deliveryAddress}}\nThời gian giao: {{deliveryTime}}\nThù lao: {{subcontractPriceVnd}}\nVui lòng nhận đơn trong {{timeoutMinutes}} phút.` | Bỏ `[ĐƠN GIA CÔNG MỚI]`, giữ 1 emoji mở đầu |
| `DISP-BOD-02` | `BOD` | `claimSuccess` | `✅ [TIẾP NHẬN THÀNH CÔNG] Chi nhánh {{branchName}} đã nhận đơn #{{orderCode}}. ⏳ Bạn có {{graceMinutes}} phút để kiểm tra kho và xác nhận lần cuối nếu thiếu nguyên liệu.` | `✅ Chi nhánh {{branchName}} đã nhận đơn #{{orderCode}}. Vui lòng kiểm tra kho trong {{graceMinutes}} phút và báo ngay nếu thiếu nguyên liệu.` | |
| `DISP-BOD-03` | `BOD` | `prepReminder` | `🔔 [BẮT ĐẦU CHẾ TÁC] Đơn #{{orderCode}} đã chính thức chốt. Vui lòng chuẩn bị hoa và nguyên vật liệu theo định lượng **BOM**.` | `🔔 Đơn #{{orderCode}} đã chốt, bắt đầu chế tác. Vui lòng chuẩn bị hoa và nguyên vật liệu theo công thức sản phẩm.` | **Xóa jargon "BOM" (vi phạm R12)** → đổi thành "công thức sản phẩm" |
| `DISP-BOD-04` | `BOD` | `qcReminder` | `📸 [NHẮC CHỤP ẢNH QC] Đơn #{{orderCode}} cần giao lúc {{deliveryTime}}. Vui lòng hoàn tất cắm hoa và chụp ảnh gửi khách trước {{qcTime}}.` | `📸 Đơn #{{orderCode}} cần giao lúc {{deliveryTime}}. Vui lòng hoàn tất và chụp ảnh thành phẩm trước {{qcTime}}.` | Đổi "QC" (jargon) → "ảnh thành phẩm" |
| `DISP-BOD-05` | `BOD` | `qcReminderSecond` | `⚠️ [NHẮC LẦN 2 - KHẨN CẤP] Đơn #{{orderCode}} sắp đến giờ giao nhưng hệ thống chưa nhận được ảnh chụp thành phẩm! Yêu cầu cửa hàng chụp và tải ảnh ngay.` | `⚠️ Nhắc lần 2: Đơn #{{orderCode}} sắp đến giờ giao mà chưa có ảnh thành phẩm. Chi nhánh chụp và tải ảnh ngay.` | Áp khung "Nhắc lần 2" thống nhất |
| `DISP-BOD-06` | `BOD` | `qcEscalationAlert` | `🚨 [CẢNH BÁO NGUY CƠ TRỄ HẠN] Đơn #{{orderCode}} tại {{branchName}} đã nhắc 2 lần nhưng CHƯA CÓ ẢNH THÀNH PHẨM! Điều phối vui lòng can thiệp gấp. Hotline: {{branchPhone}}` | `🚨 Khẩn cấp: Đơn #{{orderCode}} tại {{branchName}} đã nhắc 2 lần vẫn chưa có ảnh thành phẩm. Điều phối can thiệp ngay — gọi {{branchPhone}}.` | Bỏ ALL CAPS, áp khung "Khẩn cấp" |
| `DISP-BOD-07` | `BOD` | `dispatchReminder` | `🛵 [BÀN GIAO SHIPPER] Đơn #{{orderCode}} sắp đến giờ giao. Vui lòng đóng gói và bàn giao cho shipper.` | `🛵 Đơn #{{orderCode}} sắp đến giờ giao. Vui lòng đóng gói và bàn giao cho shipper.` | |
| `DISP-BOD-08` | `BOD` | `shipperReminder` | `🛵 [YÊU CẦU SHIPPER] Đơn #{{orderCode}} cần giao lúc {{deliveryTime}}. Vui lòng cung cấp Họ tên & SĐT Shipper...: {{claimUrl}}` | `🛵 Đơn #{{orderCode}} cần giao lúc {{deliveryTime}}. Vui lòng nhập họ tên và số điện thoại shipper: {{claimUrl}}` | Dùng "và" thay `&` |
| `DISP-BOD-09` | `BOD` | `shipperReminderSecond` | `⚠️ [NHẮC LẦN 2 - KHẨN] ...CHƯA CÓ THÔNG TIN SHIPPER! Chi nhánh vui lòng nhập ngay: {{claimUrl}}` | `⚠️ Nhắc lần 2: Đơn #{{orderCode}} còn {{minutesUntilDelivery}} phút là đến giờ giao mà chưa có thông tin shipper. Nhập ngay: {{claimUrl}}` | |
| `DISP-BOD-10` | `BOD` | `shipperEscalationAlert` | `🚨 [CẢNH BÁO ĐỎ - THIẾU SHIPPER] ...CHƯA CUNG CẤP SHIPPER! ...Điều phối gọi ngay: {{branchPhone}}` | `🚨 Khẩn cấp: Đơn #{{orderCode}} tại {{branchName}} đã nhắc 2 lần vẫn chưa có shipper, còn {{minutesUntilDelivery}} phút đến giờ giao. Điều phối gọi ngay {{branchPhone}}.` | |
| `DISP-BOD-11` | `BOD` | `deliveryReminder` | `⏰ [NHẮC BÀN GIAO & POD] Đơn #{{orderCode}} đã đến giờ giao ({{deliveryTime}}). Chi nhánh {{branchName}} vui lòng tải ảnh xác nhận giao hàng (POD)...: {{claimUrl}}` | `⏰ Đơn #{{orderCode}} đã đến giờ giao ({{deliveryTime}}). Chi nhánh {{branchName}} vui lòng tải ảnh xác nhận đã giao: {{claimUrl}}` | "POD" (jargon) → "ảnh xác nhận đã giao" |
| `DISP-BOD-12` | `BOD` | `deliveryReminderSecond` | `⚠️ [NHẮC LẦN 2 - GIAO HÀNG KHẨN] ...quá giờ giao {{overdueMinutes}} phút nhưng chưa có ảnh xác nhận giao hàng! ...: {{claimUrl}}` | `⚠️ Nhắc lần 2: Đơn #{{orderCode}} đã quá giờ giao {{overdueMinutes}} phút mà chưa có ảnh xác nhận đã giao. Cập nhật ngay: {{claimUrl}}` | |
| `DISP-BOD-13` | `BOD` | `deliveryEscalationAlert` | `🚨 [CẢNH BÁO ĐỎ - CHƯA GIAO HÀNG] ...đã quá hạn giao nhưng chưa có ảnh xác nhận! Điều phối gọi can thiệp gấp: {{branchPhone}}` | `🚨 Khẩn cấp: Đơn #{{orderCode}} tại {{branchName}} đã quá hạn giao mà chưa có ảnh xác nhận. Điều phối gọi ngay {{branchPhone}}.` | |
| `DISP-BOD-14` | `BOD` | `overdueAlert` | `⚠️ [CẢNH BÁO TRỄ HẠN] Đơn #{{orderCode}} đã quá hạn {{overdueMinutes}} phút mà chưa hoàn tất! Điều phối chuỗi đang theo dõi.` | `⚠️ Đơn #{{orderCode}} đã quá hạn {{overdueMinutes}} phút mà chưa hoàn tất. Điều phối chuỗi đang theo dõi.` | |

## B. Tiêu đề tin kèm theo (nguồn: trực tiếp trong các use-case `dispatch-*.ts`, `process-dispatch-reminders.ts`)

Các tiêu đề này **tự viết lại, không gọi về bảng A** — đây là chỗ gây trùng lặp chính. Đề xuất: xóa toàn bộ tiêu đề viết tay này, dùng dòng đầu của nội dung ở bảng A làm tiêu đề (bớt một nguồn nội dung trùng).

| Mã Copy | Loại | Vị trí (file:line) | Nội dung HIỆN TẠI | Nội dung CHUẨN HÓA (Mới) | Ghi chú |
|---|---|---|---|---|---|
| `DISP-TTL-01` | `TTL` | `dispatch-delivery-reminders.ts:72` | `📸 [NHẮC BÀN GIAO & POD #1234]` | `📸 Nhắc bàn giao — Đơn #1234` | |
| `DISP-TTL-02` | `TTL` | `dispatch-delivery-reminders.ts:108` | `⚠️ [NHẮC LẦN 2 - GIAO HÀNG KHẨN #1234]` | `⚠️ Nhắc lần 2 — Đơn #1234` | |
| `DISP-TTL-03` | `TTL` | `dispatch-delivery-reminders.ts:146` | `🚨 [CẢNH BÁO ĐỎ - CHƯA GIAO HÀNG #1234]` | `🚨 Khẩn cấp — Đơn #1234` | |
| `DISP-TTL-04` | `TTL` | `dispatch-shipper-reminders.ts:72` | `🛵 [YÊU CẦU SHIPPER #1234]` | `🛵 Cần thông tin shipper — Đơn #1234` | |
| `DISP-TTL-05` | `TTL` | `dispatch-shipper-reminders.ts:108` | `⚠️ [NHẮC LẦN 2 - KHẨN CẤP #1234]` | `⚠️ Nhắc lần 2 — Đơn #1234` | trùng y nguyên với `DISP-TTL-02` ở luồng khác |
| `DISP-TTL-06` | `TTL` | `dispatch-shipper-reminders.ts:162` | `🚨 [CẢNH BÁO ĐỎ - THIẾU SHIPPER #1234]` | `🚨 Khẩn cấp — Đơn #1234` | trùng y nguyên với `DISP-TTL-03` |
| `DISP-TTL-07` | `TTL` | `process-dispatch-reminders.ts:130` | `🔔 [BẮT ĐẦU CHẾ TÁC #1234]` | `🔔 Bắt đầu chế tác — Đơn #1234` | |
| `DISP-TTL-08` | `TTL` | `process-dispatch-reminders.ts:169` | `📸 [NHẮC CHỤP ẢNH THÀNH PHẨM #1234]` | `📸 Nhắc chụp ảnh thành phẩm — Đơn #1234` | |
| `DISP-TTL-09` | `TTL` | `process-dispatch-reminders.ts:210` | `⚠️ [NHẮC LẦN 2 - KHẨN CẤP #1234]` | `⚠️ Nhắc lần 2 — Đơn #1234` | trùng `DISP-TTL-02/05` |
| `DISP-TTL-10` | `TTL` | `process-dispatch-reminders.ts:268` | `🚨 [BÁO ĐỘNG ĐIỀU PHỐI #1234]` | `🚨 Khẩn cấp — Đơn #1234` | gộp về cùng tên "Khẩn cấp" với `DISP-TTL-03/06` |
| `DISP-TTL-11` | `TTL` | `process-dispatch-reminders.ts:331` | `⚠️ [CẢNH BÁO TRỄ HẠN #1234]` | `⚠️ Quá hạn xử lý — Đơn #1234` | |
| `DISP-TTL-12` | `TTL` | `advance-dispatch-round.ts:84` | `🚨 [CHƯA CÓ CHI NHÁNH NHẬN #1234]` | `🚨 Chưa có chi nhánh nhận đơn #1234` | |
| `DISP-TTL-13` | `TTL` | `handle-subcontract-claim.ts:110` | `🔔 [BẮT ĐẦU CHẾ TÁC #1234]` | `🔔 Bắt đầu chế tác — Đơn #1234` | trùng y nguyên `DISP-TTL-07` ở luồng khác |
| `DISP-TTL-14` | `TTL` | `notify-shipper-request.ts:46` | `📦 [SHIPPER] Đơn hàng #1234 cần thông tin giao hàng` | `📦 Cần thông tin shipper — Đơn #1234` | gộp về cùng câu với `DISP-TTL-04` (hiện 2 luồng gọi 2 câu khác nhau cho cùng việc) |

## C. Nút hành động (BTN)

| Mã Copy | Vị trí | Nội dung HIỆN TẠI | Nội dung CHUẨN HÓA (Mới) | Ghi chú |
|---|---|---|---|---|
| `DISP-BTN-01` | `dispatch-delivery-reminders.ts:73` | `📸 Tải Ảnh Giao Hàng (POD)` | `Tải ảnh đã giao` | Bỏ Title Case + "POD" |
| `DISP-BTN-02` | `dispatch-delivery-reminders.ts:109` | `📸 Tải Ảnh Giao Hàng Ngay` | `Tải ảnh ngay` | |
| `DISP-BTN-03` | `dispatch-delivery-reminders.ts:148` | `📞 Gọi Cửa Hàng Ngay` | `Gọi chi nhánh` | |
| `DISP-BTN-04` | `dispatch-delivery-reminders.ts:149` | `👁️ Xem Thẻ Đơn` | `Xem đơn hàng` | |
| `DISP-BTN-05` | `dispatch-shipper-reminders.ts:73` | `🛵 Nhập Thông Tin Shipper` | `Nhập thông tin shipper` | |
| `DISP-BTN-06` | `dispatch-shipper-reminders.ts:109` | `🚨 NHẬP THÔNG TIN SHIPPER NGAY (LẦN 2)` | `Nhập thông tin shipper ngay` | Bỏ ALL CAPS + "(LẦN 2)" dư (đã có trong tiêu đề) |
| `DISP-BTN-07` | `process-dispatch-reminders.ts:211` | `🚨 TẢI ẢNH THÀNH PHẨM NGAY (LẦN 2)` | `Tải ảnh thành phẩm ngay` | |
| `DISP-BTN-08` | `process-dispatch-reminders.ts:131` | `📋 Xem Thẻ Gia Công` | `Xem thẻ gia công` | |

## D. Tin nội bộ theo vai trò (nguồn: `domain/industry-notification-formatter.ts`, `domain/staff-notification-matrix.ts`)

Cụm "Có đơn mới / Đã tiếp nhận / Thanh toán" lặp lại theo từng ngành với cấu trúc khác nhau. Đề xuất 1 khung câu chung, chỉ thay danh từ ngành.

| Mã Copy | Vị trí | Nội dung HIỆN TẠI | Nội dung CHUẨN HÓA (Mới) | Ghi chú |
|---|---|---|---|---|
| `STF-TTL-01` | `industry-notification-formatter.ts:163` (mặc định) | `{code} Có đơn hàng mới!` | `{code} · Có đơn hàng mới` | Bỏ dấu `!` cố định cho mọi tiêu đề (chỉ giữ cho mức khẩn cấp thật) |
| `STF-TTL-02` | ...`:168` | `✅ {code} Đơn hàng đã được tiếp nhận!` | `✅ {code} · Đơn hàng đã được tiếp nhận` | |
| `STF-TTL-03` | `:30` (lưu trú) | `🏡 {code} Có lượt đặt phòng lưu trú mới!` | `🏡 {code} · Có lượt đặt phòng mới` | Áp khung chung `{emoji} {code} · <việc>` |
| `STF-TTL-04` | `:91` (bếp) | `🍲 {code} Có đơn gọi món mới!` | `🍲 {code} · Có đơn gọi món mới` | |
| `STF-TTL-05` | `:122` (may đo) | `👗 {code} Có đơn may đo / mua sắm mới!` | `👗 {code} · Có đơn may đo mới` | |
| `STF-TTL-06` | `:143` (dịch vụ) | `💆 {code} Có lịch hẹn dịch vụ mới!` | `💆 {code} · Có lịch hẹn mới` | |
| `STF-TTL-07` | `staff-notification-matrix.ts:249` | `[Chưa nhận] {title}` | `{title} (chưa có người phụ trách)` | Bỏ ngoặc vuông kiểu mã, chuyển thành chú thích cuối câu |

## E. Thẻ việc trong hộp việc (nguồn: `domain/inbox.ts`)

Các thẻ việc cũng là một dạng "tin nhắn ngắn" nhân viên nhìn thấy mỗi ngày — có cùng vấn đề câu chữ không đồng bộ động từ mở đầu (có thẻ bắt đầu bằng danh từ, có thẻ bắt đầu bằng động từ).

| Mã Copy | Vị trí | Nội dung HIỆN TẠI | Nội dung CHUẨN HÓA (Mới) | Ghi chú |
|---|---|---|---|---|
| `CRD-01` | `inbox.ts:163` | `Tiếp nhận đơn mới chưa có Sale phụ trách` | `Tiếp nhận đơn mới chưa có người phụ trách` | |
| `CRD-02` | `inbox.ts:184` | `Nhắc khách xác nhận hoa & thanh toán lần 2` | `Nhắc khách xác nhận hoa và thanh toán lần 2` | "và" thay `&` |
| `CRD-03` | `inbox.ts:214` | `Nhắc khách thanh toán tiền cọc` | *(giữ nguyên — đã chuẩn)* | |
| `CRD-04` | `inbox.ts:276` | `Kiểm tra chất lượng (QC) & Chụp ảnh thành phẩm` | `Kiểm tra chất lượng và chụp ảnh thành phẩm` | Bỏ "(QC)" + `&` |
| `CRD-05` | `inbox.ts:308` | `Sẵn sàng giao — Điều phối tài xế / Shipper` | `Sẵn sàng giao — Điều phối tài xế hoặc shipper` | |

## F. Thẻ gia công / mốc xử lý (nguồn: `coordinator/domain/dispatch-reminder-evaluator.ts`)

Các tiêu đề này đã khá chuẩn (không có mã kỹ thuật, câu tự nhiên) — **giữ nguyên**, dùng làm mẫu tham chiếu phong cách cho các cụm A–E phía trên:
`"Xác nhận & In Thẻ gia công"`, `"Xác nhận bắt đầu sản xuất"`, `"Hoàn thành sản phẩm & Book ship"`, `"Xác nhận shipper lấy hàng"`, `"Dặn shipper chụp ảnh giao hàng"`, `"Chăm sóc sau giao (Follow-up)"`.
Riêng 2 chỗ còn dùng `&` nên đổi "và": *"Xác nhận và in thẻ gia công"*, *"Hoàn thành sản phẩm và đặt lịch ship"* (bỏ "Book ship" — thuật ngữ tiếng Anh).

---

## Bước tiếp theo (sau khi PO duyệt câu chữ)

1. Tạo 1 nguồn mẫu chung (ví dụ `domain/message-catalog/` hoặc gộp vào `chain-dispatch-policy.ts` hiện có) chứa **toàn bộ** tiêu đề + nội dung ở trên dưới dạng hằng số có biến nội suy.
2. Sửa từng use-case (`dispatch-*.ts`, `process-dispatch-reminders.ts`, `advance-dispatch-round.ts`, `handle-subcontract-claim.ts`, `notify-shipper-request.ts`) để gọi về nguồn mẫu, xóa chuỗi viết tay.
3. Thêm test chống trùng lặp/jargon: so khớp các hằng số template qua `TECHNICAL_JARGON_PATTERNS` và kiểm tra không còn `[` `]` kiểu mã hoặc ALL CAPS trong nội dung gửi đi.
4. Chạy `npm run lint:ux -- --check`, `npm test`, `npm run typecheck` theo Cổng 1–3 trước khi bàn giao.

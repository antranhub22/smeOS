# 10 · Mở rộng ngang & độ tin cậy

Mục tiêu: chạy **N instance** web và worker mà kết quả giống hệt 1 instance; chịu được cao điểm.

## 1. Không trạng thái trong tiến trình (stateless)
- Trạng thái dùng chung giữa request **không** để trong bộ nhớ tiến trình: rate limit, phiên, hub đẩy thời gian thực, khoá, bộ đếm, cache cấu hình.
- Cho phép trong bộ nhớ: cache **chỉ đọc**, có TTL ngắn, sai lệch giữa instance không gây sai nghiệp vụ (ghi chú rõ ở chỗ khai báo).
- Hub thời gian thực (SSE/WebSocket) dùng **pub/sub** (Redis) để instance nào giữ kết nối cũng nhận được sự kiện.
- Thành phần dùng cache ngoài phải có **đường lui an toàn** khi cache sập (vd. rate limit về bộ nhớ + log cảnh báo), không làm sập request.

## 2. Hàng đợi & job
1. Lấy job bằng `FOR UPDATE SKIP LOCKED`; đánh thức bằng `NOTIFY` **trong cùng transaction** tạo job.
2. Mỗi job: `attempts` + **trần lần thử**, chờ tăng dần (backoff + jitter), trạng thái cuối `failed` có lý do → **dead-letter** xem lại được.
3. **Idempotency**: khoá idempotent khi tạo job/thanh toán/webhook; worker chịu được chạy lại.
4. Job treo (quá thời gian, mất heartbeat) được thu hồi và thử lại.
5. Việc nặng (AI, media) không chạy trong request web.

## 3. Cơ sở dữ liệu
- Truy vấn theo tenant luôn có index `(organization_id, …)`; tránh N+1 — gom truy vấn (vd. đọc nhiều hệ thống cấu hình trong 1–2 truy vấn).
- Giới hạn pool kết nối theo số instance; dùng pooler khi nhiều instance.
- Phân trang bằng con trỏ cho danh sách lớn.
- Migration **mở rộng → chuyển → thu gọn** (expand/contract) để triển khai không gián đoạn.

## 4. Cache
- Cache cấu hình đọc nhiều (quản trị phân tầng, plugin, quyền) theo khoá `tenant:hệ thống:phiên bản`; **xoá khi ghi**.
- Không cache dữ liệu cá nhân ở cache dùng chung không mã hoá.

## 5. Chống quá tải
- Rate limit ở cổng vào (theo IP và theo tenant), circuit breaker cho nhà cung cấp ngoài, timeout cho mọi lời gọi ra ngoài, giới hạn đồng thời cho AI/media theo tenant.
- Hạ cấp nhẹ nhàng: tính năng phụ (gợi ý, thống kê) tắt được khi quá tải mà không hỏng luồng chính.

## 6. Kiểm chứng
- **Kiểm tải** trên staging trước mùa cao điểm: kịch bản hành trình chính, mục tiêu = số đơn/giờ cao điểm × hệ số an toàn.
- Chạy thử **2 instance** trong staging: thông báo thời gian thực, rate limit, job không trùng.
- Test: job chạy lại không nhân đôi kết quả; khoá idempotent.

## 7. Checklist
- [ ] Không còn trạng thái dùng chung trong bộ nhớ (trừ cache chỉ đọc đã ghi chú)
- [ ] SSE qua pub/sub
- [ ] Job: trần thử, backoff, dead-letter, thu hồi job treo
- [ ] Pool DB theo instance
- [ ] Kiểm tải + chạy 2 instance trên staging

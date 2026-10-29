# 11 — Decisions (PO đã duyệt 2026-10-29)

Căn cứ chung: ISO/IEC 27001:2022 Annex A, SOC 2 (Security/Availability/Confidentiality), NIST SP 800-34, OWASP ASVS, NĐ 13/2023/NĐ-CP, Luật Bảo vệ dữ liệu cá nhân 2025, Luật Kế toán 2015.
Các mốc liên quan đến luật **cần luật sư xác nhận trước khi đưa vào hợp đồng/DPA**. Không có quyết định nào ở đây tương đương với chứng nhận.

| ID | Quyết định | Trạng thái |
|---|---|---|
| D-01/02 | **Postgres:** RPO ≤ 15 phút (PITR, workspace Render giữ 7 ngày) + bản xuất DB hằng ngày lưu ngoài Render 30 ngày. **R2:** RPO ≤ 24 giờ. **RTO:** ≤ 4 giờ toàn dịch vụ (DB ≤ 2 giờ, kho ≤ 8 giờ). Diễn tập mỗi quý có biên bản; chưa diễn tập thì không ghi RTO vào hợp đồng. (ISO A.5.30, A.8.13; SOC 2 A1.2–A1.3) | Duyệt |
| D-03 | Retention: đơn/thanh toán/hoá đơn giữ suốt hợp đồng, xuất trả khi chấm dứt (nghĩa vụ 10 năm theo Luật Kế toán thuộc về tiệm); PII CRM xoá ≤ 30 ngày khi có yêu cầu/chấm dứt; ảnh/video theo vòng đời sản phẩm + thùng rác 30 ngày; bảng tính nhập 30 ngày; tệp tạm worker 7 ngày; audit log ≥ 12 tháng (mục tiêu 24); log ứng dụng 30–90 ngày; backup 30 ngày cuộn (dữ liệu đã xoá rời backup ≤ 35 ngày, ghi trong DPA); tenant rời đi: 30 ngày để xuất → xoá hết → cấp biên bản xác nhận xoá. (ISO A.8.10, A.8.15) | Duyệt |
| D-04 | Legal hold ở cấp tenant và asset; chặn mọi lệnh xoá kể cả tự động; chỉ Platform Ops có capability riêng được đặt hoặc gỡ, kèm lý do, ngày rà soát và audit log; chủ tiệm chỉ được yêu cầu | Duyệt |
| D-05 | Cấm ghi không xác thực (**đã làm, P0-1**). Chỉ output đã duyệt mới được chia sẻ công khai, qua tiền tố `public/`, chỉ đọc, thu hồi được; còn lại dùng URL ký có hạn. Link cũ: cấp lại cho video đã duyệt và đang dùng, phần còn lại hết hiệu lực, báo trước cho tiệm. (OWASP ASVS V4/V12, ISO A.8.3) | Duyệt — phần chặn ghi đã làm |
| D-06 | Sao chép R2 hằng ngày sang bucket thứ hai (tốt nhất khác tài khoản/nhà cung cấp), khoá chỉ-ghi, bucket lock 30 ngày. Admin bucket: 2 người có tên, bắt buộc MFA, rà soát quyền mỗi quý. Cần xác minh tính năng versioning hiện hành của R2. (ISO A.8.13, A.5.15, A.8.2; SOC 2 CC6.1) | Duyệt |
| D-07 | Thêm `STORAGE_SIGNING_SECRET` (**đã làm, P0-1**). Không thêm thư viện: kiểm magic-byte viết tay (**đã làm, P0-2**). Quét malware (ClamAV) để P3, làm khi khách doanh nghiệp yêu cầu. (ISO A.8.24) | Duyệt — phần env đã làm |
| D-05a | **Tailoring đề xuất, chờ PO xác nhận:** không tạo tiền tố `public/`. Catalog công khai đã ký URL GET hết hạn ≤ 7 ngày mỗi lần hiển thị (`get-public-catalog.ts:67`), gỡ khỏi catalog là link tự hết hạn; `public/` buộc nhân bản tệp mà không thêm kiểm soát. Nếu cần thu hồi nhanh hơn 7 ngày: giảm TTL | Chờ xác nhận |
| D-09 | **Tailoring đề xuất, chờ PO xác nhận:** không thêm cột `asset_class`/`visibility`. `asset_kind` ánh xạ được sang 6 lớp SDAGF (ORIGINAL→INPUT; ANALYZED→INTERMEDIATE; còn lại→OUTPUT), tệp ngoài `assets` đã có nguồn registry riêng; `visibility` thừa khi không có `public/` | Chờ xác nhận |
| D-08 | Phạm vi ngoài repo (console Render/R2, log runtime) cho 3 control NOT_ASSESSED | **Còn mở** — cần người có quyền thu bằng chứng (P0-3, P0-4) |

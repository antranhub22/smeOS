# 11 — Decisions required (PO)

| ID | Câu hỏi | Vì sao cần | Lựa chọn gợi ý (không phải quyết định) |
|---|---|---|---|
| D-01 | RPO chính thức cho DB và kho tệp? | Runbook ghi "đề xuất, cần PO chốt" | DB 15 phút (PITR) / kho 24 giờ |
| D-02 | RTO chính thức? Có cam kết trong hợp đồng khách không? | C-020 | 2 giờ / 8 giờ |
| D-03 | Thời hạn giữ từng lớp: ảnh gốc, output, bảng tính nhập (PII), audit log, job tạm, dữ liệu tenant sau khi huỷ gói | C-011 | — (cần căn cứ pháp lý, ví dụ Nghị định 13/2023 về dữ liệu cá nhân — cần tư vấn pháp lý) |
| D-04 | Có cần legal hold không? Ai được đặt hoặc gỡ? | C-013 | Capability riêng cho chủ tổ chức + platform |
| D-05 | Link video đã chia sẻ công khai có phải tiếp tục sống không? | Ảnh hưởng T1 | Chuyển sang `public/` sau khi duyệt, link cũ hết hiệu lực |
| D-06 | Có bật versioning hoặc sao chép R2 (chi phí thêm)? Ai giữ quyền admin bucket? | C-019/020/027 | Versioning + lifecycle xoá bản cũ sau 30 ngày |
| D-07 | Có cho thêm env `STORAGE_SIGNING_SECRET` (đổi `render.yaml`) và/hoặc thư viện sniff/quét malware không? | CLAUDE.md: thêm dependency/CI cần PO | — |
| D-08 | Audit này có cần phạm vi ngoài repo (console Render/R2, log runtime) không? Ai cấp quyền? | 3 control NOT_ASSESSED | — |

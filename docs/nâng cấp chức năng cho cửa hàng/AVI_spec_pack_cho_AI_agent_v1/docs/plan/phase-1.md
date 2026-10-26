# Giai đoạn 1 — Kiểm kê hiện trạng FloraOS/SMEOS

**Chế độ: CHỈ ĐỌC.** Không sửa mã nghiệp vụ, không đổi cấu trúc thư mục, không tạo repo. Chỉ được ghi vào `docs/inventory/` và `docs/plan/questions.md`.

**Mục đích:** có bản đồ hiện trạng để con người chốt ADR-D1, ADR-D3 và để giai đoạn 2 đặt ranh giới đúng. Không có bản đồ này thì mọi nhiệm vụ sau đều dựa trên giả định.

**REQ liên quan:** REQ-ARCH-006, 007, 008; REQ-BND-004..010; REQ-PRD-003.

## Nhiệm vụ

### T1.1 — Danh mục module hiện có
- Liệt kê mọi thư mục/package/service hiện có, mỗi mục một dòng: tên, đường dẫn, mô tả một câu, ngôn ngữ/framework.
- Đầu ra: `docs/inventory/modules.md`.
- Xong khi: mọi thư mục cấp 1–2 của mã nguồn đều có mặt trong bảng (đối chiếu bằng lệnh liệt kê cây thư mục, dán kết quả vào cuối file).

### T1.2 — Bản đồ dữ liệu (bảng → module sở hữu)
- Liệt kê mọi bảng/collection; gán module đang ghi vào nó; đánh dấu bảng bị nhiều module ghi hoặc đọc chéo.
- Đầu ra: `docs/inventory/data-ownership.md` (cột: bảng, module ghi, module đọc, nhóm đề xuất Store/Chain/Industry/Platform, ghi chú).
- Xong khi: không có bảng nào thiếu nhóm đề xuất; các bảng không chắc chắn nằm trong mục "Cần con người quyết".

### T1.3 — Đồ thị phụ thuộc
- Trích phụ thuộc import giữa các module; xuất danh sách cạnh và liệt kê chu trình, phụ thuộc ngược tầng (theo bốn tầng đề xuất).
- Đầu ra: `docs/inventory/dependencies.md` (+ file dữ liệu thô nếu có).
- Xong khi: lệnh/tập lệnh tạo ra đồ thị được ghi lại để chạy lại được.

### T1.4 — Phân loại tính năng theo bốn nhóm
- Với mỗi tính năng/màn hình/API chính: gán nhóm Store OS / Chain OS / Industry (hoa) / Platform (Mother), kèm lý do một câu, dùng "câu hỏi phân định" trong 00-overview.
- Đầu ra: `docs/inventory/feature-map.md`.
- Xong khi: đặc biệt đánh dấu các điểm lẫn nghiệp vụ (ví dụ định mức nằm ở Store, logic phân bổ đơn lẫn trong xử lý đơn).

### T1.5 — Điểm gắn chặt (coupling hotspots)
- Tổng hợp từ T1.2–T1.4: danh sách điểm cản trở tách module, xếp theo mức độ, kèm gợi ý hướng xử lý (chỉ là gợi ý).
- Đầu ra: `docs/inventory/hotspots.md`.

### T1.6 — Hiện trạng đồng bộ/tích hợp
- Tìm mọi cơ chế đang gửi dữ liệu ra ngoài hoặc giữa các phần (webhook, job, queue, API): mô tả, dữ liệu gửi, có dữ liệu cá nhân không (phân loại L0–L3 đề xuất).
- Đầu ra: `docs/inventory/sync-current.md`.

### T1.7 — Báo cáo tổng hợp và câu hỏi
- Tóm tắt một trang: ánh xạ hiện trạng sang cấu trúc monorepo đề xuất; những điểm cấu trúc đề xuất KHÔNG khớp thực tế; dữ liệu đầu vào cho ADR-D1 và ADR-D3 (chỉ trình bày dữ kiện, không chọn).
- Đầu ra: `docs/inventory/SUMMARY.md` và `docs/plan/questions.md`.

## Cổng chuyển giai đoạn
Giai đoạn 2 chỉ bắt đầu khi con người đã đọc `SUMMARY.md`, chốt D1 và D3 trong ADR, rồi ghi `APPROVED` vào cuối file này.

**APPROVED: 2026-10-25 bởi Người Dùng (Đã chốt ADR-D1: Phương án A - Relay qua Chain OS; ADR-D3: Phương án A - Mặc định Shared Database + organization_id). Chuyển sang Giai đoạn 2.**


## Lệnh kiểm tra chung
Rà soát thủ công bằng đối chiếu: số thư mục/bảng thực tế (lệnh đếm) so với số dòng trong bảng đầu ra. Ghi con số hai phía vào cuối mỗi file.

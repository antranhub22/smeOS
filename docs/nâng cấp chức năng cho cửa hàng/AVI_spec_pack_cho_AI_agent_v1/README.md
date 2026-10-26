# Gói đặc tả giao cho AI agent (spec pack) — bản khởi đầu

Sao chép toàn bộ thư mục này vào gốc repo (monorepo). Agent đọc `AGENTS.md` (hoặc `CLAUDE.md`) đầu tiên.

| Đường dẫn | Vai trò |
|---|---|
| AGENTS.md / CLAUDE.md | Luật bất biến, điều cấm tự quyết, quy trình, Definition of Done |
| docs/spec/00-overview.md | Bối cảnh, thuật ngữ, bốn tầng, bảng sở hữu, nghiệm thu |
| docs/spec/requirements.md | 93 yêu cầu có mã REQ-*, mức MUST/SHOULD, cách kiểm chứng |
| docs/spec/traceability.md | Ma trận truy vết agent phải cập nhật |
| docs/spec/contracts/ | Event envelope (JSON Schema) và nơi đặt các contract tiếp theo |
| docs/adr/ | ADR-001..010 đã chốt; ADR-D1..D5 CHƯA chốt |
| docs/plan/ | CURRENT.md, phase-1.md (kiểm kê). Các phase sau soạn khi phase trước được duyệt |

## Cách dùng đề xuất
1. Giao agent chạy phase-1 (chỉ đọc). Duyệt SUMMARY.md, chốt D1, D3, ghi APPROVED.
2. Nhờ soạn phase-2 từ requirements.md + kết quả kiểm kê, duyệt, rồi mới chạy.
3. Sau mỗi phase, một lượt rà soát riêng (agent khác hoặc phiên mới): đối chiếu traceability.md với requirements.md, tìm REQ chưa có bằng chứng.

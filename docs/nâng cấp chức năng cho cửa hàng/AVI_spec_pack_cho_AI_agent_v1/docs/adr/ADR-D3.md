# ADR-D3: Mô hình Tenancy cho SaaS dùng chung và Khách hàng Enterprise

- Trạng thái: **ĐÃ CHỐT** (2026-10-25)
- Quyết định của con người: **Phương án A — Mặc định Shared Database + `organization_id` & Sẵn sàng Cấu hình Database Riêng cho Enterprise**
- Chi tiết quyết định:
  - Khách hàng SaaS tiêu chuẩn (95% SME): Dùng chung Database PostgreSQL, cách ly nghiêm ngặt bằng `organization_id` trên 100% bản ghi tenant (kiểm soát ở tầng Repository và bảo vệ bằng `npm run test:tenant`).
  - Khách hàng Enterprise / Chuỗi lớn: Hệ thống hỗ trợ cấu hình Database URL riêng (Connection string động theo tenant) mà không cần sửa đổi mã nguồn nghiệp vụ.
  - Không triển khai Multi-Schema để tránh gánh nặng migration và bảo trì phức tạp.
- Yêu cầu liên quan: REQ-COM-002, REQ-SEC-005.

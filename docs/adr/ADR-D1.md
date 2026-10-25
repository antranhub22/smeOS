# ADR-D1: Topology đồng bộ — Relay qua Chain OS hay Store gửi song song?

- Trạng thái: **ĐÃ CHỐT** (2026-10-25)
- Quyết định của con người: **Phương án A — Relay qua Chain OS**
- Chi tiết quyết định:
  - Cửa hàng thuộc chuỗi: Chỉ phát sự kiện vận hành cho Chain OS. Chain OS tổng hợp chỉ số, xác thực quyền và chịu trách nhiệm gửi lên Mother Platform qua Mother Connector.
  - Cửa hàng độc lập (không thuộc chuỗi): Gửi trực tiếp lên Mother Platform qua Mother Connector.
  - Tắt đồng bộ Mother tại cấp Chuỗi không làm gián đoạn vận hành giữa Chuỗi và Cửa hàng thành viên.
- Yêu cầu liên quan: REQ-CON-003, REQ-BND-005, REQ-BND-006.

# 00 — Tổng quan kiến trúc

## Mục tiêu
Phát triển tính năng một lần theo module chuẩn tại Mother Monorepo; đóng gói thành nhiều Edition (SaaS chuyên ngành, Chain OS, Store OS); vận hành độc lập khi cần; mọi sản phẩm vẫn đồng bộ dữ liệu được phép về Mother qua Mother Connector.

## Thuật ngữ
| Thuật ngữ | Nghĩa |
|---|---|
| Mother Monorepo | Kho mã nguồn gốc (build-time): module, package, app, pipeline |
| Mother Platform | Dịch vụ vận hành cấp hệ sinh thái (run-time): định danh, kết nối, Ingestion API, dữ liệu tổng hợp, giấy phép |
| Industry Pack | Gói nghiệp vụ của một ngành (ví dụ flora-pack) |
| Core | store-core, chain-core: lõi theo chiều ngang, không có quy tắc ngành |
| Edition | Tổ hợp phát hành = Core + Industry Pack + Connector Profile |
| Connector Profile | Cấu hình đồng bộ: loại sự kiện, trường, lớp dữ liệu, cấp chuyển tiếp |
| Outbox | Bảng lưu sự kiện chờ gửi, ghi cùng giao dịch nghiệp vụ |
| Idempotency | Xử lý lặp một sự kiện không tạo thêm tác động |
| System of record | Hệ thống chịu trách nhiệm chính, là nguồn dữ liệu gốc |
| ADR | Bản ghi quyết định kiến trúc |

## Bốn tầng
| Tầng | Nội dung | Được phụ thuộc vào |
|---|---|---|
| 4. Product/Edition | apps/: mother-platform, store-os, chain-os, industry-saas-flora | 3, 2, 1 |
| 3. Domain Modules | modules/: store-core, chain-core, mother-ingestion, packs/flora-pack | 2, 1 (không import nội bộ module khác) |
| 2. Platform | packages/: platform-core, platform-sdk, mother-connector | 1 |
| 1. Infrastructure | database, queue, secret, observability, CI/CD | — |

## Cấu trúc monorepo đề xuất (xác nhận sau giai đoạn 1)
```
mother-monorepo/
├─ apps/        mother-platform/ store-os/ chain-os/ industry-saas-flora/
├─ modules/     store-core/ chain-core/ mother-ingestion/ packs/flora-pack/
├─ packages/    platform-core/ platform-sdk/ mother-connector/
├─ tools/       architecture tests, codegen, release
└─ docs/        spec/ adr/ plan/
```
Cấu trúc này là ĐỀ XUẤT. Hiện trạng FloraOS/SMEOS có thể khác; giai đoạn 1 quyết định việc ánh xạ.

## Bảng sở hữu dữ liệu (system of record)
| Dữ liệu / nghiệp vụ | Nguồn chính | Hệ thống khác được làm gì |
|---|---|---|
| Đơn hàng và tiến độ xử lý | Store OS | Chain theo dõi theo quyền; Mother nhận dữ liệu được phép |
| Quyết định phân bổ đơn | Chain OS | Store nhận, chấp nhận/từ chối; Mother nhận chỉ số tổng hợp |
| Tồn kho, tiêu hao nguyên liệu thực tế | Store OS | Chain/Mother nhận chỉ số tổng hợp nếu được phép |
| Công thức, định mức chuẩn, quy tắc ngành | Industry Pack | Store dùng chỉ đọc qua package/API; Mother tổng hợp metadata |
| Hồ sơ đối tác, tier, tiêu chuẩn mạng lưới | Chain OS | Store nhận chính sách áp dụng; Mother nhận tổng hợp được phép |
| Định danh, giấy phép, trạng thái connector | Mother Platform | Sản phẩm dùng định danh/entitlement được cấp |
| Dữ liệu tổng hợp đa ngành | Mother Data Platform | Dùng theo chính sách và quyền truy cập |

## Topology đồng bộ
Store → Chain → Mother. Mỗi cấp chỉ chuyển tiếp khi được cấp quyền và bật cờ. Ba cấu hình: Store độc lập (gửi thẳng Mother hoặc không đồng bộ); Store thuộc chuỗi (qua Chain); chuỗi tắt Mother (dừng tại Chain). Chi tiết relay hay song song: ADR-D1 (CHƯA chốt).

## Lớp dữ liệu
L0 định danh/kết nối (luôn đồng bộ) · L1 chỉ số tổng hợp (khi hợp đồng cho phép) · L2 bản ghi vận hành (theo danh sách trường được duyệt) · L3 cá nhân/nhạy cảm (mặc định KHÔNG đồng bộ).

## Vòng đời sản phẩm
Incubate (phát triển trong monorepo, đã có owner + contract + architecture tests) → Extract (đóng gói bản dựng độc lập, đạt tiêu chí A1–A4) → Graduate (tách repo riêng khi đạt ≥2 trong 5 tín hiệu, REQ-ARCH-011).

## Tiêu chí nghiệm thu kiến trúc
| Mã | Tiêu chí | Cách kiểm chứng |
|---|---|---|
| A1 | Build/chạy từng module độc lập | CI test cô lập từng module |
| A2 | Đóng gói một Edition mẫu, triển khai môi trường độc lập | Triển khai từ artifact, không clone monorepo |
| A3 | Sản phẩm tách không truy cập DB nội bộ Mother | Chặn kết nối tới DB Mother, chạy test nghiệp vụ |
| A4 | Architecture tests bắt được vi phạm | Chèn vi phạm có chủ đích, CI phải đỏ |
| B1 | Connector đồng bộ đầu-cuối, truy vết được | Đối chiếu event_id nguồn→đích |
| B2 | Mất kết nối không mất sự kiện, không tác động trùng | Ngắt mạng, nối lại, so khớp |
| B3 | Đúng phạm vi Connector Profile, không rò L3 | Test sinh dữ liệu có L3 |
| B4 | Đổi schema phá vỡ bị phát hiện | Contract test fail |
| C1 | Có quy trình phát hành/cập nhật cho 3 hình thức | Diễn tập nâng cấp + rollback |
| C2 | Có tài liệu chủ sở hữu dữ liệu, quyền, phạm vi đồng bộ, xử lý ngắt kết nối | Rà soát với owner và pháp chế |
| C3 | Cô lập tenant/tổ chức/cửa hàng | Bộ test bảo mật tự động |

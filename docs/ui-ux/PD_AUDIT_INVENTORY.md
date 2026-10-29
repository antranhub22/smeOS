# Audit Progressive Disclosure — Inventory 84 màn (Giai đoạn 1.1)

> Sinh tự động bằng quét tĩnh ngày 29/10/2026 trên nhánh `NangcapkientrucUX_progressiveDisclosure` (cơ sở `main` @ `731be68`).
> Báo cáo phân tích và xếp hạng: `docs/ui-ux/PD_AUDIT_REPORT.md`.

**Cách đọc:** mỗi màn tính trên `page.tsx` + các component nó import (3 tầng, trong `src/app` và `src/components`, không tính `components/ui/`). Một component dùng chung được đếm ở mọi màn import nó, nên **không cộng dồn các cột**. Đây là chỉ báo để định hướng, không phải số lỗi.

- **confirm()** — số lần gọi hộp xác nhận của trình duyệt → luật R13.
- **`<details>`** — vùng mở rộng tự viết → R15.
- **Chuỗi trạng thái thô** — `"done"`, `"processing"`, `"pending"`… viết thường trong component → R14.
- **EmptyState/Skeleton/InlineError** — số lần dùng component trạng thái dùng chung. "chưa dùng component trạng thái chung" = màn có gọi dữ liệu nhưng tự xử lý trạng thái hoặc chưa xử lý (cần xem tay ở Giai đoạn 4).

| Nhóm | Route | Tệp | Screen Contract | confirm() | `<details>` | Chuỗi trạng thái thô | Dùng EmptyState/Skeleton/InlineError | Điểm cần xử lý |
|---|---|---|---|---|---|---|---|---|
| Tải ảnh | `/(app)/tai-anh` | 20 | tai-anh | 1 | 0 | 11 | 0/0/0 | R13×1, R14×11, chưa dùng component trạng thái chung |
| Công cụ ảnh | `/(app)/cong-cu` | 5 | — | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung, chưa có Screen Contract |
| Công cụ ảnh | `/(app)/cong-cu/anh-san-pham` | 7 | — | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung, chưa có Screen Contract |
| Công cụ ảnh | `/(app)/cong-cu/bo-anh-san-pham` | 6 | — | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung, chưa có Screen Contract |
| Công cụ ảnh | `/(app)/cong-cu/poster-banner` | 11 | — | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung, chưa có Screen Contract |
| Creative Studio | `/(app)/creative-studio` | 45 | — | 2 | 1 | 16 | 0/2/0 | R13×2, R15×1, R14×16, chưa có Screen Contract |
| Creative Studio | `/(app)/video` | 6 | video | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Catalog/Landing | `/(app)/catalog` | 27 | catalog | 0 | 0 | 19 | 0/2/0 | R14×19 |
| Catalog/Landing | `/(app)/kho-templates` | 62 | kho-templates | 0 | 0 | 0 | 0/0/0 | — |
| Catalog/Landing | `/(app)/landing-page` | 26 | — | 1 | 0 | 31 | 0/2/0 | R13×1, R14×31, chưa có Screen Contract |
| Catalog/Landing | `/(app)/the-chao` | 111 | the-chao | 7 | 2 | 6 | 2/9/10 | R13×7, R15×2, R14×6 |
| Market Intelligence | `/(app)/market-intelligence` | 40 | market-intelligence | 0 | 1 | 14 | 0/0/0 | R15×1, R14×14, chưa dùng component trạng thái chung |
| Đơn hàng/CRM | `/(app)/bao-gia` | 1 | — | 0 | 0 | 0 | 0/2/0 | chưa có Screen Contract |
| Đơn hàng/CRM | `/(app)/dieu-phoi` | 67 | — | 1 | 0 | 4 | 0/6/0 | R13×1, R14×4, chưa có Screen Contract |
| Đơn hàng/CRM | `/(app)/dieu-phoi/doi-tac` | 8 | — | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung, chưa có Screen Contract |
| Đơn hàng/CRM | `/(app)/don-hang` | 52 | don-hang | 1 | 1 | 5 | 2/4/0 | R13×1, R15×1, R14×5 |
| Đơn hàng/CRM | `/(app)/gia` | 3 | gia | 0 | 0 | 0 | 0/2/0 | — |
| Đơn hàng/CRM | `/(app)/khach-hang` | 6 | khach-hang | 0 | 0 | 0 | 0/4/2 | — |
| Nội dung & lịch | `/(app)/lich-dang` | 15 | lich-dang | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Nội dung & lịch | `/(app)/noi-dung` | 18 | noi-dung | 0 | 0 | 14 | 0/2/0 | R14×14 |
| Hội thoại | `/(app)/chat` | 1 | — | 0 | 0 | 0 | 0/0/0 | chưa có Screen Contract |
| Hội thoại | `/(app)/hoi-thoai` | 2 | hoi-thoai | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Hội thoại | `/(app)/hoi-thoai/kenh-tich-hop` | 3 | hoi-thoai | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Hội thoại | `/(app)/tin-nhan` | 2 | — | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung, chưa có Screen Contract |
| Sản phẩm | `/(app)/san-pham` | 25 | san-pham | 0 | 0 | 2 | 2/2/0 | R14×2 |
| Sản phẩm | `/(app)/san-pham/[id]` | 24 | san-pham | 0 | 0 | 8 | 0/2/0 | R14×8 |
| Sản phẩm | `/(app)/san-pham/[id]/tinh-nang` | 2 | san-pham | 0 | 0 | 0 | 2/0/0 | — |
| Sản phẩm | `/(app)/san-pham/[id]/tinh-nang/product-copy/[copyId]` | 1 | san-pham | 1 | 0 | 0 | 0/0/0 | R13×1, chưa dùng component trạng thái chung |
| Sản phẩm | `/(app)/san-pham/kha-dung` | 7 | san-pham | 1 | 0 | 0 | 0/0/0 | R13×1, chưa dùng component trạng thái chung |
| Sản phẩm | `/(app)/san-pham/nhap-hang-loat` | 19 | san-pham | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Sản phẩm | `/(app)/san-pham/tao-moi` | 16 | san-pham | 0 | 0 | 7 | 0/0/0 | R14×7, chưa dùng component trạng thái chung |
| Tác vụ & duyệt | `/(app)/duyet` | 5 | duyet | 1 | 0 | 0 | 6/2/0 | R13×1 |
| Tác vụ & duyệt | `/(app)/job` | 1 | job | 0 | 0 | 0 | 2/2/0 | — |
| Tác vụ & duyệt | `/(app)/job/[id]` | 2 | job | 0 | 0 | 14 | 0/2/0 | R14×14 |
| AI & dữ liệu | `/(app)/bo-may` | 1 | bo-may | 0 | 0 | 0 | 0/2/0 | — |
| AI & dữ liệu | `/(app)/du-lieu` | 7 | — | 0 | 0 | 0 | 0/5/0 | chưa có Screen Contract |
| AI & dữ liệu | `/(app)/kho-du-lieu` | 5 | kho-du-lieu | 1 | 0 | 0 | 0/0/0 | R13×1, chưa dùng component trạng thái chung |
| AI & dữ liệu | `/(app)/muc-dung` | 2 | muc-dung | 0 | 0 | 0 | 0/3/0 | — |
| AI & dữ liệu | `/(app)/tri-thuc` | 5 | tri-thuc | 0 | 0 | 0 | 0/0/0 | — |
| Trang chủ & số liệu | `/(app)` | 35 | trang-chu-* | 0 | 0 | 0 | 15/24/14 | — |
| Trang chủ & số liệu | `/(app)/so-lieu` | 3 | so-lieu | 0 | 0 | 0 | 0/4/0 | — |
| Trang chủ & số liệu | `/(app)/them` | 9 | them | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Cài đặt/Tổ chức | `/(app)/audit` | 2 | audit | 0 | 0 | 0 | 0/2/0 | — |
| Cài đặt/Tổ chức | `/(app)/cai-dat` | 36 | cai-dat | 2 | 2 | 0 | 0/7/0 | R13×2, R15×2 |
| Cài đặt/Tổ chức | `/(app)/cai-dat-ai` | 4 | cai-dat-ai | 0 | 0 | 0 | 0/2/0 | — |
| Cài đặt/Tổ chức | `/(app)/cai-dat/ma-tran-camket` | 9 | cai-dat | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Cài đặt/Tổ chức | `/(app)/cai-dat/ma-tran-chinhsach` | 9 | cai-dat | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Cài đặt/Tổ chức | `/(app)/cai-dat/ma-tran-phigiacong` | 9 | cai-dat | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Cài đặt/Tổ chức | `/(app)/cai-dat/ma-tran-thanhtoan-datco` | 9 | cai-dat | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Cài đặt/Tổ chức | `/(app)/cai-dat/ma-tran-uudai` | 9 | cai-dat | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Cài đặt/Tổ chức | `/(app)/cai-dat/thanh-vien` | 8 | cai-dat | 3 | 0 | 0 | 0/2/0 | R13×3 |
| Cài đặt/Tổ chức | `/(app)/cai-dat/thong-bao` | 15 | cai-dat | 0 | 0 | 0 | 0/3/0 | — |
| Cài đặt/Tổ chức | `/(app)/cua-hang` | 4 | — | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung, chưa có Screen Contract |
| Cài đặt/Tổ chức | `/(app)/ho-so` | 1 | ho-so | 0 | 0 | 0 | 0/0/0 | — |
| Cài đặt/Tổ chức | `/(app)/ket-noi` | 4 | ket-noi | 1 | 0 | 0 | 0/0/0 | R13×1, chưa dùng component trạng thái chung |
| Cài đặt/Tổ chức | `/(app)/noi-bo/ket-noi` | 2 | — | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung, chưa có Screen Contract |
| Cài đặt/Tổ chức | `/(app)/vai-tro` | 1 | vai-tro | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Nền tảng | `/(platform)/van-hanh` | 11 | van-hanh | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Nền tảng | `/(platform)/van-hanh/dang-ky` | 1 | van-hanh | 1 | 0 | 0 | 0/2/0 | R13×1 |
| Nền tảng | `/(platform)/van-hanh/du-lieu` | 3 | van-hanh | 0 | 0 | 0 | 0/4/0 | — |
| Nền tảng | `/(platform)/van-hanh/ma-tran-camket` | 9 | van-hanh | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Nền tảng | `/(platform)/van-hanh/ma-tran-chinhsach` | 9 | van-hanh | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Nền tảng | `/(platform)/van-hanh/ma-tran-phigiacong` | 9 | van-hanh | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Nền tảng | `/(platform)/van-hanh/ma-tran-thanhtoan-datco` | 9 | van-hanh | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Nền tảng | `/(platform)/van-hanh/ma-tran-uudai` | 9 | van-hanh | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Nền tảng | `/(platform)/van-hanh/muc-dung` | 1 | van-hanh | 0 | 0 | 0 | 0/2/0 | — |
| Nền tảng | `/(platform)/van-hanh/nganh` | 5 | van-hanh | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Nền tảng | `/(platform)/van-hanh/nhat-ky` | 1 | van-hanh | 0 | 0 | 0 | 0/2/0 | — |
| Nền tảng | `/(platform)/van-hanh/phe-duyet` | 1 | van-hanh | 1 | 0 | 0 | 0/3/0 | R13×1 |
| Nền tảng | `/(platform)/van-hanh/quan-tri-ma-tran` | 9 | van-hanh | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Nền tảng | `/(platform)/van-hanh/suc-khoe` | 1 | van-hanh | 0 | 0 | 0 | 0/2/0 | — |
| Nền tảng | `/(platform)/van-hanh/thong-bao` | 8 | van-hanh | 0 | 0 | 0 | 0/3/0 | — |
| Nền tảng | `/(platform)/van-hanh/to-chuc` | 1 | van-hanh | 0 | 0 | 0 | 0/2/0 | — |
| Nền tảng | `/(platform)/van-hanh/to-chuc/[id]` | 1 | van-hanh | 0 | 0 | 0 | 0/2/0 | — |
| Nền tảng | `/(platform)/van-hanh/truong-du-lieu` | 7 | van-hanh | 0 | 0 | 0 | 0/8/0 | — |
| Xác thực | `/(auth)/dang-nhap` | 5 | — | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung, chưa có Screen Contract |
| Trang công khai | `/b/[sendCode]` | 69 | — | 0 | 2 | 0 | 0/0/0 | R15×2, chưa dùng component trạng thái chung |
| Trang công khai | `/bst/[orgSlug]/[catalogCode]` | 64 | — | 0 | 2 | 0 | 0/0/0 | R15×2, chưa dùng component trạng thái chung |
| Trang công khai | `/c/[slug]` | 25 | — | 0 | 0 | 0 | 0/0/0 | chưa dùng component trạng thái chung |
| Trang công khai | `/chinh-sach-bao-mat` | 1 | — | 0 | 0 | 0 | 0/0/0 | — |
| Trang công khai | `/dang-ky-thanh-cong` | 1 | — | 0 | 0 | 0 | 0/0/0 | — |
| Trang công khai | `/g/[id]` | 64 | — | 0 | 2 | 0 | 0/0/0 | R15×2, chưa dùng component trạng thái chung |
| Trang công khai | `/s/[code]` | 6 | — | 0 | 0 | 0 | 0/0/0 | — |
| Trang công khai | `/subcontract/[orderCode]` | 19 | — | 2 | 0 | 0 | 0/0/0 | R13×2, chưa dùng component trạng thái chung |

**Tổng:** 84 màn · 15 màn ứng dụng chưa có Screen Contract · 41 màn có gọi dữ liệu nhưng chưa dùng component trạng thái chung.

# Checklist nâng cấp UI "Thoáng – Ít chữ – Icon lớn"

> Level 3 SUPPORTING · theo dõi tiến độ · PO duyệt phong cách 30/10/2026 · chuẩn: `docs/dac-ta/ux-patterns/OPERATING_PRINCIPLES.md` §6 · mẫu: `/cong-cu`.
> Thứ tự ưu tiên: **StoreOS → ChainOS → SaaS ngành → SaaS Mother**. Trang dùng chung đường dẫn giữa các tầng chỉ sửa **một lần** ở tầng đầu tiên; tầng sau chỉ kiểm nội dung riêng của tầng (nhãn, thuật ngữ, số liệu).

## Tiêu chí "xong" cho mỗi trang (áp cho mọi dòng bên dưới)
1. Nhãn, tiêu đề, nút ≤ 5 từ; giải thích chuyển vào `InfoTip` — lỗi/chi phí/điều kiện/rủi ro/quyền vẫn hiện thẳng.
2. Đầu trang: `ToolHero` (trang công cụ) hoặc tiêu đề ngắn + `InfoTip`; giữ K1 `FeatureGuidanceCard`, K2 `TabActionHeader`.
3. Icon: `IconTile` cho thẻ điều hướng/ô lớn (ô đặc chỉ ở lưới điều hướng chính), icon nhỏ từ `@/components/ui/icons`.
4. Khối chính `bg-surface` + `shadow-sm` + `rounded-2xl` nổi trên nền; khoảng trống theo §6.4; điện thoại lưới 2 cột.
5. Không mã kỹ thuật/jargon trên màn hình (BOM, Plugin, Schema, Tenant, A6, tên model…).
6. Ảnh 390/1280px gửi PO duyệt; gate: typecheck, `lint:ratchet`, `lint:ux -- --check`, `npm test`, `check:docs`.

Ký hiệu: ✅ xong · 🟡 mới đổi icon (Phosphor) · ⬜ chưa làm · 🔁 dùng chung — đã tính ở tầng trước.

## Đã xong (mọi tầng)
- ✅ Bộ icon Phosphor toàn hệ thống (`icons.tsx`, test chặn `lucide-react`).
- ✅ Sidebar (kích thước, icon đặc khi chọn).
- ✅ Trang chủ 4 tầng — thẻ `ActionCard`, tên việc ≤ 5 từ.
- ✅ `/cong-cu` (lưới 10 bước, chi tiết bước, thẻ công cụ) + `/cong-cu/anh-san-pham`, `/cong-cu/bo-anh-san-pham`, `/cong-cu/poster-banner`.

## 0. Việc chung làm trước (ảnh hưởng mọi tầng)
- ✅ **Rút gọn nhãn sidebar** (4 file `src/components/layout/nav/nav-*.ts`): vd. "Thư viện 51 công cụ (9 nhóm)" → "Công cụ"; "Công thức BOM & Tính giá" → "Tính giá"; "Schema & Taxonomy toàn cầu" → "Trường dữ liệu"; "AI Providers & Models" → "Cấu hình AI". Kèm test ≤ 5 từ, không jargon.
- ✅ Nâng component dùng chung: `EmptyState` (ô icon 48px), `PageHeader` (prop `tip`), `Card` (bóng `shadow-sm`), `StatTile` (thẻ số liệu mới: số to, nhãn nhỏ, (?)).

## 1. StoreOS (cửa hàng) — ưu tiên cao nhất
| # | Trang | Nhãn menu hiện tại | Ưu tiên | Trạng thái |
|---|---|---|---|---|
| 1 | `/don-hang` | Đơn hàng | P1 — dùng hằng ngày | ✅ đầu trang, thẻ đơn, cột kanban (chờ PO duyệt ảnh); thẻ hướng dẫn K1 giữ nguyên |
| 2 | `/khach-hang` | Khách hàng | P1 | 🟡 |
| 3 | `/san-pham` | Danh mục sản phẩm | P1 | 🟡 |
| 4 | `/san-pham/tao-moi` | Tạo sản phẩm mới | P1 | 🟡 |
| 5 | `/hoi-thoai` | Hội thoại | P1 | 🟡 |
| 6 | `/so-lieu` | Báo cáo kinh doanh | P1 — thẻ số liệu kiểu SePay (dùng `StatTile`) | 🟡 |
| 7 | `/the-chao` | Thẻ chào sản phẩm | P1 — tính năng nổi bật | 🟡 |
| 8 | `/catalog` | Tạo Catalog & Link bán hàng | P2 | 🟡 |
| 9 | `/noi-dung` | Viết nội dung marketing | P2 | 🟡 |
| 10 | `/video` | Tạo video | P2 — có tải ảnh, hỏi PO chặng | 🟡 |
| 11 | `/tai-anh` | Phân tích ảnh bằng AI | P2 — có tải ảnh, hỏi PO chặng | 🟡 |
| 12 | `/creative-studio` | Chế tác tự động A-Z | P2 — có tải ảnh, hỏi PO chặng | 🟡 |
| 13 | `/gia` | Công thức BOM & Tính giá | P2 — bỏ "BOM" | 🟡 |
| 14 | `/kho-du-lieu` | Kho & Nguyên liệu | P2 | 🟡 |
| 15 | `/kho-templates` | Kho mẫu & Ấn phẩm | P2 | 🟡 |
| 16 | `/dieu-phoi` | Sản xuất & Điều phối | P2 | 🟡 |
| 17 | `/duyet` | Việc chờ duyệt (QC) | P2 — bỏ "QC" | 🟡 |
| 18 | `/job` | Giao hàng & Bàn giao | P2 | 🟡 |
| 19 | `/cua-hang` | Đơn nhận từ mạng lưới | P2 | 🟡 |
| 20 | `/san-pham/kha-dung` | Khả dụng & Lịch | P3 | 🟡 |
| 21 | `/san-pham/nhap-hang-loat` | Nhập từ Excel & Ảnh | P3 | 🟡 |
| 22 | `/market-intelligence` | Xu hướng & Cơ hội thị trường | P3 | 🟡 |
| 23 | `/muc-dung` | Sổ quỹ & Thu chi | P3 | 🟡 |
| 24 | `/tin-nhan` | Trao đổi nội bộ | P3 | 🟡 |
| 25 | `/tri-thuc` | Tri thức & Quy trình | P3 | 🟡 |
| 26 | `/cong-cu/toi-uu-he-thong` | Trợ lý Tối ưu Tác nghiệp | P3 | 🟡 |
| 27 | `/cai-dat` (+ `?tab=INFO`) | Cài đặt & Thiết lập tiệm | P2 | 🟡 |
| 28 | `/cai-dat/ma-tran-*` (5 trang) + `/cai-dat/thong-bao` | Ma trận … | P3 — bảng dày, ưu tiên nhãn ngắn + (?) | 🟡 |

## 2. ChainOS (chuỗi) — chỉ phần riêng
| # | Trang | Nhãn menu | Ưu tiên | Trạng thái |
|---|---|---|---|---|
| 1 | `/` Tổng quan chuỗi | Tổng quan chuỗi | P1 — số liệu chuỗi | ✅ thẻ việc · ⬜ khối số liệu |
| 2 | `/dieu-phoi` | Tháp điều phối | P1 — giao diện riêng tầng chuỗi | 🟡 |
| 3 | `/dieu-phoi/doi-tac` | Chi nhánh & Xưởng | P1 | 🟡 |
| 4 | `/du-lieu` | Đối soát & Công nợ | P2 | 🟡 |
| 5 | `/don-hang`, `/khach-hang`, `/san-pham`, `/gia`, `/so-lieu`, `/catalog`, `/duyet`, `/kho-du-lieu`, `/video`, `/cai-dat*`… | (nhãn riêng chuỗi) | P2 — kiểm nhãn/nội dung chuỗi | 🔁 |

## 3. SaaS ngành — chỉ phần riêng
| # | Trang | Nhãn menu | Ưu tiên | Trạng thái |
|---|---|---|---|---|
| 1 | `/` Tổng quan ngành | Tổng quan ngành | P1 | ✅ thẻ việc · ⬜ khối số liệu |
| 2 | `/van-hanh/nganh` | Taxonomy & Quy chuẩn | P1 — bỏ "Taxonomy" | 🟡 |
| 3 | `/van-hanh/truong-du-lieu` | Trường dữ liệu ngành | P2 | 🟡 |
| 4 | `/van-hanh/du-lieu` | Hoa hồng & Đối soát | P2 | 🟡 |
| 5 | `/landing-page` | Landing Page & Kênh bán | P2 | 🟡 |
| 6 | `/don-hang` (Affiliate), `/dieu-phoi`, `/dieu-phoi/doi-tac`, `/san-pham`, `/gia`, `/so-lieu`, `/kho-templates`, `/cai-dat*`… | (nhãn riêng ngành) | P3 — kiểm nhãn/thuật ngữ ngành | 🔁 |

## 4. SaaS Mother (Console `/van-hanh`)
| # | Trang | Nhãn menu | Ưu tiên | Trạng thái |
|---|---|---|---|---|
| 1 | `/van-hanh` | Tổng quan nền tảng | P1 — thẻ số liệu | 🟡 |
| 2 | `/van-hanh/to-chuc` | Tổ chức & Tenant | P1 — bỏ "Tenant" | 🟡 |
| 3 | `/van-hanh/dang-ky` | Đăng ký & Phê duyệt | P1 | 🟡 |
| 4 | `/van-hanh/phe-duyet` | Gói dịch vụ & Đăng ký | P1 | 🟡 |
| 5 | `/van-hanh/suc-khoe` | Sức khỏe hệ thống | P2 | 🟡 |
| 6 | `/van-hanh/muc-dung` | Mức dùng & Chi phí | P2 | 🟡 |
| 7 | `/van-hanh/nganh` (+ `?tab=tools`) | Ngành hàng & Năng lực | P2 | 🔁 phần chung với SaaS ngành |
| 8 | `/van-hanh/san-pham` | Catalog & Sản phẩm toàn hệ thống | P2 | 🟡 |
| 9 | `/van-hanh/du-lieu` | Dữ liệu & Lưu trữ | P2 | 🔁 phần chung |
| 10 | `/van-hanh/truong-du-lieu` | Schema & Taxonomy toàn cầu | P3 — bỏ jargon | 🔁 phần chung |
| 11 | `/van-hanh/nhat-ky` | Bảo mật & Nhật ký kiểm toán | P3 | 🟡 |
| 12 | `/van-hanh/cau-hinh` | Cấu hình nền tảng | P3 | 🟡 |
| 13 | `/cai-dat-ai` | AI Providers & Models | P3 — bỏ tiếng Anh | 🟡 |
| 14 | `/van-hanh/ma-tran-*` (5 trang) + `/van-hanh/thong-bao` | Ma trận … | P3 | 🟡 |

## Cách làm mỗi đợt
Mỗi đợt 3–5 trang cùng nhóm → ảnh 390/1280px gửi PO → PO duyệt → commit + cập nhật bảng này (đổi ⬜/🟡 thành ✅). Trang có tải ảnh: hỏi PO chặng trước khi sửa (CLAUDE.md).

## Nhật ký tiến độ
- 30/10: đã làm mục 0 (nhãn sidebar, EmptyState, PageHeader, Card, StatTile); StoreOS #2 Khách hàng (đầu trang).
- Tiếp theo theo thứ tự: StoreOS #1 Đơn hàng → #2 Khách hàng (phần thân trang) → #3 … → #28.
- 31/10: StoreOS #1 Đơn hàng — đầu trang đã làm (bỏ dòng phụ, (?) giải thích). Chưa làm: thẻ đơn và bộ lọc (cần xem thêm).
- 31/10: Đơn hàng — thẻ đơn `OrderCard`: thay emoji 🌸/💌 bằng icon; bo góc `rounded-2xl`. Chưa có ảnh duyệt (không chạy được app).
- 31/10: Đơn hàng — cột kanban: tiêu đề thường thay vì IN HOA, bo `rounded-2xl`, nền nhạt. Ảnh gửi PO: `don-hang-mobile.png`, `don-hang-desktop.png`, `don-hang-kanban-desktop.png`.

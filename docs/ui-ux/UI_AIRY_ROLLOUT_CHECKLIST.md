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
| 2 | `/khach-hang` | Khách hàng | P1 | ✅ đầu trang + bộ lọc hạng (nhãn tiếng Việt) + bảng trên điện thoại (cuộn ngang, ẩn cột phụ); thẻ hướng dẫn K1 đã đổi chữ (PO đồng ý: bỏ CRM/RFM/Consent) |
| 3 | `/san-pham` | Danh mục sản phẩm | P1 | 🟡 đầu trang, lưới thẻ, thẻ `ProductCard`, khoảng giá (ví dụ → (?)) đã làm; **còn chế độ bảng quản trị** |
| 4 | `/san-pham/tao-moi` | Tạo sản phẩm mới | P1 | ✅ đầu trang + 3 thẻ con (mô tả pháp lý → (?), emoji → icon) |
| 5 | `/hoi-thoai` | Hội thoại | P1 | 🟡 đầu trang (tên tiếng Việt, (?)) + nhãn thẻ K1 bỏ tiếng Anh; **còn khung hội thoại 3 cột** |
| 6 | `/so-lieu` | Báo cáo kinh doanh | P1 — thẻ số liệu kiểu SePay (dùng `StatTile`) | 🟡 đầu trang (tiêu đề tiếng Việt, bỏ 'Analytics & Learning', mô tả → (?), bỏ mã MK-10); thẻ `StatTile`; K1 đã sửa. **Còn phần phân tích và bảng chi tiết** |
| 7 | `/the-chao` | Thẻ chào sản phẩm | P1 — tính năng nổi bật | ✅ đầu trang (mô tả → (?)); tab và thanh K2 giữ nguyên |
| 8 | `/catalog` | Tạo Catalog & Link bán hàng | P2 | 🔎 rà nhanh: nhãn/jargon đã kiểm, bố cục chưa đổi |
| 9 | `/noi-dung` | Viết nội dung marketing | P2 | ✅ tiêu đề rút còn 'Nội dung bán hàng' (6 từ → 2), mô tả → (?); bố cục chưa đổi |
| 10 | `/video` | Tạo video | P2 — có tải ảnh, hỏi PO chặng | 🔎 rà nhanh: nhãn/jargon đã kiểm, bố cục chưa đổi |
| 11 | `/tai-anh` | Phân tích ảnh bằng AI | P2 — có tải ảnh, hỏi PO chặng | 🔎 rà nhanh: nhãn/jargon đã kiểm, bố cục chưa đổi |
| 12 | `/creative-studio` | Chế tác tự động A-Z | P2 — có tải ảnh, hỏi PO chặng | 🔎 rà nhanh: nhãn/jargon đã kiểm, bố cục chưa đổi |
| 13 | `/gia` | Công thức BOM & Tính giá | P2 — bỏ "BOM" | ✅ đầu trang (mô tả → (?)); bố cục chưa đổi |
| 14 | `/kho-du-lieu` | Kho & Nguyên liệu | P2 | ✅ đầu trang (mô tả dài → (?)); bố cục chưa đổi |
| 15 | `/kho-templates` | Kho mẫu & Ấn phẩm | P2 | ✅ tiêu đề 'Kho mẫu ấn phẩm' (bỏ 'Templates'), mô tả → (?); bố cục chưa đổi |
| 16 | `/dieu-phoi` | Sản xuất & Điều phối | P2 | ✅ mô tả đầu trang → (?); bố cục chưa đổi |
| 17 | `/duyet` | Việc chờ duyệt (QC) | P2 — bỏ "QC" | ✅ tiêu đề 'Hàng đợi duyệt' đã ngắn; bố cục chưa đổi |
| 18 | `/job` | Giao hàng & Bàn giao | P2 | ✅ tiêu đề 'Job' → 'Tiến trình của tôi'; **PO: tiêu đề và tên menu 'Giao hàng & Bàn giao' chưa khớp nhau** |
| 19 | `/cua-hang` | Đơn nhận từ mạng lưới | P2 | 🔎 rà nhanh: nhãn/jargon đã kiểm, bố cục chưa đổi |
| 20 | `/san-pham/kha-dung` | Khả dụng & Lịch | P3 | ✅ tiêu đề sentence-case (ngắn), mô tả → (?) |
| 21 | `/san-pham/nhap-hang-loat` | Nhập từ Excel & Ảnh | P3 | 🔎 rà nhanh: nhãn/jargon đã kiểm, bố cục chưa đổi |
| 22 | `/market-intelligence` | Xu hướng & Cơ hội thị trường | P3 | 🔎 rà nhanh: nhãn/jargon đã kiểm, bố cục chưa đổi |
| 23 | `/muc-dung` | Sổ quỹ & Thu chi | P3 | ✅ tiêu đề 'Mức dùng' (chữ thường); bố cục chưa đổi |
| 24 | `/tin-nhan` | Trao đổi nội bộ | P3 | 🔎 rà nhanh: nhãn/jargon đã kiểm, bố cục chưa đổi |
| 25 | `/tri-thuc` | Tri thức & Quy trình | P3 | ✅ bỏ dòng mã IN HOA, tiêu đề 'Cẩm nang tri thức', mô tả → (?) |
| 26 | `/cong-cu/toi-uu-he-thong` | Trợ lý Tối ưu Tác nghiệp | P3 | 🟡 |
| 27 | `/cai-dat` (+ `?tab=INFO`) | Cài đặt & Thiết lập tiệm | P2 | ✅ tiêu đề 'Hồ sơ & cài đặt', bỏ nhãn quảng cáo, mô tả → (?); bố cục chưa đổi |
| 28 | `/cai-dat/ma-tran-*` (5 trang) + `/cai-dat/thong-bao` | Ma trận … | P3 — bảng dày, ưu tiên nhãn ngắn + (?) | 🟡 5 trang ma trận: tiêu đề ngắn, mô tả → (?) qua `TierGovernanceMatrixClient` (**cũng áp dụng cho các trang Ma trận của Mother**); còn `thong-bao` và bảng dày |

## 2. ChainOS (chuỗi) — chỉ phần riêng
| # | Trang | Nhãn menu | Ưu tiên | Trạng thái |
|---|---|---|---|---|
| 1 | `/` Tổng quan chuỗi | Tổng quan chuỗi | P1 — số liệu chuỗi | ✅ thẻ việc · ⬜ khối số liệu |
| 2 | `/dieu-phoi` | Tháp điều phối | P1 — giao diện riêng tầng chuỗi | 🔎 rà nhanh: nhãn/jargon đã kiểm, bố cục chưa đổi |
| 3 | `/dieu-phoi/doi-tac` | Chi nhánh & Xưởng | P1 | 🔎 rà nhanh: nhãn/jargon đã kiểm, bố cục chưa đổi |
| 4 | `/du-lieu` | Đối soát & Công nợ | P2 | 🔎 rà nhanh: nhãn/jargon đã kiểm, bố cục chưa đổi |
| 5 | `/don-hang`, `/khach-hang`, `/san-pham`, `/gia`, `/so-lieu`, `/catalog`, `/duyet`, `/kho-du-lieu`, `/video`, `/cai-dat*`… | (nhãn riêng chuỗi) | P2 — kiểm nhãn/nội dung chuỗi | 🔁 |

## 3. SaaS ngành — chỉ phần riêng
| # | Trang | Nhãn menu | Ưu tiên | Trạng thái |
|---|---|---|---|---|
| 1 | `/` Tổng quan ngành | Tổng quan ngành | P1 | ✅ thẻ việc · ⬜ khối số liệu |
| 2 | `/van-hanh/nganh` | Taxonomy & Quy chuẩn | P1 — bỏ "Taxonomy" | 🟡 |
| 3 | `/van-hanh/truong-du-lieu` | Trường dữ liệu ngành | P2 | 🟡 |
| 4 | `/van-hanh/du-lieu` | Hoa hồng & Đối soát | P2 | 🟡 |
| 5 | `/landing-page` | Landing Page & Kênh bán | P2 | 🔎 rà nhanh: nhãn/jargon đã kiểm, bố cục chưa đổi |
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
- 31/10: Khách hàng — bộ lọc hạng dùng nhãn tiếng Việt (Vàng/Bạc/Đồng/Mới) thay mã GOLD/SILVER; bảng bo góc, ẩn cột phụ trên điện thoại, cuộn ngang. Ảnh gửi PO: `khach-hang-mobile-v2.png`.
- Cần PO quyết: thẻ hướng dẫn K1 của Khách hàng có chữ "CRM" và "Consent Engine" (đang khoá, chưa đổi).
- 31/10: Khách hàng — thẻ K1 đổi chữ theo PO (bỏ CRM, RFM, Consent Engine).
- 31/10: Sản phẩm (#3) — đầu trang (dòng phụ → (?)), lưới thẻ giãn `sm:gap-6`. Chưa làm: thẻ `ProductCard`, thanh bộ lọc, chế độ bảng.
- 31/10: Sản phẩm — thẻ `ProductCard` (bóng `shadow-sm`), hộp khoảng giá (bỏ dòng ví dụ, đưa vào (?)). Còn: chế độ bảng quản trị.
- 31/10: Tạo sản phẩm (#4) — đầu trang (dòng phụ → (?)); thẻ Định mức / Đặc điểm niêm yết / Nội dung AI: mô tả dài → (?) trên dòng tiêu đề, emoji ✨ → icon. Badge cam kết vẫn hiện.
- 31/10: Hội thoại (#5) — đầu trang: "AI Chat & Tư Vấn Bán Hàng" → "Tư vấn bán hàng", mô tả → (?); nhãn thẻ K1 "HƯỚNG DẪN AI CHAT ASSISTANT" → "HƯỚNG DẪN TƯ VẤN" (cần PO xác nhận đổi chuỗi trong thẻ K1). Chưa làm: khung 3 cột.
- 31/10: Báo cáo kinh doanh (#6) — thẻ số đo theo tính năng dùng `StatTile` (số to, chi phí credit trong (?)); K1 bỏ mã quyền "learning.profile.manage" và tiếng Anh "Tone of Voice / Brand Kit". Còn: đầu trang, bảng chi tiết, phần phân tích.
- 31/10: Thẻ chào (#7) — đầu trang: mô tả dài → (?) cạnh tiêu đề. K2 (TabActionHeader) giữ nguyên.
- 31/10: Rà nhanh StoreOS: nhãn/jargon/emoji của các trang P2–P3 đã kiểm (có 22 trang). Đổi bố cục từng trang vẫn cần làm. Sửa: Xu hướng thị trường — tiêu đề admin bỏ 'Tenant'.
- 31/10: Catalog (#8) — cảnh báo lỗi: emoji ⚠️ → icon. **Cần PO/kỹ thuật xem:** dữ liệu ứng viên bộ lọc ngân sách có giá trị mặc định cố định ("Đa sắc", "Thiết kế hiện đại", dịp Sinh nhật/Kỷ niệm/Khai trương) — không phải dữ liệu thật (OPERATING_PRINCIPLES §2).
- 31/10: Video (#10) — thẻ K1: bỏ mã 'M04c' và thuật ngữ kỹ thuật, viết tiếng Việt (cần PO xác nhận nội dung). Lint UX giảm 131→129 vi phạm, đã cập nhật baseline.
- 31/10: Phân tích ảnh (#11) — file 1.945 dòng, chỉ rà nhãn; cần đợt riêng và xác nhận PO vì có tải ảnh.
- 31/10: Tính giá (#13) — mô tả đầu trang → (?).
- 31/10: Kho ảnh & nội dung (#14) — mô tả đầu trang → (?).
- 31/10: Kho mẫu ấn phẩm (#15) — bỏ tiêu đề tiếng Anh 'Kho Templates', mô tả → (?).
- 31/10: Điều phối (#16) — mô tả đầu trang → (?).
- 31/10: Duyệt (#17) — tiêu đề đã ngắn. Giao hàng (#18) — 'Tiến trình Job của tôi' → 'Tiến trình của tôi'; PO quyết tên thống nhất với menu.
- 31/10: Mức dùng (#23), Cẩm nang tri thức (#25), Hồ sơ & cài đặt (#27) — tiêu đề và mô tả đã chỉnh.
- 31/10: Ma trận (#28): component chung `TierGovernanceMatrixClient` đưa mô tả vào (?); 5 trang rút tiêu đề (bỏ 'Ma Trận', chữ thường). Còn: `thong-bao` và bảng chi tiết.
- 31/10: Khả dụng (#20) — tiêu đề chữ thường, mô tả → (?).
- 31/10: Báo cáo kinh doanh (#6) — đầu trang: 'Analytics & Learning' → 'Báo cáo kinh doanh', bỏ mã 'MK-10' trên nút.

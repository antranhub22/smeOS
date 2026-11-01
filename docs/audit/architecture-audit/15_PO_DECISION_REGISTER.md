# 15 — Sổ quyết định của PO

> Ghi nhận quyết định PO ngày 01/11/2026 cho 45 câu hỏi ở phiên audit. Cột "Hệ quả" nói quyết định thay đổi gì trong `16_IMPLEMENTATION_PLAN.md`. Mục **Chấp nhận rủi ro** ghi các chỗ PO chọn khác đề xuất của audit, kèm biện pháp bù.

## 1. Quyết định

| Mã | Chủ đề | Quyết định | Hệ quả |
|---|---|---|---|
| D-01 | Tầng Ngành | **a** — chỉ là plugin mã; bỏ khỏi RBAC, thông báo, menu | Gỡ `INDUSTRY` khỏi khoá thông báo, sự kiện `industry_admin`, `nav-industry`, xem trước tầng; giữ khoá tích hợp theo `industry:<key>` do Mẹ đặt |
| D-02 | Chuỗi → Cửa hàng | **c** — chi nhánh của chuỗi là dòng trong tổ chức chuỗi (phạm vi BRANCH); nhượng quyền/gia công là tenant riêng; một hàm tra cứu chung | `resolveTierChain`; thống nhất thực thể chi nhánh |
| D-03 | Đối tác nhiều chuỗi | **b** — cho phép, có chuỗi chính | Cột `is_primary` + ràng buộc một chuỗi chính ACTIVE |
| D-04 | Phạm vi chi nhánh | **a** — mọi mô-đun có dữ liệu chi nhánh, theo đợt | Phạm vi quyền vào `TenantContext`, lọc ở repository |
| D-05 | Từ vựng vai | **a** — khuôn UX suy từ (tầng, mã quyền) | Bỏ so khoá vai trong UI |
| D-06 | Vai CSKH / QL sản phẩm | **b** — giữ hai vai, đổi nhãn; PO cung cấp danh sách quyền | Cần đầu vào I-1 |
| D-07 | Gói mặc định | **c** — tổ chức hiện có giữ `PRO`, tổ chức mới `STARTER` | Migration gán `credit_plan='PRO'` cho tổ chức đang có |
| D-08 | Bảng gói ↔ tính năng | **a** — giữ `PLAN_FEATURES` hiện tại | Ánh xạ route ↔ `featureKey` theo bảng hiện có |
| D-09 | Điểm chặn gói | **b** — API + giao diện ẩn/gợi ý nâng cấp | Dùng mẫu UX P11 (entitlement gate) |
| D-10 | Thanh toán đơn | **a** — chỉ chuyển khoản qua SePay; cổng thanh toán để sau | SePay thành đầu nối Hub |
| D-11 | Thu phí thuê bao | **c** — thủ công trước (nạp credit qua console), tự động sau | v1: sổ nạp tiền + phiếu thu; tự động ngoài phạm vi v1 |
| D-12 | Tỷ giá | **1 credit = 1.000 VND, làm tròn** | Hằng `VND_PER_CREDIT = 1000`; chiều làm tròn — giả định A-1 |
| D-13 | Staging | **c** — không có staging | Chấp nhận rủi ro R-1 |
| D-14 | Chặn deploy | **a** — tắt `autoDeploy`, deploy hook khi CI xanh | Sửa `render.yaml` + bước cuối CI |
| D-15 | Migration lúc deploy | **a** — pre-deploy có sao lưu; production chỉ seed hệ thống | Tách `db:seed` hệ thống |
| D-16 | RPO/RTO | **b** — PITR, RPO vài phút, RTO 1 giờ | Nâng gói CSDL có PITR (chi phí — I-8) |
| D-17 | Quy mô | **a** — 1 instance, chuẩn bị cho nhiều instance | Khoá phân tán cho lịch nền |
| D-18 | Theo dõi lỗi | **a** — Sentry + cảnh báo Render | Người nhận cảnh báo — I-5 |
| D-19 | CI đỏ | **a** — sửa thuật ngữ vi phạm; tách ratchet chạy song song | Sửa `ci.yml` |
| D-20 | Nghiên cứu thị trường | **b** — ẩn tới khi sẵn sàng | Tắt nav + API trả "chưa mở" |
| D-21 | Mật khẩu seed + CSDL | **Đã đổi** | ARC-002 đóng theo xác nhận PO |
| D-22 | Repo công khai | **a** — chuyển riêng tư | Việc tay của PO |
| D-23 | Cửa hậu `@dev.com`/cookie | **a** — gỡ hẳn | Sửa `resolve-platform-session.ts` + test |
| D-24 | Người vận hành | **b** — giữ một người | Chấp nhận rủi ro R-2 |
| D-25 | CSRF/CSP | **a** — kiểm Origin; CSP chặn sau 2 tuần ghi nhận | |
| D-26 | Pentest | **c** — không làm | Chấp nhận rủi ro R-3 |
| D-27 | Nghị định 13 | **a** — mức tối thiểu: đồng ý, hạn lưu, xuất/xoá | |
| D-28 | Hạn lưu | **3 tháng** | Xung đột tiềm ẩn với nghĩa vụ lưu chứng từ — I-2 |
| D-29 | Thay đổi lược đồ | **a** về nguyên tắc, xem từng PR | |
| D-30 | RLS | **b** — giai đoạn enterprise | Ngoài phạm vi v1 |
| D-31 | Thứ tự kênh Hub | Theo đề xuất: Zalo → SePay → eSMS → Telegram → Messenger → Email | |
| D-32 | Thẻ chào | **a** — giữ đóng băng; chỉ thay adapter mỏng nối Hub | Cập nhật `the-chao-freeze.test.ts` cho phép đúng các adapter đó (PR riêng, PO duyệt) |
| D-33 | Kênh SMS/Zalo/Web Push | **a** — hoàn thiện cả ba | Web Push cần khoá VAPID, service worker, bảng đăng ký |
| D-34 | AI ở worker | **a** — worker đọc chính sách AI chung từ CSDL | |
| D-35 | Khoá công cụ API dùng chung | Theo đề xuất: không khoá API dùng chung; công cụ khác khoá cả API | |
| D-36 | Phạm vi repo | **a** — chỉ `smeOS`; kiểm tra bỏ LocalBudd, SocialFlow | Kết quả ở §3: **LocalBudd bỏ được; SocialFlow chưa** → câu hỏi mới D-46 |
| D-37 | `floraos-core` | **a** — archive | Việc tay của PO, sau khi xác nhận Render deploy từ `smeOS` |
| D-38 | Chủ Landing/Catalog/QR | **a** — core (`smeOS`) | Đã đúng trong mã (§3) |
| D-39 | SSO liên-app | Theo D-36 | Gỡ khi cả hai app ngừng (phụ thuộc D-46) |
| D-40 | Khách đầu tiên | **c** — cả cửa hàng lẫn chuỗi | Workstream 4 tầng thuộc đường găng |
| D-41 | Bàn giao | **c** — mã nguồn + toàn bộ tài liệu | Rà tài liệu trước khi giao; câu hỏi tệp agent — I-4 |
| D-42 | Cách giao agent | Theo đề xuất: GĐ0–1 mỗi hạng mục một PR; sau đó mỗi nhóm một PR | |
| D-43 | Sửa lỗi có sẵn | **a** — trong hạng mục riêng | Hạng mục P0-07 |
| D-44 | Ngôn ngữ | **a** — chỉ tiếng Việt | i18n ngoài đường găng |
| D-45 | Chuẩn mã cũ | Theo đề xuất: Screen Contract cho trang mới/được sửa; tách tệp khi chạm vào | Thêm test bắt buộc |

## 2. Chấp nhận rủi ro (PO chọn khác đề xuất)

| Mã | Rủi ro chấp nhận | Biện pháp bù trong kế hoạch |
|---|---|---|
| R-1 (D-13) | Không có staging → mỗi bản phát hành chạy lần đầu trên production | Chỉ deploy khi CI xanh (P0-02); sao lưu trước migration (P1-01); migration expand → contract; cờ tính năng cho thay đổi lớn; smoke test tự động sau deploy (P1-03); diễn tập khôi phục trên CSDL tạm (P1-02); E2E chạy trên bản build production trong CI (đã có) |
| R-2 (D-24) | Một người vận hành giữ mọi mã N | Cảnh báo khi có thao tác nhạy cảm (`N3` nạp credit, `N7` tạo tổ chức, `N14` legal hold) gửi qua email; hướng dẫn cấp người thay thế bằng script khi cần (runbook) |
| R-3 (D-26) | Không kiểm thử xâm nhập | Tự rà theo OWASP ASVS mức 2 (P3-06); CodeQL + gitleaks + npm audit giữ bắt buộc; công bố trong hồ sơ bàn giao là chưa pentest |

## 3. Kết quả kiểm tra D-36: quan hệ `smeOS` ↔ LocalBudd, SocialFlow

### 3.1 LocalBudd — **bỏ được**
- `localbudd` (commit cuối `9b55cb9`, 09/09/2026, 131 tệp) là app độc lập: có `users`/`sessions` riêng, 17 bảng (projects, pages, page_versions, layouts, design_*, generation_jobs, qa_results, publish_records…), **không gọi `smeOS`**.
- `smeOS` đã có đủ chức năng tương đương: soạn landing (`modules/landing-page` + `content-engine/landing-generate`), xuất bản thành trang `/c/[slug]` qua `catalog-links` (Screen Contract `landing-page.md`), catalog/QR, content engine.
- `smeOS` không có giao diện nào gọi proxy `client=LOCALBUDD`. Phần còn sót chỉ là mã chờ LocalBudd làm client: tiền tố proxy `LOCALBUDD`, client token `LOCALBUDD`, `integration/business-profile` (bắt buộc client LocalBudd), script `dev:all`.
- Chưa kiểm chứng: LocalBudd có đang chạy ở đâu (có `vercel.json`) và còn dữ liệu khách thật không → xuất dữ liệu trước khi archive (hạng mục P2-G2).

### 3.2 SocialFlow — **chưa bỏ được**
Content engine đã chuyển về `smeOS` (P27: `/noi-dung` gọi thẳng `content-engine`). Nhưng **đăng bài tự động chưa được chép về**: `smeOS` không có bảng bài đăng, không có bản cài `PublisherProvider`, không có mã gọi API đăng bài của Facebook/Instagram/Zalo. Các chức năng sau vẫn gọi SocialFlow qua proxy:

| Chức năng | Mã trong `smeOS` | Endpoint SocialFlow |
|---|---|---|
| Lịch đăng: danh sách, lên lịch hàng loạt, đăng, thử lại | `src/app/(app)/lich-dang/page.tsx` | `api/m07/posts`, `.../batch-schedule`, `.../publish`, `.../retry`, `api/posts/.../publish` |
| Kết nối tài khoản mạng xã hội (gửi **tên đăng nhập + mật khẩu** tài khoản MXH sang SocialFlow) | `components/channel-connections/use-channel-accounts.ts`, trang `/ket-noi` | `api/accounts` |
| Danh sách bài trên trang chủ Marketing | `components/dashboard/marketing-workspace.tsx` | `api/m07/posts` |
| Chặng 10 hành trình sáng tạo: gắn mã bài đã đăng | `creative-production` (stage-10-launch) | mã bài SocialFlow |

`render.yaml` không khai `SOCIALFLOW_URL` → trên production các chức năng trên **đang lỗi** (proxy trả "chưa được cấu hình").

## 4. Câu hỏi mới và đầu vào còn thiếu

| Mã | Câu hỏi | Phương án | Đề xuất |
|---|---|---|---|
| **D-46** | Đăng bài mạng xã hội (đang phụ thuộc SocialFlow) | a) Xây đăng bài ngay trong `smeOS`: bảng bài đăng, lịch, đầu nối Hub cho Facebook Page/Instagram/Zalo OA, kết nối tài khoản bằng OAuth (không lưu mật khẩu) → sau đó bỏ SocialFlow · b) Giữ SocialFlow làm dịch vụ ngoài: triển khai, cấu hình URL, làm lại SSO · c) Bỏ tính năng đăng bài (ẩn Lịch đăng, phần MXH ở Kết nối) | ★ **a** nếu đăng bài là tính năng bán hàng; trong lúc chờ, **ẩn** các chức năng đang lỗi trên production |
| I-1 | Danh sách mã quyền mong muốn cho `product_manager`; nhãn mới cho `crm` và `customer_service` (D-06) | PO cung cấp | — |
| I-2 | "3 tháng" áp cho loại dữ liệu nào? Dữ liệu đơn hàng/chứng từ thường phải lưu lâu hơn theo pháp luật kế toán, thuế | a) 3 tháng cho log, thông báo, hội thoại, dữ liệu marketing; dữ liệu đơn hàng giữ theo nghĩa vụ pháp lý nhưng ẩn danh hoá thông tin cá nhân sau 3 tháng kể từ khi hoàn tất đơn · b) 3 tháng cho mọi dữ liệu | ★ **a**; nên hỏi ý kiến pháp lý |
| I-3 | Nội dung SLA: giờ hỗ trợ, thời gian phản hồi P1/P2/P3, kênh báo sự cố | PO cung cấp | — |
| I-4 | Tệp cấu hình agent (`CLAUDE.md`, `.agents/`, `.claude/`) có đi kèm bản giao không? | a) Không (giữ `export-ignore`) · b) Có | ★ **a** |
| I-5 | Ai nhận cảnh báo Sentry/Render? | Email/kênh | — |
| I-6 | Ngày mục tiêu sẵn sàng thương mại | Ngày | — |
| I-7 | Ngân sách hạ tầng: gói CSDL có PITR, pre-deploy, Sentry | Duyệt chi phí | — |
| A-1 | Giả định D-12: phí dùng làm tròn **lên** credit nguyên; nạp tiền làm tròn **xuống** credit nguyên, phần lẻ hiện trên phiếu thu | Xác nhận / sửa | — |

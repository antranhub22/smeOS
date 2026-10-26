# SMEOS 4-TIER ARCHITECTURE & NAVIGATION SSOT
## Đặc Tả Kiến Trúc 4 Tầng & Chuẩn Hóa Điều Hướng (Sidebar) Hệ Thống smeOS

> **Mã văn bản:** `DOC-ARCH-4TIER-NAV-001`  
> **Cấp thẩm quyền:** Level 2 — Architectural SSOT  
> **Ngày phê duyệt:** 26/10/2026  
> **Branch thực thi:** `Thietke_sidebar_ALL`  
> **Phạm vi áp dụng:** Toàn bộ hệ thống smeOS (`src/components/layout/`, `src/modules/organization/`, `src/app/`)

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG 4 TẦNG

Hệ sinh thái **smeOS** được cấu trúc thành **4 tầng độc lập nhưng cộng sinh chặt chẽ**, mỗi tầng giải quyết một bài toán kinh doanh và nhiệm vụ giá trị riêng biệt:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    🏛️ TẦNG 1: SAAS MOTHER                                       │
│                       (Hệ Điều Hành Quản Trị Tối Cao Nền Tảng Mẹ)                               │
│  - Quản trị toàn bộ 3 tầng dưới: SaaS Ngành, ChainOS, StoreOS                                   │
│  - Hạ tầng Cloud, Đa tenant, Cách ly dữ liệu (Tenant Isolation)                                 │
│  - Quản lý Gói cước SaaS (Plans & Subscriptions), Doanh thu nền tảng                            │
│  - Quản trị Cổng AI Providers, Model License (D18), Circuit Breaker & Quota                     │
└───────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                │ Quản lý & Phân quyền tổ chức
         ┌──────────────────────────────────────┴──────────────────────────────────────┐
         ▼                                                                            ▼
┌─────────────────────────────────────────────────┐       ┌─────────────────────────────────────────────────┐
│              🌐 TẦNG 2: SAAS NGÀNH              │       │               🔗 TẦNG 3: CHAINOS                │
│       (Hệ Sinh Thái Chuẩn Hóa & Mạng Lưới       │       │         (Chuỗi Thương Hiệu Đơn Ngành:           │
│        Bán Hàng Affiliate Tự Động Đa Đối Tác)   │       │         Bán Hàng Chuỗi + Điều Hành Mạng Lưới)   │
│  1. Bộ não Chuẩn hóa Ngành:                     │       │  1. Bán hàng Thương hiệu Chuỗi (HQ Sales):      │
│     - Taxonomy, Định lượng BOM Spec, Ngành mẫu  │       │     - Catalog Bộ sưu tập Chuỗi                  │
│     - Kho ấn phẩm A6, AI Studio Prompt Blueprints│      │     - Đơn khách đặt trực tiếp vào Chuỗi         │
│  2. Cỗ máy Bán hàng Affiliate Tự Động:          │       │     - CSKH & Marketing thương hiệu Chuỗi        │
│     - Phát hành Link bán (Landing Page, Catalog,│       │  2. Điều phối & Mạng lưới Chi nhánh / Xưởng:    │
│       Smart Greeting Card, Voucher)             │       │     - Tháp điều phối (Control Tower)            │
│     - Auto-Dispatch Engine: Tự động định tuyến  │       │     - Bắn đơn gia công (Subcontract Orders)     │
│       đơn về Cửa hàng/Đối tác tối ưu để gia công│       │     - Chat nội bộ & Duyệt chất lượng (QC)       │
│     - Tự động chia hoa hồng & Đối soát gia công │       │     - Đối soát công nợ chi nhánh / xưởng ngoài  │
└────────────────────────┬────────────────────────┘       └────────────────────────┬────────────────────────┘
                         │                                                         │
                         │ Bắn đơn gia công Affiliate                              │ Điều phối đơn gia công Chuỗi
                         └────────────────────────────┬────────────────────────────┘
                                                      ▼
                                  ┌─────────────────────────────────────────────────┐
                                  │               🏪 TẦNG 4: STOREOS                │
                                  │       (Hệ Điều Hành Toàn Diện Cho Cửa Hàng)     │
                                  │  1. Vận hành Kinh doanh Độc lập tại Tiệm:       │
                                  │     - Bán hàng tại chỗ (POS, Khách quen, CRM)   │
                                  │     - AI Studio chụp ảnh, tạo video, viết bài   │
                                  │     - Quản lý kho, khả dụng, tính giá lẻ        │
                                  │     - Sổ quỹ thu chi, giao vận nội thành        │
                                  │  2. Cổng Nhận Đơn Mạng Lưới (Branch Portal):    │
                                  │     - Tiếp nhận đơn rót về từ SaaS Ngành & Chuỗi│
                                  │     - Hàng đợi thợ chế tác (Production Queue)   │
                                  │     - In ấn phẩm A6 (Tag, Card, Menu, Warranty) │
                                  │     - Chụp ảnh nghiệm thu gửi khách / Tổng bộ   │
                                  └─────────────────────────────────────────────────┘
```

---

## 2. MA TRẬN PHÂN ĐỊNH BẢN CHẤT GIÁ TRỊ 4 TẦNG

| Tiêu chí | Tầng 1: SaaS Mother | Tầng 2: SaaS Ngành | Tầng 3: ChainOS | Tầng 4: StoreOS |
| :--- | :--- | :--- | :--- | :--- |
| **Bản chất nhiệm vụ** | Quản trị nền tảng SaaS & Cơ sở hạ tầng đám mây đa tổ chức. | Chuẩn hóa ngành hàng + Vận hành mạng lưới bán hàng Affiliate tự động xuyên cửa hàng. | Vận hành chuỗi thương hiệu đơn ngành: Bán hàng tập trung và Điều phối mạng lưới chi nhánh. | Vận hành toàn diện một điểm bán lẻ: Tự bán hàng tại chỗ + Nhận đơn gia công từ mạng lưới. |
| **Đối tượng sử dụng** | `platform_admin`, DevOps, Quản trị viên hệ thống. | `industry_admin`, Chuyên gia ngành, Giám đốc mạng lưới Affiliate. | `flower_network_admin`, `coordinator`, `ceo`, `manager`, `quality_control`. | `store_admin`, `sales`, `florist` (Thợ cắm/may/bếp), `crm`. |
| **Phạm vi ngành** | Đa ngành, bao trùm toàn hệ thống. | Đa ngành (Hệ sinh thái liên kết nhiều ngành hàng). | **Đơn ngành chuyên sâu** (Hoa tươi, Thời trang, F&B...). | **Đơn ngành** theo loại hình của cửa hàng. |
| **Câu hỏi trọng tâm** | *"Hạ tầng có ổn định, bảo mật và các tenant dùng đúng gói không?"* | *"Chiến dịch affiliate đang tạo bao nhiêu đơn và phân bổ về đâu?"* | *"Chuỗi bán được bao nhiêu đơn và các chi nhánh xử lý ra sao?"* | *"Hôm nay tiệm có bao nhiêu đơn, thợ làm kịp không và tiền về bao nhiêu?"* |
| **Đơn vị thao tác lõi** | Tenant, AI Model, Quota Token, Gói dịch vụ. | Link bán (Landing/Catalog/Card), Đơn Affiliate, Quy chuẩn BOM. | Đơn thương hiệu Chuỗi, Đơn gia công chi nhánh, Đối soát chuỗi. | Khách hàng lẻ, Đơn tại quầy, Đơn nhận từ mạng lưới, Phiếu thợ. |

---

## 3. DÒNG CHẢY ĐƠN HÀNG & DỮ LIỆU LIÊN TẦNG (CROSS-TIER ORDER FLOW)

### 3.1 Luồng 1 — Kênh Bán Hàng Affiliate Tự Động của SaaS Ngành:
```
[SaaS Ngành phát hành Link: Landing Page / Catalog / Thẻ chào / Mã QR]
                            │
                            ▼
      [Khách hàng truy cập link, chọn sản phẩm và đặt hàng]
                            │
                            ▼
     [Hệ thống SaaS Ngành ghi nhận đơn hàng mạng lưới]
                            │
                            ▼
  [AUTO-DISPATCH ENGINE: Quét vị trí khách, tồn kho & tay nghề các Store đối tác]
                            │
                            ▼
     [Bắn đơn gia công (Subcontract Order) về StoreOS gần nhất]
                            │
                            ▼
 [StoreOS: Hiện thông báo trên Telegram Card + Tab "Đơn nhận từ mạng lưới" (/cua-hang)]
                            │
                            ▼
      [Thợ tại StoreOS cắm hoa/may đo/làm món + In ấn phẩm A6]
                            │
                            ▼
   [StoreOS quét ảnh nghiệm thu thành phẩm -> Khách duyệt -> Giao hàng]
                            │
                            ▼
 [SaaS Ngành ghi nhận hoàn tất -> Tự động tính Hoa hồng Affiliate & Phí gia công]
```

### 3.2 Luồng 2 — Kênh Bán Hàng & Điều Phối của Chuỗi (ChainOS):
```
[Khách đặt hàng tại Kênh Chuỗi: Website HQ, Hotline, Fanpage Chuỗi]
                            │
                            ▼
 [ChainOS tiếp nhận đơn tại Trung tâm Bán hàng Chuỗi (/don-hang)]
                            │
                            ▼
 [Điều phối viên dùng Tháp Điều Phối (/dieu-phoi) bắn đơn về Chi nhánh phụ trách]
                            │
                            ▼
 [Chi nhánh (StoreOS) sản xuất -> Báo cáo tiến độ qua Living Dashboard Card]
                            │
                            ▼
 [Bộ phận QC Chuỗi duyệt ảnh thành phẩm (/duyet) trước khi giao cho khách]
                            │
                            ▼
 [Kế toán Chuỗi đối soát công nợ chi nhánh & phí gia công định kỳ (/du-lieu)]
```

### 3.3 Luồng 3 — Cửa hàng Cơ sở Tự Kinh Doanh (StoreOS):
```
[Khách vãng lai / Khách quen mua tại tiệm hoặc qua Chat Fanpage tiệm]
                            │
                            ▼
 [Nhân viên bán hàng tạo đơn trên StoreOS (/don-hang) hoặc gửi Thẻ chào (/the-chao)]
                            │
                            ▼
 [Đơn chuyển vào Hàng đợi chế tác -> Thợ xem công thức (BOM Recipe) làm hàng]
                            │
                            ▼
 [In ấn phẩm A6 tại chỗ (Tag giá, Thẻ chúc, Menu, Bảo hành) dán lên sản phẩm]
                            │
                            ▼
 [Bàn giao Shipper -> Thu tiền -> Tự động cập nhật Sổ quỹ thu chi (/so-lieu)]
```

---

## 4. CHI TIẾT CẤU TRÚC ĐIỀU HƯỚNG (SIDEBAR SPECIFICATION)

---

### 4.1 SIDEBAR TẦNG 1: SAAS MOTHER
- **Architecture Nametag:** `smeOS • SaaS Mother`
- **Màu sắc nhận diện:** Tím hoàng gia (`bg-[#6B21A8]` / `text-purple-700` / gradient strip `from-[#6B21A8]/15`)
- **Tuyến URL gốc:** `/van-hanh/*` (chế độ tổ chức `PLATFORM` hoặc role `platform_admin`)
- **Builder Code:** `src/components/layout/nav/nav-mother.ts` (`buildMotherNav`)

```yaml
nhom_1:
  key: "to-chuc"
  label: "Tổ chức & Khách hàng"
  entries:
    - label: "Tổng quan nền tảng"
      href: "/van-hanh"
      icon: "LayoutDashboard"
      navKey: "platform-overview"
      mo_ta: "Platform Journey Home (ChoiceGrid tác vụ toàn cục)"
    - label: "Đăng ký mới"
      href: "/van-hanh/dang-ky"
      icon: "UserPlus"
      navKey: "platform-registrations"
      mo_ta: "Phê duyệt hồ sơ đăng ký doanh nghiệp mới vào hệ thống"
    - label: "Danh sách tổ chức"
      href: "/van-hanh/to-chuc"
      icon: "Building2"
      navKey: "platform-organizations"
      mo_ta: "Quản trị danh sách tổ chức 3 tầng (Ngành, Chuỗi, Tiệm đơn lẻ)"
    - label: "Phê duyệt yêu cầu"
      href: "/van-hanh/phe-duyet"
      icon: "CheckCircle2"
      navKey: "platform-approvals"
      mo_ta: "Duyệt mở rộng hạn mức, quota, nâng cấp gói dịch vụ"

nhom_2:
  key: "cau-hinh"
  label: "Cấu hình nền tảng"
  entries:
    - label: "Ma trận ngành"
      href: "/van-hanh/nganh"
      icon: "Layers"
      navKey: "platform-industry-matrix"
      mo_ta: "Bật/tắt và quản trị plugin 7 ngành hàng chuẩn hóa"
    - label: "Trường dữ liệu"
      href: "/van-hanh/truong-du-lieu"
      icon: "SlidersHorizontal"
      navKey: "platform-custom-fields"
      mo_ta: "Cấu hình trường dữ liệu động mở rộng theo nhu cầu"
    - label: "Dữ liệu tổ chức"
      href: "/van-hanh/du-lieu"
      icon: "Database"
      navKey: "platform-org-data"
      mo_ta: "Tra cứu, sao lưu và kiểm tra phân lập CSDL đa tenant"

nhom_3:
  key: "giam-sat"
  label: "Vận hành & Giám sát"
  entries:
    - label: "Mức dùng & Chi phí"
      href: "/van-hanh/muc-dung"
      icon: "WalletCards"
      navKey: "platform-usage"
      mo_ta: "Giám sát Credit tiêu thụ, Token AI, Storage và doanh thu nền tảng"
    - label: "Sức khoẻ hệ thống"
      href: "/van-hanh/suc-khoe"
      icon: "Activity"
      navKey: "platform-health"
      mo_ta: "Trạng thái CSDL Postgres, Queue, Vision Worker, Media Worker, Video Worker"
    - label: "Nhật ký hệ thống"
      href: "/van-hanh/nhat-ky"
      icon: "ShieldCheck"
      navKey: "platform-audit"
      mo_ta: "Audit logs giám sát cách ly Tenant Isolation và an ninh hệ thống"
```

---

### 4.2 SIDEBAR TẦNG 2: SAAS NGÀNH
- **Architecture Nametag:** `smeOS • SaaS Đa Ngành`
- **Màu sắc nhận diện:** Xanh lục ngọc / Ngọc bích (`teal-600` / `teal-950`)
- **Tuyến URL:** Kết hợp `/(app)/*` và các console điều hành ngành (`buildIndustryNav`)
- **Quy chuẩn hiển thị:** 3 nhóm chức năng tinh gọn, tập trung chuẩn hóa taxonomy & cỗ máy affiliate phân bổ đơn

```yaml
nhom_1:
  key: "he-sinh-thai"
  label: "Hệ sinh thái Đa Ngành & Công cụ Affiliate"
  entries:
    - label: "Tổng quan SaaS Ngành"
      href: "/"
      icon: "LayoutDashboard"
      navKey: "industry-overview"
      mo_ta: "Báo cáo tổng hợp số lượng tenant, lưu lượng affiliate và tổng đơn phân bổ"
    - label: "Ma trận & Plugin Ngành"
      href: "/van-hanh/nganh"
      icon: "Layers"
      navKey: "industry-matrix"
      mo_ta: "Quản trị danh mục 7 ngành hàng và thông số IndustryPluginContract"
    - label: "Kho mẫu ấn phẩm A6"
      href: "/kho-templates"
      icon: "LayoutTemplate"
      navKey: "industry-templates"
      mo_ta: "Kho mẫu chuẩn hóa A6 (Tag giá, Menu, Thẻ bảo hành, Care Guide) cho ngành"
    - label: "Landing Page Sản phẩm"
      href: "/landing-page"
      icon: "Globe"
      navKey: "industry-landing"
      mo_ta: "Trang đích bán hàng chuyển đổi cao cho từng sản phẩm/chiến dịch ngành"
    - label: "Catalog Liên kết & QR"
      href: "/catalog"
      icon: "QrCode"
      navKey: "industry-catalog"
      capability: "J1"
      mo_ta: "Catalog điện tử phân phối cho đối tác affiliate chia sẻ và chốt đơn"
    - label: "Thẻ chào Bán hàng"
      href: "/the-chao"
      icon: "Sparkles"
      navKey: "industry-greeting-card"
      capability: "R1"
      mo_ta: "Công cụ chốt đơn tự động qua thẻ chào đa ngành số"

nhom_2:
  key: "chuan-hoa"
  label: "Chuẩn hóa, Định lượng & Điều phối"
  entries:
    - label: "Danh mục & Sản phẩm mẫu"
      href: "/san-pham"
      icon: "Package"
      navKey: "industry-products"
      capability: "L1"
      mo_ta: "Taxonomy chuẩn hóa và thư viện sản phẩm mẫu theo ngành"
    - label: "Trường dữ liệu mở rộng"
      href: "/van-hanh/truong-du-lieu"
      icon: "SlidersHorizontal"
      navKey: "industry-fields"
      mo_ta: "Cấu hình thuộc tính động (dynamic attributes) theo đặc thù ngành"
    - label: "Điều phối Đơn Tự động"
      href: "/dieu-phoi"
      icon: "Radio"
      navKey: "industry-dispatch"
      capability: "C23"
      mo_ta: "Thuật toán định tuyến đơn về tiệm tối ưu theo vị trí và năng lực gia công"
    - label: "Mạng lưới Shop Đối tác"
      href: "/dieu-phoi/doi-tac"
      icon: "Building2"
      navKey: "industry-partners"
      mo_ta: "Danh bạ các shop/xưởng liên kết sẵn sàng nhận gia công"
    - label: "Duyệt Chất lượng (QC)"
      href: "/duyet"
      icon: "CheckCircle2"
      navKey: "industry-approvals"
      capability: "H3"
      mo_ta: "Duyệt ảnh sản phẩm thực tế của thợ trước khi cho phép giao"

nhom_3:
  key: "thi-truong"
  label: "Thị trường, Báo cáo & Đối soát"
  entries:
    - label: "Trung tâm Đơn Mạng lưới"
      href: "/don-hang"
      icon: "ShoppingBag"
      navKey: "industry-orders"
      capability: "R1"
      mo_ta: "Quản lý toàn bộ đơn hàng phát sinh từ các link bán hàng affiliate"
    - label: "Thị trường & Xu hướng"
      href: "/market-intelligence"
      icon: "TrendingUp"
      navKey: "industry-market"
      capability: "V2"
      mo_ta: "Phân tích xu hướng tiêu dùng, các dịp kích cầu và thị hiếu ngành"
    - label: "Dữ liệu ngành & Đối soát"
      href: "/van-hanh/du-lieu"
      icon: "Database"
      navKey: "industry-data"
      mo_ta: "Bảng cân đối công nợ, hoa hồng liên kết và phí gia công mạng lưới"
```

---

### 4.3 SIDEBAR TẦNG 3: CHAINOS
- **Architecture Nametag:** `smeOS • ChainOS • [Ngành]`
- **Màu sắc nhận diện:** Xanh da trời sâu (`sky-600` / `sky-950`)
- **Tuyến URL:** `/(app)/*` (chế độ tổ chức `CHAIN` hoặc `FLOWER_NETWORK` qua `buildChainNav`)
- **Quy chuẩn độ dài nhãn nhóm (Strict Label Length):** Tất cả 6 tiêu đề nhóm được chuẩn hóa nghiêm ngặt từ 17–21 ký tự để đảm bảo **100% hiển thị trên 1 dòng duy nhất**, triệt tiêu hoàn toàn hiện tượng rớt dòng (wrapping) trên sidebar chuẩn 240px.
- **Loại bỏ phân mảnh `viec-chinh`:** Tầng Chuỗi vận hành theo mô hình trung tâm chỉ huy mạng lưới (HQ Central Command), không phân mảnh nhóm theo vai trò để đảm bảo tính trực quan và đồng bộ trong toàn bộ ban điều phối chuỗi.

```yaml
nhom_1:
  key: "chi-huy-chuoi"
  label: "Trung tâm Chỉ huy" # 17 ký tự
  entries:
    - label: "Chỉ huy Mạng lưới"
      href: "/"
      icon: "LayoutDashboard"
      navKey: "chain-command"
      mo_ta: "Network Command Center: tình hình đơn và vận hành toàn hệ thống mạng lưới"
    - label: "Báo cáo Hợp nhất"
      href: "/so-lieu"
      icon: "BarChart3"
      navKey: "chain-stats"
      capability: "U3"
      mo_ta: "Doanh thu hợp nhất chuỗi, so sánh hiệu suất giữa các chi nhánh và xưởng vệ tinh"

nhom_2:
  key: "ban-hang-chuoi"
  label: "Bán hàng Thương hiệu" # 20 ký tự
  entries:
    - label: "Đơn hàng Trực tiếp"
      href: "/don-hang"
      icon: "ShoppingBag"
      navKey: "chain-orders"
      capability: "R1"
      mo_ta: "Toàn bộ đơn khách đặt trực tiếp qua Hotline, Fanpage và Website thương hiệu Chuỗi"
    - label: "Catalog Thương hiệu"
      href: "/catalog"
      icon: "Globe"
      navKey: "chain-catalog"
      capability: "J1"
      mo_ta: "Catalog điện tử phân phối cho các đối tác affiliate chia sẻ và chốt đơn"
    - label: "Khách hàng Thân thiết"
      href: "/khach-hang"
      icon: "Users"
      navKey: "chain-customers"
      capability: "Q1"
      mo_ta: "Cơ sở dữ liệu khách hàng CRM tập trung của toàn chuỗi"
    - label: "Hộp thư CSKH"
      href: "/hoi-thoai"
      icon: "Bot"
      navKey: "chain-chat"
      capability: "T1"
      mo_ta: "Hộp thư tiếp nhận tư vấn và CSKH đa kênh tập trung"

nhom_3:
  key: "dieu-phoi-gia-cong"
  label: "Điều phối & Gia công" # 20 ký tự
  entries:
    - label: "Tháp Điều phối Đơn"
      href: "/dieu-phoi"
      icon: "Radio"
      navKey: "chain-coordinator"
      capability: "C23"
      mo_ta: "Phân bổ đơn về chi nhánh và xưởng vệ tinh tối ưu thời gian và chi phí"
    - label: "Duyệt Chất lượng (QC)"
      href: "/duyet"
      icon: "CheckCircle2"
      navKey: "chain-qc"
      capability: "H3"
      mo_ta: "Nghiệm thu ảnh thành phẩm chi nhánh gửi lên trước khi giao cho khách hàng"
    - label: "Chat Điều hành Nội bộ"
      href: "/tin-nhan"
      icon: "MessageSquare"
      navKey: "chain-internal-chat"
      mo_ta: "Kênh chat tức thì giữa Điều phối Chuỗi và Quản lý các chi nhánh/xưởng"

nhom_4:
  key: "mang-luoi-chi-nhanh"
  label: "Chi nhánh & Xưởng" # 17 ký tự (chuẩn hóa thay cho Mạng lưới Chi nhánh & Xưởng)
  entries:
    - label: "Danh bạ Chi nhánh & Xưởng"
      href: "/dieu-phoi/doi-tac"
      icon: "Store"
      navKey: "chain-branches"
      mo_ta: "Quản lý hồ sơ, địa chỉ, năng lực và liên hệ của các chi nhánh thành viên"
    - label: "Khả dụng & Tồn kho"
      href: "/san-pham/kha-dung"
      icon: "CalendarCheck"
      navKey: "chain-availability"
      capability: "L1"
      mo_ta: "Giám sát năng lực đáp ứng, ca thợ và tồn kho nguyên liệu các chi nhánh"
    - label: "Mã Kết nối & Định danh"
      href: "/noi-bo/ket-noi"
      icon: "BadgeCheck"
      navKey: "chain-identity"
      mo_ta: "Quản lý mã kết nối nội bộ giữa Chuỗi và Cửa hàng thành viên"

nhom_5:
  key: "bo-suu-tap-chuoi"
  label: "Bộ sưu tập & Bảng giá" # 21 ký tự
  entries:
    - label: "Bộ sưu tập Chuỗi"
      href: "/san-pham"
      icon: "Tag"
      navKey: "chain-collections"
      capability: "L1"
      mo_ta: "Quản lý Chain Collections phân bổ danh mục mẫu cho toàn hệ thống"
    - label: "Bảng giá & Chiết khấu"
      href: "/gia"
      icon: "WalletCards"
      navKey: "chain-pricing"
      capability: "L6"
      mo_ta: "Khung giá niêm yết và chính sách chiết khấu/hoa hồng cho chi nhánh"
    - label: "Studio Chiến dịch AI"
      href: "/creative-studio"
      icon: "Sparkles"
      navKey: "chain-studio"
      capability: "I1"
      mo_ta: "Sản xuất bộ ảnh và video tiếp thị đồng bộ cho chiến dịch toàn chuỗi"

nhom_6:
  key: "doi-soat-chuoi"
  label: "Đối soát & Tài chính" # 20 ký tự
  entries:
    - label: "Dữ liệu & Đối soát"
      href: "/du-lieu"
      icon: "Database"
      navKey: "chain-clearing"
      mo_ta: "Bảng công nợ gia công và phân chia doanh thu với các chi nhánh"
    - label: "Chính sách & Cài đặt"
      href: "/cai-dat"
      icon: "Settings2"
      navKey: "chain-settings"
      capability: "F1"
      mo_ta: "Cài đặt phí gia công, hạn mức công nợ và chính sách thanh toán chuỗi"
```

---

### 4.4 SIDEBAR TẦNG 4: STOREOS
- **Architecture Nametag:** `smeOS • StoreOS • [Ngành]`
- **Màu sắc nhận diện:** Xanh ngọc lục bảo (`emerald-600` / `emerald-950`)
- **Tuyến URL:** `/(app)/*` (chế độ tổ chức `SINGLE` qua `buildStoreNav`)
- **Đặc tính đa ngành động (Industry Adaptation):** Nhãn mục tự động điều chỉnh theo `IndustryPluginContract` (ví dụ `terms.createButtonLabel`, `terms.scanButtonLabel`, `terms.catalogTitle`, khả dụng nguyên liệu vs lịch phòng Homestay vs lịch bàn F&B vs lịch hẹn Dịch vụ).

```yaml
nhom_uu_tien: # Sinh động theo vai trò (Role UX)
  key: "viec-chinh"
  label: "⚡ Việc chính hôm nay"
  entries: "Ưu tiên theo roleKey (vd: thợ cắm thấy /cua-hang, /tai-anh, /kho-templates; sales thấy /hoi-thoai, /don-hang, /the-chao)"

nhom_1:
  key: "ban-hang"
  label: "Bán hàng & Khách"
  entries:
    - label: "Khách hàng"
      href: "/khach-hang"
      icon: "Users"
      navKey: "customers"
      capability: "Q1"
      mo_ta: "Quản lý hồ sơ khách hàng, phân loại VIP/thường, lịch sử mua sắm"
    - label: "Đơn hàng"
      href: "/don-hang"
      icon: "ShoppingBag"
      navKey: "orders"
      capability: "R1"
      mo_ta: "Quản lý đơn bán tại tiệm, đơn trực tiếp và tiến độ thanh toán"
    - label: "Hội thoại"
      href: "/hoi-thoai"
      icon: "Bot"
      navKey: "chat"
      capability: "T1"
      mo_ta: "Hộp thư tư vấn khách hàng đa kênh (Fanpage, Zalo, Web)"
    - label: "Catalog & QR"
      href: "/catalog"
      icon: "Globe"
      navKey: "catalog"
      capability: "J1"
      mo_ta: "Catalog sản phẩm trực tuyến của tiệm kèm mã QR chia sẻ"
    - label: "Thẻ chào sản phẩm" # Động theo ngành: "Thẻ chào & Bộ sưu tập..."
      href: "/the-chao"
      icon: "Sparkles"
      navKey: "greeting-card"
      capability: "R1"
      mo_ta: "Tạo link thẻ chào kèm báo giá gửi khách duyệt mẫu và đặt cọc"

nhom_2:
  key: "san-pham"
  label: "Sản phẩm"
  entries:
    - label: "Sản phẩm & Giá"
      href: "/san-pham"
      icon: "Tag"
      navKey: "products"
      capability: "L1"
      mo_ta: "Bảng danh mục sản phẩm, định lượng linh kiện và cơ cấu giá"
    - label: "Khả dụng & Lịch" # Động theo ngành: "Lịch phòng" (Homestay) / "Lịch bàn" (FNB)
      href: "/san-pham/kha-dung"
      icon: "CalendarCheck"
      navKey: "availability"
      capability: "L1"
      mo_ta: "Quản lý khả năng đáp ứng đơn, lịch thợ và tồn kho linh kiện"
    - label: "Tạo sản phẩm mới" # Động theo ngành (terms.createButtonLabel)
      href: "/san-pham/tao-moi"
      icon: "Sparkles"
      navKey: "create-product"
      capability: "L2"
      mo_ta: "Khởi tạo sản phẩm mới vào danh mục bán tại tiệm"
    - label: "Nhập từ Excel & Ảnh"
      href: "/san-pham/nhap-hang-loat"
      icon: "FileSpreadsheet"
      navKey: "bulk-import"
      capability: "L2"
      mo_ta: "Nhập dữ liệu sản phẩm hàng loạt từ file bảng tính Excel"
    - label: "Quét ảnh hoa" # Động theo ngành (terms.scanButtonLabel: Quét ảnh mẫu / Scan)
      href: "/tai-anh"
      icon: "Camera"
      navKey: "scan-photo"
      capability: "H1"
      mo_ta: "Trợ lý AI phân tích thành phần nguyên liệu từ ảnh chụp mẫu"
    - label: "Kho dữ liệu"
      href: "/kho-du-lieu"
      icon: "Folder"
      navKey: "storage"
      capability: "G1"
      mo_ta: "Kho lưu trữ tài nguyên ảnh, video và tư liệu của tiệm"
    - label: "Tính giá"
      href: "/gia"
      icon: "WalletCards"
      navKey: "pricing"
      capability: "L6"
      mo_ta: "Công cụ tính giá thành sản phẩm dựa trên công thức và biên lợi nhuận"

nhom_3:
  key: "noi-dung"
  label: "Nội dung & Tiếp thị"
  entries:
    - label: "Nghiên cứu thị trường"
      href: "/market-intelligence"
      icon: "TrendingUp"
      navKey: "market-intel"
      capability: "V2"
      mo_ta: "Radar xu hướng tiêu dùng và các dịp lễ hội kích cầu theo ngành"
    - label: "Creative Studio"
      href: "/creative-studio"
      icon: "Sparkles"
      navKey: "creative-studio"
      capability: "I1"
      mo_ta: "AI Studio nâng cấp ảnh chụp sản phẩm thành ảnh studio chuyên nghiệp"
    - label: "Ảnh marketing"
      href: "/creative-studio?tab=area-d"
      icon: "Wand2"
      navKey: "marketing-photo"
      capability: "I4"
      mo_ta: "Thư viện ảnh marketing ghép bối cảnh nghệ thuật"
    - label: "Video"
      href: "/video"
      icon: "Video"
      navKey: "video"
      capability: "I1"
      mo_ta: "Tạo video ngắn giới thiệu sản phẩm tự động từ ảnh chụp"
    - label: "Viết nội dung"
      href: "/noi-dung"
      icon: "FileText"
      navKey: "content"
      capability: "I1"
      mo_ta: "Trợ lý AI viết bài đăng mạng xã hội chuẩn văn phong thương hiệu tiệm"
    - label: "Lịch đăng"
      href: "/lich-dang"
      icon: "Share2"
      navKey: "schedule"
      capability: "I1"
      mo_ta: "Lên lịch tự động xuất bản nội dung lên các kênh mạng xã hội"
    - label: "Kho mẫu"
      href: "/kho-templates"
      icon: "LayoutTemplate"
      navKey: "templates"
      mo_ta: "Kho mẫu ấn phẩm A6 in ấn tại chỗ (Tag, Card, Menu, Warranty)"

nhom_4:
  key: "van-hanh"
  label: "Vận hành"
  entries:
    - label: "📥 Đơn Mạng Lưới & Chuỗi" # Cổng nhận gia công cốt lõi
      href: "/cua-hang"
      icon: "Inbox"
      navKey: "branch-portal"
      mo_ta: "Cổng nhận đơn gia công phân bổ từ SaaS Ngành và ChainOS"
    - label: "Hộp công cụ"
      href: "/cong-cu"
      icon: "LayoutGrid"
      navKey: "toolkit"
      mo_ta: "Tập hợp 48 công cụ tiện ích phục vụ vận hành hàng ngày"
    - label: "Điều phối"
      href: "/dieu-phoi"
      icon: "Radio"
      navKey: "coordinator"
      capability: "C23"
      mo_ta: "Xem bảng điều phối đơn hàng và trạng thái shipper"
    - label: "Tin nhắn nội bộ"
      href: "/tin-nhan"
      icon: "MessageSquare"
      navKey: "internal-chat"
      mo_ta: "Kênh trao đổi công việc nội bộ giữa nhân sự tiệm và điều phối chuỗi"
    - label: "Profile Kết Nối"
      href: "/noi-bo/ket-noi"
      icon: "BadgeCheck"
      navKey: "connect-identity"
      mo_ta: "Hồ sơ định danh nhận diện liên kết với mạng lưới chuỗi"
    - label: "Dữ liệu chuỗi"
      href: "/du-lieu"
      icon: "Database"
      navKey: "chain-data"
      mo_ta: "Số liệu đối soát công nợ gia công với chuỗi"
    - label: "Job"
      href: "/job"
      icon: "Clock"
      navKey: "jobs"
      capability: "G4"
      mo_ta: "Giám sát tiến độ các tác vụ xử lý nền (AI background jobs)"
    - label: "Hàng chờ duyệt"
      href: "/duyet"
      icon: "CheckCircle2"
      navKey: "approval"
      capability: "H3"
      mo_ta: "Duyệt chất lượng thành phẩm trước khi xuất kho giao khách"
    - label: "Số liệu"
      href: "/so-lieu"
      icon: "BarChart3"
      navKey: "stats"
      capability: "U3"
      mo_ta: "Báo cáo doanh thu, lợi nhuận và hiệu quả kinh doanh của tiệm"
    - label: "Mức dùng"
      href: "/muc-dung"
      icon: "WalletCards"
      navKey: "usage"
      capability: "G8"
      mo_ta: "Theo dõi số lượng token AI và tài nguyên đã tiêu thụ"
    - label: "Nhật ký kiểm toán"
      href: "/audit"
      icon: "ShieldCheck"
      navKey: "audit"
      capability: "G9"
      mo_ta: "Lịch sử thao tác hệ thống và kiểm toán an toàn dữ liệu"

nhom_5:
  key: "thiet-lap"
  label: "Thiết lập"
  entries:
    - label: "Tri thức"
      href: "/tri-thuc"
      icon: "BookOpen"
      navKey: "knowledge"
      mo_ta: "Cơ sở tri thức (Knowledge Base) phục vụ đào tạo trợ lý AI"
    - label: "Chính sách AI"
      href: "/cai-dat-ai"
      icon: "Cpu"
      navKey: "ai-policy"
      capability: "U1"
      mo_ta: "Cấu hình hành vi và ngưỡng duyệt an toàn của các mô hình AI"
    - label: "Kết nối kênh"
      href: "/ket-noi"
      icon: "Share2"
      navKey: "channels"
      mo_ta: "Thiết lập kết nối với Facebook Page, Zalo OA, Webhook"
    - label: "Bộ máy phân tích ảnh"
      href: "/bo-may"
      icon: "Cpu"
      navKey: "engine"
      capability: "H4"
      mo_ta: "Cấu hình tham số mô hình Vision nhận diện nguyên vật liệu"
    - label: "Hồ sơ & Cài đặt"
      href: "/cai-dat"
      icon: "Settings2"
      navKey: "settings"
      capability: "F1"
      mo_ta: "Thông tin cửa hàng, tài khoản ngân hàng, mã thanh toán cọc"
```

---

### 4.5 QUY CHUẨN THIẾT KẾ SIDEBAR ENTERPRISE GRADE & UX STANDARDS

Để đạt chuẩn Commercial & Enterprise Handover, toàn bộ 4 thanh sidebar tuân thủ nghiêm ngặt các quy chuẩn kỹ thuật và trải nghiệm người dùng sau:

1. **Header Thu nhỏ Tương tác Tinh xảo (Morphing Header & Hover Effect):**
   - Khi ở trạng thái thu nhỏ (`isCollapsed = true`), nút logo ở vị trí trung tâm (`36x36px`, `rounded-xl`) bình thường hiển thị biểu tượng ứng dụng (`Sparkles`).
   - Khi người dùng rê chuột (hover) vào nút, biểu tượng tự động chuyển hóa (morph) mượt mà thành icon mở rộng `PanelLeftOpen`, kèm tooltip định vị rõ `Mở thanh điều hướng (⌘B)`.
   - Toàn bộ vùng header ở trạng thái thu nhỏ cho phép click trực tiếp để bung sidebar ra, không gây ức chế người dùng.

2. **Khắc phục Triệt để Lỗi Tràn & Che khuất Menu Dropdown:**
   - Loại bỏ `overflow-hidden` tại container header `desktop-nav-header.tsx`, thay thế bằng `relative z-30` trên thanh điều hướng `desktop-nav.tsx`.
   - Dropdown chuyển đổi tầng kiến trúc (`ArchitectureNametag`) được bổ sung lớp backdrop trong suốt (`fixed inset-0 z-[9990]`) để xử lý click-away đóng bảng chọn an toàn, không bị lồng hay che khuất bởi các thành phần trang.

3. **Căn lề Trực quan & Chống vỡ Typography Nhóm:**
   - Căn chỉnh văn bản tiêu đề nhóm: Khắc phục thuộc tính mặc định của thẻ `<button>` bằng cách áp dụng `text-left truncate flex-1`, đảm bảo chữ luôn căn lề trái tuyệt đối, thẳng hàng với biểu tượng.
   - Loại bỏ viền xanh mặc định của trình duyệt: Thay thế bằng `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40` trang nhã, sắc nét.
   - Giữ icon mũi tên thu gọn `ChevronDown` có `shrink-0`, không bị co dúm khi tiêu đề nhóm dài.
   - Chuẩn hóa độ dài tiêu đề nhóm: Mọi nhãn nhóm trong ChainOS và các tầng khống chế trong khoảng 17–21 ký tự, hiển thị 1 dòng duy nhất, triệt tiêu hoàn toàn hiện tượng xuống dòng gây lệch giao diện.

4. **Trạng thái Mặc định Mở rộng (Expanded-by-Default Architecture):**
   - Thay vì mặc định đóng khiến thanh điều hướng trống trải, thuộc tính `isGroupExpanded` được đặt mặc định là `true` cho toàn bộ các nhóm trên tất cả các tầng.
   - LocalStorage key được nâng cấp lên `smeos_nav_groups_v2` và `smeos_nav_reports_open_v2` nhằm tự động xóa sạch các trạng thái đóng cũ bị lưu trong bộ nhớ trình duyệt người dùng, mang lại trải nghiệm đầy đủ tính năng ngay từ lần truy cập đầu tiên.

5. **Phím tắt Toàn cục Đẳng cấp (Keyboard Shortcuts):**
   - `⌘B` (macOS) hoặc `Ctrl+B` (Windows/Linux): Đóng/mở nhanh thanh điều hướng từ mọi màn hình.
   - `/`: Tiêu điểm nhanh vào ô tìm kiếm toàn cục.
   - `⌘K`: Mở Command Palette điều hướng nhanh theo chuẩn Linear / Stripe.

6. **Tuân thủ Tuyệt đối Giới hạn Đơn nhiệm SRP (File Size Limit < 350 lines):**
   - Tách toàn bộ logic hiển thị nhóm điều hướng ra component độc lập `src/components/layout/desktop-nav-group.tsx` (177 dòng).
   - Tệp chính `src/components/layout/desktop-nav.tsx` được rút gọn từ ~450 dòng xuống còn ~304 dòng, tuân thủ 100% Luật Kiến trúc số 3 và Anti-pattern A8 trong Hiến pháp phát triển.

---

## 5. MA TRẬN ÁNH XẠ VAI TRÒ (ROLE UX MATRIX)

Tùy theo kiến trúc của từng tầng, cơ chế điều hướng được tối ưu hóa như sau:
- **Tầng StoreOS (Cửa hàng cơ sở):** Tự động ghim nhóm **"⚡ VIỆC CHÍNH HÔM NAY"** lên đầu sidebar theo đúng vai trò thực tế (`useSession().roleUx`) để nhân viên vào ca thao tác ngay không cần tìm kiếm.
- **Tầng ChainOS & SaaS Mother/Ngành:** Duy trì cây điều hướng Trung tâm Chỉ huy hợp nhất (Unified Command Center) để đảm bảo toàn thể ban chỉ huy và điều phối viên có góc nhìn toàn cảnh về hệ sinh thái và mạng lưới chuỗi.

| Tầng | Vai trò (Role UX) | Danh mục ưu tiên thao tác |
| :--- | :--- | :--- |
| **SaaS Mother** | `platform_admin` | Chỉ huy Nền tảng (`/van-hanh`) · Đăng ký Mới (`/van-hanh/dang-ky`) · Mức dùng Token (`/van-hanh/muc-dung`) · Sức khỏe Server (`/van-hanh/suc-khoe`) |
| **SaaS Ngành** | `industry_admin` | Ma trận & Plugin Ngành (`/van-hanh/nganh`) · Landing Page (`/landing-page`) · Điều phối Đơn (`/dieu-phoi`) · Đối soát Affiliate (`/van-hanh/du-lieu`) |
| **ChainOS** | `flower_network_admin` / `chain_admin` | Chỉ huy Mạng lưới (`/`) · Đơn hàng Trực tiếp (`/don-hang`) · Tháp Điều phối (`/dieu-phoi`) · QC Duyệt chất lượng (`/duyet`) |
| | `coordinator` (Điều phối viên Chuỗi) | Tháp Điều phối (`/dieu-phoi`) · QC Duyệt chất lượng (`/duyet`) · Chat Nội bộ (`/tin-nhan`) · Danh bạ Chi nhánh (`/dieu-phoi/doi-tac`) |
| **StoreOS** | `store_admin` (Chủ tiệm / Quản lý) | Bàn làm việc (`/`) · **Đơn nhận từ Mạng lưới (`/cua-hang`)** · Đơn tiệm tự bán (`/don-hang`) · Khách CRM (`/khach-hang`) · Báo cáo (`/so-lieu`) |
| | `sales` (Nhân viên bán hàng) | Bàn làm việc (`/`) · Hội thoại đa kênh (`/hoi-thoai`) · Khách hàng (`/khach-hang`) · Đơn hàng (`/don-hang`) · Thẻ chào (`/the-chao`) |
| | `florist` (Thợ chế tác / Cắm / May) | **Đơn nhận từ Mạng lưới (`/cua-hang`)** · Quét ảnh nghiệm thu (`/tai-anh`) · In ấn phẩm A6 (`/kho-templates`) · Xem định lượng BOM (`/san-pham`) |
| | `marketing` (Nhân viên Marketing) | Creative Studio (`/creative-studio`) · Viết nội dung (`/noi-dung`) · Tạo video (`/video`) · Catalog QR (`/catalog`) |

---

## 6. TRẠNG THÁI TRIỂN KHAI & BÀN GIAO (IMPLEMENTATION & HANDOVER READINESS)

1. **Kiến trúc Dispatcher 4 Tầng độc lập (`src/components/layout/nav/`):**
   - `nav-mother.ts`: Cấu trúc 3 nhóm cho SaaS Mother (`to-chuc`, `cau-hinh`, `giam-sat`).
   - `nav-industry.ts`: Cấu trúc 3 nhóm cho SaaS Ngành (`he-sinh-thai`, `chuan-hoa`, `thi-truong`).
   - `nav-chain.ts`: Cấu trúc 6 nhóm cân đối 17–21 ký tự cho ChainOS (`chi-huy-chuoi`, `ban-hang-chuoi`, `dieu-phoi-gia-cong`, `mang-luoi-chi-nhanh`, `bo-suu-tap-chuoi`, `doi-soat-chuoi`).
   - `nav-store.ts`: Cấu trúc 5 nhóm đa ngành + `viec-chinh` cho StoreOS.
   - `index.ts`: Dispatcher định tuyến tự động theo `organizationType` và `roleKey`.
2. **Kiểm chuẩn Toàn diện & Regression Testing:**
   - **Unit Tests:** `22/22 tests passing` (`npx vitest run src/components/layout/`).
   - **Typecheck:** `0 errors` (`npx tsc --noEmit`).
   - **Tenant Isolation:** Bảo đảm cách ly dữ liệu và phân quyền theo mã năng lực `can(capability)`.
3. **Mức độ Sẵn sàng Tách Repo Độc lập:**
   - Cả 4 tầng đã được module hóa ranh giới hoàn toàn sạch sẽ, cho phép đóng gói thành các sản phẩm phần mềm SaaS độc lập hoặc triển khai chung dưới dạng Monorepo thống nhất.


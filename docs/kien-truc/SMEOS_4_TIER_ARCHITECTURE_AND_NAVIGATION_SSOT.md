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
- **Màu sắc nhận diện:** Tím hoàng gia (`purple-600` / `purple-950`)
- **Tuyến URL gốc:** `/van-hanh/*`

```yaml
nhom_1:
  key: "tong-quan-nen-tang"
  label: "Tổng quan Nền tảng"
  entries:
    - label: "Chỉ huy Nền tảng Mẹ"
      href: "/van-hanh"
      icon: "LayoutDashboard"
      mo_ta: "Platform Journey Home (ChoiceGrid 10 tác vụ toàn cục)"
    - label: "Sức khỏe Hệ thống & Workers"
      href: "/van-hanh/suc-khoe"
      icon: "Activity"
      mo_ta: "Trạng thái DB Postgres, Queue, Vision Worker, Media Worker, Video Worker"

nhom_2:
  key: "quan-tri-to-chuc"
  label: "Quản trị 3 Tầng Hệ thống"
  entries:
    - label: "Mạng lưới SaaS Ngành"
      href: "/van-hanh/to-chuc?tab=industry"
      icon: "Layers"
      mo_ta: "Quản trị các Hub Ngành liên kết"
    - label: "Danh sách Chuỗi (ChainOS)"
      href: "/van-hanh/to-chuc?tab=chain"
      icon: "Network"
      mo_ta: "Danh sách các tổ chức mô hình Chuỗi nhiều chi nhánh"
    - label: "Danh sách Cửa hàng (StoreOS)"
      href: "/van-hanh/to-chuc?tab=store"
      icon: "Store"
      mo_ta: "Danh sách các cửa hàng độc lập"
    - label: "Duyệt Đăng ký Mới"
      href: "/van-hanh/dang-ky"
      icon: "UserPlus"
      mo_ta: "Phê duyệt hồ sơ doanh nghiệp mới đăng ký vào hệ thống"
    - label: "Phê duyệt Yêu cầu Quota"
      href: "/van-hanh/phe-duyet"
      icon: "CheckCircle2"
      mo_ta: "Duyệt mở rộng hạn mức, nâng cấp gói tenant"

nhom_3:
  key: "goi-cuoc-doanh-thu"
  label: "Gói cước & Doanh thu SaaS"
  entries:
    - label: "Quản trị Gói Dịch vụ"
      href: "/van-hanh/goi-dich-vu"
      icon: "CreditCard"
      mo_ta: "Cấu hình tính năng & biểu phí các gói SaaS"
    - label: "Mức dùng & Doanh thu Nền tảng"
      href: "/van-hanh/muc-dung"
      icon: "WalletCards"
      mo_ta: "Giám sát Credit tiêu thụ, Token AI, Storage và doanh thu phí nền tảng"

nhom_4:
  key: "ha-tang-ai"
  label: "Hạ tầng AI & Tài nguyên"
  entries:
    - label: "Danh mục Mô hình & Giấy phép"
      href: "/van-hanh/ai-models"
      icon: "Cpu"
      mo_ta: "4 ô giấy phép bắt buộc (D18): license, commercial_use, territory, allowed_use"
    - label: "Cổng kết nối AI Providers"
      href: "/van-hanh/ai-gateways"
      icon: "Plug"
      mo_ta: "Quản trị API Keys: OpenAI, Gemini, Anthropic, Fal, Photoroom"
    - label: "Hạn mức Quota & Circuit Breaker"
      href: "/van-hanh/ai-quotas"
      icon: "Gauge"
      mo_ta: "Chống tràn chi phí và ngắt mạch tự động khi lỗi provider"

nhom_5:
  key: "bao-mat-kiem-toan"
  label: "Bảo mật & Kiểm toán"
  entries:
    - label: "Nhật ký Hệ thống (Audit Logs)"
      href: "/van-hanh/nhat-ky"
      icon: "ShieldCheck"
      mo_ta: "Giám sát cách ly Tenant Isolation, phát hiện bất thường an ninh"
    - label: "Phân quyền Người Vận hành"
      href: "/van-hanh/phan-quyen"
      icon: "Lock"
      mo_ta: "Danh sách Platform Operators và năng lực vận hành"
```

---

### 4.2 SIDEBAR TẦNG 2: SAAS NGÀNH
- **Architecture Nametag:** `smeOS • SaaS Đa Ngành`
- **Màu sắc nhận diện:** Xanh lục ngọc / Ngọc bích (`teal-600` / `teal-950`)
- **Tuyến URL:** Kết hợp `/(app)/*` và các console điều hành ngành

```yaml
nhom_1:
  key: "tong-quan-nganh"
  label: "Tổng quan & Dòng chảy Bán hàng"
  entries:
    - label: "Tổng quan Mạng lưới Ngành"
      href: "/"
      icon: "LayoutDashboard"
      mo_ta: "Báo cáo doanh số bán hàng affiliate và số lượng đơn phân bổ"
    - label: "Trung tâm Đơn hàng Mạng lưới"
      href: "/don-hang"
      icon: "ShoppingBag"
      mo_ta: "Quản lý toàn bộ đơn hàng phát sinh từ các link bán hàng"
    - label: "Ma trận Plugin Ngành (7 Ngành)"
      href: "/van-hanh/nganh"
      icon: "Layers"
      mo_ta: "Quản trị danh mục ngành và thông số plugin contract"

nhom_2:
  key: "cong-cu-affiliate"
  label: "Công cụ Bán hàng Affiliate"
  entries:
    - label: "Landing Page Sản phẩm"
      href: "/landing-page"
      icon: "Globe"
      mo_ta: "Trang đích bán hàng chuyển đổi cao cho từng sản phẩm/chiến dịch"
    - label: "Catalog Liên kết & QR"
      href: "/catalog"
      icon: "QrCode"
      mo_ta: "Catalog điện tử phân phối cho các đối tác affiliate chia sẻ"
    - label: "Thẻ chào Bán hàng (Greeting Card)"
      href: "/the-chao"
      icon: "Sparkles"
      mo_ta: "Công cụ tư vấn và chốt đơn tự động qua thẻ quà tặng số"
    - label: "Kho Mẫu Ấn phẩm & Chiến dịch"
      href: "/kho-templates"
      icon: "LayoutTemplate"
      mo_ta: "Mẫu A6, banner, tài liệu bán hàng cho đối tác"

nhom_3:
  key: "tu-dong-phan-bo"
  label: "Tự động Phân bổ & Gia công"
  entries:
    - label: "Điều phối Đơn Tự động"
      href: "/dieu-phoi"
      icon: "Radio"
      mo_ta: "Thuật toán định tuyến đơn về tiệm tối ưu theo vị trí và tồn kho"
    - label: "Mạng lưới Cửa hàng Đối tác"
      href: "/dieu-phoi/doi-tac"
      icon: "Building2"
      mo_ta: "Danh bạ các shop/xưởng liên kết sẵn sàng nhận gia công"
    - label: "Hàng chờ Duyệt Chất lượng (QC)"
      href: "/duyet"
      icon: "CheckCircle2"
      mo_ta: "Duyệt ảnh sản phẩm thực tế của thợ trước khi cho phép giao"

nhom_4:
  key: "chuan-hoa-nganh"
  label: "Bộ Quy chuẩn Ngành Hàng"
  entries:
    - label: "Danh mục Chuẩn & Sản phẩm Mẫu"
      href: "/san-pham"
      icon: "Package"
      mo_ta: "Taxonomy chuẩn hóa và thư viện sản phẩm mẫu"
    - label: "Công thức & Định lượng (BOM)"
      href: "/san-pham/dinh-luong-bom"
      icon: "FileSpreadsheet"
      mo_ta: "Quy chuẩn đơn vị đo lường và vai trò linh kiện vật tư"
    - label: "Quy chuẩn AI Studio Ngành"
      href: "/cai-dat-ai"
      icon: "Wand2"
      mo_ta: "Bối cảnh ảnh, góc máy thị giác và văn phong tiếp thị ngành"

nhom_5:
  key: "doi-soat-hoa-hong"
  label: "Đối soát & Hoa hồng Liên kết"
  entries:
    - label: "Đối soát Doanh thu & Phí Gia công"
      href: "/so-lieu/doi-soat"
      icon: "DollarSign"
      mo_ta: "Bảng cân đối hoa hồng affiliate và tiền công trả cho shop làm"
    - label: "Chính sách Phí Gia công (Craft Fee)"
      href: "/cai-dat/chinh-sach-tho"
      icon: "SlidersHorizontal"
      mo_ta: "Khung tính tiền công thợ chuẩn ngành theo độ khó và ngày lễ"
    - label: "Radar Xu hướng Thị trường"
      href: "/market-intelligence"
      icon: "TrendingUp"
      mo_ta: "Phân tích xu hướng tiêu dùng, dịp lễ kích cầu (Occasions)"
```

---

### 4.3 SIDEBAR TẦNG 3: CHAINOS
- **Architecture Nametag:** `smeOS • ChainOS • [Ngành]`
- **Màu sắc nhận diện:** Xanh da trời sâu (`sky-600` / `sky-950`)
- **Tuyến URL:** `/(app)/*` (chế độ tổ chức `CHAIN` hoặc `FLOWER_NETWORK`)

```yaml
nhom_1:
  key: "chi-huy-chuoi"
  label: "Trung tâm Chỉ huy Chuỗi"
  entries:
    - label: "Chỉ huy Chuỗi (Command Center)"
      href: "/"
      icon: "LayoutDashboard"
      mo_ta: "Network Command Center: tình hình đơn và vận hành toàn hệ thống"
    - label: "Báo cáo Hợp nhất Chuỗi"
      href: "/so-lieu"
      icon: "BarChart3"
      mo_ta: "Doanh thu tổng hợp, so sánh hiệu suất giữa các chi nhánh"

nhom_2:
  key: "ban-hang-chuoi"
  label: "Bán hàng Thương hiệu Chuỗi"
  entries:
    - label: "Đơn hàng Trực tiếp vào Chuỗi"
      href: "/don-hang"
      icon: "ShoppingBag"
      mo_ta: "Toàn bộ đơn khách đặt qua Hotline, Fanpage và Website thương hiệu Chuỗi"
    - label: "Catalog Bộ sưu tập Chuỗi"
      href: "/catalog"
      icon: "Globe"
      mo_ta: "Catalog chính thức của thương hiệu Chuỗi chia sẻ cho khách hàng"
    - label: "Khách hàng Thân thiết Chuỗi (CRM)"
      href: "/khach-hang"
      icon: "Users"
      mo_ta: "Quản lý dữ liệu khách hàng tập trung của toàn hệ thống"
    - label: "Hội thoại & CSKH Tập trung"
      href: "/hoi-thoai"
      icon: "Bot"
      mo_ta: "Hộp thư tiếp nhận tư vấn khách hàng tập trung của Chuỗi"

nhom_3:
  key: "dieu-phoi-gia-cong"
  label: "Điều phối Đơn & Gia công Chi nhánh"
  entries:
    - label: "Tháp Điều phối Đơn (Control Tower)"
      href: "/dieu-phoi"
      icon: "Radio"
      mo_ta: "Bắn đơn về các chi nhánh, xử lý rủi ro trễ hẹn SLA"
    - label: "Đơn Gia công từ Thẻ chào"
      href: "/dieu-phoi?tab=brochure"
      icon: "Sparkles"
      mo_ta: "Theo dõi tiến độ đơn gia công qua Live Dashboard Card Telegram"
    - label: "Duyệt Chất lượng Sản phẩm (QC)"
      href: "/duyet"
      icon: "CheckCircle2"
      mo_ta: "Duyệt ảnh thành phẩm chi nhánh gửi lên trước khi giao cho khách"
    - label: "Chat Điều hành Nội bộ Chuỗi"
      href: "/tin-nhan"
      icon: "MessageSquare"
      mo_ta: "Kênh chat tức thì giữa Điều phối Chuỗi và Quản lý các chi nhánh"

nhom_4:
  key: "mang-luoi-chi-nhanh"
  label: "Mạng lưới Chi nhánh & Xưởng"
  entries:
    - label: "Danh bạ Chi nhánh & Xưởng Ngoài"
      href: "/dieu-phoi/doi-tac"
      icon: "Store"
      mo_ta: "Quản lý danh sách điểm bán và xưởng gia công vệ tinh"
    - label: "Khả dụng & Tồn kho Mạng lưới"
      href: "/san-pham/kha-dung"
      icon: "CalendarCheck"
      mo_ta: "Giám sát năng lực đáp ứng và ca làm việc của từng chi nhánh"
    - label: "Mã Kết nối & Hồ sơ Định danh"
      href: "/noi-bo/ket-noi"
      icon: "BadgeCheck"
      mo_ta: "Quản lý mã kết nối nội bộ giữa Chuỗi và Cửa hàng thành viên"

nhom_5:
  key: "bo-suu-tap-chuoi"
  label: "Bộ sưu tập & Bảng giá Chuỗi"
  entries:
    - label: "Bộ sưu tập Chuỗi Phát hành"
      href: "/san-pham"
      icon: "Tag"
      mo_ta: "Quản lý Chain Collections phân bổ danh mục cho toàn chuỗi"
    - label: "Bảng giá Chuỗi & Chiết khấu"
      href: "/gia"
      icon: "WalletCards"
      mo_ta: "Khung giá niêm yết và tỷ lệ chiết khấu cho chi nhánh"
    - label: "Studio AI Chiến dịch Chuỗi"
      href: "/creative-studio"
      icon: "Sparkles"
      mo_ta: "Sản xuất bộ ảnh và video truyền thông đồng bộ cho toàn chuỗi"

nhom_6:
  key: "doi-soat-chuoi"
  label: "Đối soát & Tài chính Chuỗi"
  entries:
    - label: "Dữ liệu & Đối soát Công nợ Chuỗi"
      href: "/du-lieu"
      icon: "Database"
      mo_ta: "Bảng công nợ gia công và phân chia doanh thu với các chi nhánh"
    - label: "Chính sách Phí Gia công Chuỗi"
      href: "/cai-dat/phi-gia-cong"
      icon: "SlidersHorizontal"
      mo_ta: "Bảng phí trả thợ cắm/thợ may của chuỗi (6 phương án, bậc thợ)"
```

---

### 4.4 SIDEBAR TẦNG 4: STOREOS
- **Architecture Nametag:** `smeOS • StoreOS • [Ngành]`
- **Màu sắc nhận diện:** Xanh ngọc lục bảo (`emerald-600` / `emerald-950`)
- **Tuyến URL:** `/(app)/*` (chế độ tổ chức `SINGLE`)

```yaml
nhom_1:
  key: "viec-chinh-tiem"
  label: "Việc chính Hôm nay"
  entries:
    - label: "Bàn làm việc Cửa hàng"
      href: "/"
      icon: "Home"
      mo_ta: "Store Growth Center: Tình hình bán hàng và việc ưu tiên hôm nay"
    - label: "📥 Đơn nhận từ Mạng lưới & Chuỗi"
      href: "/cua-hang"
      icon: "Inbox"
      mo_ta: "Cổng nhận đơn gia công được rót về từ SaaS Ngành và ChainOS"
    - label: "Hộp Công cụ Kinh doanh (48 Tool)"
      href: "/cong-cu"
      icon: "LayoutGrid"
      mo_ta: "Bộ công cụ tăng trưởng doanh thu tiệm"

nhom_2:
  key: "ban-hang-tiem"
  label: "Bán hàng & Khách tại Tiệm"
  entries:
    - label: "Hội thoại Tư vấn Đa kênh"
      href: "/hoi-thoai"
      icon: "Bot"
      mo_ta: "Chat với khách từ Fanpage, Zalo, Website cửa hàng"
    - label: "Khách hàng & Dịp kỷ niệm (CRM)"
      href: "/khach-hang"
      icon: "Users"
      mo_ta: "Nhắc sinh nhật, ngày cưới, chăm sóc khách thân thiết của tiệm"
    - label: "Đơn hàng Tiệm Tự Bán"
      href: "/don-hang"
      icon: "ShoppingBag"
      mo_ta: "Quản lý đơn bán tại quầy và đơn khách quen đặt trực tiếp"
    - label: "Thẻ chào Bán hàng của Tiệm"
      href: "/the-chao"
      icon: "Sparkles"
      mo_ta: "Tạo link thẻ chào gửi khách chọn mẫu và chốt cọc nhanh"

nhom_3:
  key: "san-xuat-tiem"
  label: "Sản xuất & Chế tác tại Chỗ"
  entries:
    - label: "Quét ảnh & Nghiệm thu Sản phẩm"
      href: "/tai-anh"
      icon: "Camera"
      mo_ta: "Chụp ảnh thành phẩm gửi khách duyệt hoặc gửi Tổng bộ nghiệm thu"
    - label: "In Ấn phẩm A6 tại Chỗ"
      href: "/kho-templates"
      icon: "Printer"
      mo_ta: "In Tag giá, Thiệp chúc mừng, Menu, Thẻ bảo hành, Care Guide"

nhom_4:
  key: "san-pham-kho-tiem"
  label: "Sản phẩm & Kho Tiệm"
  entries:
    - label: "Sản phẩm & Công thức (BOM)"
      href: "/san-pham"
      icon: "Tag"
      mo_ta: "Danh mục sản phẩm bán tại quầy kèm công thức thành phần"
    - label: "Khả dụng & Lịch Thợ/Lịch Bàn"
      href: "/san-pham/kha-dung"
      icon: "CalendarCheck"
      mo_ta: "Cập nhật tồn kho nguyên liệu trong ngày và khả năng nhận đơn"
    - label: "Tạo Mới & Nhập Excel Hàng loạt"
      href: "/san-pham/nhap-hang-loat"
      icon: "FileSpreadsheet"
      mo_ta: "Thêm sản phẩm mới từ file Excel hoặc từ kho ảnh chụp"
    - label: "Bảng Tính Giá Vốn & Giá Lẻ"
      href: "/gia"
      icon: "WalletCards"
      mo_ta: "Tính giá thành theo nguyên vật liệu và biên lợi nhuận của tiệm"

nhom_5:
  key: "marketing-tiem"
  label: "Marketing & Studio tại Tiệm"
  entries:
    - label: "Creative Studio (AI Làm đẹp Ảnh)"
      href: "/creative-studio"
      icon: "Wand2"
      mo_ta: "Chụp ảnh thật tại tiệm -> AI tách nền, chỉnh sáng, tôn dáng sản phẩm"
    - label: "Tạo Video Ngắn Bán hàng"
      href: "/video"
      icon: "Video"
      mo_ta: "Sinh video ngắn tự động để đăng TikTok / Reels / Shorts"
    - label: "Viết Bài Tiếp thị Tự động"
      href: "/noi-dung"
      icon: "FileText"
      mo_ta: "Tạo nội dung bài viết bán hàng theo đúng văn phong tiệm"
    - label: "Catalog Tiệm & Mã QR Quầy"
      href: "/catalog"
      icon: "Globe"
      mo_ta: "Trang Catalog online của tiệm và mã QR in để bàn thu ngân"

nhom_6:
  key: "so-quy-cai-dat"
  label: "Sổ quỹ & Cài đặt Tiệm"
  entries:
    - label: "Báo cáo Doanh thu & Sổ quỹ"
      href: "/so-lieu"
      icon: "BarChart3"
      mo_ta: "Dòng tiền thu chi thực tế trong ngày của cửa hàng"
    - label: "Hồ sơ Tiệm & Kênh Kết nối"
      href: "/cai-dat"
      icon: "Settings2"
      mo_ta: "Cấu hình tài khoản ngân hàng, mã thanh toán cọc, mã ưu đãi"
```

---

## 5. MA TRẬN ÁNH XẠ VAI TRÒ (ROLE UX MATRIX)

Tùy theo vai trò của người dùng trong phiên làm việc (`useSession().roleUx`), hệ thống tự động ghim nhóm **"⚡ VIỆC CHÍNH HÔM NAY"** lên vị trí số 1 của sidebar để tối ưu năng suất làm việc:

| Tầng | Vai trò (Role UX) | Danh mục ưu tiên ghim lên đầu ("Việc chính") |
| :--- | :--- | :--- |
| **SaaS Mother** | `platform_admin` | Chỉ huy Nền tảng (`/van-hanh`) · Duyệt Đăng ký Mới (`/van-hanh/dang-ky`) · Mức dùng (`/van-hanh/muc-dung`) · Sức khỏe (`/van-hanh/suc-khoe`) |
| **SaaS Ngành** | `industry_admin` | Ma trận Ngành (`/van-hanh/nganh`) · Landing Page (`/landing-page`) · Điều phối Tự động (`/dieu-phoi`) · Đối soát Affiliate (`/so-lieu/doi-soat`) |
| **ChainOS** | `flower_network_admin` / `chain_admin` | Chỉ huy Chuỗi (`/`) · Đơn vào Chuỗi (`/don-hang`) · Tháp Điều phối (`/dieu-phoi`) · QC Duyệt chất lượng (`/duyet`) |
| | `coordinator` (Điều phối viên Chuỗi) | Tháp Điều phối (`/dieu-phoi`) · Đơn từ Thẻ chào (`/dieu-phoi?tab=brochure`) · Chat Nội bộ (`/tin-nhan`) · Bắn đơn gia công |
| **StoreOS** | `store_admin` (Chủ tiệm / Quản lý) | Bàn làm việc (`/`) · **Đơn nhận từ Mạng lưới (`/cua-hang`)** · Đơn tiệm tự bán (`/don-hang`) · Khách kỷ niệm (`/khach-hang`) · Sổ quỹ (`/so-lieu`) |
| | `sales` (Nhân viên bán hàng) | Bàn làm việc (`/`) · Hội thoại đa kênh (`/hoi-thoai`) · Khách hàng (`/khach-hang`) · Đơn hàng (`/don-hang`) · Thẻ chào (`/the-chao`) |
| | `florist` (Thợ chế tác / Cắm / May) | **Đơn nhận từ Mạng lưới (`/cua-hang`)** · Quét ảnh nghiệm thu (`/tai-anh`) · In ấn phẩm A6 (`/kho-templates`) · Xem công thức BOM |
| | `marketing` (Nhân viên Marketing) | Creative Studio (`/creative-studio`) · Viết nội dung (`/noi-dung`) · Tạo video (`/video`) · Catalog QR (`/catalog`) |

---

## 6. KẾ HOẠCH TRIỂN KHAI MÃ NGUỒN (TECHNICAL IMPLEMENTATION PLAN)

1. **Cập nhật `src/components/layout/nav-model.ts`**:
   - Tách hàm `buildNav()` thành 4 bộ builder chuyên biệt:
     - `buildMotherNav()`: Dành riêng cho `organizationType === "PLATFORM"` hoặc `roleKey === "platform_admin"`.
     - `buildIndustryNav()`: Dành riêng cho `organizationType === "INDUSTRY"` hoặc `roleKey === "industry_admin"`.
     - `buildChainNav()`: Dành riêng cho `organizationType === "CHAIN"` hoặc `organizationType === "FLOWER_NETWORK"`.
     - `buildStoreNav()`: Dành riêng cho `organizationType === "SINGLE"`.
   - Bổ sung các `navKey`, icon mapping và cập nhật các route link tương ứng.
2. **Cập nhật `src/components/layout/desktop-nav.tsx` & `mobile-nav-drawer.tsx`**:
   - Tích hợp `ArchitectureNametag` chuẩn hóa lên góc trên của thanh sidebar để người dùng luôn nhận biết mình đang đứng ở tầng nào.
   - Giữ nguyên cơ chế bảo mật năng lực `can(capability)` và tính năng lưu trạng thái đóng/mở nhóm qua `localStorage`.
3. **Cập nhật `src/lib/dev-role-override.ts`**:
   - Đảm bảo 4 preset tương ứng với 4 tầng cho phép chuyển đổi tức thì trong môi trường phát triển (Dev Mode).
4. **Kiểm chuẩn & Regression Testing**:
   - Chạy `npm run test:tenant` (Bắt buộc xanh 100% về cách ly tenant).
   - Kiểm tra hiển thị đa ngành (`FLORAL`, `FASHION`, `FNB`, `CRAFT_GIFT`, `SERVICES`...) để đảm bảo từ ngữ hiển thị động theo đúng quy chuẩn `IndustryPluginContract`.

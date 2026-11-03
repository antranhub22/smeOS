# DESIGN STYLE PROPOSAL — LỰA CHỌN PHONG CÁCH GIAO DIỆN CHUẨN (SMEOS)

> Được nghiên cứu và đối chiếu dựa trên dữ liệu chuẩn của **UI/UX Pro Max Skill** (`styles.csv`, `colors.csv`, `typography.csv`, `ux-guidelines.csv`) và đặc thù nghiệp vụ đa ngành của SMEOS.  
> Tài liệu trình duyệt **Phê duyệt Phong cách Chuẩn** trước khi chuyển sang Phase 2.

---

## 1. BỐI CẢNH VÀ ĐẶC THÙ NGHIỆP VỤ SMEOS

SMEOS là nền tảng SaaS phục vụ các doanh nghiệp vừa và nhỏ (SME) tại Việt Nam với 6 nhóm ngành trọng tâm:
1. **Hoa tươi (Florist)**
2. **Quà tặng & Thủ công mỹ nghệ (Craft & Gift)**
3. **Thời trang & Phụ kiện (Fashion & Boutique)**
4. **F&B (Nhà hàng, Quán cafe, Bánh ngọt)**
5. **Bán lẻ tổng hợp (General Retail)**
6. **Dịch vụ & Lưu trú (Services & Homestay)**

### Yêu cầu cốt lõi đối với phong cách UI:
- **Thẩm mỹ cao & Cảm xúc**: Sản phẩm hoa, quà tặng, thời trang đòi hỏi giao diện phải tôn vinh hình ảnh, ảnh studio đẹp mắt, màu sắc ấm cúng, sang trọng, không được khô cứng như các phần mềm ERP cũ.
- **Hiệu quả tác vụ & Rõ ràng**: Thợ cắm hoa, thu ngân, kế toán phải thao tác nhanh, nút bấm to rõ, bảng dữ liệu dễ đọc, không mỏi mắt khi làm việc 8-10 tiếng mỗi ngày.
- **Khả năng Đa ngành & Đa Preset**: Thiết kế nền tảng phải cho phép một cửa hàng thời trang cao cấp chuyển sang phong cách tối giản thanh lịch, hoặc một tiệm hoa chuyển sang phong cách ấm áp thủ công mà không cần đụng đến logic code.

---

## 2. ĐỀ XUẤT 3 PHƯƠNG ÁN PHONG CÁCH (TỪ UI/UX PRO MAX)

---

### PHƯƠNG ÁN 1: MỘC LAN ARTISAN HERITAGE (ORGANIC WARMTH & CRAFT BOUTIQUE)
*Được phát triển nâng cấp từ Bộ nhận diện Mộc Lan hiện tại kết hợp phong cách Nature Distilled & Organic Biophilic từ UI/UX Pro Max.*

#### 1. Triết lý thiết kế
- Lấy cảm hứng từ cánh hoa mộc lan ngà kem, mận chín, lá xanh sage và nhuỵ đồng mùa thu.
- Tôn vinh tính thủ công, sự chu đáo và ấm áp của các chủ tiệm SME. Mang lại cảm giác cao cấp, đáng tin cậy nhưng gần gũi, loại bỏ sự lạnh lùng của các phần mềm quản trị thông thường.

#### 2. Color Palette & Typography
- **Primary**: `#7A2E42` (Đỏ mận Mộc Lan — sang trọng, quyền quý, contrast 9.14:1 với trắng, đạt chuẩn WCAG AAA).
- **Secondary**: `#52643F` (Xanh Sage — tượng trưng cho lá cây, thiên nhiên, sự phát triển bền vững).
- **Accent**: `#C89B3C` (Vàng kim / Đồng ấm — tạo điểm nhấn cho các huy hiệu, bảo chứng, VIP).
- **Page Background**: `#FBF6F2` (Màu kem ngà ấm áp, dịu mắt, chống mỏi mắt tốt hơn màu trắng tinh).
- **Surface**: `#FFFFFF` (Card trắng nổi bật trên nền kem).
- **Border**: `#E7DCD0` (Viền ngăn cách màu bột ấm nhạt).
- **Text**: `#2A1E22` (Chữ than ấm, độ tương phản 14.97:1 đạt AAA).
- **Typography**: 
  - Font chính: **Be Vietnam Pro** (Hỗ trợ 100% tiếng Việt có dấu, nét chữ hiện đại, rõ ràng).
  - Font tiêu đề phụ / ấn phẩm: **Playfair Display** (Dùng cho in ấn thiệp chúc, catalogue nghệ thuật).

#### 3. Spacing, Radius, Border & Shadow
- **Radius**: Bo góc mềm mại, ấm cúng: `rounded-2xl` (16px) cho Cards, `rounded-xl` (12px) cho Buttons và Dialogs.
- **Border**: 1px viền thanh mảnh ấm áp `border-border` (`#E7DCD0`).
- **Shadow**: Đổ bóng mềm tỏa nhẹ: `box-shadow: 0 4px 20px -2px rgba(122, 46, 66, 0.05)`.

#### 4. Navigation & Layout
- Sidebar màu nền kem đồng nhất với trang, chia nhóm rành mạch với icon Lucide có màu khi kích hoạt.
- BottomNav mobile có nút chụp ảnh / tải ảnh nhô cao 52px màu đỏ mận mộc lan đặc trưng.

#### 5. Đánh giá:
- **Ưu điểm**: Đã có nền tảng token vững chắc trong hệ thống; tỷ lệ tương phản WCAG đã được kiểm chứng toán học; cực kỳ được lòng các chủ shop ngành hoa, thời trang, quà tặng, F&B.
- **Nhược điểm**: Một số doanh nghiệp bán lẻ tổng hợp kỹ thuật cao có thể cảm thấy phong cách này hơi nữ tính/ấm áp quá mức.
- **Chi phí chuyển đổi**: **Thấp nhất** (Hầu hết các màn hình cốt lõi đã đi theo hướng này, chỉ cần dọn dẹp các mã màu thô).

---

### PHƯƠNG ÁN 2: MODERN ENTERPRISE SLATE (CLEAN BENTO & HIGH-CONTRAST PRECISION)
*Dựa trên phong cách Bento Box Grid & Flat Design từ UI/UX Pro Max (chuẩn Linear / Stripe / Vercel).*

#### 1. Triết lý thiết kế
- Hiện đại, công nghệ, chính xác cao và tối ưu năng suất làm việc tối đa.
- Mọi chi tiết thừa thãi được lược bỏ; dữ liệu số, bảng biểu và biểu đồ được đưa lên hàng đầu.

#### 2. Color Palette & Typography
- **Primary**: `#2563EB` (Xanh công nghệ Trust Blue — đại diện cho sự tin cậy, dữ liệu chính xác).
- **Secondary**: `#475569` (Slate Cool Grey).
- **Accent**: `#EA580C` (Cam rực rỡ — tạo độ kích thích cho các hành động chốt đơn, gọi xe).
- **Page Background**: `#F8FAFC` (Xanh xám đá nhẹ, chuẩn SaaS toàn cầu).
- **Surface**: `#FFFFFF`.
- **Border**: `#E2E8F0` (Viền xám kim loại sắc nét).
- **Text**: `#0F172A` (Chữ đen than đá sâu, độ tương phản tuyệt đối).
- **Typography**: **Inter** hoặc **Be Vietnam Pro** (Weights: 400, 500, 600, 700).

#### 3. Spacing, Radius, Border & Shadow
- **Radius**: Bo góc vừa phải, sắc nét: `rounded-lg` (8px) cho Button/Card, `rounded-xl` (12px) cho Modal.
- **Border**: Viền 1px sắc gọn `border-slate-200`.
- **Shadow**: Đổ bóng tối giản: `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)`.

#### 4. Đánh giá:
- **Ưu điểm**: Rất phù hợp cho chuỗi bán lẻ, siêu thị mini, kho vận, logistics và quản trị tài chính. Độ sắc nét cao.
- **Nhược điểm**: Hơi khô cứng đối với các ngành hàng thủ công, thiếu sự ấm áp bản địa của văn hóa bán hàng quà tặng Việt Nam.
- **Chi phí chuyển đổi**: Trung bình.

---

### PHƯƠNG ÁN 3: MINIMAL PURE SWISS (FUNCTIONAL MONOLITH & TIMELESS CLARITY)
*Dựa trên phong cách Minimalism & Swiss Style từ UI/UX Pro Max.*

#### 1. Triết lý thiết kế
- "Less is more" — Tôn trọng triệt để không gian trắng (negative space). Không gian xung quanh đóng vai trò làm nổi bật chính sản phẩm của khách hàng.
- Không dùng bóng đổ phức tạp, không gradient màu mè.

#### 2. Color Palette & Typography
- **Primary**: `#18181B` (Đen tuyền Zinc 900 — phong cách Monolith tối giản đẳng cấp).
- **Secondary**: `#71717A` (Xám Zinc 500).
- **Accent**: `#059669` (Xanh ngọc lục bảo Emerald — mang lại hơi thở tươi mới tối giản).
- **Page Background**: `#FAFAFA` (Xám trắng tinh tế).
- **Surface**: `#FFFFFF`.
- **Border**: `#E4E4E7` (Đường kẻ viền mỏng như sợi tóc).
- **Typography**: **Be Vietnam Pro** (chú trọng typography scale với font-weight mạnh mẽ: 700 và 800 cho tiêu đề).

#### 3. Spacing, Radius, Border & Shadow
- **Radius**: Góc cạnh gần như phẳng: `rounded-sm` (2px - 4px) hoặc `rounded-none`.
- **Shadow**: Gần như không đổ bóng (`shadow-none` hoặc `shadow-xs`). Phân tách bằng đường viền thuần túy.

#### 4. Đánh giá:
- **Ưu điểm**: Tải trang cực nhanh, tối giản thời thượng (kiểu các thương hiệu thời trang thiết kế hoặc phòng tranh nghệ thuật).
- **Nhược điểm**: Độ tương phản thuần túy có thể hơi gắt đối với người dùng thao tác cả ngày; thiếu các trạng thái trực quan sinh động cho nhân sự phổ thông.
- **Chi phí chuyển đổi**: Cao hơn nếu áp dụng làm mặc định.

---

## 3. SO SÁNH MA TRẬN VÀ PHƯƠNG ÁN KHUYẾN NGHỊ

| Tiêu chí đánh giá | Phương án 1: Mộc Lan Artisan | Phương án 2: Enterprise Slate | Phương án 3: Minimal Swiss |
|---|:---:|:---:|:---:|
| **Phù hợp ngành cốt lõi (Hoa, Quà, Thời trang)** | ⭐⭐⭐⭐⭐ (Xuất sắc) | ⭐⭐⭐ (Khô cứng) | ⭐⭐⭐⭐ (Đẳng cấp nhưng lạnh) |
| **Độ thân thiện & ấm áp người dùng SME** | ⭐⭐⭐⭐⭐ (Rất cao) | ⭐⭐⭐ (Trung bình) | ⭐⭐ (Thấp) |
| **Tối ưu bảng dữ liệu & vận hành chuỗi** | ⭐⭐⭐⭐ (Rất tốt) | ⭐⭐⭐⭐⭐ (Xuất sắc) | ⭐⭐⭐⭐ (Tốt) |
| **Độ tương phản & Chuẩn WCAG 2.1 AA** | ⭐⭐⭐⭐⭐ (Đã đo đạt AAA) | ⭐⭐⭐⭐⭐ (Đạt AAA) | ⭐⭐⭐⭐⭐ (Đạt AAA) |
| **Tương thích hạ tầng code hiện tại** | ⭐⭐⭐⭐⭐ (Sẵn có 80%) | ⭐⭐⭐ (Cần đổi biến) | ⭐⭐⭐ (Cần đổi biến) |
| **Khả năng đóng gói thành Runtime Preset** | 100% | 100% | 100% |

---

## 4. PHƯƠNG ÁN ĐỀ XUẤT CHÍNH THỨC (RECOMMENDED STRATEGY)

> **CHỌN PHƯƠNG ÁN 1: MỘC LAN ARTISAN HERITAGE LÀM STYLE CHUẨN CỐT LÕI (DEFAULT OFFICIAL STYLE)**

### Lý do đề xuất:
1. **Phù hợp nhất với DNA sản phẩm SMEOS**: SMEOS sinh ra để trao quyền cho các doanh nghiệp vừa và nhỏ, nơi cái đẹp, sự tận tâm và sản phẩm thủ công là trái tim kinh doanh. Bảng màu ấm áp, bo góc mềm mại của Mộc Lan là vũ khí tạo cảm xúc độc bản mà các phần mềm quản trị nước ngoài hay KiotViet/Sapo không có được.
2. **Tiết kiệm nguồn lực & An toàn nhất**: Nền tảng token của Mộc Lan đã được tích hợp một phần lớn trong hệ thống. Việc chọn Mộc Lan làm chuẩn cho Phase 2 & Phase 3 sẽ giúp tiến độ chuẩn hóa diễn ra an toàn, triệt tiêu 965 lỗi UX Lint hiện hành mà không làm xáo trộn nhận thức của người dùng hiện tại.
3. **Mở đường hoàn hảo cho Phase 4**: Toàn bộ kiến trúc Design Token ở Phase 2 sẽ được thiết kế để **Phương án 2 (Enterprise Slate)** và **Phương án 3 (Minimal Swiss)** trở thành 2 Preset bổ sung trong Runtime UI Studio ở Phase 4. Người dùng chỉ cần 1 click là có thể đổi sang phong cách Enterprise Slate nếu muốn!

---

## 5. CÁC QUYẾT ĐỊNH CẦN NGƯỜI DÙNG PHÊ DUYỆT (APPROVAL GATE)

Trước khi chuyển sang **Phase 2: Xây dựng UI Foundation Architecture**, kính đề nghị Người dùng (PO) phê duyệt các điểm sau:

- [ ] **Quyết định 1**: Phê duyệt **Mộc Lan Artisan Heritage** làm Phong cách Chuẩn chính thức cho toàn bộ SMEOS ở Phase 2 & Phase 3.
- [ ] **Quyết định 2**: Đồng ý kế hoạch dọn dẹp các token shadcn cũ (`bg-background`, `text-foreground`, `border-input` trong 203 file) quy về Semantic Tokens của hệ thống.
- [ ] **Quyết định 3**: Đồng thuận đưa **Enterprise Slate** và **Minimal Swiss** thành 2 Preset bổ sung tại Phase 4 (Runtime UI System).
- [ ] **Quyết định 4**: Bổ sung cỡ nút `xs` (32px) và chuẩn hóa bảng dữ liệu để đáp ứng nhu cầu xem dữ liệu dày đặc của các vai trò Kế toán / Vận hành chuỗi.

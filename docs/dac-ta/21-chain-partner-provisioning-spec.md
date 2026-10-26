# ĐẶC TẢ KIẾN TRÚC & KẾ HOẠCH TRIỂN KHAI: MÔ HÌNH PHÂN CẤP CHUỖI & ĐỐI TÁC TRỰC THUỘC (CHAIN - PARTNER STORE ARCHITECTURE)
**Mã module:** `src/modules/chain-partnership/`  
**Phiên bản:** v1.0.0 (SSOT)  
**Ngày lập:** 25/10/2026  
**Trạng thái:** DRAFT / APPROVED FOR PLANNING

---

## 1. MỤC TIÊU & TẦM NHÌN KIẾN TRÚC (ARCHITECTURAL GOALS)

Hệ thống cần giải quyết bài toán cốt lõi:
1. **Tổng bộ Chuỗi (Chain HQ)** cần quản lý mạng lưới các **Cửa hàng chi nhánh / Đối tác gia công (Partner Stores / Subcontractors)**.
2. Cửa hàng/Đối tác trực thuộc **phải có tài khoản đăng nhập độc lập** (Tenant riêng dạng `organization_type: STORE`), có nhân sự riêng, kho riêng, nhưng **được gắn kết định danh với Chuỗi mẹ** (`chain_id`).
3. Sau khi kết nối, **Chuỗi mẹ có thể**:
   - Nhìn thấy danh bạ các đối tác trực thuộc (năng lực, vị trí, công suất, trạng thái).
   - Tự động mở luồng **Chat nội bộ 1-1** (đã dựng ở phân hệ `internal-chat`).
   - Bắn đơn điều phối/gia công thẳng vào chat để đối tác bấm "Nhận đơn", "Nộp ảnh thành phẩm", "Giao hàng".
   - Thu hồi quyền hoặc tạm ngưng hợp tác khi cần thiết.

---

## 2. MÔ HÌNH THỰC THỂ DỮ LIỆU PHÂN CẤP (DATA ENTITY SPEC)

Thay vì chỉ lưu danh sách tĩnh dạng text/JSON không có tài khoản, ta chuẩn hóa quan hệ giữa 2 Tenant trong CSDL:

```
┌──────────────────────────────────────────────┐
│             CHUỖI MẸ (CHAIN HQ)              │
│       organization_type = "CHAIN"            │
└──────────────────────┬───────────────────────┘
                       │ 1
                       │ Quan hệ đối tác (chain_partnerships)
                       │ n
┌──────────────────────▼───────────────────────┐
│     CỬA HÀNG ĐỐI TÁC (PARTNER STORE)         │
│       organization_type = "STORE"            │
│  - Có User đại diện (Founder/Store Admin)    │
│  - Có Không gian làm việc riêng (Workspace)  │
│  - Nhận đơn gia công & Chat trực tiếp        │
└──────────────────────────────────────────────┘
```

### 2.1 Bảng `chain_partnerships` (Liên kết Chuỗi - Cửa hàng)
```prisma
model chain_partnerships {
  id                    String    @id @default(uuid())
  chain_org_id          String    // ID của Chuỗi mẹ (organization_type = CHAIN)
  partner_org_id        String    // ID của Cửa hàng/Đối tác (organization_type = STORE)
  partner_code          String    // Mã đối tác trong chuỗi (vd: DT-HN-001)
  partnership_type      String    @default("SUBCONTRACTOR") // SUBCONTRACTOR (Gia công), FRANCHISE (Nhượng quyền), BRANCH (Chi nhánh trực thuộc)
  status                String    @default("ACTIVE") // PENDING, ACTIVE, SUSPENDED, TERMINATED
  commission_rate       Decimal?  @db.Decimal(5, 2) // Tỷ lệ chiết khấu/hoa hồng nếu có (%)
  capacity_daily        Int       @default(10) // Công suất tối đa đơn/ngày
  contact_name          String?
  contact_phone         String?
  contact_email         String?
  address               String?
  province              String?
  district              String?
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  chain_organization    organizations @relation("ChainPartnershipsAsChain", fields: [chain_org_id], references: [id], onDelete: Cascade)
  partner_organization  organizations @relation("ChainPartnershipsAsPartner", fields: [partner_org_id], references: [id], onDelete: Cascade)

  @@unique([chain_org_id, partner_org_id])
  @@index([chain_org_id, status])
  @@index([partner_org_id])
}
```

### 2.2 Bảng `chain_partner_invitations` (Thư mời gia nhập & Cấp tài khoản)
```prisma
model chain_partner_invitations {
  id              String    @id @default(uuid())
  chain_org_id    String
  email           String
  phone           String?
  store_name      String
  contact_name    String?
  invite_token    String    @unique
  status          String    @default("PENDING") // PENDING, ACCEPTED, EXPIRED, CANCELLED
  expires_at      DateTime
  created_at      DateTime  @default(now())

  chain_organization organizations @relation(fields: [chain_org_id], references: [id], onDelete: Cascade)

  @@index([chain_org_id, status])
  @@index([email])
}
```

---

## 3. LUỒNG NGHIỆP VỤ CẤP TÀI KHOẢN (ONBOARDING WORKFLOW)

Hỗ trợ 2 kịch bản vận hành thực tế:

### Kịch bản 1: Chuỗi chủ động cấp tài khoản cho Đối tác mới (Direct Provisioning)
1. Điều phối viên Chuỗi vào màn hình `/dieu-phoi/doi-tac` bấm **[+ Thêm đối tác & Cấp tài khoản]**.
2. Nhập: Tên cửa hàng, Người đại diện, Email, Số điện thoại, Địa chỉ/Khu vực, Mật khẩu tạm thời.
3. Server thực thi giao dịch transaction:
   - Tạo mới `organizations` (type = `STORE`, name = `<Tên cửa hàng>`).
   - Tạo mới `workspaces` cho cửa hàng đó.
   - Tạo mới `users` (nếu email chưa tồn tại) & liên kết `memberships` (role = `store_admin`).
   - Tạo bản ghi `chain_partnerships` liên kết Chuỗi mẹ ⟷ Cửa hàng mới.
   - Tự động kích hoạt phòng chat nội bộ `CHAIN_PARTNER` giữa Chuỗi mẹ và Cửa hàng.
4. Đối tác nhận tài khoản, đăng nhập webapp là thấy ngay giao diện Cửa hàng và kênh chat với Chuỗi.

### Kịch bản 2: Chuỗi gửi link mời Đối tác tự đăng ký (Self-Serve Invitation)
1. Chuỗi tạo mã mời / link mời: `https://smeos.app/gia-nhap-chuoi?token=...`
2. Đối tác truy cập link, điền thông tin cửa hàng và thiết lập mật khẩu đăng nhập.
3. Tài khoản được khởi tạo và tự động kết nối vào danh bạ Chuỗi.

---

## 4. GIAO DIỆN NGƯỜI DÙNG (UI/UX WORKSPACE)

1. **Dashboard Chuỗi (Chain HQ)**:
   - Mục điều hướng mới: **Quản lý Đối tác & Chi nhánh** (`/dieu-phoi/doi-tac`).
   - Bảng danh sách: Tên tiệm, Mã đối tác, Phân loại (Gia công / Nhượng quyền / Chi nhánh), Khu vực (Tỉnh/Quận), Công suất ngày, Trạng thái hoạt động.
   - Thao tác nhanh trên từng đối tác:
     - 💬 **[Nhắn tin ngay]**: Nhảy thẳng vào khung Chat nội bộ với đối tác.
     - 📦 **[Bắn đơn gia công]**: Mở modal chọn đơn và bắn trực tiếp vào chat đối tác.
     - ⚙️ **[Cấu hình & Tạm ngưng]**: Khóa/mở liên kết đối tác.
2. **Dashboard Đối tác (Partner Store)**:
   - Trong hồ sơ tiệm có huy hiệu: *"Đối tác trực thuộc Chuỗi <Tên Chuỗi>"*.
   - Khung chat nội bộ luôn có sẵn kênh trò chuyện trực tiếp với Ban Điều Phối Chuỗi.

---

## 5. KẾ HOẠCH TRIỂN KHAI THEO CÁC BƯỚC (ROADMAP)

### Bước 1: Mở rộng Lược đồ Prisma & Migration
- [ ] Thêm model `chain_partnerships` và `chain_partner_invitations` vào `prisma/schema.prisma`.
- [ ] Chạy `npx prisma db push` và `npx prisma generate`.

### Bước 2: Tầng Clean Architecture (`src/modules/chain-partnership/`)
- [ ] `domain/`: Định nghĩa Entity `ChainPartnership`, Invariants, quy tắc phân cấp.
- [ ] `infra/`: `PrismaChainPartnershipRepository` xử lý truy vấn liên kết đa tổ chức.
- [ ] `use-cases/`:
  - `provision-partner-account.ts`: Cấp tài khoản cửa hàng và tạo quan hệ chuỗi.
  - `list-chain-partners.ts`: Lấy danh sách đối tác của chuỗi (kèm phân trang, lọc theo tỉnh/quận/trạng thái).
  - `sync-chat-channel.ts`: Tự động khởi tạo phòng chat khi quan hệ đối tác được xác lập.

### Bước 3: API Endpoints
- [ ] `GET /api/v1/coordinator/partners`: Lấy danh sách đối tác chuỗi.
- [ ] `POST /api/v1/coordinator/partners/provision`: Tạo nhanh tài khoản đối tác & cấp quyền.
- [ ] `PATCH /api/v1/coordinator/partners/[id]/status`: Đổi trạng thái (Hoạt động / Tạm ngưng).

### Bước 4: UI Quản trị Đối tác Chuỗi
- [ ] Xây dựng trang `/dieu-phoi/doi-tac` với giao diện chuyên nghiệp: Bộ lọc khu vực, bảng danh sách đối tác, modal tạo tài khoản đối tác.
- [ ] Tích hợp nút "Nhắn tin" liên kết trực tiếp tới module `internal-chat`.

### Bước 5: Kiểm thử & Nghiệm thu
- [ ] Viết Unit Test kiểm thử luồng cấp tài khoản và cách ly dữ liệu.
- [ ] Typecheck `npx tsc --noEmit` và chạy ratchet audit.

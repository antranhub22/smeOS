# KẾ HOẠCH PHÂN LẬP KIẾN TRÚC 3 TẦNG TRONG MONOLITH (MODULAR ISOLATION BLUEPRINT)
## Chuẩn bị nền tảng sẵn sàng bóc tách Repository độc lập cho ChainOS (Mạng lưới/Điện hoa), StoreOS và Core

> **Trạng thái:** BẮT ĐẦU THỰC HIỆN  
> **Branch:** `Nangcap_kientrucREPOSITORIES`  
> **Mục tiêu:** Giữ hệ thống chạy ổn định trong Modular Monolith nhưng thiết lập ranh giới cách ly nghiêm ngặt (Strict Layer Boundaries) giữa Core Platform, ChainOS (Mạng lưới / Chuỗi / Điện hoa) và StoreOS (Cửa hàng cơ sở), đảm bảo có thể trích xuất ra các Git repo riêng lẻ bất kỳ lúc nào mà không bị vỡ logic.

---

## 1. BẢN ĐỒ 3 TẦNG ĐỘC LẬP (THE 3-TIER ARCHITECTURE)

```
src/layers/
├── 1. core/                       # [@smeos/core] - Nền tảng chia sẻ
│   ├── tenancy/                   # TenantContext, Organization Scoping
│   ├── ports/                     # AI Ports (LLM, Vision, Storage, Queue)
│   ├── rbac/                      # Ma trận quyền & Capability Codes
│   └── contracts/                 # Inter-layer Public Contracts & Events
│
├── 2. chain-os/                   # [@smeos/chain-os] - Dành cho HQ Chuỗi & Tổng đài Điện hoa
│   ├── contracts/                 # Contract công khai xuất ra cho StoreOS kết nối
│   ├── governance/                # Quản trị chính sách chuỗi, danh mục mẫu toàn hệ thống
│   ├── dispatch/                  # Bắn đơn mạng lưới, tính điểm chi nhánh, SLA, bán kính
│   ├── settlement/                # Quyết toán hoa hồng, phí gia công (craft fee), công nợ
│   └── bot-gateway/               # Thẻ điều phối tương tác (Telegram/Zalo Living Card)
│
└── 3. store-os/                   # [@smeos/store-os] - Dành cho Cửa hàng cơ sở (Florist Shop, Shop lẻ)
    ├── pos-sales/                 # Bán hàng tại quầy, tạo đơn khách lẻ
    ├── inventory/                 # Quản lý nguyên vật liệu, hoa tươi tại tiệm
    ├── printables/                # In thiệp mừng A6, tag sản phẩm
    └── shop-execution/            # Nhận đơn gia công từ chuỗi, tải ảnh QC thành phẩm
```

---

## 2. QUY TẮC PHÂN LẬP RANH GIỚI BẤT BIẾN (BOUNDARY ISOLATION RULES)

1. **Chiều phụ thuộc 1 chiều (Strict Dependency Direction):**
   - `core` KHÔNG BAO GIỜ được import từ `chain-os` hoặc `store-os`.
   - `chain-os` CHỈ import `core` và các Interface công khai từ `contracts`.
   - `store-os` CHỈ import `core` và các Interface công khai từ `contracts`.
   - `chain-os` và `store-os` **tuyệt đối không chọc thẳng vào DB/Internal logic của nhau**. Mọi giao tiếp qua lại phải thông qua `Layer Contract` (hoặc Event/Webhook).
2. **Zero Direct Prisma Leak:**
   - Tầng domain và contracts của từng layer phải là Pure TypeScript (không import `@prisma/client` hay `@/generated/prisma`).
3. **Sẵn sàng trích xuất (Extraction-Ready):**
   - Khi cần tạo repo riêng `chainos-dienhoa`, chỉ cần:
     1. Copy `src/layers/chain-os` và `src/layers/core/contracts`.
     2. Gắn DB adapter riêng hoặc kết nối qua API Client.
     3. Repo mới hoạt động độc lập mà không cần refactor code.

---

## 3. CÁC BƯỚC THỰC HIỆN & TIÊU CHÍ VERIFY (PHASED EXECUTION)

### Phase 1: Tạo cấu trúc Layer Contract & Mapping Ranh giới
- Tạo `src/layers/contracts/` chứa các Domain Contracts công khai giữa Chuỗi và Shop:
  - `IChainDispatchContract`: Hợp đồng bắn đơn & nhận đơn gia công.
  - `IPartnerSettlementContract`: Hợp đồng quyết toán phí gia công & cấn trừ công nợ.
- **Verify Step 1:** Typecheck pass 100% (`npx tsc --noEmit`).

### Phase 2: Thiết lập Bộ gác cổng Ranh giới (Layer Boundary Linter / Ratchet)
- Tạo công cụ tự động `scripts/check-layer-boundaries.ts` kiểm tra:
  - Cấm circular dependency giữa các layer.
  - Cấm StoreOS import trực tiếp internal use-cases của ChainOS.
- Tích hợp lệnh `npm run check:layers`.
- **Verify Step 2:** Chạy `npm run check:layers` báo 0 vi phạm.

### Phase 3: Đóng gói Preset Điện Hoa Mẫu (Florist Chain Bundle)
- Tạo file xuất cấu hình trọn gói cho Điện hoa `src/layers/chain-os/presets/florist-chain.ts`:
  - Kế thừa toàn bộ đặc tả ngành `FLORAL` từ SSOT.
  - Thiết lập sẵn bộ chính sách điều phối, mẫu tin nhắn Telegram bot, thang đo SLA điện hoa.
- **Verify Step 3:** Viết unit test kiểm chứng tính độc lập của Florist Chain Bundle (`npx vitest run ...`).

---

## 4. BẢO CHỨNG AN TOÀN
- Không xóa hay làm gãy bất kỳ tính năng hiện tại của Monolith.
- `npm test` (394 test files, 2678 unit tests) luôn xanh 100% sau mỗi bước.

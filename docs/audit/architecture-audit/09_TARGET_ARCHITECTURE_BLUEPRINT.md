# 09 — Bản thiết kế kiến trúc đích (đề xuất)

> Đây là **đề xuất của audit**, không phải quyết định. Mọi thay đổi chạm schema, tenancy, RBAC, CI/`render.yaml`, nhà cung cấp hay UX đã khoá đều cần PO duyệt theo `CLAUDE.md`. Bản này giữ nguyên các quyết định đã chốt (Đường A, D6-1, D15–D19, D-N6) và chỉ lấp khoảng trống đã đo ở `04`.

## 1. Nguyên tắc định hướng

1. **Giữ modular monolith** (Next.js + Prisma) + worker Python qua `generation_jobs` — phù hợp quy mô; không tách microservice.
2. **Một chốt chặn cho mỗi mối quan tâm xuyên suốt**: tenancy (`requireTenantContext`), quyền (`requireCapability`/`requirePlatformCapability`), AI (`callCapability` + chính sách dùng chung cho worker), tích hợp (Integration Hub), thông báo (`notifyOrganization`), lưu trữ (`StorageProvider`), quyết định theo tầng (`layered-resolver`).
3. **Không có cổng xanh thì không có deploy.**
4. **Hiện trạng và đích được ghi tách biệt** trong tài liệu.

## 2. Sơ đồ quan hệ đích

```
                           ┌──────────────────────────── Người dùng / Khách / Đối tác ───────────────────────────┐
                           │  Trang app (app)   Console (platform)   Trang công khai /c /g /b /s   Webhook/Cron  │
                           └───────────┬──────────────────┬────────────────────┬──────────────────┬──────────────┘
                                       ▼                  ▼                    ▼                  ▼
  Biên (src/app/api/v1) ── handle() ── requireTenantContext ─ requirePlatformContext ─ rate-limit+chữ ký ─ cron-auth
                                       │ (org từ phiên, tool lock)   (platform_operators)
                                       ▼
                         requireCapability (3 lớp + trần cứng)  ·  Entitlement (gói/khoá công cụ)
                                       ▼
  use-cases ─────────────► domain thuần (quy tắc, MÁY TRẠNG THÁI ĐƠN DUY NHẤT, governance-decisions)
       │                         ▲
       │ ports                   │ kiểu domain riêng (không import infra)
       ▼                         │
  infra (Prisma, scopedWhere) ── PostgreSQL (organization_id + index; RLS giai đoạn sau)
       │
       ├─► Integration Hub ──► đầu nối DUY NHẤT mỗi kênh: Zalo OA/ZNS · Messenger · Telegram · eSMS · Email · SePay · (cổng thanh toán)
       │        ▲   ▲
       │        │   └── Notification (in-app/SSE qua pub-sub) dùng Hub cho kênh ngoài
       │        └────── Thẻ chào, Orders, CRM gửi tin qua Hub
       ├─► AI Gateway (callCapability) ──► nhà cung cấp LLM/ảnh/âm thanh
       ├─► StorageProvider (S3 bắt buộc ở production)
       └─► generation_jobs ──► Worker Python ──► AI Policy Client (đọc ai_policies + giấy phép) ──► nhà cung cấp

  Quản trị 4 tầng:  Mẹ (platform_operators, N*) ─► [Ngành: plugin code HOẶC tầng dữ liệu — PO chọn] ─► Chuỗi (chain_partnerships) ─► Cửa hàng
                     └────────────── layered-resolver: khoá tầng cao thắng → ghi đè cụ thể nhất → mặc định ──────────────┘
```

## 3. Phụ thuộc xuyên tầng (đích)

| Từ | Được phép phụ thuộc | Cấm |
|---|---|---|
| `src/app/**` (route, page) | `use-cases`, `core/http`, `core/tenancy` (kiểu), `components` | `infra/` trực tiếp (trừ factory được liệt kê), Prisma |
| `components/**` | API qua `fetch`/SWR, kiểu từ `domain/` hoặc `contracts/` | `modules/*/infra/*` (kể cả `import type`) |
| `use-cases` | `domain`, ports, repository interface | SDK nhà cung cấp |
| `domain` | chỉ `domain` khác, `core/*/domain` | `infra`, Prisma, kiểu entity Prisma |
| `infra` | Prisma, `core/tenancy` | `use-cases` |
| `adapters` | SDK, HTTP | Prisma |
| Mô-đun A → mô-đun B | qua use-case/port công khai của B | `infra` của B |
| Worker Python | `generation_jobs`, chính sách AI chung, StorageProvider tương đương | Gọi nhà cung cấp chưa qua chính sách |

Thực thi bằng mở rộng `npm run check:layers` + test kiến trúc hiện có.

## 4. Khung (framework) cần có

| Khung | Hiện trạng | Đích |
|---|---|---|
| Release & môi trường | 1 môi trường, auto-deploy `main` | dev → staging (DB riêng, dữ liệu ẩn danh) → production; deploy sau CI xanh; tag phiên bản + CHANGELOG |
| Quản lý migration | `migrate deploy` trong build | Pre-deploy job, sao lưu trước migration, mẫu expand/contract, DB test dựng bằng migration |
| DR | Chưa kiểm chứng | RPO/RTO thành văn; PITR bật; diễn tập khôi phục mỗi quý có biên bản |
| Máy trạng thái đơn | 3 động cơ | 1 bảng chuyển hợp lệ SSOT + adapter cho từng nguồn (Thẻ chào, coordinator) |
| Integration Hub | Khung, 0 đầu nối thật | Mỗi kênh 1 đầu nối, giám sát, retry, vault; danh mục phản ánh đúng trạng thái |
| AI governance | TS qua gateway; Python tự quản | Chính sách chung (privacy floor, license, budget) đọc từ DB cho cả hai runtime |
| 4 tầng | Mẹ + Chuỗi + Cửa hàng | Quyết định Ngành; vai UX ánh xạ từ (loại tổ chức, mã năng lực) |
| Quan trắc | Log JSON, request-id, Sentry tuỳ chọn | Sentry bắt buộc ở mọi dịch vụ; metrics + cảnh báo theo SLO S1–S4 |
| Bảo vệ dữ liệu | Thùng rác, legal hold, xuất ZIP | Đồng ý, hạn lưu, xoá theo chủ thể (Nghị định 13) |
| Screen Contract | Tự khai | Test buộc mỗi trang có hợp đồng; QA matrix gắn E2E |
| Tài liệu | SSOT kỹ thuật tốt, trạng thái lệch | Tách `docs/internal` / `docs/client`; ERD; OpenAPI cho Integration API; TRANG_THAI chỉ hiện trạng |

## 5. Chuẩn khuyến nghị

| Lĩnh vực | Chuẩn tham chiếu | Áp dụng |
|---|---|---|
| Bảo mật ứng dụng | OWASP ASVS 4.0 mức 2; OWASP Top 10 | Checklist cho pentest và review; CSP chặn; kiểm Origin |
| Quản lý bí mật | Nguyên tắc xoay khoá định kỳ, tách khoá theo mục đích (đã có HKDF) | Lịch xoay `SESSION_SECRET`, `INTEGRATION_TOKEN_SECRET`, `STORAGE_SIGNING_SECRET` |
| Dữ liệu cá nhân | Nghị định 13/2023/NĐ-CP | D13 |
| API | OpenAPI 3.1; RFC 9457 (Problem Details) cân nhắc cho envelope lỗi công khai | `/api/v1/integration/*` trước |
| Độ tin cậy | SLO/error budget (đã có v1 trong runbook §10) | Đo tự động |
| Trợ năng | WCAG 2.1 AA (đã có axe E2E) | Mở rộng cho mọi trang có hợp đồng |
| Commit/phát hành | Conventional Commits (đã có) + SemVer | Tag phát hành |

## 6. Kiến trúc đích 4 tầng (bổ sung sau giai đoạn 4 — xem `13`)

### 6.1 Mô hình dữ liệu tầng (đề xuất, cần PO chọn — chạm schema)

```
platform (Mẹ)            platform_operators, platform_settings
   │
industry (Ngành)         PHƯƠNG ÁN 1: chỉ là plugin mã + khoá theo industry_key (bỏ khỏi RBAC/thông báo/nav)
   │                     PHƯƠNG ÁN 2: bảng industries + vai quản trị ngành + scope_id thống nhất "industry:<key>"
   │
organization (Chuỗi)     organizations.type = CHAIN
   │   tổ_chức_cha_id / organization_links (MỘT mô hình quan hệ, có loại: SUBCONTRACTOR | FRANCHISE | BRANCH)
   ▼
organization (Cửa hàng)  luôn là một tenant → nhận đủ khoá công cụ, ma trận, khoá thông báo/tích hợp
   └── branches (đơn vị con nội bộ, phạm vi quyền BRANCH)
```

Hàm dùng chung duy nhất: `resolveTierChain(organizationId) → { tier, industryKey, parentChainId, branchId? }`, thay cho 3 bản `chain_partnerships.findFirst` hiện có; mọi hệ thống (ma trận, thông báo, tích hợp, khoá công cụ) dùng chung kết quả này.

### 6.2 Cổng kiểm ở biên (đích)

```
requireTenantContext
  ├─ TenantContext { organizationId, tierChain, branchId, grants: Map<code, scope>, plan }
  ├─ assertToolUnlocked (phủ cả trang và API của công cụ)
requireCapability(ctx, code)          → kiểm mã
requireScope(ctx, code, resource)     → kiểm phạm vi (ORGANIZATION / BRANCH) ở repository, như organization_id
requireFeatureAccess(ctx, feature)    → kiểm gói dịch vụ cho mọi tính năng trả phí
```

### 6.3 Bất biến cần test cho 4 tầng
- Mỗi trục (RBAC, phạm vi, gói, khoá công cụ, ma trận, thông báo, tích hợp, nav) × mỗi tầng có ít nhất một ca thử trong `tests/tenant` hoặc `tests/platform`.
- Không mã giao diện nào so khoá vai; khuôn UX suy từ `(tier, capabilities)`.

## 7. Điều KHÔNG khuyến nghị

- Không tách microservice, không thêm message broker mới (D19: không thêm hạ tầng cho nền AI; Postgres `LISTEN/NOTIFY` đủ ở quy mô hiện tại).
- Không viết lại Thẻ chào trong thời gian đóng băng.
- Không mở Row-Level Security trước khi máy trạng thái và lớp `infra` ổn định — đưa vào giai đoạn enterprise.

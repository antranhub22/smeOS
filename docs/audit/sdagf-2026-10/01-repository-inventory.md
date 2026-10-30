# 01 — Repository inventory (Phase 1)

| Hạng mục | OBSERVED FACT | Bằng chứng |
|---|---|---|
| Repo | `antranhub22/smeOS`, commit `49e7d86`, working tree sạch | `git status` |
| Web | Next.js 16 + TypeScript; 383 file `route.ts` dưới `src/app` | `find src/app -name route.ts` |
| Module | 41 module trong `src/modules/*` (assets, storage, media, video-studio, audio-studio, greeting-card, orders, crm, coordinator…) | `ls src/modules` |
| Core | `src/core/{tenancy,rbac,ai,security,observability,governance,…}` | `ls src/core` |
| DB | PostgreSQL 16 qua Prisma 7; 113 model, 15 migration | `prisma/schema.prisma`, `prisma/migrations` |
| Object storage | Interface `StorageProvider`; adapter S3-compatible (SigV4 tự viết, mục tiêu R2) + `LocalDiskStorageProvider` (`var/storage/`) | `src/modules/assets/adapters/*`, `storage-provider-factory.ts:26-43` |
| Worker | Python: `media_ai` (ảnh, âm thanh, video) và `vision`, đọc/ghi kho qua `workers/shared/storage.py` | `render.yaml` §2–4 |
| Hạ tầng | Render (Singapore): web, 3 worker, cron 5 phút, Redis 256mb, Postgres `basic-256mb` | `render.yaml` |
| AI provider | OpenAI, Anthropic, Gemini, Vertex, Stability, Photoroom, Replicate, FAL, ElevenLabs, Runway (env key) | `render.yaml` envVars |
| Tenancy | `requireTenantContext()`, `scopedWhere(ctx, …)`, lỗi xuyên tenant trả 404 | `asset-repository.ts:101`, CLAUDE.md |
| Authz | `requireCapability(ctx, "<code>")`; platform dùng `requirePlatformContext` | `crm/customers/export/route.ts:22` |
| Audit | Bảng `audit_logs`; `recordAuditLog` được gọi từ 49 file | `schema.prisma:584`, `modules/audit/use-cases/record-audit-log.ts:16` |
| Backup | PITR Render (3–7 ngày), export logic, `scripts/handover-backup-engine.ts` | `docs/kien-truc/VAN_HANH_SU_CO_VA_SAO_LUU.md:7-29` |
| CI | typecheck, lint ratchet, check:docs, unit, test:tenant, test:platform, build, gitleaks, `npm audit`, pytest, E2E UX, CodeQL | `.github/workflows/ci.yml`, `codeql.yml` |
| Export | `crm/customers/export`, `orders/export`, `vision/analyses/export`, `platform/orgs-data/[orgId]/export` | `src/app/api/v1/**/export/route.ts` |

## Giới hạn phạm vi
- Không truy cập console Render/R2: cấu hình bucket (public access, versioning, encryption, lifecycle rule) **chưa xác minh**.
- Không chạy test; chỉ đọc. Mức độ phủ của 119 test tenant chưa được đo.
- 383 route chưa được đọc hết từng cái. Phần tập trung đọc là storage, assets, trash, export và video.

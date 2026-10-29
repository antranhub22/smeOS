# 12 — Evidence index

| # | Bằng chứng | Vị trí | Dùng cho |
|---|---|---|---|
| E1 | Ngoại lệ `videos/` bỏ qua chữ ký | `src/app/api/v1/storage/[...key]/route.ts:15` | R-01, C-007 |
| E2 | PUT đọc toàn bộ body, content-type từ client | `route.ts:28-30` | R-02, C-008 |
| E3 | SVG phục vụ inline; cache public immutable | `route.ts:52`, `route.ts:70` | R-02, R-11 |
| E4 | Key org dựng phía máy chủ + đối chiếu | `src/modules/assets/domain/storage-key.ts`, `use-cases/register-asset.ts:51` | C-004/006 |
| E5 | HMAC ký bằng `SESSION_SECRET` | `src/modules/assets/infra/storage-signing.ts:17-25` | R-09 |
| E6 | Provider chỉ put/get/signedUrl | `src/modules/assets/adapters/s3-storage-provider.ts:66,90,117`, `local-disk-storage-provider.ts:29,36,50` | R-03, C-012 |
| E7 | Xoá asset chỉ xoá dòng DB | `src/modules/assets/infra/asset-repository.ts:101-104`, `use-cases/delete-asset.ts:12` | R-03 |
| E8 | Lazy purge fire-and-forget; xoá vĩnh viễn không xoá tệp | `src/modules/storage/infra/trash-repository.ts:53,93,254-268` | R-06 |
| E9 | 30 ngày hard-code | `src/modules/storage/domain/trash-types.ts` (`createTrashMeta`) | C-011 |
| E10 | URL video cố định | `workers/media_ai/video/video_worker.py:133` | R-01, R-06 |
| E11 | Catalog công khai chấp nhận `videos/` | `src/modules/catalog-links/use-cases/get-public-catalog.ts:86` | R-01 |
| E12 | Video job chỉ ký key cùng org | `src/modules/video-studio/use-cases/get-video-job.ts:63-71` | C-006 |
| E13 | Model `assets` + provenance | `prisma/schema.prisma:424-490` | C-015 |
| E14 | `idempotency_key` unique | `prisma/schema.prisma:504,525` | C-016 |
| E15 | `audit_logs` | `prisma/schema.prisma:584-603`; 49 file gọi `recordAuditLog` | C-018 |
| E16 | Backup chỉ DB; RPO/RTO là đề xuất; chưa diễn tập | `docs/kien-truc/VAN_HANH_SU_CO_VA_SAO_LUU.md:11,15-18,28-29` | C-020/021 |
| E17 | CI gates | `.github/workflows/ci.yml:53-54,81,85,96,110,128`; `codeql.yml` | C-023/024/028 |
| E18 | Hạ tầng | `render.yaml` (services, Postgres `basic-256mb`, Redis) | 01 |
| E19 | 119 test tenant | `tests/tenant/*.ts` | C-028 |
| E20 | Quét secret dạng pattern: chỉ thấy khoá ví dụ AWS trong test | `src/modules/assets/domain/__tests__/sigv4.test.ts:20` | C-009 |

Lệnh đã chạy: chỉ `grep`, `find`, `sed`, `nl`, `git status/log/grep`. Không chạy DB, test, migration hay lệnh mạng.

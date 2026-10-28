# 04 — System-wide audit (cumulative state)

Target = `integration/all-features-oct27` @ `d4212e74` (the candidate release), compared with `main` @ `c76aab97`. Gate evidence: `07-final-verification.md`. Severity/IDs: `05-revision-plan.md`.

## A. Functional correctness & business logic
- **Notification system** (AUD-002/007/014/015/019/024): data model + settings UI exist, but nothing dispatches events, and the resolution logic is cross-tenant. Not release-ready as a feature.
- **Governance matrices** (AUD-006): 10 screens (5 tenant + 5 platform) edit local state only; the resolvers for craft fee, payment and store policies are not used by pricing/payment code. Users can "change" policies that change nothing.
- **Tool entitlement** (AUD-005/025): display-only; "lock all" unlocks all.
- **Catalog studio / poster export**: logic is sound and pure; validation suggestions minor (AUD-021/027).
- **Greeting-card Telegram work** (upbeat-clarke): bounded retry, SSRF-guarded upload, tests present — good quality, but not merged anywhere.

## B. Architecture
- Layer rule #4 broken once in this range: `coordinator/partners/[id]/tools/route.ts` imports Prisma (AUD-004). `0a64ae02` and `export-org-data-zip.ts` moved Prisma *out* of non-infra code — good.
- Cascading logic is implemented twice (`core/governance/cascading-resolver.ts` correct; `notification/domain/cascading-policy.ts` scope-blind) — duplicated business rule with divergent behaviour (AUD-014).
- Rule #7 (≤ 350 lines): 2 new + 4 grown files over the limit (AUD-018).
- One route multiplexes two features by sniffing the request, which also blinds the architecture guard test (AUD-020).

## C. Database & data integrity
- All 13 migrations apply cleanly to an empty Postgres 16 (`prisma migrate deploy`, run 2026-10-28 on `smeos_test`). The new migration is additive only (`CREATE … IF NOT EXISTS`, FKs to `organizations` with `ON DELETE CASCADE`).
- Missing `@@index([organization_id])` on two new tenant tables (AUD-008).
- `organizations.settings` JSON updated by read-modify-write without a transaction (AUD-004d).
- `Tinh_chinh_cac_tinh_nang` carries 23 superseded migrations — merging it would corrupt `_prisma_migrations` (AUD-001).

## D. Security & privacy
| ID | Sev | Pre-existing? | Issue |
|---|---|---|---|
| AUD-028 | **P1** | yes (main) | `chat/webhooks/facebook` and `chat/webhooks/zalo` POST handlers verify **no signature** (no `X-Hub-Signature-256`, no Zalo MAC), although `route-capability-guard.test.ts` lists them as "xác thực bằng chữ ký". Anyone can forge inbound messages for any page/OA id → triggers AI answers through the gateway (cost) and makes the shop's token send replies. Facebook verify token falls back to a hard-coded default |
| AUD-009 | P1 | yes | Partner-account provisioning: no capability + shared hard-coded default password |
| AUD-002/003/004 | P1/P2 | new | Notification/tool routes without capability checks (confirmed by the guard test going red) |
| AUD-014/015 | P1 | new | Cross-tenant effect/leak in notification hard locks |
| AUD-016 | P2 | new | HTML injection in email/Telegram, PII in logs, shared default Telegram chat |
| AUD-017 | P2 | new | `lead_captured_at` no longer platform-owned (regression of H11 guard) |
| debt #170 | P2 | yes | 28 routes still on the unguarded list awaiting capability codes |

Positive evidence: bcrypt password hashing; `timingSafeEqual` for cron secret; rate limits on login/signup/instant-trial; raw SQL limited to two constant statements; no `dangerouslySetInnerHTML`/`eval` in app code; dev role-override endpoint disabled when `NODE_ENV=production`.
Not assessed: dependency CVE scan (`npm audit` needs network to the advisory API — run in CI), CodeQL results (workflow exists; results not readable from here), penetration testing.

## E. API & integrations
- New notification APIs: zod validation present on bodies; query params and some enums unvalidated (AUD-022); manual 403 JSON instead of the error envelope in preferences.
- `nodemailer` imported but not declared → email path cannot build cleanly (AUD-023, pre-existing).

## F. Frontend & UX
- Raw palette classes in the partner tool modal / partner page / nametag (AUD-026); catalog poster styles use brand colours by design.
- Jargon on screen: "Khóa cứng (Hard Lock)" in `cai-dat/thong-bao/page.tsx` description.
- Hydration issues in the toolkit shortcuts were found and fixed in-range (`6d87a403`, `9bb7cc80`).
- Browser/responsive/visual checks: **not executed** (needs a running app + seeded DB); see `07`.

## G. Performance & reliability
- `resolveEffectiveNotification` makes 5–6 queries per channel × 6 channels per recipient (≈ 36 queries per notification) — fine at low volume, needs batching before wiring producers.
- SSE hub is per-process memory (AUD-007).
- Inbox listing is paginated and capped at 100.

## H. Production & deployment readiness
- **Unit suite is red on main itself** (AUD-030, P1): 95 failing tests in 37 files on `main` (mostly `vi.mock` factories missing the `get…Repository` exports after the repository refactor, plus copy-text assertions). The rule "no new failures versus main" therefore hides a red baseline.
- **Typecheck is red on main and integration** (AUD-023).
- Remaining gates (lint, tenant, platform, build): see `07`.

## I. Commercial readiness & client handover
Not ready. Blocking items: AUD-028, AUD-009, AUD-002/004/014/015, AUD-023, AUD-030, plus features that look finished but are inert (AUD-006/007/005). Handover documentation (setup/deploy/env/runbook) exists in parts (`CLAUDE.md`, `AGENTS.md`, `render.yaml`, `.env.example`) but no client-facing operations runbook, SLA or incident procedure was found — to be confirmed with the PO.

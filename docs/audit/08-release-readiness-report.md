# 08 — Release readiness report

**Overall status: BLOCKED** — code and automated gates are ready (07 final run on `a1e6b756`); handover waits only on items outside the repository (§2b).

## 1. Executive summary
1. **Scope:** every commit reachable from 7 tips and not in `main` (`c76aab97`): `integration/all-features-oct27` (already contains `Nangcap_kientruc4tang_…`, `Nangcap_hethongnotification`, `Nangcap_hethongchucnang`, `Thietke_sidebar_ALL`, `Nangcap_chucnangCatalog`), `claude/upbeat-clarke-2zx8tb`, `Tinh_chinh_cac_tinh_nang`, 4 dependabot branches.
2. **Commits: 613 found, 613 audited (100 %), every one with a terminal status** (`02`, per commit in `03b`):
   - Current lineage (could ship), 70: diff-by-diff review; integration server code read line by line; 17 merges verified with `--remerge-diff`.
   - Legacy lineage (`Tinh_chinh`, no common ancestor with main), 543: every added line rule-audited; survival in main measured; 77 merges verified (7 hand-resolved, no conflict markers left).
   - Totals: VERIFIED 465 · FIX_REQUIRED 103 (102 = pre-existing oversized files/`any`, AUD-034) · FIXED 3 · NOT_APPLICABLE 38 · BLOCKED 4 (dependabot).
3. **Verdicts (current lineage, non-merge):** PASS 13 · PASS_WITH_CONCERNS 29 · FAIL 4 (`5def12db`, `8492c065`, `f6ca2782` → now FIXED; `99db1dfc` open) · NOT_APPLICABLE 3 · BLOCKED 4.
4. **Findings: 36** (`05`).
5. **Fixed on `claude/dreamy-pasteur-004l8i`** (`b4eba228`, `61859c8f`, `3a6477fa`):
   - Findings: AUD-002, 003, 004 a–d, 009, 014, 015, 016, 017, 021, 024, 025, 029, 036.
   - Gate regressions from integration: guard test, ESLint ratchet, `check:docs`, Prisma outside infra, gitleaks, E2E contrast.
   - 23 new tests, 11 of them on real Postgres.
6. **Checks (`07`):** on the fixed branch **0 new failures vs main** in typecheck, unit, ESLint, docs, tenant, platform, build, worker pytest (471 ✅), E2E, gitleaks and `npm audit` (high). Exception: `lint:ux` still has ~105 new violations (AUD-031).
7. **Not executed:** CodeQL results (CI only), manual browser/responsive walk-through, load test, deploy to a production-like Render/DB.
8. **Remaining risks:** below.
9. **Reports:** `docs/audit/00`–`08` + `03b`.
10. **Overall: NOT_READY.** Gates C, D and G still fail (below).

## 2. Gates
| Gate | Status | Evidence / reason |
|---|---|---|
| A Functional correctness | **FAIL** | Inert features: notification dispatch has no producer (AUD-007); governance matrices don't persist (AUD-006); tool entitlement only hides nav items (AUD-005) |
| B Business logic & data integrity | PASS (assessed scope) | Capability checks on every org-wide write ✅; cross-tenant locks fixed ✅; 11 tenant-isolation tests on Postgres ✅; migrations deploy ✅, no column drift ✅. Do **not** merge `Tinh_chinh` (AUD-001) |
| C Security | **FAIL** | AUD-028: unsigned Facebook/Zalo webhooks (pre-existing on main). Fixed: AUD-002/003/004/009/014–017; gitleaks 0 new; `npm audit` high 0 |
| D Automated quality | **FAIL** | main's own suites are red (95 unit, 12 tenant, 3 E2E, typecheck `nodemailer`, ESLint 38, docs 39 — AUD-030/023); fixed branch adds 0 new failures; `lint:ux` +105 (AUD-031) |
| E Reliability & performance | NOT_ASSESSED | Static notes only: ~36 queries per notification, in-memory SSE hub. No load test |
| F Deployment readiness | BLOCKED | `build` ✅, `migrate deploy` ✅ on an empty DB, `render.yaml` gates dev seed ✅. Not run against a production-like DB/Render; rollback/backup procedure not reviewed |
| G Client handover | **FAIL** | No client-facing runbook / SLA / incident procedure found; client documents in `docs/Audit` (AUD-011); demo passwords in seed source (AUD-033) |

## 2b. Remaining before READY_FOR_HANDOVER (outside the repository)
1. Set `FB_APP_SECRET` and `FB_WEBHOOK_VERIFY_TOKEN` on Render; shops using Zalo OA chat enter App ID + Secret Key in *Kênh tích hợp* (webhooks fail closed until then — AUD-028 fixed in `a1e6b756`).
2. Regenerate the `/vai-tro` visual snapshot on the CI runner.
3. Archive `Tinh_chinh_cac_tinh_nang` on GitHub (tag push is blocked from this session).
4. Fill the [CẦN XÁC NHẬN] items in `docs/handover/OPERATIONS_RUNBOOK.md` (backups/PITR, SLA, access transfer); run a load test and a restore drill.
5. PO acceptance of the known limitations (runbook §7).

## 3. Approved items (status 28/10/2026 — all done except where noted) (PO approval 28/10/2026)
1. AUD-028 webhook signatures (needs the app secrets set in Render).
2. AUD-023 add `nodemailer`; AUD-012 dependabot bumps; AUD-035 `npm audit fix`.
3. AUD-005/006/007: label as preview (or wire). AUD-008 + AUD-032: one schema migration.
4. AUD-001: archive `Tinh_chinh_cac_tinh_nang`. Merge `claude/upbeat-clarke-2zx8tb` separately (it also fixes main's 3 E2E reds).
5. AUD-031 colours, AUD-030 main's red suites.
6. ~~Partner provisioning UI~~ — **done** (`67da882a`): `/dieu-phoi/doi-tac` shows the one-time password in a dialog with copy. Verified in Chromium against a seeded build: dialog shows store, email and a 16-char password; that password logs the partner in (HTTP 200); E2E UX suite unchanged (same 3 reds as main).

## 4. Traceability (fixed items)
| Intended behaviour | Commit | Finding | Fix | Regression test | Result |
|---|---|---|---|---|---|
| A lock applies only to its own tenant/chain | `f6ca2782` | AUD-014 | `isLockInScope` in `cascading-policy.ts` | `cascading-policy.test.ts` | ✅ |
| Preferences never reveal or apply other tenants' locks | `f6ca2782` | AUD-015 | scoped `getAppliedHardLock` | `cascading-policy.test.ts`, `tests/tenant/notification-isolation.test.ts` | ✅ |
| Outgoing mail/Telegram is safe and leaks no PII | `f6ca2782` | AUD-016 | `notification-text.ts`, adapters | `channel-adapters-escaping.test.ts` | ✅ |
| Tenants can't forge platform-owned settings | `5def12db` | AUD-017 | restore `lead_captured_at` | `organization-settings-policy.test.ts` | ✅ |
| Chain admin sees the chain matrix | `405f15cf` | AUD-024 | `notification-viewer-tier.ts` | `notification-viewer-tier.test.ts` | ✅ |
| "Lock all" locks all tools | `8492c065` | AUD-025 | `nav-store.ts`, modal | `nav-store-whitelist.test.ts` | ✅ |
| Partner tool update is atomic, validated and kept in infra | `8492c065` | AUD-004 b–d | `partner-tool-settings-repository.ts` | `tests/tenant/partner-tool-unlock.test.ts` | ✅ |
| Bounded retries | `fe0d74aa` | AUD-021 | 5-attempt cap | `catalog-links-use-cases.test.ts` | ✅ |
| Test follows the industry SSOT | `83fd26ce` | AUD-029 | read `FLORAL_INDUSTRY` | itself | ✅ |
| Org-wide writes need F2 / platform writes N2; no shared partner password | `f6ca2782`, `8492c065`, pre-existing provisioning | AUD-002/003/004a/009 | `requireCapability`/`requirePlatformCapability`, random one-time password | `tests/tenant/notification-partner-capabilities.test.ts`, guard test | ✅ |
| Sidebar text meets WCAG AA contrast | `f4154e3a` | AUD-036 | caption token | `tests/e2e/ux/a11y.spec.ts` | ✅ |

## 5. Historical vs current
- Historical defects already fixed later in range: hydration errors (`6d87a403`, `9bb7cc80`); matrix crashes (`666b370d`, `4fcd5a7c`, `7c3f0585`). The current system is not counted as defective for these.
- Current defects listed above exist in the code at the integration tip; the ones marked ✅ no longer exist on the fixed branch.

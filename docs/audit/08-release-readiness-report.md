# 08 — Release readiness report

**Overall status: NOT_READY.** Not ready for client handover.

## 1. Executive summary
1. **Scope:** every commit reachable from 7 tips and not in `main` (`c76aab97`): `integration/all-features-oct27` (which already contains `Nangcap_kientruc4tang_…`, `Nangcap_hethongnotification`, `Nangcap_hethongchucnang`, `Thietke_sidebar_ALL`, `Nangcap_chucnangCatalog`), `claude/upbeat-clarke-2zx8tb`, `Tinh_chinh_cac_tinh_nang`, 4 dependabot branches.
2. **Commits:** 613 found (519 non-merge, 94 merge).
   - Current lineage (could ship): 70. 53 non-merge reviewed diff by diff, and integration's server code read line by line. 17 merges verified (`--remerge-diff`).
   - Legacy lineage (`Tinh_chinh`, no common ancestor with main): 543. 77 merges verified, 35 superseded. For the other 431, the share of their code that still lives in main was measured; that code is judged in the current-state audit.
3. **Verdicts (current lineage, non-merge):** PASS 13 · PASS_WITH_CONCERNS 29 · FAIL 4 (`5def12db`, `8492c065`, `f6ca2782`, `99db1dfc`; `405f15cf` also carries AUD-024) · NOT_APPLICABLE 3 (docs) · BLOCKED 4 (dependabot) — see `03`.
4. **Findings (31):** P1 × 9 · P2 × 9 · P3 × 9 · P4 × 4 — see `05`.
5. **Fixed on `claude/dreamy-pasteur-004l8i`:**
   - Findings: AUD-014, 015, 016, 017, 021, 024, 025, 029, 004 b–d.
   - Gate regressions from integration: guard test, ESLint ratchet, `check:docs`, Prisma outside infra.
   - 19 new tests, 7 of them on real Postgres.
6. **Checks:** see `07`. On the fixed branch: **0 new failures vs main** in typecheck, unit, ESLint, docs, tenant, platform and build. `lint:ux` still has ~105 new violations.
7. **Not executed:** Playwright E2E/visual, worker pytest, dependency CVE scan, CodeQL results, browser/responsive review, load test.
8. **Remaining risks / approvals:** below.
9. **Reports:** `docs/audit/00`–`08`.
10. **Justification:** gates A, B, C, D and G fail (below).

## 2. Gates
| Gate | Status | Evidence / reason |
|---|---|---|
| A Functional correctness | **FAIL** | Notification dispatch has no producer (AUD-007); governance matrices don't persist (AUD-006); tool entitlement is display-only (AUD-005) |
| B Business logic & data integrity | **FAIL** | Capability checks missing on org-wide writes (AUD-002/004a). Cross-tenant lock logic fixed (AUD-014/015 ✅). Merging `Tinh_chinh` would corrupt migrations (AUD-001) |
| C Security | **FAIL** | AUD-028 unsigned Facebook/Zalo webhooks (pre-existing). AUD-009 partner provisioning without capability + shared default password. AUD-002/003. Fixed: AUD-016, 017 |
| D Automated quality | **FAIL** | main itself red: 95 unit, 12 tenant, typecheck, ESLint 38, docs 39. Fixed branch adds 0 new failures but `lint:ux` +105. E2E not run |
| E Reliability & performance | NOT_ASSESSED | Static notes only: ~36 queries per notification, in-memory SSE hub. No load test |
| F Deployment readiness | BLOCKED | Build ✅, migrations ✅ on an empty DB. Not verified against a production-like DB or Render; rollback/backup procedure not reviewed |
| G Client handover | **FAIL** | No client-facing ops runbook / SLA / incident procedure found; client documents in `docs/Audit` need a decision (AUD-011) |

## 3. Decisions needed from the PO (blocking)
1. Capability codes for: notification org-policy, store-defaults, hard-locks (tenant + platform), partner tools, partner provisioning (AUD-002/003/004a/009). Also replace the provisioning default password with an invite or one-time password.
2. Webhook signature secrets for Facebook/Zalo in `render.yaml` and env (AUD-028).
3. Add `nodemailer` + `@types/nodemailer` (AUD-023); approve or reject the 4 dependabot bumps (AUD-012).
4. Scope for the inert features: wire them or label them "preview" (AUD-005/006/007). Add the schema index (AUD-008).
5. Archive `Tinh_chinh_cac_tinh_nang` (AUD-001). Merge `claude/upbeat-clarke-2zx8tb` separately after rebasing on main (good quality, 50 commits behind).
6. Catalog poster colours: semantic tokens or an allow-list entry (AUD-031). Schedule repair of main's red suites (AUD-030).

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
| Every new route declared in the capability guard | `f6ca2782`, `8492c065` | AUD-002 (open) | guard list + reasons | `route-capability-guard.test.ts` | ✅ (new-route case) |

## 5. Historical vs current
- Historical defects already fixed later in range: hydration errors (`6d87a403`, `9bb7cc80`); matrix crashes (`666b370d`, `4fcd5a7c`, `7c3f0585`). The current system is not counted as defective for these.
- Current defects listed above exist in the code at the integration tip; the ones marked ✅ no longer exist on the fixed branch.

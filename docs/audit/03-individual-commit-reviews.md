# 03 — Individual commit reviews

Review order: **CURRENT lineage first** (integration, upbeat-clarke, dependabot — 70 commits that could still reach production), then LEGACY (`Tinh_chinh_cac_tinh_nang`, 543 commits). Inventory order (`01`) stays fixed; this file is grouped by branch, chronological inside each group. Finding IDs → `05-revision-plan.md`.

Pass 2 (line by line) covered every changed server file in integration: all `src/app/api/**`, `src/modules/**`, `src/core/**`, `src/lib/**`, `src/layers/**` (89 files). UI pass 2 so far covers the files that call APIs (notification matrix hook, partner tools modal, catalog wizard, nametag/dev endpoint).

Evidence base for this pass: `git show` diffs plus the file at the branch tip (`git show <tip>:<path>`). Gate results for each tip are in `07`; until those exist, a verdict is never better than PASS_WITH_CONCERNS.

## A. integration/all-features-oct27 — 38 non-merge commits

| Hash | Intent (from message + diff) | Findings | Verdict |
|---|---|---|---|
| `fe0d74aa` | Catalog: export 1080×1080 PNG poster for Zalo/Facebook (38 files, +3.6k) | Unbounded slug-retry loop; unvalidated template/style ids — AUD-021. Has a unit test (`resolve-catalog-brief`). No server-side code in scope beyond `catalog-links` route. Rendering not checked in a browser | PASS_WITH_CONCERNS (visual not verified) |
| `e7545157` | Storefront & poster swipe redesign | Test `auto-style-resolver`. Visual not verified | PASS_WITH_CONCERNS |
| `cc937f20` | 4-tier sidebar architecture (Mother/Industry/Chain/Store) | Nav only; no test in this commit (added in `39803b71`) | PASS_WITH_CONCERNS |
| `610b1711` | Collapsible tier-aware sidebar | UI only, no test | PASS_WITH_CONCERNS |
| `39803b71` | Standardise 4 sidebars + SSOT doc | `nav-model.test.ts` updated | PASS_WITH_CONCERNS |
| `21e1a08b` | Finish 4 sidebars per SSOT | `nav-model.test.ts` | PASS_WITH_CONCERNS |
| `198f7b3a` | Toolkit registry + on/off matrix | `tool-registry.test.ts` | PASS_WITH_CONCERNS |
| `46bd3e95` | Fix Tier-2 badge label | 16-line UI fix | PASS |
| `cd858f2c` | Product & inventory nav SSOT for 4 tiers | 2 tests | PASS_WITH_CONCERNS |
| `20f155c7` | Master terminology registry | test present | PASS_WITH_CONCERNS |
| `0a64ae02` | Fix test DB sync, remove Prisma outside infra, tenant tests green | Adds `R1`/`R4` guards to the legacy coordinator-partner path (improvement). The **chain-partner provisioning branch of `POST /coordinator/partners` is still unguarded** and now selected by sniffing body keys — AUD-009 (pre-existing) | PASS_WITH_CONCERNS |
| `f0dce714` | Docs: unify 14 stages + toolkit (PO 27/10) | docs only | NOT_APPLICABLE (docs) |
| `307ab6fa` `0cf2b2f3` `6b8d284f` `f4154e3a` `05c46b24` `4b38648a` | Toolkit group in sidebar: 51 tools / 9 groups, user-pinned shortcuts | UI/nav only. `f4154e3a` adds 473 lines with no test; locked by `267944f1` | PASS_WITH_CONCERNS |
| `267944f1` | Test: lock toolkit group sync | test-only | PASS |
| `5def12db` | Multi-tier tool entitlement | Regression: drops `lead_captured_at` from the platform-owned keys — AUD-017. `tool-entitlement.ts` has **0 non-test importers**; entitlement is only a nav filter (`desktop-nav.tsx:79`, `them/page.tsx:89`), not enforced server-side — AUD-005 | FAIL |
| `8492c065` | ChainOS switchboard to unlock partner tools | `PATCH coordinator/partners/[id]/tools`: no capability check, imports Prisma in the route, accepts any string as a tool key, read-modify-write on `organizations.settings` — AUD-004 | FAIL |
| `f6ca2782` | Multi-tier notification system: 7 tables, 41 events, 11 routes, SSE | Org-wide write routes have no capability check — AUD-002. Platform write routes lack `requirePlatformCapability` — AUD-003. `dispatchNotification` has no caller; the SSE hub is in-memory — AUD-007. Inbox/preferences lack `@@index([organization_id])` — AUD-008. Migration is additive (`CREATE … IF NOT EXISTS`, FKs to `organizations`) — safe. Line-by-line pass 2: the cascade ignores `scopeId` (cross-tenant) — AUD-014; preferences PATCH reads other tenants' locks — AUD-015; unescaped HTML + PII in logs + shared default Telegram chat — AUD-016; tier semantics — AUD-019; validation gaps — AUD-022 | FAIL |
| `405f15cf` | Notification matrix in sidebar + settings pages | UI wired to routes from `f6ca2782`; inherits AUD-002 | PASS_WITH_CONCERNS |
| `6d87a403` `9bb7cc80` | Hydration-mismatch fixes in ToolkitShortcutsGroup | small, mounted-flag pattern | PASS |
| `87c8b675` | Load event/channel catalog for Store/Chain/Industry | `channels` route needs only a tenant session (read-only catalog) — acceptable | PASS_WITH_CONCERNS |
| `7c3f0585` | Fix camelCase/snake_case mismatch in matrix hook | test updated | PASS |
| `c6b2a4c2` | Bump `CURRENT_SCHEMA_VERSION` to refresh the Prisma client | dev-only hot-reload workaround, harmless | PASS |
| `666b370d` `4fcd5a7c` | Crash guards in the notification matrix | defensive fixes | PASS |
| `f56024ca` | AGENTS.md: 4-tier governance standard | docs | NOT_APPLICABLE (docs) |
| `99db1dfc` | 4-tier cascading governance: 5 matrices × 2 tiers | All governance matrix clients keep **state in `useState` only, no fetch/save**; the domain resolvers `cascading-craft-fee`, `cascading-payment-policy`, `cascading-store-policies`, `cascading-template-resolver` have **0 non-test importers** — AUD-006. Also commits third-party client documents and an Office lock file `~$…pptx` under `docs/Audit/` — AUD-011 | FAIL |
| `83fd26ce` | 3-layer boundaries + `check:layers` | test present | PASS_WITH_CONCERNS |
| `db9592b9` | Ratchet baseline after main sync | total went down | PASS |
| `ec71f9b7` | Ratchet baseline for integration | total 29→21, but a **new rule `IT-F05` (1)** was absorbed into the baseline instead of being fixed — AUD-010 | PASS_WITH_CONCERNS |
| `e0b8008b` | Connect 51-tool catalog to picker, fix counter | UI | PASS_WITH_CONCERNS |
| `36f80373` | Remove `/cai-dat` duplicate from store_admin priority | 1-line | PASS |
| `d4212e74` | Remove duplicate sidebar hrefs, all 4 tiers | adds `nav-duplicate-audit.test.ts` | PASS |

Merge commits in integration (9) — reviewed for conflict resolution in pass 2 (`git show --cc`), status IN_REVIEW.

## B. claude/upbeat-clarke-2zx8tb — 11 non-merge commits (not in main)

| Hash | Intent | Findings | Verdict |
|---|---|---|---|
| `9776fe85` | Telegram dispatch status stable on transient errors | route test updated | PASS_WITH_CONCERNS (gates pending) |
| `f216d1f2` | Log + retry once on Telegram network errors | bounded (`MAX_ATTEMPTS = 2`), no retry for requests with a body, token kept out of logs; test added | PASS_WITH_CONCERNS |
| `805c8fbe` | Upload subcontract photo when Telegram can't fetch the URL | SSRF guarded: host allowlist (own app/storage host), `redirect: "error"`, timeout, `image/*`, 10 MB cap. Body is buffered before the size check — AUD-013 (P4) | PASS_WITH_CONCERNS |
| `507ab590` | Show selected size price in order header | test added | PASS_WITH_CONCERNS |
| `44dacbaf` | Per-branch results after resend | 1-line UI | PASS |
| `a1b61be1` | Show Telegram's reason on failed test message | test updated | PASS_WITH_CONCERNS |
| `ef1914fb` | 1:1 shop-owner setup guide | UI copy | PASS |
| `ddda38f3` | Remove a linked Telegram chat | test added | PASS_WITH_CONCERNS |
| `b4858c21` | API doc for DELETE | docs | NOT_APPLICABLE (docs) |
| `ccb2059a` | Partner list active/paused toggle | `requireTenantContext` + `requireCapability(assignFlorist)` + zod + tenant test | PASS_WITH_CONCERNS |
| `869a97bb` | E2E snapshot alignment | test-only | PASS_WITH_CONCERNS (E2E not run) |

Branch is 50 commits behind main → integration risk is the merge, not the code (see `05`).

## C. dependabot — 4 commits

| Hash | Change | Verdict |
|---|---|---|
| `22e76e31` | `@anthropic-ai/sdk` 0.135→0.137, `lucide-react` 1.59→1.61 | BLOCKED — dependency change needs PO approval (CLAUDE.md); gates not run on it |
| timm / torchvision / torch | raise lower bounds in `workers/requirements` | BLOCKED — same; torch ≥ 2.14.1 needs a worker test run with the real wheels |

## D. LEGACY — Tinh_chinh_cac_tinh_nang (543)

NOT_STARTED. Its review method (AUD-001): per commit, confirm intent, diff and test, then mark whether the change **survived into main**. The current-system verdict is taken from main, not from this branch.

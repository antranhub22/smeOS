# 07 — Final verification (gate evidence)

Run 2026-10-28 in the cloud container. Postgres 16 local, databases `smeos_test` / `fix_test` (names end in `_test`). CI-style fake secrets (`ci-only-not-a-real-*`), the same as `.github/workflows/ci.yml`. Logs live in the session scratchpad (not committed).

Three trees, gates run on each:
- **main** = `origin/main` @ `c76aab97`
- **integration** = `origin/integration/all-features-oct27` @ `d4212e74`
- **fixed** = `claude/dreamy-pasteur-004l8i` @ `b4eba228` → `61859c8f` → `3a6477fa` (integration + fixes from `06`)

| Gate | main | integration | fixed | New vs main (fixed) |
|---|---|---|---|---|
| `prisma migrate deploy` on an empty DB | — | ✅ 13 migrations | ✅ | — |
| `npm run typecheck` | ❌ 1 error (`nodemailer`, AUD-023) | ❌ same | ❌ same | **0** |
| `npm test` | ❌ 103 failed / 2,823 passed | ❌ 97 / 2,914 (2 new) | ❌ 95 / 2,929 | **0** new; 8 of main's reds pass |
| `npm run lint:ratchet` | ❌ 38 entries | ❌ 40 (3 new) | ❌ 36 | **0** |
| `npm run lint:ux -- --check` | ❌ | ❌ | ❌ | **~105 new** (AUD-031, not fixed — design decision) |
| `npm run check:template-ssot` | ✅ | ✅ | ✅ | — |
| `npm run check:docs` | ❌ 39 | ❌ 81 (42 new) | ❌ 39 | **0** |
| `npm run test:tenant` | ❌ 12 failed / 552 | ❌ 3 / 561 | ❌ 2 / 569 | **0** (both reds = `product-copies` generate, also red on main) |
| `npm run test:platform` | ✅ 28 | ✅ | ✅ 28 | — |
| `npm run build` | ✅ | ✅ | ✅ | — |
| `cd workers && pytest` (Python 3.13, `requirements.txt`) | — | — | ✅ **471 passed** | `workers/` identical to main. Dependabot torch/timm/torchvision only raise bounds in `requirements-local-cv.txt` (GPU extra, not installed in CI) |
| `npm run test:e2e:ux` (Playwright, CI recipe: `db:deploy` + `db:seed` + `build` + `start`, `PW_CHROMIUM_PATH`) | ❌ 3 failed / 9 | ❌ 5 / 7 (2 new: axe contrast) | ❌ 3 / 9 (`3a6477fa`) | **0** — same 3 as main (role homepage ×2, `/vai-tro` snapshot; fixed by `869a97bb` on upbeat-clarke) |
| `npm audit --omit=dev --audit-level=high` (CI gate) | — | — | ✅ (1 moderate: `fast-uri`) | AUD-035; incl. dev: 1 high, 4 moderate, 3 low |
| gitleaks 8.21.2 (CI pin, SHA-256 verified), full history | 70 known (allow-listed) | +3 | **0 new** vs main | 3 false positives (policy keys, localStorage key) added to `.gitleaksignore` |
| `prisma migrate diff` (migrations → schema) | — | — | ✅ no table/column drift | 8 index/constraint names differ (AUD-032) |
| Rule audit, every added line of all 519 non-merge commits | — | — | 330 clean; hits re-checked at HEAD | `03b`, AUD-034 |
| CodeQL | runs in CI | — | — | results not visible from this session |

Notes
- The first `build` on the fixed branch failed only because this session symlinked `node_modules` from another worktree (Turbopack refuses files outside the root). Re-run in a worktree with a real `node_modules`: ✅.
- "New vs main" compares failure sets test-by-test (`comm` on test ids), not just counts.
- main's own red suites (unit 95+, tenant 12, typecheck 1, ESLint 38, docs 39) are pre-existing and outside this range (AUD-030, AUD-023). Per CLAUDE.md they were not fixed here.

## Ledger state (`02`, per commit in `03b`) — all 613 commits have a terminal status
| Status | Commits | Meaning |
|---|---|---|
| VERIFIED | 465 | reviewed (manual diff for current lineage; line-level rule audit + survival for legacy) and the surviving code passes every gate at HEAD |
| FIX_REQUIRED | 103 | 102 legacy commits whose oversized file / `any` still exists at HEAD (AUD-034, debt), plus `99db1dfc` (AUD-006/011, PO scope) |
| FIXED | 3 | `5def12db`, `8492c065`, `f6ca2782` — fixed on this branch; open remainder named in the ledger |
| NOT_APPLICABLE | 38 | 35 superseded legacy commits (< 10 % of lines in main / no code) + 3 docs-only |
| BLOCKED | 4 | dependabot bumps awaiting PO (AUD-012) |

# 07 — Final verification (gate evidence)

Run 2026-10-28 in the cloud container. Postgres 16 local, databases `smeos_test` / `fix_test` (names end in `_test`). CI-style fake secrets (`ci-only-not-a-real-*`), the same as `.github/workflows/ci.yml`. Logs live in the session scratchpad (not committed).

Three trees, gates run on each:
- **main** = `origin/main` @ `c76aab97`
- **integration** = `origin/integration/all-features-oct27` @ `d4212e74`
- **fixed** = `claude/dreamy-pasteur-004l8i` @ `b4eba228` (integration + fixes from `06`)

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
| `cd workers && pytest` | not run | not run | not run | no `workers/**` change in the current lineage; dependabot torch/timm bumps BLOCKED (AUD-012) |
| `npm run test:e2e:ux` (Playwright) | not run | not run | not run | BLOCKED: needs a seeded DB + running app; not attempted in this session |
| Dependency / CVE scan | not run | — | — | NOT_ASSESSED (`npm audit` needs the advisory API; CodeQL runs in CI, results not visible here) |

Notes
- The first `build` on the fixed branch failed only because this session symlinked `node_modules` from another worktree (Turbopack refuses files outside the root). Re-run in a worktree with a real `node_modules`: ✅.
- "New vs main" compares failure sets test-by-test (`comm` on test ids), not just counts.
- main's own red suites (unit 95+, tenant 12, typecheck 1, ESLint 38, docs 39) are pre-existing and outside this range (AUD-030, AUD-023). Per CLAUDE.md they were not fixed here.

## Ledger state after this pass (`02`)
- CURRENT lineage 70: 53 non-merge reviewed (9 FIX_REQUIRED → 6 now fixed on this branch, 3 still need PO), 17 merges VERIFIED, 4 dependabot BLOCKED.
- LEGACY 543: 77 merges VERIFIED, 35 NOT_APPLICABLE (superseded / no code), 431 IN_REVIEW: their surviving code is judged through the current-state audit (`04`); a per-commit historical re-read is **not done**.

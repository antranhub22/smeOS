# 00 — Audit baseline

Status: IN PROGRESS · Started 2026-10-28 · Working branch `claude/dreamy-pasteur-004l8i` (created from `main`; audit docs only — no branch under audit is modified).

## 1. Scope (approved: option C — "100% of commits not in main")

Audit range = every commit reachable from the 7 tips below and **not** reachable from `origin/main` (`c76aab97`, 2026-10-27):

```
git rev-list <tips> ^origin/main      # 613 commits = 519 non-merge + 94 merge
```

| Tip | Head | vs main (behind/ahead) | Notes |
|---|---|---|---|
| `integration/all-features-oct27` | `d4212e74` | 0 / 47 | Contains in full: `Nangcap_kientruc4tang_…`, `Nangcap_hethongnotification`, `Nangcap_hethongchucnang`, `Thietke_sidebar_ALL`, `Nangcap_chucnangCatalog`, plus `Hopnhat_chucnang-congcu`, `Chuanhoa_Terminology`, `Nangcap_kientrucREPOSITORIES` (9 merge commits) |
| `claude/upbeat-clarke-2zx8tb` | `869a97bb` | 50 / 19 | Base `80517fa5` (2026-10-23); 11 non-merge commits, none patch-equivalent in main |
| `dependabot/npm_and_yarn/npm-minor-patch-72165c928b` | `22e76e31` | 50 / 1 | `@anthropic-ai/sdk` 0.135→0.137, `lucide-react` 1.59→1.61 |
| `dependabot/pip/workers/timm-gte-1.0.30` | — | 50 / 1 | workers requirement |
| `dependabot/pip/workers/torchvision-gte-0.29.1` | — | 50 / 1 | workers requirement |
| `dependabot/pip/workers/torch-gte-2.14.1` | — | 50 / 1 | workers requirement |
| `Tinh_chinh_cac_tinh_nang` | `7f6c8f8c` | **no common ancestor** / 543 | see §3.2 |

`Toiuu_hienthi_mobile` (branch #1 in the original list) is **out of scope** — the user selected #3–#13.

## 2. Repository state at baseline

- Working tree clean on `claude/dreamy-pasteur-004l8i` = `c76aab97`; no staged/unstaged/untracked user changes, so nothing needed preserving. No tags in the repo.
- 3,764 tracked files on main; 586 test files; 12 Prisma migrations starting at `20261022000000_smeos_baseline`.
- CI: `.github/workflows/ci.yml`, `codeql.yml`. Gates per `CLAUDE.md` "Definition of done".
- `node_modules` absent at baseline; `DATABASE_URL` unset. Tools present: Node 22.22.0, `psql`, `docker`.

## 3. Key structural findings (before per-commit review)

### 3.1 integration already merges branches #3–#7
`git rev-list integration..<branch>` = 0 for all five, so the user's assumption "integration aggregates #3–#13" is **false for #8–#13**.

### 3.2 `Tinh_chinh_cac_tinh_nang` is an unrelated (pre-rewrite) history — **finding AUD-001 (P1, confirmed)**
- `git merge-base origin/main origin/Tinh_chinh_cac_tinh_nang` → none. Its root is `15508f97` "P0: dựng khung floraos-core" (2026-09-09); main's roots begin 2026-10-20 and its migrations restart at `20261022000000_smeos_baseline`.
- 0 of its 465 distinct non-merge subjects appear in main, yet its latest feature (`7f6c8f8c`, dismissal proposal) exists in main in evolved form: all 15 sampled files exist in main with small diffs. → main was rebuilt from this work with squashed history.
- `git diff main Tinh_chinh` = 1,931 files, +15,122 / −109,240; it adds 23 obsolete migration folders (`0_init`, `20260917…` … `20261006…`).
- **Impact:** merging this branch would delete ~109k lines of current code and re-introduce 23 migrations that conflict with `smeos_baseline` → `npm run db:deploy` in production would fail or corrupt the migration history. **Must not be merged.**
- Audit treatment: its 543 commits are LEGACY lineage. Each is still reviewed (as the user requested 100%), but the "current correctness" question is answered against main, and the verdict records whether the change survived into main.

### 3.3 `claude/upbeat-clarke-2zx8tb` holds real unmerged work
11 greeting-card/Telegram commits (2026-10-23) not in main or integration. It is 50 commits behind main.

## 4. Sources of truth for intended behaviour
`CLAUDE.md`, `.agents/AGENT_RULES.md`, `docs/00-DOCUMENTATION-REGISTRY.yaml`, `docs/00-DOCUMENTATION-CONSTITUTION.md`, `docs/kien-truc/TRANG_THAI.md` §4–6, module Screen Contracts, commit messages, and tests. Where none states the intent, the review says so (ambiguity), it does not invent it.

## 5. Method
1. Inventory (`01`) and ledger (`02`), fixed order, 13 batches of 50.
2. Per-commit review (`03`): diff + surrounding code + tests, verdict PASS / PASS_WITH_CONCERNS / FAIL / BLOCKED / NOT_APPLICABLE.
3. Gate runs on each **current** tip (integration, upbeat-clarke) in a separate `git worktree` under the scratchpad — never on shared branches.
4. Fixes only for confirmed defects, on the working branch, each tied to a finding ID with a regression test.

## 6. Safety precautions
- No reset/clean/force-push/amend; no merge into shared branches; branches under audit are read-only.
- `test:tenant`/`test:platform` run only against a local DB whose name ends in `_test`.
- No dependency installs beyond `npm ci` from the committed lockfile; dependabot bumps are reviewed, not applied (dependency changes need PO approval).
- No secrets or customer data copied into reports; author emails omitted from the inventory.

## 7. Known limitations
- External services (OpenAI/Anthropic, Telegram, S3/R2, Render) are unavailable → behaviour depending on them is BLOCKED unless covered by tests with fakes.
- Browser E2E depends on Playwright + a running DB; marked BLOCKED if they cannot run.
- The audit spans many sessions; the ledger in `02` is the resume point.

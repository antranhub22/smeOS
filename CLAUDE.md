# CLAUDE.md — FloraOS Core

Multi-tenant SaaS for SMEs: Next.js 16 + Prisma 7/Postgres (`src/`), Python workers (`workers/`).
Status `CANONICAL` · owner: Product Owner (PO) · changes need PO approval. Loaded every session — keep it short; detail lives in the files it points to.

## Non-negotiables

1. **`[PROD]` by default** — do exactly what was asked; no unrequested refactors, renames or dependency bumps. `[EXPLORE]` only when the user writes it.
2. **Tenancy:** `organization_id` comes only from `requireTenantContext()`, never body/query/headers. Cross-tenant access → **404, never 403**. Every tenant-owned table has `organization_id` + `@@index([organization_id])`.
3. **Authorization** by capability code (`requireCapability()`), never by UI role/`roleKey`.
4. **Architecture:** `domain/` never imports Prisma/infra; Prisma only in `infra/`; provider SDKs only in `adapters/`.
5. **AI:** every call goes through `callCapability` (`src/core/ai/gateway.ts`) — no direct provider calls; every retry/loop is bounded.
6. **UI text** is natural Vietnamese; semantic tokens only; no tech codes (`M01a`, `P2`…) on screen.
7. **≤ 350 lines per file.**
8. **No secrets / customer data / `.env` content** in code, logs, commits or replies.
9. **Never report done with a red gate**; never skip/disable a test.

UI work: Design System SSOT is `docs/design-system/README.md`; Progressive Disclosure is mandatory — read `docs/dac-ta/ux-patterns/OPERATING_PRINCIPLES.md` first.

Full rulebook (anti-patterns A1–A12, security, performance, Journey-First UX, known failures): `.agents/AGENT_RULES.md` — read the sections relevant to the task.

## Before coding

- Domain skills in `.claude/skills/` load automatically by task (api, ui, ai, worker, db schema, testing, creative studio). Read every skill that applies.
- Find SSOT in `docs/00-DOCUMENTATION-REGISTRY.yaml` with `grep`; current state: read §4–6 of `docs/kien-truc/TRANG_THAI.md` and grep the rest (never read whole).
- Read the real code and its tests before changing them; a ticked checklist or a doc is not evidence.
- Conflicts: user → `AGENT_RULES.md` → CONSTITUTION → `docs/design-system/` (UI SSOT) = architecture/`TRANG_THAI.md` → skill → `AGENTS.md` → code. Skill `ui-ux-pro-max` is reference only; cấm "Generate Design System" (ADR-011 D-UI-11).

## Stop and ask the PO first when the task would

- touch a feature where the user uploads photos (confirm which of the 14 journey stages run);
- change `prisma/schema.prisma` at all (database-schema skill) — every change ships a `prisma migrate dev` migration; production runs `npm run db:deploy`;
- weaken tenancy, RBAC ceilings, the AI privacy floor, the model license filter, or auth/SSO;
- change PO-locked UX (`<FeatureGuidanceCard />`, Tab Action Header);
- add a dependency, provider, paid API, or change CI/`render.yaml`;
- run anything destructive outside a `_test` database, or rewrite shared git history.

Otherwise pick the conventional default, state it, and proceed.

## Definition of done (mirrors `.github/workflows/ci.yml`)

| Gate | Command | When |
|---|---|---|
| Types + lint | `npm run typecheck && npm run lint:ratchet` (no new ESLint errors per file × rule) | TS changes |
| UX lint ratchet | `npm run lint:ux -- --check` | `.tsx` in `src/app`, `src/components` |
| Unit | `npm test` | always |
| Tenant / platform isolation | `npm run test:tenant` · `npm run test:platform` | data access, routes, schema, auth, RBAC — **blocking** |
| Template SSOT | `npm run check:template-ssot` | `src/components/templates/**` |
| Contracts / docs | `npm run check:schemas:creative` (`:coordinator`, `:content-engine`) · `npm run check:docs` | zod contracts · spec docs |
| Worker | `cd workers && python -m pytest tests -q` | `workers/**` |
| Build · E2E UX | `npm run build` · `npm run test:e2e:ux` | config/routing · new screens |

**Rule: no new failures versus `main`.** Known leftover: 78 old ESLint errors, ratcheted (`TECHNICAL_DEBT.md` #172). For anything else red, compare against it (`git worktree add /tmp/base origin/main`) and report "pre-existing" vs "new"; only new failures block. Never fix unrelated pre-existing failures under `[PROD]`.

New rule/fix ships with a test; unguarded routes listed in `tests/unit/architecture/route-capability-guard.test.ts`; Screen Contracts update in same commit; recurring failures get a row in `AGENT_RULES.md` §14. Files > 350 lines: don't grow; split when rewriting. Never claim a gate passed if blocked.

## Safety traps

- `test:tenant`/`test:platform` **TRUNCATE all tables**; they run only on a DB named `*_test` (`npm run db:test:setup` once). Check `echo "[$DATABASE_URL]"` before any Prisma CLI command.
- Use `npm test`, never bare `npx vitest run` (pulls tenant suites in). A `.claude/hooks` guard denies bare `vitest run` and asks before Prisma writes to a non-local DB.
- Prisma 7: URL lives in `prisma.config.ts`; run `npx prisma generate` after editing the schema before trusting `tsc`.
- Next.js 16 differs from training data — check `node_modules/next/dist/docs/` for unfamiliar APIs.
- More: `AGENTS.md` → "Bẫy" (grep it).

## Git & reporting

- Feature branch only; Conventional Commits (`feat|fix|chore|docs|test(scope): …`); code + tests + docs in one commit; no `--no-verify`, no force-push on shared branches.
- Ported code from FloraOS/LocalBudd/SocialFlow needs a REUSE/EXTEND/ADAPTER rank (`docs/archive/historical/HARVEST_MANIFEST.md`).
- Reply in Vietnamese; identifiers, schema and commits in English. Report what changed (`file:line`), gates run + results, and what was not verified. Out-of-scope findings: mention, don't fix.

## Commands

Setup `docker compose up -d && npm i && npx prisma generate && npm run db:deploy && npm run db:seed` · dev `npm run dev` (port 3200) · web + workers `npm run dev:core` · workers `npm run worker:media|worker:vision|worker:video`.

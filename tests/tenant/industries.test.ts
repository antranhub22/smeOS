import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

import { OrganizationRepository } from "@/modules/organization/infra/organization-repository"
import { resolveTierChain } from "@/modules/organization/infra/tier-chain-repository"
import { GreetingCardRepository } from "@/modules/greeting-card/infra/greeting-card-repository"

import { disconnectDatabase, prisma, resetDatabase } from "../helpers/database"
import { createTenant, type Tenant } from "../helpers/fixtures"

/**
 * CSDL test của CI dựng bằng `db push` (không chạy migration) → thiếu dòng seed và trigger của migration
 * `*_industries`. Cài đúng phần đó từ chính tệp migration, như `rls.test.ts` làm với chính sách RLS.
 */
async function ensureIndustriesMigration(): Promise<void> {
  const dir = path.join(process.cwd(), "prisma/migrations")
  const migration = readdirSync(dir).find((d) => d.endsWith("_industries"))
  if (!migration) throw new Error("Không thấy migration industries")
  const sql = readFileSync(path.join(dir, migration, "migration.sql"), "utf8")
  const seed = sql.match(/INSERT INTO "industries"[\s\S]*?DO NOTHING;/)?.[0]
  const fn = sql.match(/CREATE OR REPLACE FUNCTION smeos_organizations_sync_industry_key[\s\S]*?END \$\$;/)?.[0]
  const trigger = sql.match(/CREATE TRIGGER "organizations_sync_industry_key"[\s\S]*?;/)?.[0]
  if (!seed || !fn || !trigger) throw new Error("Migration industries thiếu seed / hàm / trigger")
  await prisma.$executeRawUnsafe(seed)
  const exists = await prisma.$queryRaw<Array<{ n: number }>>`
    SELECT count(*)::int AS n FROM pg_trigger WHERE tgname = 'organizations_sync_industry_key'`
  if ((exists[0]?.n ?? 0) === 0) {
    await prisma.$executeRawUnsafe(fn)
    await prisma.$executeRawUnsafe(trigger)
  }
}

/** ADR-012 D-T6, bước T-6a: bảng `industries` + `organizations.industry_key`, đồng bộ từ `settings.industry`. */
describe("industries — ngành của tổ chức thành cột có khoá ngoại", () => {
  let t: Tenant

  beforeAll(async () => {
    await ensureIndustriesMigration()
  })

  beforeEach(async () => {
    await resetDatabase()
    t = await createTenant("tiem-hoa")
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  const keyOf = async () => (await prisma.organizations.findUniqueOrThrow({ where: { id: t.organizationId } })).industry_key

  it("có đủ ngành của plugin; Điện hoa đang dùng", async () => {
    const keys = (await prisma.industries.findMany({ orderBy: { key: "asc" } })).map((i) => i.key)
    expect(keys).toEqual(expect.arrayContaining(["FLORAL", "FASHION", "FNB", "CRAFT_GIFT", "RETAIL_GENERAL", "SERVICES", "HOMESTAY"]))
    expect((await prisma.industries.findUniqueOrThrow({ where: { key: "FLORAL" } })).status).toBe("ACTIVE")
  })

  it("ghi settings.industry (đường cũ) → industry_key theo, không phân biệt hoa thường; mã lạ để trống", async () => {
    await prisma.organizations.update({ where: { id: t.organizationId }, data: { settings: { industry: "homestay" } } })
    expect(await keyOf()).toBe("HOMESTAY")
    expect((await resolveTierChain(t.organizationId))?.industryKey).toBe("HOMESTAY")

    await prisma.organizations.update({ where: { id: t.organizationId }, data: { name: "Đổi tên" } })
    expect(await keyOf()).toBe("HOMESTAY")

    await prisma.organizations.update({ where: { id: t.organizationId }, data: { settings: { industry: "KHONG_CO" } } })
    expect(await keyOf()).toBeNull()
    expect((await resolveTierChain(t.organizationId))?.industryKey).toBe("KHONG_CO") // dự phòng settings tới T-6c
  })

  it("industry_key là khoá ngoại: không ghi được mã ngoài bảng industries", async () => {
    await expect(
      prisma.organizations.update({ where: { id: t.organizationId }, data: { industry_key: "KHONG_CO" } }),
    ).rejects.toThrow()
    await prisma.organizations.update({ where: { id: t.organizationId }, data: { industry_key: "FNB" } })
    expect((await resolveTierChain(t.organizationId))?.industryKey).toBe("FNB")
  })

  it("T-6b: dòng tổ chức đọc qua repository lấy settings.industry theo cột (cột là nguồn chuẩn)", async () => {
    await prisma.organizations.update({ where: { id: t.organizationId }, data: { industry_key: "HOMESTAY" } })
    expect((await new OrganizationRepository().current(t.ctx))?.settings?.industry).toBe("HOMESTAY")
    expect(((await new GreetingCardRepository().getShopProfile(t.organizationId)).settings as Record<string, unknown>).industry).toBe("HOMESTAY")
  })
})

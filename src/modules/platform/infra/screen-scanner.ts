import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"

export interface ScreenItem {
  route: string
  pagePath: string
  screenId: string
  title: string
  module: string
  tier: "MOTHER" | "INDUSTRY" | "CHAIN" | "STORE" | "PUBLIC" | "AUTH"
  tierLabel: string
  archetype: "A" | "B" | "C" | "D" | "E" | "F"
  archetypeLabel: string
  status: "CONTRACT_V2" | "CONTRACT_V1" | "EXEMPT"
  isDynamic: boolean
  sampleUrl: string
  contractFile?: string | undefined
  acceptance?: string[] | undefined
}

export interface ScreenCatalogSummary {
  total: number
  coveredV2: number
  coveredV1: number
  exempt: number
  coveragePercent: number
  byTier: {
    STORE: number
    MOTHER: number
    CHAIN: number
    PUBLIC: number
    AUTH: number
    INDUSTRY: number
  }
  byArchetype: {
    A: number
    B: number
    C: number
    D: number
    E: number
    F: number
  }
  screens: ScreenItem[]
}

const TIER_LABELS: Record<string, string> = {
  STORE: "StoreOS (Cửa hàng)",
  MOTHER: "SaaS Mother (Vận hành)",
  CHAIN: "ChainOS (Chuỗi)",
  PUBLIC: "Khách xem công khai",
  AUTH: "Xác thực / Đăng nhập",
  INDUSTRY: "SaaS Ngành",
}

const ARCHETYPE_LABELS: Record<string, string> = {
  A: "A — Tổng quan (Dashboard)",
  B: "B — Danh sách dữ liệu",
  C: "C — Chi tiết thực thể",
  D: "D — Biểu mẫu nhập liệu",
  E: "E — Thiết kế / Soạn thảo",
  F: "F — Thiết lập / Cấu hình",
}

function findPageFiles(dir: string): string[] {
  const pages: string[] = []
  if (!existsSync(dir)) return pages

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== "api" && entry.name !== "node_modules" && !entry.name.startsWith(".")) {
        pages.push(...findPageFiles(full))
      }
    } else if (entry.name === "page.tsx") {
      pages.push(full)
    }
  }
  return pages
}

function normalizeRoute(pagePath: string, appDir: string): string {
  const rel = pagePath.slice(appDir.length).replace(/\\/g, "/")
  const withoutPage = rel.replace(/\/page\.tsx$/, "")
  const cleaned = withoutPage.replace(/\([^)]+\)\/?/g, "")
  return cleaned === "" ? "/" : cleaned.startsWith("/") ? cleaned : `/${cleaned}`
}

function classifyTier(route: string, pagePath: string): "MOTHER" | "INDUSTRY" | "CHAIN" | "STORE" | "PUBLIC" | "AUTH" {
  if (pagePath.includes("/(platform)/") || route.startsWith("/van-hanh") || route.startsWith("/cai-dat-ai")) {
    return "MOTHER"
  }
  if (route.startsWith("/dieu-phoi")) {
    return "CHAIN"
  }
  if (pagePath.includes("/(auth)/") || route.startsWith("/dang-nhap") || route.startsWith("/dang-ky")) {
    return "AUTH"
  }
  const publicPrefixes = [
    "/c/",
    "/ch/",
    "/g/",
    "/b/",
    "/bst/",
    "/s/",
    "/chia-se",
    "/subcontract",
    "/xem-truoc-trang",
    "/chinh-sach-bao-mat",
    "/dieu-khoan",
  ]
  if (publicPrefixes.some((p) => route === p.replace(/\/$/, "") || route.startsWith(p))) {
    return "PUBLIC"
  }
  return "STORE"
}

function inferArchetype(route: string): "A" | "B" | "C" | "D" | "E" | "F" {
  if (route === "/" || route === "/van-hanh" || route === "/dieu-phoi" || route.endsWith("/tong-quan")) {
    return "A"
  }
  if (route.includes("tao-moi") || route.includes("them-moi") || route.includes("/edit")) {
    return "D"
  }
  if (route.includes("[") && route.includes("]")) {
    return "C"
  }
  if (route.includes("cai-dat") || route.includes("cau-hinh") || route.includes("thiet-lap")) {
    return "F"
  }
  if (route.includes("studio") || route.includes("builder") || route.includes("bien-tap")) {
    return "E"
  }
  return "B"
}

function generateReadableTitle(route: string): string {
  if (route === "/") return "Bảng điều khiển Trang chủ (Toolkit Home)"
  if (route === "/van-hanh") return "Tổng quan Nền tảng SaaS Mother"
  if (route === "/dieu-phoi") return "Tháp điều phối Đơn hàng ChainOS"
  if (route === "/dang-nhap") return "Cổng Đăng nhập & Xác thực"

  const parts = route.split("/").filter(Boolean)
  const last = parts[parts.length - 1] || ""

  return last
    .replace(/\[([^\]]+)\]/g, "Chi tiết $1")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function parseContractHeader(content: string): {
  id?: string
  tier?: "MOTHER" | "INDUSTRY" | "CHAIN" | "STORE" | "PUBLIC" | "AUTH"
  module?: string
  route?: string
  archetype?: "A" | "B" | "C" | "D" | "E" | "F"
  title?: string
} {
  const result: ReturnType<typeof parseContractHeader> = {}
  const titleMatch = content.match(/^#\s+(?:Screen Contract\s*—\s*)?([^\r\n]+)/m)
  if (titleMatch && titleMatch[1]) {
    result.title = titleMatch[1].trim()
  }

  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (fmMatch && fmMatch[1]) {
    const lines = fmMatch[1].split("\n")
    for (const line of lines) {
      const idx = line.indexOf(":")
      if (idx > -1) {
        const key = line.slice(0, idx).trim()
        const val = line.slice(idx + 1).trim()
        if (key === "id") result.id = val
        if (key === "tier") result.tier = val as "MOTHER" | "INDUSTRY" | "CHAIN" | "STORE" | "PUBLIC" | "AUTH"
        if (key === "module") result.module = val
        if (key === "route") result.route = val
        if (key === "archetype") result.archetype = val as "A" | "B" | "C" | "D" | "E" | "F"
      }
    }
  }
  return result
}

function loadExemptions(contractsDir: string): Map<string, string> {
  const map = new Map<string, string>()
  const file = join(contractsDir, "_exemptions.yaml")
  if (!existsSync(file)) return map
  try {
    const content = readFileSync(file, "utf-8")
    const matches = content.matchAll(/-\s*route:\s*["']?([^"'\r\n]+)["']?\s*(?:\r?\n\s*reason:\s*["']?([^"'\r\n]+)["']?)?/g)
    for (const m of matches) {
      if (m[1]) {
        map.set(m[1].trim(), m[2]?.trim() || "Miễn trừ theo đặc tả")
      }
    }
  } catch {
    // Ignore
  }
  return map
}

export function discoverScreens(): ScreenCatalogSummary {
  const cwd = process.cwd()
  const appDir = join(cwd, "src/app")
  const contractsDir = join(cwd, "docs/dac-ta/screen-contracts")
  const exemptions = loadExemptions(contractsDir)

  const pages = findPageFiles(appDir)

  // Đọc danh mục contracts
  const contracts: Array<{ file: string; content: string; header: ReturnType<typeof parseContractHeader> }> = []
  if (existsSync(contractsDir)) {
    for (const f of readdirSync(contractsDir)) {
      if (f.endsWith(".md") && !f.startsWith("_TEMPLATE") && !f.startsWith("README")) {
        const full = join(contractsDir, f)
        const content = readFileSync(full, "utf-8")
        contracts.push({ file: f, content, header: parseContractHeader(content) })
      }
    }
  }

  const screens: ScreenItem[] = []
  const byTier = { STORE: 0, MOTHER: 0, CHAIN: 0, PUBLIC: 0, AUTH: 0, INDUSTRY: 0 }
  const byArchetype = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }
  let coveredV2 = 0
  let coveredV1 = 0
  let exempt = 0

  for (const page of pages) {
    const route = normalizeRoute(page, appDir)
    const relPage = relative(cwd, page).replace(/\\/g, "/")
    const isDynamic = route.includes("[") && route.includes("]")

    // Tìm contract v2 qua route
    const isExempt = exemptions.has(route)
    const v2Contract = contracts.find((c) => c.header.route === route)
    // Tìm contract v1
    const slug = route.split("/").filter(Boolean)[0] || "index"
    const v1Contract = contracts.find((c) => {
      const baseName = c.file.replace(/\.md$/, "")
      return baseName === slug || c.content.includes(`\`${route}\``)
    })

    const contract = v2Contract || v1Contract
    const status: "CONTRACT_V2" | "CONTRACT_V1" | "EXEMPT" = isExempt
      ? "EXEMPT"
      : v2Contract
        ? "CONTRACT_V2"
        : v1Contract
          ? "CONTRACT_V1"
          : "EXEMPT"

    if (status === "CONTRACT_V2") coveredV2++
    else if (status === "CONTRACT_V1") coveredV1++
    else exempt++

    const rawTier = v2Contract?.header.tier || classifyTier(route, relPage)
    const tier = rawTier in byTier ? rawTier : "STORE"
    byTier[tier]++

    const rawArchetype = v2Contract?.header.archetype || inferArchetype(route)
    const archetype = rawArchetype in byArchetype ? rawArchetype : "B"
    byArchetype[archetype]++

    const screenId =
      v2Contract?.header.id ||
      `SCR-${tier}-${route.replace(/^\//, "").replace(/\//g, "-").replace(/\[|\]/g, "") || "home"}`

    const title =
      v2Contract?.header.title ||
      v1Contract?.header.title ||
      generateReadableTitle(route)

    const moduleName =
      v2Contract?.header.module ||
      relPage.split("/")[2]?.replace(/^\(|\)$/g, "") ||
      "core"

    // Sinh sample URL cho các route có tham số
    let sampleUrl = route
    if (isDynamic) {
      sampleUrl = route
        .replace(/\[id\]/g, "sp-demo-1")
        .replace(/\[code\]/g, "ORD-DEMO")
        .replace(/\[slug\]/g, "shop-demo")
        .replace(/\[jobId\]/g, "job-1")
        .replace(/\[branchId\]/g, "branch-1")
        .replace(/\[token\]/g, "demo-token")
    }

    screens.push({
      route,
      pagePath: relPage,
      screenId,
      title,
      module: moduleName,
      tier,
      tierLabel: TIER_LABELS[tier] || tier,
      archetype,
      archetypeLabel: ARCHETYPE_LABELS[archetype] || archetype,
      status,
      isDynamic,
      sampleUrl,
      contractFile: contract?.file,
    })
  }

  // Sắp xếp thứ tự: Tầng (MOTHER, CHAIN, STORE, PUBLIC, AUTH) -> Route
  const tierWeight: Record<string, number> = { MOTHER: 1, CHAIN: 2, STORE: 3, PUBLIC: 4, AUTH: 5, INDUSTRY: 6 }
  screens.sort((a, b) => {
    const wa = tierWeight[a.tier] || 99
    const wb = tierWeight[b.tier] || 99
    if (wa !== wb) return wa - wb
    return a.route.localeCompare(b.route)
  })

  const total = screens.length
  const coveragePercent = total > 0 ? Math.round(((coveredV2 + coveredV1 + exempt) / total) * 100) : 100

  return {
    total,
    coveredV2,
    coveredV1,
    exempt,
    coveragePercent,
    byTier,
    byArchetype,
    screens,
  }
}

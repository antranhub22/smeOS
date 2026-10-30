/**
 * 10 module quy trình phát triển của shop — cách trình bày trang /cong-cu.
 *
 * Nguồn: "Nâng cấp Dashboard theo 10 module quy trình" (SMEOS Business Growth Platform).
 * Mỗi module chia ba giai đoạn (Nền tảng · Marketing & bán hàng · Tự động & AI) và gắn
 * công cụ có sẵn trong `toolkit-catalog.ts` theo mã. Công cụ chưa thuộc module nào
 * (quản lý chuỗi, tối ưu hệ thống) nằm ở khu riêng `EXTRA_SECTION`.
 *
 * Dev: hiện toàn bộ, kể cả công cụ mục tiêu chưa làm (`growth-module-roadmap.ts`).
 * Giai đoạn không có công cụ nào thì không hiện, ở mọi môi trường.
 * Production: chỉ hiện công cụ DONE; module không còn công cụ nào thì ẩn.
 */

import { getAllTools, type ToolDefinition } from "./toolkit-catalog"
import { GROWTH_MODULE_ROADMAP } from "./growth-module-roadmap"

export type GrowthPhase = 1 | 2 | 3

export type GrowthModuleKey =
  | "brand" | "content" | "promotion" | "acquisition" | "consultation"
  | "quotation" | "order" | "payment" | "care" | "growth"

export const GROWTH_PHASES: readonly { phase: GrowthPhase; name: string }[] = [
  { phase: 1, name: "Nền tảng kinh doanh" },
  { phase: 2, name: "Marketing và bán hàng" },
  { phase: 3, name: "Tự động hoá và AI" },
]

interface GrowthModuleSpec {
  readonly key: GrowthModuleKey
  readonly name: string
  readonly purpose: string
  readonly icon: string
  /** Mã công cụ có sẵn trong toolkit-catalog theo từng giai đoạn */
  readonly toolIds: Readonly<Record<GrowthPhase, readonly number[]>>
}

const GROWTH_MODULE_SPECS: readonly GrowthModuleSpec[] = [
  { key: "brand", name: "Thương hiệu", icon: "BadgeCheck",
    purpose: "Xây dựng hình ảnh cửa hàng rõ ràng, nhất quán và đáng tin cậy",
    toolIds: { 1: [11, 51, 64], 2: [45, 52], 3: [] } },
  { key: "content", name: "Tạo nội dung", icon: "Camera",
    purpose: "Tạo hình ảnh, video và nội dung bán hàng mà không cần thuê thiết kế",
    toolIds: { 1: [1, 2, 3, 4, 7, 53], 2: [5, 6], 3: [0] } },
  { key: "promotion", name: "Quảng bá sản phẩm", icon: "Megaphone",
    purpose: "Giới thiệu sản phẩm và chương trình ưu đãi đến khách một cách chuyên nghiệp",
    toolIds: { 1: [9, 14, 61], 2: [22, 43, 44], 3: [] } },
  { key: "acquisition", name: "Thu hút khách hàng", icon: "Magnet",
    purpose: "Giúp nhiều khách biết đến cửa hàng và dễ dàng tìm thấy sản phẩm",
    toolIds: { 1: [8, 12, 13], 2: [10, 21, 25, 49, 54], 3: [] } },
  { key: "consultation", name: "Tư vấn khách hàng", icon: "MessagesSquare",
    purpose: "Tư vấn nhanh, chính xác và không bỏ sót yêu cầu của khách",
    toolIds: { 1: [24, 55, 56], 2: [30], 3: [57] } },
  { key: "quotation", name: "Báo giá", icon: "Calculator",
    purpose: "Tính giá và tạo báo giá nhanh, chính xác theo yêu cầu từng khách",
    toolIds: { 1: [15, 58, 31, 32, 33, 34, 35], 2: [16, 18, 46], 3: [] } },
  { key: "order", name: "Đơn hàng", icon: "ClipboardList",
    purpose: "Nhận đơn dễ dàng và kiểm soát toàn bộ quá trình làm và giao hàng",
    toolIds: { 1: [17, 59, 36], 2: [19, 37, 38, 39, 40, 41, 60], 3: [] } },
  { key: "payment", name: "Thanh toán", icon: "Wallet",
    purpose: "Khách thanh toán thuận tiện, cửa hàng dễ kiểm tra tiền đã nhận",
    toolIds: { 1: [20, 62], 2: [], 3: [] } },
  { key: "care", name: "Chăm sóc khách hàng", icon: "HeartHandshake",
    purpose: "Hỗ trợ khách trước, trong và sau khi mua hàng",
    toolIds: { 1: [26], 2: [], 3: [] } },
  { key: "growth", name: "Tăng trưởng khách hàng", icon: "TrendingUp",
    purpose: "Khách cũ quay lại mua và giới thiệu thêm khách mới",
    toolIds: { 1: [28, 63], 2: [23, 27, 29], 3: [] } },
]

/** Công cụ chưa thuộc 10 module — khu riêng bên dưới (PO 30/10/2026). */
const EXTRA_SECTION_SPEC = {
  key: "extra",
  name: "Quản lý chuỗi và tối ưu hệ thống",
  purpose: "Công cụ cho chuỗi cửa hàng và trợ lý tối ưu cách vận hành",
  icon: "Building2",
  toolIds: [42, 47, 48, 50],
} as const

// ── Kiểu đã giải ─────────────────────────────────────────────────────

export interface ModuleTool extends ToolDefinition {
  /** Công cụ mục tiêu chưa có trong danh mục 51 công cụ */
  readonly isRoadmap: boolean
}

export interface ModulePhase {
  readonly phase: GrowthPhase
  readonly name: string
  readonly tools: readonly ModuleTool[]
}

export interface GrowthModule {
  readonly key: string
  readonly order: number | null
  readonly name: string
  readonly purpose: string
  readonly icon: string
  readonly phases: readonly ModulePhase[]
}

// ── Giải ─────────────────────────────────────────────────────────────

function catalogById(): Map<number, ToolDefinition> {
  return new Map(getAllTools().map((t) => [t.id, t]))
}

function asModuleTool(tool: ToolDefinition): ModuleTool {
  return { ...tool, isRoadmap: false }
}

function roadmapTool(name: string, id: number): ModuleTool {
  return {
    id, name, description: "Công cụ sẽ phát triển trong lộ trình",
    icon: "CircleDashed", label: "STORE", status: "PLANNED", progress: 0,
    href: null, statusNote: "", isRoadmap: true,
  }
}

/** Toàn bộ module (10 module + khu riêng) ở dạng đầy đủ, chưa lọc môi trường. */
export function getAllGrowthModules(): GrowthModule[] {
  const byId = catalogById()
  const pick = (ids: readonly number[]) =>
    ids.flatMap((id) => {
      const tool = byId.get(id)
      return tool ? [asModuleTool(tool)] : []
    })
  let roadmapId = 0

  const modules: GrowthModule[] = GROWTH_MODULE_SPECS.map((spec, index) => ({
    key: spec.key,
    order: index + 1,
    name: spec.name,
    purpose: spec.purpose,
    icon: spec.icon,
    phases: GROWTH_PHASES.map(({ phase, name }) => ({
      phase,
      name,
      tools: [
        ...pick(spec.toolIds[phase]),
        ...GROWTH_MODULE_ROADMAP[spec.key][phase].map((n) => roadmapTool(n, -++roadmapId)),
      ],
    })),
  }))

  const withTools = modules.map((m) => ({ ...m, phases: m.phases.filter((p) => p.tools.length > 0) }))

  return [
    ...withTools,
    {
      key: EXTRA_SECTION_SPEC.key,
      order: null,
      name: EXTRA_SECTION_SPEC.name,
      purpose: EXTRA_SECTION_SPEC.purpose,
      icon: EXTRA_SECTION_SPEC.icon,
      phases: [{ phase: 1, name: "Công cụ", tools: pick(EXTRA_SECTION_SPEC.toolIds) }],
    },
  ]
}

/**
 * Lọc theo môi trường:
 * - Dev: giữ nguyên, kể cả công cụ mục tiêu.
 * - Production: chỉ công cụ DONE; bỏ giai đoạn và module rỗng.
 */
export function getVisibleGrowthModules(isDev: boolean): GrowthModule[] {
  const all = getAllGrowthModules()
  if (isDev) return all

  return all
    .map((m) => ({
      ...m,
      phases: m.phases
        .map((p) => ({ ...p, tools: p.tools.filter((t) => t.status === "DONE" && !t.isRoadmap) }))
        .filter((p) => p.tools.length > 0),
    }))
    .filter((m) => m.phases.length > 0)
}

export function countModuleTools(module: GrowthModule): number {
  return module.phases.reduce((sum, p) => sum + p.tools.length, 0)
}

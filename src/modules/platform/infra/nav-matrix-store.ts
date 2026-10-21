import fs from "fs/promises"
import path from "path"
import { listAllIndustryPlugins } from "@/modules/organization/domain/industry-profile"

/** Tệp ghi đè; `NAV_MATRIX_OVERRIDES_PATH` cho test trỏ sang tệp tạm, không ghi đè tệp đã commit. */
function overridesFilePath(): string {
  return process.env.NAV_MATRIX_OVERRIDES_PATH ||
    path.join(process.cwd(), "src/lib/data/industry-nav-matrix-overrides.json")
}

export type PlatformNavMatrixOverrides = Record<string, string[]>

function getDefaultOverrides(): PlatformNavMatrixOverrides {
  const defaults: PlatformNavMatrixOverrides = {}
  try {
    for (const plugin of listAllIndustryPlugins()) {
      defaults[plugin.identity.key] = []
    }
  } catch {
    // Dự phòng an toàn
  }
  return defaults
}

let memoryCache: PlatformNavMatrixOverrides | null = null

/**
 * Đọc cấu hình ghi đè ma trận ngành do Admin SaaS thiết lập.
 */
export async function getPlatformNavMatrixOverrides(): Promise<PlatformNavMatrixOverrides> {
  if (memoryCache) {
    return memoryCache
  }

  try {
    const raw = await fs.readFile(overridesFilePath(), "utf-8")
    const parsed = JSON.parse(raw) as PlatformNavMatrixOverrides
    const defaults = getDefaultOverrides()
    memoryCache = { ...defaults, ...parsed }
    return memoryCache
  } catch {
    memoryCache = { ...getDefaultOverrides() }
    return memoryCache
  }
}

/**
 * Đọc đồng bộ từ bộ nhớ cache hoặc trả về default.
 */
export function getPlatformNavMatrixOverridesSync(): PlatformNavMatrixOverrides {
  return memoryCache ?? getDefaultOverrides()
}

/**
 * Lưu cấu hình ghi đè ma trận ngành (chỉ Admin SaaS tại Console `/van-hanh` mới có quyền gọi).
 */
export async function savePlatformNavMatrixOverrides(
  overrides: PlatformNavMatrixOverrides
): Promise<PlatformNavMatrixOverrides> {
  const merged = { ...getDefaultOverrides(), ...overrides }
  const jsonContent = JSON.stringify(merged, null, 2) + "\n"

  await fs.mkdir(path.dirname(overridesFilePath()), { recursive: true })
  await fs.writeFile(overridesFilePath(), jsonContent, "utf-8")

  memoryCache = merged
  return memoryCache
}

/**
 * Xóa cache (dùng trong unit test).
 */
export function clearPlatformNavMatrixCache(): void {
  memoryCache = null
}

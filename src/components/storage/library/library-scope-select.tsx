"use client"

type Props = {
  value: string
  onChange: (scope: string) => void
  branches: { id: string; name: string }[]
}

/**
 * Bộ chọn phạm vi cho chuỗi (Screen Contract `kho-du-lieu.md` §5): Toàn chuỗi ·
 * Trụ sở · từng chi nhánh. Không hiện cho cửa hàng đơn và nhân viên chi nhánh.
 */
export function LibraryScopeSelect({ value, onChange, branches }: Props) {
  return (
    <label className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
      <span className="text-xs font-bold text-text-muted">Phạm vi</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2 text-body-sm outline-none focus:border-primary sm:w-56"
      >
        <option value="all">Toàn chuỗi</option>
        <option value="hq">Trụ sở</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </label>
  )
}

import { Info } from "@/components/ui/icons"

/**
 * Báo rõ màn hình đang ở giai đoạn xem trước: cấu hình chưa được lưu hoặc chưa áp vào nghiệp vụ.
 * Audit 28/10/2026 (AUD-005/006/007, PO duyệt): không để người dùng tưởng thay đổi đã có hiệu lực.
 */
export function PreviewNotice({ children }: { children: React.ReactNode }) {
  return (
    <div role="note" className="flex items-start gap-2 rounded-xl border border-warning-border bg-warning-bg px-4 py-3 text-body-sm text-warning-text">
      <Info size={16} className="mt-0.5 shrink-0" aria-hidden />
      <p>
        <span className="font-semibold">Bản xem trước. </span>
        {children}
      </p>
    </div>
  )
}

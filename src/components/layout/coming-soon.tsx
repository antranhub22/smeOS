export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <div className="text-body font-bold">{title}</div>
      <div className="text-body-sm text-text-muted">
        Màn hình này chưa được dựng trong bản demo — nằm ngoài phạm vi đợt xem UI này.
      </div>
    </div>
  )
}

export default function StoreShareNotFound() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface rounded-3xl p-8 border border-border text-center">
        <h2 className="text-title font-bold text-text mb-2">Không tìm thấy cửa hàng</h2>
        <p className="text-body-sm text-text-muted">Đường dẫn này không tồn tại. Vui lòng kiểm tra lại link bạn nhận được.</p>
      </div>
    </main>
  )
}

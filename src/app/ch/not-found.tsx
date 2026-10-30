export default function StoreShareNotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface rounded-3xl p-8 border border-border text-center">
        <h1 className="text-xl font-bold text-text mb-2">Không tìm thấy cửa hàng</h1>
        <p className="text-sm text-text-muted">Đường dẫn này không tồn tại. Vui lòng kiểm tra lại link bạn nhận được.</p>
      </div>
    </main>
  )
}

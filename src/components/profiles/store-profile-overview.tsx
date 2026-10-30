"use client"

/**
 * Tổng quan hồ sơ cửa hàng và thương hiệu (công cụ 51).
 * Việc chính (L0): biết hồ sơ đã đủ chưa và điền tiếp mục nào. Sửa chi tiết
 * vẫn ở Cài đặt (một nơi lưu duy nhất) — trang này chỉ đọc và dẫn đường.
 */
import Link from "next/link"
import { BadgeCheck, CheckCircle2, Circle, ArrowRight, Store, Palette } from "lucide-react"
import { useTenantProfile } from "@/lib/hooks/use-tenant-profile"
import { evaluateStoreProfile, type ProfileChecklistItem } from "@/modules/profiles/domain/store-profile-completeness"
import { FeatureGuidanceCard } from "@/components/templates/shared/feature-guidance-card"
import { PageHeader } from "@/components/ui/page-header"
import { Progress } from "@/components/ui/progress"
import { Disclosure } from "@/components/ui/disclosure"
import { InlineError } from "@/components/ui/inline-error"
import { SkeletonBlock } from "@/components/ui/skeleton"

const SECTION_HREF = { INFO: "/cai-dat?tab=INFO", BRANDING: "/cai-dat?tab=BRANDING" } as const

function ItemRow({ item }: { item: ProfileChecklistItem }) {
  const Icon = item.done ? CheckCircle2 : Circle
  return (
    <li className="flex items-start gap-3 py-3">
      <Icon size={18} aria-hidden className={item.done ? "text-success-text mt-0.5" : "text-text-muted mt-0.5"} />
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-semibold text-text">
          {item.label}
          {item.essential && !item.done && (
            <span className="ml-2 text-caption font-semibold text-warning-text">Cần có</span>
          )}
        </p>
        <p className="text-caption text-text-muted">{item.benefit}</p>
      </div>
      {!item.done && (
        <Link
          href={SECTION_HREF[item.section]}
          className="shrink-0 inline-flex items-center gap-1 min-h-8 px-3 rounded-lg text-caption font-semibold text-primary hover:bg-primary/10"
          aria-label={`Điền ${item.label.toLowerCase()}`}
        >
          Điền <ArrowRight size={14} aria-hidden />
        </Link>
      )}
    </li>
  )
}

export function StoreProfileOverview() {
  const { business, brand, loading, error, reload } = useTenantProfile()

  if (loading) {
    return <SkeletonBlock lines={6} label="Đang tải hồ sơ cửa hàng..." />
  }
  if (error) {
    return <InlineError message={error} onRetry={() => void reload()} />
  }

  const result = evaluateStoreProfile({ business, brand })
  const next = result.missing.slice(0, 3)
  const done = result.items.filter((i) => i.done)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Hồ sơ cửa hàng và thương hiệu"
        description="Nhập một lần, dùng chung cho trang chia sẻ, danh thiếp và mọi ấn phẩm."
      />

      <FeatureGuidanceCard
        guidanceId="ho-so-cua-hang"
        badgeLabel="Hồ sơ dùng chung"
        badgeIcon={BadgeCheck}
        title="Hồ sơ càng đủ, ấn phẩm càng chuyên nghiệp"
        description="Tên, số điện thoại, địa chỉ và logo được tự động đưa vào các công cụ tạo nội dung. Bạn chỉ cần sửa ở một chỗ."
        tips={["Điền trước các mục được đánh dấu “Cần có”", "Thay đổi được áp dụng ngay cho ấn phẩm tạo sau đó"]}
      />

      <section aria-labelledby="ho-so-tien-do" className="p-5 rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h2 id="ho-so-tien-do" className="text-base font-bold text-text">Mức hoàn thiện</h2>
          <span className="text-body-sm font-bold text-text">{result.percent}%</span>
        </div>
        <Progress value={result.percent} className="h-2" barClassName={result.percent === 100 ? "bg-success" : "bg-primary"} />
        <p role="status" className={`mt-3 text-body-sm ${result.readyToShare ? "text-success-text" : "text-warning-text"}`}>
          {result.readyToShare
            ? "Đã đủ thông tin cần thiết để tạo trang chia sẻ và danh thiếp."
            : "Còn thiếu thông tin cần thiết để tạo trang chia sẻ và danh thiếp."}
        </p>

        {next.length > 0 ? (
          <>
            <h3 className="mt-5 text-body-sm font-bold text-text">Nên điền tiếp</h3>
            <ul className="divide-y divide-border">
              {next.map((item) => <ItemRow key={item.key} item={item} />)}
            </ul>
          </>
        ) : (
          <p className="mt-4 text-body-sm text-text">Hồ sơ đã đầy đủ.</p>
        )}

        {result.missing.length > next.length && (
          <Disclosure label={`Các mục còn thiếu khác (${result.missing.length - next.length})`}>
            <ul className="divide-y divide-border">
              {result.missing.slice(next.length).map((item) => <ItemRow key={item.key} item={item} />)}
            </ul>
          </Disclosure>
        )}
        {done.length > 0 && (
          <Disclosure label={`Đã hoàn thành (${done.length})`}>
            <ul className="divide-y divide-border">
              {done.map((item) => <ItemRow key={item.key} item={item} />)}
            </ul>
          </Disclosure>
        )}
      </section>

      <nav aria-label="Sửa hồ sơ" className="grid gap-3 sm:grid-cols-2">
        <Link href={SECTION_HREF.INFO} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-surface hover:border-primary">
          <Store size={20} aria-hidden className="text-primary" />
          <span>
            <span className="block text-body-sm font-bold text-text">Thông tin cửa hàng</span>
            <span className="block text-caption text-text-muted">Tên, liên hệ, địa chỉ, giờ mở cửa</span>
          </span>
        </Link>
        <Link href={SECTION_HREF.BRANDING} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-surface hover:border-primary">
          <Palette size={20} aria-hidden className="text-primary" />
          <span>
            <span className="block text-body-sm font-bold text-text">Nhận diện thương hiệu</span>
            <span className="block text-caption text-text-muted">Logo, màu sắc, giọng văn</span>
          </span>
        </Link>
      </nav>
    </div>
  )
}

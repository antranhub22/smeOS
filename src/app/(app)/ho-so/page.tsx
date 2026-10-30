import { StoreProfileOverview } from "@/components/profiles/store-profile-overview"

/** Công cụ 51 — tổng quan hồ sơ cửa hàng và thương hiệu; sửa chi tiết ở /cai-dat. */
export default function HoSoPage() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto w-full">
      <StoreProfileOverview />
    </div>
  )
}

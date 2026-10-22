"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { getIndustryPlugin } from "@/modules/organization/domain/industry-profile"
import { CreateGeneralCard } from "@/components/products/create-general-card"
import { CreateDesignCard } from "@/components/products/create-design-card"
import { CreateBomCard } from "@/components/products/create-bom-card"
import { CreateStoryCard } from "@/components/products/create-story-card"
import { useCreateProductForm } from "@/components/products/use-create-product-form"

export default function CreateProductPage() {
  const router = useRouter()
  const { ti, industry } = useI18n()
  const activeIndustry = industry || getIndustryPlugin()

  const form = useCreateProductForm({ ti, activeIndustry })

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/san-pham" as never)}
            aria-label="Quay lại danh sách sản phẩm"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text hover:bg-surface-alt transition-colors focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="text-caption text-text-muted">{ti("catalogTitle")}</div>
            <h1 className="text-title font-extrabold text-primary">{ti("createButtonLabel")}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/tai-anh" as never)}
            className="flex items-center gap-1.5"
            title={`Dùng AI nhận diện ảnh và tự sinh ${ti("productRecipe").toLowerCase()}`}
          >
            <Sparkles size={14} className="text-primary" />
            <span className="hidden sm:inline">{ti("scanButtonLabel")}</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={form.handleSubmit}
            disabled={form.submitting}
            className="flex items-center gap-1.5"
          >
            <CheckCircle2 size={15} strokeWidth={2.2} />
            <span>
              {form.submitting ? "Đang lưu..." : `Lưu vào ${ti("catalogTitle").toLowerCase()}`}
            </span>
          </Button>
        </div>
      </header>

      {/* Main form */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {form.errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-bg p-4 text-body-sm font-medium text-danger">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{form.errorMsg}</span>
            </div>
          )}

          <form onSubmit={form.handleSubmit} className="space-y-6">
            <CreateGeneralCard
              ti={ti}
              industry={activeIndustry}
              name={form.name}
              setName={form.setName}
              code={form.code}
              setCode={form.setCode}
              priceVnd={form.priceVnd}
              setPriceVnd={form.setPriceVnd}
              pricing={form.pricing}
              setPricing={form.setPricing}
              category={form.category}
              setCategory={form.setCategory}
              categories={form.categories}
              status={form.status}
              setStatus={form.setStatus}
              imagePreview={form.imagePreview}
              imageFile={form.imageFile}
              onFileChange={form.handleFileChange}
              onRemoveImage={form.handleRemoveImage}
              onAcceptNormalizedImage={form.handleAcceptNormalizedImage}
              fileInputRef={form.fileInputRef}
              industryPrefix={form.industryPrefix}
            />

            <CreateDesignCard
              industryKey={activeIndustry.identity.key}
              shape={form.shape}
              setShape={form.setShape}
              facing={form.facing}
              setFacing={form.setFacing}
              container={form.container}
              setContainer={form.setContainer}
              primaryColor={form.primaryColor}
              setPrimaryColor={form.setPrimaryColor}
            />

            <CreateBomCard
              ti={ti}
              industry={activeIndustry}
              bomItems={form.bomItems}
              onAddBomItem={form.handleAddBomItem}
              onUpdateBomItem={form.handleUpdateBomItem}
              onRemoveBomItem={form.handleRemoveBomItem}
            />

            <CreateStoryCard
              ti={ti}
              industry={activeIndustry}
              description={form.description}
              setDescription={form.setDescription}
            />

            {/* Thanh nút lưu cuối trang */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/san-pham" as never)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={form.submitting}
                className="flex items-center gap-1.5"
              >
                <CheckCircle2 size={16} />
                <span>
                  {form.submitting
                    ? "Đang lưu..."
                    : `Lưu vào ${ti("catalogTitle").toLowerCase()}`}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

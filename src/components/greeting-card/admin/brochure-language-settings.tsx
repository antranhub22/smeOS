"use client"

import React, { useState } from "react"
import { Globe2, Lock, CheckCircle2, AlertCircle, Save, Loader2, Sparkles, Send, Clock, X } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { apiSend, useApi } from "@/components/greeting-card/greeting-api"
import {
  BROCHURE_LANGUAGE_POLICY_KEY,
  DEFAULT_BROCHURE_LANGUAGE_POLICY,
  getUnlockedLocales,
  parseBrochureLanguagePolicy,
  serializeBrochureLanguagePolicy,
  type BrochureLanguagePolicy,
} from "@/modules/greeting-card/domain/brochure-language-policy"
import type { SupportedLocale } from "@/lib/i18n/types"

export function BrochureLanguageSettings() {
  const org = useApi<{ settings?: Record<string, unknown> | null }>("/api/v1/organizations/current")
  const [draft, setDraft] = useState<BrochureLanguagePolicy | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  // State yêu cầu mở khóa (Unlock Request)
  const [openUnlockModal, setOpenUnlockModal] = useState(false)
  const [unlockNote, setUnlockNote] = useState("")
  const [requesting, setRequesting] = useState(false)
  const [unlockSuccess, setUnlockSuccess] = useState(false)

  const unlockedLocales = getUnlockedLocales(org.data?.settings)
  const isEnUnlocked = unlockedLocales.includes("en")

  const policy = draft ?? (org.data ? parseBrochureLanguagePolicy(org.data.settings, unlockedLocales) : null)

  const handleToggleLocale = (locale: SupportedLocale) => {
    if (!policy) return
    if (locale === "vi") return // Tiếng Việt luôn luôn mở

    let nextActive: SupportedLocale[]
    if (policy.activeLocales.includes(locale)) {
      // Tắt ngôn ngữ
      nextActive = policy.activeLocales.filter((l) => l !== locale)
      if (nextActive.length === 0) nextActive = ["vi"]
    } else {
      // Bật ngôn ngữ (chỉ nếu đã unlock)
      if (!unlockedLocales.includes(locale)) return
      nextActive = [...policy.activeLocales, locale]
    }

    let nextDefault = policy.defaultLocale
    if (!nextActive.includes(nextDefault)) {
      nextDefault = nextActive[0] ?? "vi"
    }

    setDraft({
      ...policy,
      activeLocales: nextActive,
      defaultLocale: nextDefault,
      enableLanguageSwitcher: nextActive.length > 1 ? policy.enableLanguageSwitcher : false,
    })
    setMessage(null)
  }

  const handleSetDefault = (locale: SupportedLocale) => {
    if (!policy || !policy.activeLocales.includes(locale)) return
    setDraft({ ...policy, defaultLocale: locale })
    setMessage(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!policy) return
    setSaving(true)
    setMessage(null)
    try {
      await apiSend(
        "/api/v1/organizations/current",
        "PATCH",
        {
          settings: {
            [BROCHURE_LANGUAGE_POLICY_KEY]: serializeBrochureLanguagePolicy(policy),
          },
        },
        "Không lưu được cài đặt ngôn ngữ"
      )
      await org.mutate()
      setDraft(null)
      setMessage({ ok: true, text: "Đã lưu thiết lập ngôn ngữ Thẻ Chào thành công!" })
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Lỗi lưu cấu hình" })
    } finally {
      setSaving(false)
    }
  }

  if (!policy) {
    return <div className="h-44 rounded-2xl bg-surface-muted animate-pulse" aria-busy="true" />
  }

  return (
    <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Globe2 size={18} className="text-primary" /> Ngôn Ngữ & Trải Nghiệm Khách Quốc Tế
          </h3>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Thiết lập ngôn ngữ hiển thị trên Thẻ Chào để gửi cho kiều bào và khách hàng quốc tế.
          </p>
        </div>

        {/* Badge trạng thái gói quốc tế */}
        <div className="shrink-0">
          {isEnUnlocked ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-bold bg-success-bg text-success border border-success/20">
              <CheckCircle2 size={13} /> Gói Quốc Tế: Đã Kích Hoạt
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-bold bg-warning-bg text-warning border border-warning/20">
              <Lock size={13} /> Gói Quốc Tế: Cần Admin SaaS Mở Khóa
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Bảng lựa chọn ngôn ngữ */}
        <div className="space-y-3">
          <label className="block text-body-sm font-bold text-foreground">
            1. Danh sách ngôn ngữ trên Thẻ Chào
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Tiếng Việt */}
            <div className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇻🇳</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm font-bold text-foreground">Tiếng Việt</span>
                    <span className="text-caption px-1.5 py-0.2 rounded font-semibold bg-primary/10 text-primary">
                      Mặc định
                    </span>
                  </div>
                  <p className="text-caption text-text-muted">Giao diện nội địa chuẩn chuẩn hoá</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-caption cursor-pointer">
                  <input
                    type="radio"
                    name="defaultLocale"
                    checked={policy.defaultLocale === "vi"}
                    onChange={() => handleSetDefault("vi")}
                    className="text-primary focus:ring-primary/20"
                  />
                  <span className="font-medium text-foreground">Mặc định</span>
                </label>
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="h-4 w-4 rounded border-border text-primary cursor-not-allowed opacity-70"
                />
              </div>
            </div>

            {/* Tiếng Anh */}
            <div
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                isEnUnlocked
                  ? policy.activeLocales.includes("en")
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-background"
                  : "border-dashed border-border bg-surface-muted/50 opacity-80"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇬🇧</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm font-bold text-foreground">English (Tiếng Anh)</span>
                    {!isEnUnlocked && (
                      <span className="inline-flex items-center gap-1 text-caption px-1.5 py-0.2 rounded font-semibold bg-surface-alt text-text-muted border border-border">
                        <Lock size={10} /> Khóa
                      </span>
                    )}
                  </div>
                  <p className="text-caption text-text-muted">
                    {isEnUnlocked ? "Cho khách nước ngoài / kiều bào" : "Liên hệ Admin SaaS để kích hoạt"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isEnUnlocked && policy.activeLocales.includes("en") && (
                  <label className="flex items-center gap-1.5 text-caption cursor-pointer">
                    <input
                      type="radio"
                      name="defaultLocale"
                      checked={policy.defaultLocale === "en"}
                      onChange={() => handleSetDefault("en")}
                      className="text-primary focus:ring-primary/20"
                    />
                    <span className="font-medium text-foreground">Mặc định</span>
                  </label>
                )}

                {isEnUnlocked ? (
                  <input
                    type="checkbox"
                    checked={policy.activeLocales.includes("en")}
                    onChange={() => handleToggleLocale("en")}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                  />
                ) : policy.pendingRequest ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-bold bg-warning-bg text-warning border border-warning/20">
                    <Clock size={12} /> Đang chờ Admin duyệt
                  </span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setOpenUnlockModal(true)
                      setUnlockSuccess(false)
                      setUnlockNote("")
                    }}
                    className="h-8 gap-1.5 text-xs font-bold border-primary/30 text-primary hover:bg-primary/5"
                  >
                    <Sparkles size={13} />
                    <span>Yêu Cầu Unlock</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tùy chọn hiển thị bộ chuyển đổi ngôn ngữ */}
        {policy.activeLocales.length > 1 && (
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start justify-between gap-4">
            <div>
              <p className="text-body-sm font-bold text-foreground">Nút chuyển đổi ngôn ngữ trên Thẻ Chào</p>
              <p className="text-caption text-text-muted mt-0.5">
                Hiển thị nút chọn ngôn ngữ (🇻🇳 VI / 🇬🇧 EN) ở góc trên Thẻ chào để khách có thể linh hoạt đổi ngôn ngữ.
              </p>
            </div>
            <input
              type="checkbox"
              checked={policy.enableLanguageSwitcher}
              onChange={(e) => setDraft({ ...policy, enableLanguageSwitcher: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer mt-1"
            />
          </div>
        )}

        {/* Hướng dẫn thanh toán quốc tế */}
        {policy.activeLocales.includes("en") && (
          <div className="space-y-2">
            <label className="block text-body-sm font-bold text-foreground">
              2. Hướng dẫn thanh toán quốc tế (Wise / PayPal / Swift / Zelle)
            </label>
            <p className="text-caption text-text-muted">
              Nội dung này sẽ hiển thị riêng cho khách quốc tế khi xem Thẻ chào bằng Tiếng Anh (song song với mã QR nội địa).
            </p>
            <textarea
              rows={3}
              placeholder="VD: For international payments, please transfer via Wise/PayPal to payment@yourshop.com or Swift Code: BFTVVNVX..."
              value={policy.internationalPaymentGuide ?? ""}
              onChange={(e) => setDraft({ ...policy, internationalPaymentGuide: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-background text-body-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        )}

        {/* Thông báo kết quả lưu */}
        {message && (
          <div
            className={`p-3 rounded-xl text-caption font-semibold flex items-center gap-2 ${
              message.ok
                ? "bg-success-bg text-success border border-success/20"
                : "bg-danger/10 text-danger border border-danger/20"
            }`}
          >
            {message.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Nút lưu */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving || !draft}
            className="gap-2 font-bold shadow-xs"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>Lưu Thiết Lập Ngôn Ngữ</span>
          </Button>
        </div>
      </form>

      {/* Modal gửi yêu cầu mở khóa Tiếng Anh lên Admin SaaS */}
      {openUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-background rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                <h4 className="text-body font-bold text-foreground">Yêu Cầu Mở Khóa Gói Quốc Tế</h4>
              </div>
              <button
                type="button"
                onClick={() => setOpenUnlockModal(false)}
                aria-label="Đóng cửa sổ"
                className="p-1.5 rounded-lg text-text-muted hover:bg-surface"
              >
                <X size={16} />
              </button>
            </div>

            {unlockSuccess ? (
              <div className="p-4 rounded-xl bg-success-bg border border-success/20 text-center space-y-2">
                <CheckCircle2 size={32} className="text-success mx-auto" />
                <p className="text-body-sm font-bold text-success">Đã gửi yêu cầu thành công!</p>
                <p className="text-caption text-text-muted">
                  Yêu cầu đã được chuyển tới Admin của SaaS để phê duyệt. Hệ thống sẽ tự động kích hoạt Tiếng Anh ngay khi được duyệt.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setOpenUnlockModal(false)}
                  className="mt-2"
                >
                  Đã hiểu
                </Button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setRequesting(true)
                  try {
                    await apiSend(
                      "/api/v1/organizations/current/language-unlock-request",
                      "POST",
                      { note: unlockNote.trim() || null },
                      "Không gửi được yêu cầu mở khóa"
                    )
                    await org.mutate()
                    setUnlockSuccess(true)
                  } catch (err) {
                    alert(err instanceof Error ? err.message : "Có lỗi xảy ra")
                  } finally {
                    setRequesting(false)
                  }
                }}
                className="space-y-4"
              >
                <p className="text-body-sm text-text-muted leading-relaxed">
                  Gói Tiếng Anh cho phép bạn tạo Thẻ chào và thiệp điện tử chuẩn quốc tế gửi cho khách nước ngoài và kiều bào.
                </p>

                <div className="space-y-1.5">
                  <label className="block text-caption font-bold text-foreground">
                    Ghi chú hoặc lý do cần mở khóa (tùy chọn)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="VD: Cửa hàng có nhiều khách hàng kiều bào đặt hoa giao tận nhà tại Việt Nam..."
                    value={unlockNote}
                    onChange={(e) => setUnlockNote(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-border bg-surface text-body-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOpenUnlockModal(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={requesting}
                    className="gap-2 font-bold shadow-xs"
                  >
                    {requesting ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
                    <span>Gửi Yêu Cầu Phê Duyệt</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

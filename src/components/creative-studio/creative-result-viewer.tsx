"use client"

import React, { useState, useContext, useMemo, useEffect } from "react"
import { Sparkles } from "@/components/ui/icon-set/sparkles"
import { Clock } from "@/components/ui/icon-set/clock"
import { Button } from "@/components/ui/button"
import { StageGateApprovalBar } from "@/components/ui/stage-gate-approval-bar"
import { CreativeStudioContext } from "@/app/(app)/creative-studio/page"
import { ProviderSelect } from "./provider-select"
import { type PackagePostDto } from "./package-client"
import { generateAllPlatformPosts } from "@/modules/creative-production/domain/social-post-generator"
import {
  CreativeSocialPosts,
  type PlatformKey,
  type FullPostRecord,
} from "./creative-social-posts"
import { CreativeNarrativeScenes } from "./creative-narrative-scenes"
import { useCreativeResultActions } from "./use-creative-result-actions"
import type { CreativeTopicResultItem } from "./creative-result-types"

export interface CreativeResultViewerProps {
  mode: "CREATIVE" | "AUTHENTIC"
  topicResults: CreativeTopicResultItem[]
  totalCredits?: number
  onGoToAudio?: () => void
  onGoToPackage?: () => void
}

const PLATFORMS: PlatformKey[] = ["facebook", "instagram", "tiktok", "zalo"]

const PLATFORM_LABELS: Record<PlatformKey, { label: string; icon: string; bgActive: string }> = {
  facebook: { label: "Facebook Fanpage", icon: "📘", bgActive: "bg-primary text-primary-foreground" },
  instagram: { label: "Instagram Reels & Feed", icon: "📸", bgActive: "bg-primary text-primary-foreground" },
  tiktok: { label: "TikTok Video (9:16)", icon: "🎵", bgActive: "bg-primary text-primary-foreground" },
  zalo: { label: "Zalo OA Bán hàng", icon: "💬", bgActive: "bg-primary text-primary-foreground" },
}

export function CreativeResultViewer(props: CreativeResultViewerProps) {
  const currentResult = props.topicResults[0]
  if (!currentResult) return null
  return <CreativeResultViewerBody {...props} currentResult={currentResult} />
}

function CreativeResultViewerBody({
  mode,
  totalCredits = 0,
  onGoToAudio,
  onGoToPackage,
  currentResult,
}: CreativeResultViewerProps & { currentResult: CreativeTopicResultItem }) {
  const ctx = useContext(CreativeStudioContext)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [customEdits, setCustomEdits] = useState<Record<string, string>>({})
  const [editingPlatform, setEditingPlatform] = useState<PlatformKey | null>(null)

  const arc = currentResult.arc
  const briefs = currentResult.briefs
  const captions = briefs?.contentBrief?.captionRequests || []
  const baseHashtags = useMemo(
    () => briefs?.contentBrief?.hashtagSuggestions || ["#hoatuoi", "#quatanghoatuoi"],
    [briefs]
  )

  const productName = ctx?.productName || currentResult.topicTitle || "Sản phẩm thiết kế"
  const components =
    ctx?.commercialPassport?.components ||
    ctx?.report?.components?.map((c) => c.flowerType) ||
    []
  const colors =
    ctx?.commercialPassport?.colors ||
    ctx?.report?.attributes?.mainColors ||
    []
  const style =
    ctx?.commercialPassport?.style ||
    ctx?.report?.attributes?.style ||
    undefined
  const price =
    ctx?.commercialPassport?.priceRange ||
    ctx?.report?.context?.suggestedPrice ||
    undefined
  const hook = captions[0]?.hook || currentResult.topicTitle
  const cta = captions[0]?.cta || "Nhắn tin cho tiệm để nhận ưu đãi ngay hôm nay!"

  const planPosts = currentResult.planPosts
  const [contentEnginePosts, setContentEnginePosts] = useState<
    Array<{ channel: PlatformKey; text: string; hashtags: readonly string[] }> | null
  >(null)

  const effectivePlanPosts = contentEnginePosts ?? planPosts
  const generatedPosts = useMemo(() => {
    const base = generateAllPlatformPosts({
      mode,
      productName,
      components,
      colors,
      style,
      price,
      topicTitle: currentResult.topicTitle,
      hook,
      cta,
      hashtags: baseHashtags,
    })
    for (const p of effectivePlanPosts ?? []) {
      const gen = base[p.channel]
      if (!gen) continue
      const tags = [...p.hashtags]
      const fullContent = tags.length ? `${p.text}\n\n${tags.join(" ")}` : p.text
      base[p.channel] = { ...gen, fullContent, hashtags: tags, characterCount: fullContent.length }
    }
    return base
  }, [mode, productName, components, colors, style, price, currentResult.topicTitle, hook, cta, baseHashtags, effectivePlanPosts])

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  const handleCopyAllHashtags = () => {
    const text = baseHashtags.join(" ")
    handleCopy(text, "all-hashtags")
  }

  const getPostContent = (platform: PlatformKey) => {
    return customEdits[platform] ?? generatedPosts[platform]?.fullContent ?? ""
  }

  const buildPosts = (): PackagePostDto[] =>
    PLATFORMS.map((p) => {
      const gen = generatedPosts[p]
      const edited = customEdits[p]
      if (edited !== undefined) return { channel: p, text: edited, hashtags: [] }
      const tagLine = gen?.hashtags?.length ? `\n\n${gen.hashtags.join(" ")}` : ""
      const text = gen ? (tagLine && gen.fullContent.endsWith(tagLine.trim()) ? gen.fullContent.slice(0, gen.fullContent.length - tagLine.length) : gen.fullContent) : ""
      return { channel: p, text, hashtags: gen?.hashtags ?? [] }
    })

  const {
    ceStatus,
    ceProvider,
    setCeProvider,
    ceError,
    handleWriteWithContentEngine,
    autoSaved,
    savingToPackage,
    packageNotice,
    handleSaveToPackage,
  } = useCreativeResultActions({
    scenePlanId: currentResult.scenePlanId ?? null,
    ctx,
    currentResultTopicTitle: currentResult.topicTitle,
    mode,
    platforms: PLATFORMS,
    buildPosts,
    generatedPosts: generatedPosts as Record<string, unknown>,
    customEdits,
    setContentEnginePosts,
  })

  const handleUpdateContent = (platform: PlatformKey, newText: string) => {
    setCustomEdits((prev) => ({ ...prev, [platform]: newText }))
  }

  const fullPostsRecord = useMemo(() => {
    const record: Record<PlatformKey, FullPostRecord> = {} as Record<PlatformKey, FullPostRecord>
    for (const p of PLATFORMS) {
      const post = generatedPosts[p]
      if (post) {
        record[p] = {
          platform: p,
          platformLabel: post.platformLabel,
          icon: post.icon,
          characterCount: post.characterCount,
          targetAudience: post.targetAudience,
          recommendedPostingTime: post.recommendedPostingTime,
          hashtags: [...post.hashtags],
          content: getPostContent(p),
        }
      }
    }
    return record
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedPosts, customEdits])

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Tiêu đề kết quả & Thông tin tổng hợp ── */}
      <div className="rounded-2xl border border-success/30 bg-gradient-to-br from-success/10 via-surface to-surface-alt p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-success/20 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success text-white shadow-xs">
              <Sparkles size={18} />
            </span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 text-success text-caption font-extrabold uppercase tracking-wider mb-0.5">
                {mode === "CREATIVE" ? "✨ AI CREATIVE SẢN XUẤT THÀNH CÔNG" : "🌿 AUTHENTIC XƯỞNG HOÀN THÀNH"}
              </div>
              <h3 className="text-title font-extrabold text-text">
                {currentResult.topicTitle || "Nội dung truyền thông sản phẩm"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-caption">
            {arc?.totalDurationSeconds && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-alt text-text-muted font-semibold">
                <Clock size={12} /> Thời lượng video: {arc.totalDurationSeconds}s
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">
              {totalCredits} credits
            </span>
          </div>
        </div>

        {arc?.narrativeReasoning && (
          <div className="pt-3 text-caption text-text-muted leading-relaxed">
            <span className="font-bold text-text">Ý đồ kịch bản: </span>
            {arc.narrativeReasoning}
          </div>
        )}
      </div>

      {/* ── Cung truyện 5 nhịp (Narrative Arc) ── */}
      {arc && (
        <CreativeNarrativeScenes
          arc={arc}
          copiedKey={copiedKey}
          handleCopy={handleCopy}
        />
      )}

      {/* ── BÀI VIẾT MẠNG XÃ HỘI ĐA KÊNH HOÀN CHỈNH ── */}
      <CreativeSocialPosts
        fullPosts={fullPostsRecord}
        editedContent={customEdits as Record<PlatformKey, string>}
        editingPlatform={editingPlatform}
        setEditingPlatform={setEditingPlatform}
        handleUpdateContent={handleUpdateContent}
        handleCopy={handleCopy}
        copiedKey={copiedKey}
        handleCopyAllHashtags={handleCopyAllHashtags}
        platforms={PLATFORMS}
        platformLabels={PLATFORM_LABELS}
      />

      {contentEnginePosts && contentEnginePosts.length > 0 ? (
        <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-meta text-success">
          Bài {contentEnginePosts.map((p) => PLATFORM_LABELS[p.channel]?.label ?? p.channel).join(", ")} do Content Engine viết
          (cùng câu chuyện Chặng 05). Kênh khác dùng khuôn dự phòng — hãy đọc lại trước khi đăng.
        </p>
      ) : planPosts && planPosts.length > 0 ? (
        <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-meta text-success">
          Bài {planPosts.map((p) => PLATFORM_LABELS[p.channel]?.label ?? p.channel).join(", ")} lấy từ kịch bản sản xuất Chặng 05.
          Kênh khác dùng khuôn dự phòng — hãy đọc lại trước khi đăng.
        </p>
      ) : null}

      {currentResult.scenePlanId && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3">
          <div className="text-meta text-text-muted">
            {contentEnginePosts && contentEnginePosts.length > 0
              ? "Đã có bài do Content Engine viết cho kịch bản này. Bấm để viết lại (tốn credit riêng, cộng dồn với kịch bản)."
              : "Nhờ Content Engine viết bài đa kênh theo đúng câu chuyện Chặng 05 (tốn credit riêng)."}
            {ceError && <span className="block text-danger mt-1">{ceError}</span>}
          </div>
          <div className="w-full sm:w-60 shrink-0">
            <ProviderSelect kind="content" value={ceProvider} onChange={setCeProvider} label="AI viết bài" disabled={ceStatus === "writing"} />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleWriteWithContentEngine}
            disabled={ceStatus === "writing"}
            className="shrink-0 h-auto py-1.5 px-3 text-caption font-bold"
          >
            {ceStatus === "writing"
              ? "Đang viết..."
              : contentEnginePosts && contentEnginePosts.length > 0
                ? "Viết lại bằng Content Engine"
                : "Viết bằng Content Engine"}
          </Button>
        </div>
      )}

      {/* ── Lưu bài vào gói chiến dịch (Khu vực F) ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3">
        <span className="text-meta text-text-muted">
          Lưu 4 bài (kể cả phần bạn đã sửa) vào gói chiến dịch để Chiến dịch chạy QA và duyệt.
        </span>
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveToPackage}
          disabled={savingToPackage}
          className="shrink-0 h-auto py-1.5 px-3 text-caption font-bold"
        >
          {savingToPackage ? "Đang lưu..." : "Lưu bài vào gói chiến dịch"}
        </Button>
      </div>
      {packageNotice && <p className="text-meta text-text">{packageNotice}</p>}
      <p className={`text-caption ${autoSaved.error ? "text-danger" : "text-text-muted"}`}>
        {autoSaved.error
          ? `Chưa tự lưu được: ${autoSaved.error}`
          : autoSaved.at
          ? `Đã tự lưu 4 bài lúc ${new Date(autoSaved.at).toLocaleTimeString("vi-VN")} — Chặng 07 sẽ đưa sẵn vào gói chiến dịch.`
          : "Bài viết sẽ tự lưu để Chặng 07 đưa sẵn vào gói chiến dịch."}
      </p>

      {/* ── CỔNG PHÊ DUYỆT CHẶNG 06a (STAGE-GATE APPROVAL) ── */}
      {(onGoToAudio || onGoToPackage) && (
        <div className="space-y-2">
          <StageGateApprovalBar
            stageCode="Chặng 06a — NỘI DUNG & BÀI VIẾT"
            title="Phê duyệt Trọn bộ Nội dung & Bài viết Đa Kênh"
            description="Đã sản xuất hoàn chỉnh: Cung truyện 5 nhịp, 4 bài viết mạng xã hội chuyên sâu (Facebook Fanpage, Instagram Reels, TikTok Video 9:16, Zalo OA) và bộ hashtags. Chủ shop phê duyệt để tiến sang Tạo Audio Lồng tiếng & Nhạc nền (Khu vực C)."
            isApproved={false}
            approveLabel="Phê duyệt Nội dung & Chuyển sang Tạo Audio (Khu vực C) →"
            onApprove={onGoToAudio || onGoToPackage!}
            metrics={[
              { label: "Cung kịch bản", value: `${arc?.scenes?.length || 5} cảnh` },
              { label: "Bài viết đa kênh", value: "4 nền tảng đầy đủ" },
              { label: "Hashtags", value: `${baseHashtags.length} thẻ` },
            ]}
          />
          {onGoToPackage && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onGoToPackage}
                className="text-caption font-semibold text-text-muted hover:text-text h-auto p-0 flex items-center gap-1 transition underline decoration-dotted"
              >
                ⚡ Bỏ qua tạo Audio/Ảnh/Video, đi thẳng đến Đóng gói chiến dịch (Chặng 07) →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import {
  resolveApprovedMaster,
  savePostsToPackage,
  contentDraftKey,
  saveContentDraft,
  sceneTwoPresetFor,
  type PackagePostDto,
} from "./package-client"
import type { PlatformKey } from "./creative-social-posts"

export type ContentEnginePost = { channel: PlatformKey; text: string; hashtags: readonly string[] }

export interface CreativeContextState {
  assetId?: string | null | undefined
  productId?: string | null | undefined
  selectedTopic?: { id: string; title: string; angleCategory: string } | null | undefined
  productName?: string | undefined
  mode?: "CREATIVE" | "AUTHENTIC" | string | undefined
}

export function useCreativeResultActions({
  scenePlanId,
  ctx,
  currentResultTopicTitle,
  mode,
  platforms,
  buildPosts,
  generatedPosts,
  customEdits,
  setContentEnginePosts,
}: {
  scenePlanId: string | null
  ctx: CreativeContextState | null | undefined
  currentResultTopicTitle: string
  mode: "CREATIVE" | "AUTHENTIC"
  platforms: PlatformKey[]
  buildPosts: () => PackagePostDto[]
  generatedPosts: Record<string, unknown>
  customEdits: Record<string, string>
  /** Bài Content Engine do màn kết quả giữ: bài thay đổi thì `generatedPosts` tính lại ngay trong cùng lượt render. */
  setContentEnginePosts: (posts: ContentEnginePost[] | null) => void
}) {
  const [ceStatus, setCeStatus] = useState<"idle" | "writing" | "error">("idle")
  const [ceProvider, setCeProvider] = useState<string>("")
  const [ceError, setCeError] = useState<string | null>(null)

  // Tra bản đã có — chỉ ĐỌC, không tạo job, không trừ credit
  useEffect(() => {
    if (!scenePlanId) return
    let cancelled = false
    fetch(`/api/v1/content-engine/generations?scene_plan_id=${encodeURIComponent(scenePlanId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (cancelled || !body?.generation) return
        const posts = (body.generation.posts ?? []) as Array<{ channel: string; text: string; hashtags: readonly string[] }>
        setContentEnginePosts(posts.filter((p): p is typeof posts[number] & { channel: PlatformKey } => platforms.includes(p.channel as never)))
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [scenePlanId, platforms])

  // Bấm mới GỌI THẬT (trừ credit)
  const handleWriteWithContentEngine = async () => {
    if (!scenePlanId) return
    setCeStatus("writing")
    setCeError(null)
    try {
      const idempotencyKey =
        typeof window !== "undefined" && "randomUUID" in window.crypto
          ? window.crypto.randomUUID()
          : `content-engine-ui:${scenePlanId}:${Date.now()}`
      const res = await fetch("/api/v1/content-engine/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          scene_plan_id: scenePlanId,
          asset_id: ctx?.assetId ?? null,
          product_id: ctx?.productId ?? null,
          channels: platforms,
          ...(ceProvider ? { content_provider: ceProvider } : {}),
        }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) throw new Error(body?.error?.message || `Lỗi máy chủ (${res.status})`)
      const posts = (body?.posts ?? []) as Array<{ channel: string; text: string; hashtags: readonly string[] }>
      setContentEnginePosts(posts.filter((p): p is typeof posts[number] & { channel: PlatformKey } => platforms.includes(p.channel as never)))
      setCeStatus("idle")
    } catch (e) {
      setCeError(e instanceof Error ? e.message : "Không viết được bài bằng Content Engine")
      setCeStatus("error")
    }
  }

  // TỰ LƯU bài theo ảnh + chủ đề + mode
  const [autoSaved, setAutoSaved] = useState<{ at: string | null; error: string | null }>({ at: null, error: null })
  const validMode = (ctx?.mode === "CREATIVE" || ctx?.mode === "AUTHENTIC") ? ctx.mode : mode
  const draftKey = ctx ? contentDraftKey({
    assetId: ctx.assetId ?? undefined,
    selectedTopic: ctx.selectedTopic,
    mode: validMode,
  }) : null
  const draftKeyStr = draftKey ? `${draftKey.asset_id}|${draftKey.topic_id}|${draftKey.mode}` : null
  useEffect(() => {
    if (!draftKey) return
    const t = window.setTimeout(() => {
      saveContentDraft(draftKey, buildPosts(), ctx?.selectedTopic?.title ?? currentResultTopicTitle ?? null)
        .then((d) => setAutoSaved({ at: d.updated_at, error: null }))
        .catch((e) => setAutoSaved({ at: null, error: e instanceof Error ? e.message : "Không tự lưu được" }))
    }, 1200)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKeyStr, generatedPosts, customEdits])

  // Lưu 4 bài vào gói chiến dịch của Master hiện tại
  const [savingToPackage, setSavingToPackage] = useState(false)
  const [packageNotice, setPackageNotice] = useState<string | null>(null)
  const handleSaveToPackage = async () => {
    setSavingToPackage(true)
    setPackageNotice(null)
    try {
      const masterId = await resolveApprovedMaster(ctx?.assetId ?? undefined)
      if (!masterId) {
        throw new Error(
          "Chưa có Master Image đã duyệt cho ảnh này — vào Khu vực F bấm 'Skip — Dùng ảnh gốc làm Master' trước."
        )
      }
      const posts = buildPosts()
      const topic = ctx?.selectedTopic
      const saved = await savePostsToPackage({
        masterAssetId: masterId,
        name: `${ctx?.productName || "Sản phẩm"}${topic ? ` — ${topic.title}` : ""}`.slice(0, 200),
        mode,
        topic: topic
          ? {
              id: topic.id,
              title: topic.title,
              angleCategory: topic.angleCategory,
              scene2Preset: sceneTwoPresetFor(topic.angleCategory),
            }
          : null,
        posts,
      })
      setPackageNotice(`Đã lưu ${posts.length} bài vào gói "${saved.name}" (trạng thái: nháp, cần chạy lại QA).`)
    } catch (e) {
      setPackageNotice(e instanceof Error ? e.message : "Không lưu được vào gói chiến dịch")
    } finally {
      setSavingToPackage(false)
    }
  }

  return {
    ceStatus,
    ceProvider,
    setCeProvider,
    ceError,
    handleWriteWithContentEngine,
    autoSaved,
    savingToPackage,
    packageNotice,
    handleSaveToPackage,
  }
}

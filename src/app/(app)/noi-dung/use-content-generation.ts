"use client"

/**
 * Hook quản lý luồng sinh nội dung từ Product Master (chế độ "product").
 * Đồng thời theo dõi uploadFlow để chuyển sang phase "results" khi xong.
 * Tách ra từ page.tsx để tuân thủ SRP.
 */

import { useState, useEffect } from "react"
import type { MultichannelPostItem } from "@/components/templates/content-engine"
import type { ProductOption } from "./product-selector"
import type { useImageUploadFlow } from "./use-image-upload-flow"
import { CHANNELS_CONFIG } from "./channel-selector"

interface UseContentGenerationArgs {
  uploadFlow: ReturnType<typeof useImageUploadFlow>
  products: ProductOption[]
  selectedProductId: string
  selectedChannels: string[]
  ti: { sampleProduct: string }
  inputMode: "product" | "upload"
}

type Phase = "select" | "generating" | "results"

export function useContentGeneration({
  uploadFlow,
  products,
  selectedProductId,
  selectedChannels,
  ti,
  inputMode,
}: UseContentGenerationArgs) {
  const [phase, setPhase] = useState<Phase>("select")
  const [currentStep, setCurrentStep] = useState<string>("analyze")
  const [posts, setPosts] = useState<MultichannelPostItem[]>([])
  const [generationId, setGenerationId] = useState<string | null>(null)
  const [criticScore, setCriticScore] = useState<number | null>(null)
  const [modelInfo, setModelInfo] = useState<{
    provider?: string
    modelName?: string
    isFallback?: boolean
  }>({ provider: "content_engine", modelName: "Content Engine (P27)", isFallback: false })
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // Theo dõi upload flow → chuyển sang phase results khi hoàn tất
  useEffect(() => {
    // Chạy sau lượt render (không setState đồng bộ trong effect)
    void Promise.resolve().then(() => {
      if (uploadFlow.state.step === "done" && uploadFlow.state.posts.length > 0) {
        setPosts(uploadFlow.state.posts)
        setGenerationId(uploadFlow.state.generationId)
        setCriticScore(uploadFlow.state.criticScore)
        setModelInfo({
          provider: "vision_content_engine",
          modelName: "Vision → Content Engine (P27)",
          isFallback: false,
        })
        setPhase("results")
      }
    })
  }, [
    uploadFlow.state.step,
    uploadFlow.state.posts,
    uploadFlow.state.generationId,
    uploadFlow.state.criticScore,
  ])

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0]

  async function handleGenerate() {
    if (selectedChannels.length === 0 || !selectedProduct || inputMode !== "product") return
    setPhase("generating")
    setCurrentStep("analyze")
    setTimeout(() => setCurrentStep("generate"), 600)
    try {
      const iKey =
        typeof window !== "undefined" && "randomUUID" in window.crypto
          ? window.crypto.randomUUID()
          : `noi-dung-${selectedProduct.id}-${Date.now()}`

      const res = await fetch("/api/v1/content-engine/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": iKey },
        body: JSON.stringify({ product_id: selectedProduct.id, channels: selectedChannels }),
      })
      setTimeout(() => setCurrentStep("review"), 1400)

      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error?.message || e.detail || `Lỗi máy chủ (${res.status})`)
      }

      const data = await res.json()
      setGenerationId(data.generation_id || null)
      setCriticScore(typeof data.overall_score === "number" ? data.overall_score : null)

      const mapped: MultichannelPostItem[] = (data.posts ?? []).map(
        (p: { channel: string; text?: string; hashtags?: string[] }) => ({
          channel: p.channel,
          channelLabel:
            CHANNELS_CONFIG.find((c) => c.id === p.channel)?.label ||
            String(p.channel).toUpperCase(),
          headline: `${ti.sampleProduct} ${selectedProduct.name}`,
          bodyText: p.text || "",
          hashtags: p.hashtags || [],
        })
      )
      if (mapped.length === 0)
        throw new Error("Không nhận được nội dung hợp lệ từ Content Engine.")

      setModelInfo({
        provider: "content_engine",
        modelName: "Content Engine (P27)",
        isFallback: Boolean(data.needs_review),
      })
      setPosts(mapped)
      setTimeout(() => setPhase("results"), 1800)
    } catch (err) {
      setNotification({
        type: "error",
        message: `Lỗi sinh nội dung: ${err instanceof Error ? err.message : "Lỗi không xác định"}. Vui lòng thử lại.`,
      })
      setPhase("select")
    }
  }

  const handleUpdatePost = (channel: string, updated: Partial<MultichannelPostItem>) => {
    setPosts((prev) =>
      prev.map((p) => (p.channel === channel ? { ...p, ...updated } : p))
    )
  }

  async function handleApprovePost(post: MultichannelPostItem) {
    if (!generationId) {
      setNotification({ type: "error", message: "Chưa có lượt sinh bài nào để duyệt." })
      return
    }
    try {
      const res = await fetch(
        `/api/v1/content-engine/generations/${encodeURIComponent(generationId)}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            posts: [{ channel: post.channel, text: post.bodyText, hashtags: post.hashtags }],
          }),
        }
      )
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error?.message || `Lỗi máy chủ (${res.status})`)
      }
      setNotification({
        type: "success",
        message: `Đã duyệt bài ${post.channelLabel}. Gửi sang Lịch đăng sẽ có ở bản sau.`,
      })
    } catch (err) {
      setNotification({
        type: "error",
        message: `Chưa duyệt được bài ${post.channelLabel}: ${err instanceof Error ? err.message : "lỗi không xác định"}`,
      })
    }
  }

  return {
    phase,
    setPhase,
    currentStep,
    posts,
    generationId,
    criticScore,
    modelInfo,
    notification,
    handleGenerate,
    handleUpdatePost,
    handleApprovePost,
  }
}

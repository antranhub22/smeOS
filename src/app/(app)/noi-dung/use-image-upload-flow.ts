"use client"

/**
 * Hook quản lý luồng "Tải ảnh trực tiếp → Phân tích thị giác → Sinh nội dung"
 * cho Chức năng 04 (/noi-dung).
 *
 * Quy trình (Single-Call, Provider-First):
 *  Bước 1: Lấy presigned URL + assetId từ POST /api/v1/assets/upload-url
 *  Bước 2: PUT file lên S3 bằng URL đó
 *  Bước 3: Đăng ký Asset vào DB — POST /api/v1/assets
 *  Bước 4: Yêu cầu phân tích thị giác — POST /api/v1/vision/analyses
 *  Bước 5: Sinh nội dung từ assetId — POST /api/v1/content-engine/generations
 */

import { useState, useCallback } from "react"
import type { MultichannelPostItem } from "@/components/templates/content-engine"

export type UploadFlowStep =
  | "idle"
  | "uploading"
  | "registering"
  | "analyzing"
  | "generating"
  | "done"
  | "error"

export interface UploadFlowState {
  step: UploadFlowStep
  /** Preview URL tạm để hiển thị ảnh đã chọn */
  previewUrl: string | null
  /** Tên file người dùng chọn */
  fileName: string | null
  /** Progress upload 0-100 */
  uploadProgress: number
  /** Thông báo lỗi nếu step === "error" */
  errorMessage: string | null
  /** Kết quả bài viết đa kênh */
  posts: MultichannelPostItem[]
  /** ID lượt sinh nội dung (để duyệt sau) */
  generationId: string | null
  /** Điểm Critic tổng hợp */
  criticScore: number | null
  /** assetId đã đăng ký */
  assetId: string | null
}

const CHANNELS_CONFIG = [
  { id: "facebook", label: "Facebook Fanpage" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok Video" },
  { id: "zalo", label: "Zalo OA" },
]

const INITIAL_STATE: UploadFlowState = {
  step: "idle",
  previewUrl: null,
  fileName: null,
  uploadProgress: 0,
  errorMessage: null,
  posts: [],
  generationId: null,
  criticScore: null,
  assetId: null,
}

export function useImageUploadFlow() {
  const [state, setState] = useState<UploadFlowState>(INITIAL_STATE)

  const reset = useCallback(() => setState(INITIAL_STATE), [])

  /** Xử lý khi người dùng chọn file */
  const onFileSelected = useCallback((file: File | null) => {
    if (!file) {
      setState((s) => ({ ...s, previewUrl: null, fileName: null }))
      return
    }
    const previewUrl = URL.createObjectURL(file)
    setState((s) => ({ ...s, previewUrl, fileName: file.name, step: "idle" }))
  }, [])

  /**
   * Chạy toàn bộ luồng 5 bước.
   * @param file File ảnh người dùng chọn
   * @param channels Danh sách kênh muốn sinh bài
   */
  const runFlow = useCallback(
    async (file: File, channels: string[]) => {
      setState((s) => ({
        ...s,
        step: "uploading",
        uploadProgress: 0,
        errorMessage: null,
        posts: [],
        generationId: null,
        criticScore: null,
        assetId: null,
      }))

      try {
        // ── Bước 1: Lấy presigned upload URL ──
        const urlRes = await fetch("/api/v1/assets/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mime_type: file.type }),
        })
        if (!urlRes.ok) {
          const e = await urlRes.json().catch(() => ({}))
          throw new Error(e?.error?.message || `Không lấy được URL tải lên (${urlRes.status})`)
        }
        const { upload_url, asset_id, storage_key } = await urlRes.json()

        // ── Bước 2: PUT file lên S3 ──
        setState((s) => ({ ...s, uploadProgress: 20 }))
        const putRes = await fetch(upload_url as string, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        })
        if (!putRes.ok) {
          throw new Error(`Tải ảnh lên lưu trữ thất bại (${putRes.status})`)
        }
        setState((s) => ({ ...s, uploadProgress: 55, step: "registering" }))

        // ── Bước 3: Đăng ký Asset vào DB ──
        const registerRes = await fetch("/api/v1/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            asset_id,
            kind: "ORIGINAL",
            storage_key,
            mime_type: file.type,
            file_size: file.size,
          }),
        })
        if (!registerRes.ok) {
          const e = await registerRes.json().catch(() => ({}))
          throw new Error(e?.error?.message || `Đăng ký ảnh thất bại (${registerRes.status})`)
        }
        setState((s) => ({
          ...s,
          uploadProgress: 70,
          step: "analyzing",
          assetId: asset_id as string,
        }))

        // ── Bước 4: Yêu cầu phân tích thị giác ──
        const visionKey =
          typeof window !== "undefined" && "randomUUID" in window.crypto
            ? window.crypto.randomUUID()
            : `vision-${asset_id}-${Date.now()}`

        const visionRes = await fetch("/api/v1/vision/analyses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": visionKey,
          },
          body: JSON.stringify({ asset_ids: [asset_id] }),
        })
        if (!visionRes.ok) {
          const e = await visionRes.json().catch(() => ({}))
          throw new Error(e?.error?.message || `Phân tích thị giác thất bại (${visionRes.status})`)
        }
        setState((s) => ({ ...s, uploadProgress: 85, step: "generating" }))

        // ── Bước 5: Sinh nội dung từ assetId ──
        const genKey =
          typeof window !== "undefined" && "randomUUID" in window.crypto
            ? window.crypto.randomUUID()
            : `content-${asset_id}-${Date.now()}`

        const genRes = await fetch("/api/v1/content-engine/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": genKey,
          },
          body: JSON.stringify({
            asset_id,
            channels,
          }),
        })
        if (!genRes.ok) {
          const e = await genRes.json().catch(() => ({}))
          throw new Error(e?.error?.message || `Sinh nội dung thất bại (${genRes.status})`)
        }
        const data = await genRes.json()
        const posts: MultichannelPostItem[] = (data.posts ?? []).map(
          (p: { channel: string; text?: string; hashtags?: string[] }) => ({
            channel: p.channel,
            channelLabel:
              CHANNELS_CONFIG.find((c) => c.id === p.channel)?.label ||
              String(p.channel).toUpperCase(),
            headline: `Sản phẩm từ ảnh tải lên`,
            bodyText: p.text || "",
            hashtags: p.hashtags || [],
          })
        )

        setState((s) => ({
          ...s,
          step: "done",
          uploadProgress: 100,
          posts,
          generationId: data.generation_id || null,
          criticScore: typeof data.overall_score === "number" ? data.overall_score : null,
        }))
      } catch (err) {
        setState((s) => ({
          ...s,
          step: "error",
          uploadProgress: 0,
          errorMessage: err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định",
        }))
      }
    },
    []
  )

  return { state, reset, onFileSelected, runFlow }
}

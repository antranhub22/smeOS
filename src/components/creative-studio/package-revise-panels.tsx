"use client"

/**
 * Sửa tại chỗ ở Chặng 07 (quyết định PO 24/09/2026): người dùng sửa rồi bấm
 * Sửa — hệ thống gọi ĐÚNG backend của khu vực gốc (cùng cổng kiểm, trừ credit,
 * nhật ký), chạy ngầm, người dùng vẫn ở Chặng 07; có kết quả thì hiện ngay và
 * tự thay vào gói.
 */

import { costCreditForFeature } from "@/modules/usage/domain/pricing"
import type { ScenePlanScene } from "@/modules/creative-production/domain/scene-plan-rules"
import { describeIntegrity, type M04bIntegrity } from "./types"
import { variantUnitCostCredit } from "@/modules/media/domain/variant-candidates"
import { postJson } from "./revise-client"

export { AudioRevisePanel } from "./audio-revise-panel"
export { VideoRevisePanel, type EditableVideoScene } from "./video-revise-panel"


const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ─────────────────────────────────────────────────────────────────────────────
// ẢNH — sửa MỘT cảnh: AI viết lại cảnh theo yêu cầu → sinh lại ảnh cảnh đó
// ─────────────────────────────────────────────────────────────────────────────

type VariantPoll = {
  status: string
  result: string | null
  error: string | null
  subject_integrity: M04bIntegrity | null
  variants: Array<{ asset_id: string; variant_key: string }>
}

export function sceneReviseCredit(scene: ScenePlanScene | null, mode: string): number {
  const cloud = mode === "CREATIVE" && scene?.localBackdrop !== "studio_white"
  return costCreditForFeature("creative.scene_revise") + variantUnitCostCredit(cloud ? "cloud_provider" : "local_studio")
}

/**
 * Hai bước chạy nối tiếp: `POST /creative-production/scene-revisions` (AI sửa cảnh,
 * ghi vào kịch bản) → `POST /media/variants` (sinh ảnh, qua cổng integrity) →
 * chờ hoàn thành. Trả asset ảnh mới.
 */
export async function reviseSceneAndRender(input: {
  instruction: string
  scenePlanRef: string | null
  scene: ScenePlanScene
  mode: "CREATIVE" | "AUTHENTIC"
  topicTitle: string
  productName: string
  colors: string[]
  masterAssetId: string
  ratio: string
  onStage: (s: string) => void
}): Promise<{ scene: ScenePlanScene; assetId: string; revision: number | null }> {
  const planId = input.scenePlanRef && !input.scenePlanRef.startsWith("rule:") ? input.scenePlanRef : null
  input.onStage("AI đang viết lại cảnh...")
  const revised = await postJson<{ scene: ScenePlanScene; scene_plan_revision?: number | null }>(
    "/api/v1/creative-production/scene-revisions",
    {
      instruction: input.instruction,
      scene_plan_id: planId,
      scene_index: input.scene.sceneIndex,
      scene: planId ? null : input.scene,
      mode: input.mode,
      topic_title: input.topicTitle,
      product_name: input.productName,
      colors: input.colors.slice(0, 12),
    },
    `scene-revise-${crypto.randomUUID()}`
  )
  const sc = revised.scene
  const cloud = input.mode === "CREATIVE" && sc.localBackdrop !== "studio_white"
  input.onStage(cloud ? "Stability đang vẽ hậu cảnh mới..." : "Đang dựng ảnh với phông cục bộ...")
  const job = await postJson<{ job_id: string }>(
    "/api/v1/media/variants",
    {
      master_asset_id: input.masterAssetId,
      engine: cloud ? "cloud_provider" : "local_studio",
      preset: sc.localBackdrop,
      ratio: input.ratio,
      watermark: true,
      scene_index: sc.sceneIndex,
      ...(input.scenePlanRef ? { scene_plan_id: input.scenePlanRef } : {}),
      ...(revised.scene_plan_revision ? { scene_plan_revision: revised.scene_plan_revision } : {}),
      ...(cloud ? { scene_prompt: sc.backgroundPrompt } : {}),
    },
    `scene-${input.masterAssetId}-${sc.sceneIndex}-${crypto.randomUUID()}`
  )
  const deadline = Date.now() + 6 * 60 * 1000
  while (Date.now() < deadline) {
    await sleep(2500)
    const res = await fetch(`/api/v1/media/variants/${encodeURIComponent(job.job_id)}`)
    if (!res.ok) continue
    const d = (await res.json()) as VariantPoll
    if (d.status === "FAILED" || d.status === "CANCELLED") throw new Error(d.error || "Hệ thống không dựng được ảnh")
    if (d.status !== "COMPLETED") continue
    if (d.result === "REJECTED") {
      const si = d.subject_integrity
      throw new Error(
        `Cổng Subject Integrity từ chối${si ? ` (${describeIntegrity(si)})` : ""} — không ghi ảnh`
      )
    }
    const v =
      d.variants.find((x) => x.variant_key === "branded") ?? d.variants.find((x) => x.variant_key === "styled")
    if (!v) throw new Error("Tác vụ xong nhưng không có ảnh")
    return { scene: sc, assetId: v.asset_id, revision: revised.scene_plan_revision ?? null }
  }
  throw new Error("Quá thời gian chờ xử lý — kiểm tra npm run worker:media")
}

/**
 * Đợt 5 (24/09/2026): sửa cảnh ở Chặng 07 xong thì cập nhật NGAY cảnh đó trong
 * storyboard của video trong gói (ảnh mới + phụ đề mới). Storyboard đổi → video
 * về "kịch bản sẵn sàng", cần duyệt kịch bản + dựng lại. Trả lời nhắn cho người dùng.
 */
export async function propagateSceneToVideo(input: {
  videoJobId: string | null
  sceneIndex: number
  assetId: string
  scene: ScenePlanScene
  voiceChanged: boolean
}): Promise<string | null> {
  if (!input.videoJobId) return null
  const res = await fetch(`/api/v1/video/jobs/${encodeURIComponent(input.videoJobId)}`)
  if (!res.ok) return null
  const job = (await res.json()) as {
    stage: string
    audio_storage_key?: string | null
    scenes?: Array<{
      scene_index: number
      duration_seconds: number
      image_asset_id: string | null
      text_overlay: string | null
      voice_script: string | null
      transition_effect: string | null
      motion_effect: string | null
    }>
  }
  if (job.stage === "RENDERING") return "Video đang dựng — cảnh mới sẽ cần dựng lại sau khi xong."
  const scenes = [...(job.scenes ?? [])].sort((a, b) => a.scene_index - b.scene_index)
  if (!scenes.some((s) => s.scene_index === input.sceneIndex)) return null
  const patch = await fetch(`/api/v1/video/jobs/${encodeURIComponent(input.videoJobId)}/storyboard`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scenes: scenes.map((s) => ({
        sceneIndex: s.scene_index,
        durationSeconds: s.duration_seconds,
        imageAssetId: s.scene_index === input.sceneIndex ? input.assetId : s.image_asset_id,
        textOverlay: s.scene_index === input.sceneIndex ? input.scene.voiceScript : s.voice_script,
        voiceScript: s.scene_index === input.sceneIndex ? input.scene.voiceScript : s.voice_script,
        ...(s.transition_effect ? { transitionEffect: s.transition_effect } : {}),
        ...(s.motion_effect ? { motionEffect: s.motion_effect } : {}),
      })),
    }),
  })
  if (!patch.ok) return "Không cập nhật được cảnh vào video — mở \"Sửa video\" để gắn ảnh mới."
  return input.voiceChanged && job.audio_storage_key
    ? `Đã thay cảnh ${input.sceneIndex} trong video. Lời thoại đổi nên bản âm thanh cũ không còn khớp — "Sửa âm thanh" rồi dựng lại video ở Khu vực E.`
    : `Đã thay ảnh + phụ đề cảnh ${input.sceneIndex} trong video — duyệt kịch bản và dựng lại để có video mới.`
}

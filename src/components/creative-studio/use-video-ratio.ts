"use client"

import { useState } from "react"
import type { CampaignPackageDto } from "./package-client"
import type { ScenePlan } from "./scene-plan-client"
import type { VideoJobSummary } from "./package-workspace-model"

/** Khung video theo nền tảng của gói (một video mỗi khung khi kịch bản có nhiều khung) — tách khỏi `use-package-workspace.ts`. */
export function useVideoRatio(input: {
  scenePlan: ScenePlan | null
  videoJobs: VideoJobSummary[]
  pkgVideos: CampaignPackageDto["videos"] | undefined
  videoJobIds: string[]
  videoJobId: string | null
  setVideoJobIds: (update: (prev: string[]) => string[]) => void
}) {
  const { scenePlan, videoJobs, pkgVideos, videoJobIds, videoJobId, setVideoJobIds } = input
  const planRatios: string[] = scenePlan?.publishing?.ratios?.length
    ? [...scenePlan.publishing.ratios]
    : scenePlan?.publishing?.aspectRatio
    ? [scenePlan.publishing.aspectRatio]
    : []
  const multiRatio = planRatios.length > 1
  const [videoRatioTab, setVideoRatioTab] = useState<string | null>(null)
  const activeRatio = videoRatioTab && planRatios.includes(videoRatioTab) ? videoRatioTab : (planRatios[0] ?? null)
  const ratioOfVideo = (id: string) =>
    videoJobs.find((v) => v.id === id)?.aspect_ratio ?? pkgVideos?.find((v) => v.id === id)?.aspect_ratio ?? null
  const activeVideoId = multiRatio
    ? (videoJobIds.find((id) => ratioOfVideo(id) === activeRatio) ?? null)
    : videoJobId

  const withVideoFor = (ids: string[], id: string | null, ratio: string | null): string[] => {
    if (!multiRatio) return id ? [id] : []
    const r = id ? (ratioOfVideo(id) ?? ratio) : ratio
    const rest = ids.filter((x) => ratioOfVideo(x) !== r && x !== id)
    return id ? [...rest, id] : rest
  }
  const setActiveVideo = (id: string | null) => setVideoJobIds((prev) => withVideoFor(prev, id, activeRatio))

  return { planRatios, multiRatio, videoRatioTab, setVideoRatioTab, activeRatio, ratioOfVideo, activeVideoId, withVideoFor, setActiveVideo }
}

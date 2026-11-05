import { describe, expect, it } from "vitest"

import type { CampaignPackageDto } from "@/components/creative-studio/package-client"
import {
  isPackageDirty,
  parseHashtags,
  selectProducedScenes,
  selectSuggestedVideos,
  type MarketingAsset,
  type VideoJobSummary,
} from "@/components/creative-studio/package-workspace-model"

function asset(id: string, metadata: Record<string, unknown>): MarketingAsset {
  return { id, url: null, aspect_ratio: null, identity_score: null, approval_state: "APPROVED", metadata }
}

function video(id: string, aspect_ratio: string, extra: Partial<VideoJobSummary> = {}): VideoJobSummary {
  return { id, title: id, stage: "RENDERING", video_approval: "PENDING", aspect_ratio, ...extra }
}

describe("parseHashtags — ô hashtag của bài đăng Chặng 09", () => {
  it("tách theo khoảng trắng/dấu phẩy và thêm # còn thiếu", () => {
    expect(parseHashtags("hoa, #tuoi  quatang")).toEqual(["#hoa", "#tuoi", "#quatang"])
    expect(parseHashtags("  ")).toEqual([])
  })
})

describe("selectProducedScenes — ảnh cảnh đã dựng đưa vào gói", () => {
  const marketing = [
    asset("c2", { variant_key: "styled", scene_index: 2, scene_plan_id: "p1" }),
    asset("c1", { variant_key: "branded", scene_index: 1, scene_plan_id: "p1" }),
    asset("c1-dup", { variant_key: "styled", scene_index: 1, scene_plan_id: "p1" }),
    asset("raw", { variant_key: "raw", scene_index: 3, scene_plan_id: "p1" }),
    asset("other-plan", { variant_key: "styled", scene_index: 4, scene_plan_id: "p2" }),
    asset("no-index", { variant_key: "styled", scene_plan_id: "p1" }),
  ]

  it("chỉ lấy styled/branded của đúng kịch bản, mỗi cảnh một ảnh, theo thứ tự cảnh", () => {
    const out = selectProducedScenes({ marketing, urlPlanId: "p1", primaryRatio: "1:1", planRatios: [] })
    expect(out.map((a) => a.id)).toEqual(["c1", "c2"])
  })

  it("không có kịch bản trên URL thì nhận mọi kịch bản", () => {
    const out = selectProducedScenes({ marketing, urlPlanId: null, primaryRatio: "1:1", planRatios: [] })
    expect(out.map((a) => a.id)).toEqual(["c1", "c2", "other-plan"])
  })

  it("kịch bản luật (`rule`) khớp mọi mã bắt đầu bằng `rule:`", () => {
    const rule = [asset("r1", { variant_key: "styled", scene_index: 1, scene_plan_id: "rule:abc" }), ...marketing]
    const out = selectProducedScenes({ marketing: rule, urlPlanId: "rule", primaryRatio: null, planRatios: [] })
    expect(out.map((a) => a.id)).toEqual(["r1"])
  })

  it("nhiều khung: mỗi cặp khung × cảnh một ảnh, bỏ khung ngoài kịch bản", () => {
    const multi = [
      asset("s1-11", { variant_key: "styled", scene_index: 1, ratio: "1:1" }),
      asset("s1-916", { variant_key: "styled", scene_index: 1, ratio: "9:16" }),
      asset("s1-169", { variant_key: "styled", scene_index: 1, ratio: "16:9" }),
    ]
    const out = selectProducedScenes({ marketing: multi, urlPlanId: null, primaryRatio: "1:1", planRatios: ["1:1", "9:16"] })
    expect(out.map((a) => a.id)).toEqual(["s1-11", "s1-916"])
  })
})

describe("selectSuggestedVideos — video gợi ý cho gói", () => {
  const jobs = [
    video("v-render", "9:16", { stage: "RENDER_COMPLETED" }),
    video("v-approved", "9:16", { video_approval: "APPROVED" }),
    video("v-square", "1:1", { stage: "RENDER_COMPLETED" }),
  ]

  it("một khung: ưu tiên video đã duyệt, rồi tới video dựng xong", () => {
    const out = selectSuggestedVideos({ videoJobs: jobs, urlVideoJobId: null, multiRatio: false, planRatios: ["9:16"] })
    expect(out.map((v) => v.id)).toEqual(["v-approved"])
  })

  it("video trên URL thắng gợi ý, kể cả khi chưa có trong danh sách", () => {
    const out = selectSuggestedVideos({ videoJobs: jobs, urlVideoJobId: "v-new", multiRatio: false, planRatios: [] })
    expect(out.map((v) => v.id)).toEqual(["v-new"])
  })

  it("nhiều khung: mỗi khung một video, khung không có video thì bỏ", () => {
    const out = selectSuggestedVideos({ videoJobs: jobs, urlVideoJobId: null, multiRatio: true, planRatios: ["1:1", "9:16", "16:9"] })
    expect(out.map((v) => v.id)).toEqual(["v-square", "v-approved"])
  })

  it("không có video phù hợp thì trả rỗng", () => {
    const out = selectSuggestedVideos({ videoJobs: [video("v", "1:1")], urlVideoJobId: null, multiRatio: false, planRatios: [] })
    expect(out).toEqual([])
  })
})

describe("isPackageDirty — cờ 'Có thay đổi chưa lưu'", () => {
  const pkg = {
    posts: [{ channel: "facebook", text: "A", hashtags: [] }],
    variant_asset_ids: ["a", "b"],
    video_job_ids: [],
    video_job_id: "v1",
    audio_job_id: null,
  } as unknown as CampaignPackageDto
  const base = {
    pkg,
    approved: false,
    draftPosts: pkg.posts,
    selectedVariants: ["b", "a"],
    videoJobIds: ["v1"],
    audioJobId: null,
  }

  it("không đổi gì (kể cả đảo thứ tự ảnh, video cũ một trường) thì không bẩn", () => {
    expect(isPackageDirty(base)).toBe(false)
  })

  it("đổi bài, ảnh, video hoặc âm thanh thì bẩn", () => {
    expect(isPackageDirty({ ...base, draftPosts: [{ channel: "facebook", text: "B", hashtags: [] }] })).toBe(true)
    expect(isPackageDirty({ ...base, selectedVariants: ["a"] })).toBe(true)
    expect(isPackageDirty({ ...base, videoJobIds: ["v2"] })).toBe(true)
    expect(isPackageDirty({ ...base, audioJobId: "au1" })).toBe(true)
  })

  it("chưa có gói hoặc gói đã duyệt thì không bẩn", () => {
    expect(isPackageDirty({ ...base, pkg: null })).toBe(false)
    expect(isPackageDirty({ ...base, approved: true, audioJobId: "au1" })).toBe(false)
  })
})

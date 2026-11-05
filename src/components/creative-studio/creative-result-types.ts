export interface NarrativeScene {
  sceneIndex: number
  beat?: string
  beatTitle?: string
  sceneDescription?: string
  voiceScript: string
  textOverlay: string
  durationSeconds: number
  motionEffect?: string
}

export interface CaptionRequest {
  platform: "facebook" | "tiktok" | "instagram" | "zalo"
  tone: string
  hook: string
  cta: string
  productName?: string
  maxLength?: number
}

export interface CreativeTopicResultItem {
  topicId: string
  topicTitle: string
  planPosts?: Array<{ channel: "facebook" | "instagram" | "tiktok" | "zalo"; text: string; hashtags: readonly string[] }>
  scenePlanId?: string | null
  arc?: {
    emotionalTone?: string
    narrativeReasoning?: string
    totalDurationSeconds?: number
    scenes: NarrativeScene[]
  }
  briefs?: {
    contentBrief?: {
      captionRequests?: CaptionRequest[]
      hashtagSuggestions?: string[]
    }
    videoBrief?: {
      videoFormat?: string
      totalDurationSeconds?: number
    }
    imageBrief?: {
      variantRequests?: Array<{
        prompt: string
        preset: string
        lighting: string
        surface: string
      }>
    }
  }
}

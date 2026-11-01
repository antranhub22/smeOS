"use client"

import type {
  Campaign,
  CampaignObjective,
  CampaignStats,
  CampaignStatus,
} from "@/modules/marketing-center/domain/campaign"
import type { AssetUsage } from "@/modules/marketing-center/domain/asset-usage"

export interface CampaignDetailsData {
  campaign: Campaign
  stats: CampaignStats
  usages: AssetUsage[]
}

export interface CreateCampaignPayload {
  name: string
  objective: CampaignObjective
  occasion_code?: string | null | undefined
  starts_at?: string | null | undefined
  ends_at?: string | null | undefined
  status?: CampaignStatus | undefined
}

export interface UpdateCampaignPayload {
  name?: string | undefined
  objective?: CampaignObjective | undefined
  occasion_code?: string | null | undefined
  starts_at?: string | null | undefined
  ends_at?: string | null | undefined
  status?: CampaignStatus | undefined
}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  })
  const data = (await res.json().catch(() => ({}))) as {
    data?: T
    counts?: Record<string, number>
    next_cursor?: string | null
    error?: { message?: string; details?: Record<string, string> }
  }
  if (!res.ok) {
    const detail = data.error?.details
      ? Object.values(data.error.details).find((v) => typeof v === "string")
      : undefined
    throw new Error(detail || data.error?.message || "Không thể thực hiện yêu cầu")
  }
  return data as T
}

export const campaignApi = {
  list: async (opts?: { status?: CampaignStatus | undefined; objective?: CampaignObjective | undefined; cursor?: string | undefined }) => {
    const params = new URLSearchParams()
    if (opts?.status) params.set("status", opts.status)
    if (opts?.objective) params.set("objective", opts.objective)
    if (opts?.cursor) params.set("cursor", opts.cursor)
    const qs = params.toString() ? `?${params.toString()}` : ""
    return call<{ data: Campaign[]; counts: Record<string, number>; next_cursor: string | null }>(`/api/v1/campaigns${qs}`)
  },

  create: async (payload: CreateCampaignPayload) => {
    const res = await call<{ data: Campaign }>("/api/v1/campaigns", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return res.data
  },

  getDetails: async (id: string) => {
    const res = await call<{ data: CampaignDetailsData }>(`/api/v1/campaigns/${id}`)
    return res.data
  },

  update: async (id: string, payload: UpdateCampaignPayload) => {
    const res = await call<{ data: Campaign }>(`/api/v1/campaigns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
    return res.data
  },
}

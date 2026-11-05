"use client"

import { useState } from "react"
import type { PackageChannel, PackagePostDto } from "./package-client"
import { CHANNELS, parseHashtags } from "./package-workspace-model"

type PostDraft = Record<PackageChannel, { on: boolean; text: string; tags: string }>

/** Viết lại một bài đăng theo yêu cầu (Chặng 09) rồi lưu ngay vào gói — tách khỏi `use-package-workspace.ts`. */
export function usePostRewrite(input: {
  posts: PostDraft
  setPosts: (next: PostDraft) => void
  saveNow: (o: { posts: PackagePostDto[] }) => Promise<void>
  productName: string
  topicTitle: string
  priceRange: string | undefined
}) {
  const { posts, setPosts, saveNow } = input
  const [rewriteText, setRewriteText] = useState<Record<string, string>>({})
  const [rewriteBusy, setRewriteBusy] = useState<string | null>(null)
  const [rewriteMsg, setRewriteMsg] = useState<Record<string, string | null>>({})
  const rewritePost = async (channel: PackageChannel) => {
    const instruction = (rewriteText[channel] ?? "").trim()
    if (instruction.length < 3) {
      setRewriteMsg((p) => ({ ...p, [channel]: "Gõ yêu cầu viết lại (ít nhất vài chữ)" }))
      return
    }
    setRewriteBusy(channel)
    setRewriteMsg((p) => ({ ...p, [channel]: null }))
    try {
      const cur = posts[channel]
      const res = await fetch("/api/v1/creative-production/content-rewrites", {
        method: "POST",
        headers: { "Content-Type": "application/json", "idempotency-key": `rewrite-${crypto.randomUUID()}` },
        body: JSON.stringify({
          channel,
          text: cur.text,
          hashtags: parseHashtags(cur.tags),
          instruction,
          product_name: input.productName,
          topic_title: input.topicTitle,
          ...(input.priceRange ? { price_range: input.priceRange } : {}),
        }),
      })
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: { message?: string } }
        throw new Error(b.error?.message || `HTTP ${res.status}`)
      }
      const r = (await res.json()) as { text: string; hashtags: string[]; warnings: string[] }
      const nextPosts = { ...posts, [channel]: { on: true, text: r.text, tags: r.hashtags.join(" ") } }
      setPosts(nextPosts)
      await saveNow({
        posts: CHANNELS.filter((c) => nextPosts[c.id].on).map((c) => ({
          channel: c.id,
          text: nextPosts[c.id].text,
          hashtags: parseHashtags(nextPosts[c.id].tags),
        })),
      })
      setRewriteText((p) => ({ ...p, [channel]: "" }))
      setRewriteMsg((p) => ({
        ...p,
        [channel]: r.warnings.length ? `Đã viết lại. Lưu ý từ cần cân nhắc: ${r.warnings.join(", ")}` : "Đã viết lại và lưu vào gói.",
      }))
    } catch (e) {
      setRewriteMsg((p) => ({ ...p, [channel]: e instanceof Error ? e.message : "Không viết lại được" }))
    } finally {
      setRewriteBusy(null)
    }
  }


  return { rewriteText, setRewriteText, rewriteBusy, rewriteMsg, rewritePost }
}

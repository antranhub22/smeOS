"use client"

import { formatDateTime } from "@/lib/i18n/formatters"
import { Loader2 } from "@/components/ui/icon-set/loader2"
import { RefreshCw } from "@/components/ui/icon-set/refresh-cw"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { ContentDraftDto, PackageChannel, PackagePostDto } from "./package-client"

export interface PackagePostChannel {
  id: PackageChannel
  label: string
}

export function PackagePostsSection({
  approved,
  goRework,
  bDraft,
  draftPosts,
  samePosts,
  applyBDraft,
  channels,
  posts,
  setPosts,
  rewriteText,
  setRewriteText,
  rewriteBusy,
  rewritePost,
  rewriteMsg,
}: {
  approved: boolean
  goRework: (area: "b" | "c" | "d" | "e", extra?: Record<string, string>) => void
  bDraft: ContentDraftDto | null
  draftPosts: PackagePostDto[]
  samePosts: (a: PackagePostDto[], b: PackagePostDto[]) => boolean
  applyBDraft: () => void
  channels: PackagePostChannel[]
  posts: Record<PackageChannel, { on: boolean; text: string; tags: string }>
  setPosts: React.Dispatch<React.SetStateAction<Record<PackageChannel, { on: boolean; text: string; tags: string }>>>
  rewriteText: Record<string, string>
  setRewriteText: React.Dispatch<React.SetStateAction<Record<string, string>>>
  rewriteBusy: string | null
  rewritePost: (channel: PackageChannel) => Promise<void>
  rewriteMsg: Record<string, string | null>
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-meta font-bold text-text">Bài đăng theo kênh (lưu từ Nội dung hoặc soạn tại đây)</div>
        {!approved && (
          <Button size="sm" variant="outline" className="h-7 text-caption gap-1" onClick={() => goRework("b")}>
            <RefreshCw size={11} /> Viết lại ở Nội dung
          </Button>
        )}
      </div>
      {!approved &&
        bDraft &&
        bDraft.posts.length > 0 &&
        !samePosts(bDraft.posts, draftPosts) && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-meta">
            <span>
              Có bài tự lưu lúc {formatDateTime(bDraft.updated_at)} khác với bài trong gói.
            </span>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="font-bold text-primary hover:underline p-0 h-auto text-meta"
              onClick={applyBDraft}
            >
              ↻ Dùng bài của Nội dung
            </Button>
          </div>
        )}
      {channels.map((c) => {
        const p = posts[c.id]
        if (!p) return null
        return (
          <div key={c.id} className="rounded-lg border border-border p-3 space-y-2">
            <label className="flex items-center gap-2 text-meta font-bold cursor-pointer">
              <Checkbox
                checked={p.on}
                disabled={approved}
                onCheckedChange={(checked) =>
                  setPosts((prev) => ({
                    ...prev,
                    [c.id]: { ...prev[c.id], on: !!checked },
                  }))
                }
              />
              {c.label}
            </label>
            {p.on && (
              <>
                <Textarea
                  value={p.text}
                  disabled={approved}
                  onChange={(e) => setPosts((prev) => ({ ...prev, [c.id]: { ...prev[c.id], text: e.target.value } }))}
                  rows={5}
                  className="w-full text-caption"
                  placeholder={`Nội dung bài ${c.label}`}
                />
                <Input
                  value={p.tags}
                  disabled={approved}
                  onChange={(e) => setPosts((prev) => ({ ...prev, [c.id]: { ...prev[c.id], tags: e.target.value } }))}
                  className="w-full text-caption"
                  placeholder="#hashtag cách nhau bằng dấu cách"
                />
                <div className="text-caption text-text-muted">{p.text.length} ký tự</div>
                {!approved && (
                  <div className="flex flex-col gap-1.5 rounded border border-dashed border-border p-2">
                    <div className="flex gap-2">
                      <Input
                        value={rewriteText[c.id] ?? ""}
                        disabled={rewriteBusy !== null}
                        onChange={(e) => setRewriteText((prev) => ({ ...prev, [c.id]: e.target.value }))}
                        placeholder="Yêu cầu AI viết lại, vd: vui hơn, ngắn gọn, nhấn mạnh giao nhanh trong ngày"
                        className="flex-1 text-caption"
                      />
                      <Button
                        size="sm"
                        className="h-7 text-caption gap-1 shrink-0"
                        disabled={rewriteBusy !== null}
                        onClick={() => void rewritePost(c.id)}
                      >
                        {rewriteBusy === c.id ? (
                          <Loader2 size={11} className="animate-spin motion-reduce:animate-none" />
                        ) : (
                          <RefreshCw size={11} />
                        )}
                        AI viết lại (1 credit)
                      </Button>
                    </div>
                    {rewriteMsg[c.id] && <div className="text-caption text-text-muted">{rewriteMsg[c.id]}</div>}
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}
    </section>
  )
}

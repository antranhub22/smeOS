"use client"

import { Film } from "@/components/ui/icon-set/film"
import { Volume2 } from "@/components/ui/icon-set/volume2"
import { Clock } from "@/components/ui/icon-set/clock"
import { Check } from "@/components/ui/icon-set/check"
import { Copy } from "@/components/ui/icon-set/copy"
import { Button } from "@/components/ui/button"
import type { NarrativeScene } from "./creative-result-types"

export function CreativeNarrativeScenes({
  arc,
  copiedKey,
  handleCopy,
}: {
  arc: {
    emotionalTone?: string
    narrativeReasoning?: string
    totalDurationSeconds?: number
    scenes: NarrativeScene[]
  }
  copiedKey: string | null
  handleCopy: (text: string, key: string) => void
}) {
  if (!arc.scenes || arc.scenes.length === 0) return null

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Film size={18} className="text-primary" />
          <h4 className="text-body-sm font-bold text-text">
            1. Kịch bản video cốt truyện 5 nhịp ({arc.scenes.length} cảnh)
          </h4>
        </div>
        <span className="text-caption text-text-muted font-medium">
          Tone cảm xúc: <strong className="text-primary">{arc.emotionalTone || "Chạm cảm xúc"}</strong>
        </span>
      </div>

      <div className="space-y-3">
        {arc.scenes.map((scene) => {
          const sceneKey = `scene-${scene.sceneIndex}`
          return (
            <div
              key={scene.sceneIndex}
              className="rounded-xl border border-border/60 bg-surface-alt/60 p-3.5 space-y-2 text-caption hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-caption font-extrabold">
                    {scene.sceneIndex}
                  </span>
                  <span className="font-bold text-text">
                    {scene.beatTitle || `Nhịp ${scene.sceneIndex}`}
                  </span>
                  {scene.beat && (
                    <span className="px-1.5 py-0.5 rounded text-caption font-bold bg-primary/10 text-primary uppercase">
                      {scene.beat}
                    </span>
                  )}
                </div>
                <span className="text-caption text-text-muted font-mono flex items-center gap-1">
                  <Clock size={11} /> {scene.durationSeconds}s
                </span>
              </div>

              {scene.sceneDescription && (
                <div className="text-caption text-text-muted leading-relaxed">
                  <span className="font-semibold text-text">Bối cảnh: </span>
                  {scene.sceneDescription}
                </div>
              )}

              {/* Lời thoại lồng tiếng */}
              <div className="rounded-lg bg-surface p-2.5 border border-border/60 text-caption space-y-1">
                <div className="flex items-center justify-between text-text-muted text-caption font-semibold">
                  <span className="flex items-center gap-1 text-primary">
                    <Volume2 size={12} /> Giọng đọc lồng tiếng (Voiceover):
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(scene.voiceScript, sceneKey)}
                    className="text-text-muted hover:text-text h-auto p-0 flex items-center gap-1 transition text-caption font-semibold"
                  >
                    {copiedKey === sceneKey ? (
                      <><Check size={11} className="text-success" /> Đã chép</>
                    ) : (
                      <><Copy size={11} /> Chép lời</>
                    )}
                  </Button>
                </div>
                <p className="text-text leading-relaxed font-medium">
                  “{scene.voiceScript}”
                </p>
              </div>

              {/* Text Overlay & Chuyển động */}
              <div className="flex flex-wrap items-center gap-3 text-caption text-text-muted pt-0.5">
                {scene.textOverlay && (
                  <div>
                    Chữ video: <strong className="text-text">“{scene.textOverlay}”</strong>
                  </div>
                )}
                {scene.motionEffect && (
                  <div>
                    Chuyển động: <span className="font-mono text-text">{scene.motionEffect}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

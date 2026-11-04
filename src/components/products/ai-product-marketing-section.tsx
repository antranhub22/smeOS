"use client"

import React from "react"
import { Sparkles } from "@/components/ui/icon-set/sparkles"
import { Loader2 } from "@/components/ui/icon-set/loader2"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface AiProductMarketingSectionProps {
  description: string
  onChange: (val: string) => void
  onCallContentEngine: (style: "luxurious" | "sweet" | "creative" | "concise") => Promise<void>
  isGeneratingContent: boolean
  contentSuggestions: string[]
  onSelectSuggestion: (text: string) => void
}

export function AiProductMarketingSection({
  description,
  onChange,
  onCallContentEngine,
  isGeneratingContent,
  contentSuggestions,
  onSelectSuggestion,
}: AiProductMarketingSectionProps) {
  return (
    <Card className="p-5 space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="text-title-sm font-bold text-text">Câu chuyện và thông điệp sản phẩm</div>
          <div className="text-caption text-text-muted">
            Trau chuốt bởi hệ thống Content Engine tạo chiều sâu cảm xúc và sức hút thương mại.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isGeneratingContent}
            onClick={() => onCallContentEngine("luxurious")}
            className="flex items-center gap-1.5 text-primary border-primary/30 hover:bg-primary-muted font-semibold"
          >
            {isGeneratingContent ? (
              <Loader2 size={14} className="animate-spin motion-reduce:animate-none text-primary" />
            ) : (
              <Sparkles size={14} className="text-primary" />
            )}
            <span>Trau chuốt Content Engine</span>
          </Button>
        </div>
      </div>

      <Textarea
        rows={3}
        value={description}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Mô tả ý nghĩa sản phẩm, cảm xúc gửi gắm hoặc hướng dẫn chăm sóc giúp sản phẩm lâu..."
        className="text-body-sm"
      />

      {contentSuggestions.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-caption font-bold text-text-muted">Gợi ý từ Content Engine (bấm để chọn):</span>
          <div className="grid grid-cols-1 gap-2">
            {contentSuggestions.map((sug, i) => (
              <Button
                type="button"
                variant="outline"
                key={i}
                onClick={() => onSelectSuggestion(sug)}
                className="h-auto w-full justify-start text-left font-normal rounded-xl border border-border bg-surface-alt/60 p-2.5 text-body-sm text-text hover:border-primary hover:bg-primary-muted/20 transition-colors whitespace-normal"
              >
                &ldquo;{sug}&rdquo;
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

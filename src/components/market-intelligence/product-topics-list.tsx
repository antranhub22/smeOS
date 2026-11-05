"use client";

import { Button } from "@/components/ui/button"; import React, { useState } from "react";
import { Copy, Check, Video, FileText, Play, Sparkles, Target, ArrowRight, Wand2 } from "@/components/ui/icons";
import type { ConcreteTopic, TopicAngleCategory } from "@/modules/market-intelligence/domain/product-intelligence-types";
import { getTopicDualRealVideoEvidence } from "./video-evidence-catalog";

interface ProductTopicsListProps {
  topics: ConcreteTopic[];
  selectedTopicId?: string | undefined;
  onSelectTopic?: (topic: ConcreteTopic) => void;
  onOpenCreativeStudio?: (topic: ConcreteTopic) => void;
}

const ANGLE_LABELS: Record<string, { label: string; colorClass: string }> = {
  PRODUCT_SHOWCASE: { label: "Giới thiệu sản phẩm & Giá", colorClass: "bg-info-bg text-info-text border-info-border" },
  EDUCATIONAL: { label: "Chia sẻ bí quyết & Cẩm nang", colorClass: "bg-success-bg text-success-text border-success-border" },
  PROBLEM_SOLUTION: { label: "Gỡ rối tình huống tặng quà", colorClass: "bg-warning-bg text-warning-text border-warning-border" },
  EMOTIONAL: { label: "Chạm cảm xúc & Tình cảm", colorClass: "bg-primary-muted text-primary border-primary-border" },
  TREND: { label: "Bắt sóng trào lưu thịnh hành", colorClass: "bg-accent-bg text-accent-text border-accent-border" },
  PRICE_VALUE: { label: "Phân khúc giá & Giá trị", colorClass: "bg-info-bg text-info-text border-info-border" },
};

export function ProductTopicsList({
  topics,
  selectedTopicId: externalSelectedTopicId,
  onSelectTopic,
  onOpenCreativeStudio,
}: ProductTopicsListProps) {
  const [internalSelectedTopicId, setInternalSelectedTopicId] = useState<string | null>(
    topics[0]?.id || null
  );
  const selectedTopicId = externalSelectedTopicId !== undefined ? externalSelectedTopicId : internalSelectedTopicId;

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeAngleFilter, setActiveAngleFilter] = useState<string>("ALL");

  const handleCopyHook = (topic: ConcreteTopic) => {
    navigator.clipboard.writeText(`${topic.title}\n\n[Hook]: ${topic.hook}\n[CTA]: ${topic.cta}`);
    setCopiedId(topic.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSelect = (topic: ConcreteTopic) => {
    setInternalSelectedTopicId(topic.id);
    onSelectTopic?.(topic);
  };

  const filteredTopics = activeAngleFilter === "ALL"
    ? topics
    : topics.filter((t) => t.angleCategory === activeAngleFilter);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) || topics[0];

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-muted text-primary">
            <Sparkles size={18} />
          </span>
          <div>
            <h3 className="text-body-sm font-bold text-text">
              4. Khám phá 10 Chủ đề Tiếp thị & Chọn định hướng chiến dịch (Chặng 04 & 05)
            </h3>
            <p className="text-caption text-text-muted">
              Nhấp chọn 1 chủ đề tâm đắc nhất bên dưới để làm định hướng sản xuất video hoặc ảnh marketing
            </p>
          </div>
        </div>
      </div>

      {/* Filter by Angles */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-caption">
        <Button variant="ghost"
          type="button"
          onClick={() => setActiveAngleFilter("ALL")}
          className={`text-[length:inherit] h-auto gap-0 px-3 py-1 rounded-xl font-bold transition whitespace-nowrap ${
            activeAngleFilter === "ALL"
              ? "bg-primary text-white shadow-xs hover:bg-primary"
              : "bg-surface-alt text-text-muted hover:bg-border"
          }`}
        >
          Tất cả ({topics.length})
        </Button>
        {Object.entries(ANGLE_LABELS).map(([key, item]) => {
          const count = topics.filter((t) => t.angleCategory === key).length;
          if (count === 0) return null;
          const isActive = activeAngleFilter === key;
          return (
            <Button variant="outline"
              key={key}
              type="button"
              onClick={() => setActiveAngleFilter(key)}
              className={`text-[length:inherit] h-auto gap-0 px-2.5 py-1 rounded-xl font-bold transition whitespace-nowrap border ${
                isActive
                  ? "bg-text text-white border-text shadow-xs hover:bg-text"
                  : "bg-bg text-text-muted border-border hover:bg-surface-alt"
              }`}
            >
              {item.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Selected Topic Highlight Banner */}
      {selectedTopic && (
        <div className="rounded-xl border-2 border-primary bg-primary-muted/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-white text-caption font-bold uppercase tracking-wider">
              <Check size={11} /> Định hướng đang được chọn
            </span>
            <p className="text-caption sm:text-body-sm font-bold text-text line-clamp-1">
              {selectedTopic.title}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenCreativeStudio && (
              <Button variant="primary"
                type="button"
                onClick={() => onOpenCreativeStudio(selectedTopic)}
                className="h-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-caption font-bold shadow-xs transition"
              >
                <Wand2 size={13} />
                Sáng tạo nội dung
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Grid of Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTopics.map((topic, index) => {
          const angle = ANGLE_LABELS[topic.angleCategory] || {
            label: topic.angleCategory,
            colorClass: "bg-surface-alt text-text border-border",
          };
          const isCopied = copiedId === topic.id;
          const isSelected = selectedTopicId === topic.id;

          const dualEvidence = topic.dualVideoEvidence || getTopicDualRealVideoEvidence(topic.title);
          const { tiktok, youtube } = dualEvidence;

          return (
            <div
              role="button"
              tabIndex={0}
              key={topic.id}
              onClick={() => handleSelect(topic)}
              className={`rounded-xl border p-4 space-y-3.5 transition flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? "border-2 border-primary bg-white shadow-md ring-2 ring-primary/10"
                  : "border-border/80 bg-bg/30 hover:bg-white hover:border-primary-border hover:shadow-xs"
              }`}
            >
              <div className="space-y-2.5">
                {/* Header Tag, Format & Select Radio */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-caption font-bold border ${angle.colorClass}`}>
                      #{index + 1} · {angle.label}
                    </span>
                    <span className="text-caption font-semibold text-text-muted uppercase tracking-wider">
                      {topic.format === "REELS_TIKTOK_9_16" ? "Video 9:16" : "Ảnh 1:1"}
                    </span>
                  </div>

                  <Button variant="ghost"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(topic);
                    }}
                    className={`h-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-caption font-bold transition ${
                      isSelected
                        ? "bg-primary text-white hover:bg-primary"
                        : "bg-surface-alt text-text-muted hover:bg-border"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check size={11} /> Đang chọn
                      </>
                    ) : (
                      "Chọn chủ đề này"
                    )}
                  </Button>
                </div>

                {/* Title */}
                <h4 className="font-bold text-text text-caption sm:text-body-sm leading-snug">
                  {topic.title}
                </h4>

                {/* Hook Box */}
                <div className="bg-white/90 border border-border/70 rounded-lg p-2.5 text-caption text-text">
                  <span className="text-caption font-bold text-primary block mb-0.5">
                    Câu giật tít mở đầu (Hook):
                  </span>
                  <p className="italic font-medium text-text leading-relaxed text-caption">
                    &ldquo;{topic.hook}&rdquo;
                  </p>
                </div>

                {/* Dẫn chứng Video Kép (Dual Video Evidence) */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-caption font-bold text-text-muted block">
                    {tiktok.isLiveEvidence === true && youtube.isLiveEvidence === true
                      ? "Dẫn chứng Video Kép (TikTok & YouTube):"
                      : "Video tham khảo (TikTok & YouTube):"}
                  </span>
                  {(tiktok.isLiveEvidence !== true || youtube.isLiveEvidence !== true) && (
                    <span className="text-caption text-warning-text block">
                      Danh mục tham khảo tuyển chọn — lượt xem/tương tác là ước tính, không phải số liệu thời gian thực.
                    </span>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Thumbnail TikTok (9:16 dọc) */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(tiktok.videoUrl, "_blank");
                      }}
                      className="group/tt relative rounded-lg overflow-hidden border border-border bg-black cursor-pointer hover:border-success transition flex flex-col"
                    >
                      <div className="relative aspect-[9/14] w-full overflow-hidden">
                        {tiktok.isLiveEvidence === true ? (
                          <img
                            src={tiktok.thumbnailUrl}
                            alt={tiktok.alt || tiktok.title}
                            className="h-full w-full object-cover group-hover/tt:scale-105 transition duration-300"
                          />
                        ) : (
                          // Danh mục tham khảo không có ảnh TikTok thật — không mượn ảnh YouTube.
                          <div className="h-full w-full flex items-center justify-center bg-text text-caption text-text-muted px-2 text-center">
                            Mở kết quả tìm kiếm TikTok
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 group-hover/tt:bg-black/10 transition flex items-center justify-center">
                          <span className="h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center group-hover/tt:scale-110 transition">
                            <Play size={10} fill="white" className="ml-0.5" />
                          </span>
                        </div>
                        <span className="absolute top-1.5 left-1.5 inline-flex items-center px-1.5 py-0.2 rounded bg-black/80 text-[var(--color-tiktok-grad)] text-caption font-extrabold tracking-wider">
                          TikTok
                        </span>
                      </div>
                      <div className="p-1.5 bg-text/90 text-white text-caption">
                        {/* TikTok tham khảo là TRANG TÌM KIẾM, không phải một video cụ thể —
                            không hiển thị tác giả/lượt tim như thể có thật (23/09/2026). */}
                        {tiktok.isLiveEvidence === true ? (
                          <>
                            <p className="font-bold truncate">{tiktok.author}</p>
                            <p className="text-caption text-text-muted truncate">{tiktok.metrics}</p>
                          </>
                        ) : (
                          <>
                            <p className="font-bold truncate">Tìm trên TikTok</p>
                            <p className="text-caption text-text-muted truncate">{tiktok.title}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Thumbnail YouTube (16:9 ngang) */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(youtube.videoUrl, "_blank");
                      }}
                      className="group/yt relative rounded-lg overflow-hidden border border-border bg-black cursor-pointer hover:border-danger transition flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden">
                        <img
                          src={youtube.thumbnailUrl}
                          alt={youtube.alt || youtube.title}
                          className="h-full w-full object-cover group-hover/yt:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover/yt:bg-black/10 transition flex items-center justify-center">
                          <span className="h-6 w-6 rounded-full bg-danger/90 text-white flex items-center justify-center group-hover/yt:scale-110 transition">
                            <Play size={10} fill="white" className="ml-0.5" />
                          </span>
                        </div>
                        <span className="absolute top-1.5 left-1.5 inline-flex items-center px-1.5 py-0.2 rounded bg-danger text-white text-caption font-extrabold tracking-wider">
                          YouTube
                        </span>
                      </div>
                      <div className="p-1.5 bg-text/90 text-white text-caption flex-1 flex flex-col justify-end">
                        <p className="font-bold truncate">{youtube.author}</p>
                        <p className="text-caption text-text-muted truncate">
                          {youtube.isLiveEvidence === true ? youtube.metrics : `${youtube.metrics} (ước tính)`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence Note */}
                <div className="flex items-center justify-between text-caption text-text-muted pt-0.5">
                  <span className="line-clamp-1 italic text-caption">📊 {topic.evidenceNote}</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-border/60 gap-2">
                <Button variant="outline"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyHook(topic);
                  }}
                  className="h-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-white hover:bg-bg text-caption font-semibold text-text transition"
                >
                  {isCopied ? (
                    <>
                      <Check size={12} className="text-success-text" />
                      <span className="text-success-text">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Chép Hook</span>
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-1.5">
                  {onOpenCreativeStudio && (
                    <Button variant="secondary"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCreativeStudio(topic);
                      }}
                      className="h-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-caption font-bold shadow-xs transition"
                    >
                      <Wand2 size={12} />
                      Sáng tạo nội dung
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

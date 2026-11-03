"use client"

import React, { useState } from "react"
import { Camera, Sparkles, Image as ImageIcon, ZoomIn, X } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { SmartFlowerImage } from "../smart-flower-image"

const GALLERY_SLOT_COUNT = 6

export interface GalleryPhotoItem {
  src: string
  title: string
  caption: string
}

interface LandingTemplateGalleryProps {
  archetypeId?: string | undefined
  photos?: GalleryPhotoItem[] | undefined
}



export function LandingTemplateGallery({
  archetypeId = "minimal-luxury",
  photos,
}: LandingTemplateGalleryProps) {
  const [activePhoto, setActivePhoto] = useState<{ src: string; title: string; caption: string } | null>(null)
  const isLuxury = archetypeId === "minimal-luxury"
  const isRomantic = archetypeId === "pastel-romantic"
  const isFestive = archetypeId === "festive-sale"

  // Không có ảnh thật → ẩn section hoàn toàn
  if (!photos || photos.length === 0) return null

  // Lặp vòng ảnh thật để fill đủ số slot (nếu shop có ít ảnh hơn)
  const displayPhotos: GalleryPhotoItem[] = Array.from(
    { length: Math.min(GALLERY_SLOT_COUNT, Math.max(photos.length, 1)) },
    (_, idx) => photos[idx % photos.length]!
  )

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-caption font-bold text-text uppercase tracking-wider">
          <Camera size={14} className={isLuxury || isRomantic ? "text-primary" : isFestive ? "text-primary" : "text-warning"} />
          <span className={isLuxury ? "font-display" : ""}>
            {"Ảnh mẫu thật"}
          </span>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {displayPhotos.map((photo, idx) => (
          <Button
            type="button"
            variant="ghost"
            key={photo.src}
            onClick={() => setActivePhoto(photo)}
            className={`group relative h-auto p-0 rounded-2xl overflow-hidden border shadow-xs transition-all text-left block w-full focus:outline-hidden focus:ring-2 focus:ring-primary/40 ${
              isLuxury
                ? "border-primary/20 bg-surface-alt/40 hover:border-primary/60"
                : isFestive
                ? "border-primary/20 bg-surface hover:border-primary"
                : "border-border bg-surface hover:border-primary/60"
            }`}
          >
            <div className="relative aspect-4/3 overflow-hidden bg-surface-alt">
              <SmartFlowerImage
                src={photo.src}
                alt={photo.title}
                aspectRatio="4/3"
                fallbackIndex={idx}
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <ZoomIn size={20} className="drop-shadow-md" />
              </div>
            </div>

            <div className="p-2.5 bg-surface">
              <h5 className={`text-caption font-bold text-text line-clamp-1 group-hover:text-primary transition-colors ${
                isLuxury ? "font-display" : ""
              }`}>
                {photo.title}
              </h5>
              <p className={`text-caption line-clamp-1 mt-0.5 ${isLuxury ? "font-display text-text italic" : "text-text-muted"}`}>
                {photo.caption}
              </p>
            </div>
          </Button>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog
        open={Boolean(activePhoto)}
        onOpenChange={(open) => !open && setActivePhoto(null)}
        title={activePhoto?.title ?? "Chi tiết ảnh mẫu"}
        size="md"
      >
        {activePhoto && (
          <div className="overflow-hidden rounded-2xl">
            <div className="aspect-4/3 w-full bg-black">
              <SmartFlowerImage
                src={activePhoto.src}
                alt={activePhoto.title}
                aspectRatio="4/3"
              />
            </div>

            <div className="p-4 bg-surface space-y-1">
              <h4 className="text-body font-bold text-text">{activePhoto.title}</h4>
              <p className="text-caption text-text-muted">{activePhoto.caption}</p>
            </div>
          </div>
        )}
      </Dialog>
    </section>
  )
}

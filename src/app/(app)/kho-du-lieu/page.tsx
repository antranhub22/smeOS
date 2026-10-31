"use client"

import { InfoTip } from "@/components/ui/info-tip"
import Link from "next/link"
import { AccountStorageHub } from "@/components/storage/account-storage-hub"
import { Button } from "@/components/ui/button"
import { Camera, Plus, Sparkles, Folder } from "@/components/ui/icons"
import { useI18n } from "@/lib/i18n"

export default function KhoDuLieuPage() {
  const { dict } = useI18n()
  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6 max-w-7xl mx-auto w-full">
      {/* Top Header Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
            <Folder size={22} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-text">{dict.storage.header.title}</h1>
              {/* Giải thích trong "?" (OPERATING_PRINCIPLES §6.1) */}
              <InfoTip label={dict.storage.header.title} side="bottom">
                {dict.storage.header.description}
              </InfoTip>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/tai-anh">
            <Button variant="primary" className="flex items-center gap-2 font-bold h-10 px-4 shadow-xs">
              <Camera size={16} strokeWidth={2} />
              {dict.storage.header.uploadButton}
            </Button>
          </Link>
        </div>
      </div>

      {/* Main 3-Partition Storage Hub */}
      <AccountStorageHub initialTab="approved" />
    </div>
  )
}

"use client"

import { useI18n } from "@/lib/i18n"
import React, { useEffect, useState } from "react"
import {
  Users,
  Plus,
  Search,
  Store,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
} from "lucide-react"
import type { ChainPartnershipEntity } from "@/modules/chain-partnership/domain/partnership-entities"
import Link from "next/link"
import { PartnerToolMatrixModal } from "@/components/organization/partner-tool-matrix-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import { PageContainer } from "@/components/ui/page-container"
import { Card } from "@/components/ui/card"
import { ChainPartnerCreateModal } from "./chain-partner-create-modal"

export default function ChainPartnersPage() {
  const { t } = useI18n()
  const [partners, setPartners] = useState<ChainPartnershipEntity[]>([])
  const [selectedToolPartner, setSelectedToolPartner] = useState<ChainPartnershipEntity | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/v1/coordinator/partners")
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setPartners(json.data)
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  const filtered = partners.filter(
    (p) =>
      (p.partnerOrgName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.partnerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.contactName || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <PageContainer className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Cửa hàng & Đối tác trực thuộc Chuỗi"
        description="Quản lý mạng lưới chi nhánh, xưởng gia công vệ tinh và liên kết trò chuyện trực tiếp trên nền tảng."
        badge={
          <span className="text-caption bg-primary-subtle text-primary font-semibold px-2.5 py-0.5 rounded-full border border-primary/20">
            Mô hình Phân Tầng
          </span>
        }
        actions={
          <Button
            type="button"
            onClick={() => setShowModal(true)}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Thêm / Liên kết đối tác
          </Button>
        }
      />

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            type="text"
            placeholder="Tìm theo tên cửa hàng, mã đối tác, người liên hệ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            inputSize="sm"
          />
        </div>
        <div className="text-meta text-text-muted font-medium">
          Tổng số: <span className="font-bold text-text">{partners.length}</span> đối tác
        </div>
      </div>

      {/* Partner Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-meta text-text-muted">Đang tải danh bạ đối tác chuỗi...</div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-16 p-8 space-y-3">
          <Store className="w-12 h-12 text-text-muted/40 mx-auto" />
          <h3 className="text-sm font-semibold text-text">Chưa có cửa hàng/đối tác nào</h3>
          <p className="text-meta text-text-muted max-w-sm mx-auto">
            Bấm &quot;Thêm / Liên kết đối tác&quot; để cấp tài khoản hoặc kết nối cửa hàng đã có sẵn trên hệ thống.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="p-5 hover:border-primary/40 transition-all space-y-4"
              variant="interactive"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center font-bold text-sm">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text leading-tight">
                      {p.partnerOrgName || "Cửa hàng đối tác"}
                    </h3>
                    <span className="text-caption text-text-muted font-mono mt-0.5 inline-block">
                      Mã: {p.partnerCode}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-caption font-semibold px-2 py-0.5 rounded-full ${
                    p.status === "ACTIVE"
                      ? "bg-success-subtle text-success border border-success/20"
                      : "bg-surface-muted text-text-muted"
                  }`}
                >
                  {p.status === "ACTIVE" ? "Đang hoạt động" : "Tạm ngưng"}
                </span>
              </div>

              <div className="text-meta space-y-1.5 text-text border-t border-b border-border py-3">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-text-muted" />
                  <span>Đại diện: {p.contactName || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-text-muted" />
                  <span>{p.contactPhone || "Chưa có SĐT"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-text-muted" />
                  <span className="truncate">{p.contactEmail || "Chưa có Email"}</span>
                </div>
                {p.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-text-muted" />
                    <span className="truncate">{p.address} ({p.province})</span>
                  </div>
                )}
                {p.partnerOrgSlug && (
                  <div className="flex items-center justify-between pt-1 border-t border-border mt-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-success" />
                      <span className="text-caption text-text-muted">Mã kết nối:</span>
                      <span className="font-mono font-bold text-text text-caption">
                        {p.partnerOrgSlug.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedToolPartner(p)}
                  className="flex-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  <span>Phân quyền công cụ</span>
                </Button>
                <Link
                  href={"/tin-nhan" as any}
                  className="p-2 bg-primary-subtle hover:bg-primary-subtle/80 text-primary rounded-xl text-caption font-semibold flex items-center justify-center transition-colors"
                  title="Nhắn tin nội bộ"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/dieu-phoi"
                  className="px-3 py-2 border border-border hover:bg-surface-muted text-text rounded-xl text-caption font-medium transition-colors"
                >
                  Bắn đơn
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Phân quyền Công cụ Chi nhánh */}
      {selectedToolPartner && (
        <PartnerToolMatrixModal
          partnerId={selectedToolPartner.id}
          partnerName={selectedToolPartner.partnerOrgName || "Cửa hàng đối tác"}
          partnerCode={selectedToolPartner.partnerCode}
          initialUnlockedTools={selectedToolPartner.unlockedTools}
          onClose={() => setSelectedToolPartner(null)}
          onSuccess={(updatedTools) => {
            setPartners((prev) =>
              prev.map((item) =>
                item.id === selectedToolPartner.id
                  ? { ...item, unlockedTools: updatedTools }
                  : item
              )
            )
          }}
        />
      )}

      {/* Modal Thêm Đối tác */}
      <ChainPartnerCreateModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchPartners}
      />
    </PageContainer>
  )
}

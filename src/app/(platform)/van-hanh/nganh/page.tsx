"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ShieldAlert, CheckCircle2 } from "@/components/ui/icons"
import { Badge } from "@/components/ui/badge"
import { MatrixToolbar } from "./_components/matrix-toolbar"
import { MatrixGrid } from "./_components/matrix-grid"
import { MatrixDiffModal } from "./_components/matrix-diff-modal"
import { useI18n } from "@/lib/i18n"
import type { NavMatrixApiResponse, MatrixDiffItem } from "./_lib/types"

export default function NganhNavMatrixPage() {
  const { t, dict } = useI18n()
  const [data, setData] = useState<NavMatrixApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentOverrides, setCurrentOverrides] = useState<Record<string, string[]>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("ALL")
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/v1/platform/nav-matrix")
      if (!res.ok) throw new Error("Không thể tải dữ liệu ma trận ngành")
      const json = await res.json()
      const matrixData = json.data as NavMatrixApiResponse
      setData(matrixData)
      setCurrentOverrides(matrixData.activeOverrides ?? {})
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Lọc danh sách items theo tìm kiếm và nhóm
  const filteredNavItems = useMemo(() => {
    if (!data) return []
    return data.navItems.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.navKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.href.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesGroup =
        selectedGroup === "ALL" || item.group === selectedGroup

      return matchesSearch && matchesGroup
    })
  }, [data, searchQuery, selectedGroup])

  // Tính danh sách khác biệt (diff) giữa dữ liệu đã lưu và trạng thái đang chỉnh sửa
  const diffs = useMemo<MatrixDiffItem[]>(() => {
    if (!data) return []
    const results: MatrixDiffItem[] = []

    for (const industry of data.industries) {
      const savedHidden = new Set(data.activeOverrides[industry.key] ?? data.defaultMatrix[industry.key] ?? [])
      const currentHidden = new Set(currentOverrides[industry.key] ?? [])

      for (const item of data.navItems) {
        const wasHidden = savedHidden.has(item.navKey)
        const isHiddenNow = currentHidden.has(item.navKey)

        if (!wasHidden && isHiddenNow) {
          results.push({
            industryKey: industry.key,
            industryName: industry.name,
            navKey: item.navKey,
            navItemLabel: item.label,
            action: "HIDE",
          })
        } else if (wasHidden && !isHiddenNow) {
          results.push({
            industryKey: industry.key,
            industryName: industry.name,
            navKey: item.navKey,
            navItemLabel: item.label,
            action: "SHOW",
          })
        }
      }
    }

    return results
  }, [data, currentOverrides])

  const handleToggleCell = useCallback((industryKey: string, navKey: string) => {
    setCurrentOverrides((prev) => {
      const currentHidden = prev[industryKey] ?? []
      const isHidden = currentHidden.includes(navKey)
      const nextHidden = isHidden
        ? currentHidden.filter((k) => k !== navKey)
        : [...currentHidden, navKey]

      return { ...prev, [industryKey]: nextHidden }
    })
  }, [])

  const handleSetColumnAll = useCallback((industryKey: string, visible: boolean) => {
    if (!data) return
    setCurrentOverrides((prev) => ({
      ...prev,
      [industryKey]: visible ? [] : data.navItems.map((item) => item.navKey),
    }))
  }, [data])

  const handleResetColumnToDefault = useCallback((industryKey: string) => {
    if (!data) return
    setCurrentOverrides((prev) => ({
      ...prev,
      [industryKey]: [...(data.defaultMatrix[industryKey] ?? [])],
    }))
  }, [data])

  const handleSetRowAll = useCallback((navKey: string, visible: boolean) => {
    if (!data) return
    setCurrentOverrides((prev) => {
      const next = { ...prev }
      for (const ind of data.industries) {
        const list = next[ind.key] ?? []
        next[ind.key] = visible
          ? list.filter((k) => k !== navKey)
          : list.includes(navKey)
          ? list
          : [...list, navKey]
      }
      return next
    })
  }, [data])

  const handleResetAll = useCallback(() => {
    if (!data) return
    setCurrentOverrides(data.activeOverrides ?? {})
  }, [data])

  const handleSaveMatrix = useCallback(async () => {
    try {
      setIsSaving(true)
      const res = await fetch("/api/v1/platform/nav-matrix", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides: currentOverrides }),
      })

      if (!res.ok) throw new Error("Không thể lưu cấu hình ma trận")

      await fetchData()
      setIsDiffModalOpen(false)
      setToastMessage("Đã lưu thành công cấu hình ma trận ngành!")
      setTimeout(() => setToastMessage(null), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu")
    } finally {
      setIsSaving(false)
    }
  }, [currentOverrides, fetchData])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-body-sm text-text-muted">Đang tải cấu hình ma trận ngành...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/10 p-6 text-danger">
        <p className="font-semibold">Lỗi tải dữ liệu</p>
        <p className="text-body-sm">{error ?? "Không có dữ liệu"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text">Ma trận điều hướng ngành</h1>
            <Badge tone="accent">Platform Admin Only</Badge>
          </div>
          <p className="text-body-sm text-text-muted">
            Thiết lập danh sách menu/tab hiển thị trên sidebar cho từng ngành. Các tổ chức trong ngành sẽ tự động nhận cấu hình này và không thể can thiệp.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <span>Bảo mật mức nền tảng — Thay đổi có hiệu lực ngay</span>
        </div>
      </div>

      {toastMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success-bg p-3 text-body-sm text-primary">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <MatrixToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
        groups={data.groups}
        hasChanges={diffs.length > 0}
        changeCount={diffs.length}
        isSaving={isSaving}
        onSaveClick={() => setIsDiffModalOpen(true)}
        onResetClick={handleResetAll}
      />

      <MatrixGrid
        industries={data.industries}
        navItems={filteredNavItems}
        groups={data.groups}
        currentOverrides={currentOverrides}
        defaultMatrix={data.defaultMatrix}
        onToggleCell={handleToggleCell}
        onSetColumnAll={handleSetColumnAll}
        onResetColumnToDefault={handleResetColumnToDefault}
        onSetRowAll={handleSetRowAll}
      />

      <MatrixDiffModal
        isOpen={isDiffModalOpen}
        diffs={diffs}
        isSaving={isSaving}
        onConfirm={handleSaveMatrix}
        onCancel={() => setIsDiffModalOpen(false)}
      />
    </div>
  )
}

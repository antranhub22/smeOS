"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSession } from "@/lib/session"
import { type TaskFailureKind, type TaskUiState } from "@/lib/ui-system/task-state"
import {
  MAX_POLLS,
  POLL_INTERVAL_MS,
  jobStorageKey,
  newIdempotencyKey,
  parseCreatedJob,
  parsePolledJob,
} from "./generation-job-logic"

export interface GenerationJobConfig {
  /** Tên ngắn của công cụ — dùng cho khoá nhớ và idempotency key. */
  tool: string
  /** Route tạo job, ví dụ `/api/v1/product-photo`. Poll ở `${createUrl}/:id`. */
  createUrl: string
}

export interface GenerationJobInput {
  file: File
  /** Các trường gửi kèm `asset_id` khi tạo job. */
  body: Record<string, unknown>
}

function readStored(key: string | null): string | null {
  if (!key) return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStored(key: string | null, value: string | null) {
  if (!key) return
  try {
    if (value) localStorage.setItem(key, value)
    else localStorage.removeItem(key)
  } catch {
    // Trình duyệt chặn lưu trữ: chỉ mất khả năng khôi phục sau khi tải lại trang.
  }
}

/** Luồng tải ảnh → tạo job → hỏi trạng thái thật, dùng chung cho các công cụ ảnh (UX-P01, UX-P04). */
export function useGenerationJob<R>({ tool, createUrl }: GenerationJobConfig) {
  const { organization } = useSession()
  const storageKey = jobStorageKey(tool, organization?.id)

  const [state, setState] = useState<TaskUiState>("idle")
  const [result, setResult] = useState<R | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [failureKind, setFailureKind] = useState<TaskFailureKind>("retryable")
  const [elapsed, setElapsed] = useState(0)
  const [balance, setBalance] = useState<number | null>(null)

  const busyRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const aliveRef = useRef(true)
  const pollRef = useRef<(jobId: string, attempt?: number) => void>(() => {})

  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (state !== "queued" && state !== "running") return
    const t = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [state])

  const fail = useCallback((message: string, kind: TaskFailureKind = "retryable") => {
    busyRef.current = false
    setError(message)
    setFailureKind(kind)
    setState("failed")
  }, [])

  const poll = useCallback(
    (jobId: string, attempt = 0) => {
      if (!aliveRef.current) return
      if (attempt >= MAX_POLLS) {
        // Không suy ra thất bại hay thành công: báo thật là chưa có kết quả.
        fail("Ảnh đang được xử lý lâu hơn bình thường. Mở lại trang này sau ít phút để xem kết quả.", "needs_action")
        return
      }
      timerRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`${createUrl}/${jobId}`, { cache: "no-store" })
          if (res.status === 404) {
            writeStored(storageKey, null)
            fail("Không tìm thấy tác vụ này nữa. Hãy tải ảnh và tạo lại.", "needs_action")
            return
          }
          if (res.ok) {
            const polled = parsePolledJob<R>(await res.json())
            if (polled.state === "succeeded" && polled.result) {
              busyRef.current = false
              writeStored(storageKey, null)
              setResult(polled.result)
              setState("succeeded")
              return
            }
            if (polled.state === "failed" || polled.state === "canceled") {
              writeStored(storageKey, null)
              fail(polled.error ?? "Chưa tạo được ảnh. Credit của lượt này được hoàn theo chính sách.")
              return
            }
            if (polled.state === "running") setState("running")
          }
        } catch {
          // Mạng chập chờn: hỏi lại ở lượt sau, vẫn trong giới hạn MAX_POLLS.
        }
        pollRef.current(jobId, attempt + 1)
      }, attempt === 0 ? 0 : POLL_INTERVAL_MS)
    },
    [createUrl, fail, storageKey],
  )

  useEffect(() => {
    pollRef.current = poll
  }, [poll])

  // Mở lại trang khi tác vụ đang chạy dở → tiếp tục theo dõi (03c UX-016).
  useEffect(() => {
    const stored = readStored(storageKey)
    if (!stored || busyRef.current) return
    busyRef.current = true
    queueMicrotask(() => {
      setState("queued")
      poll(stored)
    })
  }, [storageKey, poll])

  useEffect(() => {
    let alive = true
    fetch("/api/v1/usage/summary", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((b: { credit_balance?: unknown } | null) => {
        if (alive && b && typeof b.credit_balance === "number") setBalance(b.credit_balance)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const start = useCallback(
    async (input: GenerationJobInput) => {
      if (busyRef.current) return
      busyRef.current = true
      setError(null)
      setResult(null)
      setElapsed(0)
      setState("submitting")
      try {
        const { uploadBrandAsset } = await import("@/components/profiles/upload-brand-asset")
        const { assetId } = await uploadBrandAsset(input.file)
        const res = await fetch(createUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": newIdempotencyKey(tool) },
          body: JSON.stringify({ ...input.body, asset_id: assetId }),
        })
        const body = await res.json().catch(() => null)
        if (!res.ok) {
          const message = (body as { message?: string } | null)?.message
          fail(message ?? "Chưa gửi được yêu cầu tạo ảnh. Ảnh của bạn vẫn được giữ, hãy thử lại.")
          return
        }
        const created = parseCreatedJob(body)
        if (!created) {
          fail("Hệ thống chưa xác nhận đã nhận yêu cầu. Hãy thử lại sau ít phút.", "needs_action")
          return
        }
        if (created.balanceAfter !== null) setBalance(created.balanceAfter)
        writeStored(storageKey, created.jobId)
        setState("queued")
        poll(created.jobId)
      } catch (err) {
        fail(err instanceof Error ? err.message : "Có lỗi khi tải ảnh lên. Ảnh của bạn vẫn được giữ, hãy thử lại.")
      }
    },
    [createUrl, fail, poll, storageKey, tool],
  )

  const reset = useCallback(() => {
    if (busyRef.current) return
    setState("idle")
    setResult(null)
    setError(null)
  }, [])

  return { state, result, error, failureKind, elapsed, balance, start, reset }
}

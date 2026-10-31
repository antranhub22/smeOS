"use client";

import React, { useState, useEffect, useRef } from "react";
import { Film, AlertCircle, RotateCcw } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskStatus } from "@/components/ui/task-status";
import { reportedProgress, type TaskUiState } from "@/lib/ui-system/task-state";

interface VideoRenderingProgressProps {
  videoJobId: string;
  generationJobId?: string | null;
  onCompleted: () => void;
  onFailed: (error: string) => void;
  onRetry?: () => void;
}

export function VideoRenderingProgress({
  videoJobId,
  generationJobId,
  onCompleted,
  onFailed,
  onRetry,
}: VideoRenderingProgressProps) {
  // Chỉ giữ tiến độ khi backend báo số thật — không tự tăng phần trăm (03c UX-016).
  const [progress, setProgress] = useState<number | null>(null);
  const [state, setState] = useState<TaskUiState>("queued");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFailed, setIsFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const completedRef = useRef(false);

  // Bộ đếm thời gian thực
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Polling trạng thái tiến độ từ server
  useEffect(() => {
    let isSubscribed = true;

    const checkStatus = async () => {
      if (completedRef.current) return;

      try {
        // 1. Kiểm tra video job
        const res = await fetch(`/api/v1/video/jobs/${videoJobId}`);
        if (!res.ok) return;
        const job = await res.json();

        if (!isSubscribed) return;

        if (job.stage === "RENDER_COMPLETED" || job.stage === "APPROVED") {
          completedRef.current = true;
          setState("succeeded");
          setTimeout(() => {
            if (isSubscribed) onCompleted();
          }, 1200);
          return;
        }

        if (job.stage === "FAILED") {
          setIsFailed(true);
          setErrorMessage(job.error_message || "Tác vụ dựng video thất bại.");
          onFailed(job.error_message || "Tác vụ dựng video thất bại.");
          return;
        }

        if (job.stage === "RENDERING") setState("running");

        // Job sinh video chi tiết (nếu có): chỉ đọc trạng thái và tiến độ thật.
        if (generationJobId) {
          const genRes = await fetch(`/api/v1/jobs/${generationJobId}`);
          if (genRes.ok) {
            const genData = await genRes.json();
            const genJob = genData.job;
            if (genJob?.status === "PROCESSING") setState("running");
            setProgress(reportedProgress(genJob?.progress));
          }
        }
      } catch (err) {
        console.error("Lỗi kiểm tra tiến độ video:", err);
      }
    };

    const interval = setInterval(checkStatus, 1800);
    void checkStatus();

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [videoJobId, generationJobId, onCompleted, onFailed]);

  if (isFailed) {
    return (
      <Card className="p-6 bg-surface border-destructive/30 border-2 rounded-2xl flex flex-col items-center gap-4 text-center max-w-lg mx-auto shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle size={28} />
        </div>
        <div>
          <h3 className="text-base font-bold text-text">Dựng video thất bại</h3>
          <p className="mt-1 text-xs text-text-muted leading-relaxed max-w-sm">
            {errorMessage || "Hệ thống gặp sự cố trong quá trình mã hóa video. Hạn mức credit chưa bị trừ."}
          </p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="secondary" className="gap-2 mt-2">
            <RotateCcw size={15} /> Thử lại tác vụ
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-surface border border-border rounded-2xl flex flex-col gap-4 max-w-2xl w-full mx-auto shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Film size={20} aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-text">Đang dựng video marketing</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Video được dựng ngầm — bạn có thể rời trang và quay lại sau, kết quả vẫn được giữ.
          </p>
        </div>
      </div>
      <TaskStatus state={state} title="Dựng video" progress={progress} elapsedSeconds={elapsedSeconds} />
    </Card>
  );
}

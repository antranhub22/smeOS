"use client";

import React from "react";

export interface RunItem {
  id: string;
  run_type: string;
  status: string;
  created_at: string;
  records_collected: number;
  opportunities_created: number;
  error_summary?: string | null;
}

interface ResearchRunsTableProps {
  runs: RunItem[];
}

export function ResearchRunsTable({ runs }: ResearchRunsTableProps) {
  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-bg border-b border-border font-semibold text-caption text-text uppercase tracking-wider">
        Nhật ký quét
      </div>
      <table className="min-w-full divide-y divide-border text-caption text-left">
        <thead className="bg-bg text-text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Mã lượt chạy</th>
            <th className="px-4 py-3 font-medium">Loại</th>
            <th className="px-4 py-3 font-medium">Trạng thái</th>
            <th className="px-4 py-3 font-medium">Tín hiệu</th>
            <th className="px-4 py-3 font-medium">Cơ hội sinh ra</th>
            <th className="px-4 py-3 font-medium">Thời gian</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-white">
          {runs.map((r) => (
            <tr key={r.id} className="hover:bg-bg/50">
              <td className="px-4 py-3 font-mono text-caption text-text-muted">{r.id.slice(0, 8)}...</td>
              <td className="px-4 py-3 font-medium text-text">{r.run_type}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-caption font-bold ${
                    r.status === "COMPLETED"
                      ? "bg-success-bg text-success-text"
                      : r.status === "RUNNING"
                      ? "bg-info-bg text-info-text animate-pulse motion-reduce:animate-none"
                      : r.status === "FAILED"
                      ? "bg-danger-bg text-danger-text"
                      : "bg-warning-bg text-warning-text"
                  }`}
                >
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-3 text-text-muted">{r.records_collected}</td>
              <td className="px-4 py-3 text-text-muted">{r.opportunities_created}</td>
              <td className="px-4 py-3 text-text-muted">
                {new Date(r.created_at).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

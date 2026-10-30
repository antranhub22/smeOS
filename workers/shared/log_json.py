"""Log JSON cho worker — cùng trường với `src/core/observability/log.ts` (ROADMAP E1.3).

Mỗi bản ghi `logging` thành một dòng JSON ra stdout: `ts`, `level`, `event`
(tên logger), `message`, và ngữ cảnh job đang chạy (`requestId`, `jobId`,
`organizationId`, `feature`) do `gan_ngu_canh_job()` đặt lúc nhận job. Khoá
nhạy cảm bị lọc như phía web. Không thêm phụ thuộc (D19).
"""

from __future__ import annotations

import json
import logging
import os
import re
import sys
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any, Mapping

_KHOA_CAM = re.compile(r"phone|so_dien_thoai|address|dia_chi|password|secret|cookie|authorization|token|api_?key", re.I)
_ngu_canh: ContextVar[dict[str, Any]] = ContextVar("smeos_job_log_context", default={})

# Thuộc tính có sẵn của LogRecord — không chép vào dòng JSON.
_THUOC_TINH_GOC = set(vars(logging.makeLogRecord({}))) | {"message", "asctime"}


def gan_ngu_canh_job(job: Mapping[str, Any]) -> None:
    """Đặt ngữ cảnh cho mọi dòng log sau đó trong job này."""
    _ngu_canh.set(
        {
            k: v
            for k, v in {
                "requestId": job.get("request_id"),
                "jobId": str(job["id"]) if job.get("id") is not None else None,
                "organizationId": job.get("organization_id"),
                "feature": job.get("feature"),
            }.items()
            if v is not None
        }
    )


def xoa_ngu_canh_job() -> None:
    _ngu_canh.set({})


def _loc(ctx: Mapping[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in ctx.items() if v is not None and not _KHOA_CAM.search(k)}


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        dong: dict[str, Any] = {
            "ts": datetime.fromtimestamp(record.created, timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
            "level": record.levelname.lower().replace("warning", "warn").replace("critical", "error"),
            "event": record.name,
            "message": record.getMessage(),
            **_ngu_canh.get(),
        }
        dong.update(_loc({k: v for k, v in vars(record).items() if k not in _THUOC_TINH_GOC}))
        if record.exc_info:
            dong["error"] = self.formatException(record.exc_info)
        return json.dumps(dong, ensure_ascii=False, default=str)


def cau_hinh_log() -> None:
    """Gọi một lần ở điểm khởi động worker."""
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers[:] = [handler]
    root.setLevel(os.environ.get("LOG_LEVEL", "INFO"))

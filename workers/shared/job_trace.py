"""Nối log worker với log web bằng mã yêu cầu (ROADMAP E1.1).

Web ghi `generation_jobs.request_id` từ header `x-request-id`; khi nhận job,
worker in một dòng JSON cùng tên trường với `src/core/observability/log.ts`
(`requestId`, `jobId`, `organizationId`, `feature`) để lọc ngược từ một lỗi web
tới dòng log worker. Không ghi payload hay dữ liệu khách.
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from typing import Any, Mapping


def dong_job_claimed(job: Mapping[str, Any]) -> str:
    dong = {
        "ts": datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
        "level": "info",
        "event": "job.claimed",
        "requestId": job.get("request_id"),
        "jobId": str(job.get("id")),
        "organizationId": job.get("organization_id"),
        "feature": job.get("feature"),
    }
    return json.dumps({k: v for k, v in dong.items() if v is not None}, ensure_ascii=False)


def log_job_claimed(job: Mapping[str, Any]) -> None:
    print(dong_job_claimed(job), file=sys.stdout, flush=True)

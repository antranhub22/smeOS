"""Test cho `workers/shared/job_trace.py` — dòng log nhận job mang `requestId`."""

from __future__ import annotations

import json

from shared.job_trace import dong_job_claimed


def test_dong_log_cung_truong_voi_web():
    dong = json.loads(
        dong_job_claimed(
            {
                "id": "job-1",
                "request_id": "req-12345678",
                "organization_id": "org-1",
                "feature": "vision.analyze",
                "payload": {"so_dien_thoai": "0900000000"},
            }
        )
    )
    assert dong["event"] == "job.claimed"
    assert dong["requestId"] == "req-12345678"
    assert dong["jobId"] == "job-1"
    assert dong["organizationId"] == "org-1"
    assert "payload" not in dong


def test_job_khong_co_request_id_thi_bo_truong():
    dong = json.loads(dong_job_claimed({"id": "job-2", "request_id": None, "feature": "media.optimize"}))
    assert "requestId" not in dong

"""SDAGF R-14: video dựng xong phải lên kho dùng chung, không chỉ nằm trên đĩa worker."""

from pathlib import Path

from media_ai.video import video_worker


def test_kho_dung_chung_day_tep_len_dung_khoa_roi_xoa_ban_tam(tmp_path: Path, monkeypatch) -> None:
    out_file = tmp_path / "job.mp4"
    out_file.write_bytes(b"mp4-bytes")
    ghi = []
    monkeypatch.setattr(video_worker, "dang_dung_kho_dung_chung", lambda: True)
    monkeypatch.setattr(video_worker, "ghi_bytes", lambda key, body, mime, goc: ghi.append((key, body, mime)))

    video_worker.publish_render(out_file, "videos/org-a/job.mp4")

    assert ghi == [("videos/org-a/job.mp4", b"mp4-bytes", "video/mp4")]
    assert not out_file.exists()


def test_dia_cuc_bo_giu_nguyen_tep(tmp_path: Path, monkeypatch) -> None:
    out_file = tmp_path / "job.mp4"
    out_file.write_bytes(b"x")
    monkeypatch.setattr(video_worker, "dang_dung_kho_dung_chung", lambda: False)
    monkeypatch.setattr(video_worker, "ghi_bytes", lambda *a: (_ for _ in ()).throw(AssertionError("không được ghi")))

    video_worker.publish_render(out_file, "videos/org-a/job.mp4")

    assert out_file.exists()

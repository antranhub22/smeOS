# 14 — Checklist bàn giao cho khách (SDAGF P5)

Mỗi dòng cần **người thực hiện, ngày, bằng chứng** (ảnh chụp, tệp log đã che bí mật, biên bản). Chưa đủ thì chưa bàn giao.

## A. Bảo mật & bí mật
- [ ] CI xanh trên commit bàn giao: gitleaks, CodeQL, `npm audit --omit=dev --audit-level=high`.
- [ ] Bí mật Render đặt đủ: `SESSION_SECRET`, `SSO_SESSION_SECRET`, `INTEGRATION_TOKEN_SECRET`, `STORAGE_SIGNING_SECRET`, `CRON_SECRET`. Không bí mật nào trong repo, tài liệu bàn giao hay ảnh chụp.
- [ ] Khoá R2 của web chỉ có quyền trên bucket chính; khoá sao lưu là khoá riêng, chỉ ghi (D-06).
- [ ] Danh sách người vận hành nền tảng và mã N của từng người (`platform_operators`) — rà, thu hồi tài khoản thừa; N14 chỉ cấp cho người được duyệt.

## B. Dữ liệu & kho tệp
- [ ] `npm run storage:reconcile` trên production: lưu báo cáo; số "bản ghi thiếu tệp" giải thích được.
- [ ] Sao lưu R2 sang bucket thứ hai đang chạy; bucket lock 30 ngày (D-06).
- [ ] Sau khi có sao lưu: bật `STORAGE_DELETE_PAYLOADS=enabled`, theo dõi `storage_outbox` 7 ngày (`attempts`, `last_error`).
- [ ] Không tổ chức nào của khách đang legal hold ngoài ý muốn (`organizations.legal_hold_until`).

## C. Sao lưu & khôi phục
- [ ] Workspace Render giữ PITR 7 ngày; bản xuất DB hằng ngày lưu ngoài Render 30 ngày (D-01/02).
- [ ] **Biên bản diễn tập** khôi phục DB (PITR) và khôi phục một tệp từ bản sao R2, có ngày, thời gian thực đo (RTO).

## D. Pháp lý & hợp đồng
- [ ] DPA ghi mốc retention D-03, thời gian dữ liệu rời bản sao lưu (≤ 35 ngày), quy trình legal hold — **đã qua luật sư**.
- [ ] Mẫu biên bản xác nhận xoá dữ liệu khi khách rời đi.

## E. Vận hành
- [ ] Cron `smeos-cron-dispatch-sweep` chạy, phản hồi có `storageLifecycle`.
- [ ] Runbook `docs/kien-truc/VAN_HANH_SU_CO_VA_SAO_LUU.md` bàn giao cho người vận hành bên khách.
- [ ] `13-reassessment.md` không còn FAIL Critical/High; 019/027/029 có bằng chứng.

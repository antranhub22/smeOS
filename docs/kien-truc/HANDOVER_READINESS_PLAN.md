# Kế hoạch sẵn sàng bàn giao — nhóm việc làm ngay

> Phạm vi: các việc thực hiện trước hoặc cùng lúc bàn giao repo smeOS cho khách hàng, sau khi PR #107 (khắc phục nhánh Enterprise UI/UX) đã hợp nhất vào `main`.
> Chủ sở hữu: Product Owner. Nhánh thực thi: `claude/zen-carson-os8a8r`, kết thúc bằng một PR vào `main`.
> Thời lượng: 5 ngày làm việc (mục 8). Cách dùng: mỗi commit tick đúng dòng của nó trong cùng commit và điền mã commit vào bảng mục 9.

## 1. Mục tiêu và tiêu chí hoàn tất

1. Gói bàn giao có giấy phép, không chứa tài liệu khách hàng khác, cấu hình agent nội bộ, đường dẫn máy cá nhân hay bí mật.
2. Hiệu năng tải trang có số đo thật, lưu tệp kết quả trong repo.
3. Trợ năng 12 hành trình có kết quả kiểm: phần tự động chạy trong CI, phần trình đọc màn hình có biên bản người kiểm và ngày.
4. Các màn hình chính có ảnh mốc giao diện trong CI.
5. Mọi cổng CI xanh trên PR; `TRANG_THAI.md` và báo cáo `13_RE_AUDIT_ENTERPRISE_REPORT.md` cập nhật theo số đo mới.

Ngoài phạm vi (lộ trình sau bàn giao): trả nợ UX lint 5.491 điểm, tách 87 tệp > 350 dòng, nâng giao diện Thẻ chào.

## 2. Quyết định cần PO trước khi bắt đầu

| # | Câu hỏi | Ảnh hưởng | Mặc định nếu không có trả lời |
|---|---|---|---|
| Q1 | Tên pháp nhân sở hữu và loại giấy phép | H1-1 | Giấy phép độc quyền (proprietary, mọi quyền được bảo lưu) — chờ tên pháp nhân, không tự điền |
| Q2 | Hạn bàn giao và hợp đồng có yêu cầu WCAG 2.2 AA hay enterprise grade không | Thứ tự ưu tiên H3/H4 | Làm đủ H1–H4 theo lịch mục 8 |
| Q3 | Người kiểm trình đọc màn hình: một người có máy Mac (VoiceOver, macOS + iOS) và một máy Windows (NVDA) | H3-3 | Không thực hiện được H3-3; biên bản ghi rõ phần chưa kiểm |
| Q4 | 4 tệp tên giống tài liệu agent mà `npm run handover:check` cảnh báo: giữ trong gói hay loại | H1-3 | Loại khỏi gói bằng `export-ignore` |
| Q5 | Các tệp Excel tên `…_alg.xlsx` trong `docs/Nhập liệu/` có phải dữ liệu của khách hàng ALG không | H1-5 | Loại khỏi gói bằng `export-ignore` |

## 3. H1 — Pháp lý và gói bàn giao (0,5 ngày)

- [ ] **H1-1** Tệp `LICENSE` ở gốc repo theo Q1; `package.json` thêm `"license": "UNLICENSED"` (gói `private`, không phát hành npm).
- [ ] **H1-2** Gói bàn giao dựng bằng `git archive` từ tag `handover-<yyyy-mm-dd>` trên `main`. Gói không kèm lịch sử git, nên tài liệu ALG/Avi Florist (đã gỡ khỏi cây thư mục, còn trong lịch sử) không có trong gói. Kiểm: `npm run handover:check` xanh; không có `.docx`/`.pptx`/`.xlsx` của khách, không có `.env`, quét bí mật bằng job `security` (gitleaks) của CI; ghi SHA-256 của gói.
- [ ] **H1-3** Xử lý 4 tệp cảnh báo của `handover:check` theo Q4 (`.gitattributes` `export-ignore`).
- [ ] **H1-4** 191 liên kết `file:///Users/…` trong `docs/`: đổi thành liên kết tương đối khi tệp đích có trong repo, bỏ phần đường dẫn khi không có. Kiểm: `grep -rn "file:///Users" docs` rỗng; `npm run check:docs` xanh.
- [ ] **H1-5** Tệp Excel ALG trong `docs/Nhập liệu/` theo Q5.

## 4. H2 — Hiệu năng tải trang (1 ngày)

- [ ] **H2-1** Script `scripts/measure-web-vitals.ts` đo bằng Playwright và `PerformanceObserver` của Chromium — không thêm thư viện. Đo LCP, CLS, TBT; INP qua Event Timing với một tương tác chuẩn mỗi tuyến. Hai cấu hình: di động (390×844, CPU chậm 4×, mạng 4G mô phỏng qua CDP) và máy tính (1280×800). Mỗi tuyến 3 lần, lấy trung vị.
- [ ] **H2-2** Đo 6 tuyến của `12_PERFORMANCE_REPORT.md` (`/`, `/san-pham`, `/dieu-phoi`, `/so-lieu`, `/b/[sendCode]`, `/van-hanh`) trên bản build production, database đã seed. Lưu JSON vào `docs/audit/ui-architecture-audit/perf/<ngày>/`; cập nhật báo cáo với số đo và đường dẫn tệp. Số liệu ghi là số đo phòng thí nghiệm (lab), không phải số đo người dùng thật.
- [ ] **H2-3** Tuyến vượt ngưỡng (LCP > 2,5 s, CLS > 0,1, INP > 200 ms): sửa trong đợt này nếu nguyên nhân rõ và sửa ≤ 0,5 ngày; còn lại ghi vào lộ trình kèm số đo.

## 5. H3 — Trợ năng 12 hành trình (2–4 ngày)

- [ ] **H3-1** `tests/e2e/ux/a11y-journeys.spec.ts`: 12 hành trình của `docs/design-system/accessibility-audit-12-journeys.md`, mỗi hành trình chạy:
  - quét axe theo WCAG 2.2 AA, chặn mọi vi phạm `critical`/`serious`;
  - chỉ bàn phím: đi hết phần tử tương tác bằng `Tab`, mỗi phần tử có vòng tiêu điểm nhìn thấy và không bị header/thanh đáy che (2.4.7, 2.4.11);
  - phóng 200%: không cuộn ngang (1.4.4, 1.4.10);
  - `prefers-reduced-motion: reduce`: không còn hiệu ứng chạy (2.3.3);
  - tương phản trên 3 preset `moc-lan`, `modern-slate`, `pure-swiss`, chế độ sáng và tối.
  Tuyến cần dữ liệu (`/b/[sendCode]`, `/c/[slug]`, `/g/[id]`, `/subcontract/[orderCode]`) lấy mã từ dữ liệu seed; thiếu dữ liệu thì bổ sung vào seed E2E, không dùng dữ liệu giả trong mã sản phẩm.
- [ ] **H3-2** Sửa lỗi `critical`/`serious` mà H3-1 tìm ra, trong khung 1 ngày; lỗi còn lại ghi vào lộ trình kèm mức độ và tuyến.
- [ ] **H3-3** Kiểm trình đọc màn hình theo Q3: phiếu kiểm từng hành trình (nhãn nút, thứ tự đọc, thông báo trạng thái, lỗi biểu mẫu) do người kiểm điền trên VoiceOver và NVDA.
- [ ] **H3-4** Điền bảng kết quả của `accessibility-audit-12-journeys.md`: từng hành trình, từng phép kiểm, người kiểm, ngày, tệp kết quả (báo cáo Playwright, phiếu kiểm). Phép chưa kiểm ghi "Chưa kiểm".

## 6. H4 — Ảnh mốc giao diện (2–3 ngày)

- [ ] **H4-1** Mở rộng `tests/e2e/ux/visual.spec.ts` cho màn chính của 12 hành trình, khổ 390 và 1280. Dữ liệu cố định từ seed, thời gian cố định, che vùng động (thời gian tương đối, ảnh tải ngoài).
- [ ] **H4-2** Sinh ảnh mốc Linux (khớp runner CI — đã xác nhận ở PR #107); CI xác nhận trên PR.
- [ ] **H4-3** Ảnh mốc `-darwin` (gồm `/vai-tro`): người dùng máy Mac chạy `npx playwright test tests/e2e/ux/visual.spec.ts --update-snapshots` và commit.

## 7. H5 — Đóng đợt

- [ ] **H5-1** Chạy đủ cổng của `CLAUDE.md`, gồm `test:e2e:ux`; mở PR vào `main`; CI xanh.
- [ ] **H5-2** Cập nhật `13_RE_AUDIT_ENTERPRISE_REPORT.md` (miền F, G; chỉ số K7–K9), `12_PERFORMANCE_REPORT.md`, `TRANG_THAI.md` §6.
- [ ] **H5-3** Dựng gói bàn giao cuối theo H1-2 từ `main` sau khi PR hợp nhất; bàn giao kèm SHA-256 và danh sách phần còn trong lộ trình.

## 8. Lịch thực hiện

| Ngày | Việc |
|---|---|
| 1 | H1 (sau khi có Q1, Q4, Q5); H2-1, H2-2 |
| 2 | H2-3; H3-1 |
| 3 | H3-1 (tiếp), H4-1 |
| 4 | H3-2, H4-2; gửi phiếu kiểm H3-3 cho người kiểm |
| 5 | H3-3 (người kiểm), H3-4, H5 |

## 9. Bảng theo dõi

| Việc | Trạng thái | Commit | Cổng đã chạy | Ghi chú |
|---|---|---|---|---|
| H1-1 | Chưa làm | | | Chờ Q1 |
| H1-2 | Chưa làm | | | |
| H1-3 | Chưa làm | | | Chờ Q4 |
| H1-4 | Chưa làm | | | |
| H1-5 | Chưa làm | | | Chờ Q5 |
| H2-1 | Chưa làm | | | |
| H2-2 | Chưa làm | | | |
| H2-3 | Chưa làm | | | |
| H3-1 | Chưa làm | | | |
| H3-2 | Chưa làm | | | |
| H3-3 | Chưa làm | | | Chờ Q3 |
| H3-4 | Chưa làm | | | |
| H4-1 | Chưa làm | | | |
| H4-2 | Chưa làm | | | |
| H4-3 | Chưa làm | | | Cần máy Mac |
| H5-1 | Chưa làm | | | |
| H5-2 | Chưa làm | | | |
| H5-3 | Chưa làm | | | |

## 10. Rủi ro và kiểm soát

| # | Rủi ro | Mức | Kiểm soát |
|---|---|---|---|
| R1 | Không có người kiểm VoiceOver/NVDA | Cao | Biên bản ghi rõ phần chưa kiểm; phần tự động (H3-1) vẫn đứng làm bằng chứng |
| R2 | Số đo hiệu năng trong môi trường sandbox khác thiết bị thật | Trung bình | Ghi rõ là số đo lab, nêu cấu hình mô phỏng; lặp lại trên máy chủ staging khi có |
| R3 | Seed thiếu dữ liệu cho tuyến công khai cần mã/token | Trung bình | Bổ sung seed E2E; không thêm dữ liệu giả vào mã sản phẩm |
| R4 | Ảnh mốc mới chập chờn do dữ liệu/thời gian | Trung bình | Dữ liệu và thời gian cố định, che vùng động, ngưỡng 5% như hiện hành |
| R5 | H3-1 phát hiện nhiều lỗi hơn khung sửa 1 ngày | Trung bình | Sửa `critical` trước; phần còn lại ghi vào lộ trình kèm tuyến và mức độ, không che bằng allowlist |
| R6 | 191 liên kết `file:///` trỏ tới tệp không còn | Thấp | Bỏ phần đường dẫn, giữ tên tệp làm văn bản |

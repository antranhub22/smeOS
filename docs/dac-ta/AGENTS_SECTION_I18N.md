# Mục dán vào AGENTS.md — i18n · l10n · UX Writing

> Bản nguồn để dán vào `AGENTS.md` (file này không được commit — `.gitignore`).
> Phần **A** dùng chung mọi dự án; phần **B** riêng SMEOS. SSOT chi tiết: `docs/dac-ta/SMEOS_I18N_STANDARD.md` (`DOC-ARCH-I18N-001`).

---

## i18n · l10n · UX Writing

### A. Quy tắc chung (mọi dự án)

1. **Không hardcode chữ hiển thị trong JSX/template.** Chuỗi mới vào từ điển theo locale, key dạng `<module>.<feature>.<element>.<id>`; thêm cùng lúc cho **mọi** locale.
2. **Một nơi định dạng duy nhất.** Tiền, số, ngày giờ đi qua module formatter của dự án; không gọi `Intl.*Format` / `toLocale*String` trực tiếp. Lưu DB ở UTC ISO, chỉ định dạng khi hiển thị, múi giờ mặc định khai báo một lần.
3. **Không bao giờ lộ key ra màn hình.** Thiếu khóa: locale hiện tại → locale gốc → nhãn thân thiện (production) / key thô (dev, test).
4. **Lõi nghiệp vụ không biết ngôn ngữ.** Tầng domain trả dữ liệu/mã, không trả chuỗi hiển thị và không import i18n; tầng UI/use-case dịch.
5. **Lỗi API trả mã ổn định** (`{ code, message }`); client dịch theo `code`, `message` chỉ là fallback.
6. **UX Writing:** ngôn ngữ tự nhiên của người dùng, không mã kỹ thuật/tên nội bộ (mã tính năng, tên engine, viết tắt) trên màn hình; nhãn hành động là động từ; trạng thái rỗng nói bước tiếp theo.
7. **Cưỡng chế bằng test, không bằng lời hứa:** test đối xứng mọi cấp khóa giữa các locale + ratchet đếm vi phạm formatter (chỉ được giảm). Tài liệu chuẩn phải có bảng "đã có / lộ trình"; agent chỉ coi mục "đã có" là thực tế.

### B. Áp dụng tại SMEOS

- Từ điển: `src/lib/i18n/locales/{vi,en}/*.ts` — `vi` là gốc. Client: `const { t, dict, ti } = useI18n()`; RSC/backend: `translate(locale, key, params)` / `getDictionary(locale)`.
- Formatter: `src/lib/i18n/formatters.ts` — `formatCurrency` (vi: `"350.000 ₫"`), `formatNumber`, `formatDate`, `formatTime`, `formatDateTime`; múi giờ `Asia/Ho_Chi_Minh`.
- Gate: `npm test` chạy `src/lib/i18n/__tests__/i18n-integrity.test.ts` (đối xứng vi/en, fallback) và `tests/unit/architecture/i18n-direct-intl-ratchet.test.ts` (baseline 173 file). Sửa bớt vi phạm → **hạ BASELINE** trong cùng commit.
- **Chưa có — không dùng:** `tp()` số nhiều; mã lỗi API `{ code, message }` (route mới nên theo, không refactor route cũ khi chưa có lệnh).
- **Nợ đang mở:** 9 file `src/modules/*/domain/` import `@/lib/i18n` — không thêm mới; xem `TECHNICAL_DEBT.md` #192.
- Đổi ký hiệu tiền, định dạng ngày hoặc giọng văn toàn hệ thống = thay đổi UX người dùng thấy → hỏi PO trước.

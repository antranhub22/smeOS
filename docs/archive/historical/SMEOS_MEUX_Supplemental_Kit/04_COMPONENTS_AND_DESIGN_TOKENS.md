# 04 — Components & Design Tokens

## 1. Mục tiêu

Bảo đảm mọi module SMEOS dùng chung một ngôn ngữ giao diện, đồng thời cho phép khác biệt hợp lý theo loại tác vụ.

## 2. Audit trước khi tạo mới

Agent **MUST** tìm kiếm trước:
- Component library hiện có.
- Design tokens/CSS variables/theme.
- Quy ước typography, spacing, color, radius, shadow, border.
- Các biến thể component đã được dùng.
- Quy tắc responsive và accessibility.
- Các trang đang có custom styles hoặc duplicate components.

Không tạo hệ thống token hoặc component thứ hai nếu đã có nguồn sự thật tương đương. Nếu có nhiều nguồn, ghi rõ nguồn chuẩn được đề xuất và kế hoạch hợp nhất.

## 3. Component cần có tiêu chuẩn

Tùy phạm vi thực tế của SMEOS, audit các nhóm sau:

- Page header: tiêu đề, breadcrumb, mô tả ngắn, hành động trang.
- Toolbar: tìm kiếm, bộ lọc, sắp xếp, hành động hàng loạt.
- Buttons: primary, secondary, tertiary/ghost, destructive, loading/disabled.
- Form controls: label, helper text, error, required, disabled, read-only.
- Selection patterns: radio, checkbox, segmented control, selectable list/card.
- Data display: table, list, summary, badge/status, empty state.
- Overlays: dialog/modal, drawer, popover, tooltip.
- Feedback: toast, inline alert, progress, success/error.
- Expand/collapse: accordion, disclosure section.
- Media selection: thumbnail, selected state, preview, upload/dropzone.
- Sticky action bar khi phù hợp với tác vụ dài.

## 4. Quy tắc sử dụng component

- **MUST:** Mỗi component có mục đích, biến thể, trạng thái và hướng dẫn sử dụng.
- **MUST:** Có định nghĩa cho loading, empty, error, disabled và success khi liên quan.
- **MUST:** Dùng native semantics hoặc ARIA đúng cách; không biến div tùy ý thành điều khiển nếu component có sẵn.
- **SHOULD:** Dùng text label cùng icon cho hành động chưa phổ biến hoặc dễ hiểu nhầm.
- **MUST NOT:** Tạo card cho mọi nhóm dữ liệu theo mặc định.
- **MUST NOT:** Dùng màu sắc hoặc badge làm cách duy nhất để biểu đạt trạng thái.
- **SHOULD:** Ưu tiên inline feedback cho lỗi trường; dùng toast cho kết quả ngắn hạn không cần thao tác ngay.
- **SHOULD:** Sticky action bar chỉ dùng khi tăng khả năng hoàn thành tác vụ và không che nội dung, bàn phím hoặc điều khiển khác.

## 5. Design tokens

Agent cần xác định token hiện có trước khi đề xuất thay đổi. Các nhóm cần có hoặc được liên kết:

- Color: background, surface, text, muted text, border, primary, semantic status.
- Typography: font family, scale, weight, line height.
- Spacing: scale có quy tắc.
- Radius, border width, shadow/elevation.
- Breakpoints/container widths.
- Focus ring, motion/transition.
- Z-index/layering.

Không áp đặt giá trị số mới nếu chưa xem hệ thống hiện hành. Mọi token mới cần:
1. Tên có ý nghĩa.
2. Giá trị và mục đích.
3. Nơi sử dụng.
4. Tương thích light/dark theme nếu có.
5. Tác động đến accessibility.
6. Cách kiểm tra hồi quy.

## 6. Component decision record

Khi bổ sung hoặc thay đổi component dùng chung, ghi:
- Vấn đề đang giải quyết.
- Component/pattern hiện có đã được xem xét.
- Lý do cần thay đổi.
- API/props hoặc contract bị ảnh hưởng.
- Trạng thái và accessibility.
- Các module chịu ảnh hưởng.
- Test cần bổ sung.

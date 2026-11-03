# UI FOUNDATION ARCHITECTURE — KIẾN TRÚC NỀN TẢNG GIAO DIỆN (SMEOS)

> Tài liệu kỹ thuật bàn giao **Phase 2: Xây dựng UI Foundation Architecture**.  
> Thiết lập nền tảng kỹ thuật cho hệ thống giao diện chuẩn và khả năng mở rộng đa phong cách (Runtime Presets).

---

## 1. MỤC TIÊU & TẦNG TRỪU TƯỢNG (LAYER ARCHITECTURE)

Hệ thống UI Foundation của SMEOS được thiết kế theo mô hình 6 lớp phân tách rõ ràng:

```
┌─────────────────────────────────────────────────────────────────┐
│                      L6. PAGE TEMPLATES                         │
│  (PageContainer, PageHeader, TabActionHeader, JourneyShell)     │
├─────────────────────────────────────────────────────────────────┤
│                   L5. SHARED COMPONENT SYSTEM                   │
│  (Button, Card, Input, Table, Dialog, Select, Badge, EmptyState)│
├─────────────────────────────────────────────────────────────────┤
│                      L4. LAYOUT ADAPTERS                        │
│  (DesktopNav, BottomNav, MobileNavDrawer, Adaptive Navigation)  │
├─────────────────────────────────────────────────────────────────┤
│                      L3. UI SYSTEM PROVIDER                     │
│  (UiSystemProvider, useUiSystem, localStorage sync, dataset)    │
├─────────────────────────────────────────────────────────────────┤
│                 L2. PRESET REGISTRY & SCHEMAS                   │
│  (Mộc Lan Artisan [SSOT], Modern Slate, Minimal Pure Swiss)     │
├─────────────────────────────────────────────────────────────────┤
│                  L1. SEMANTIC DESIGN TOKENS                     │
│  (Tailwind v4 @theme, CSS Custom Properties, Density Scales)    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. TRIỂN KHAI CÁC LỚP NỀN TẢNG

### 2.1. Lớp 1 & Lớp 2: Semantic Tokens & Preset Registry
- Định vị tại: `src/lib/ui-system/`
  - `types.ts`: Định nghĩa kiểu `UiPresetId`, `UiDensity`, `UiLayoutMode`, `PresetDefinition`.
  - `presets.ts`: Khai báo 3 preset chính thức (`moc-lan`, `modern-slate`, `pure-swiss`) kèm metadata, màu sắc, bo góc và đổ bóng.
  - `tokens.ts`: Bảng ánh xạ giữa tokens và CSS Variables, cùng bảng thông số mật độ `DENSITY_CONFIG`.
  - `ui-provider.tsx`: React 19 Client Component quản lý trạng thái UI toàn cục, đồng bộ thuộc tính `data-theme` và `data-density` vào thẻ `<html>`.
- Tương thích ngược: Tại `src/app/globals.css`, các biến shadcn cũ (`--color-background`, `--color-foreground`, `--color-input`, `--color-muted-foreground`, `--color-card`) đã được ánh xạ tự động sang Semantic Tokens (`var(--color-bg)`, `var(--color-text)`, `var(--color-border)`). Điều này giải quyết ngay lập tức các vấn đề visual của 203 file cũ mà không làm gián đoạn mã nguồn.

### 2.2. Lớp 3 & Lớp 4: Layout Adapters & Navigation
- Tích hợp `UiSystemProvider` trực tiếp vào `src/app/(app)/layout.tsx`, bao bọc toàn bộ cây component của các route nghiệp vụ.
- Giữ nguyên cơ chế phân quyền bảo mật chặt chẽ: `SessionProvider` và `I18nProvider` phối hợp nhịp nhàng với `UiSystemProvider`.

### 2.3. Lớp 5: Shared Component System
- Nâng cấp `Button` (`src/components/ui/button.tsx`): Bổ sung size `xs` (32px), `icon-sm` (32px), và variant `danger`, `subtle`.
- Nâng cấp `Card` (`src/components/ui/card.tsx`): Bổ sung cấu trúc Compound Components (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) và các biến thể `default`, `flat`, `elevated`, `interactive`.
- Nâng cấp `Input` (`src/components/ui/input.tsx`): Đồng bộ hóa 100% với Semantic Tokens, hỗ trợ `inputSize` (`default` / `sm`) và `hasError`.
- Nâng cấp `Dialog` (`src/components/ui/dialog.tsx`): Khắc phục nhãn `text-foreground` sang `text-text`, nâng cấp chiều cao di động sang `max-h-[90dvh]` để tương thích bàn phím ảo iOS Safari.
- Xây dựng mới `Table` (`src/components/ui/table.tsx`): Hộp bọc tự động chống tràn ngang `overflow-x-auto`, bảng dữ liệu chuẩn hóa gồm `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`.

### 2.4. Lớp 6: Page Templates & Hierarchy
- Xây dựng mới `PageContainer` (`src/components/ui/page-container.tsx`): Bọc khung trang với padding đáp ứng responsive: `px-4 sm:px-6 lg:px-8 py-4 sm:py-6`.
- Xây dựng mới `PageHeader` (`src/components/ui/page-header.tsx`): Chuẩn hóa tiêu đề màn hình, mô tả phụ, breadcrumb và khu vực nút bấm hành động (Primary & Secondary Actions).

---

## 3. NGUYÊN TẮC BẢO VỆ NGHIỆP VỤ (SAFETY GUARANTEES)

1. **Zero Data Impact**: Không thay đổi bất kỳ Schema Prisma, API Route, hay Use-Case nào.
2. **Zero Breaking Changes**: Toàn bộ các component nâng cấp giữ nguyên interface cũ, chỉ bổ sung props tùy chọn (optional props).
3. **Safe Fallback**: Khi không có cấu hình từ client hoặc localStorage bị lỗi, hệ thống tự động fallback 100% về preset `moc-lan` và density `comfortable`.

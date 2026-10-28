# THEME & UI PRESET RUNTIME MECHANISM (SMEOS)

> Tài liệu kỹ thuật chi tiết về cơ chế vận hành của **Runtime UI System** trong khuôn khổ **Phase 2: UI Foundation Architecture**.  
> Cơ sở kỹ thuật cho Phase 4 (Hoàn thiện Runtime UI System).

---

## 1. NGUYÊN TẮC HOẠT ĐỘNG KHÔNG CẦN BUILD / RELOAD (ZERO REBUILD / ZERO RELOAD)

Hệ thống Runtime UI System của smeOS hoạt động dựa trên cơ chế kết hợp giữa **React 19 Context API** và **CSS Custom Properties Dataset Scoping**:

```
                  ┌───────────────────────────────┐
                  │       UiSystemProvider        │
                  │   (src/lib/ui-system/...)     │
                  └──────────────┬────────────────┘
                                 │
                 Đồng bộ thuộc tính DOM tức thì (0ms)
                                 ▼
   <html data-theme="moc-lan" data-density="comfortable" data-layout-mode="sidebar">
                                 │
             ┌───────────────────┼───────────────────┐
             ▼                   ▼                   ▼
    [data-theme="moc-lan"] [data-theme="modern-slate"] [data-theme="pure-swiss"]
             │                   │                   │
    Toàn bộ CSS Variables tự động cập nhật giá trị màu sắc & bo góc
```

### Điểm nổi bật:
1. **0ms Latency**: Trình duyệt cập nhật lại render tree ngay lập tức mà không cần gọi API máy chủ hay tải lại tài nguyên.
2. **Không phân mảnh CSS**: Toàn bộ các lớp tiện ích của Tailwind v4 (`bg-primary`, `text-text`, `border-border`) đọc giá trị thông qua CSS Variables. Khi `data-theme` thay đổi, màu sắc của mọi component tự động thay đổi theo.
3. **Persisted State**: Lựa chọn của người dùng được lưu trữ cục bộ vào `localStorage` với khóa `smeos_ui_config`, và có thể mở rộng lưu vào `user_preferences` trong CSDL ở Phase 4.

---

## 2. SCHEMA CẤU HÌNH UI RUNTIME

Cấu trúc đối tượng `UiSystemConfig`:
```typescript
interface UiSystemConfig {
  /** Mã định danh Preset: 'moc-lan' | 'modern-slate' | 'pure-swiss' */
  preset: UiPresetId
  /** Mật độ hiển thị: 'compact' (dày đặc) | 'comfortable' (mặc định) | 'spacious' (rộng) */
  density: UiDensity
  /** Bố cục: 'sidebar' (mặc định) | 'top-nav' | 'compact-dock' */
  layoutMode: UiLayoutMode
  /** Chế độ sáng/tối: 'light' | 'dark' | 'system' */
  colorMode: UiColorMode
}
```

---

## 3. CÁCH SỬ DỤNG HOOK `useUiSystem()`

Tại bất kỳ Client Component nào trong ứng dụng:

```tsx
"use client"
import { useUiSystem } from "@/lib/ui-system"

export function ThemeSwitcherDemo() {
  const { config, setPreset, setDensity } = useUiSystem()

  return (
    <div className="flex gap-2">
      <button onClick={() => setPreset("moc-lan")}>Mộc Lan</button>
      <button onClick={() => setPreset("modern-slate")}>Modern Slate</button>
      <button onClick={() => setPreset("pure-swiss")}>Pure Swiss</button>
      
      <button onClick={() => setDensity("compact")}>Thu nhỏ (Compact)</button>
      <button onClick={() => setDensity("comfortable")}>Vừa vặn (Comfortable)</button>
    </div>
  )
}
```

---

## 4. QUY TRÌNH THÊM MỘT PRESET MỚI TRONG TƯƠNG LAI

Kiến trúc đảm bảo cho phép đội ngũ phát triển thêm bất kỳ phong cách nào trong tương lai mà **KHÔNG CẦN VIẾT LẠI FRONTEND**:

1. **Bước 1**: Mở `src/lib/ui-system/types.ts`, bổ sung ID mới vào union `UiPresetId` (ví dụ: `"cyberpunk-neon"`).
2. **Bước 2**: Mở `src/lib/ui-system/presets.ts`, định nghĩa đối tượng `PRESET_XYZ` kiểu `PresetDefinition` với đầy đủ mã màu tokens, bo góc radius và font chữ. Đăng ký vào `UI_PRESETS`.
3. **Bước 3**: Mở `src/app/globals.css`, bổ sung khối selector:
   ```css
   [data-theme="cyberpunk-neon"] {
     --color-primary: #...;
     --color-bg: #...;
     /* ... */
   }
   ```
4. **Xong**: Toàn bộ ứng dụng và UI Studio tự động nhận diện và hiển thị Preset mới.

# T1.3 — Đồ thị Phụ thuộc và Chu trình (Module Dependency Graph)

> **Tổng số modules phân tích**: 38 | **Lệnh quét tự động**: `python scripts/analyze.py`

## 1. Danh sách phụ thuộc giữa các Module (`src/modules/*`)

| Module Nguồn | Số phụ thuộc | Các Module được Import | Đánh giá Chu trình |
|---|---|---|---|
| `ai-governance` | 1 | `audit` | ✅ Tuyến tính |
| `assets` | 3 | `audit`, `jobs`, `products` | 🔴 Có chu trình: `assets <-> products` |
| `audio-studio` | 4 | `assets`, `creative-production`, `jobs`, `usage` | 🔴 Có chu trình: `audio-studio <-> creative-production` |
| `availability` | 1 | `greeting-card` | 🔴 Có chu trình: `availability <-> greeting-card` |
| `avi-gift-import` | 4 | `assets`, `jobs`, `organization`, `products` | ✅ Tuyến tính |
| `catalog-links` | 1 | `assets` | ✅ Tuyến tính |
| `chain-partnership` | 2 | `internal-chat`, `organization` | ✅ Tuyến tính |
| `chat-assistant` | 5 | `crm`, `orders`, `organization`, `products`, `usage` | ✅ Tuyến tính |
| `content-engine` | 6 | `audit`, `creative-production`, `jobs`, `market-intelligence`, `profiles`, `usage` | 🔴 Có chu trình: `content-engine <-> creative-production` |
| `coordinator` | 6 | `assets`, `audit`, `crm`, `field-platform`, `orders`, `products` | 🔴 Có chu trình: `coordinator <-> field-platform` |
| `creative-production` | 11 | `assets`, `audio-studio`, `audit`, `content-engine`, `jobs`, `market-intelligence`, `media`, `organization`, `profiles`, `usage`, `video-studio` | 🔴 Có chu trình: `creative-production <-> video-studio`, `creative-production <-> market-intelligence`, `content-engine <-> creative-production`, `audio-studio <-> creative-production`, `creative-production <-> media` |
| `field-platform` | 3 | `assets`, `coordinator`, `platform` | 🔴 Có chu trình: `coordinator <-> field-platform`, `field-platform <-> platform` |
| `greeting-card` | 6 | `assets`, `audit`, `availability`, `coordinator`, `organization`, `products` | 🔴 Có chu trình: `availability <-> greeting-card` |
| `integration` | 4 | `assets`, `organization`, `products`, `sso` | ✅ Tuyến tính |
| `jobs` | 2 | `organization`, `usage` | 🔴 Có chu trình: `jobs <-> usage` |
| `journey` | 2 | `organization`, `profiles` | ✅ Tuyến tính |
| `market-intelligence` | 5 | `assets`, `creative-production`, `jobs`, `organization`, `usage` | 🔴 Có chu trình: `creative-production <-> market-intelligence` |
| `media` | 5 | `assets`, `audit`, `creative-production`, `jobs`, `usage` | 🔴 Có chu trình: `creative-production <-> media` |
| `orders` | 1 | `audit` | ✅ Tuyến tính |
| `organization` | 2 | `audit`, `profiles` | 🔴 Có chu trình: `organization <-> profiles` |
| `platform` | 6 | `assets`, `audit`, `field-platform`, `greeting-card`, `jobs`, `organization` | 🔴 Có chu trình: `field-platform <-> platform` |
| `product-copies` | 7 | `audit`, `creative-production`, `jobs`, `organization`, `products`, `profiles`, `usage` | 🔴 Có chu trình: `product-copies <-> products` |
| `product-image-set` | 3 | `assets`, `jobs`, `product-photo-studio` | ✅ Tuyến tính |
| `product-photo-studio` | 2 | `assets`, `jobs` | ✅ Tuyến tính |
| `products` | 6 | `assets`, `audit`, `jobs`, `orders`, `organization`, `product-copies` | 🔴 Có chu trình: `product-copies <-> products`, `assets <-> products` |
| `profiles` | 2 | `assets`, `organization` | 🔴 Có chu trình: `organization <-> profiles` |
| `proxy` | 2 | `organization`, `sso` | ✅ Tuyến tính |
| `storage` | 1 | `assets` | ✅ Tuyến tính |
| `templates` | 1 | `organization` | ✅ Tuyến tính |
| `usage` | 2 | `jobs`, `organization` | 🔴 Có chu trình: `jobs <-> usage` |
| `video-studio` | 4 | `assets`, `creative-production`, `jobs`, `usage` | 🔴 Có chu trình: `creative-production <-> video-studio` |

## 2. Danh sách 12 Chu trình Phụ thuộc Vòng (Circular Dependencies Hotspots)
Dưới đây là các cặp module đang import qua lại lẫn nhau, cản trở việc tách package độc lập:

- 🔴 `organization` ⇄ `profiles`
- 🔴 `creative-production` ⇄ `video-studio`
- 🔴 `product-copies` ⇄ `products`
- 🔴 `coordinator` ⇄ `field-platform`
- 🔴 `assets` ⇄ `products`
- 🔴 `field-platform` ⇄ `platform`
- 🔴 `jobs` ⇄ `usage`
- 🔴 `creative-production` ⇄ `market-intelligence`
- 🔴 `availability` ⇄ `greeting-card`
- 🔴 `content-engine` ⇄ `creative-production`
- 🔴 `audio-studio` ⇄ `creative-production`
- 🔴 `creative-production` ⇄ `media`

## 3. Phụ thuộc ngược tầng (Violations of 4-layer Architecture)
- `creative-production` (tầng Domain) import chéo `video-studio`, `audio-studio`, `media`.
- `coordinator` (tầng Chuỗi) import chéo `field-platform` và trực tiếp can thiệp `greeting-card`.
- Hướng xử lý: Tách thành các Event Envelope hoặc giao tiếp qua Port Interface tại `src/core/ports/`.
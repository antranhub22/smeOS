# T1.2 — Bản đồ Dữ liệu và Sở hữu Bảng (Data Ownership Map)

> **Tổng số bảng kiểm kê**: 97 bảng | **Chế độ**: CHỈ ĐỌC (Phase 1)

## 1. Bảng phân định Sở hữu Dữ liệu theo Bốn Nhóm

| STT | Tên Bảng (Model Prisma) | Module Ghi (Write) | Module Đọc (Read) | Nhóm Đề xuất | Trạng thái Ghi chéo |
|---|---|---|---|---|---|
| 1 | `ai_capabilities` | core:ai, other | core:ai, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 2 | `ai_evaluations` | core:ai, other | core:ai, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 3 | `ai_models` | core:ai, other | core:ai, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 4 | `ai_policies` | core:ai, other | core:ai, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 5 | `ai_requests` | core:ai, other | core:ai, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 6 | `assets` | module:assets, module:greeting-card, module:products, module:storage, other | module:assets, module:catalog-links, module:greeting-card, module:platform, module:products, module:storage, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 7 | `audit_logs` | module:audit, other | module:audit, module:platform, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 8 | `branches` | module:field-platform, module:organization, other | api-routes, module:field-platform, module:greeting-card, module:organization, module:platform, other | **Cần con người quyết (Identity & Entitlement)** | ⚠️ Ghi chéo nhiều module |
| 9 | `brand_profiles` | module:profiles, other | module:catalog-links, module:profiles, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 10 | `business_profiles` | module:profiles, other | module:catalog-links, module:profiles, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 11 | `campaign_packages` | module:creative-production, other | module:creative-production, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 12 | `capability_overrides` | module:organization, other | module:organization, other | **Cần con người quyết (Identity & Entitlement)** | ⚠️ Ghi chéo nhiều module |
| 13 | `catalog_links` | module:catalog-links, other | module:catalog-links, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 14 | `chain_partnerships` | module:chain-partnership, other | api-routes, module:chain-partnership, other | **Chain OS** | ⚠️ Ghi chéo nhiều module |
| 15 | `chat_channel_integrations` | module:chat-assistant, other | module:chat-assistant, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 16 | `chat_conversations` | module:chat-assistant, other | module:chat-assistant, module:creative-production, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 17 | `chat_messages` | module:chat-assistant, other | module:chat-assistant, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 18 | `content_drafts` | module:creative-production, other | module:creative-production, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 19 | `content_generations` | module:content-engine, other | module:content-engine, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 20 | `content_metrics` | module:integration, other | module:creative-production, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 21 | `content_opportunities` | module:market-intelligence, other | module:market-intelligence, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 22 | `customer_consents` | module:crm, other | other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 23 | `customer_occasions` | module:crm, other | other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 24 | `customers` | module:crm, module:greeting-card, other | module:crm, module:greeting-card, module:platform, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 25 | `decision_registry` | other | other | **Store OS** | ✅ Độc quyền 1 nguồn |
| 26 | `field_catalog_values` | module:field-platform, other | module:field-platform, other | **Industry Pack** | ⚠️ Ghi chéo nhiều module |
| 27 | `field_catalogs` | module:field-platform, other | module:field-platform, other | **Industry Pack** | ⚠️ Ghi chéo nhiều module |
| 28 | `field_config_overrides` | module:field-platform, other | module:field-platform, other | **Industry Pack** | ⚠️ Ghi chéo nhiều module |
| 29 | `field_definitions` | module:field-platform, other | module:field-platform, other | **Industry Pack** | ⚠️ Ghi chéo nhiều module |
| 30 | `flower_confusable_pairs` | other | other | **Industry Pack** | ✅ Độc quyền 1 nguồn |
| 31 | `flower_taxonomy` | other | other | **Industry Pack** | ✅ Độc quyền 1 nguồn |
| 32 | `generation_jobs` | module:jobs, other | module:audio-studio, module:jobs, module:platform, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 33 | `greeting_catalog_events` | module:greeting-card, other | module:greeting-card, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 34 | `greeting_catalog_products` | module:greeting-card, other | module:greeting-card, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 35 | `greeting_catalogs` | module:greeting-card, other | module:greeting-card, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 36 | `greeting_integrations` | module:greeting-card, other | module:greeting-card, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 37 | `greeting_journey_events` | module:greeting-card, other | module:greeting-card, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 38 | `greeting_message_reads` | module:greeting-card, other | other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 39 | `greeting_messages` | module:greeting-card, other | module:greeting-card, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 40 | `greeting_notifications` | module:greeting-card, other | module:greeting-card, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 41 | `greeting_payment_events` | module:greeting-card, other | module:greeting-card, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 42 | `greeting_sessions` | module:greeting-card, other | module:greeting-card, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 43 | `greeting_share_links` | module:greeting-card, other | module:greeting-card, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 44 | `integration_tokens` | module:integration, other | module:integration, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 45 | `internal_chat_conversations` | module:internal-chat, other | module:internal-chat, other | **Chain OS** | ⚠️ Ghi chéo nhiều module |
| 46 | `internal_chat_messages` | module:internal-chat, other | module:internal-chat, other | **Chain OS** | ⚠️ Ghi chéo nhiều module |
| 47 | `internal_chat_participants` | module:internal-chat, other | module:internal-chat, other | **Chain OS** | ⚠️ Ghi chéo nhiều module |
| 48 | `job_events` | module:jobs, other | module:jobs, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 49 | `journey_runs` | other | other | **Store OS** | ✅ Độc quyền 1 nguồn |
| 50 | `market_sources` | module:market-intelligence, other | other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 51 | `memberships` | module:chain-partnership, module:organization, module:platform, other | api-routes, module:greeting-card, module:organization, module:platform, other | **Cần con người quyết (Identity & Entitlement)** | ⚠️ Ghi chéo nhiều module |
| 52 | `music_tracks` | module:audio-studio, other | module:audio-studio, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 53 | `occasions` | module:organization, other | module:organization, other | **Industry Pack** | ⚠️ Ghi chéo nhiều module |
| 54 | `order_assignments` | module:orders, other | other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 55 | `order_change_requests` | other | other | **Chain OS** | ✅ Độc quyền 1 nguồn |
| 56 | `order_coordinations` | api-routes, module:coordinator, module:greeting-card, other | api-routes, module:coordinator, module:greeting-card, other | **Chain OS** | ⚠️ Ghi chéo nhiều module |
| 57 | `order_events` | api-routes, module:coordinator, module:greeting-card, module:orders, other | other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 58 | `order_exceptions` | module:coordinator, other | module:coordinator, other | **Chain OS** | ⚠️ Ghi chéo nhiều module |
| 59 | `order_info_requests` | other | other | **Chain OS** | ✅ Độc quyền 1 nguồn |
| 60 | `order_items` | module:coordinator, module:greeting-card, module:orders, other | other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 61 | `order_payments` | module:coordinator, module:greeting-card, other | module:coordinator, module:greeting-card, other | **Chain OS** | ⚠️ Ghi chéo nhiều module |
| 62 | `order_qc_records` | module:coordinator, module:greeting-card, other | module:greeting-card, other | **Chain OS** | ⚠️ Ghi chéo nhiều module |
| 63 | `orders` | api-routes, module:availability, module:coordinator, module:greeting-card, module:orders, other | api-routes, module:availability, module:coordinator, module:creative-production, module:crm, module:greeting-card, module:orders, module:platform, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 64 | `organizations` | api-routes, module:chain-partnership, module:chat-assistant, module:coordinator, module:field-platform, module:greeting-card, module:organization, module:profiles, other | api-routes, module:catalog-links, module:chain-partnership, module:chat-assistant, module:coordinator, module:field-platform, module:greeting-card, module:market-intelligence, module:organization, module:platform, module:products, module:profiles, other | **Cần con người quyết (Identity & Entitlement)** | ⚠️ Ghi chéo nhiều module |
| 65 | `partners` | module:coordinator, other | module:coordinator, other | **Chain OS** | ⚠️ Ghi chéo nhiều module |
| 66 | `platform_audit_logs` | module:platform, other | module:platform, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 67 | `platform_operators` | module:platform, other | module:platform, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 68 | `platform_role_capabilities` | module:platform, other | other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 69 | `pricing_rules` | module:products, other | module:products, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 70 | `product_analyses` | module:products, module:profiles, module:storage, other | module:market-intelligence, module:product-copies, module:products, module:storage, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 71 | `product_analysis_runs` | module:market-intelligence, other | module:market-intelligence, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 72 | `product_bookings` | module:availability, module:greeting-card, module:profiles, other | module:availability, module:greeting-card, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 73 | `product_copies` | module:product-copies, other | module:product-copies, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 74 | `product_images` | module:products, module:profiles, module:storage, other | module:products, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 75 | `product_inventory` | module:profiles, module:storage, other | other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 76 | `product_variants` | module:organization, module:profiles, module:storage, other | other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 77 | `products` | module:coordinator, module:organization, module:product-copies, module:products, module:profiles, module:storage, other | module:availability, module:catalog-links, module:content-engine, module:coordinator, module:greeting-card, module:platform, module:product-copies, module:products, module:profiles, module:storage, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 78 | `provider_health` | module:market-intelligence, other | module:market-intelligence, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 79 | `registration_requests` | module:organization, module:platform, other | module:organization, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 80 | `research_runs` | module:market-intelligence, other | module:market-intelligence, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 81 | `role_capabilities` | module:organization, other | module:organization, other | **Cần con người quyết (Identity & Entitlement)** | ⚠️ Ghi chéo nhiều module |
| 82 | `roles` | module:organization, other | module:chain-partnership, module:greeting-card, module:organization, other | **Cần con người quyết (Identity & Entitlement)** | ⚠️ Ghi chéo nhiều module |
| 83 | `sessions` | module:organization, other | module:organization, other | **Cần con người quyết (Identity & Entitlement)** | ⚠️ Ghi chéo nhiều module |
| 84 | `staff_notifications` | module:greeting-card, other | module:greeting-card, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 85 | `template_overrides` | module:templates, other | module:templates, other | **Industry Pack** | ⚠️ Ghi chéo nhiều module |
| 86 | `topic_scores` | module:market-intelligence, other | other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 87 | `topic_signals` | other | other | **Platform (Mother)** | ✅ Độc quyền 1 nguồn |
| 88 | `topics` | module:market-intelligence, other | module:market-intelligence, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 89 | `trend_signals` | module:market-intelligence, other | module:market-intelligence, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 90 | `trend_timeseries` | other | module:market-intelligence, other | **Platform (Mother)** | ✅ Độc quyền 1 nguồn |
| 91 | `usage` | module:chat-assistant, module:usage, other | module:platform, module:usage, other | **Platform (Mother)** | ⚠️ Ghi chéo nhiều module |
| 92 | `users` | module:chain-partnership, module:organization, other | api-routes, module:chain-partnership, module:organization, other | **Cần con người quyết (Identity & Entitlement)** | ⚠️ Ghi chéo nhiều module |
| 93 | `video_jobs` | module:video-studio, other | module:video-studio, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 94 | `video_scenes` | module:video-studio, other | other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 95 | `voice_clones` | module:audio-studio, other | module:audio-studio, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 96 | `vouchers` | module:greeting-card, other | module:greeting-card, other | **Store OS** | ⚠️ Ghi chéo nhiều module |
| 97 | `workspaces` | module:chain-partnership, module:organization, other | module:organization, other | **Cần con người quyết (Identity & Entitlement)** | ⚠️ Ghi chéo nhiều module |

## 2. Danh sách các bảng Bị Ghi Chéo Cần Chuẩn Hóa

Các bảng dưới đây đang bị ghi trực tiếp bởi nhiều module, vi phạm nguyên tắc 'Mỗi dữ liệu có duy nhất 1 System of Record':
- `organizations`: Bị 9 callers ghi (`chain-partnership`, `coordinator`, `greeting-card`, `organization`, `profiles`, v.v.)
- `products`: Bị 7 callers ghi (`coordinator`, `organization`, `product-copies`, `products`, `profiles`, `storage`, v.v.)
- `orders`: Bị 6 callers ghi (`availability`, `coordinator`, `greeting-card`, `orders`, v.v.)
- `assets`: Bị 5 callers ghi (`assets`, `greeting-card`, `products`, `storage`, v.v.)
- `order_events`: Bị 5 callers ghi (`coordinator`, `greeting-card`, `orders`, v.v.)
- `order_coordinations`: Bị 4 callers ghi (`coordinator`, `greeting-card`, v.v.)

## 3. Các bảng thuộc nhóm 'Cần con người quyết' (ADR-D3)
- Nhóm bảng định danh chung: `users`, `sessions`, `organizations`, `workspaces`, `branches`, `memberships`, `roles`.
- **Câu hỏi kiến trúc**: Bản ghi định danh này do Mother Platform làm nguồn sự thật và cấp phát (provisioning) xuống Store/Chain, hay Store OS có quyền tự sinh tổ chức khi chạy độc lập?
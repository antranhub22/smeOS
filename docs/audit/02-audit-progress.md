# 02 — Audit progress ledger

Statuses: NOT_STARTED · IN_REVIEW · REVIEWED · FIX_REQUIRED · FIXED · VERIFIED · BLOCKED · NOT_APPLICABLE. Any status other than VERIFIED needs a reason.

## Checkpoint (2026-10-28)

- CURRENT lineage (70): every non-merge commit reviewed diff by diff; 17 merges VERIFIED; all gates run at HEAD (07).
- LEGACY (543): every non-merge commit rule-audited line by line + survival measured (03b); 77 merges VERIFIED.
- **All 613 commits have a terminal status.** Status ≠ VERIFIED always carries a reason.

## Batch summary

| Batch | Range | Status | Notes |
|---|---|---|---|
| 01 | #1–#50 | NOT_STARTED | |
| 02 | #51–#100 | NOT_STARTED | |
| 03 | #101–#150 | NOT_STARTED | |
| 04 | #151–#200 | NOT_STARTED | |
| 05 | #201–#250 | NOT_STARTED | |
| 06 | #251–#300 | NOT_STARTED | |
| 07 | #301–#350 | NOT_STARTED | |
| 08 | #351–#400 | NOT_STARTED | |
| 09 | #401–#450 | NOT_STARTED | |
| 10 | #451–#500 | NOT_STARTED | |
| 11 | #501–#550 | NOT_STARTED | |
| 12 | #551–#600 | NOT_STARTED | |
| 13 | #601–#613 | NOT_STARTED | |

## Per-commit ledger

| # | Hash | Branches | Status | Verdict | Reason / finding IDs |
|---|---|---|---|---|---|
| 1 | `15508f97` | TINH | VERIFIED | PASS | rule audit PASS; 68% of added lines live on in main and pass the HEAD gates (07) |
| 2 | `b1a8be69` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | no added code lines (deletions/renames/binary only) |
| 3 | `a747ba39` | TINH | VERIFIED | PASS | rule audit PASS; 50% of added lines live on in main and pass the HEAD gates (07) |
| 4 | `d2d7a5b0` | TINH | VERIFIED | PASS | rule audit PASS; 88% of added lines live on in main and pass the HEAD gates (07) |
| 5 | `edbf1d34` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 81 added lines remain in main (1/1 files gone) |
| 6 | `5e510988` | TINH | VERIFIED | PASS | rule audit PASS; 86% of added lines live on in main and pass the HEAD gates (07) |
| 7 | `e0fb4310` | TINH | VERIFIED | PASS | rule audit PASS; 67% of added lines live on in main and pass the HEAD gates (07) |
| 8 | `c44378c2` | TINH | VERIFIED | PASS | rule audit PASS; 29% of added lines live on in main and pass the HEAD gates (07) |
| 9 | `a2a9ea46` | TINH | VERIFIED | PASS | rule audit PASS; 65% of added lines live on in main and pass the HEAD gates (07) |
| 10 | `f4c52cb1` | TINH | VERIFIED | PASS | rule audit PASS; 93% of added lines live on in main and pass the HEAD gates (07) |
| 11 | `35482a30` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 7 added lines remain in main (0/1 files gone) |
| 12 | `799aedc0` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: route_without_guard, schema_without_migration); 91% of added lines live on in main and pass the HEAD gates (07) |
| 13 | `9e579c26` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: schema_without_migration); 92% of added lines live on in main and pass the HEAD gates (07) |
| 14 | `4efcb7fd` | TINH | VERIFIED | PASS | rule audit PASS; 31% of added lines live on in main and pass the HEAD gates (07) |
| 15 | `d614224e` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: route_without_guard, schema_without_migration); 86% of added lines live on in main and pass the HEAD gates (07) |
| 16 | `24f1049c` | TINH | VERIFIED | PASS | rule audit PASS; 50% of added lines live on in main and pass the HEAD gates (07) |
| 17 | `f4eaca40` | TINH | VERIFIED | PASS | rule audit PASS; 82% of added lines live on in main and pass the HEAD gates (07) |
| 18 | `c711a63b` | TINH | VERIFIED | PASS | rule audit PASS; 68% of added lines live on in main and pass the HEAD gates (07) |
| 19 | `89808fcb` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: schema_without_migration); 78% of added lines live on in main and pass the HEAD gates (07) |
| 20 | `f870894b` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (concern: src_without_tests); 56% of added lines live on in main and pass the HEAD gates (07) |
| 21 | `7cf2472d` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: schema_without_migration); 95% of added lines live on in main and pass the HEAD gates (07) |
| 22 | `c113ba8e` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 1 added lines remain in main (0/1 files gone) |
| 23 | `8188b979` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 24 | `27a44c77` | TINH | VERIFIED | PASS | rule audit PASS; 16% of added lines live on in main and pass the HEAD gates (07) |
| 25 | `02c03f35` | TINH | VERIFIED | PASS | rule audit PASS; 93% of added lines live on in main and pass the HEAD gates (07) |
| 26 | `2607e921` | TINH | VERIFIED | PASS | rule audit PASS; 64% of added lines live on in main and pass the HEAD gates (07) |
| 27 | `fda830f2` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: schema_without_migration); 91% of added lines live on in main and pass the HEAD gates (07) |
| 28 | `828c2263` | TINH | VERIFIED | PASS | rule audit PASS; 94% of added lines live on in main and pass the HEAD gates (07) |
| 29 | `3493cf10` | TINH | VERIFIED | PASS | rule audit PASS; 80% of added lines live on in main and pass the HEAD gates (07) |
| 30 | `868d8c8f` | TINH | VERIFIED | PASS | rule audit PASS; 94% of added lines live on in main and pass the HEAD gates (07) |
| 31 | `fedc72fb` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 32 | `65e055a6` | TINH | VERIFIED | PASS | rule audit PASS; 58% of added lines live on in main and pass the HEAD gates (07) |
| 33 | `c7898025` | TINH | VERIFIED | PASS | rule audit PASS; 97% of added lines live on in main and pass the HEAD gates (07) |
| 34 | `71772ba3` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 35 | `7e49eb7a` | TINH | VERIFIED | PASS | rule audit PASS; 17% of added lines live on in main and pass the HEAD gates (07) |
| 36 | `3e69864d` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 37 | `cedea04e` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 38 | `ab794499` | TINH | VERIFIED | PASS | rule audit PASS; 65% of added lines live on in main and pass the HEAD gates (07) |
| 39 | `5f1ab7c3` | TINH | VERIFIED | PASS | rule audit PASS; 99% of added lines live on in main and pass the HEAD gates (07) |
| 40 | `65eab93f` | TINH | VERIFIED | PASS | rule audit PASS; 93% of added lines live on in main and pass the HEAD gates (07) |
| 41 | `f14cd9f6` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: schema_without_migration); 81% of added lines live on in main and pass the HEAD gates (07) |
| 42 | `89ef4bda` | TINH | VERIFIED | PASS | rule audit PASS; 99% of added lines live on in main and pass the HEAD gates (07) |
| 43 | `4826dddb` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (concern: src_without_tests); 100% of added lines live on in main and pass the HEAD gates (07) |
| 44 | `23c22999` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/upload/upload-wizard.tsx; fixed later: route_without_guard — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 45 | `d55bf2b6` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 131 added lines remain in main (1/1 files gone) |
| 46 | `e37e5afb` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 39 added lines remain in main (1/1 files gone) |
| 47 | `6e33b751` | TINH | VERIFIED | PASS | rule audit PASS; 14% of added lines live on in main and pass the HEAD gates (07) |
| 48 | `dd6b35fc` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 49 | `3769beee` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 1 added lines remain in main (0/1 files gone) |
| 50 | `7b5ee35f` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 6 added lines remain in main (0/1 files gone) |
| 51 | `75eb0765` | TINH | VERIFIED | PASS | rule audit PASS; 97% of added lines live on in main and pass the HEAD gates (07) |
| 52 | `46168f59` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 53 | `eac8b40a` | TINH | VERIFIED | PASS | rule audit PASS; 81% of added lines live on in main and pass the HEAD gates (07) |
| 54 | `1ee1079d` | TINH | VERIFIED | PASS | rule audit PASS; 85% of added lines live on in main and pass the HEAD gates (07) |
| 55 | `2cfd0a59` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 56 | `5ef16658` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 109 added lines remain in main (1/1 files gone) |
| 57 | `7ce52e7f` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 4 added lines remain in main (1/1 files gone) |
| 58 | `33648060` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/upload/upload-wizard.tsx; fixed later: file_over_350; concern: src_without_tests — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 59 | `09ec845f` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/upload/upload-wizard.tsx; fixed later: schema_without_migration — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 60 | `03efa98b` | TINH | VERIFIED | PASS | rule audit PASS; 59% of added lines live on in main and pass the HEAD gates (07) |
| 61 | `902ea351` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: schema_without_migration); 92% of added lines live on in main and pass the HEAD gates (07) |
| 62 | `9280acb5` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/upload/upload-wizard.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 63 | `afb1ca63` | TINH | VERIFIED | PASS | rule audit PASS; 43% of added lines live on in main and pass the HEAD gates (07) |
| 64 | `aba0b534` | TINH | VERIFIED | PASS | rule audit PASS; 90% of added lines live on in main and pass the HEAD gates (07) |
| 65 | `634c7cf0` | TINH | VERIFIED | PASS | rule audit PASS; 87% of added lines live on in main and pass the HEAD gates (07) |
| 66 | `228967d3` | TINH | VERIFIED | PASS | rule audit PASS; 29% of added lines live on in main and pass the HEAD gates (07) |
| 67 | `3523566d` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 68 | `1df21b57` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 69 | `d4fbfe4f` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 70 | `b323484d` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 71 | `ac795139` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 72 | `4dc8e907` | TINH | VERIFIED | PASS | rule audit PASS; 98% of added lines live on in main and pass the HEAD gates (07) |
| 73 | `9b6a272c` | TINH | VERIFIED | PASS | rule audit PASS; 89% of added lines live on in main and pass the HEAD gates (07) |
| 74 | `81375c20` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 75 | `3c7318fe` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 76 | `9ae772be` | TINH | VERIFIED | PASS | rule audit PASS; 69% of added lines live on in main and pass the HEAD gates (07) |
| 77 | `25e1fe65` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 78 | `93fcf25c` | TINH | VERIFIED | PASS | rule audit PASS; 25% of added lines live on in main and pass the HEAD gates (07) |
| 79 | `6ab393d0` | TINH | VERIFIED | PASS | rule audit PASS; 89% of added lines live on in main and pass the HEAD gates (07) |
| 80 | `94d11656` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 81 | `e48a75c0` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/creative-studio/page.tsx, file_over_350:src/app/(app)/so-lieu/page.tsx, file_over_350:src/app/(app)/tai-anh/page.tsx; fixed later: any — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 82 | `b954142f` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 252 added lines remain in main (1/2 files gone) |
| 83 | `23960413` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 335 added lines remain in main (1/1 files gone) |
| 84 | `26268714` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 253 added lines remain in main (1/1 files gone) |
| 85 | `1760f598` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/tai-anh/page.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 86 | `8418b568` | TINH | VERIFIED | PASS | rule audit PASS; 99% of added lines live on in main and pass the HEAD gates (07) |
| 87 | `9c9893d6` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 88 | `f983f8e6` | TINH | VERIFIED | PASS | rule audit PASS; 95% of added lines live on in main and pass the HEAD gates (07) |
| 89 | `1aaf78e1` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 90 | `d508a688` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 7% of 207 added lines remain in main (2/13 files gone) |
| 91 | `d6d9e590` | TINH | VERIFIED | PASS | rule audit PASS; 87% of added lines live on in main and pass the HEAD gates (07) |
| 92 | `49d4882a` | TINH | VERIFIED | PASS | rule audit PASS; 24% of added lines live on in main and pass the HEAD gates (07) |
| 93 | `fab18eca` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 94 | `776cc10d` | TINH | VERIFIED | PASS | rule audit PASS; 95% of added lines live on in main and pass the HEAD gates (07) |
| 95 | `3c8939d1` | TINH | VERIFIED | PASS | rule audit PASS; 95% of added lines live on in main and pass the HEAD gates (07) |
| 96 | `98c64695` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 44 added lines remain in main (1/1 files gone) |
| 97 | `0280d1f9` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: any:src/app/(app)/san-pham/[id]/tinh-nang/product-copy/[copyId]/page.tsx, file_over_350:src/app/(app)/san-pham/[id]/tinh-nang/product-copy/[copyId]/page.tsx, file_over_350:src/components/dashboard/FeaturePicker.tsx, file_over_350:src/lib/feature-catalog.ts …; fixed later: any — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 98 | `0559ae0e` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/tai-anh/page.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 99 | `b23de19a` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/tai-anh/page.tsx, file_over_350:src/components/result/result-card.tsx, file_over_350:src/components/sales/sales-pitch-card.tsx, file_over_350:src/components/storage/account-storage-hub.tsx …; fixed later: any, file_over_350, route_without_guard, schema_without_migration — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 100 | `cee5ae7a` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/tai-anh/page.tsx, file_over_350:src/components/storage/account-storage-hub.tsx; fixed later: any — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 101 | `445af50b` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/creative-studio/page.tsx; fixed later: route_without_guard — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 102 | `98288bbc` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 103 | `1177b441` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 104 | `cbb66682` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/creative-studio/page.tsx; fixed later: any, file_over_350, route_without_guard — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 105 | `0e45d6fe` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/ket-noi/page.tsx, file_over_350:src/app/(app)/lich-dang/page.tsx, file_over_350:src/components/templates/content-engine/social-post-preview.tsx, file_over_350:src/components/templates/social-publishing/post-status-report-card.tsx; fixed later: any, file_over_350, route_without_guard — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 106 | `b6c53340` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 107 | `609908b0` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: any, file_over_350, prisma_outside_infra, route_without_guard); 74% of added lines live on in main and pass the HEAD gates (07) |
| 108 | `0a4f531d` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/video/page.tsx; fixed later: route_without_guard, schema_without_migration — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 109 | `7fcd93da` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/profiles/brand-profile-form.tsx; fixed later: any — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 110 | `5c7d9f45` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 1 added lines remain in main (0/1 files gone) |
| 111 | `59536a73` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: console:src/core/observability/log.ts, file_over_350:src/app/(app)/hoi-thoai/page.tsx, file_over_350:src/app/(app)/tai-anh/page.tsx, file_over_350:src/components/sales/sales-pitch-card.tsx …; fixed later: any, file_over_350, route_without_guard, schema_without_migration — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 112 | `8d2fd45d` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/creative-studio/page.tsx; fixed later: route_without_guard — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 113 | `ee61a610` | TINH | VERIFIED | PASS | rule audit PASS; 88% of added lines live on in main and pass the HEAD gates (07) |
| 114 | `8b3c9a69` | TINH | VERIFIED | PASS | rule audit PASS; 80% of added lines live on in main and pass the HEAD gates (07) |
| 115 | `1b782c46` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: route_without_guard); 92% of added lines live on in main and pass the HEAD gates (07) |
| 116 | `b540bfb3` | TINH | VERIFIED | PASS | rule audit PASS; 98% of added lines live on in main and pass the HEAD gates (07) |
| 117 | `af211251` | TINH | VERIFIED | PASS | rule audit PASS; 13% of added lines live on in main and pass the HEAD gates (07) |
| 118 | `ae2b8645` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/profiles/brand-profile-form.tsx; fixed later: prisma_outside_infra — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 119 | `f83b1e53` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/tai-anh/page.tsx, file_over_350:src/components/sales/sales-pitch-card.tsx, file_over_350:src/modules/products/domain/sales-pitch-template.ts, file_over_350:src/modules/products/infra/product-master-index-repository.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 120 | `44da6fa7` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/kho-templates/page.tsx; fixed later: any, prisma_outside_infra — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 121 | `921b4243` | TINH | VERIFIED | PASS | rule audit PASS; 99% of added lines live on in main and pass the HEAD gates (07) |
| 122 | `2d5da520` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 123 | `f2e19ee5` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: schema_without_migration); 88% of added lines live on in main and pass the HEAD gates (07) |
| 124 | `3cd91ccc` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: console:src/modules/market-intelligence/infra/worker.ts, file_over_350:src/components/market-intelligence/saas-admin-criteria-modal.tsx, file_over_350:src/modules/market-intelligence/domain/market-taxonomy.ts, file_over_350:src/modules/market-intelligence/infra/worker.ts; fixed later: any, schema_without_migration — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 125 | `780b78ef` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/market-intelligence/domain/market-taxonomy.ts; concern: src_without_tests — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 126 | `6ef487a9` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/market-intelligence/domain/market-taxonomy.ts, file_over_350:src/modules/market-intelligence/infra/worker.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 127 | `9a0a3241` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/market-intelligence/opportunity-detail-drawer.tsx, file_over_350:src/modules/market-intelligence/infra/worker.ts; fixed later: any; concern: src_without_tests — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 128 | `085b6677` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: any); 66% of added lines live on in main and pass the HEAD gates (07) |
| 129 | `0ac3f3da` | TINH | VERIFIED | PASS | rule audit PASS; 86% of added lines live on in main and pass the HEAD gates (07) |
| 130 | `2ad6d3d4` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/tai-anh/page.tsx, file_over_350:src/modules/market-intelligence/domain/trend-fit.ts; fixed later: any; concern: src_without_tests — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 131 | `cf733740` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/market-intelligence/domain/trend-fit.ts, file_over_350:src/modules/products/domain/analysis-schema-mapper.ts, file_over_350:src/modules/products/domain/sales-pitch-template.ts; fixed later: any — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 132 | `89a1c222` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: any); 72% of added lines live on in main and pass the HEAD gates (07) |
| 133 | `5d22bd18` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 134 | `89af2061` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: any, todo); 38% of added lines live on in main and pass the HEAD gates (07) |
| 135 | `6660d251` | TINH | VERIFIED | PASS | rule audit PASS; 99% of added lines live on in main and pass the HEAD gates (07) |
| 136 | `1887e9be` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: any:src/modules/audio-studio/infra/audio-job-repository.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 137 | `ae7db911` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/optimize-workspace.tsx, file_over_350:src/components/creative-studio/use-creative-studio-data.ts, file_over_350:src/components/creative-studio/variant-workspace.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 138 | `e2a6c58e` | TINH | VERIFIED | PASS | rule audit PASS; 50% of added lines live on in main and pass the HEAD gates (07) |
| 139 | `e7e801b8` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 6% of 959 added lines remain in main (0/4 files gone) |
| 140 | `789626c5` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: any); 65% of added lines live on in main and pass the HEAD gates (07) |
| 141 | `de0944f9` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 142 | `e39735c2` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/tai-anh/page.tsx; fixed later: any — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 143 | `368077d6` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 144 | `0835c198` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/creative-studio/page.tsx, file_over_350:src/app/(app)/tai-anh/page.tsx, file_over_350:src/components/creative-studio/creative-result-viewer.tsx, file_over_350:src/components/creative-studio/package-workspace.tsx …; fixed later: any, file_over_350 — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 145 | `7522378a` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/creative-result-viewer.tsx, file_over_350:src/components/creative-studio/variant-workspace.tsx, file_over_350:src/components/market-intelligence/product-intelligence-workspace.tsx, file_over_350:src/modules/creative-production/domain/campaign-package-rules.ts …; fixed later: file_over_350 — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 146 | `c3908556` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: route_without_guard; concern: src_without_tests); 64% of added lines live on in main and pass the HEAD gates (07) |
| 147 | `462e5863` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/variant-workspace.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 148 | `99701520` | TINH | VERIFIED | PASS | rule audit PASS; 47% of added lines live on in main and pass the HEAD gates (07) |
| 149 | `126e1150` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/audio-workspace.tsx, file_over_350:src/components/creative-studio/variant-workspace.tsx, file_over_350:src/modules/creative-production/domain/scene-plan-rules.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 150 | `e50ddbf9` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/creative-result-viewer.tsx, file_over_350:src/components/creative-studio/variant-workspace.tsx, file_over_350:src/components/market-intelligence/creative-handoff-modal.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 151 | `db9ac47f` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/variant-workspace.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 152 | `8ac6dbc9` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 153 | `f8bcdfff` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/variant-workspace.tsx; concern: src_without_tests — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 154 | `c60779e7` | TINH | VERIFIED | PASS | rule audit PASS; 57% of added lines live on in main and pass the HEAD gates (07) |
| 155 | `b4ac3dad` | TINH | VERIFIED | PASS | rule audit PASS; 78% of added lines live on in main and pass the HEAD gates (07) |
| 156 | `08399de4` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 157 | `cfde7522` | TINH | VERIFIED | PASS | rule audit PASS; 99% of added lines live on in main and pass the HEAD gates (07) |
| 158 | `beb7da82` | TINH | VERIFIED | PASS | rule audit PASS; 81% of added lines live on in main and pass the HEAD gates (07) |
| 159 | `61d66b6f` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (concern: src_without_tests); 92% of added lines live on in main and pass the HEAD gates (07) |
| 160 | `8f87929a` | TINH | VERIFIED | PASS | rule audit PASS; 92% of added lines live on in main and pass the HEAD gates (07) |
| 161 | `7eafb484` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 162 | `590f2715` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/package-workspace.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 163 | `03b2e09b` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/creative-studio/page.tsx, file_over_350:src/components/creative-studio/package-review-section.tsx, file_over_350:src/components/creative-studio/package-workspace.tsx, file_over_350:src/components/creative-studio/variant-workspace.tsx …; concern: src_without_tests — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 164 | `5d22645a` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/creative-result-viewer.tsx, file_over_350:src/components/creative-studio/package-workspace.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 165 | `c23b4bb1` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/package-workspace.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 166 | `e27603de` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/package-review-section.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 167 | `9ceeab52` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/package-review-section.tsx, file_over_350:src/components/creative-studio/package-revise-panels.tsx, file_over_350:src/components/creative-studio/package-workspace.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 168 | `e846f746` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/video/page.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 169 | `6eed51d8` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: any; concern: src_without_tests); 93% of added lines live on in main and pass the HEAD gates (07) |
| 170 | `0c9ef44e` | TINH | VERIFIED | PASS | rule audit PASS; 85% of added lines live on in main and pass the HEAD gates (07) |
| 171 | `27216cbf` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: any); 91% of added lines live on in main and pass the HEAD gates (07) |
| 172 | `17accc33` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/audio-workspace.tsx, file_over_350:src/components/creative-studio/package-review-section.tsx, file_over_350:src/components/creative-studio/package-revise-panels.tsx; concern: src_without_tests — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 173 | `2ae7ba87` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/video-workspace.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 174 | `e2ebdefb` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/market-intelligence/creative-handoff-modal.tsx, file_over_350:src/modules/creative-production/domain/scene-plan-rules.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 175 | `bb3e1c27` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/audio-workspace.tsx, file_over_350:src/components/creative-studio/creative-result-viewer.tsx; concern: src_without_tests — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 176 | `76af7299` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/variant-workspace.tsx; concern: src_without_tests — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 177 | `2b1d2b48` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/video-workspace.tsx; fixed later: prisma_outside_infra — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 178 | `f6d7e109` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/package-review-section.tsx, file_over_350:src/components/creative-studio/package-revise-panels.tsx, file_over_350:src/components/creative-studio/package-workspace.tsx, file_over_350:src/modules/creative-production/domain/campaign-package-rules.ts … — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 179 | `28ade7b8` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/creative-production/domain/scene-plan-rules.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 180 | `11a8506e` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/creative-production/domain/scene-plan-rules.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 181 | `2fb15eec` | TINH | VERIFIED | PASS | rule audit PASS; 36% of added lines live on in main and pass the HEAD gates (07) |
| 182 | `fa9f0ac0` | TINH | VERIFIED | PASS | rule audit PASS; 99% of added lines live on in main and pass the HEAD gates (07) |
| 183 | `f1193f60` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 184 | `89afab47` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/jobs/infra/generation-job-repository.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 185 | `b9a2e03a` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/creative-studio/page.tsx, file_over_350:src/components/creative-studio/audio-workspace.tsx, file_over_350:src/components/creative-studio/variant-workspace.tsx, file_over_350:src/components/creative-studio/video-workspace.tsx … — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 186 | `af4d6abf` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/creative-studio/page.tsx, file_over_350:src/components/creative-studio/variant-workspace.tsx, file_over_350:src/components/creative-studio/video-workspace.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 187 | `a82cf6ba` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 188 | `ef9a99ca` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/creative-production/domain/campaign-package-rules.ts, file_over_350:src/modules/creative-production/use-cases/manage-campaign-package.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 189 | `9c5a1b60` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/package-workspace.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 190 | `090c312a` | TINH | VERIFIED | PASS | rule audit PASS; 93% of added lines live on in main and pass the HEAD gates (07) |
| 191 | `b82eb13e` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 192 | `72c910e3` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 193 | `4097489b` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 194 | `bb6e761b` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/variant-workspace.tsx, file_over_350:src/modules/media/use-cases/request-variants.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 195 | `e96d8b8a` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/variant-workspace.tsx, file_over_350:src/modules/media/use-cases/request-variants.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 196 | `7fd415be` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/package-revise-panels.tsx, file_over_350:src/components/creative-studio/variant-workspace.tsx, file_over_350:src/modules/media/use-cases/request-variants.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 197 | `a52cabe9` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/coordinator/control-tower-dashboard.tsx, file_over_350:src/components/templates/coordinator/partner-product-card.tsx, file_over_350:src/components/templates/coordinator/sales-order-intake-modal.tsx; fixed later: any, route_without_guard — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 198 | `11e42633` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/coordinator/use-cases/operations.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 199 | `a4179e9a` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/creative-result-viewer.tsx, file_over_350:src/modules/content-engine/use-cases/generate-content.ts, file_over_350:src/modules/jobs/infra/generation-job-repository.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 200 | `5e49efa2` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/content-engine/use-cases/generate-content.ts, file_over_350:src/modules/jobs/infra/generation-job-repository.ts; fixed later: file_over_350 — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 201 | `edf16e9e` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 202 | `a1de3be1` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 203 | `0a26672a` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/hoi-thoai/page.tsx, file_over_350:src/app/(app)/lich-dang/page.tsx, file_over_350:src/app/(app)/tai-anh/page.tsx, file_over_350:src/components/market-intelligence/opportunity-detail-drawer.tsx …; fixed later: file_over_350 — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 204 | `07738c75` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/use-creative-studio-data.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 205 | `e8fe2362` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 206 | `df04ed3e` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/market-intelligence/product-upload-card.tsx, file_over_350:src/modules/content-engine/use-cases/generate-content.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 207 | `78b9d032` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 208 | `353f27f2` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/content-engine/use-cases/generate-content.ts; fixed later: route_without_guard — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 209 | `8e0177a5` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/optimize-workspace.tsx, file_over_350:src/components/creative-studio/use-creative-studio-data.ts, file_over_350:src/components/creative-studio/variant-workspace.tsx, file_over_350:src/modules/media/use-cases/request-variants.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 210 | `d48b1bd4` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/jobs/infra/generation-job-repository.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 211 | `a924a108` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/audio-workspace.tsx, file_over_350:src/components/creative-studio/package-revise-panels.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 212 | `4e539845` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/creative-studio/creative-result-viewer.tsx, file_over_350:src/components/market-intelligence/creative-handoff-modal.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 213 | `835b6ed3` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: any:src/app/(app)/duyet/page.tsx, file_over_350:src/app/(app)/hoi-thoai/page.tsx, file_over_350:src/app/(app)/tai-anh/page.tsx, file_over_350:src/components/coordinator/control-tower-dashboard.tsx …; fixed later: file_over_350, route_without_guard — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 214 | `6bb81691` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (concern: src_without_tests); 96% of added lines live on in main and pass the HEAD gates (07) |
| 215 | `f50a7aaa` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 10 added lines remain in main (0/1 files gone) |
| 216 | `2be4a4ce` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/hoi-thoai/page.tsx, file_over_350:src/modules/coordinator/contracts/field-registry.ts, file_over_350:src/modules/coordinator/use-cases/present-coordinator-order.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 217 | `f1000da0` | TINH | VERIFIED | PASS | rule audit PASS; 93% of added lines live on in main and pass the HEAD gates (07) |
| 218 | `91d53d3a` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 219 | `f0e6a181` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: file_over_350); 72% of added lines live on in main and pass the HEAD gates (07) |
| 220 | `62ad7a0e` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/lich-dang/page.tsx; fixed later: file_over_350 — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 221 | `345b64ad` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/so-lieu/page.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 222 | `30efe212` | TINH | VERIFIED | PASS | rule audit PASS; 34% of added lines live on in main and pass the HEAD gates (07) |
| 223 | `68d8c464` | TINH | VERIFIED | PASS | rule audit PASS; 82% of added lines live on in main and pass the HEAD gates (07) |
| 224 | `ada3b1b6` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/organization/domain/role-ux-catalog.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 225 | `01e2519b` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/dashboard/marketing-workspace.tsx, file_over_350:src/modules/organization/domain/role-ux-catalog.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 226 | `cf094e22` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/organization/domain/role-ux-catalog.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 227 | `6ced0333` | TINH | VERIFIED | PASS | rule audit PASS; 84% of added lines live on in main and pass the HEAD gates (07) |
| 228 | `a56c4cd2` | TINH | VERIFIED | PASS | rule audit PASS; 74% of added lines live on in main and pass the HEAD gates (07) |
| 229 | `102f2e73` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/san-pham/[id]/tinh-nang/product-copy/[copyId]/page.tsx, file_over_350:src/app/(app)/so-lieu/page.tsx, file_over_350:src/app/(app)/tai-anh/page.tsx, file_over_350:src/components/creative-studio/optimize-workspace.tsx … — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 230 | `3be0bffc` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/journey/domain/journey-catalog.ts, file_over_350:src/modules/organization/domain/role-ux-catalog.ts; fixed later: file_over_350, schema_without_migration — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 231 | `10fbf4d2` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | no added code lines (deletions/renames/binary only) |
| 232 | `14156615` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/sales/sales-pitch-card.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 233 | `bb7fa7bb` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 234 | `1e2ecb6f` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/sales/sales-pitch-card.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 235 | `daefd898` | TINH | VERIFIED | PASS | rule audit PASS; 98% of added lines live on in main and pass the HEAD gates (07) |
| 236 | `449cc5f2` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/so-lieu/page.tsx; fixed later: file_over_350 — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 237 | `3e6eb47f` | TINH | VERIFIED | PASS | rule audit PASS; 97% of added lines live on in main and pass the HEAD gates (07) |
| 238 | `9fef5092` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/so-lieu/page.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 239 | `87fccc3d` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/catalog/catalog-wizard-flow.tsx, file_over_350:src/components/catalog/landing-campaign-tab.tsx, file_over_350:src/components/profiles/sales-defaults-form.tsx; fixed later: file_over_350, prisma_outside_infra, route_without_guard, schema_without_migration; concern: secret — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 240 | `d8403446` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/bao-gia/page.tsx, file_over_350:src/modules/greeting-card/infra/greeting-card-repository.ts, file_over_350:src/modules/journey/domain/journey-catalog.ts, file_over_350:src/modules/products/infra/product-master-index-repository.ts; fixed later: any, file_over_350, route_without_guard, schema_without_migration — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 241 | `d4a72736` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 242 | `bec778db` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 243 | `2c62295f` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 244 | `bc496ced` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: route_without_guard, schema_without_migration; concern: src_without_tests); 78% of added lines live on in main and pass the HEAD gates (07) |
| 245 | `bf617a40` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 246 | `a4b6d5cc` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 247 | `d1a34a9b` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 1 added lines remain in main (0/1 files gone) |
| 248 | `29f59d22` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 1 added lines remain in main (0/1 files gone) |
| 249 | `8fbb354a` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 7 added lines remain in main (0/1 files gone) |
| 250 | `c5fc210d` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 251 | `0c56733e` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 252 | `0472b270` | TINH | VERIFIED | PASS | rule audit PASS; 40% of added lines live on in main and pass the HEAD gates (07) |
| 253 | `be20cc99` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: any, route_without_guard); 33% of added lines live on in main and pass the HEAD gates (07) |
| 254 | `d0f3bf0b` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: any:src/modules/storage/infra/trash-repository.ts, file_over_350:src/components/storage/account-storage-hub.tsx; fixed later: file_over_350, route_without_guard; concern: src_without_tests — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 255 | `00be2599` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: route_without_guard; concern: src_without_tests); 100% of added lines live on in main and pass the HEAD gates (07) |
| 256 | `b50cd6c4` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: route_without_guard; concern: src_without_tests); 100% of added lines live on in main and pass the HEAD gates (07) |
| 257 | `9dd715f3` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 258 | `ee51c491` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/greeting-card/infra/greeting-card-repository.ts; fixed later: file_over_350, route_without_guard — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 259 | `9041ac08` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 2% of 106 added lines remain in main (0/1 files gone) |
| 260 | `75ca83ad` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 261 | `193f5610` | TINH | VERIFIED | PASS | rule audit PASS; 94% of added lines live on in main and pass the HEAD gates (07) |
| 262 | `aeb90c24` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 263 | `0cd6ebdc` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/greeting-card/infra/greeting-card-repository.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 264 | `1161a0be` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/greeting-card/infra/greeting-card-repository.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 265 | `574985eb` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 266 | `3f73087e` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 267 | `09e82326` | TINH | VERIFIED | PASS | rule audit PASS; 87% of added lines live on in main and pass the HEAD gates (07) |
| 268 | `3e66e4df` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 269 | `7b3be3e8` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | no added code lines (deletions/renames/binary only) |
| 270 | `00394cc3` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: file_over_350); 64% of added lines live on in main and pass the HEAD gates (07) |
| 271 | `efd9f4db` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 272 | `de546aa7` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 273 | `9eb432f4` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/greeting-card/infra/greeting-card-repository.ts; fixed later: schema_without_migration — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 274 | `28b2f716` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 275 | `591bcaa6` | TINH | VERIFIED | PASS | rule audit PASS; 90% of added lines live on in main and pass the HEAD gates (07) |
| 276 | `e0af0a8b` | TINH | VERIFIED | PASS | rule audit PASS; 80% of added lines live on in main and pass the HEAD gates (07) |
| 277 | `eb3b8f19` | TINH | VERIFIED | PASS | rule audit PASS; 97% of added lines live on in main and pass the HEAD gates (07) |
| 278 | `27dd3630` | TINH | VERIFIED | PASS | rule audit PASS; 97% of added lines live on in main and pass the HEAD gates (07) |
| 279 | `8d2056fa` | TINH | VERIFIED | PASS | rule audit PASS; 84% of added lines live on in main and pass the HEAD gates (07) |
| 280 | `0e8c827f` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (concern: src_without_tests); 81% of added lines live on in main and pass the HEAD gates (07) |
| 281 | `877c3d36` | TINH | VERIFIED | PASS | rule audit PASS; 72% of added lines live on in main and pass the HEAD gates (07) |
| 282 | `6ccc7389` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: route_without_guard); 21% of added lines live on in main and pass the HEAD gates (07) |
| 283 | `ec2e9900` | TINH | VERIFIED | PASS | rule audit PASS; 56% of added lines live on in main and pass the HEAD gates (07) |
| 284 | `c30963a2` | TINH | VERIFIED | PASS | legacy merge with manual resolution (5662 lines vs auto-merge); no conflict markers left in tree |
| 285 | `77d9f4e6` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | no added code lines (deletions/renames/binary only) |
| 286 | `9bc19e92` | TINH | VERIFIED | PASS | rule audit PASS; 73% of added lines live on in main and pass the HEAD gates (07) |
| 287 | `67f4efe1` | TINH | VERIFIED | PASS | rule audit PASS; 85% of added lines live on in main and pass the HEAD gates (07) |
| 288 | `c5cf2057` | TINH | VERIFIED | PASS | rule audit PASS; 80% of added lines live on in main and pass the HEAD gates (07) |
| 289 | `e5ca5a34` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 290 | `48be556a` | TINH | VERIFIED | PASS | rule audit PASS; 72% of added lines live on in main and pass the HEAD gates (07) |
| 291 | `54870774` | TINH | VERIFIED | PASS | rule audit PASS; 77% of added lines live on in main and pass the HEAD gates (07) |
| 292 | `d1c3ba92` | TINH | VERIFIED | PASS | rule audit PASS; 16% of added lines live on in main and pass the HEAD gates (07) |
| 293 | `12ea6e12` | TINH | VERIFIED | PASS | rule audit PASS; 94% of added lines live on in main and pass the HEAD gates (07) |
| 294 | `46d267ba` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 295 | `89e433c6` | TINH | VERIFIED | PASS | rule audit PASS; 84% of added lines live on in main and pass the HEAD gates (07) |
| 296 | `75d846a1` | TINH | VERIFIED | PASS | legacy merge with manual resolution (1688 lines vs auto-merge); no conflict markers left in tree |
| 297 | `0c394afc` | TINH | VERIFIED | PASS | legacy merge with manual resolution (2654 lines vs auto-merge); no conflict markers left in tree |
| 298 | `6ce81da8` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/greeting-card/customer/templates/template-selector-split-pane.tsx, file_over_350:src/modules/greeting-card/infra/greeting-card-repository.ts; fixed later: route_without_guard — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 299 | `327ee275` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 300 | `1e7594c4` | TINH | VERIFIED | PASS | rule audit PASS; 83% of added lines live on in main and pass the HEAD gates (07) |
| 301 | `0b1d09c2` | TINH | VERIFIED | PASS | legacy merge with manual resolution (685 lines vs auto-merge); no conflict markers left in tree |
| 302 | `e8fcfc8a` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 303 | `08153877` | TINH | VERIFIED | PASS | rule audit PASS; 14% of added lines live on in main and pass the HEAD gates (07) |
| 304 | `4c6785f2` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 305 | `6b1513fb` | TINH | VERIFIED | PASS | rule audit PASS; 95% of added lines live on in main and pass the HEAD gates (07) |
| 306 | `c3cf6227` | TINH | VERIFIED | PASS | rule audit PASS; 88% of added lines live on in main and pass the HEAD gates (07) |
| 307 | `c0bd8c42` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 308 | `fe465871` | TINH | VERIFIED | PASS | rule audit PASS; 97% of added lines live on in main and pass the HEAD gates (07) |
| 309 | `db18ad29` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 310 | `085be970` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 311 | `0aade000` | TINH | VERIFIED | PASS | rule audit PASS; 92% of added lines live on in main and pass the HEAD gates (07) |
| 312 | `810f1180` | TINH | VERIFIED | PASS | rule audit PASS; 92% of added lines live on in main and pass the HEAD gates (07) |
| 313 | `36fd223a` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 314 | `0a3a4829` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 315 | `3806758f` | TINH | VERIFIED | PASS | rule audit PASS; 70% of added lines live on in main and pass the HEAD gates (07) |
| 316 | `c6a925dd` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 317 | `d5788fc5` | TINH | VERIFIED | PASS | rule audit PASS; 76% of added lines live on in main and pass the HEAD gates (07) |
| 318 | `5d8f0f88` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 319 | `cf0eb812` | TINH | VERIFIED | PASS | rule audit PASS; 55% of added lines live on in main and pass the HEAD gates (07) |
| 320 | `f11ca2d0` | TINH | VERIFIED | PASS | rule audit PASS; 78% of added lines live on in main and pass the HEAD gates (07) |
| 321 | `8e1cde9d` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: route_without_guard); 98% of added lines live on in main and pass the HEAD gates (07) |
| 322 | `e11bdf77` | TINH | VERIFIED | PASS | rule audit PASS; 72% of added lines live on in main and pass the HEAD gates (07) |
| 323 | `d153966f` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: schema_without_migration); 91% of added lines live on in main and pass the HEAD gates (07) |
| 324 | `451cb3dd` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: schema_without_migration); 94% of added lines live on in main and pass the HEAD gates (07) |
| 325 | `313aba02` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 326 | `1c139e24` | TINH | VERIFIED | PASS | rule audit PASS; 73% of added lines live on in main and pass the HEAD gates (07) |
| 327 | `781e8c16` | TINH | VERIFIED | PASS | rule audit PASS; 94% of added lines live on in main and pass the HEAD gates (07) |
| 328 | `de308304` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 329 | `4db22f8c` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 330 | `50d8dc91` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 331 | `0de9cf49` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 332 | `1ce79017` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 333 | `bad7340d` | TINH | VERIFIED | PASS | rule audit PASS; 68% of added lines live on in main and pass the HEAD gates (07) |
| 334 | `a4de75f8` | TINH | VERIFIED | PASS | rule audit PASS; 48% of added lines live on in main and pass the HEAD gates (07) |
| 335 | `2e978273` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 336 | `8fa6475a` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: schema_without_migration); 92% of added lines live on in main and pass the HEAD gates (07) |
| 337 | `5d8e36c2` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 338 | `4741fa30` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 339 | `a0164882` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 340 | `e9223e94` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: schema_without_migration); 82% of added lines live on in main and pass the HEAD gates (07) |
| 341 | `333c00ee` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 342 | `34cda00d` | TINH | VERIFIED | PASS | rule audit PASS; 87% of added lines live on in main and pass the HEAD gates (07) |
| 343 | `ecb5aa3c` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 344 | `1b60b7fb` | TINH | VERIFIED | PASS | rule audit PASS; 98% of added lines live on in main and pass the HEAD gates (07) |
| 345 | `ae13fbea` | TINH | VERIFIED | PASS | rule audit PASS; 56% of added lines live on in main and pass the HEAD gates (07) |
| 346 | `db74a28a` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 1 added lines remain in main (0/1 files gone) |
| 347 | `728bc2c5` | TINH | VERIFIED | PASS | rule audit PASS; 10% of added lines live on in main and pass the HEAD gates (07) |
| 348 | `58e8f02d` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 349 | `c70f665a` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 350 | `9d6bc282` | TINH | VERIFIED | PASS | rule audit PASS; 90% of added lines live on in main and pass the HEAD gates (07) |
| 351 | `fa50a97c` | TINH | VERIFIED | PASS | rule audit PASS; 95% of added lines live on in main and pass the HEAD gates (07) |
| 352 | `67d894a1` | TINH | VERIFIED | PASS | rule audit PASS; 81% of added lines live on in main and pass the HEAD gates (07) |
| 353 | `ae7f5ab0` | TINH | VERIFIED | PASS | rule audit PASS; 91% of added lines live on in main and pass the HEAD gates (07) |
| 354 | `49adb5bc` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 230 added lines remain in main (1/1 files gone) |
| 355 | `8711450c` | TINH | VERIFIED | PASS | rule audit PASS; 93% of added lines live on in main and pass the HEAD gates (07) |
| 356 | `fef23ac4` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 357 | `a987603a` | TINH | VERIFIED | PASS | rule audit PASS; 76% of added lines live on in main and pass the HEAD gates (07) |
| 358 | `4f1ef4b7` | TINH | VERIFIED | PASS | rule audit PASS; 80% of added lines live on in main and pass the HEAD gates (07) |
| 359 | `f1d1eb8b` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 360 | `da405e72` | TINH | VERIFIED | PASS | rule audit PASS; 84% of added lines live on in main and pass the HEAD gates (07) |
| 361 | `73579318` | TINH | VERIFIED | PASS | rule audit PASS; 94% of added lines live on in main and pass the HEAD gates (07) |
| 362 | `bc1745a9` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (concern: src_without_tests); 76% of added lines live on in main and pass the HEAD gates (07) |
| 363 | `c28703e5` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 364 | `4f7fb662` | TINH | VERIFIED | PASS | rule audit PASS; 83% of added lines live on in main and pass the HEAD gates (07) |
| 365 | `29af0436` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 366 | `f4ea57f7` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 367 | `ab74e54b` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 368 | `f7901f82` | TINH | VERIFIED | PASS | rule audit PASS; 93% of added lines live on in main and pass the HEAD gates (07) |
| 369 | `753217a8` | TINH | VERIFIED | PASS | rule audit PASS; 92% of added lines live on in main and pass the HEAD gates (07) |
| 370 | `b68f98db` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 371 | `f019ab9f` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 372 | `5b275608` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 373 | `ccbee5b7` | TINH | VERIFIED | PASS | rule audit PASS; 88% of added lines live on in main and pass the HEAD gates (07) |
| 374 | `86f34e97` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 375 | `345ba03c` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: file_over_350); 90% of added lines live on in main and pass the HEAD gates (07) |
| 376 | `f0eb8dcc` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: file_over_350); 32% of added lines live on in main and pass the HEAD gates (07) |
| 377 | `068840f8` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/greeting-card/customer/templates/template-selector-split-pane.tsx; fixed later: file_over_350 — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 378 | `17aeabcb` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/upload/upload-wizard.tsx; fixed later: file_over_350; concern: src_without_tests — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 379 | `1f217c9b` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: file_over_350); 27% of added lines live on in main and pass the HEAD gates (07) |
| 380 | `e0f4b49f` | TINH | VERIFIED | PASS | rule audit PASS; 97% of added lines live on in main and pass the HEAD gates (07) |
| 381 | `75ce7341` | TINH | VERIFIED | PASS | rule audit PASS; 91% of added lines live on in main and pass the HEAD gates (07) |
| 382 | `6a4d6fb4` | TINH | VERIFIED | PASS | rule audit PASS; 98% of added lines live on in main and pass the HEAD gates (07) |
| 383 | `5da82000` | TINH | VERIFIED | PASS | legacy merge with manual resolution (10 lines vs auto-merge); no conflict markers left in tree |
| 384 | `e3c2ccc9` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 385 | `d81328ca` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 386 | `f9cecfa6` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 387 | `88c7f6ce` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 388 | `91a4f38c` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 389 | `77ac4e65` | TINH | VERIFIED | PASS | rule audit PASS; 92% of added lines live on in main and pass the HEAD gates (07) |
| 390 | `5c15e070` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 391 | `2527b29a` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 392 | `9b4a54b4` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 393 | `66bc233a` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 394 | `90dce432` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 395 | `d1dbd69e` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: file_over_350, prisma_outside_infra, route_without_guard; concern: src_without_tests); 65% of added lines live on in main and pass the HEAD gates (07) |
| 396 | `c89245e7` | TINH | VERIFIED | PASS | rule audit PASS; 81% of added lines live on in main and pass the HEAD gates (07) |
| 397 | `06bad648` | TINH | VERIFIED | PASS | rule audit PASS; 86% of added lines live on in main and pass the HEAD gates (07) |
| 398 | `c0960d31` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 399 | `c40ead38` | TINH | VERIFIED | PASS | rule audit PASS; 71% of added lines live on in main and pass the HEAD gates (07) |
| 400 | `8e33bca8` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 401 | `09798a67` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 402 | `ec78f645` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 403 | `df78f4eb` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 404 | `32e9dfa3` | TINH | VERIFIED | PASS | rule audit PASS; 98% of added lines live on in main and pass the HEAD gates (07) |
| 405 | `c2a41d6a` | TINH | VERIFIED | PASS | rule audit PASS; 94% of added lines live on in main and pass the HEAD gates (07) |
| 406 | `8b41bb65` | TINH | VERIFIED | PASS | rule audit PASS; 94% of added lines live on in main and pass the HEAD gates (07) |
| 407 | `f8475d93` | TINH | VERIFIED | PASS | rule audit PASS; 90% of added lines live on in main and pass the HEAD gates (07) |
| 408 | `33e8fa22` | TINH | VERIFIED | PASS | rule audit PASS; 89% of added lines live on in main and pass the HEAD gates (07) |
| 409 | `aaa07455` | TINH | VERIFIED | PASS | rule audit PASS; 81% of added lines live on in main and pass the HEAD gates (07) |
| 410 | `e7327d0c` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 411 | `894d3b07` | TINH | VERIFIED | PASS | rule audit PASS; 74% of added lines live on in main and pass the HEAD gates (07) |
| 412 | `234bbb56` | TINH | VERIFIED | PASS | rule audit PASS; 95% of added lines live on in main and pass the HEAD gates (07) |
| 413 | `e0439a03` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: route_without_guard); 93% of added lines live on in main and pass the HEAD gates (07) |
| 414 | `267ac129` | TINH | VERIFIED | PASS | rule audit PASS; 95% of added lines live on in main and pass the HEAD gates (07) |
| 415 | `00df0c6c` | TINH | VERIFIED | PASS | legacy merge with manual resolution (151 lines vs auto-merge); no conflict markers left in tree |
| 416 | `e0a7449b` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 417 | `28e11a8a` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 418 | `71ecd1b4` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 419 | `a9fc2a39` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 420 | `6c74ae15` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 421 | `bf5c5e12` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 422 | `4f5bf853` | TINH | VERIFIED | PASS | rule audit PASS; 73% of added lines live on in main and pass the HEAD gates (07) |
| 423 | `424b8273` | TINH | VERIFIED | PASS | rule audit PASS; 82% of added lines live on in main and pass the HEAD gates (07) |
| 424 | `61d4d401` | TINH | VERIFIED | PASS | rule audit PASS; 50% of added lines live on in main and pass the HEAD gates (07) |
| 425 | `1c5ab6aa` | TINH | VERIFIED | PASS | rule audit PASS; 55% of added lines live on in main and pass the HEAD gates (07) |
| 426 | `a16ba788` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 427 | `79b544dc` | TINH | VERIFIED | PASS | rule audit PASS; 62% of added lines live on in main and pass the HEAD gates (07) |
| 428 | `3351dc95` | TINH | VERIFIED | PASS | rule audit PASS; 90% of added lines live on in main and pass the HEAD gates (07) |
| 429 | `26d8e083` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 1 added lines remain in main (0/1 files gone) |
| 430 | `584147f7` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 431 | `8bcaac1f` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 432 | `4eb878a2` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (concern: src_without_tests); 89% of added lines live on in main and pass the HEAD gates (07) |
| 433 | `bd382322` | TINH | VERIFIED | PASS | rule audit PASS; 97% of added lines live on in main and pass the HEAD gates (07) |
| 434 | `9d16f966` | TINH | VERIFIED | PASS | rule audit PASS; 82% of added lines live on in main and pass the HEAD gates (07) |
| 435 | `6d64f3f7` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 436 | `d1f5d284` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 437 | `5f81032e` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 438 | `45d6aa45` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 439 | `ca4fc888` | TINH | VERIFIED | PASS | rule audit PASS; 87% of added lines live on in main and pass the HEAD gates (07) |
| 440 | `fcdacea6` | TINH | VERIFIED | PASS | legacy merge with manual resolution (6 lines vs auto-merge); no conflict markers left in tree |
| 441 | `3be9eb82` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 442 | `7a5213f4` | TINH | VERIFIED | PASS | rule audit PASS; 99% of added lines live on in main and pass the HEAD gates (07) |
| 443 | `bc3a524f` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: file_over_350); 64% of added lines live on in main and pass the HEAD gates (07) |
| 444 | `1421b114` | TINH | VERIFIED | PASS | rule audit PASS; 89% of added lines live on in main and pass the HEAD gates (07) |
| 445 | `9327d9de` | TINH | VERIFIED | PASS | rule audit PASS; 81% of added lines live on in main and pass the HEAD gates (07) |
| 446 | `eeee284c` | TINH | VERIFIED | PASS | rule audit PASS; 40% of added lines live on in main and pass the HEAD gates (07) |
| 447 | `4617e70e` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 448 | `18be3f3d` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 449 | `c80b5c1a` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 450 | `aaa58d77` | TINH | VERIFIED | PASS | rule audit PASS; 83% of added lines live on in main and pass the HEAD gates (07) |
| 451 | `ad428c96` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/products/product-filter-types.ts, file_over_350:src/components/products/product-search-filter-bar.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 452 | `10b9262d` | TINH | VERIFIED | PASS | rule audit PASS; 83% of added lines live on in main and pass the HEAD gates (07) |
| 453 | `82012584` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 454 | `a18e391e` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 455 | `1ffb9996` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 456 | `f4248a31` | TINH | VERIFIED | PASS | rule audit PASS; 90% of added lines live on in main and pass the HEAD gates (07) |
| 457 | `5e8a9543` | TINH | VERIFIED | PASS | rule audit PASS; 78% of added lines live on in main and pass the HEAD gates (07) |
| 458 | `5ba5ff4f` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 459 | `e2f2b91b` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 460 | `49b2e4d9` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 1 added lines remain in main (0/1 files gone) |
| 461 | `e6ce51f2` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 462 | `361ff2b0` | TINH | VERIFIED | PASS | rule audit PASS; 77% of added lines live on in main and pass the HEAD gates (07) |
| 463 | `80dc89a0` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 464 | `661fcd92` | TINH | VERIFIED | PASS | rule audit PASS; 92% of added lines live on in main and pass the HEAD gates (07) |
| 465 | `1350a994` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (concern: secret, src_without_tests); 89% of added lines live on in main and pass the HEAD gates (07) |
| 466 | `d842cbba` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 467 | `2cc5eae8` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 468 | `117dddcc` | TINH | VERIFIED | PASS | rule audit PASS; 99% of added lines live on in main and pass the HEAD gates (07) |
| 469 | `6a9ed37b` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 470 | `a264848a` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (concern: src_without_tests); 79% of added lines live on in main and pass the HEAD gates (07) |
| 471 | `718b3171` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 472 | `65b09dbe` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (concern: src_without_tests); 97% of added lines live on in main and pass the HEAD gates (07) |
| 473 | `2eba07d4` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 474 | `65cc6545` | TINH | VERIFIED | PASS | rule audit PASS; 71% of added lines live on in main and pass the HEAD gates (07) |
| 475 | `011888a7` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 476 | `a9b63f63` | TINH | VERIFIED | PASS | rule audit PASS; 92% of added lines live on in main and pass the HEAD gates (07) |
| 477 | `217bc430` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 478 | `448306d1` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/journey/domain/journey-catalog.ts; fixed later: file_over_350; concern: src_without_tests — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 479 | `21b2bed3` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 480 | `2ec9d43f` | TINH | VERIFIED | PASS | rule audit PASS; 95% of added lines live on in main and pass the HEAD gates (07) |
| 481 | `0a47a8be` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 482 | `363ec118` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 483 | `3d91dc8a` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | no added code lines (deletions/renames/binary only) |
| 484 | `bad3499c` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: prisma_outside_infra); 92% of added lines live on in main and pass the HEAD gates (07) |
| 485 | `cb471c02` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 486 | `91859932` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 487 | `de8f9071` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 488 | `22a1177d` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 489 | `3b974534` | TINH | VERIFIED | PASS | rule audit PASS; 85% of added lines live on in main and pass the HEAD gates (07) |
| 490 | `db416ef6` | TINH | VERIFIED | PASS | rule audit PASS; 76% of added lines live on in main and pass the HEAD gates (07) |
| 491 | `e92f34ea` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 492 | `7177466f` | TINH | VERIFIED | PASS | rule audit PASS; 89% of added lines live on in main and pass the HEAD gates (07) |
| 493 | `2c10a6ff` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 494 | `b4ec36f9` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: file_over_350); 62% of added lines live on in main and pass the HEAD gates (07) |
| 495 | `1db8704d` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 496 | `69ee531d` | TINH | VERIFIED | PASS | rule audit PASS; 53% of added lines live on in main and pass the HEAD gates (07) |
| 497 | `66288e8a` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 498 | `73c60991` | TINH | VERIFIED | PASS | rule audit PASS; 62% of added lines live on in main and pass the HEAD gates (07) |
| 499 | `360d6dc3` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (concern: src_without_tests); 90% of added lines live on in main and pass the HEAD gates (07) |
| 500 | `a83452cb` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 501 | `f0641a90` | TINH | VERIFIED | PASS | rule audit PASS; 96% of added lines live on in main and pass the HEAD gates (07) |
| 502 | `5565f9f8` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 503 | `4719ba28` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 504 | `f8db4a7d` | TINH | VERIFIED | PASS | rule audit PASS; 12% of added lines live on in main and pass the HEAD gates (07) |
| 505 | `a4b16af2` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: schema_without_migration); 83% of added lines live on in main and pass the HEAD gates (07) |
| 506 | `9e8c1c5b` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 507 | `77128318` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 508 | `9145aced` | TINH | VERIFIED | PASS | rule audit PASS; 50% of added lines live on in main and pass the HEAD gates (07) |
| 509 | `f5621dd3` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 510 | `8b9a30e2` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (concern: src_without_tests); 44% of added lines live on in main and pass the HEAD gates (07) |
| 511 | `20076628` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (concern: src_without_tests); 48% of added lines live on in main and pass the HEAD gates (07) |
| 512 | `25ec09bb` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/products/product-filter-types.ts — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 513 | `2b120a55` | TINH | VERIFIED | PASS | rule audit PASS; 47% of added lines live on in main and pass the HEAD gates (07) |
| 514 | `08470e36` | TINH | VERIFIED | PASS | rule audit PASS; 88% of added lines live on in main and pass the HEAD gates (07) |
| 515 | `58faa029` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: file_over_350); 56% of added lines live on in main and pass the HEAD gates (07) |
| 516 | `12251bb0` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 517 | `e719f3df` | TINH | VERIFIED | PASS | rule audit PASS; 85% of added lines live on in main and pass the HEAD gates (07) |
| 518 | `78479166` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: any); 81% of added lines live on in main and pass the HEAD gates (07) |
| 519 | `27d56e7b` | TINH | VERIFIED | PASS | rule audit PASS; 73% of added lines live on in main and pass the HEAD gates (07) |
| 520 | `5a76493f` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: route_without_guard); 82% of added lines live on in main and pass the HEAD gates (07) |
| 521 | `09565804` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 62 added lines remain in main (0/1 files gone) |
| 522 | `644892a2` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: file_over_350); 93% of added lines live on in main and pass the HEAD gates (07) |
| 523 | `d243927e` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | no added code lines (deletions/renames/binary only) |
| 524 | `82fb24df` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/coordinator/control-tower-dashboard.tsx, file_over_350:src/components/templates/coordinator/florist-job-card.tsx, file_over_350:src/modules/coordinator/use-cases/operations.ts; fixed later: file_over_350; concern: src_without_tests — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 525 | `defd6270` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: file_over_350); 96% of added lines live on in main and pass the HEAD gates (07) |
| 526 | `613afb3f` | TINH | VERIFIED | PASS | rule audit PASS; 100% of added lines live on in main and pass the HEAD gates (07) |
| 527 | `91ce4e7f` | TINH | VERIFIED | PASS | rule audit PASS; 87% of added lines live on in main and pass the HEAD gates (07) |
| 528 | `898738c6` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/modules/greeting-card/infra/greeting-card-repository.ts; fixed later: file_over_350 — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 529 | `f4fb1dc2` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/app/(app)/tai-anh/page.tsx — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 530 | `1a82a702` | TINH | VERIFIED | PASS | rule audit PASS; 92% of added lines live on in main and pass the HEAD gates (07) |
| 531 | `6517c8f6` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: file_over_350); 45% of added lines live on in main and pass the HEAD gates (07) |
| 532 | `5fa93244` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (concern: src_without_tests); 39% of added lines live on in main and pass the HEAD gates (07) |
| 533 | `1cc3f3c9` | TINH | VERIFIED | PASS | rule audit PASS; 67% of added lines live on in main and pass the HEAD gates (07) |
| 534 | `dcb460c0` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 2% of 62 added lines remain in main (0/1 files gone) |
| 535 | `6d772748` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 70 added lines remain in main (0/1 files gone) |
| 536 | `d90f8c67` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 4% of 57 added lines remain in main (0/1 files gone) |
| 537 | `1525b335` | TINH | FIX_REQUIRED | FAIL | rule audit: still at HEAD: file_over_350:src/components/greeting-card/catalog/catalog-product-picker.tsx; concern: src_without_tests — tracked as AUD-034 (pre-existing oversized files / `any` within ratchet baseline) |
| 538 | `e245aa3e` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (concern: src_without_tests); 54% of added lines live on in main and pass the HEAD gates (07) |
| 539 | `268d03b1` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: file_over_350; concern: src_without_tests); 64% of added lines live on in main and pass the HEAD gates (07) |
| 540 | `dd4c781e` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: file_over_350; concern: src_without_tests); 71% of added lines live on in main and pass the HEAD gates (07) |
| 541 | `076bab87` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: file_over_350; concern: src_without_tests); 76% of added lines live on in main and pass the HEAD gates (07) |
| 542 | `7bc06352` | TINH | VERIFIED | PASS | rule audit PASS; 87% of added lines live on in main and pass the HEAD gates (07) |
| 543 | `7f6c8f8c` | TINH | VERIFIED | PASS_WITH_CONCERNS | rule audit PASS_WITH_CONCERNS (fixed later: file_over_350); 63% of added lines live on in main and pass the HEAD gates (07) |
| 544 | `9776fe85` | UPB | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 545 | `c8cd41f3` | UPB | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 546 | `f216d1f2` | UPB | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 547 | `407f454a` | UPB | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 548 | `805c8fbe` | UPB | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 549 | `e4b6246d` | UPB | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 550 | `507ab590` | UPB | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 551 | `2664eadc` | UPB | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 552 | `44dacbaf` | UPB | VERIFIED | PASS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 553 | `a99c9617` | UPB | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 554 | `a1b61be1` | UPB | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 555 | `800183b5` | UPB | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 556 | `ef1914fb` | UPB | VERIFIED | PASS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 557 | `721b8179` | UPB | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 558 | `ddda38f3` | UPB | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 559 | `b4858c21` | UPB | NOT_APPLICABLE | NOT_APPLICABLE (docs) | NOT_APPLICABLE (docs) |
| 560 | `5fbc6df7` | UPB | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 561 | `ccb2059a` | UPB | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 562 | `869a97bb` | UPB | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 563 | `ffb1d587` | DTORCH | VERIFIED | PASS | applied on the release branch (ee616eec, PO approved 28/10); typecheck/unit/build/worker pytest green |
| 564 | `4ad5628b` | DTV | VERIFIED | PASS | applied on the release branch (ee616eec, PO approved 28/10); typecheck/unit/build/worker pytest green |
| 565 | `151585e5` | DTIMM | VERIFIED | PASS | applied on the release branch (ee616eec, PO approved 28/10); typecheck/unit/build/worker pytest green |
| 566 | `22e76e31` | DNPM | VERIFIED | PASS | applied on the release branch (ee616eec, PO approved 28/10); typecheck/unit/build/worker pytest green |
| 567 | `fe0d74aa` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 568 | `e7545157` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 569 | `cc937f20` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 570 | `610b1711` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 571 | `39803b71` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 572 | `21e1a08b` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 573 | `198f7b3a` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 574 | `46bd3e95` | INT | VERIFIED | PASS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 575 | `cd858f2c` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 576 | `20f155c7` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 577 | `0a64ae02` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 578 | `f0dce714` | INT | NOT_APPLICABLE | NOT_APPLICABLE (docs) | NOT_APPLICABLE (docs) |
| 579 | `307ab6fa` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 580 | `0cf2b2f3` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 581 | `6b8d284f` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 582 | `f4154e3a` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 583 | `05c46b24` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 584 | `4b38648a` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 585 | `267944f1` | INT | VERIFIED | PASS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 586 | `5def12db` | INT | FIXED | FAIL | AUD-017 fixed; AUD-005 (entitlement display-only) open — feature-scope decision |
| 587 | `8492c065` | INT | FIXED | FAIL | AUD-004 a–d + AUD-025 fixed (61859c8f, b4eba228); AUD-026 modal a11y open |
| 588 | `f6ca2782` | INT | FIXED | FAIL | AUD-002/003/014/015/016 fixed; AUD-007 (no producer) and AUD-008 (index) open |
| 589 | `405f15cf` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 590 | `6d87a403` | INT | VERIFIED | PASS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 591 | `87c8b675` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 592 | `9bb7cc80` | INT | VERIFIED | PASS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 593 | `7c3f0585` | INT | VERIFIED | PASS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 594 | `c6b2a4c2` | INT | VERIFIED | PASS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 595 | `666b370d` | INT | VERIFIED | PASS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 596 | `4fcd5a7c` | INT | VERIFIED | PASS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 597 | `f56024ca` | INT | NOT_APPLICABLE | NOT_APPLICABLE (docs) | NOT_APPLICABLE (docs) |
| 598 | `99db1dfc` | INT | FIX_REQUIRED | FAIL | AUD-006, AUD-011 |
| 599 | `83fd26ce` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 600 | `cebcb057` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 601 | `db9592b9` | INT | VERIFIED | PASS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 602 | `4bb56239` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 603 | `383b4f3f` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 604 | `52cd3477` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 605 | `d279148c` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 606 | `0c6a5c5f` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 607 | `0968c691` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 608 | `0625c8e1` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 609 | `086c1e3a` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 610 | `ec71f9b7` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 611 | `e0b8008b` | INT | VERIFIED | PASS_WITH_CONCERNS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 612 | `36f80373` | INT | VERIFIED | PASS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |
| 613 | `d4212e74` | INT | VERIFIED | PASS | manual diff review (03) + all gates at HEAD 61859c8f/3a6477fa: 0 new failures vs main incl. E2E (07) |

# 02 — Audit progress ledger

Statuses: NOT_STARTED · IN_REVIEW · REVIEWED · FIX_REQUIRED · FIXED · VERIFIED · BLOCKED · NOT_APPLICABLE. Any status other than VERIFIED needs a reason.

## Checkpoint (2026-10-28)

- CURRENT lineage (70): 53 non-merge statically reviewed (`03` §A–C); 17 merge commits VERIFIED via `--remerge-diff` (no manual resolution); line-by-line pass 2 done for all integration server files + API-calling UI; gates running.
- LEGACY (543, `TINH`): NOT_STARTED — resume here, batch 01.
- Review order is CURRENT first, LEGACY second (see `03`); inventory order is unchanged.

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
| 1 | `15508f97` | TINH | IN_REVIEW | — | 68% of 1999 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 2 | `b1a8be69` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | no added code lines (deletions/renames/binary only) |
| 3 | `a747ba39` | TINH | IN_REVIEW | — | 50% of 8 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 4 | `d2d7a5b0` | TINH | IN_REVIEW | — | 88% of 74 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 5 | `edbf1d34` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 81 added lines remain in main (1/1 files gone) |
| 6 | `5e510988` | TINH | IN_REVIEW | — | 86% of 1523 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 7 | `e0fb4310` | TINH | IN_REVIEW | — | 67% of 39 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 8 | `c44378c2` | TINH | IN_REVIEW | — | 29% of 66 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 9 | `a2a9ea46` | TINH | IN_REVIEW | — | 65% of 192 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 10 | `f4c52cb1` | TINH | IN_REVIEW | — | 93% of 9703 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 11 | `35482a30` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 7 added lines remain in main (0/1 files gone) |
| 12 | `799aedc0` | TINH | IN_REVIEW | — | 91% of 1738 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 13 | `9e579c26` | TINH | IN_REVIEW | — | 92% of 1563 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 14 | `4efcb7fd` | TINH | IN_REVIEW | — | 31% of 88 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 15 | `d614224e` | TINH | IN_REVIEW | — | 86% of 1883 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 16 | `24f1049c` | TINH | IN_REVIEW | — | 50% of 68 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 17 | `f4eaca40` | TINH | IN_REVIEW | — | 82% of 67 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 18 | `c711a63b` | TINH | IN_REVIEW | — | 68% of 34 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 19 | `89808fcb` | TINH | IN_REVIEW | — | 78% of 582 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 20 | `f870894b` | TINH | IN_REVIEW | — | 56% of 36 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 21 | `7cf2472d` | TINH | IN_REVIEW | — | 95% of 5708 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 22 | `c113ba8e` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 1 added lines remain in main (0/1 files gone) |
| 23 | `8188b979` | TINH | IN_REVIEW | — | 100% of 10 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 24 | `27a44c77` | TINH | IN_REVIEW | — | 16% of 32 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 25 | `02c03f35` | TINH | IN_REVIEW | — | 93% of 1370 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 26 | `2607e921` | TINH | IN_REVIEW | — | 64% of 25 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 27 | `fda830f2` | TINH | IN_REVIEW | — | 91% of 1064 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 28 | `828c2263` | TINH | IN_REVIEW | — | 94% of 746 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 29 | `3493cf10` | TINH | IN_REVIEW | — | 80% of 5 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 30 | `868d8c8f` | TINH | IN_REVIEW | — | 94% of 478 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 31 | `fedc72fb` | TINH | IN_REVIEW | — | 100% of 11 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 32 | `65e055a6` | TINH | IN_REVIEW | — | 58% of 26 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 33 | `c7898025` | TINH | IN_REVIEW | — | 97% of 911 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 34 | `71772ba3` | TINH | IN_REVIEW | — | 100% of 73 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 35 | `7e49eb7a` | TINH | IN_REVIEW | — | 17% of 6 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 36 | `3e69864d` | TINH | IN_REVIEW | — | 100% of 27 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 37 | `cedea04e` | TINH | IN_REVIEW | — | 100% of 109 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 38 | `ab794499` | TINH | IN_REVIEW | — | 65% of 31 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 39 | `5f1ab7c3` | TINH | IN_REVIEW | — | 99% of 461 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 40 | `65eab93f` | TINH | IN_REVIEW | — | 93% of 570 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 41 | `f14cd9f6` | TINH | IN_REVIEW | — | 81% of 528 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 42 | `89ef4bda` | TINH | IN_REVIEW | — | 99% of 292 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 43 | `4826dddb` | TINH | IN_REVIEW | — | 100% of 16 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 44 | `23c22999` | TINH | IN_REVIEW | — | 60% of 1836 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 45 | `d55bf2b6` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 131 added lines remain in main (1/1 files gone) |
| 46 | `e37e5afb` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 39 added lines remain in main (1/1 files gone) |
| 47 | `6e33b751` | TINH | IN_REVIEW | — | 14% of 14 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 48 | `dd6b35fc` | TINH | IN_REVIEW | — | 100% of 49 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 49 | `3769beee` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 1 added lines remain in main (0/1 files gone) |
| 50 | `7b5ee35f` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 6 added lines remain in main (0/1 files gone) |
| 51 | `75eb0765` | TINH | IN_REVIEW | — | 97% of 77 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 52 | `46168f59` | TINH | IN_REVIEW | — | 100% of 7 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 53 | `eac8b40a` | TINH | IN_REVIEW | — | 81% of 62 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 54 | `1ee1079d` | TINH | IN_REVIEW | — | 85% of 13 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 55 | `2cfd0a59` | TINH | IN_REVIEW | — | 100% of 1 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 56 | `5ef16658` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 109 added lines remain in main (1/1 files gone) |
| 57 | `7ce52e7f` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 4 added lines remain in main (1/1 files gone) |
| 58 | `33648060` | TINH | IN_REVIEW | — | 54% of 2053 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 59 | `09ec845f` | TINH | IN_REVIEW | — | 97% of 6199 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 60 | `03efa98b` | TINH | IN_REVIEW | — | 59% of 287 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 61 | `902ea351` | TINH | IN_REVIEW | — | 92% of 4199 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 62 | `9280acb5` | TINH | IN_REVIEW | — | 99% of 484 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 63 | `afb1ca63` | TINH | IN_REVIEW | — | 43% of 7 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 64 | `aba0b534` | TINH | IN_REVIEW | — | 90% of 154 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 65 | `634c7cf0` | TINH | IN_REVIEW | — | 87% of 82 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 66 | `228967d3` | TINH | IN_REVIEW | — | 29% of 7 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 67 | `3523566d` | TINH | IN_REVIEW | — | 96% of 342 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 68 | `1df21b57` | TINH | IN_REVIEW | — | 100% of 75 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 69 | `d4fbfe4f` | TINH | IN_REVIEW | — | 96% of 131 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 70 | `b323484d` | TINH | IN_REVIEW | — | 100% of 34 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 71 | `ac795139` | TINH | IN_REVIEW | — | 100% of 188 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 72 | `4dc8e907` | TINH | IN_REVIEW | — | 98% of 53 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 73 | `9b6a272c` | TINH | IN_REVIEW | — | 89% of 535 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 74 | `81375c20` | TINH | IN_REVIEW | — | 100% of 106 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 75 | `3c7318fe` | TINH | IN_REVIEW | — | 100% of 1 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 76 | `9ae772be` | TINH | IN_REVIEW | — | 69% of 482 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 77 | `25e1fe65` | TINH | IN_REVIEW | — | 100% of 2 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 78 | `93fcf25c` | TINH | IN_REVIEW | — | 25% of 24 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 79 | `6ab393d0` | TINH | IN_REVIEW | — | 89% of 76 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 80 | `94d11656` | TINH | IN_REVIEW | — | 100% of 4 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 81 | `e48a75c0` | TINH | IN_REVIEW | — | 39% of 1677 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 82 | `b954142f` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 252 added lines remain in main (1/2 files gone) |
| 83 | `23960413` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 335 added lines remain in main (1/1 files gone) |
| 84 | `26268714` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 253 added lines remain in main (1/1 files gone) |
| 85 | `1760f598` | TINH | IN_REVIEW | — | 91% of 117 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 86 | `8418b568` | TINH | IN_REVIEW | — | 99% of 264 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 87 | `9c9893d6` | TINH | IN_REVIEW | — | 100% of 1 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 88 | `f983f8e6` | TINH | IN_REVIEW | — | 95% of 19 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 89 | `1aaf78e1` | TINH | IN_REVIEW | — | 100% of 1 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 90 | `d508a688` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 7% of 207 added lines remain in main (2/13 files gone) |
| 91 | `d6d9e590` | TINH | IN_REVIEW | — | 87% of 52 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 92 | `49d4882a` | TINH | IN_REVIEW | — | 24% of 17 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 93 | `fab18eca` | TINH | IN_REVIEW | — | 100% of 10 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 94 | `776cc10d` | TINH | IN_REVIEW | — | 95% of 115 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 95 | `3c8939d1` | TINH | IN_REVIEW | — | 95% of 20 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 96 | `98c64695` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 44 added lines remain in main (1/1 files gone) |
| 97 | `0280d1f9` | TINH | IN_REVIEW | — | 86% of 3080 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 98 | `0559ae0e` | TINH | IN_REVIEW | — | 73% of 22 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 99 | `b23de19a` | TINH | IN_REVIEW | — | 83% of 13035 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 100 | `cee5ae7a` | TINH | IN_REVIEW | — | 84% of 139 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 101 | `445af50b` | TINH | IN_REVIEW | — | 75% of 2866 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 102 | `98288bbc` | TINH | IN_REVIEW | — | 96% of 24 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 103 | `1177b441` | TINH | IN_REVIEW | — | 100% of 34 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 104 | `cbb66682` | TINH | IN_REVIEW | — | 35% of 1706 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 105 | `0e45d6fe` | TINH | IN_REVIEW | — | 80% of 3621 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 106 | `b6c53340` | TINH | IN_REVIEW | — | 100% of 4 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 107 | `609908b0` | TINH | IN_REVIEW | — | 74% of 2477 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 108 | `0a4f531d` | TINH | IN_REVIEW | — | 87% of 4138 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 109 | `7fcd93da` | TINH | IN_REVIEW | — | 62% of 1001 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 110 | `5c7d9f45` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 1 added lines remain in main (0/1 files gone) |
| 111 | `59536a73` | TINH | IN_REVIEW | — | 87% of 12469 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 112 | `8d2fd45d` | TINH | IN_REVIEW | — | 80% of 2111 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 113 | `ee61a610` | TINH | IN_REVIEW | — | 88% of 260 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 114 | `8b3c9a69` | TINH | IN_REVIEW | — | 80% of 1011 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 115 | `1b782c46` | TINH | IN_REVIEW | — | 92% of 86 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 116 | `b540bfb3` | TINH | IN_REVIEW | — | 98% of 297 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 117 | `af211251` | TINH | IN_REVIEW | — | 13% of 1279 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 118 | `ae2b8645` | TINH | IN_REVIEW | — | 89% of 438 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 119 | `f83b1e53` | TINH | IN_REVIEW | — | 96% of 684 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 120 | `44da6fa7` | TINH | IN_REVIEW | — | 84% of 1870 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 121 | `921b4243` | TINH | IN_REVIEW | — | 99% of 2684 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 122 | `2d5da520` | TINH | IN_REVIEW | — | 100% of 417 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 123 | `f2e19ee5` | TINH | IN_REVIEW | — | 88% of 1149 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 124 | `3cd91ccc` | TINH | IN_REVIEW | — | 71% of 10322 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 125 | `780b78ef` | TINH | IN_REVIEW | — | 94% of 16 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 126 | `6ef487a9` | TINH | IN_REVIEW | — | 100% of 41 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 127 | `9a0a3241` | TINH | IN_REVIEW | — | 60% of 1329 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 128 | `085b6677` | TINH | IN_REVIEW | — | 66% of 1920 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 129 | `0ac3f3da` | TINH | IN_REVIEW | — | 86% of 56 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 130 | `2ad6d3d4` | TINH | IN_REVIEW | — | 87% of 438 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 131 | `cf733740` | TINH | IN_REVIEW | — | 67% of 427 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 132 | `89a1c222` | TINH | IN_REVIEW | — | 72% of 178 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 133 | `5d22bd18` | TINH | IN_REVIEW | — | 100% of 1 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 134 | `89af2061` | TINH | IN_REVIEW | — | 38% of 1878 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 135 | `6660d251` | TINH | IN_REVIEW | — | 99% of 2852 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 136 | `1887e9be` | TINH | IN_REVIEW | — | 92% of 1152 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 137 | `ae7db911` | TINH | IN_REVIEW | — | 80% of 3102 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 138 | `e2a6c58e` | TINH | IN_REVIEW | — | 50% of 331 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 139 | `e7e801b8` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 6% of 959 added lines remain in main (0/4 files gone) |
| 140 | `789626c5` | TINH | IN_REVIEW | — | 65% of 594 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 141 | `de0944f9` | TINH | IN_REVIEW | — | 100% of 11 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 142 | `e39735c2` | TINH | IN_REVIEW | — | 54% of 24 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 143 | `368077d6` | TINH | IN_REVIEW | — | 100% of 1 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 144 | `0835c198` | TINH | IN_REVIEW | — | 78% of 10429 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 145 | `7522378a` | TINH | IN_REVIEW | — | 82% of 4103 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 146 | `c3908556` | TINH | IN_REVIEW | — | 64% of 139 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 147 | `462e5863` | TINH | IN_REVIEW | — | 83% of 63 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 148 | `99701520` | TINH | IN_REVIEW | — | 47% of 66 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 149 | `126e1150` | TINH | IN_REVIEW | — | 89% of 1305 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 150 | `e50ddbf9` | TINH | IN_REVIEW | — | 88% of 131 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 151 | `db9ac47f` | TINH | IN_REVIEW | — | 57% of 49 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 152 | `8ac6dbc9` | TINH | IN_REVIEW | — | 100% of 1 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 153 | `f8bcdfff` | TINH | IN_REVIEW | — | 67% of 18 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 154 | `c60779e7` | TINH | IN_REVIEW | — | 57% of 7 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 155 | `b4ac3dad` | TINH | IN_REVIEW | — | 78% of 27 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 156 | `08399de4` | TINH | IN_REVIEW | — | 100% of 9 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 157 | `cfde7522` | TINH | IN_REVIEW | — | 99% of 91 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 158 | `beb7da82` | TINH | IN_REVIEW | — | 81% of 237 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 159 | `61d66b6f` | TINH | IN_REVIEW | — | 92% of 183 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 160 | `8f87929a` | TINH | IN_REVIEW | — | 92% of 26 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 161 | `7eafb484` | TINH | IN_REVIEW | — | 100% of 42 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 162 | `590f2715` | TINH | IN_REVIEW | — | 57% of 54 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 163 | `03b2e09b` | TINH | IN_REVIEW | — | 84% of 372 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 164 | `5d22645a` | TINH | IN_REVIEW | — | 84% of 335 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 165 | `c23b4bb1` | TINH | IN_REVIEW | — | 75% of 4 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 166 | `e27603de` | TINH | IN_REVIEW | — | 89% of 106 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 167 | `9ceeab52` | TINH | IN_REVIEW | — | 94% of 1072 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 168 | `e846f746` | TINH | IN_REVIEW | — | 96% of 26 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 169 | `6eed51d8` | TINH | IN_REVIEW | — | 93% of 274 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 170 | `0c9ef44e` | TINH | IN_REVIEW | — | 85% of 78 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 171 | `27216cbf` | TINH | IN_REVIEW | — | 91% of 2878 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 172 | `17accc33` | TINH | IN_REVIEW | — | 89% of 763 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 173 | `2ae7ba87` | TINH | IN_REVIEW | — | 98% of 225 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 174 | `e2ebdefb` | TINH | IN_REVIEW | — | 84% of 962 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 175 | `bb3e1c27` | TINH | IN_REVIEW | — | 84% of 70 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 176 | `76af7299` | TINH | IN_REVIEW | — | 79% of 34 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 177 | `2b1d2b48` | TINH | IN_REVIEW | — | 91% of 669 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 178 | `f6d7e109` | TINH | IN_REVIEW | — | 75% of 180 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 179 | `28ade7b8` | TINH | IN_REVIEW | — | 98% of 185 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 180 | `11a8506e` | TINH | IN_REVIEW | — | 99% of 152 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 181 | `2fb15eec` | TINH | IN_REVIEW | — | 36% of 28 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 182 | `fa9f0ac0` | TINH | IN_REVIEW | — | 99% of 7865 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 183 | `f1193f60` | TINH | IN_REVIEW | — | 100% of 15 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 184 | `89afab47` | TINH | IN_REVIEW | — | 97% of 72 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 185 | `b9a2e03a` | TINH | IN_REVIEW | — | 96% of 303 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 186 | `af4d6abf` | TINH | IN_REVIEW | — | 96% of 217 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 187 | `a82cf6ba` | TINH | IN_REVIEW | — | 100% of 5 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 188 | `ef9a99ca` | TINH | IN_REVIEW | — | 91% of 437 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 189 | `9c5a1b60` | TINH | IN_REVIEW | — | 97% of 87 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 190 | `090c312a` | TINH | IN_REVIEW | — | 93% of 42 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 191 | `b82eb13e` | TINH | IN_REVIEW | — | 100% of 51 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 192 | `72c910e3` | TINH | IN_REVIEW | — | 96% of 168 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 193 | `4097489b` | TINH | IN_REVIEW | — | 96% of 1006 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 194 | `bb6e761b` | TINH | IN_REVIEW | — | 97% of 1070 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 195 | `e96d8b8a` | TINH | IN_REVIEW | — | 97% of 1020 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 196 | `7fd415be` | TINH | IN_REVIEW | — | 99% of 1574 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 197 | `a52cabe9` | TINH | IN_REVIEW | — | 76% of 13171 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 198 | `11e42633` | TINH | IN_REVIEW | — | 94% of 6164 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 199 | `a4179e9a` | TINH | IN_REVIEW | — | 96% of 2113 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 200 | `5e49efa2` | TINH | IN_REVIEW | — | 89% of 411 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 201 | `edf16e9e` | TINH | IN_REVIEW | — | 100% of 7 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 202 | `a1de3be1` | TINH | IN_REVIEW | — | 100% of 11 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 203 | `0a26672a` | TINH | IN_REVIEW | — | 91% of 662 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 204 | `07738c75` | TINH | IN_REVIEW | — | 100% of 194 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 205 | `e8fe2362` | TINH | IN_REVIEW | — | 96% of 419 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 206 | `df04ed3e` | TINH | IN_REVIEW | — | 92% of 923 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 207 | `78b9d032` | TINH | IN_REVIEW | — | 100% of 16 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 208 | `353f27f2` | TINH | IN_REVIEW | — | 97% of 1056 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 209 | `8e0177a5` | TINH | IN_REVIEW | — | 99% of 546 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 210 | `d48b1bd4` | TINH | IN_REVIEW | — | 99% of 731 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 211 | `a924a108` | TINH | IN_REVIEW | — | 99% of 459 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 212 | `4e539845` | TINH | IN_REVIEW | — | 96% of 133 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 213 | `835b6ed3` | TINH | IN_REVIEW | — | 93% of 18600 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 214 | `6bb81691` | TINH | IN_REVIEW | — | 96% of 23 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 215 | `f50a7aaa` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 10 added lines remain in main (0/1 files gone) |
| 216 | `2be4a4ce` | TINH | IN_REVIEW | — | 98% of 5527 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 217 | `f1000da0` | TINH | IN_REVIEW | — | 93% of 239 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 218 | `91d53d3a` | TINH | IN_REVIEW | — | 96% of 619 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 219 | `f0e6a181` | TINH | IN_REVIEW | — | 72% of 285 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 220 | `62ad7a0e` | TINH | IN_REVIEW | — | 91% of 846 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 221 | `345b64ad` | TINH | IN_REVIEW | — | 98% of 1300 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 222 | `30efe212` | TINH | IN_REVIEW | — | 34% of 261 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 223 | `68d8c464` | TINH | IN_REVIEW | — | 82% of 88 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 224 | `ada3b1b6` | TINH | IN_REVIEW | — | 94% of 477 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 225 | `01e2519b` | TINH | IN_REVIEW | — | 96% of 351 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 226 | `cf094e22` | TINH | IN_REVIEW | — | 97% of 430 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 227 | `6ced0333` | TINH | IN_REVIEW | — | 84% of 766 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 228 | `a56c4cd2` | TINH | IN_REVIEW | — | 74% of 148 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 229 | `102f2e73` | TINH | IN_REVIEW | — | 96% of 4328 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 230 | `3be0bffc` | TINH | IN_REVIEW | — | 73% of 5665 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 231 | `10fbf4d2` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | no added code lines (deletions/renames/binary only) |
| 232 | `14156615` | TINH | IN_REVIEW | — | 97% of 100 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 233 | `bb7fa7bb` | TINH | IN_REVIEW | — | 100% of 138 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 234 | `1e2ecb6f` | TINH | IN_REVIEW | — | 95% of 434 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 235 | `daefd898` | TINH | IN_REVIEW | — | 98% of 408 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 236 | `449cc5f2` | TINH | IN_REVIEW | — | 99% of 2543 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 237 | `3e6eb47f` | TINH | IN_REVIEW | — | 97% of 1095 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 238 | `9fef5092` | TINH | IN_REVIEW | — | 97% of 1045 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 239 | `87fccc3d` | TINH | IN_REVIEW | — | 91% of 9527 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 240 | `d8403446` | TINH | IN_REVIEW | — | 47% of 8395 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 241 | `d4a72736` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 242 | `bec778db` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 243 | `2c62295f` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 244 | `bc496ced` | TINH | IN_REVIEW | — | 78% of 259 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 245 | `bf617a40` | TINH | IN_REVIEW | — | 100% of 3 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 246 | `a4b6d5cc` | TINH | IN_REVIEW | — | 100% of 1 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 247 | `d1a34a9b` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 1 added lines remain in main (0/1 files gone) |
| 248 | `29f59d22` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 1 added lines remain in main (0/1 files gone) |
| 249 | `8fbb354a` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 7 added lines remain in main (0/1 files gone) |
| 250 | `c5fc210d` | TINH | IN_REVIEW | — | 100% of 8 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 251 | `0c56733e` | TINH | IN_REVIEW | — | 100% of 8 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 252 | `0472b270` | TINH | IN_REVIEW | — | 40% of 5 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 253 | `be20cc99` | TINH | IN_REVIEW | — | 33% of 1096 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 254 | `d0f3bf0b` | TINH | IN_REVIEW | — | 90% of 785 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 255 | `00be2599` | TINH | IN_REVIEW | — | 100% of 25 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 256 | `b50cd6c4` | TINH | IN_REVIEW | — | 100% of 25 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 257 | `9dd715f3` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 258 | `ee51c491` | TINH | IN_REVIEW | — | 15% of 1782 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 259 | `9041ac08` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 2% of 106 added lines remain in main (0/1 files gone) |
| 260 | `75ca83ad` | TINH | IN_REVIEW | — | 100% of 8 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 261 | `193f5610` | TINH | IN_REVIEW | — | 94% of 103 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 262 | `aeb90c24` | TINH | IN_REVIEW | — | 100% of 6 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 263 | `0cd6ebdc` | TINH | IN_REVIEW | — | 71% of 250 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 264 | `1161a0be` | TINH | IN_REVIEW | — | 85% of 149 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 265 | `574985eb` | TINH | IN_REVIEW | — | 100% of 43 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 266 | `3f73087e` | TINH | IN_REVIEW | — | 96% of 121 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 267 | `09e82326` | TINH | IN_REVIEW | — | 87% of 185 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 268 | `3e66e4df` | TINH | IN_REVIEW | — | 100% of 9 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 269 | `7b3be3e8` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | no added code lines (deletions/renames/binary only) |
| 270 | `00394cc3` | TINH | IN_REVIEW | — | 64% of 1983 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 271 | `efd9f4db` | TINH | IN_REVIEW | — | 100% of 2 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 272 | `de546aa7` | TINH | IN_REVIEW | — | 96% of 193 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 273 | `9eb432f4` | TINH | IN_REVIEW | — | 86% of 797 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 274 | `28b2f716` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 275 | `591bcaa6` | TINH | IN_REVIEW | — | 90% of 1079 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 276 | `e0af0a8b` | TINH | IN_REVIEW | — | 80% of 757 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 277 | `eb3b8f19` | TINH | IN_REVIEW | — | 97% of 518 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 278 | `27dd3630` | TINH | IN_REVIEW | — | 97% of 753 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 279 | `8d2056fa` | TINH | IN_REVIEW | — | 84% of 762 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 280 | `0e8c827f` | TINH | IN_REVIEW | — | 81% of 220 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 281 | `877c3d36` | TINH | IN_REVIEW | — | 72% of 25 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 282 | `6ccc7389` | TINH | IN_REVIEW | — | 21% of 768 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 283 | `ec2e9900` | TINH | IN_REVIEW | — | 56% of 98 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 284 | `c30963a2` | TINH | VERIFIED | PASS | legacy merge with manual resolution (5662 lines vs auto-merge); no conflict markers left in tree |
| 285 | `77d9f4e6` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | no added code lines (deletions/renames/binary only) |
| 286 | `9bc19e92` | TINH | IN_REVIEW | — | 73% of 98 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 287 | `67f4efe1` | TINH | IN_REVIEW | — | 85% of 13 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 288 | `c5cf2057` | TINH | IN_REVIEW | — | 80% of 156 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 289 | `e5ca5a34` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 290 | `48be556a` | TINH | IN_REVIEW | — | 72% of 1165 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 291 | `54870774` | TINH | IN_REVIEW | — | 77% of 238 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 292 | `d1c3ba92` | TINH | IN_REVIEW | — | 16% of 19 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 293 | `12ea6e12` | TINH | IN_REVIEW | — | 94% of 17 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 294 | `46d267ba` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 295 | `89e433c6` | TINH | IN_REVIEW | — | 84% of 224 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 296 | `75d846a1` | TINH | VERIFIED | PASS | legacy merge with manual resolution (1688 lines vs auto-merge); no conflict markers left in tree |
| 297 | `0c394afc` | TINH | VERIFIED | PASS | legacy merge with manual resolution (2654 lines vs auto-merge); no conflict markers left in tree |
| 298 | `6ce81da8` | TINH | IN_REVIEW | — | 92% of 519 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 299 | `327ee275` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 300 | `1e7594c4` | TINH | IN_REVIEW | — | 83% of 266 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 301 | `0b1d09c2` | TINH | VERIFIED | PASS | legacy merge with manual resolution (685 lines vs auto-merge); no conflict markers left in tree |
| 302 | `e8fcfc8a` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 303 | `08153877` | TINH | IN_REVIEW | — | 14% of 35 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 304 | `4c6785f2` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 305 | `6b1513fb` | TINH | IN_REVIEW | — | 95% of 20 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 306 | `c3cf6227` | TINH | IN_REVIEW | — | 88% of 8 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 307 | `c0bd8c42` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 308 | `fe465871` | TINH | IN_REVIEW | — | 97% of 37 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 309 | `db18ad29` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 310 | `085be970` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 311 | `0aade000` | TINH | IN_REVIEW | — | 92% of 103 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 312 | `810f1180` | TINH | IN_REVIEW | — | 92% of 12 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 313 | `36fd223a` | TINH | IN_REVIEW | — | 100% of 2 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 314 | `0a3a4829` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 315 | `3806758f` | TINH | IN_REVIEW | — | 70% of 492 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 316 | `c6a925dd` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 317 | `d5788fc5` | TINH | IN_REVIEW | — | 76% of 423 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 318 | `5d8f0f88` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 319 | `cf0eb812` | TINH | IN_REVIEW | — | 55% of 122 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 320 | `f11ca2d0` | TINH | IN_REVIEW | — | 78% of 139 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 321 | `8e1cde9d` | TINH | IN_REVIEW | — | 98% of 205 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 322 | `e11bdf77` | TINH | IN_REVIEW | — | 72% of 101 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 323 | `d153966f` | TINH | IN_REVIEW | — | 91% of 350 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 324 | `451cb3dd` | TINH | IN_REVIEW | — | 94% of 18 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 325 | `313aba02` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 326 | `1c139e24` | TINH | IN_REVIEW | — | 73% of 165 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 327 | `781e8c16` | TINH | IN_REVIEW | — | 94% of 248 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 328 | `de308304` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 329 | `4db22f8c` | TINH | IN_REVIEW | — | 100% of 52 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 330 | `50d8dc91` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 331 | `0de9cf49` | TINH | IN_REVIEW | — | 96% of 562 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 332 | `1ce79017` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 333 | `bad7340d` | TINH | IN_REVIEW | — | 68% of 373 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 334 | `a4de75f8` | TINH | IN_REVIEW | — | 48% of 230 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 335 | `2e978273` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 336 | `8fa6475a` | TINH | IN_REVIEW | — | 92% of 1046 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 337 | `5d8e36c2` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 338 | `4741fa30` | TINH | IN_REVIEW | — | 96% of 537 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 339 | `a0164882` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 340 | `e9223e94` | TINH | IN_REVIEW | — | 82% of 643 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 341 | `333c00ee` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 342 | `34cda00d` | TINH | IN_REVIEW | — | 87% of 15 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 343 | `ecb5aa3c` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 344 | `1b60b7fb` | TINH | IN_REVIEW | — | 98% of 49 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 345 | `ae13fbea` | TINH | IN_REVIEW | — | 56% of 258 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 346 | `db74a28a` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 1 added lines remain in main (0/1 files gone) |
| 347 | `728bc2c5` | TINH | IN_REVIEW | — | 10% of 30 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 348 | `58e8f02d` | TINH | IN_REVIEW | — | 100% of 102 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 349 | `c70f665a` | TINH | IN_REVIEW | — | 96% of 146 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 350 | `9d6bc282` | TINH | IN_REVIEW | — | 90% of 313 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 351 | `fa50a97c` | TINH | IN_REVIEW | — | 95% of 156 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 352 | `67d894a1` | TINH | IN_REVIEW | — | 81% of 62 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 353 | `ae7f5ab0` | TINH | IN_REVIEW | — | 91% of 247 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 354 | `49adb5bc` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 230 added lines remain in main (1/1 files gone) |
| 355 | `8711450c` | TINH | IN_REVIEW | — | 93% of 57 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 356 | `fef23ac4` | TINH | IN_REVIEW | — | 100% of 25 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 357 | `a987603a` | TINH | IN_REVIEW | — | 76% of 17 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 358 | `4f1ef4b7` | TINH | IN_REVIEW | — | 80% of 74 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 359 | `f1d1eb8b` | TINH | IN_REVIEW | — | 96% of 55 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 360 | `da405e72` | TINH | IN_REVIEW | — | 84% of 102 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 361 | `73579318` | TINH | IN_REVIEW | — | 94% of 612 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 362 | `bc1745a9` | TINH | IN_REVIEW | — | 76% of 500 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 363 | `c28703e5` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 364 | `4f7fb662` | TINH | IN_REVIEW | — | 83% of 18 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 365 | `29af0436` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 366 | `f4ea57f7` | TINH | IN_REVIEW | — | 96% of 28 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 367 | `ab74e54b` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 368 | `f7901f82` | TINH | IN_REVIEW | — | 93% of 44 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 369 | `753217a8` | TINH | IN_REVIEW | — | 92% of 1208 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 370 | `b68f98db` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 371 | `f019ab9f` | TINH | IN_REVIEW | — | 96% of 230 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 372 | `5b275608` | TINH | IN_REVIEW | — | 100% of 75 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 373 | `ccbee5b7` | TINH | IN_REVIEW | — | 88% of 136 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 374 | `86f34e97` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 375 | `345ba03c` | TINH | IN_REVIEW | — | 90% of 136 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 376 | `f0eb8dcc` | TINH | IN_REVIEW | — | 32% of 317 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 377 | `068840f8` | TINH | IN_REVIEW | — | 27% of 2079 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 378 | `17aeabcb` | TINH | IN_REVIEW | — | 43% of 109 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 379 | `1f217c9b` | TINH | IN_REVIEW | — | 27% of 466 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 380 | `e0f4b49f` | TINH | IN_REVIEW | — | 97% of 175 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 381 | `75ce7341` | TINH | IN_REVIEW | — | 91% of 1258 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 382 | `6a4d6fb4` | TINH | IN_REVIEW | — | 98% of 448 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 383 | `5da82000` | TINH | VERIFIED | PASS | legacy merge with manual resolution (10 lines vs auto-merge); no conflict markers left in tree |
| 384 | `e3c2ccc9` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 385 | `d81328ca` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 386 | `f9cecfa6` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 387 | `88c7f6ce` | TINH | IN_REVIEW | — | 100% of 28 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 388 | `91a4f38c` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 389 | `77ac4e65` | TINH | IN_REVIEW | — | 92% of 13 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 390 | `5c15e070` | TINH | IN_REVIEW | — | 100% of 9 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 391 | `2527b29a` | TINH | IN_REVIEW | — | 100% of 30 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 392 | `9b4a54b4` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 393 | `66bc233a` | TINH | IN_REVIEW | — | 100% of 56 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 394 | `90dce432` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 395 | `d1dbd69e` | TINH | IN_REVIEW | — | 65% of 2116 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 396 | `c89245e7` | TINH | IN_REVIEW | — | 81% of 319 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 397 | `06bad648` | TINH | IN_REVIEW | — | 86% of 499 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 398 | `c0960d31` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 399 | `c40ead38` | TINH | IN_REVIEW | — | 71% of 14 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 400 | `8e33bca8` | TINH | IN_REVIEW | — | 100% of 10 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 401 | `09798a67` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 402 | `ec78f645` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 403 | `df78f4eb` | TINH | IN_REVIEW | — | 100% of 133 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 404 | `32e9dfa3` | TINH | IN_REVIEW | — | 98% of 175 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 405 | `c2a41d6a` | TINH | IN_REVIEW | — | 94% of 731 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 406 | `8b41bb65` | TINH | IN_REVIEW | — | 94% of 800 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 407 | `f8475d93` | TINH | IN_REVIEW | — | 90% of 544 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 408 | `33e8fa22` | TINH | IN_REVIEW | — | 89% of 81 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 409 | `aaa07455` | TINH | IN_REVIEW | — | 81% of 153 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 410 | `e7327d0c` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 411 | `894d3b07` | TINH | IN_REVIEW | — | 74% of 287 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 412 | `234bbb56` | TINH | IN_REVIEW | — | 95% of 1008 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 413 | `e0439a03` | TINH | IN_REVIEW | — | 93% of 448 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 414 | `267ac129` | TINH | IN_REVIEW | — | 95% of 453 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 415 | `00df0c6c` | TINH | VERIFIED | PASS | legacy merge with manual resolution (151 lines vs auto-merge); no conflict markers left in tree |
| 416 | `e0a7449b` | TINH | IN_REVIEW | — | 100% of 7 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 417 | `28e11a8a` | TINH | IN_REVIEW | — | 100% of 6 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 418 | `71ecd1b4` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 419 | `a9fc2a39` | TINH | IN_REVIEW | — | 100% of 102 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 420 | `6c74ae15` | TINH | IN_REVIEW | — | 96% of 53 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 421 | `bf5c5e12` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 422 | `4f5bf853` | TINH | IN_REVIEW | — | 73% of 44 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 423 | `424b8273` | TINH | IN_REVIEW | — | 82% of 71 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 424 | `61d4d401` | TINH | IN_REVIEW | — | 50% of 16 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 425 | `1c5ab6aa` | TINH | IN_REVIEW | — | 55% of 11 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 426 | `a16ba788` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 427 | `79b544dc` | TINH | IN_REVIEW | — | 62% of 45 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 428 | `3351dc95` | TINH | IN_REVIEW | — | 90% of 39 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 429 | `26d8e083` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 1 added lines remain in main (0/1 files gone) |
| 430 | `584147f7` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 431 | `8bcaac1f` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 432 | `4eb878a2` | TINH | IN_REVIEW | — | 89% of 9 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 433 | `bd382322` | TINH | IN_REVIEW | — | 97% of 779 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 434 | `9d16f966` | TINH | IN_REVIEW | — | 82% of 1061 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 435 | `6d64f3f7` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 436 | `d1f5d284` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 437 | `5f81032e` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 438 | `45d6aa45` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 439 | `ca4fc888` | TINH | IN_REVIEW | — | 87% of 565 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 440 | `fcdacea6` | TINH | VERIFIED | PASS | legacy merge with manual resolution (6 lines vs auto-merge); no conflict markers left in tree |
| 441 | `3be9eb82` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 442 | `7a5213f4` | TINH | IN_REVIEW | — | 99% of 236 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 443 | `bc3a524f` | TINH | IN_REVIEW | — | 64% of 980 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 444 | `1421b114` | TINH | IN_REVIEW | — | 89% of 36 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 445 | `9327d9de` | TINH | IN_REVIEW | — | 81% of 32 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 446 | `eeee284c` | TINH | IN_REVIEW | — | 40% of 5 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 447 | `4617e70e` | TINH | IN_REVIEW | — | 100% of 18 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 448 | `18be3f3d` | TINH | IN_REVIEW | — | 100% of 1127 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 449 | `c80b5c1a` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 450 | `aaa58d77` | TINH | IN_REVIEW | — | 83% of 6 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 451 | `ad428c96` | TINH | IN_REVIEW | — | 93% of 900 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 452 | `10b9262d` | TINH | IN_REVIEW | — | 83% of 77 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 453 | `82012584` | TINH | IN_REVIEW | — | 100% of 2 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 454 | `a18e391e` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 455 | `1ffb9996` | TINH | IN_REVIEW | — | 100% of 207 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 456 | `f4248a31` | TINH | IN_REVIEW | — | 90% of 113 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 457 | `5e8a9543` | TINH | IN_REVIEW | — | 78% of 83 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 458 | `5ba5ff4f` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 459 | `e2f2b91b` | TINH | IN_REVIEW | — | 100% of 10 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 460 | `49b2e4d9` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 1 added lines remain in main (0/1 files gone) |
| 461 | `e6ce51f2` | TINH | IN_REVIEW | — | 100% of 1787 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 462 | `361ff2b0` | TINH | IN_REVIEW | — | 77% of 320 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 463 | `80dc89a0` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 464 | `661fcd92` | TINH | IN_REVIEW | — | 92% of 24 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 465 | `1350a994` | TINH | IN_REVIEW | — | 89% of 83 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 466 | `d842cbba` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 467 | `2cc5eae8` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 468 | `117dddcc` | TINH | IN_REVIEW | — | 99% of 145 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 469 | `6a9ed37b` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 470 | `a264848a` | TINH | IN_REVIEW | — | 79% of 24 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 471 | `718b3171` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 472 | `65b09dbe` | TINH | IN_REVIEW | — | 97% of 344 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 473 | `2eba07d4` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 474 | `65cc6545` | TINH | IN_REVIEW | — | 71% of 17 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 475 | `011888a7` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 476 | `a9b63f63` | TINH | IN_REVIEW | — | 92% of 307 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 477 | `217bc430` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 478 | `448306d1` | TINH | IN_REVIEW | — | 94% of 173 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 479 | `21b2bed3` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 480 | `2ec9d43f` | TINH | IN_REVIEW | — | 95% of 1137 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 481 | `0a47a8be` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 482 | `363ec118` | TINH | IN_REVIEW | — | 96% of 75 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 483 | `3d91dc8a` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | no added code lines (deletions/renames/binary only) |
| 484 | `bad3499c` | TINH | IN_REVIEW | — | 92% of 863 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 485 | `cb471c02` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 486 | `91859932` | TINH | IN_REVIEW | — | 100% of 14 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 487 | `de8f9071` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 488 | `22a1177d` | TINH | IN_REVIEW | — | 100% of 21 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 489 | `3b974534` | TINH | IN_REVIEW | — | 85% of 330 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 490 | `db416ef6` | TINH | IN_REVIEW | — | 76% of 288 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 491 | `e92f34ea` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 492 | `7177466f` | TINH | IN_REVIEW | — | 89% of 353 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 493 | `2c10a6ff` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 494 | `b4ec36f9` | TINH | IN_REVIEW | — | 62% of 42 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 495 | `1db8704d` | TINH | IN_REVIEW | — | 100% of 4 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 496 | `69ee531d` | TINH | IN_REVIEW | — | 53% of 273 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 497 | `66288e8a` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 498 | `73c60991` | TINH | IN_REVIEW | — | 62% of 102 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 499 | `360d6dc3` | TINH | IN_REVIEW | — | 90% of 42 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 500 | `a83452cb` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 501 | `f0641a90` | TINH | IN_REVIEW | — | 96% of 338 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 502 | `5565f9f8` | TINH | VERIFIED | PASS | legacy merge: `--remerge-diff` 0 lines |
| 503 | `4719ba28` | TINH | IN_REVIEW | — | 100% of 557 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 504 | `f8db4a7d` | TINH | IN_REVIEW | — | 12% of 878 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 505 | `a4b16af2` | TINH | IN_REVIEW | — | 83% of 2905 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 506 | `9e8c1c5b` | TINH | IN_REVIEW | — | 100% of 146 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 507 | `77128318` | TINH | IN_REVIEW | — | 100% of 1 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 508 | `9145aced` | TINH | IN_REVIEW | — | 50% of 30 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 509 | `f5621dd3` | TINH | IN_REVIEW | — | 100% of 457 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 510 | `8b9a30e2` | TINH | IN_REVIEW | — | 44% of 45 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 511 | `20076628` | TINH | IN_REVIEW | — | 48% of 73 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 512 | `25ec09bb` | TINH | IN_REVIEW | — | 52% of 150 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 513 | `2b120a55` | TINH | IN_REVIEW | — | 47% of 60 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 514 | `08470e36` | TINH | IN_REVIEW | — | 88% of 60 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 515 | `58faa029` | TINH | IN_REVIEW | — | 56% of 1052 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 516 | `12251bb0` | TINH | IN_REVIEW | — | 100% of 151 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 517 | `e719f3df` | TINH | IN_REVIEW | — | 85% of 2030 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 518 | `78479166` | TINH | IN_REVIEW | — | 81% of 1366 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 519 | `27d56e7b` | TINH | IN_REVIEW | — | 73% of 231 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 520 | `5a76493f` | TINH | IN_REVIEW | — | 82% of 1807 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 521 | `09565804` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 62 added lines remain in main (0/1 files gone) |
| 522 | `644892a2` | TINH | IN_REVIEW | — | 93% of 601 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 523 | `d243927e` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | no added code lines (deletions/renames/binary only) |
| 524 | `82fb24df` | TINH | IN_REVIEW | — | 85% of 959 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 525 | `defd6270` | TINH | IN_REVIEW | — | 96% of 1912 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 526 | `613afb3f` | TINH | IN_REVIEW | — | 100% of 13 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 527 | `91ce4e7f` | TINH | IN_REVIEW | — | 87% of 38 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 528 | `898738c6` | TINH | IN_REVIEW | — | 96% of 562 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 529 | `f4fb1dc2` | TINH | IN_REVIEW | — | 98% of 202 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 530 | `1a82a702` | TINH | IN_REVIEW | — | 92% of 749 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 531 | `6517c8f6` | TINH | IN_REVIEW | — | 45% of 831 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 532 | `5fa93244` | TINH | IN_REVIEW | — | 39% of 119 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 533 | `1cc3f3c9` | TINH | IN_REVIEW | — | 67% of 36 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 534 | `dcb460c0` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 2% of 62 added lines remain in main (0/1 files gone) |
| 535 | `6d772748` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 0% of 70 added lines remain in main (0/1 files gone) |
| 536 | `d90f8c67` | TINH | NOT_APPLICABLE | NOT_APPLICABLE | superseded: 4% of 57 added lines remain in main (0/1 files gone) |
| 537 | `1525b335` | TINH | IN_REVIEW | — | 94% of 684 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 538 | `e245aa3e` | TINH | IN_REVIEW | — | 54% of 28 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 539 | `268d03b1` | TINH | IN_REVIEW | — | 64% of 28 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 540 | `dd4c781e` | TINH | IN_REVIEW | — | 71% of 34 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 541 | `076bab87` | TINH | IN_REVIEW | — | 76% of 29 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 542 | `7bc06352` | TINH | IN_REVIEW | — | 87% of 863 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 543 | `7f6c8f8c` | TINH | IN_REVIEW | — | 63% of 988 added lines live on in main → current behaviour judged in the main system-wide audit (04); historical diff review pending |
| 544 | `9776fe85` | UPB | REVIEWED | PASS_WITH_CONCERNS (gates pending) | static review done; gates pending (07) |
| 545 | `c8cd41f3` | UPB | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 546 | `f216d1f2` | UPB | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 547 | `407f454a` | UPB | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 548 | `805c8fbe` | UPB | REVIEWED | PASS_WITH_CONCERNS | AUD-013 |
| 549 | `e4b6246d` | UPB | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 550 | `507ab590` | UPB | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 551 | `2664eadc` | UPB | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 552 | `44dacbaf` | UPB | REVIEWED | PASS | static review done; gates pending (07) |
| 553 | `a99c9617` | UPB | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 554 | `a1b61be1` | UPB | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 555 | `800183b5` | UPB | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 556 | `ef1914fb` | UPB | REVIEWED | PASS | static review done; gates pending (07) |
| 557 | `721b8179` | UPB | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 558 | `ddda38f3` | UPB | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 559 | `b4858c21` | UPB | NOT_APPLICABLE | NOT_APPLICABLE (docs) | NOT_APPLICABLE (docs) |
| 560 | `5fbc6df7` | UPB | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 561 | `ccb2059a` | UPB | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 562 | `869a97bb` | UPB | REVIEWED | PASS_WITH_CONCERNS (E2E not run) | static review done; gates pending (07) |
| 563 | `ffb1d587` | DTORCH | BLOCKED | BLOCKED | dependency change needs PO approval (AUD-012) |
| 564 | `4ad5628b` | DTV | BLOCKED | BLOCKED | dependency change needs PO approval (AUD-012) |
| 565 | `151585e5` | DTIMM | BLOCKED | BLOCKED | dependency change needs PO approval (AUD-012) |
| 566 | `22e76e31` | DNPM | BLOCKED | BLOCKED — dependency change needs PO approval (CLAUDE.md); gates not run on it | BLOCKED — dependency change needs PO approval (CLAUDE.md); gates not run on it |
| 567 | `fe0d74aa` | INT | REVIEWED | PASS_WITH_CONCERNS (visual not verified) | static review done; gates pending (07) |
| 568 | `e7545157` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 569 | `cc937f20` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 570 | `610b1711` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 571 | `39803b71` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 572 | `21e1a08b` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 573 | `198f7b3a` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 574 | `46bd3e95` | INT | REVIEWED | PASS | static review done; gates pending (07) |
| 575 | `cd858f2c` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 576 | `20f155c7` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 577 | `0a64ae02` | INT | REVIEWED | PASS_WITH_CONCERNS | AUD-009 |
| 578 | `f0dce714` | INT | NOT_APPLICABLE | NOT_APPLICABLE (docs) | NOT_APPLICABLE (docs) |
| 579 | `307ab6fa` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 580 | `0cf2b2f3` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 581 | `6b8d284f` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 582 | `f4154e3a` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 583 | `05c46b24` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 584 | `4b38648a` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 585 | `267944f1` | INT | REVIEWED | PASS | static review done; gates pending (07) |
| 586 | `5def12db` | INT | FIX_REQUIRED | FAIL | AUD-005 |
| 587 | `8492c065` | INT | FIX_REQUIRED | FAIL | AUD-004 |
| 588 | `f6ca2782` | INT | FIX_REQUIRED | FAIL | AUD-002, AUD-003, AUD-007, AUD-008 |
| 589 | `405f15cf` | INT | REVIEWED | PASS_WITH_CONCERNS | AUD-002 |
| 590 | `6d87a403` | INT | REVIEWED | PASS | static review done; gates pending (07) |
| 591 | `87c8b675` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 592 | `9bb7cc80` | INT | REVIEWED | PASS | static review done; gates pending (07) |
| 593 | `7c3f0585` | INT | REVIEWED | PASS | static review done; gates pending (07) |
| 594 | `c6b2a4c2` | INT | REVIEWED | PASS | static review done; gates pending (07) |
| 595 | `666b370d` | INT | REVIEWED | PASS | static review done; gates pending (07) |
| 596 | `4fcd5a7c` | INT | REVIEWED | PASS | static review done; gates pending (07) |
| 597 | `f56024ca` | INT | NOT_APPLICABLE | NOT_APPLICABLE (docs) | NOT_APPLICABLE (docs) |
| 598 | `99db1dfc` | INT | FIX_REQUIRED | FAIL | AUD-006, AUD-011 |
| 599 | `83fd26ce` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 600 | `cebcb057` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 601 | `db9592b9` | INT | REVIEWED | PASS | static review done; gates pending (07) |
| 602 | `4bb56239` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 603 | `383b4f3f` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 604 | `52cd3477` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 605 | `d279148c` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 606 | `0c6a5c5f` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 607 | `0968c691` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 608 | `0625c8e1` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 609 | `086c1e3a` | INT | VERIFIED | PASS | merge: `git show --remerge-diff` = 0 lines — resolution identical to automatic merge |
| 610 | `ec71f9b7` | INT | REVIEWED | PASS_WITH_CONCERNS | AUD-010 |
| 611 | `e0b8008b` | INT | REVIEWED | PASS_WITH_CONCERNS | static review done; gates pending (07) |
| 612 | `36f80373` | INT | REVIEWED | PASS | static review done; gates pending (07) |
| 613 | `d4212e74` | INT | REVIEWED | PASS | static review done; gates pending (07) |

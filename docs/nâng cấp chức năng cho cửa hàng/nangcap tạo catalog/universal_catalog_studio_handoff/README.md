# Universal Catalog Studio 2026 — AI Coding Agent Handoff

Bộ tài liệu hướng dẫn triển khai hệ thống Catalog Template PDF đa ngành hàng.

## Thành phần
- `Universal_Catalog_Studio_Implementation_Guide_VI.docx`: đặc tả triển khai chi tiết.
- `AI_CODING_AGENT_MASTER_PROMPT_VI.md`: prompt có thể sao chép trực tiếp vào AI coding agent.
- `schemas/catalog-example.json`: ví dụ cấu trúc catalog và product.
- `checklists/acceptance-checklist.md`: checklist nghiệm thu.
- `docs-template/`: khung tài liệu khuyến nghị đặt trong repository.

## Cách sử dụng
1. Đưa tài liệu DOCX và master prompt cho agent.
2. Yêu cầu agent audit repository trước khi code, không giả định stack.
3. Bắt đầu với proof-of-concept PDF và ba prototype T01/T02/T03.
4. Chỉ mở rộng thư viện sau khi đạt tiêu chí nghiệm thu.

## Nguyên tắc
Ưu tiên chất lượng thị giác, tách dữ liệu khỏi style/layout, không bịa nội dung, kiểm tra PDF sau render và ghi rõ những gì chưa hoàn thành.

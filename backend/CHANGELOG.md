# Changelog

## [Unreleased]

### Changed
- Tách cấu hình route HTTP (`/api/analyze`, `/health`) từ `main.go` sang package `routes/`.
- Response `POST /api/analyze` đổi sang cấu trúc `{ "analysis": {...}, "results": [...] }`.
- Google Search Grounding: bỏ `ResponseMIMEType: application/json` khi dùng tool `GoogleSearch` (Gemini không hỗ trợ kết hợp cả hai).
- Tối ưu search: giới hạn 2 keyword quan trọng nhất, chạy song song (`errgroup`), tối đa 5 URL/keyword, thêm log `[timing]` từng bước.

### Added
- API `POST /api/analyze`: upload ảnh, lưu vào `uploads/`, phân tích bằng Gemini và trả JSON (`brand`, `model`, `color`, `material`, `category`, `search_keywords`, `similar_style_keywords`).
- Google Search Grounding: sau phân tích ảnh, tìm kiếm lần lượt mọi phần tử trong `search_keywords` và `similar_style_keywords`, trả về `results` (site, keyword_used, product_url).
- Endpoint `GET /health` kiểm tra trạng thái server.
- Tích hợp Google GenAI SDK (`google.golang.org/genai`) với model `gemini-2.5-flash`.

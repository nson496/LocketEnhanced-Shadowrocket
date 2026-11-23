# Nhật Ký Thay Đổi (Changelog)

Tất cả các thay đổi đáng chú ý của dự án **Locket Enhanced Shadowrocket Edition** được ghi nhận tại đây.

---

## [v0.1.4-beta] — 2026-11-24

### 🔍 Xử Lý Lệch Endpoint Realtime & Bộ Chẩn Đoán Không Lưu PII
- **Phân Tích & Phân Biệt Realtime Stream vs Standard Fetch:**
  - Bổ sung tài liệu phân tích chuyên sâu `docs/REALTIME_VS_FETCH_ANALYSIS.md` giải thích cơ chế `:streamFetchInvalidations` của `firebaseremoteconfigrealtime.googleapis.com` và cơ chế bộ nhớ đệm 12 giờ của Firebase iOS SDK.
  - Xác nhận endpoint Realtime chỉ truyền tín hiệu invalidation (`templateVersion`), tuyệt đối không rewrite body của stream này để tránh làm crash `RCNConfigRealtime.m`.
- **Bổ Sung Bộ Ghi Nhận Chẩn Đoán (`locket_diagnostic.js`):**
  - Tích hợp script chẩn đoán an toàn, chỉ ghi lại metadata tối thiểu: Timestamp, Method, Host, Path.
  - **Zero PII:** Tuyệt đối không log Authorization token, cookie, request/response body, API keys. Trả về `$done({})` ngay lập tức để không gây gián đoạn stream HTTP/2.
- **Chặn UDP/QUIC Đầy Đủ:**
  - Bổ sung quy tắc REJECT UDP cho `firebaseremoteconfigrealtime.googleapis.com` trên cả 2 bản Standard và Beta module, ép toàn bộ lưu lượng Realtime sang TCP.
- **Cập Nhật Cố Định Version Tag `v0.1.4-beta`:**
  - Toàn bộ `script-path` được ghim vào tag `v0.1.4-beta`.

---

## [v0.1.3-beta] — 2026-11-23

### 🔧 Bản Vá Đồng Bộ Phiên Bản & Cố Định Script-Path (Tag-Pinned Distribution)
- **Cố định script-path theo Release Tag (`v0.1.3-beta`):**
  - Chuyển toàn bộ các tham chiếu `script-path` trong `LocketEnhanced.sgmodule` và `LocketEnhanced-Beta.sgmodule` sang URL cố định theo tag `v0.1.3-beta`, loại bỏ hoàn toàn tham chiếu trôi nổi `/main/`.
  - Khắc phục triệt để hiện tượng lệch phiên bản (version skew) khi nhánh `main` được cập nhật trong tương lai.
- **Chuẩn hóa Version Metadata:**
  - Đồng bộ `#!version=0.1.3-beta` trên cả Standard và Beta Module.
- **Tích Hợp CI Kiểm Tra Đồng Bộ Phiên Bản:**
  - Bổ sung `shadowrocket/tests/version_consistency.test.js` kiểm tra tự động:
    1. Đảm bảo toàn bộ module khai báo cùng số hiệu phiên bản.
    2. Đảm bảo toàn bộ `script-path` được ghim vào release tag, không chứa `/main/`.
    3. Đảm bảo file JavaScript được tham chiếu tồn tại cục bộ và cú pháp hợp lệ.
    4. Quét bảo mật ngăn chặn cấu hình wildcard MITM (`hostname = *`) hoặc hook RevenueCat không được phép.
- **Loại Bỏ Tham Chiếu Thừa:**
  - Dọn sạch các hook không dùng, tối ưu phạm vi giải mã HTTPS.

---

## [v0.1.2-beta] — 2026-11-23

### 🛡️ Thẩm Định Tính Năng & Tối Ưu Tương Thích Runtime
- **Áp dụng Strict Allowlist cho Remote Config:**
  - Giới hạn can thiệp vào đúng 4 trường cấu hình có bằng chứng kỹ thuật: `video_max_duration_seconds`, `video_audio_enabled`, `caption_character_limit`, `themes_enabled`.
  - Loại bỏ toàn bộ các khóa tự tạo / giả định không có trong schema Locket (`can_record_long_video`, `allow_video_picker`, `caption_max_lines`, v.v.) để bảo đảm không làm hỏng schema của client.
  - Ép kiểu dữ liệu `String` nghiêm ngặt cho toàn bộ các trường `entries` theo đặc tả Firebase Remote Config REST API.
- **Tích Hợp Shadowrocket Mock Test Suite:**
  - Bổ sung bộ kiểm thử tự động giả lập toàn diện môi trường runtime Shadowrocket (`$request`, `$response`, `$done`, `$argument`, `$persistentStore`).
  - Kiểm thử 19 kịch bản kiểm thử: schema lạ, JSON hỏng, Safe Mode, Header Cache Cleaner, PII Redaction và vượt qua 100% test cases.
- **Tài Liệu Đánh Giá Tương Thích & Kế Hoạch Test iPhone:**
  - Bổ sung `docs/REMOTE_CONFIG_COMPATIBILITY.md`: Bảng đối chiếu bằng chứng kỹ thuật, kiểu dữ liệu và trạng thái của từng trường cấu hình.
  - Bổ sung `docs/IPHONE_COMPATIBILITY_TEST.md`: Quy trình kiểm chứng thực tế trên iPhone (đánh dấu `NOT_RUN` minh bạch khi chưa có phần cứng vật lý kết nối).

---

## [v0.1.1-beta] — 2026-11-23

### 🚀 Tính Năng & Cải Tiến Mới
- **Tách biệt phân phối công khai (Public Distribution):**
  - Khắc phục triệt để lỗi HTTP 404 khi import module vào Shadowrocket bằng việc thành lập repository công khai riêng biệt `nson496/LocketEnhanced-Shadowrocket`.
  - Giữ bảo mật tuyệt đối cho kho mã nguồn phát triển chính `nson496/LocketEnhanced`.
- **Hỗ trợ One-Click Import:**
  - Thêm URL schema `shadowrocket://install/module?url=...` để người dùng iPhone có thể cài đặt module chỉ với một cú nhấp chuột từ trình duyệt Safari.
- **Bổ sung LocketEnhanced-Beta.sgmodule:**
  - Hỗ trợ tham số URL tùy biến: `videoDuration=60`, `audio=true`, `captionLimit=500`.
  - Tích hợp thêm hook `/fetchUserV2` profile badge thử nghiệm.
- **Tối ưu hóa Cache Buster (`locket_rc_request.js`):**
  - Tự động xóa các header `If-None-Match`, `If-Modified-Since`, `x-goog-if-none-match` để đảm bảo máy chủ Firebase luôn trả về mã HTTP 200 kèm payload JSON thay vì HTTP 304 Not Modified.
- **Chính sách Zero PII & Safe Store:**
  - Bổ sung `scripts/utils/safe_store.js` với bộ lọc PII bằng regex, bảo đảm không rò rỉ dữ liệu nhạy cảm.

---

## [v0.1.0-beta] — 2026-11-23

### 📌 Khởi Tạo Ban Đầu
- Nghiên cứu kiến trúc mạng Locket qua Shadowrocket MITM.
- Khởi tạo script can thiệp Firebase Remote Config (`locket_remoteconfig.js`).
- Thiết lập quy tắc ghi đè thời lượng video 60 giây và kích hoạt âm thanh video.

# Nhật Ký Thay Đổi (Changelog)

Tất cả các thay đổi đáng chú ý của dự án **Locket Enhanced Shadowrocket Edition** được ghi nhận tại đây.

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

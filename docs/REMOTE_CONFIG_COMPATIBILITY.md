# Đánh Giá Tương Thích Firebase Remote Config — Locket Enhanced v0.1.2

Tài liệu này ghi nhận kết quả rà soát, thẩm định bằng chứng kỹ thuật và phân loại tính tương thích của các trường cấu hình Firebase Remote Config đối với ứng dụng Locket chính thức trên iPhone.

Tuân thủ nghiêm ngặt nguyên tắc **No Fake Success** (Quy chuẩn `AGENTS.md`): Không giả định một trường có tác dụng trên ứng dụng khách chỉ vì trường đó tồn tại trong payload JSON.

---

## 1. Bảng Khảo Sát & Phân Loại Các Trường Cấu Hình

| Field | Original Type | Evidence | Client Effect | Status | Ghi Chú Kỹ Thuật |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `video_max_duration_seconds` | String (`"10"` - `"15"`) | Phân tích binary Locket iOS & mẫu Firebase Remote Config | Kéo dài bộ đếm thời gian trên vòng quay camera (UI circle progress) | **EXPERIMENTAL** | Client nhận giá trị và cho phép bấm giữ lâu hơn. Cần kiểm chứng giới hạn dung lượng upload lên Cloud Storage của máy chủ. |
| `video_audio_enabled` | String (`"false"`) | Rollout flag trong các bản thử nghiệm Locket | Có thể kích hoạt pipeline ghi âm microphone khi AVAssetWriter quay video | **NOT_VERIFIED** | Chưa có bằng chứng máy nhận phát được tiếng nếu server chuyển mã (transcode) tự động lược bỏ luồng AAC. |
| `caption_character_limit` | String (`"120"` - `"150"`) | Giới hạn độ dài ô văn bản trên UI Locket | Mở rộng số lượng ký tự tối đa cho phép nhập trong `UITextView` | **EXPERIMENTAL** | Mở rộng được trên giao diện gõ chữ. Nếu backend Firebase Functions có validator kiểm tra độ dài cứng, bài đăng dài hơn 150 ký tự có thể bị từ chối (`400 Bad Request`). |
| `themes_enabled` | String (`"false"`) | Flag kích hoạt tính năng chọn theme trong mục Cài đặt | Hiển thị bảng chọn icon và giao diện màu sắc trong app | **NOT_VERIFIED** | Nhiều theme đòi hỏi gói đăng ký Locket Gold chính thức. Nếu thiếu chữ ký số xác thực, app sẽ khóa lại khi áp dụng. |
| `can_upload_video` | String (`"false"`) | Giả định tính năng tải video từ Camera Roll | Không hiển thị nút chọn video trên giao diện nếu app không biên dịch sẵn UI Picker | **NOT_SUPPORTED_BY_SHADOWROCKET** | Shadowrocket chỉ can thiệp tầng mạng, không thể inject thêm nút UI native vào ứng dụng iOS đã đóng gói. |
| `video_max_duration_ms` | None (Invented) | Không có bằng chứng trong Locket iOS | Không có tác dụng | **REMOVED** | Khóa tự tạo, đã bị loại bỏ khỏi allowlist để tránh làm ô nhiễm schema. |
| `can_record_long_video` | None (Invented) | Không có bằng chứng trong Locket iOS | Không có tác dụng | **REMOVED** | Khóa tự tạo, đã bị loại bỏ khỏi allowlist. |
| `max_video_length_seconds` | None (Invented) | Không có bằng chứng trong Locket iOS | Không có tác dụng | **REMOVED** | Khóa tự tạo, đã bị loại bỏ khỏi allowlist. |
| `enable_video_sound` | None (Invented) | Không có bằng chứng trong Locket iOS | Không có tác dụng | **REMOVED** | Khóa tự tạo, đã bị loại bỏ khỏi allowlist. |
| `record_audio_with_video` | None (Invented) | Không có bằng chứng trong Locket iOS | Không có tác dụng | **REMOVED** | Khóa tự tạo, đã bị loại bỏ khỏi allowlist. |
| `enable_video_upload` | None (Invented) | Không có bằng chứng trong Locket iOS | Không có tác dụng | **REMOVED** | Khóa tự tạo, đã bị loại bỏ khỏi allowlist. |
| `allow_video_picker` | None (Invented) | Không có bằng chứng trong Locket iOS | Không có tác dụng | **REMOVED** | Khóa tự tạo, đã bị loại bỏ khỏi allowlist. |
| `caption_max_lines` | None (Invented) | Không có bằng chứng trong Locket iOS | Không có tác dụng | **REMOVED** | Khóa tự tạo, đã bị loại bỏ khỏi allowlist. |
| `enable_multiline_caption` | None (Invented) | Không có bằng chứng trong Locket iOS | Không có tác dụng | **REMOVED** | Khóa tự tạo, đã bị loại bỏ khỏi allowlist. |
| `widget_customization_enabled` | None (Invented) | Không có bằng chứng trong Locket iOS | Không có tác dụng | **REMOVED** | Khóa tự tạo, đã bị loại bỏ khỏi allowlist. |
| `can_use_custom_icons` | None (Invented) | Không có bằng chứng trong Locket iOS | Không có tác dụng | **REMOVED** | Khóa tự tạo, đã bị loại bỏ khỏi allowlist. |

---

## 2. Quy Định Allowlist Mới Trong v0.1.2

Trong phiên bản `v0.1.2-beta`, engine xử lý `locket_remoteconfig.js` tuân thủ nguyên tắc **Strict Allowlist**:
1. **Chỉ can thiệp 4 trường cốt lõi có căn cứ thực tế:**
   - `video_max_duration_seconds` (Mặc định: `"60"`, có thể cấu hình `"15"`, `"30"`, `"45"`, `"60"` qua argument).
   - `video_audio_enabled` (Mặc định: `"true"`).
   - `caption_character_limit` (Mặc định: `"500"`).
   - `themes_enabled` (Mặc định: `"true"`).
2. **Kiểu dữ liệu bắt buộc:** Tất cả giá trị đưa vào `entries` phải là kiểu `String` thuần túy (tuân thủ đặc tả Firebase Remote Config REST API).
3. **Bảo toàn phản hồi gốc:**
   - Nếu phản hồi không chứa trường `entries` hợp lệ, giữ nguyên phản hồi gốc.
   - Nếu kích hoạt `Safe Mode`, giữ nguyên phản hồi gốc.
   - Không thay đổi bất kỳ trường xác thực, token (`templateVersion`, `state`) hoặc dữ liệu bảo mật nào của người dùng.

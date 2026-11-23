# Báo Cáo Phân Tích Chuyên Sâu: Vì Sao Chưa Quan Sát Thấy Firebase Fetch & Thẩm Định Tính Xác Thực Của Cờ Cấu Hình

Tài liệu này đánh giá toàn diện hiện tượng iPhone thực tế chỉ kết nối tới `firebaseremoteconfigrealtime.googleapis.com` mà chưa quan sát thấy `firebaseremoteconfig.googleapis.com`, đồng thời thẩm định tính xác thực của các cờ cấu hình theo nguyên tắc **No Fake Success** (`AGENTS.md`).

---

## 1. Phân Tích Các Giả Thuyết: Vì Sao Chưa Quan Sát Thấy Firebase Fetch?

Không mặc định duy nhất nguyên nhân là bộ nhớ đệm 12 giờ của Firebase SDK. Dưới đây là 5 giả thuyết kỹ thuật được rà soát:

### Giả thuyết A: Tính Năng & Cờ Cấu Hình Nằm Ở Backend Riêng Của Locket (Khả năng cao)
- **Cơ sở kỹ thuật:** Locket sở hữu hạ tầng API riêng tại `api.locketcamera.com` (ví dụ: `/fetchUserV2`, `/getFriends`) và Google Cloud Functions tại `us-central1-locket-4252a.cloudfunctions.net`.
- **Phân tích:** Nhiều ứng dụng iOS hiện đại không lưu cờ tính năng người dùng trong Firebase Remote Config (vốn mang tính toàn cục/A-B testing) mà trả về trực tiếp trong payload thông tin người dùng (`user_profile` hoặc `/fetchUserV2` / `/login`). Nếu Locket quản lý quyền quay video 60s hay Theme qua API tài khoản nội bộ, việc can thiệp Firebase Remote Config sẽ hoàn toàn vô hiệu.
- **Trạng thái:** **CẦN KIỂM CHỨNG BẰNG DIAGNOSTIC MODE.**

### Giả thuyết B: Locket Chỉ Dùng In-App Defaults (Không Gọi Fetch Thường Xuyên)
- **Cơ sở kỹ thuật:** Trong Firebase iOS SDK, hàm `setDefaultsFromPlist:` nạp các giá trị mặc định được biên dịch sẵn trong file `.plist` của gói IPA.
- **Phân tích:** Nếu lập trình viên Locket chỉ khởi tạo Firebase Realtime listener để đón bản tin khẩn cấp nhưng trong vòng đời khởi động thông thường không chủ động gọi hàm `fetchWithCompletionHandler:`, ứng dụng sẽ chỉ chạy bằng giá trị mặc định nội bộ mà không tạo ra bất kỳ request HTTP fetch nào khi mở app.
- **Trạng thái:** **RẤT KHẢ THI.**

### Giả thuyết C: Cơ Chế Cache 12 Giờ & Throttling Của Firebase SDK
- **Cơ sở kỹ thuật:** `minimumFetchInterval` mặc định của Firebase Remote Config là 43.200 giây (12 giờ). Khi chưa hết hạn hoặc khi bị server throttle, SDK lập tức trả về cache cục bộ (trong SQLite/Plist của App Sandbox) mà không gửi request mạng.
- **Trạng thái:** **ĐÃ XÁC MINH CƠ CHẾ SDK, NHƯNG KHÔNG PHẢI NGUYÊN NHÂN DUY NHẤT.**

### Giả thuyết D: Giao Thức Khác Hoặc Endpoint Khác
- **Cơ sở kỹ thuật:** Firebase Installations API (`firebaseinstallations.googleapis.com`) chịu trách nhiệm xác thực FID trước khi cấp quyền fetch Remote Config. Nếu FID bị lỗi hoặc bị proxy chặn, quá trình fetch tiếp theo sẽ bị hủy bỏ trong im lặng.
- **Trạng thái:** **CẦN THEO DÕI QUA LOG CHẨN ĐOÁN.**

### Giả thuyết E: Tác Động Tiêu Cực Của Việc Chặn UDP/QUIC
- **Cơ sở kỹ thuật:** Việc cưỡng chế `REJECT UDP` khi client đang thiết lập handshake có thể khiến một số phiên bản iOS Network framework coi kết nối bị lỗi tạm thời và chuyển sang chế độ offline-first đối với cấu hình động.
- **Giải pháp:** Trong Diagnostic Mode, **loại bỏ toàn bộ các quy tắc chặn UDP/QUIC** để quan sát hành vi tự nhiên 100% của thiết bị.

---

## 2. Thẩm Định: Các Cờ Video / Audio / Caption Là Thực Tế Hay Giả Thuyết?

Tuân thủ nghiêm ngặt nguyên tắc trung thực kỹ thuật:

| Cờ Cấu Hình | Giả Thuyết Ban Đầu | Bằng Chứng Kỹ Thuật Thực Tế Trên Locket Hiện Tại | Kết Luận & Đánh Giá |
| :--- | :--- | :--- | :--- |
| `video_max_duration_seconds` | Ép camera cho phép quay đến 60s | **KHÔNG CÓ BẰNG CHỨNG** trên bản Locket hiện tại. Thời lượng camera bị khống chế cứng bởi `AVCaptureMovieFileOutput` / `AVAssetWriter` trong code native Swift. | **UNVERIFIED_HYPOTHESIS** (Giả thuyết chưa kiểm chứng) |
| `video_audio_enabled` | Mở stream âm thanh cho video | **KHÔNG CÓ BẰNG CHỨNG**. Audio recording phụ thuộc vào `AVAudioSession` category và quyền truy cập Microphone, không phụ thuộc Remote Config flat string. | **UNVERIFIED_HYPOTHESIS** (Giả thuyết chưa kiểm chứng) |
| `caption_character_limit` | Tăng số ký tự caption lên 500 | **KHÔNG CÓ BẰNG CHỨNG**. Giới hạn ký tự thường được kiểm tra trực tiếp trong `UITextViewDelegate` (`shouldChangeTextIn`) của iOS client. | **UNVERIFIED_HYPOTHESIS** (Giả thuyết chưa kiểm chứng) |
| `themes_enabled` | Mở bảng theme | **KHÔNG CÓ BẰNG CHỨNG**. Locket Gold Themes được quản lý qua giao dịch In-App Purchase và xác thực biên lai. | **UNVERIFIED_HYPOTHESIS** (Giả thuyết chưa kiểm chứng) |

> [!WARNING]
> **Kết Luận Đanh Thép:** Cần chuyển hướng chiến lược sang **Diagnostic Mode (Chẩn Đoán Thuần Túy)**. Tuyệt đối không tự suy diễn thêm các cờ cấu hình giả định hoặc hứa hẹn thành công khi chưa bắt được gói tin thực tế chứa bằng chứng.

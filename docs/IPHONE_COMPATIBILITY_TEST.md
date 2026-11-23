# Kế Hoạch & Ma Trận Kiểm Thử Trên iPhone Thực Tế — Locket Enhanced v0.1.2

> [!IMPORTANT]
> **Quy chuẩn AGENTS.md & Cam kết kỹ thuật:** Môi trường phát triển hiện tại là Windows và kiểm thử tự động CI. Chưa có thiết bị iPhone vật lý kết nối trực tiếp trong phiên làm việc này. Do đó, tất cả các bước kiểm thử trên thiết bị vật lý được đánh dấu minh bạch là **`NOT_RUN`**, tuyệt đối không báo cáo thành công giả.

---

## 1. Kịch Bản Kiểm Thử & Ma Trận Đánh Giá (Test Matrix)

| Giai Đoạn | Mục Kiểm Thử | Kỳ Vọng Kỹ Thuật | Trạng Thái Thực Tế | Ghi Chú |
| :--- | :--- | :--- | :---: | :--- |
| **A. Baseline (Tắt Module)** | Khởi động Locket gốc | App mở nhanh, tải widget bình thường | **NOT_RUN** | Điểm chuẩn cơ sở trước khi nạp module |
| | Đăng ảnh tĩnh tiêu chuẩn | Ảnh đăng lên widget bạn bè trong 5s | **NOT_RUN** | Đảm bảo kết nối mạng bình thường |
| | Quay video mặc định (3s) | Thanh tiến trình quay dừng sau 3s | **NOT_RUN** | Ghi nhận hành vi gốc của camera Locket |
| | Âm thanh mặc định | Video quay phát đúng thiết lập âm thanh gốc | **NOT_RUN** | Kiểm tra mic và loa iPhone |
| **B. Module Enabled (Bật Module)** | Mở Locket qua Shadowrocket | Không crash, không giật lag, không treo splash | **NOT_RUN** | Kiểm tra tính tương thích TLS MitM |
| | Xác thực & Đăng nhập | Token không bị chặn, tài khoản đăng nhập tốt | **NOT_RUN** | Xác minh không can thiệp Firebase Auth |
| | Camera & Kính ngắm | Kính ngắm hiển thị 60fps, không đơ cảm biến | **NOT_RUN** | Kiểm tra AVFoundation pipeline |
| | Hiển thị Widget iOS | Widget trên màn hình chính cập nhật đều đặn | **NOT_RUN** | Xác nhận không ảnh hưởng WidgetKit timeline |
| | Chuyển vùng mạng (Wi-Fi ↔ 4G/5G)| Không đứt kết nối VPN, không treo request | **NOT_RUN** | Kiểm tra độ ổn định kết nối Shadowrocket |
| **C. Video Tests (Kiểm Thử Video)** | Quay video 5 giây | Camera cho phép bấm giữ 5 giây | **NOT_RUN** | Kiểm tra mốc 5s |
| | Quay video 15 giây | Camera cho phép bấm giữ 15 giây | **NOT_RUN** | Kiểm tra mốc 15s |
| | Quay video 30 giây | Camera cho phép bấm giữ 30 giây | **NOT_RUN** | Cấu hình qua argument `videoDuration=30` |
| | Quay video 45 giây | Camera cho phép bấm giữ 45 giây | **NOT_RUN** | Cấu hình qua argument `videoDuration=45` |
| | Quay video 60 giây | Camera cho phép bấm giữ trọn 60 giây | **NOT_RUN** | Cấu hình mặc định của module |
| | Xác nhận thời lượng file | Metadata file MOV/MP4 đạt đúng thời lượng | **NOT_RUN** | Kiểm tra qua AVAsset inspect |
| | Upload lên máy chủ Locket | Quá trình upload hoàn tất 100%, không bị 413 | **NOT_RUN** | Kiểm tra quota dung lượng Cloud Storage |
| | Hiển thị máy người nhận | Người nhận phát được trọn vẹn clip 60s | **NOT_RUN** | Cần 2 iPhone vật lý kết nối tài khoản bạn bè |
| | Âm thanh máy người nhận | Người nhận nghe rõ âm thanh microphone | **NOT_RUN** | Cần kiểm chứng giải mã codec AAC |
| **D. Caption Tests** | Nhập caption 150 - 500 ký tự | Ô text cho phép nhập và gửi bình thường | **NOT_RUN** | Kiểm tra giới hạn `UITextView` |
| | Server chấp nhận caption dài | Server không báo lỗi `400 Bad Request` | **NOT_RUN** | Kiểm tra Cloud Function validator |
| **E. Rollback (Khôi Phục)** | Tắt Module trong Shadowrocket | Cấu hình mạng trở về bình thường | **NOT_RUN** | Khôi phục không để lại rác |
| | Tắt HTTPS Decrypt | Lưu lượng HTTPS chuyển tiếp trực tiếp | **NOT_RUN** | Kiểm tra tắt MitM |
| | Khởi động lại Locket | App hoạt động bình thường như trước khi cài | **NOT_RUN** | Khôi phục 100% |

---

## 2. Hướng Dẫn Thực Hiện Khi Có iPhone Vật Lý

1. **Chuẩn bị:** 02 iPhone chạy iOS 15+ (Thiết bị A gửi, Thiết bị B nhận).
2. **Kích hoạt ghi log an toàn:** Trong Shadowrocket, bật tính năng *Logging* để quan sát URL `firebaseremoteconfig.googleapis.com` trả về HTTP 200 kèm payload sửa đổi.
3. **Thực hiện lần lượt:** Giai đoạn A -> B -> C -> D -> E.
4. **Ghi nhận sự cố:** Nếu máy chủ từ chối file > 30s, hạ argument xuống `videoDuration=30` hoặc `videoDuration=15`.

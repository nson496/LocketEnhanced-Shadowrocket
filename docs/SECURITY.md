# Chính Sách Bảo Mật & Safe Mode (Security Policy)

Dự án **Locket Enhanced Shadowrocket Edition** tuân thủ các nguyên tắc bảo mật và quyền riêng tư nghiêm ngặt nhằm bảo vệ người dùng.

---

## 🛡️ 1. Nguyên Tắc Cốt Lõi: Zero PII (Không Thu Thập Thông Tin Cá Nhân)

- Module **KHÔNG** đọc, trích xuất hoặc lưu trữ bất kỳ thông tin nhận dạng cá nhân nào (Personally Identifiable Information - PII):
  - Token xác thực người dùng (`idToken`, Firebase auth token, Bearer header).
  - Private key, refresh token, số điện thoại, danh bạ.
  - Vị trí địa lý (GPS coordinates) hoặc hình ảnh/video cá nhân.
- Các script chạy cục bộ trong môi trường JavaScript sandbox của Shadowrocket trên thiết bị người dùng.
- Mọi dữ liệu truyền qua script đều được xử lý in-memory và không gửi tới bất kỳ máy chủ telemetry bên thứ ba nào.

---

## 🔒 2. Giới Hạn Nghiêm Ngặt Về Bảo Mật (Strict Boundaries)

1. **Không can thiệp Trusted Entitlements / Thanh toán:**
   - Phiên bản phân phối công khai **không** bao gồm các đoạn mã can thiệp RevenueCat hoặc App Store Receipt Validation.
   - Điều này nhằm tránh vi phạm cơ chế xác thực mã hóa bất đối xứng của RevenueCat v4.25+ và bảo vệ tài khoản người dùng khỏi nguy cơ bị hệ thống phát hiện gian lận.
2. **Safe Mode Fallback:**
   - Mọi script đều được bọc trong khối `try...catch` và kiểm tra cấu trúc JSON chặt chẽ.
   - Nếu máy chủ Firebase Remote Config hoặc Locket thay đổi định dạng phản hồi (schema mismatch), script sẽ tự động trả về nguyên bản nội dung gốc mà không làm crash ứng dụng Locket.

---

## 🚨 3. Báo Cáo Lỗ Hổng Bảo Mật

Nếu bạn phát hiện bất kỳ nguy cơ rò rỉ dữ liệu hoặc vấn đề an toàn bảo mật nào trong script:
- Vui lòng mở Issue bảo mật hoặc gửi thông tin qua kênh GitHub của repository.
- Chúng tôi cam kết xử lý và phản hồi trong vòng 24 - 48 giờ.

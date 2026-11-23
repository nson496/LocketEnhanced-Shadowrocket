# Hướng Dẫn Cài Đặt Locket Enhanced Shadowrocket Edition

Tài liệu này hướng dẫn từng bước thiết lập Shadowrocket trên iPhone để nạp module **Locket Enhanced**.

---

## 📋 Yêu Cầu Chuẩn Bị
- iPhone chạy iOS 14.0 trở lên.
- Đã cài đặt ứng dụng **Shadowrocket** (từ App Store).
- Đã cài đặt ứng dụng **Locket Widget** chính thức.
- Kết nối Internet ổn định.

---

## 🛠️ Bước 1: Cấu Hình HTTPS Giải Mã (MitM & CA Certificate)

Để Shadowrocket có thể can thiệp và ghi đè Remote Config của Locket:

1. Mở **Shadowrocket** > chuyển sang tab **Cấu hình** (Config).
2. Nhấn vào file cấu hình đang kích hoạt (có dấu tích cam/xanh bên cạnh, ví dụ `default.conf`).
3. Chọn **Chỉnh sửa cấu hình** (Edit Config).
4. Tìm và chọn mục **HTTPS Giải mã** (HTTPS Decryption / MitM):
   - Bật công tắc **HTTPS Giải mã** (Status: Bật).
   - Nhấn **Tạo chứng chỉ mới** (Generate New CA).
   - Nhấn **Cài đặt chứng chỉ vào hệ thống** (Install Certificate to System) > Nhấn **Cho phép** (Allow) để tải profile cấu hình về máy.
5. **Kích hoạt chứng chỉ trên iOS Settings:**
   - Vào **Cài đặt (Settings)** trên iPhone > chọn **Đã tải về hồ sơ (Profile Downloaded)** > Nhấn **Cài đặt (Install)**.
   - Tiếp tục vào **Cài đặt (Settings)** > **Cài đặt chung (General)** > **Giới thiệu (About)** > cuộn xuống dưới cùng chọn **Cài đặt tin cậy chứng nhận (Certificate Trust Settings)**.
   - Tìm chứng chỉ của **Shadowrocket** và gạt công tắc sang **Bật (Enable Full Trust)** > Chọn **Tiếp tục**.

---

## 📦 Bước 2: Nhập Module Locket Enhanced

### Lựa chọn 1 trong 2 phiên bản:

- **Bản Tiêu Chuẩn (Ổn Định):**
  ```text
  https://raw.githubusercontent.com/nson496/LocketEnhanced-Shadowrocket/main/modules/LocketEnhanced.sgmodule
  ```

- **Bản Beta (Có thể tùy biến thông số thời lượng video, audio):**
  ```text
  https://raw.githubusercontent.com/nson496/LocketEnhanced-Shadowrocket/main/modules/LocketEnhanced-Beta.sgmodule
  ```

### Các bước nhập:
1. Trong Shadowrocket > tab **Cấu hình (Config)**.
2. Cuộn xuống mục **Mô-đun (Modules)** > nhấn vào biểu tượng **`+`** ở góc trên bên phải.
3. Dán đường dẫn URL ở trên vào ô trống rồi nhấn **Xác nhận (Done)**.
4. Shadowrocket sẽ tải và giải nén module.
5. Đảm bảo công tắc bên cạnh tên module `LocketEnhanced` được gạt sang **Bật (Kích hoạt)**.

---

## ⚡ Bước 3: Áp Dụng & Kiểm Tra

1. Quay lại tab chính (Home) của Shadowrocket.
2. Bật kết nối VPN của Shadowrocket.
3. Vuốt tắt hoàn toàn ứng dụng **Locket** từ App Switcher (Force Close Locket).
4. Mở lại ứng dụng **Locket**:
   - Thử giữ nút quay video: Thời lượng tối đa sẽ được mở rộng lên tới **60 giây**.
   - Thử viết caption: Giới hạn ký tự được nâng lên tới **500 ký tự**.
   - Âm thanh video giữ nguyên độ nét cao.

---

## ❓ Xử Lý Sự Cố (Troubleshooting)

### 1. Không áp dụng được cấu hình mới, video vẫn bị giới hạn 3s/10s?
- **Nguyên nhân:** Locket đang cache Firebase Remote Config cũ trong sandbox local.
- **Cách khắc phục:** 
  1. Kiểm tra chắc chắn module đã bật script `locket_rc_request.js` (tự động xóa cache headers).
  2. Xóa cache hoặc vuốt tắt Locket, ngắt kết nối Shadowrocket rồi bật lại, sau đó mở lại Locket.

### 2. Gặp lỗi SSL Pinning hoặc mất kết nối mạng khi bật HTTPS Decryption?
- **Cách khắc phục:** Kiểm tra lại **Bước 1.5** xem chứng chỉ Shadowrocket đã được cấp quyền "Tin cậy hoàn toàn" (Full Trust) trong *Certificate Trust Settings* chưa.

### 3. Có an toàn cho tài khoản Locket không?
- Hoàn toàn an toàn. Module chỉ can thiệp các cờ hiển thị client-side (Remote Config), không can thiệp API bạn bè, không lấy token và không sửa đổi giao dịch App Store.

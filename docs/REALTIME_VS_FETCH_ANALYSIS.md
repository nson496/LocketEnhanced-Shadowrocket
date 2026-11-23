# Phân Tích Kỹ Thuật: Firebase Remote Config Realtime vs Fetch & Bộ Nhớ Đệm iOS

Tài liệu này ghi nhận nguyên nhân kỹ thuật, phân tích giao thức và giải pháp xử lý hiện tượng không bắt được gói tin `firebaseremoteconfig.googleapis.com` trên iPhone trong quá trình kiểm thử thực tế.

---

## 1. Bản Chất Kỹ Thuật Của Hai Endpoint Firebase

| Tiêu Chí | Standard Fetch (`firebaseremoteconfig.googleapis.com`) | Realtime Stream (`firebaseremoteconfigrealtime.googleapis.com`) |
| :--- | :--- | :--- |
| **API Endpoint** | `POST /v1/projects/{projectId}/namespaces/firebase:fetch` | `POST /v1/projects/{projectId}/namespaces/firebase:streamFetchInvalidations` |
| **Giao Thức Mạng** | HTTPS REST thông thường (Short-lived request) | HTTP/2 Streaming / Long-lived chunked stream |
| **Nội Dung Phản Hồi** | **Toàn bộ cấu hình:** `{ "entries": { ... }, "state": "UPDATE", "templateVersion": "..." }` | **Chỉ chứa tín hiệu báo thay đổi:** `{ "templateVersion": "..." }` |
| **Mục Đích** | Tải các cặp cờ key-value cấu hình về máy khách | Lắng nghe thông báo khi bảng cấu hình trên Firebase Console được cập nhật |
| **Khả Năng Can Thiệp** | **HOÀN TOÀN TƯƠNG THÍCH** với script rewrite JSON | **KHÔNG THỂ REWRITE ENTRIES** (SDK client mong đợi tín hiệu stream, nếu chèn `entries` sẽ gây vỡ stream hoặc crash parser `RCNConfigRealtime.m`) |

---

## 2. Vì Sao iPhone Không Gửi Yêu Cầu Đến `firebaseremoteconfig.googleapis.com`?

### Nguyên nhân 1: Cơ Chế Bộ Nhớ Đệm Cục Bộ (Client Disk Cache / TTL 12 Giờ)
- Trong Firebase Apple SDK (`firebase-ios-sdk`), Remote Config mặc định thiết lập thời gian hết hạn bộ nhớ đệm (`minimumFetchInterval`) là **12 giờ (43.200 giây)** đối với môi trường production.
- Khi ứng dụng Locket khởi động trên iPhone:
  1. SDK kiểm tra bộ nhớ đệm cục bộ trong sandbox ứng dụng (SQLite / Plist / LevelDB).
  2. Nếu thời gian từ lần fetch trước đó chưa vượt quá 12 giờ và không nhận được thông báo thay đổi, SDK **sử dụng trực tiếp cấu hình trong bộ nhớ đệm** mà **KHÔNG GỬI BẤT KỲ YÊU CẦU MẠNG NÀO** tới `firebaseremoteconfig.googleapis.com`.

### Nguyên nhân 2: Kết Nối Realtime Stream Hoạt Động Nhưng Không Có Tín Hiệu Mới
- Locket kết nối tới `firebaseremoteconfigrealtime.googleapis.com` để mở stream `:streamFetchInvalidations`.
- Khi máy chủ Firebase Console không phát hành phiên bản cấu hình mới, stream này ở trạng thái chờ (idle/keep-alive).
- Do không nhận được tín hiệu `templateVersion` mới từ stream, SDK Locket không kích hoạt hàm `fetchAndActivate()`, dẫn đến việc không có request fetch nào được phát sinh.

### Nguyên nhân 3: Giao Thức UDP / QUIC Chưa Bị Chặn Trên Endpoint Realtime
- Trong phiên bản `v0.1.3-beta`, quy tắc `[Rule]` chỉ mới chặn UDP trên `firebaseremoteconfig.googleapis.com`.
- Kết nối tới `firebaseremoteconfigrealtime.googleapis.com` có thể đã sử dụng giao thức HTTP/3 (QUIC qua UDP), khiến proxy HTTPS thông thường của Shadowrocket không phân giải và giải mã được nội dung.

---

## 3. Giải Pháp Kỹ Thuật Đạt Chuẩn Trong v0.1.4-beta

1. **Không Chèn `entries` Vào Endpoint Realtime:**
   - Giữ nguyên luồng stream của `firebaseremoteconfigrealtime.googleapis.com`, tuyệt đối không rewrite body của stream này để tránh gây treo kết nối hoặc crash `RCNConfigRealtime`.
2. **Bổ Sung Bộ Ghi Nhận Chẩn Đoán (Diagnostic Logger):**
   - Tạo `scripts/utils/locket_diagnostic.js` dành cho `firebaseremoteconfigrealtime.googleapis.com`.
   - Chỉ ghi lại metadata tối thiểu: Timestamp, Method, Path, Hostname.
   - **Zero PII:** Tuyệt đối không ghi token, cookie, request/response body, API keys.
   - Trả về `$done({})` ngay lập tức để không gây độ trễ hoặc chặn stream HTTP/2.
3. **Chặn UDP/QUIC Cả Hai Endpoint:**
   - Bổ sung quy tắc: `AND,((DOMAIN,firebaseremoteconfigrealtime.googleapis.com),(PROTOCOL,UDP)),REJECT` để ép iOS sử dụng TCP, giúp Shadowrocket quan sát được toàn bộ kết nối.
4. **Quy Trình Buộc Client Kích Hoạt Fetch:**
   - Để xóa cache 12 giờ của Locket và ép client phải fetch cấu hình mới ngay lập tức qua `firebaseremoteconfig.googleapis.com`:
     - **Cách 1 (Khuyên dùng):** Xóa ứng dụng Locket và cài đặt lại (hoặc xóa dữ liệu ứng dụng trong iPhone Settings nếu có) trong khi Shadowrocket VPN đang BẬT. Khi đó app không có cache local và bắt buộc phải gọi `POST /v1/projects/...:fetch` ngay trong lần mở đầu tiên.
     - **Cách 2:** Đợi hết chu kỳ cache 12 giờ của Firebase SDK.

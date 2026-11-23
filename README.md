# Locket Enhanced — Shadowrocket Edition

[![Release](https://img.shields.io/badge/Release-v0.1.6--beta-blue.svg)](https://github.com/nson496/LocketEnhanced-Shadowrocket/releases)
[![Status](https://img.shields.io/badge/Status-Public%20Distribution-success.svg)](https://github.com/nson496/LocketEnhanced-Shadowrocket)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Zero PII](https://img.shields.io/badge/Privacy-Zero%20PII-brightgreen.svg)](docs/SECURITY.md)

Locket Enhanced Shadowrocket Edition là hệ sinh thái công cụ dành cho ứng dụng Locket chính thức trên iPhone thông qua Shadowrocket (Network Diagnostic, Rewrite & Remote Config Customization), không cần jailbreak, không cần cài IPA mod.

---

## 🚀 Quick Install (Cài Đặt Nhanh v0.1.6-beta)

### 🔬 Khuyên Dùng: Chế Độ Chẩn Đoán Độc Lập (Diagnostic Only)
*Giám sát lưu lượng mạng thụ động, không sửa đổi dữ liệu, không chặn UDP/QUIC, xác định chính xác endpoint Locket thực tế sử dụng:*
- **One-Click Import Safari:**
  ```text
  shadowrocket://install/module?url=https%3A%2F%2Fraw.githubusercontent.com%2Fnson496%2FLocketEnhanced-Shadowrocket%2Fv0.1.6-beta%2Fmodules%2FLocketEnhanced-Diagnostic.sgmodule
  ```
- **HTTPS URL Thủ Công:**
  ```text
  https://raw.githubusercontent.com/nson496/LocketEnhanced-Shadowrocket/v0.1.6-beta/modules/LocketEnhanced-Diagnostic.sgmodule
  ```

---

### 📦 Các Module Tinh Chỉnh Khác (Experimental)

- **Bản Tiêu Chuẩn (Stable Remote Config - v0.1.6-beta):**
  ```text
  https://raw.githubusercontent.com/nson496/LocketEnhanced-Shadowrocket/v0.1.6-beta/modules/LocketEnhanced.sgmodule
  ```

- **Bản Beta (Configurable Arguments, Realtime Diag - v0.1.6-beta):**
  ```text
  https://raw.githubusercontent.com/nson496/LocketEnhanced-Shadowrocket/v0.1.6-beta/modules/LocketEnhanced-Beta.sgmodule
  ```

4. Bật công tắc Module vừa thêm.
5. Cấu hình HTTPS Decryption (MitM) và chứng chỉ CA (xem [Hướng Dẫn Chi Tiết](docs/INSTALL.md)).

---

## ✨ Tính Năng Hỗ Trợ (Feature Feasibility Matrix)

| Tính Năng | Cơ Chế Thực Tế | Trạng Thái | Ghi Chú Kỹ Thuật |
| :--- | :--- | :--- | :--- |
| **Passive Diagnostic Mode** | HTTP Request & Response logger không can thiệp luồng | 🟢 **VERIFIED** | Đã xác nhận hoạt động 100% trên iPhone thực tế qua log `[LocketDiag]` |
| **QUIC Rejection & TCP Fallback** | `[Rule]` reject UDP port 443 trên domain Remote Config | 🟢 **VERIFIED** | Ép iOS network stack fallback sang TCP HTTP/2 để Shadowrocket MITM giải mã được |
| **Cache-Busting (304 Guard)** | `[Header Rewrite]` xóa `If-None-Match` & `If-Modified-Since` | 🟢 **VERIFIED** | Đảm bảo máy chủ Firebase luôn trả HTTP 200 cùng payload mới nhất |
| **Video Duration (60s)** | Client Remote Config (`camera.max_duration`, `feature_gates`) | 🟡 **NOT_VERIFIED** | Payload đã được ghi đè, nhưng native AVFoundation & backend server chưa xác nhận chấp thuận moment > 10s |
| **Extended Captions** | Client Remote Config (`captions_enabled`, `long_captions`) | 🟡 **NOT_VERIFIED** | Đã cập nhật `feature_gates.long_captions = "enabled"`, cần backend API hỗ trợ lưu caption dài |
| **UI Themes Customization** | Client Remote Config (`feature_gates.camera_theme`, `app_icon_picker`) | 🟡 **NOT_VERIFIED** | Cờ cấu hình đã bật trong Remote Config, cần kiểm tra render thực tế trên Swift UIKit |
| **RevenueCat Receipt Spoofing** | Giả lập hóa đơn thanh toán / fake entitlement | 🔴 **NOT_SUPPORTED** | Nghiêm cấm theo nguyên tắc an toàn, đạo đức & chống vi phạm pháp luật |

> [!NOTE]
> Dự án áp dụng nguyên tắc **No Fake Success**: Không tuyên bố tính năng hoạt động nếu chưa có kiểm chứng phần cứng thực tế và máy chủ xác nhận. Tuyệt đối không giả mạo giao dịch thanh toán hoặc hóa đơn.

---

## 📖 Tài Liệu Tham Khảo

- 📘 [Hướng dẫn cài đặt và thiết lập Shadowrocket (INSTALL.md)](docs/INSTALL.md)
- 🔒 [Chính sách bảo mật & Safe Mode (SECURITY.md)](docs/SECURITY.md)
- 📝 [Nhật ký cập nhật phiên bản (CHANGELOG.md)](docs/CHANGELOG.md)

---

## ⚖️ Tuyên Bố Miễn Trừ Trách Nhiệm (Disclaimer)
Dự án được phát triển nhằm mục đích nghiên cứu và học tập kiến trúc giao thức mạng iOS. Dự án không liên kết với Locket Camera, Inc. Người dùng chịu trách nhiệm về việc tuân thủ điều khoản dịch vụ của bên thứ ba khi sử dụng module.

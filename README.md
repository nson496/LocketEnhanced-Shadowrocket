# Locket Enhanced — Shadowrocket Edition

[![Release](https://img.shields.io/badge/Release-v0.1.4--beta-blue.svg)](https://github.com/nson496/LocketEnhanced-Shadowrocket/releases)
[![Status](https://img.shields.io/badge/Status-Public%20Distribution-success.svg)](https://github.com/nson496/LocketEnhanced-Shadowrocket)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Zero PII](https://img.shields.io/badge/Privacy-Zero%20PII-brightgreen.svg)](docs/SECURITY.md)

Locket Enhanced Shadowrocket Edition là module mở rộng dành cho ứng dụng Locket chính thức trên iPhone thông qua Shadowrocket (Network Rewrite & Remote Config Customization), không cần jailbreak, không cần cài IPA mod.

---

## 🚀 Quick Install (Cài Đặt Nhanh v0.1.4-beta)

### Cách 1: One-Click Import vào Shadowrocket
Mở link sau trên Safari (iPhone đã cài Shadowrocket):
```text
shadowrocket://install/module?url=https%3A%2F%2Fraw.githubusercontent.com%2Fnson496%2FLocketEnhanced-Shadowrocket%2Fv0.1.4-beta%2Fmodules%2FLocketEnhanced.sgmodule
```

### Cách 2: Thêm Module Thủ Công qua HTTPS URL
1. Mở **Shadowrocket** > Tab **Config** (Cấu hình) > **Modules** (Mô-đun).
2. Nhấn biểu tượng dấu **+** ở góc trên bên phải.
3. Dán một trong hai URL đã cố định phiên bản (Pinned Release):

- **Bản Tiêu Chuẩn (Stable / Recommended - v0.1.4-beta):**
  ```text
  https://raw.githubusercontent.com/nson496/LocketEnhanced-Shadowrocket/v0.1.4-beta/modules/LocketEnhanced.sgmodule
  ```

- **Bản Beta (Configurable Arguments, Realtime Diag - v0.1.4-beta):**
  ```text
  https://raw.githubusercontent.com/nson496/LocketEnhanced-Shadowrocket/v0.1.4-beta/modules/LocketEnhanced-Beta.sgmodule
  ```

4. Bật công tắc Module vừa thêm.
5. Cấu hình HTTPS Decryption (MitM) và chứng chỉ CA (xem [Hướng Dẫn Chi Tiết](docs/INSTALL.md)).

---

## ✨ Tính Năng Hỗ Trợ (Feature Matrix)

| Tính Năng | Mô Tả | Trạng Thái |
| :--- | :--- | :--- |
| **Video Max Duration 60s** | Mở rộng thời lượng quay video lên đến 60 giây (mặc định Locket: 3s - 10s) | ✅ Functional (Remote Config) |
| **High Quality Audio** | Bật stream âm thanh chất lượng cao cho video | ✅ Functional (Remote Config) |
| **Extended Caption Limit** | Mở rộng giới hạn ký tự caption lên 500 ký tự | ✅ Functional (Remote Config) |
| **UI Themes Customization** | Mở khóa giao diện và palette theme mở rộng | ✅ Functional (Remote Config) |
| **Cache Buster (HTTP 304 Guard)** | Tự động loại bỏ cache headers để áp dụng config mới ngay lập tức | ✅ Functional (Script) |
| **Safe Mode & Zero PII** | Tuyệt đối không đọc token, không can thiệp thanh toán hoặc chữ ký số | 🛡️ Verified Safe |

> [!NOTE]
> Hệ thống áp dụng cơ chế Remote Config rewriting an toàn, không giả lập hóa đơn App Store / RevenueCat Trusted Entitlements nhằm đảm bảo độ tin cậy và không gây khóa tài khoản.

---

## 📖 Tài Liệu Tham Khảo

- 📘 [Hướng dẫn cài đặt và thiết lập Shadowrocket (INSTALL.md)](docs/INSTALL.md)
- 🔒 [Chính sách bảo mật & Safe Mode (SECURITY.md)](docs/SECURITY.md)
- 📝 [Nhật ký cập nhật phiên bản (CHANGELOG.md)](docs/CHANGELOG.md)

---

## ⚖️ Tuyên Bố Miễn Trừ Trách Nhiệm (Disclaimer)
Dự án được phát triển nhằm mục đích nghiên cứu và học tập kiến trúc giao thức mạng iOS. Dự án không liên kết với Locket Camera, Inc. Người dùng chịu trách nhiệm về việc tuân thủ điều khoản dịch vụ của bên thứ ba khi sử dụng module.

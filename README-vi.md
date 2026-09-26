# Cope Manager

[![English](https://img.shields.io/badge/lang-English-0A66C2?style=for-the-badge)](README.md)
[![Tiếng Việt](https://img.shields.io/badge/lang-Tiếng%20Việt-DA251D?style=for-the-badge)](README-vi.md)

Web-based file manager và code editor — viết lại / nâng cấp trên nền [php-filemanager](https://github.com/cubiclesoft/php-filemanager) của [CubicleSoft](https://github.com/cubiclesoft).

![Cope Manager — File Explorer](https://i.imgur.com/RlwVp8i.png)

![Cope Manager — Code Editor](https://i.imgur.com/xIqgc0K.png)

## Giới thiệu

Cope Manager giữ kiến trúc nhẹ, dễ cài của bản gốc và bổ sung trải nghiệm quản lý file / chỉnh sửa code hiện đại hơn: explorer đầy đủ thao tác, editor tabbed (ACE), nén / giải nén, thùng rác, và cấu hình đuôi file linh hoạt hơn.

Phù hợp để quản lý file trên hosting PHP, chỉnh sửa mã nguồn trên trình duyệt, hoặc nhúng vào hệ thống có sẵn qua `index_hook.php`.

## Tính năng

- **File Explorer** — duyệt, tạo, đổi tên, copy / move / xóa, upload, download.
- **Code editor tabbed** — [ACE Editor](https://ace.c9.io/), theme / keybinding (gồm VS Code), preview file.
- **Nén & giải nén** — compress / extract trực tiếp trong explorer.
- **Recycle Bin** — xóa mềm (bật/tắt khi cài đặt).
- **Phân quyền đuôi file** — chế độ All / Allow (whitelist) / Exclude (blacklist).
- **Mobile-friendly** — dùng được trên điện thoại.
- **Cài đặt nhanh** — wizard `install.php` trên mọi host PHP.
- **Tích hợp login** — hook `index_hook.php` để gắn hệ thống đăng nhập riêng.

## Yêu cầu

- PHP 5.6+ (khuyến nghị PHP 7+ / 8+)
- Thư mục lưu file ghi được bởi web server

## Cài đặt

1. Clone hoặc tải source về thư mục trên web server:

```bash
git clone https://github.com/copecute/cope-manager.git
```

2. Mở `install.php` trên trình duyệt và làm theo wizard.
3. Chỉ định **File storage path** (thư mục chứa file cần quản lý) và tùy chọn **File storage base URL**.
4. Đặt mật khẩu đăng nhập (hoặc để trống và dùng `index_hook.php` với hệ thống login riêng).
5. Sau khi cài xong, bảo vệ thư mục cài đặt (không để công khai nếu không cần), rồi mở trang chính để dùng.

Nếu không cần editor / preview dạng tab, chọn tắt **Use Tabbed Editor/Viewer** khi cài — File Explorer sẽ chiếm toàn bộ giao diện.

Cấu hình nằm trong `config.php` (file này không commit; xem `.gitignore`).

## Tích hợp

Tạo `index_hook.php` để kiểm tra session / quyền người dùng và điều chỉnh `$config` nếu cần.

Hai hook tùy chọn:

- `ModifyFileExplorerOptions(&$options)` — chỉnh options phía server trước khi xử lý action.
- `ModifyFileManagerOptions()` — emit thêm JS để chỉnh options phía client (ví dụ thêm param XHR).

Mọi request từ client vẫn phải được server xác thực quyền truy cập.

## Nguồn gốc & ghi công

Dựa trên:

- [cubiclesoft/php-filemanager](https://github.com/cubiclesoft/php-filemanager)
- [cubiclesoft/js-fileexplorer](https://github.com/cubiclesoft/js-fileexplorer)

Cope Manager là bản viết lại / nâng cấp bởi [copecute](https://github.com/copecute). Cảm ơn CubicleSoft vì nền tảng mã nguồn mở ban đầu.

## License

Theo bản gốc php-filemanager: chọn **MIT** hoặc **LGPL**.

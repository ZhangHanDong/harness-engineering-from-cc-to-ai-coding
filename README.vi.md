<p align="center">
  <img src="./book/src/assets/cover-en.jpeg" alt="Ảnh bìa Kỹ nghệ Điều khiển" width="420">
</p>

[简体中文](./README.md) | [English](./README.en.md)

# Kỹ nghệ Điều khiển: Từ Bản chất Claude Code đến Thực tiễn AI Coding Tốt nhất

Kho lưu trữ này xuất bản cuốn sách kỹ thuật về **Kỹ nghệ Điều khiển (Harness Engineering)** thông qua lăng kính của Claude Code. Nội dung sách được đúc kết từ phân tích ngược gói phân phối công khai của Claude Code `v2.1.88` và tái cấu trúc source map, tập trung vào các mẫu kỹ nghệ có thể tái sử dụng thay vì quảng cáo sản phẩm hay tin đồn tính năng.

Bản dịch tiếng Việt được cung cấp nhằm hỗ trợ các kỹ sư Việt Nam tiếp cận các tri thức thiết kế và triển khai AI Agent chất lượng cao.

## Đọc trực tuyến

- Bản tiếng Việt (Xem trước): <https://zhanghandong.github.io/harness-engineering-from-cc-to-ai-coding/vi/>
- Bản tiếng Anh (Xem trước): <https://zhanghandong.github.io/harness-engineering-from-cc-to-ai-coding/en/>
- Bản tiếng Trung: <https://zhanghandong.github.io/harness-engineering-from-cc-to-ai-coding/>

## Các nội dung chính của Sách

- Kiến trúc Claude Code, Vòng lặp Agent (Agent Loop) và điều phối thực thi công cụ.
- Prompt hệ thống (System Prompt), Prompt công cụ và tối ưu hóa theo mô hình cụ thể.
- Nén ngữ cảnh tự động (Auto Compaction), chiến lược dự toán token và prompt caching.
- Chế độ phân quyền, quy tắc an toàn, Hook điều khiển và ghi đè chỉ thị người dùng (CLAUDE.md).
- Điều phối đa Agent, hệ thống kỹ năng (Skills System) và đường ống tính năng thử nghiệm (Feature Flags).
- Bài học định hướng sản xuất để xây dựng hệ thống lập trình AI.

## Đối tượng độc giả

- Kỹ sư đang xây dựng sản phẩm AI coding hoặc hạ tầng Agent.
- Lập trình viên muốn hiểu chi tiết cơ chế hoạt động bên trong của Claude Code.
- Đội ngũ tìm kiếm các mẫu thiết kế và triển khai có thể tái sử dụng từ một hệ thống Agent thực tế.

## Xem trước cục bộ

```bash
# Dựng sách tiếng Việt
mdbook build book-vi
mdbook serve book-vi -p 3002
```

Địa chỉ truy cập mặc định:

- Bản tiếng Việt: <http://localhost:3002>
- Bản tiếng Anh: <http://localhost:3001>
- Bản tiếng Trung: <http://localhost:3000>

## Lưu ý

- Sách này dựa trên phân tích gói phân phối công khai và chỉ dành cho mục đích nghiên cứu, thảo luận kỹ thuật.
- Nội dung không đại diện cho tài liệu hoặc tuyên bố chính thức của Anthropic.
- Kho lưu trữ này chỉ theo dõi các tệp cần thiết để xuất bản sách lên GitHub Pages.

# Mục lục

[Lời nói đầu](./preface.md)

---

# Phần I: Kiến trúc — Cách hoạt động của Claude Code

- [Chương 1: Toàn bộ ngăn xếp công nghệ của một AI Coding Agent](./part1/ch01.md)
- [Chương 2: Hệ thống công cụ — Hơn 40 công cụ đóng vai trò như đôi tay của mô hình](./part1/ch02.md)
- [Chương 3: Vòng lặp Agent — Toàn bộ chu kỳ từ đầu vào của người dùng đến phản hồi của mô hình](./part1/ch03.md)
- [Chương 4: Điều phối thực thi công cụ — Phân quyền, đồng thời, truyền dữ liệu dạng luồng và ngắt quãng](./part1/ch04.md)
- [Chương 4b: Chế độ lập kế hoạch — Từ "Hành động trước, hỏi sau" đến "Nhìn trước khi nhảy"](./part1/ch04b.md)

---

# Phần II: Kỹ nghệ Prompt — System Prompt đóng vai trò mặt phẳng điều khiển

- [Chương 5: Kiến trúc System Prompt](./part2/ch05.md)
- [Chương 6: Điều hướng hành vi thông qua Prompt](./part2/ch06.md)
- [Chương 6b: Lớp giao tiếp API — Retry, Streaming, và kỹ nghệ hạ cấp](./part2/ch06b.md)
- [Chương 7: Tinh chỉnh tối ưu theo mô hình và thử nghiệm A/B](./part2/ch07.md)
- [Chương 8: Tool Prompt đóng vai trò như các vi dây cương](./part2/ch08.md)

---

# Phần III: Quản lý ngữ cảnh — Đấu trường 200K Token

- [Chương 9: Tự động nén — Khi nào và làm thế nào ngữ cảnh được nén](./part3/ch09.md)
- [Chương 10: Bảo toàn trạng thái tệp sau khi nén](./part3/ch10.md)
- [Chương 11: Vi nén — Cắt tỉa ngữ cảnh chính xác](./part3/ch11.md)
- [Chương 12: Chiến lược phân bổ ngân sách Token](./part3/ch12.md)

---

# Phần IV: Bộ nhớ đệm Prompt — Trình tối ưu hóa chi phí ẩn

- [Chương 13: Kiến trúc bộ nhớ đệm và thiết kế điểm ngắt](./part4/ch13.md)
- [Chương 14: Hệ thống phát hiện điểm ngắt bộ nhớ đệm](./part4/ch14.md)
- [Chương 15: Các mẫu tối ưu hóa bộ nhớ đệm](./part4/ch15.md)

---

# Phần V: An toàn và Phân quyền — Phòng thủ theo chiều sâu

- [Chương 16: Hệ thống phân quyền](./part5/ch16.md)
- [Chương 17: Bộ phân loại YOLO](./part5/ch17.md)
- [Chương 17b: Phòng thủ tấn công chèn Prompt — Từ làm sạch mã Unicode đến phòng thủ theo chiều sâu](./part5/ch17b.md)
- [Chương 18: Hooks — Các điểm chặn do người dùng định nghĩa](./part5/ch18.md)
- [Chương 18b: Hệ thống Sandbox — Cô lập đa nền tảng từ Seatbelt đến Bubblewrap](./part5/ch18b.md)
- [Chương 19: CLAUDE.md — Hướng dẫn của người dùng làm lớp ghi đè](./part5/ch19.md)

---

# Phần VI: Các phân hệ nâng cao

- [Chương 20: Khởi tạo và điều phối Agent](./part6/ch20.md)
- [Chương 20b: Teams và cộng tác đa tiến trình](./part6/ch20b.md)
- [Chương 20c: Ultraplan — Lập kế hoạch đa tác nhân từ xa](./part6/ch20c.md)
- [Chương 21: Nỗ lực lập luận, Chế độ nhanh và Lập luận độc lập](./part6/ch21.md)
- [Chương 22: Hệ thống kỹ năng — Từ tích hợp sẵn đến do người dùng định nghĩa](./part6/ch22.md)
- [Chương 22b: Hệ thống Plugin — Từ đóng gói đến kỹ nghệ mở rộng chợ ứng dụng](./part6/ch22b.md)
- [Chương 23: Lộ trình phát triển tính năng chưa phát hành — Bản đồ phía sau 89 cờ tính năng](./part6/ch23.md)
- [Chương 24: Bộ nhớ liên phiên làm việc — Từ đãng trí đến học tập bền vững](./part6/ch24.md)

---

# Phần VII: Bài học cho nhà phát triển AI Agent

- [Chương 25: Nguyên lý kỹ nghệ dây cương](./part7/ch25.md)
- [Chương 26: Quản lý ngữ cảnh như một năng lực cốt lõi](./part7/ch26.md)
- [Chương 27: Các mẫu AI Coding cấp sản xuất](./part7/ch27.md)
- [Chương 28: Điểm hạn chế của Claude Code](./part7/ch28.md)
- [Chương 29: Kỹ nghệ giám sát hành vi — Từ logEvent đến đo lường từ xa cấp sản xuất](./part7/ch29.md)
- [Chương 30: Tự xây dựng AI Agent của riêng bạn — Từ các mẫu thiết kế của Claude Code đến thực tiễn](./part7/ch30.md)

---

# Phụ lục

- [Phụ lục A: Chỉ mục các tệp chính](./appendix/a-file-index.md)
- [Phụ lục B: Tài liệu tham khảo biến môi trường](./appendix/b-env-vars.md)
- [Phụ lục C: Thuật ngữ chuyên ngành](./appendix/c-glossary.md)
- [Phụ lục D: Danh sách đầy đủ 89 cờ tính năng](./appendix/d-feature-flags.md)
- [Phụ lục E: Nhật ký phát triển các phiên bản](./appendix/e-version-evolution.md)
- [Phụ lục F: Dấu vết trường hợp thực tế đầu-cuối](./appendix/f-e2e-traces.md)
- [Phụ lục G: Hệ thống xác thực & Đăng ký thuê bao](./appendix/g-auth-subscription.md)

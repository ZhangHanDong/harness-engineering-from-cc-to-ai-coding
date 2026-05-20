# Phụ lục C: Thuật ngữ chuyên ngành

Phụ lục này tập hợp các thuật ngữ kỹ thuật xuất hiện xuyên suốt cuốn sách, được sắp xếp theo thứ tự chữ cái tiếng Anh.

| Thuật ngữ | Định nghĩa | Xuất hiện đầu tiên |
|------|-----------|-----------|
| Vòng lặp Agent (Agent Loop) | Vòng lặp thực thi cốt lõi của một AI Agent: nhận đầu vào -> gọi mô hình -> thực thi công cụ -> quyết định xem có tiếp tục hay không | Chương 3 |
| Cây cú pháp trừu tượng (AST - Abstract Syntax Tree) | Cấu trúc dạng cây biểu diễn mã nguồn giúp bảo toàn các mối quan hệ ngữ nghĩa (thay vì văn bản thuần túy) | Chương 28 |
| Ngắt bộ nhớ đệm (Cache Break) | Sự kiện phần tiền tố của bộ nhớ đệm prompt bị vô hiệu hóa do thay đổi nội dung | Chương 14 |
| Cơ chế ngắt mạch (Circuit Breaker) | Bắt buộc một tiến trình tự động phải dừng lại sau N lần thất bại liên tiếp, hạ cấp xuống trạng thái an toàn | Các chương 9, 26 |
| Nén ngữ cảnh (Compaction) | Tóm tắt lịch sử hội thoại để giải phóng không gian cửa sổ ngữ cảnh | Chương 9 |
| Loại bỏ mã chết (DCE - Dead Code Elimination) | Hàm `feature()` của Bun cho phép loại bỏ mã nguồn bị chặn ở thời điểm biên dịch | Chương 1 |
| Sử dụng Git phòng thủ (Defensive Git) | Một mẫu thiết kế ngăn ngừa mất dữ liệu trong các hoạt động Git do AI thực hiện thông qua các quy tắc an toàn rõ ràng | Chương 27 |
| Ranh giới động (Dynamic Boundary) | Một điểm đánh dấu trong system prompt phân chia nội dung tĩnh có thể lưu bộ nhớ đệm với nội dung động của phiên làm việc | Chương 5 |
| Phòng thủ nghiêm ngặt (Fail-Closed) | Hệ thống mặc định chọn tùy chọn an toàn nhất; yêu cầu khai báo rõ ràng để mở khóa các thao tác nguy hiểm | Các chương 2, 25 |
| Cờ tính năng (Feature Flag - tengu_*) | Các cổng thử nghiệm được cấu hình khi chạy ứng dụng thông qua GrowthBook, dùng để bật/tắt tính năng | Các chương 1, 23 |
| Quyền tự chủ phân cấp (Graduated Autonomy) | Các chế độ phân quyền nhiều cấp độ từ xác nhận thủ công đến tự động hóa hoàn toàn, mỗi cấp độ đều có các phương án dự phòng an toàn | Chương 27 |
| Kỹ nghệ dây cương (Harness Engineering) | Thực tiễn định hướng hành vi của mô hình AI thông qua prompt, công cụ và cấu hình (thay vì viết logic mã nguồn cứng) | Chương 1 |
| Điểm móc (Hooks) | Các lệnh shell do người dùng định nghĩa, thực thi tại các sự kiện cụ thể (ví dụ: trước/sau cuộc gọi công cụ) | Chương 18 |
| Chốt trạng thái (Latch) | Một trạng thái cấp phiên làm việc, một khi đã vào thì sẽ duy trì ổn định — ngăn ngừa hiện tượng dao động bộ nhớ đệm hoặc nhiễu hành vi | Các chương 13, 25 |
| Giao thức ngữ cảnh mô hình (MCP - Model Context Protocol) | Một giao thức chuẩn hóa sự tương tác giữa các mô hình AI và các công cụ/nguồn dữ liệu bên ngoài | Chương 22 |
| Vi nén (Microcompact) | Loại bỏ chính xác các kết quả công cụ cụ thể (thay vì nén toàn bộ cuộc hội thoại), giúp giữ cho tiền tố bộ nhớ đệm ổn định | Chương 11 |
| Đề cương (Outline) | Tài liệu tổng quan về cấu trúc mục lục và các chủ đề của từng chương sách | Lời nói đầu |
| Phân vùng (Partition) | Chia các cuộc gọi công cụ thành các lô có thể song song hóa và các lô bắt buộc tuần tự hóa, dựa trên thuộc tính `isConcurrencySafe` | Chương 4 |
| Trích xuất mẫu thiết kế (Pattern Extraction) | Trích xuất các mẫu thiết kế có thể tái sử dụng từ việc phân tích mã nguồn, bao gồm tên mẫu, vấn đề gặp phải và giải pháp | Xuyên suốt |
| Khôi phục sau nén (Post-Compact Restore) | Khôi phục có chọn lọc nội dung tệp quan trọng nhất và thông tin kỹ năng sau khi quá trình nén hoàn tất | Chương 10 |
| Bộ nhớ đệm Prompt (Prompt Cache) | Một tính năng của API Anthropic giúp lưu trữ phần tiền tố tin nhắn nhằm giảm việc xử lý token dư thừa | Chương 13 |
| Kỹ năng (Skill) | Một mẫu prompt có thể gọi được, được chèn vào ngữ cảnh hội thoại thông qua `SkillTool` | Chương 22 |
| Ngân sách Token (Token Budget) | Hạn mức sử dụng token được phân bổ cho các loại nội dung khác nhau trong cửa sổ ngữ cảnh | Các chương 12, 26 |
| Giản đồ công cụ (Tool Schema) | Định nghĩa JSON Schema của công cụ, bao gồm tên, mô tả và định dạng tham số đầu vào | Chương 2 |
| Bộ phân loại YOLO (YOLO Classifier) | Một cuộc gọi API Claude phụ được sử dụng để đưa ra quyết định cho phép/từ chối quyền trong chế độ tự động | Chương 17 |

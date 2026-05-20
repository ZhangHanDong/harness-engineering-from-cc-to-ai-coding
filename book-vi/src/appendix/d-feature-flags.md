# Phụ lục D: Danh sách đầy đủ 89 cờ tính năng

Phụ lục này liệt kê tất cả các cờ tính năng (Feature Flags) được kiểm soát thông qua hàm `feature()` trong mã nguồn Claude Code v2.1.88, được phân loại theo miền chức năng. Số lượt tham chiếu phản ánh tần suất xuất hiện của mỗi cờ trong mã nguồn, cung cấp chỉ báo sơ bộ về mức độ chuyên sâu của việc hiện thực hóa tính năng đó (xem Chương 23 để biết phương pháp suy luận mức độ hoàn thiện).

## Agent tự chủ và Thực thi nền (19)

| Cờ tính năng | Số lượt tham chiếu | Mô tả |
|------|-----------|-------------|
| `AGENT_MEMORY_SNAPSHOT` | 2 | Ảnh chụp nhanh bộ nhớ của Agent |
| `AGENT_TRIGGERS` | 11 | Trình kích hoạt theo lịch (cron cục bộ) |
| `AGENT_TRIGGERS_REMOTE` | 2 | Trình kích hoạt theo lịch từ xa (cron đám mây) |
| `BG_SESSIONS` | 11 | Quản lý phiên làm việc dưới nền (ps/logs/attach/kill) |
| `BUDDY` | 15 | Chế độ bạn đồng hành (Buddy): bong bóng giao diện nổi |
| `BUILTIN_EXPLORE_PLAN_AGENTS` | 1 | Các kiểu Agent khám phá/lập kế hoạch tích hợp sẵn |
| `COORDINATOR_MODE` | 32 | Chế độ điều phối (Coordinator): phối hợp nhiệm vụ giữa các Agent |
| `FORK_SUBAGENT` | 4 | Chế độ thực thi phân nhánh Agent con (Sub-agent) |
| `KAIROS` | 84 | Cốt lõi chế độ trợ lý: Agent tự chủ chạy ẩn dưới nền, đánh thức theo chu kỳ (tick) |
| `KAIROS_BRIEF` | 17 | Chế độ tóm tắt: gửi thông điệp tiến trình tới người dùng |
| `KAIROS_CHANNELS` | 13 | Hệ thống kênh: giao tiếp đa kênh |
| `KAIROS_DREAM` | 1 | Trình kích hoạt hợp nhất bộ nhớ autoDream |
| `KAIROS_GITHUB_WEBHOOKS` | 2 | Đăng ký GitHub Webhook: kích hoạt bằng sự kiện PR |
| `KAIROS_PUSH_NOTIFICATION` | 2 | Thông báo đẩy (Push): gửi cập nhật trạng thái tới người dùng |
| `MONITOR_TOOL` | 5 | Công cụ giám sát: theo dõi tiến trình chạy ẩn dưới nền |
| `PROACTIVE` | 21 | Chế độ làm việc chủ động: nhận biết tiêu điểm dòng lệnh (terminal focus), chủ động thực hiện hành động |
| `TORCH` | 1 | Lệnh Torch |
| `ULTRAPLAN` | 2 | Ultraplan: Giao diện phân rã nhiệm vụ có cấu trúc |
| `VERIFICATION_AGENT` | 4 | Agent xác minh: tự động xác minh trạng thái hoàn thành nhiệm vụ |

## Điều khiển từ xa và Thực thi phân tán (10)

| Cờ tính năng | Số lượt tham chiếu | Mô tả |
|------|-----------|-------------|
| `BRIDGE_MODE` | 14 | Cốt lõi chế độ cầu nối (Bridge): giao thức điều khiển từ xa |
| `CCR_AUTO_CONNECT` | 3 | Tự động kết nối Claude Code Remote |
| `CCR_MIRROR` | 3 | Chế độ mirror của CCR: bản sao từ xa chỉ đọc |
| `CCR_REMOTE_SETUP` | 1 | Lệnh thiết lập từ xa CCR |
| `CONNECTOR_TEXT` | 7 | Xử lý khối văn bản của bộ kết nối (Connector) |
| `DAEMON` | 1 | Chế độ Daemon: tiến trình Daemon chạy ẩn dưới nền |
| `DOWNLOAD_USER_SETTINGS` | 5 | Tải cài đặt người dùng từ đám mây |
| `LODESTONE` | 3 | Đăng ký giao thức (trình xử lý lodestone://) |
| `UDS_INBOX` | 14 | Hộp thư đến Unix Domain Socket |
| `UPLOAD_USER_SETTINGS` | 1 | Tải cài đặt người dùng lên đám mây |

## Đa phương tiện và Tương tác (17)

| Cờ tính năng | Số lượt tham chiếu | Mô tả |
|------|-----------|-------------|
| `ALLOW_TEST_VERSIONS` | 2 | Cho phép các phiên bản thử nghiệm |
| `ANTI_DISTILLATION_CC` | 1 | Bảo vệ chống chưng cất tri thức (Anti-distillation) |
| `AUTO_THEME` | 1 | Tự động chuyển đổi chủ đề (theme) |
| `BUILDING_CLAUDE_APPS` | 1 | Kỹ năng xây dựng ứng dụng Claude |
| `CHICAGO_MCP` | 12 | Tích hợp MCP Sử dụng Máy tính (Computer Use) |
| `HISTORY_PICKER` | 1 | Giao diện chọn lịch sử |
| `MESSAGE_ACTIONS` | 2 | Các hành động tin nhắn (phím tắt sao chép/chỉnh sửa) |
| `NATIVE_CLIENT_ATTESTATION` | 1 | Chứng thực ứng dụng khách gốc |
| `NATIVE_CLIPBOARD_IMAGE` | 2 | Hỗ trợ hình ảnh khay nhớ tạm gốc |
| `NEW_INIT` | 2 | Luồng khởi tạo mới |
| `POWERSHELL_AUTO_MODE` | 2 | Chế độ tự động trên PowerShell |
| `QUICK_SEARCH` | 1 | Giao diện tìm kiếm nhanh |
| `REVIEW_ARTIFACT` | 1 | Duyệt tạo tác (artifact) |
| `TEMPLATES` | 5 | Mẫu/Phân loại nhiệm vụ |
| `TERMINAL_PANEL` | 3 | Bảng dòng lệnh (Terminal panel) |
| `VOICE_MODE` | 11 | Chế độ giọng nói: chuyển giọng nói thành văn bản dạng luồng |
| `WEB_BROWSER_TOOL` | 1 | Công cụ duyệt web (Bun WebView) |

## Tối ưu hóa ngữ cảnh và Hiệu năng (16)

| Cờ tính năng | Số lượt tham chiếu | Mô tả |
|------|-----------|-------------|
| `ABLATION_BASELINE` | 1 | Đường cơ sở thử nghiệm cắt bỏ (Ablation test) |
| `BASH_CLASSIFIER` | 33 | Bộ phân loại lệnh Bash |
| `BREAK_CACHE_COMMAND` | 2 | Lệnh ép buộc ngắt bộ nhớ đệm |
| `CACHED_MICROCOMPACT` | 12 | Chiến lược vi nén lưu cache |
| `COMPACTION_REMINDERS` | 1 | Cơ chế nhắc nhở nén ngữ cảnh |
| `CONTEXT_COLLAPSE` | 16 | Sụp đổ ngữ cảnh (Context collapse): quản lý ngữ cảnh hạt mịn |
| `FILE_PERSISTENCE` | 3 | Thời điểm lưu tệp bền vững |
| `HISTORY_SNIP` | 15 | Lệnh cắt bớt lịch sử (snip) |
| `OVERFLOW_TEST_TOOL` | 2 | Công cụ kiểm tra tràn bộ nhớ |
| `PROMPT_CACHE_BREAK_DETECTION` | 9 | Phát hiện ngắt bộ nhớ đệm prompt |
| `REACTIVE_COMPACT` | 4 | Nén phản ứng (Reactive compaction): kích hoạt theo nhu cầu |
| `STREAMLINED_OUTPUT` | 1 | Chế độ đầu ra tinh giản |
| `TOKEN_BUDGET` | 4 | Giao diện theo dõi ngân sách token |
| `TREE_SITTER_BASH` | 3 | Trình phân tích cú pháp Bash bằng Tree-sitter |
| `TREE_SITTER_BASH_SHADOW` | 5 | Chế độ bóng tối Bash Tree-sitter (thử nghiệm A/B) |
| `ULTRATHINK` | 1 | Chế độ siêu lập luận (Ultra-think) |

## Quản lý bộ nhớ và Tri thức (13)

| Cờ tính năng | Số lượt tham chiếu | Mô tả |
|------|-----------|-------------|
| `AWAY_SUMMARY` | 2 | Tóm tắt khi đi vắng: tạo báo cáo tiến độ khi người dùng rời đi |
| `COWORKER_TYPE_TELEMETRY` | 2 | Đo lường từ xa về kiểu đồng nghiệp (coworker) |
| `ENHANCED_TELEMETRY_BETA` | 2 | Bản beta đo lường từ xa nâng cao |
| `EXPERIMENTAL_SKILL_SEARCH` | 19 | Tìm kiếm kỹ năng từ xa thử nghiệm |
| `EXTRACT_MEMORIES` | 7 | Tự động trích xuất bộ nhớ |
| `MCP_RICH_OUTPUT` | 3 | Đầu ra định dạng văn bản giàu (rich text) MCP |
| `MCP_SKILLS` | 9 | Phát hiện kỹ năng của máy chủ MCP |
| `MEMORY_SHAPE_TELEMETRY` | 3 | Đo lường từ xa cấu trúc bộ nhớ |
| `RUN_SKILL_GENERATOR` | 1 | Trình tạo kỹ năng |
| `SKILL_IMPROVEMENT` | 1 | Tự động cải thiện kỹ năng |
| `TEAMMEM` | 44 | Đồng bộ hóa bộ nhớ nhóm (team memory) |
| `WORKFLOW_SCRIPTS` | 6 | Kịch bản quy trình công việc |
| `TRANSCRIPT_CLASSIFIER` | 69 | Bộ phân loại bản chép lời (transcript classifier) ở chế độ tự động |

## Hạ tầng và Đo lường từ xa (14)

| Cờ tính năng | Số lượt tham chiếu | Mô tả |
|------|-----------|-------------|
| `COMMIT_ATTRIBUTION` | 11 | Theo dõi ghi nhận tác giả commit Git |
| `HARD_FAIL` | 2 | Chế độ thất bại cứng (hard failure) |
| `IS_LIBC_GLIBC` | 1 | Phát hiện runtime glibc |
| `IS_LIBC_MUSL` | 1 | Phát hiện runtime musl |
| `PERFETTO_TRACING` | 1 | Theo dõi hiệu năng bằng Perfetto |
| `SHOT_STATS` | 8 | Thống kê phân phối các cuộc gọi công cụ |
| `SLOW_OPERATION_LOGGING` | 1 | Ghi log thao tác chậm |
| `UNATTENDED_RETRY` | 1 | Thử lại không cần giám sát |

---

## Tóm tắt thống kê

| Danh mục | Số lượng | Cờ có lượt tham chiếu cao nhất |
|----------|-------|----------------------|
| Agent tự chủ và Thực thi nền | 19 | `KAIROS` (84) |
| Điều khiển từ xa và Thực thi phân tán | 10 | `BRIDGE_MODE` (14), `UDS_INBOX` (14) |
| Đa phương tiện và Tương tác | 17 | `CHICAGO_MCP` (12) |
| Tối ưu hóa ngữ cảnh và Hiệu năng | 16 | `TRANSCRIPT_CLASSIFIER` (69) |
| Quản lý bộ nhớ và Tri thức | 13 | `TEAMMEM` (44) |
| Hạ tầng và Đo lường từ xa | 14 | `COMMIT_ATTRIBUTION` (11) |
| **Tổng cộng** | **89** | |

**Top 5 theo số lượt tham chiếu**: `KAIROS` (84) > `TRANSCRIPT_CLASSIFIER` (69) > `TEAMMEM` (44) > `BASH_CLASSIFIER` (33) > `COORDINATOR_MODE` (32)

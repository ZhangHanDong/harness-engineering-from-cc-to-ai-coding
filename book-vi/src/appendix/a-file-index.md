# Phụ lục A: Chỉ mục các tệp chính

Phụ lục này liệt kê các tệp chính trong mã nguồn Claude Code v2.1.88 và nhiệm vụ của chúng, được nhóm theo phân hệ. Các đường dẫn tệp là tương đối so với thư mục `restored-src/src/`.

## Điểm đầu vào và Vòng lặp cốt lõi

| Tệp | Nhiệm vụ | Chương liên quan |
|------|---------------|-----------------|
| `main.tsx` | Điểm đầu vào CLI, nạp trước song song (parallel prefetch), import trễ (lazy import), kiểm soát bằng cờ tính năng (Feature Flag gating) | Chương 1 |
| `query.ts` | Vòng lặp chính của Agent Loop, máy trạng thái `queryLoop` | Chương 3 |
| `query/transitions.ts` | Các kiểu chuyển trạng thái vòng lặp: `Continue`, `Terminal` | Chương 3 |

## Hệ thống công cụ

| Tệp | Nhiệm vụ | Chương liên quan |
|------|---------------|-----------------|
| `Tool.ts` | Hợp đồng giao diện công cụ (tool interface contract), các giá trị mặc định phòng thủ nghiêm ngặt `TOOL_DEFAULTS` (fail-closed) | Các chương 2, 25 |
| `tools.ts` | Đăng ký công cụ, tải có điều kiện theo cờ tính năng (Feature Flag) | Chương 2 |
| `services/tools/toolOrchestration.ts` | Điều phối thực thi công cụ, phân vùng đồng thời `partitionToolCalls` | Chương 4 |
| `services/tools/toolExecution.ts` | Vòng đời thực thi một công cụ đơn lẻ | Chương 4 |
| `services/tools/StreamingToolExecutor.ts` | Trình thực thi công cụ dạng luồng dữ liệu (streaming) | Chương 4 |
| `tools/BashTool/` | Hiện thực hóa công cụ Bash, bao gồm giao thức an toàn Git | Các chương 8, 27 |
| `tools/FileEditTool/` | Công cụ chỉnh sửa tệp, bắt buộc áp dụng nguyên tắc "đọc trước khi sửa" | Các chương 8, 27 |
| `tools/FileReadTool/` | Công cụ đọc tệp, mặc định 2000 dòng | Chương 8 |
| `tools/GrepTool/` | Công cụ tìm kiếm dựa trên ripgrep | Chương 8 |
| `tools/AgentTool/` | Công cụ khởi tạo Agent con (sub-Agent) | Các chương 8, 20 |
| `tools/SkillTool/` | Công cụ gọi kỹ năng | Các chương 8, 22 |
| `tools/SkillTool/prompt.ts` | Ngân sách danh sách kỹ năng: 1% của cửa sổ ngữ cảnh | Các chương 12, 26 |

## Hệ thống Prompt

| Tệp | Nhiệm vụ | Chương liên quan |
|------|---------------|-----------------|
| `constants/prompts.ts` | Xây dựng system prompt, ranh giới động `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` | Các chương 5, 6, 25 |
| `constants/systemPromptSections.ts` | Trình đăng ký phân đoạn với phạm vi kiểm soát bộ nhớ đệm | Chương 5 |
| `constants/toolLimits.ts` | Các hằng số ngân sách kết quả công cụ | Các chương 12, 26 |

## API và Bộ nhớ đệm

| Tệp | Nhiệm vụ | Chương liên quan |
|------|---------------|-----------------|
| `services/api/claude.ts` | Thiết lập cuộc gọi API, thiết lập điểm ngắt bộ nhớ đệm (cache breakpoint) | Chương 13 |
| `services/api/promptCacheBreakDetection.ts` | Phát hiện điểm ngắt bộ nhớ đệm, theo dõi `PreviousState` | Các chương 14, 25 |
| `utils/api.ts` | Hàm `splitSysPromptPrefix()` chia bộ nhớ đệm ba chiều | Các chương 5, 13 |

## Nén ngữ cảnh

| Tệp | Nhiệm vụ | Chương liên quan |
|------|---------------|-----------------|
| `services/compact/compact.ts` | Điều phối nén ngữ cảnh, hằng số `POST_COMPACT_MAX_FILES_TO_RESTORE` | Các chương 9, 10 |
| `services/compact/autoCompact.ts` | Ngưỡng tự động nén và cơ chế ngắt mạch (circuit breaker) | Các chương 9, 25, 26 |
| `services/compact/prompt.ts` | Mẫu prompt dành cho nén ngữ cảnh | Các chương 9, 28 |
| `services/compact/microCompact.ts` | Vi nén dựa trên thời gian | Chương 11 |
| `services/compact/apiMicrocompact.ts` | Vi nén lưu cache gốc của API | Chương 11 |

## Phân quyền và Bảo mật

| Tệp | Nhiệm vụ | Chương liên quan |
|------|---------------|-----------------|
| `utils/permissions/yoloClassifier.ts` | Bộ phân loại chế độ tự động YOLO | Chương 17 |
| `utils/permissions/denialTracking.ts` | Theo dõi từ chối, hằng số `DENIAL_LIMITS` | Các chương 17, 27 |
| `tools/BashTool/bashPermissions.ts` | Kiểm tra phân quyền lệnh Bash | Chương 16 |

## CLAUDE.md và Kỹ năng

| Tệp | Nhiệm vụ | Chương liên quan |
|------|---------------|-----------------|
| `utils/claudemd.ts` | Tải và chèn tệp CLAUDE.md, thứ tự ưu tiên 4 lớp | Chương 19 |
| `skills/bundled/` | Thư mục các kỹ năng tích hợp sẵn | Chương 22 |
| `skills/loadSkillsDir.ts` | Phát hiện các kỹ năng do người dùng định nghĩa | Chương 22 |
| `skills/mcpSkillBuilders.ts` | Cầu nối chuyển đổi MCP thành kỹ năng | Chương 22 |

## Điều phối đa Agent

| Tệp | Nhiệm vụ | Chương liên quan |
|------|---------------|-----------------|
| `coordinator/coordinatorMode.ts` | Hiện thực hóa chế độ điều phối (coordinator mode) | Chương 20 |
| `utils/teammate.ts` | Các công cụ Agent đồng nghiệp (teammate) | Chương 20 |
| `utils/swarm/teammatePromptAddendum.ts` | Nội dung phần phụ lục prompt dành cho đồng nghiệp | Chương 20 |

## Kết quả công cụ và Lưu trữ

| Tệp | Nhiệm vụ | Chương liên quan |
|------|---------------|-----------------|
| `utils/toolResultStorage.ts` | Lưu trữ bền vững kết quả lớn, xem trước phần cắt bỏ | Các chương 12, 28 |
| `utils/toolSchemaCache.ts` | Lưu bộ nhớ đệm giản đồ công cụ (Tool Schema) | Chương 15 |

## Bộ nhớ liên phiên làm việc

| Tệp | Nhiệm vụ | Chương liên quan |
|------|---------------|-----------------|
| `memdir/memdir.ts` | Tải chỉ mục `MEMORY.md` và các tệp chủ đề, chèn vào system prompt | Chương 24 |
| `memdir/paths.ts` | Phân giải đường dẫn thư mục bộ nhớ, chuỗi ưu tiên ba cấp | Chương 24 |
| `services/extractMemories/extractMemories.ts` | Tự động trích xuất bộ nhớ của Agent phân nhánh (fork agent) | Chương 24 |
| `services/SessionMemory/sessionMemory.ts` | Tóm tắt phiên cuốn chiếu phục vụ việc nén ngữ cảnh | Chương 24 |
| `utils/sessionStorage.ts` | Lưu trữ và khôi phục hồ sơ phiên định dạng JSONL | Chương 24 |
| `tools/AgentTool/agentMemory.ts` | Lưu trữ bền vững Sub-Agent và ảnh chụp nhanh VCS | Chương 24 |
| `services/autoDream/autoDream.ts` | Hợp nhất và cắt tỉa bộ nhớ tự động qua đêm | Chương 24 |

## Đo lường từ xa và Khả năng giám sát

| Tệp | Nhiệm vụ | Chương liên quan |
|------|---------------|-----------------|
| `services/analytics/index.ts` | Điểm đầu vào sự kiện, mẫu đính kèm hàng đợi (queue-attach pattern), các kiểu nhãn PII | Chương 29 |
| `services/analytics/sink.ts` | Điều phối đường truyền kép (Datadog + 1P), lấy mẫu | Chương 29 |
| `services/analytics/firstPartyEventLogger.ts` | Tích hợp OTel `BatchLogRecordProcessor` | Chương 29 |
| `services/analytics/firstPartyEventLoggingExporter.ts` | Trình xuất tùy chỉnh (Custom Exporter), thử lại với cơ chế lưu trữ bền vững trên đĩa | Chương 29 |
| `services/analytics/metadata.ts` | Metadata của sự kiện, làm sạch tên công cụ, phân cấp PII | Chương 29 |
| `services/analytics/datadog.ts` | Danh sách cho phép của Datadog, đẩy dữ liệu hàng loạt | Chương 29 |
| `services/analytics/sinkKillswitch.ts` | Cơ chế ngắt mạch từ xa (`tengu_frond_boric`) | Chương 29 |
| `services/api/logging.ts` | Mô hình API ba sự kiện (query/success/error) | Chương 29 |
| `services/api/withRetry.ts` | Đo lường từ xa về việc thử lại, phát hiện dấu vân tay cổng (gateway fingerprint) | Chương 29 |
| `utils/debug.ts` | Ghi log debug, cờ `--debug` | Chương 29 |
| `utils/diagLogs.ts` | Chẩn đoán container không chứa dữ liệu PII | Chương 29 |
| `utils/errorLogSink.ts` | Ghi log lỗi ra tệp | Chương 29 |
| `utils/telemetry/sessionTracing.ts` | Các nhãn span OTel, theo dõi vết ba cấp | Chương 29 |
| `utils/telemetry/perfettoTracing.ts` | Theo dõi vết phục vụ trực quan hóa trên Perfetto | Chương 29 |
| `utils/gracefulShutdown.ts` | Tắt máy mượt mà theo thời gian chờ xếp chồng (cascading timeout) | Chương 29 |
| `cost-tracker.ts` | Theo dõi chi phí, lưu trữ bền vững liên phiên làm việc | Chương 29 |

## Cấu hình và Trạng thái

| Tệp | Nhiệm vụ | Chương liên quan |
|------|---------------|-----------------|
| `utils/effort.ts` | Phân tích mức độ nỗ lực lập luận (effort level) | Chương 21 |
| `utils/fastMode.ts` | Quản lý Chế độ nhanh (Fast Mode) | Chương 21 |
| `utils/managedEnvConstants.ts` | Danh sách cho phép các biến môi trường được quản lý | Phụ lục B |
| `screens/REPL.tsx` | Giao diện tương tác chính (component React dài hơn 5000 dòng) | Chương 1 |

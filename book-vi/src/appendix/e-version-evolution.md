# Phụ lục E: Nhật ký phát triển các phiên bản

Phân tích cốt lõi trong cuốn sách này dựa trên Claude Code v2.1.88 (với bản đồ nguồn - source map hoàn chỉnh, cho phép khôi phục 4.756 tệp nguồn). Phụ lục này ghi lại các thay đổi chính trong các phiên bản tiếp theo và tác động của chúng đối với từng chương.

> **Mẹo điều hướng**: Mỗi thay đổi đều liên kết đến phần nhật ký phát triển phiên bản của chương tương ứng. Hãy nhấp vào số chương để chuyển hướng nhanh.

> Vì Anthropic đã loại bỏ việc phân phối bản đồ nguồn bắt đầu từ phiên bản v2.1.89, phân tích sau đây dựa trên việc so sánh các tín hiệu chuỗi trong gói bundle kết hợp với suy luận được hỗ trợ bởi mã nguồn v2.1.88, do đó có chiều sâu giới hạn.

## v2.1.88 -> v2.1.91

**Tổng quan**: cli.js +115KB | Sự kiện Tengu +39/-6 | Biến môi trường +8/-3 | Loại bỏ Bản đồ nguồn (Source Map)

### Các thay đổi có tác động cao

| Thay đổi | Chương bị ảnh hưởng | Chi tiết |
|--------|-------------------|---------|
| Loại bỏ Tree-sitter WASM | [ch16 Hệ thống phân quyền](../part5/ch16.md#version-evolutionv2191-changes) | Bảo mật Bash được quay trở lại sử dụng biểu thức chính quy (regex)/shell-quote thay vì phân tích AST; do các vấn đề về hiệu năng CC-643 |
| Chính thức hóa chế độ phân quyền "auto" | [ch16](../part5/ch16.md#version-evolutionv2191-changes)-[ch17](../part5/ch17.md#version-evolutionv2191-changes) Phân quyền/YOLO | API công khai của SDK đã bổ sung chế độ tự động (auto) |
| Nén nguội + hộp thoại + bộ ngắt mạch khôi phục nhanh | [ch11 Vi nén](../part3/ch11.md#version-evolutionv2191-changes) | Bổ sung chiến lược trì hoãn nén ngữ cảnh và giao diện người dùng để xác nhận |

### Các thay đổi có tác động trung bình

| Thay đổi | Chương bị ảnh hưởng | Chi tiết |
|--------|-------------------|---------|
| `staleReadFileStateHint` | [ch09](../part3/ch09.md#version-evolutionv2191-changes)-[ch10](../part3/ch10.md#version-evolutionv2191-changes) Quản lý ngữ cảnh | Phát hiện thay đổi thời gian sửa đổi tệp (mtime) trong quá trình thực thi công cụ |
| Lập kế hoạch đa Agent từ xa Ultraplan | [ch20 Cụm Agent](../part6/ch20.md) | Các phiên làm việc từ xa CCR + Opus 4.6 + thời gian chờ 30 phút |
| Các cải tiến cho Agent con | [ch20](../part6/ch20.md)-[ch21](../part6/ch21.md#version-evolutionv2191-changes) Đa Agent/Nỗ lực | Giới hạn số lượt (turn limits), giản đồ tinh gọn (lean schema), điều hướng chi phí |

### Các thay đổi có tác động thấp

| Thay đổi | Chương bị ảnh hưởng |
|--------|-------------------|
| `hook_output_persisted` + `pre_tool_hook_deferred` | ch19 Hooks |
| `memory_toggled` + `extract_memories_skipped_no_prose` | ch12 Ngân sách Token |
| `rate_limit_lever_hint` | ch06 Điều hướng hành vi Prompt |
| `bridge_client_presence_enabled` | ch22 Hệ thống kỹ năng |
| +8/-3 biến môi trường | Phụ lục B |

### Chi tiết các tính năng mới trong v2.1.91

Ba tính năng sau đây **hoàn toàn không tồn tại** trong mã nguồn v2.1.88 và là những tính năng mới trong v2.1.91. Phân tích này dựa trên kỹ thuật đảo ngược gói bundle v2.1.91.

#### 1. Powerup Lessons — Hệ thống hướng dẫn tính năng tương tác

**Sự kiện**: `tengu_powerup_lesson_opened`, `tengu_powerup_lesson_completed`

**Trạng thái trong v2.1.88**: Không tồn tại. Không có mã nguồn nào liên quan đến powerup hay bài học (lesson) trong thư mục `restored-src/src/`.

**Phát hiện từ kỹ thuật đảo ngược v2.1.91**:

Powerup Lessons là một hệ thống hướng dẫn tương tác tích hợp sẵn bao gồm 10 mô-đun khóa học hướng dẫn người dùng cách sử dụng các tính năng cốt lõi của Claude Code. Danh mục khóa học hoàn chỉnh được trích xuất từ bundle:

| ID khóa học | Tiêu đề | Tính năng liên quan |
|-----------|-------|-----------------|
| `at-mentions` | Talk to your codebase | Tham chiếu tệp bằng ký tự @, tham chiếu số dòng |
| `modes` | Steer with modes | Chuyển đổi chế độ bằng Shift+Tab, lập kế hoạch (plan), tự động (auto) |
| `undo` | Undo anything | `/rewind`, nhấn phím Esc hai lần |
| `background` | Run in the background | Nhiệm vụ chạy ẩn, lệnh `/tasks` |
| `memory` | Teach Claude your rules | CLAUDE.md, lệnh `/memory`, `/init` |
| `mcp` | Extend with tools | Các máy chủ MCP, lệnh `/mcp` |
| `automate` | Automate your workflow | Kỹ năng, Hooks, lệnh `/hooks` |
| `subagents` | Multiply yourself | Agent con, lệnh `/agents`, cờ `--worktree` |
| `cross-device` | Code from anywhere | Lệnh `/remote-control`, `/teleport` |
| `model-dial` | Dial the model | Lệnh `/model`, `/effort`, `/fast` |

**Hiện thực hóa kỹ thuật** (từ kỹ thuật đảo ngược bundle):

```javascript
// Sự kiện khóa học được mở
logEvent("tengu_powerup_lesson_opened", {
  lesson_id: lesson.id,           // ID khóa học
  was_already_unlocked: unlocked.has(lesson.id),  // Đã mở khóa trước đó?
  unlocked_count: unlocked.size   // Tổng số khóa học đã mở khóa
})

// Sự kiện khóa học hoàn thành
logEvent("tengu_powerup_lesson_completed", {
  lesson_id: id,
  unlocked_count: newUnlocked.size,
  all_unlocked: newUnlocked.size === lessons.length  // Đã hoàn thành tất cả?
})
```

Trạng thái mở khóa được lưu giữ bền vững vào cấu hình người dùng thông qua thuộc tính `powerupsUnlocked`. Mỗi khóa học bao gồm một tiêu đề, khẩu hiệu (tagline), nội dung văn bản giàu định dạng (kèm theo các bản demo hoạt ảnh terminal), và giao diện sử dụng các ký hiệu đánh dấu tick/tròn để hiển thị trạng thái hoàn thành, kích hoạt một hoạt ảnh quà tặng ẩn (easter egg) khi tất cả các khóa học được hoàn thành.

**Ý nghĩa đối với cuốn sách**: 10 mô-đun khóa học của Powerup Lessons bao quát hầu hết tất cả các chủ đề cốt lõi từ Phần 2 đến Phần 6 của cuốn sách này — từ các chế độ phân quyền (ch16-17) đến Agent con (ch20) đến MCP (ch22). Nó thể hiện thứ tự ưu tiên chính thức của Anthropic về việc "người dùng nên thành thạo những tính năng nào" và có thể đóng vai trò tham khảo cho các phần "Những việc bạn có thể làm" (What You Can Do) trong cuốn sách này.

---

#### 2. Chế độ ghi nối tiếp (Write Append Mode) — Ghi nối tiếp vào tệp

**Sự kiện**: `tengu_write_append_used`

**Trạng thái trong v2.1.88**: Không tồn tại. Công cụ Write của v2.1.88 chỉ hỗ trợ chế độ ghi đè (overwrite - thay thế hoàn toàn).

**Phát hiện từ kỹ thuật đảo ngược v2.1.91**:

Trường `inputSchema` của công cụ Write đã có thêm tham số `mode` mới:

```typescript
// Kỹ thuật đảo ngược bundle v2.1.91
inputSchema: {
  file_path: string,
  content: string,
  mode: "overwrite" | "append"  // Mới trong v2.1.91
}
```

Mô tả tham số `mode` (được trích xuất từ bundle):

> Write mode. 'overwrite' (default) replaces the file. Use 'append' to add content to the end of an existing file instead of rewriting the full content — e.g. for logs, accumulating output, or adding entries to a list.

**Cổng tính năng (Feature Gate)**: Chế độ ghi nối tiếp (append mode) được kiểm soát bởi cờ GrowthBook `tengu_maple_forge_w8k`. Khi cờ này tắt, trường `mode` sẽ bị loại bỏ khỏi giản đồ bằng `.omit()`, khiến mô hình không thể nhìn thấy.

```javascript
// Kỹ thuật đảo ngược bundle v2.1.91
function getWriteSchema() {
  return getFeatureValue("tengu_maple_forge_w8k", false)
    ? fullSchema()           // Bao gồm tham số mode
    : fullSchema().omit({ mode: true })  // Ẩn tham số mode
}
```

**Ý nghĩa đối với cuốn sách**: Ảnh hưởng đến ch02 (tổng quan về hệ thống công cụ) và ch08 (prompt của công cụ). Trong v2.1.88, prompt của công cụ Write đã nêu rõ "Công cụ này sẽ ghi đè lên tệp hiện có" — chế độ append trong v2.1.91 thay đổi ràng buộc này, và mô hình hiện có thể chọn ghi nối tiếp thay vì ghi đè.

---

#### 3. Đánh giá tin nhắn (Message Rating) — Phản hồi đánh giá tin nhắn

**Sự kiện**: `tengu_message_rated`

**Trạng thái trong v2.1.88**: Không tồn tại. v2.1.88 có chuỗi sự kiện `tengu_feedback_survey_*` (phản hồi cấp phiên làm việc) nhưng không có tính năng đánh giá cấp tin nhắn.

**Phát hiện từ kỹ thuật đảo ngược v2.1.91**:

Message Rating là một cơ chế phản hồi cấp tin nhắn cho phép người dùng đánh giá từng phản hồi cụ thể của Claude. Hiện thực hóa được trích xuất từ kỹ thuật đảo ngược bundle:

```javascript
// Kỹ thuật đảo ngược bundle v2.1.91
function rateMessage(messageUuid, sentiment) {
  const wasAlreadyRated = ratings.get(messageUuid) === sentiment
  // Nhấp lại vào cùng một đánh giá → xóa đánh giá (hành vi bật/tắt)
  if (wasAlreadyRated) {
    ratings.delete(messageUuid)
  } else {
    ratings.set(messageUuid, sentiment)
  }

  logEvent("tengu_message_rated", {
    message_uuid: messageUuid,  // ID duy nhất của tin nhắn
    sentiment: sentiment,       // Hướng đánh giá (ví dụ: thumbs_up/thumbs_down)
    cleared: wasAlreadyRated    // Đánh giá có bị xóa không?
  })

  // Hiển thị thông báo cảm ơn sau khi đánh giá
  if (!wasAlreadyRated) {
    addNotification({
      key: "message-rated",
      text: "thanks for improving claude!",
      color: "success",
      priority: "immediate"
    })
  }
}
```

**Cơ chế giao diện người dùng**:
- Chức năng đánh giá được đưa vào danh sách tin nhắn thông qua React Context (`MessageRatingProvider`)
- Trạng thái đánh giá được lưu trữ trong bộ nhớ dưới dạng `Map<messageUuid, sentiment>`
- Hỗ trợ tính năng bật/tắt (toggle) — nhấp lại vào cùng một đánh giá sẽ xóa đánh giá đó
- Sau khi đánh giá, một thông báo màu xanh lá cây "thanks for improving claude!" sẽ xuất hiện

**Ý nghĩa đối với cuốn sách**: Liên quan đến ch29 (Kỹ nghệ giám sát hành vi). Hệ thống phản hồi của v2.1.88 ở cấp phiên làm việc (`tengu_feedback_survey_*`); v2.1.91 bổ sung đánh giá cấp tin nhắn, tinh chỉnh độ chi tiết của phản hồi từ "toàn bộ phiên làm việc có tốt không" thành "phản hồi cụ thể này có tốt không". Điều này cung cấp cho Anthropic các tín hiệu huấn luyện chi tiết hơn cho RLHF (Học tăng cường từ phản hồi của con người - Reinforcement Learning from Human Feedback).

---

### Các sự kiện mật danh thử nghiệm

Các sự kiện có mật danh ngẫu nhiên sau đây là các thử nghiệm A/B với mục đích chưa được tiết lộ:

| Sự kiện | Lưu ý |
|-------|-------|
| `tengu_garnet_plover` | Thử nghiệm chưa xác định |
| `tengu_gleaming_fair` | Thử nghiệm chưa xác định |
| `tengu_gypsum_kite` | Thử nghiệm chưa xác định |
| `tengu_slate_finch` | Thử nghiệm chưa xác định |
| `tengu_slate_reef` | Thử nghiệm chưa xác định |
| `tengu_willow_prism` | Thử nghiệm chưa xác định |
| `tengu_maple_forge_w` | Liên quan đến cổng tính năng của chế độ Write Append `tengu_maple_forge_w8k` |
| `tengu_lean_sub_pf` | Có thể liên quan đến giản đồ tinh gọn của Agent con |
| `tengu_sub_nomdrep_q` | Có thể liên quan đến hành vi của Agent con |
| `tengu_noreread_q` | Có thể liên quan đến việc bỏ qua đọc lại tệp `tengu_file_read_reread` |

---

## v2.1.91 -> v2.1.92 (Các thay đổi gia tăng)

> Dựa trên sự khác biệt về tín hiệu được trích xuất giữa hai gói bundle v2.1.91 và v2.1.92. Báo cáo so sánh đầy đủ có tại `docs/version-diffs/v2.1.88-vs-v2.1.92.md`.

### Tổng quan

| Chỉ số | v2.1.91 | v2.1.92 | Biến động |
|--------|---------|---------|-------|
| Dung lượng cli.js | 12.5MB | 12.6MB | +59KB |
| Sự kiện Tengu | 860 | 857 | +19 / -21 (ròng -3) |
| Biến môi trường | 183 | 186 | +3 |
| Các tệp thực thi seccomp | Không có | arm64 + x64 | **Mới** |

### Các bổ sung chính

| Phân hệ | Tín hiệu mới | Chương bị ảnh hưởng | Phân tích |
|-----------|------------|-------------------|----------|
| **Công cụ** | `advisor_command`, `advisor_dialog_shown` + 10 định danh `advisor_*` | ch04 | Công cụ AdvisorTool hoàn toàn mới — công cụ không thực thi đầu tiên có chuỗi cuộc gọi mô hình riêng |
| **Công cụ** | `tool_result_dedup` | ch04 | Loại bỏ trùng lặp kết quả công cụ, cùng với `file_read_reread` của v2.1.91 tạo nên cơ chế loại bỏ trùng lặp cả hai phía đầu vào/đầu ra |
| **Bảo mật** | `vendor/seccomp/{arm64,x64}/apply-seccomp` | ch16 | Hộp cát seccomp cấp hệ thống, thay thế phân tích cấp ứng dụng bằng tree-sitter đã bị loại bỏ trong v2.1.91 |
| **Hook** | `stop_hook_added`, `stop_hook_command`, `stop_hook_removed` | ch18 | Thêm/xóa động Stop Hook khi đang chạy — lần đầu tiên hệ thống Hook hỗ trợ quản lý khi đang chạy |
| **Xác thực** | `bedrock_setup_started/complete/cancelled`, `oauth_bedrock_wizard_launched` | ch05 | Trình hướng dẫn thiết lập AWS Bedrock |
| **Xác thực** | `oauth_platform_docs_opened` | ch05 | Mở tài liệu nền tảng trong luồng OAuth |
| **Công cụ** | `bash_rerun_used` | ch04 | Chức năng chạy lại lệnh Bash |
| **Mô hình** | `rate_limit_options_menu_select_team` | — | Tùy chọn Team trong quá trình giới hạn tốc độ (rate limiting) |

### Các lược bỏ chính

| Tín hiệu bị loại bỏ | Phân tích |
|---------------|----------|
| `session_tagged`, `tag_command_*` (tổng cộng 5 cái) | Hệ thống gắn nhãn phiên làm việc bị loại bỏ hoàn toàn |
| `sm_compact` | Dọn dẹp sự kiện nén cũ (v2.1.91 đã giới thiệu cold_compact để thay thế) |
| `skill_improvement_survey` | Kết thúc khảo sát cải thiện kỹ năng |
| `pid_based_version_locking` | Loại bỏ cơ chế khóa phiên bản dựa trên PID |
| `compact_streaming_retry` | Dọn dẹp thử lại việc truyền luồng nén |
| `ultraplan_model` | Tái cấu trúc sự kiện mô hình Ultraplan |
| 6 sự kiện mật danh thử nghiệm ngẫu nhiên | Các thử nghiệm A/B cũ kết thúc (cobalt_frost, copper_bridge, v.v.) |

### Các biến môi trường mới

| Biến | Mục đích |
|----------|---------|
| `CLAUDE_CODE_EXECPATH` | Đường dẫn tệp thực thi |
| `CLAUDE_CODE_SIMULATE_PROXY_USAGE` | Mô phỏng sử dụng proxy (để kiểm thử) |
| `CLAUDE_CODE_SKIP_FAST_MODE_ORG_CHECK` | Bỏ qua kiểm tra cấp tổ chức của Chế độ nhanh (Fast Mode) |

### Xu hướng thiết kế

Bản cập nhật v2.1.91 -> v2.1.92 là nhỏ nhưng thể hiện rõ xu hướng:

1. **Chiến lược bảo mật đi xuống từ lớp ứng dụng xuống lớp hệ thống** (tree-sitter -> seccomp)
2. **Hệ thống công cụ mở rộng từ thực thi thuần túy sang tư vấn** (AdvisorTool)
3. **Quản lý cấu hình chuyển dịch từ tĩnh thuần túy sang có thể thay đổi khi đang chạy** (quản lý động Stop Hook)
4. **Rào cản tiếp cận của doanh nghiệp tiếp tục được hạ thấp (trình hướng dẫn Bedrock)**

---

*Sử dụng script `scripts/cc-version-diff.sh` để tạo dữ liệu so sánh; `docs/anchor-points.md` cung cấp vị trí các điểm neo của phân hệ*

---

## v2.1.92 -> v2.1.100

**Tổng quan**: cli.js +870KB (+6.9%) | Sự kiện Tengu +45/-21 (ròng +24) | Biến môi trường +8/-2 | Vendor ghi âm âm thanh mới

### Các thay đổi có tác động cao

| Thay đổi | Chương bị ảnh hưởng | Chi tiết |
|--------|-------------------|---------|
| Sự hoàn thiện của hệ thống Dream | ch24 Hệ thống bộ nhớ | lập lịch cron cho `kairos_dream` + khả năng giám sát `auto_dream_skipped` + theo dõi kích hoạt thủ công `dream_invoked` |
| Trình hướng dẫn đầy đủ Bedrock/Vertex | ch06b Giao tiếp API | 18 sự kiện bao quát toàn bộ vòng đời thiết lập, thăm dò và nâng cấp hoàn tất |
| Loại bỏ trùng lặp kết quả công cụ | ch10 Bảo toàn trạng thái tệp | Khử trùng lặp kết quả công cụ với các tham chiếu ID ngắn giúp tiết kiệm ngữ cảnh |
| Dọn dẹp lớn Bridge REPL | ch06b Giao tiếp API | Loại bỏ 16 sự kiện `bridge_repl_*` (vẫn còn một số tham chiếu nhỏ dư thừa), tái cấu trúc cơ chế giao tiếp |
| Trường thống kê `toolStats` | ch24 Hệ thống bộ nhớ | sdk-tools.d.ts bổ sung thống kê sử dụng công cụ 7 chiều |

### Các thay đổi có tác động trung bình

| Thay đổi | Chương bị ảnh hưởng | Chi tiết |
|--------|-------------------|---------|
| Công cụ Advisor | ch21 Nỗ lực/Lập luận | Công cụ đánh giá mô hình mạnh phía máy chủ, cổng tính năng `advisor-tool-2026-03-01` |
| Tự động sửa PR (Autofix PR) | ch20c Ultraplan | PR tự động sửa phiên làm việc từ xa, cùng với ultraplan/ultrareview |
| Chào đón Team mới (Team Onboarding) | ch20b Teams | Tạo báo cáo sử dụng + phát hiện chào đón người dùng mới |
| Mantle auth backend | ch06b, Phụ lục G | Kênh xác thực API thứ năm |
| Cải tiến nén nguội (Cold compact) | ch09 Tự động nén | Được dẫn dắt bởi cờ tính năng + ghi đè `MAX_CONTEXT_TOKENS` |

### Các thay đổi có tác động thấp

| Thay đổi | Chương bị ảnh hưởng |
|--------|-------------------|
| `hook_prompt_transcript_truncated` + vòng đời stop_hook | ch18 Hooks |
| Hỗ trợ hệ thống quản lý phiên bản Perforce (`CLAUDE_CODE_PERFORCE_MODE`) | ch04 Công cụ |
| Tệp thực thi ghi âm audio-capture (6 nền tảng) | Tính năng mới tiềm năng |
| `image_resize` — tự động co giãn hình ảnh | ch04 Công cụ |
| `bash_allowlist_strip_all` — thao tác danh sách cho phép bash | ch16 Phân quyền |
| +8/-2 biến môi trường | Phụ lục B |
| Hơn 12 sự kiện mật danh thử nghiệm mới | ch23 Cờ tính năng |

### Chi tiết các tính năng mới trong v2.1.100

Các tính năng sau đây **không tồn tại** trong v2.1.92 hoặc chỉ có dạng sơ khai, và là những bổ sung gia tăng trong quá trình nâng cấp v2.1.92→v2.1.100.

#### 1. Kairos Dream — Hợp nhất bộ nhớ theo lịch dưới nền

**Sự kiện**: `tengu_kairos_dream`

**Trạng thái trong v2.1.92**: v2.1.92 đã có `auto_dream` và kích hoạt `/dream` thủ công, nhưng không có tính năng lập lịch chạy ẩn dưới nền bằng cron.

**Bổ sung trong v2.1.100**:

Kairos Dream là chế độ kích hoạt thứ ba của hệ thống Dream — thực thi việc hợp nhất bộ nhớ tự động qua lập lịch cron chạy dưới nền, không cần đợi người dùng bắt đầu các phiên làm việc mới. Việc tạo biểu thức cron được trích xuất từ bundle:

```javascript
// Kỹ thuật đảo ngược bundle v2.1.100
function P_A() {
  let q = Math.floor(Math.random() * 360);
  return `${q % 60} ${Math.floor(q / 60)} * * *`;
  // Độ lệch giờ+phút ngẫu nhiên, tránh việc nhiều người dùng kích hoạt cùng lúc
}
```

Kết hợp với trường `reason` ("sessions"/"lock") của sự kiện `auto_dream_skipped`, Kairos Dream triển khai một vòng đời hợp nhất bộ nhớ dưới nền hoàn chỉnh.

**Ý nghĩa đối với cuốn sách**: ch24 được cập nhật phân tích về hệ thống Dream (ma trận kích hoạt ba cấp); chương ch29 về khả năng giám sát có thể tham khảo phân phối lý do bỏ qua của `auto_dream_skipped` như một case study thiết kế khả năng giám sát.

---

#### 2. Trình hướng dẫn nâng cấp mô hình Bedrock/Vertex

**Sự kiện**: 18 sự kiện (9 cho Bedrock + 9 cho Vertex), cấu trúc đối xứng

**Trạng thái trong v2.1.92**: v2.1.92 chỉ có `setup_started/complete/cancelled` của Bedrock (3 sự kiện).

**Bổ sung trong v2.1.100**:

Cơ chế phát hiện nâng cấp mô hình hoàn chỉnh và tự động chuyển đổi. Điểm nổi bật trong thiết kế:

1. **Phát hiện mô hình không được ghim cố định**: Quét cấu hình người dùng để tìm các cấp mô hình không được ghim rõ ràng thông qua biến môi trường.
2. **Thăm dò khả năng truy cập**: `probeBedrockModel` / `probeVertexModel` kiểm tra xem các mô hình mới có sẵn trong tài khoản của người dùng hay không.
3. **Xác nhận của người dùng**: Việc nâng cấp không tự động thực thi; yêu cầu người dùng chấp nhận/từ chối.
4. **Từ chối lâu dài**: Các nâng cấp bị từ chối được ghi lại trong cài đặt người dùng, ngăn việc nhắc lại nhiều lần.
5. **Dự phòng mặc định**: Khi mô hình mặc định không thể truy cập, hệ thống tự động chuyển sang mô hình thay thế cùng cấp.

Trình hướng dẫn Vertex (`vertex_setup_started` v.v.) là tính năng mới trong v2.1.100; v2.1.92 không có thiết lập Vertex tương tác.

---

#### 3. Autofix PR — Tự động sửa lỗi từ xa

**Sự kiện**: `tengu_autofix_pr_started`, `tengu_autofix_pr_result`

**Trạng thái trong v2.1.92**: Không tồn tại. v2.1.92 đã có ultraplan và ultrareview, nhưng không có autofix-pr.

**Bổ sung trong v2.1.100**:

Autofix PR là loại nhiệm vụ agent từ xa thứ tư, được liệt kê cùng với `remote-agent`, `ultraplan`, và `ultrareview` trong trình đăng ký loại nhiệm vụ từ xa `XAY`. Quy trình làm việc được trích xuất từ bundle:

```javascript
// Kỹ thuật đảo ngược bundle v2.1.100
// Trình đăng ký loại nhiệm vụ từ xa
XAY = ["remote-agent", "ultraplan", "ultrareview", "autofix-pr", "background-pr"];

// Khởi chạy Autofix PR
d("tengu_autofix_pr_started", {});
let b = await kt({
  initialMessage: h,
  source: "autofix_pr",
  branchName: P,
  reuseOutcomeBranch: P,
  title: `Autofix PR: ${k}/${R}#${v} (${P})`
});
```

Autofix PR khởi tạo một phiên Claude Code từ xa để giám sát một Pull Request cụ thể và tự động sửa các lỗi (thất bại CI, phản hồi duyệt mã). Khác với Ultraplan (lập kế hoạch) và Ultrareview (duyệt mã), Autofix PR tập trung vào việc **thực thi sửa lỗi**.

Lưu ý rằng `background-pr` cũng xuất hiện trong danh sách loại nhiệm vụ, gợi ý về một chế độ xử lý PR dưới nền khác.

---

#### 4. Chào đón Team mới (Team Onboarding) — Báo cáo sử dụng của nhóm

**Sự kiện**: `tengu_team_onboarding_invoked`, `tengu_team_onboarding_generated`, `tengu_team_onboarding_discovery_shown`

**Trạng thái trong v2.1.92**: Không tồn tại.

**Bổ sung trong v2.1.100**:

Trình tạo báo cáo chào đón nhóm thu thập dữ liệu sử dụng của người dùng (số lượng phiên, số lượng lệnh gạch chéo, số lượng máy chủ MCP) và tạo ra một tài liệu hướng dẫn từ một mẫu có sẵn. Các tham số chính được trích xuất từ bundle:

- `windowDays`: Cửa sổ phân tích (1-365 ngày)
- `sessionCount`, `slashCommandCount`, `mcpServerCount`: Các chiều thống kê sử dụng
- `GUIDE_TEMPLATE`, `USAGE_DATA`: Các biến mẫu báo cáo

Sự kiện thử nghiệm `cedar_inlet` kiểm soát việc hiển thị phần khám phá chào đón nhóm (`discovery_shown`), cho thấy đây là một tính năng đang được thử nghiệm A/B.

---

### Các sự kiện mật danh thử nghiệm

Các sự kiện có mật danh ngẫu nhiên sau đây là các thử nghiệm A/B với mục đích chưa được tiết lộ:

| Sự kiện | Trạng thái | Lưu ý |
|-------|--------|-------|
| `tengu_amber_sentinel` | Mới trong v2.1.100 | — |
| `tengu_basalt_kite` | Mới trong v2.1.100 | — |
| `tengu_billiard_aviary` | Mới trong v2.1.100 | — |
| `tengu_cedar_inlet` | Mới trong v2.1.100 | Liên quan đến khám phá chào đón nhóm |
| `tengu_coral_beacon` | Mới trong v2.1.100 | — |
| `tengu_flint_harbor` / `_prompt` / `_heron` | Mới trong v2.1.100 | 3 sự kiện liên quan |
| `tengu_garnet_loom` | Mới trong v2.1.100 | — |
| `tengu_pyrite_wren` | Mới trong v2.1.100 | — |
| `tengu_shale_finch` | Mới trong v2.1.100 | — |

Các thử nghiệm có trong v2.1.92 nhưng bị loại bỏ trong v2.1.100: `amber_lantern`, `editafterwrite_qpl`, `lean_sub_pf`, `maple_forge_w`, `relpath_gh`.

---

### Xu hướng thiết kế

Hướng phát triển của v2.1.92→v2.1.100:

1. **Hệ thống bộ nhớ chuyển từ bị động sang chủ động** (`auto_dream` → thực thi theo lịch `kairos_dream` + các lý do bỏ qua có thể theo dõi)
2. **Nền tảng đám mây chuyển từ cấu hình tĩnh sang các trình hướng dẫn** (biến môi trường thủ công → các trình hướng dẫn thiết lập tương tác + tự động phát hiện nâng cấp mô hình)
3. **Tái cấu trúc kiến trúc cầu nối IDE** (`bridge_repl` bị loại bỏ phần lớn, 16 sự kiện được dọn dẹp — chuyển sang cơ chế giao tiếp mới)
4. **Mở rộng dòng họ Agent từ xa** (`ultraplan/ultrareview` → bổ sung thêm `autofix-pr` + `background-pr`)
5. **Tinh chỉnh tối ưu hóa ngữ cảnh** (`tool_result_dedup` giúp giảm trùng lặp + người dùng có thể tự kiểm soát `MAX_CONTEXT_TOKENS`)

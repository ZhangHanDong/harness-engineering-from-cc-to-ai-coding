# Chương 20b: Nhóm và Sự Cộng tác Đa Tiến trình (Teams and Multi-Process Collaboration)

> **Định vị**: Chương này phân tích cơ chế cộng tác nhóm Swarm của Claude Code -- một mô hình cộng tác đa Agent có cấu trúc phẳng. Yêu cầu tiên quyết: Chương 20. Đối tượng độc giả: độc giả muốn hiểu sâu về cơ chế cộng tác nhóm Swarm của CC -- bao gồm lập lịch TaskList, phụ thuộc DAG, và giao tiếp qua Mailbox.

## Tại sao thảo luận về Nhóm riêng biệt

Chương 20 đã giới thiệu ba chế độ khởi tạo Agent của Claude Code -- Subagent, Fork, và Coordinator -- vốn chia sẻ đặc điểm chung là mối quan hệ phân cấp "cha khởi tạo con". Nhóm (hệ thống đồng đội) là một chiều kích khác: nó tạo ra một **nhóm có cấu trúc phẳng (flat-structured team)** nơi các Agent cộng tác thông qua truyền thông điệp thay vì các lệnh gọi phân cấp. Sự khác biệt này không chỉ thể hiện ở kiến trúc mà còn ở các triển khai kỹ thuật của giao thức truyền thông, đồng bộ hóa quyền hạn, và quản lý vòng đời.

---

## 20b.1 Các Agent Đồng đội (Agent Swarms)

Hệ thống đồng đội (teammate system) là một chiều kích khác của việc điều phối Agent. Khác với mô hình "cha khởi tạo con" của subagent, hệ thống đồng đội tạo ra một **nhóm có cấu trúc phẳng** nơi các Agent cộng tác thông qua truyền thông điệp.

### TeamCreateTool: Tạo nhóm

`TeamCreateTool` (`tools/TeamCreateTool/TeamCreateTool.ts`) được sử dụng để tạo nhóm mới:

```typescript
// tools/TeamCreateTool/TeamCreateTool.ts:37-49
const inputSchema = lazySchema(() =>
  z.strictObject({
    team_name: z.string().describe('Name for the new team to create.'),
    description: z.string().optional(),
    agent_type: z.string().optional()
      .describe('Type/role of the team lead'),
  }),
)
```

Thông tin nhóm được lưu trữ bền vững vào một tệp `TeamFile` chứa tên nhóm, danh sách thành viên, thông tin Leader, v.v. Tên nhóm phải là duy nhất -- các xung đột sẽ kích hoạt việc tự động tạo một chuỗi ký tự slug (dòng 64-72).

### TeammateAgentContext: Ngữ cảnh Đồng đội

Các đồng đội sử dụng kiểu dữ liệu `TeammateAgentContext` (`agentContext.ts` dòng 60-85), chứa thông tin điều phối nhóm phong phú:

```typescript
// utils/agentContext.ts:60-85
export type TeammateAgentContext = {
  agentId: string          // ID đầy đủ, ví dụ: "researcher@my-team"
  agentName: string        // Tên hiển thị, ví dụ: "researcher"
  teamName: string         // Nhóm thành viên
  agentColor?: string      // Màu sắc giao diện người dùng
  planModeRequired: boolean // Có cần phê duyệt kế hoạch hay không
  parentSessionId: string  // ID phiên của Leader
  isTeamLead: boolean      // Có phải là Leader hay không
  agentType: 'teammate'
}
```

ID của đồng đội sử dụng định dạng `name@team-name`, giúp dễ dàng xác định danh tính và sự trực thuộc của Agent ngay lập tức trong nhật ký và giao tiếp.

### Ràng buộc Cấu trúc Phẳng (Flat Structure Constraint)

Hệ thống đồng đội có một ràng buộc kiến trúc quan trọng: **đồng đội không thể khởi tạo các đồng đội khác** (dòng 272-274):

```typescript
// tools/AgentTool/AgentTool.tsx:272-274
if (isTeammate() && teamName && name) {
  throw new Error('Teammates cannot spawn other teammates — the team roster is flat.');
}
```

Đây là một thiết kế có chủ ý -- danh sách thành viên nhóm là một mảng phẳng, và việc lồng ghép các đồng đội sẽ tạo ra các mục trong danh sách mà không có thông tin nguồn gốc, gây nhầm lẫn cho logic điều phối của Leader.

Tương tự, các đồng đội trong cùng tiến trình (in-process teammates) không thể khởi tạo các Agent chạy ngầm (dòng 278-280) vì vòng đời của chúng bị ràng buộc vào tiến trình của Leader.

---

## 20b.2 Giao tiếp giữa các Agent (Inter-Agent Communication)

### SendMessageTool: Định tuyến Thông điệp

`SendMessageTool` (`tools/SendMessageTool/SendMessageTool.ts`) là cốt lõi của giao tiếp giữa các Agent. Trường `to` của nó hỗ trợ nhiều chế độ gửi địa chỉ:

```typescript
// tools/SendMessageTool/SendMessageTool.ts:69-76
to: z.string().describe(
  feature('UDS_INBOX')
    ? 'Recipient: teammate name, "*" for broadcast, "uds:<socket-path>" for a local peer, or "bridge:<session-id>" for a Remote Control peer'
    : 'Recipient: teammate name, or "*" for broadcast to all teammates',
),
```

Các kiểu thông điệp tạo thành một union phân biệt (dòng 47-65), hỗ trợ:
- Thông điệp văn bản thuần túy (plain text)
- Yêu cầu tắt máy (`shutdown_request`)
- Phản hồi tắt máy (`shutdown_response`)
- Phản hồi phê duyệt kế hoạch (`plan_approval_response`)

### Cơ chế Phát sóng (Broadcast Mechanism)

Khi `to` là `*`, một cuộc phát sóng sẽ được kích hoạt (`handleBroadcast`, dòng 191-266): duyệt qua tất cả thành viên trong tệp nhóm (ngoại trừ người gửi), ghi vào hộp thư (mailbox) của từng người. Kết quả phát sóng bao gồm danh sách người nhận để bộ điều phối theo dõi.

### Hệ thống Hộp thư (Mailbox System)

Các thông điệp được ghi vật lý vào các hộp thư trên hệ thống tệp thông qua hàm `writeToMailbox()`. Mỗi thông điệp chứa: tên người gửi, nội dung văn bản, bản tóm tắt, dấu thời gian, và màu sắc của người gửi. Thiết kế hộp thư dựa trên hệ thống tệp này cho phép các đồng đội đa tiến trình (chế độ tmux) giao tiếp thông qua một hệ thống tệp dùng chung.

### UDS_INBOX: Mở rộng Socket Miền Unix (Unix Domain Socket Extension)

Khi Feature Flag `UDS_INBOX` được bật, khả năng định địa chỉ của `SendMessageTool` được mở rộng sang Socket Miền Unix: `"uds:<socket-path>"` có thể gửi thông điệp đến các thực thể Claude Code khác trên cùng một máy, và `"bridge:<session-id>"` có thể gửi thông điệp đến các đối tác Điều khiển từ xa (Remote Control).

Điều này tạo ra một sơ đồ giao tiếp vượt qua ranh giới của một nhóm đơn lẻ:

```
┌─────────────────────────────────────────────────────────────────┐
│                 Kiến trúc Giao tiếp giữa các Agent              │
│                                                                 │
│  ┌──────────────────────────────────┐                          │
│  │           Nhóm "my-team"         │                          │
│  │                                  │                          │
│  │  ┌─────────┐     Hộp thư    ┌─────────┐                     │
│  │  │ Leader  │◄─────────────►│Đồng đội │                     │
│  │  │ (lead)  │ (hệ thống tp) │  (dev)  │                     │
│  │  └────┬────┘               └─────────┘                     │
│  │       │                                                    │
│  │       │ SendMessage(to: "tester")                         │
│  │       │                                                    │
│  │       ▼                                                    │
│  │  ┌─────────┐                                              │
│  │  │Đồng đội │                                              │
│  │  │ (tester)│                                              │
│  │  └─────────┘                                              │
│  └──────────────────────────────────┘                          │
│         │                                                      │
│         │ SendMessage(to: "uds:/tmp/other.sock")              │
│         ▼                                                      │
│  ┌──────────────┐                                              │
│  │ Thực thể     │    SendMessage(to: "bridge:<session>")       │
│  │ Claude Code  │──────────────────────────►  Điều khiển từ xa │
│  │ khác         │                            (Remote Control)  │
│  └──────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Báo cáo Kết quả của Worker trong Chế độ Điều phối

Trong Chế độ Điều phối, khi một Worker hoàn thành tác vụ của nó, kết quả sẽ được chèn vào cuộc hội thoại của bộ điều phối dưới dạng một **tin nhắn vai trò người dùng (user-role message)** ở định dạng XML `<task-notification>` (`coordinatorMode.ts` dòng 148-159):

```xml
<task-notification>
  <task-id>{agentId}</task-id>
  <status>completed|failed|killed</status>
  <summary>{human-readable status summary}</summary>
  <result>{Agent's final text response}</result>
  <usage>
    <total_tokens>N</total_tokens>
    <tool_uses>N</tool_uses>
    <duration_ms>N</duration_ms>
  </usage>
</task-notification>
```

Prompt của bộ điều phối yêu cầu rõ ràng (dòng 144): "Chúng trông giống như tin nhắn của người dùng nhưng không phải vậy. Hãy phân biệt chúng bằng thẻ mở `<task-notification>`." Thiết kế này ngăn bộ điều phối phản hồi kết quả của Worker như thể đó là đầu vào của người dùng.

---

## 20b.3 Nhân Lập lịch Thực tế: TaskList, Vòng lặp Claim, và các Hook Rỗi (Idle Hooks)

Nếu bạn chỉ nhìn vào `TeamCreateTool`, `SendMessageTool`, and Mailbox, bạn sẽ dễ dàng hiểu Nhóm chỉ là "một tập hợp các Agent có thể gửi tin nhắn cho nhau." Nhưng giá trị thực sự của Swarm trong Claude Code không nằm ở việc trò chuyện, mà ở **đồ thị tác vụ dùng chung (shared task graph)**. Prompt của `TeamCreate` nêu rõ điều này: `Các nhóm có mối quan hệ tương ứng 1:1 với danh sách tác vụ (Team = TaskList)`. Khi tạo một nhóm, `TeamCreateTool` không chỉ ghi một tệp `TeamFile` -- nó còn đặt lại và tạo thư mục tác vụ tương ứng, sau đó liên kết `taskListId` của Leader với tên nhóm. Điều này có nghĩa là Nhóm chưa bao giờ được thiết kế theo kiểu "nhóm là trên hết, tác vụ chỉ là phụ trợ", mà đúng hơn là **nhóm và danh sách tác vụ là hai góc nhìn của cùng một thực thể chạy lúc thực thi**.

### Tác vụ không phải là Todo, Chúng là các Nút DAG (DAG Nodes)

Cấu trúc `Task` trong `utils/tasks.ts` chứa:

```typescript
{
  id: string,
  owner?: string,
  status: 'pending' | 'in_progress' | 'completed',
  blocks: string[],
  blockedBy: string[],
}
```

Các trường quan trọng nhất ở đây không phải là `status`, mà là `blocks` và `blockedBy`. Chúng nâng tầm danh sách tác vụ từ một danh sách việc cần làm thông thường thành một **đồ thị phụ thuộc rõ ràng (explicit dependency graph)**: một tác vụ chỉ có thể thực thi sau khi tất cả các tác vụ chặn nó (blockers) đã hoàn thành. Thiết kế này cho phép Leader tạo trước toàn bộ một nhóm các đầu việc với các mối quan hệ phụ thuộc, sau đó bàn giao việc "khi nào cần song song hóa" cho môi trường thực thi, thay vì phải liên tục điều phối bằng lời nói trong các prompt.

Đây cũng là lý do tại sao prompt của `TeamCreate` nhấn mạnh: "các đồng đội nên kiểm tra TaskList định kỳ, đặc biệt là sau khi hoàn thành mỗi tác vụ, để tìm công việc khả dụng hoặc xem các tác vụ mới được giải phóng." Claude Code không yêu cầu mỗi đồng đội phải có khả năng suy luận kế hoạch toàn cục hoàn chỉnh; nó yêu cầu các đồng đội phải **quay lại đồ thị tác vụ dùng chung và đọc trạng thái**.

### Tự động Nhận (Auto-Claim): Bộ lập lịch Tối thiểu của Swarm

Thứ thực sự thúc đẩy đồ thị tác vụ này hoạt động là `useTaskListWatcher.ts`. Trình theo dõi (watcher) này kích hoạt một cuộc kiểm tra bất cứ khi nào thư mục tác vụ thay đổi hoặc Agent trở nên rảnh rỗi (idle), tự động chọn một tác vụ khả dụng:

- `status === 'pending'`
- `owner` trống
- Tất cả các tác vụ trong `blockedBy` đã hoàn thành

Hàm `findAvailableTask()` trong mã nguồn lọc chính xác theo các điều kiện này. Sau khi tìm thấy một tác vụ, môi trường thực thi trước tiên sẽ gọi `claimTask()` để giành quyền sở hữu, sau đó định dạng tác vụ thành một prompt để Agent thực thi; nếu việc gửi thất bại, quyền sở hữu sẽ được giải phóng. Hai ý nghĩa kỹ thuật quan trọng:

1. **Lập lịch và suy luận được tách biệt.** Mô hình không cần xác định bằng ngôn ngữ tự nhiên "tác vụ nào chưa được ai khác thực hiện và đã giải quyết xong các phụ thuộc"; môi trường thực thi sẽ thu hẹp các ứng viên thành một tác vụ rõ ràng duy nhất trước.
2. **Tính song song đến từ trạng thái dùng chung, không phải từ đàm phán tin nhắn.** Nhiều Agent có thể tiến hành công việc đồng thời không phải vì chúng đủ thông minh để tự phối hợp với nhau, mà vì các kiểm tra claim + blocker đã mã hóa rõ ràng các xung đột vào máy trạng thái (state machine).

Từ góc nhìn này, Swarm của Claude Code đã có một bộ lập lịch nhỏ nhưng hoàn chỉnh: **đồ thị tác vụ + nhận quyền nguyên tử (atomic claim) + chuyển đổi trạng thái**. Hộp thư (Mailbox) chỉ là một phần bổ trợ cộng tác, không phải là bề mặt lập lịch chính.

### Bề mặt Sự kiện Sau Lượt: TaskCompleted và TeammateIdle

Một khía cạnh quan trọng khác của Swarm là khi một đồng đội kết thúc một lượt thực thi, nó không chỉ đơn giản là "dừng lại" -- nó đi vào một giai đoạn kết thúc hướng sự kiện (event-driven wrap-up phase). Trong `query/stopHooks.ts`, khi trình thực thi hiện tại là một đồng đội, Claude Code sẽ chạy hai loại sự kiện chuyên biệt sau các Stop hook thông thường:

- `TaskCompleted`: kích hoạt các hook hoàn thành cho các tác vụ `in_progress` thuộc sở hữu của đồng đội hiện tại.
- `TeammateIdle`: kích hoạt các hook khi đồng đội chuyển sang trạng thái rảnh rỗi (idle).

Điều này làm cho Nhóm không hoàn toàn dựa trên kéo (pull-based) cũng không hoàn toàn dựa trên đẩy (push-based), mà là sự kết hợp của cả hai:

- **kéo (pull)**: các đồng đội rảnh rỗi quay lại TaskList và tiếp tục nhận các tác vụ mới.
- **đẩy (push)**: việc hoàn thành tác vụ và trạng thái rảnh rỗi của đồng đội kích hoạt các sự kiện, thông báo cho Leader hoặc thúc đẩy các tự động hóa tiếp theo.

Nói cách khác, Swarm của Claude Code không phải là "một nhóm các agent gửi tin nhắn", mà là một nhân cộng tác được cấu thành bởi **đồ thị tác vụ dùng chung + hộp thư bền vững + các sự kiện sau lượt**.

### Đây không phải là Bộ nhớ dùng chung, mà là Trạng thái dùng chung

Cách diễn đạt ở đây phải rất chính xác. Nhóm có vẻ giống như "nhiều Agent chia sẻ một không gian làm việc", nhưng theo mã nguồn, mô tả chính xác hơn không phải là "bộ nhớ dùng chung (shared memory)" mà là ba lớp trạng thái dùng chung (shared state):

- **Trạng thái tác vụ dùng chung**: `~/.claude/tasks/{team-name}/`
- **Trạng thái giao tiếp dùng chung**: `~/.claude/teams/{team}/inboxes/*.json`
- **Cấu hình nhóm dùng chung**: `~/.claude/teams/{team}/config.json`

Các đồng đội trong cùng tiến trình (In-Process teammates) chỉ tình cờ chạy trong cùng một tiến trình vật lý và bảo tồn ngữ cảnh nhận dạng của riêng họ thông qua `AsyncLocalStorage`; điều này không nâng tầm toàn bộ hệ thống thành một môi trường chạy bộ nhớ dùng chung kiểu bảng đen (blackboard shared-memory) đa năng. Sự phân biệt này rất quan trọng vì nó xác định mô hình thực sự có thể mang đi (portable pattern) của Swarm trong Claude Code: **hãy ngoại hóa trạng thái cộng tác trước, sau đó để các đơn vị thực thi khác nhau cộng tác xung quanh nó**.

---

## 20b.4 Vòng đời Agent Bất đồng bộ (Async Agent Lifecycle)

Khi `shouldRunAsync` là `true` (được kích hoạt bởi bất kỳ giá trị nào như `run_in_background`, `background: true`, Chế độ Điều phối, chế độ Fork, chế độ trợ lý, v.v., dòng 567), Agent sẽ đi vào một vòng đời bất đồng bộ:

1. **Đăng ký (Registration)**: `registerAsyncAgent()` tạo một bản ghi tác vụ nền, gán `agentId`.
2. **Thực thi (Execution)**: Chạy `runAgent()` được bọc trong `runWithAgentContext()`.
3. **Báo cáo Tiến độ (Progress Reporting)**: Cập nhật trạng thái thông qua `updateAsyncAgentProgress()` và các callback `onProgress`.
4. **Hoàn thành/Thất bại (Completion/Failure)**: Gọi `completeAsyncAgent()` hoặc `failAsyncAgent()`.
5. **Thông báo (Notification)**: `enqueueAgentNotification()` đưa kết quả vào luồng tin nhắn của người gọi.

Một quyết định thiết kế chính: các Agent chạy ngầm không được liên kết với `abortController` của Agent cha (bình luận dòng 694-696) -- khi người dùng nhấn ESC để hủy luồng chính, các Agent chạy ngầm vẫn tiếp tục chạy. Chúng chỉ có thể bị chấm dứt rõ ràng thông qua `chat:killAgents`.

### Cô lập bằng Worktree (Worktree Isolation)

Khi `isolation: 'worktree'`, Agent chạy trong một git worktree tạm thời (dòng 590-593):

```typescript
const slug = `agent-${earlyAgentId.slice(0, 8)}`;
worktreeInfo = await createAgentWorktree(slug);
```

Sau khi Agent hoàn thành, nếu worktree không có thay đổi nào (so với commit HEAD tại thời điểm tạo), nó sẽ tự động được dọn dẹp (dòng 666-679). Các worktree có thay đổi sẽ được giữ lại, và đường dẫn cũng như tên nhánh của chúng sẽ được trả về cho người gọi.

---

## 20b.5 Chi tiết Triển khai Nhóm: Backend, Giao tiếp, Quyền hạn, và Bộ nhớ

> Phần này đi sâu vào cấp độ triển khai của 20b.1 (tổng quan về đồng đội). Phần 20b.1 trả lời "Nhóm là gì" -- các nhóm có cấu trúc phẳng, TeamCreateTool, kiểu dữ liệu TeammateAgentContext; phần này trả lời "Nhóm thực sự chạy như thế nào" -- quản lý tiến trình, giao thức truyền thông, đồng bộ hóa quyền hạn, và triển khai kỹ thuật bộ nhớ dùng chung.
>
> Trong mã nguồn, "Swarm" và "Team" là các từ đồng nghĩa: thư mục là `utils/swarm/`, công cụ là `TeamCreateTool`, Feature Flag là `ENABLE_AGENT_SWARMS`, và hằng số là `SWARM_SESSION_NAME = 'claude-swarm'`.

### Ba Backend, Một Giao diện

Nhóm hỗ trợ ba backend vật lý, được thống nhất đằng sau giao diện `PaneBackend` + `TeammateExecutor` (`utils/swarm/backends/types.ts`):

| Backend | Mô hình Tiến trình | Giao tiếp | Trường hợp Sử dụng |
|---------|--------------|---------------|----------|
| **Tmux** | Các tiến trình CLI độc lập, chia cửa sổ (panes) tmux | Hộp thư hệ thống tệp | Backend mặc định, cho Linux/macOS |
| **iTerm2** | Các tiến trình CLI độc lập, chia cửa sổ iTerm2 | Hộp thư hệ thống tệp | Người dùng terminal gốc macOS |
| **In-Process** | Cô lập `AsyncLocalStorage` trong cùng tiến trình | Hàng đợi bộ nhớ AppState | Không có môi trường tmux/iTerm2 |

Chuỗi ưu tiên phát hiện backend (`backends/registry.ts`):

```
1. Đang chạy bên trong tmux?             → Tmux (native)
2. Bên trong iTerm2 và có sẵn it2?      → iTerm2 (native)
3. Bên trong iTerm2 nhưng không có it2? → Gợi ý cài đặt it2
4. Hệ thống có tmux?                    → Tmux (phiên bên ngoài)
5. Không có điều nào ở trên?            → Dự phòng sang In-Process (trong tiến trình)
```

Lợi ích của mô hình chiến lược (strategy pattern) này: `TeamCreateTool` và `SendMessageTool` của Leader không cần biết các đồng đội chạy trên backend nào -- `spawnTeammate()` sẽ tự động chọn tùy chọn tốt nhất.

### Vòng đời của Nhóm

```typescript
// utils/swarm/teamHelpers.ts — Cấu trúc TeamFile
{
  name: string,                    // Tên nhóm duy nhất
  description?: string,
  createdAt: number,
  leadAgentId: string,             // Định dạng: team-lead@{teamName}
  members: [{
    agentId: string,               // Định dạng: {name}@{teamName}
    name: string,
    agentType?: string,
    model?: string,
    prompt: string,
    color: string,                 // Màu terminal tự động gán
    planModeRequired: boolean,
    tmuxPaneId?: string,
    sessionId?: string,
    backendType: BackendType,
    isActive: boolean,
    mode: PermissionMode,
  }]
}
```

Vị trí lưu trữ: `~/.claude/teams/{teamName}/config.json`

**Luồng khởi tạo đồng đội** (`spawnMultiAgent.ts:305-539`):

1. Phát hiện backend -> tạo tên duy nhất -> định dạng ID agent (`{name}@{teamName}`)
2. Gán màu terminal -> tạo phân tách cửa sổ tmux/iTerm2
3. Xây dựng các tham số CLI kế thừa: `--agent-id`, `--agent-name`, `--team-name`, `--agent-color`, `--parent-session-id`, `--permission-mode`
4. Xây dựng các biến môi trường kế thừa -> gửi lệnh khởi động đến cửa sổ được chia
5. Cập nhật TeamFile -> gửi hướng dẫn ban đầu qua Mailbox
6. Đăng ký theo dõi tác vụ ngoài tiến trình (out-of-process task tracking)

**Ràng buộc cấu trúc phẳng**: Đồng đội không thể khởi tạo các nhóm phụ (`AgentTool.tsx:266-300`). Đây không phải là giới hạn kỹ thuật -- đó là một nguyên tắc tổ chức có chủ ý: việc điều phối được tập trung tại Leader, tránh các chuỗi ủy thác sâu vô hạn.

### Giao thức Truyền thông Hộp thư (Mailbox Communication Protocol)

Các đồng đội giao tiếp bất đồng bộ thông qua hộp thư trên hệ thống tệp (`teammateMailbox.ts`):

```
~/.claude/teams/{teamName}/inboxes/{agentName}.json
```

**Kiểm soát đồng thời**: tệp khóa bất đồng bộ (async lockfile) + lùi bước lũy thừa (exponential backoff) (10 lần thử lại, cửa sổ trễ 5-100ms).

**Cấu trúc thông điệp**:

```typescript
type TeammateMessage = {
  from: string,      // Tên người gửi
  text: string,      // Nội dung thông điệp hoặc thông điệp điều khiển JSON
  timestamp: string,
  read: boolean,      // Đánh dấu đã đọc
  color?: string,     // Màu terminal của người gửi
  summary?: string,   // Tóm tắt 5-10 từ
}
```

**Các kiểu thông điệp điều khiển** (JSON có cấu trúc được lồng trong trường `text`):

| Kiểu | Hướng | Mục đích |
|------|-----------|---------|
| Thông báo `idle` | Đồng đội -> Leader | Đồng đội hoàn thành công việc, báo cáo lý do (available/error/shutdown/completed) |
| `shutdown_request` | Leader -> Đồng đội | Yêu cầu tắt máy một cách êm ái |
| `shutdown_response` | Đồng đội -> Leader | Chấp nhận hoặc từ chối yêu cầu tắt máy |
| `plan_approval_response` | Leader -> Đồng đội | Phê duyệt hoặc từ chối kế hoạch đã nộp của đồng đội |

**Cấu trúc thông báo rỗi (Idle notification)** (`teammateMailbox.ts`):

```typescript
type IdleNotificationMessage = {
  type: 'idle',
  teamName: string,
  agentName: string,
  agentId: string,
  idleReason: 'available' | 'error' | 'shutdown' | 'completed',
  summary?: string,           // Tóm tắt công việc
  peerDmSummary?: string,     // Tóm tắt tin nhắn trực tiếp gần đây
  errorDetails?: string,
}
```

### Đồng bộ hóa Quyền hạn: Phê duyệt Proxy bởi Leader

Đồng đội không thể tự phê duyệt các cuộc gọi công cụ nguy hiểm -- họ phải đi qua proxy của Leader (`utils/swarm/permissionSync.ts`):

```
~/.claude/teams/{teamName}/permissions/
  ├── pending/     # Các yêu cầu đang chờ phê duyệt
  └── resolved/    # Các yêu cầu đã được xử lý
```

**Luồng yêu cầu**:

```
Worker gặp phải kiểm tra quyền hạn
  ↓
Tạo SwarmPermissionRequest (với toolName, input, gợi ý)
  ↓
Ghi vào pending/{requestId}.json + gửi đến Leader Mailbox
  ↓
Leader khảo sát Mailbox → phát hiện yêu cầu quyền hạn → hiển thị cho người dùng
  ↓
Người dùng phê duyệt/từ chối trên terminal của Leader
  ↓
Ghi vào resolved/{requestId}.json
  ↓
Worker khảo sát resolved/ → nhận kết quả → tiếp tục thực thi
```

Thiết kế này đảm bảo rằng ngay cả khi các đồng đội chạy trong các tiến trình độc lập, mọi thao tác nguy hiểm vẫn phải đi qua sự phê duyệt của con người.

### Bộ nhớ Nhóm (Team Memory)

Cờ tính năng `TENGU_HERRING_CLOCK` kiểm soát điều này. Nằm tại:

```
~/.claude/projects/{project}/memory/team/MEMORY.md
```

Độc lập với bộ nhớ cá nhân (`~/.claude/projects/{project}/memory/`), được chia sẻ bởi tất cả các thành viên trong nhóm. Sử dụng cùng một luồng ghi hai bước như bộ nhớ cá nhân: trước tiên ghi tệp `.md`, sau đó cập nhật chỉ mục `MEMORY.md`.

**Xác thực bảo mật đường dẫn** (`memdir/teamMemPaths.ts`, bản vá bảo mật PSR M22186):

| Kiểu Tấn công | Cách Bảo vệ |
|------------|-----------|
| Tiêm ký tự Null (Null byte injection) | Từ chối các đường dẫn chứa `\0` |
| Duyệt qua URL-encoded (URL-encoded traversal) | Từ chối `%2e%2e%2f` và các mẫu tương tự |
| Tấn công chuẩn hóa Unicode (Unicode normalization) | Từ chối ký tự fullwidth `．．／` và các biến thể tương tự |
| Duyệt qua dấu gạch chéo ngược (Backslash traversal) | Từ chối các đường dẫn chứa `\` |
| Vòng lặp liên kết tượng trưng (Symlink loops) | Phát hiện ELOOP + các liên kết treo (dangling links) |
| Thoát khỏi đường dẫn (Path escape) | Giải quyết bằng realpath để xác minh sự chứa đựng của tổ tiên tồn tại sâu nhất |

### Các Đồng đội Trong Tiến trình: Cộng tác Nhóm Không cần tmux

Khi môi trường thiếu tmux/iTerm2, các đồng đội chạy trong cùng một tiến trình được cô lập bởi `AsyncLocalStorage` (`utils/swarm/spawnInProcess.ts`):

```typescript
// Cô lập ngữ cảnh AsyncLocalStorage
type TeammateContext = {
  agentId: string,
  agentName: string,
  teamName: string,
  parentSessionId: string,
  isInProcess: true,
  abortController: AbortController,  // Kiểm soát hủy bỏ độc lập
}

runWithTeammateContext<T>(context, fn: () => T): T  // Thực thi cô lập
```

Trạng thái tác vụ của đồng đội trong tiến trình (`InProcessTeammateTaskState`) chứa:

- `pendingUserMessages: string[]` -- hàng đợi thông điệp (thay thế Hộp thư hệ thống tệp)
- `awaitingPlanApproval: boolean` -- chờ phê duyệt của Leader trong chế độ Plan
- `isIdle: boolean` -- trạng thái rảnh rỗi
- `onIdleCallbacks: Array<() => void>` -- các callback khi rảnh rỗi (thông báo cho Leader)
- `messages: Message[]` -- bộ đệm hiển thị UI (giới hạn `TEAMMATE_MESSAGES_UI_CAP = 50`)

Sự khác biệt chính so với các đồng đội tmux: giao tiếp thông qua hàng đợi bộ nhớ thay vì Hộp thư hệ thống tệp, nhưng API hoàn toàn nhất quán.

### Đúc kết Mô hình: Cộng tác Đa tiến trình dựa trên Hệ thống tệp

Thiết kế giao tiếp của Nhóm đưa ra một lựa chọn phản trực giác nhưng thực tế: **sử dụng hệ thống tệp thay vì IPC/RPC cho giao tiếp đa tiến trình**.

| Chiều so sánh | Hộp thư Hệ thống tệp | IPC/RPC truyền thống |
|-----------|-------------------|-------------------|
| Tính Bền vững | Tin nhắn tồn tại ngay cả khi tiến trình bị crash | Bị mất khi ngắt kết nối |
| Khả năng Debug | Dùng lệnh `cat` trực tiếp để kiểm tra | Yêu cầu các công cụ gỡ lỗi chuyên dụng |
| Kiểm soát Đồng thời | Sử dụng tệp khóa (lockfile) | Được tích hợp sẵn trong giao thức |
| Độ trễ | Khoảng thời gian khảo sát (khung mili giây) | Tức thời |
| Xuyên máy | Yêu cầu hệ thống tệp chia sẻ | Được hỗ trợ gốc |

Đối với các kịch bản Nhóm Agent (tương tác ở khung thời gian giây, tiến trình có thể bị lỗi, cần con người gỡ lỗi), sự đánh đổi của Hộp thư hệ thống tệp là hợp lý -- UDS đóng vai trò như một giải pháp bổ sung cho các kịch bản yêu cầu độ trễ thấp.

---

## Những việc Người dùng Có thể Làm

**Tận dụng hệ thống Nhóm để nâng cao hiệu quả cộng tác đa Agent:**

1. **Lưu ý các chế độ định địa chỉ để giao tiếp giữa các Agent.** `SendMessageTool` hỗ trợ định địa chỉ theo tên (`"tester"`), phát sóng (`"*"`), và định địa chỉ UDS (`"uds:<path>"`). Việc hiểu các chế độ định địa chỉ này giúp thiết kế các luồng công việc đa Agent hiệu quả hơn.

2. **Hiểu cách lựa chọn backend của Nhóm.** Nếu bạn sử dụng tmux hoặc iTerm2, các đồng đội sẽ chạy dưới dạng các cửa sổ terminal được chia độc lập, giao tiếp thông qua Hộp thư hệ thống tệp; nếu không có bộ quản lý cửa sổ terminal, hệ thống sẽ tự động chuyển sang chế độ trong tiến trình (in-process). Biết điều này giúp gỡ lỗi các vấn đề giao tiếp giữa các đồng đội.

3. **Sử dụng phát hiện trạng thái rảnh rỗi để đánh giá trạng thái đồng đội.** Leader cảm nhận trạng thái của đồng đội bằng cách khảo sát các thông báo rỗi trong Hộp thư. Nếu một đồng đội có vẻ bị "kẹt", việc kiểm tra các tệp hộp thư dưới thư mục `~/.claude/teams/{teamName}/inboxes/` có thể giúp định vị vấn đề.

4. **Phê duyệt quyền hạn được tập trung tại Leader.** Mọi thao tác nguy hiểm của đồng đội đều yêu cầu phê duyệt thông qua terminal của Leader. Hãy đảm bảo terminal của Leader luôn hoạt động, nếu không các đồng đội sẽ bị chặn để chờ phê duyệt.

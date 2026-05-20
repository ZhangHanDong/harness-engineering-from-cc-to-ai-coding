# Phụ lục G: Hệ thống xác thực & Đăng ký thuê bao — Từ OAuth đến ranh giới tuân thủ

> Phụ lục này phân tích kiến trúc xác thực và hệ thống đăng ký thuê bao của Claude Code v2.1.88 dựa trên mã nguồn của nó, đồng thời kiểm tra các ranh giới tuân thủ đối với các nhà phát triển xây dựng Agent trong bối cảnh Anthropic cấm các công cụ bên thứ ba vào tháng 4 năm 2026.

## G.1 Kiến trúc xác thực OAuth đường truyền kép

Claude Code hỗ trợ hai đường dẫn xác thực khác biệt rõ rệt, phục vụ cho hai nhóm người dùng khác nhau.

### G.1.1 Người dùng đăng ký thuê bao Claude.ai

Người dùng đăng ký thuê bao (Pro/Max/Team/Enterprise) xác thực thông qua điểm cuối OAuth của Claude.ai:

```
Người dùng → claude login → claude.com/cai/oauth/authorize
  → Trang ủy quyền (luồng PKCE)
  → Gọi lại (Callback) → exchangeCodeForTokens()
  → OAuth access_token + refresh_token
  → Sử dụng token trực tiếp để gọi API Anthropic (không cần khóa API)
```

```typescript
// restored-src/src/constants/oauth.ts:18-20
const CLAUDE_AI_INFERENCE_SCOPE = 'user:inference'
const CLAUDE_AI_PROFILE_SCOPE = 'user:profile'
```

Các phạm vi (scopes) chính:
- `user:inference` — Quyền gọi mô hình
- `user:profile` — Đọc thông tin tài khoản
- `user:sessions` — Quản lý phiên làm việc
- `user:mcp` — Truy cập máy chủ MCP
- `user:file_upload` — Tải tệp lên

Cấu hình OAuth (`restored-src/src/constants/oauth.ts:60-234`):

| Cấu hình | Giá trị Production |
|---------------|-----------------|
| URL ủy quyền | `https://claude.com/cai/oauth/authorize` |
| URL mã thông báo (Token URL) | `https://platform.claude.com/v1/oauth/token` |
| Client ID | `9d1c250a-e61b-44d9-88ed-5944d1962f5e` |
| PKCE | Yêu cầu (S256) |

### G.1.2 Người dùng API Console

Người dùng Console (trả tiền theo mức sử dụng - pay-as-you-go) xác thực thông qua nền tảng nhà phát triển Anthropic:

```
Người dùng → claude login → platform.claude.com/oauth/authorize
  → Ủy quyền (phạm vi: org:create_api_key)
  → Gọi lại (Callback) → exchangeCodeForTokens()
  → OAuth token → createAndStoreApiKey()
  → Tạo khóa API tạm thời → Sử dụng khóa để gọi API
```

Sự khác biệt: Người dùng Console có một bước bổ sung — sau khi xác thực OAuth, một khóa API được tạo ra, và các cuộc gọi API thực tế sử dụng xác thực dựa trên khóa thay vì xác thực dựa trên mã thông báo (token).

### G.1.3 Các nhà cung cấp bên thứ ba

Bên cạnh phương thức xác thực của riêng Anthropic, Claude Code cũng hỗ trợ:

| Nhà cung cấp | Biến môi trường | Phương thức xác thực |
|----------|---------------------|----------------------|
| AWS Bedrock | `CLAUDE_CODE_USE_BEDROCK=1` | Chuỗi thông tin xác thực AWS (credential chain) |
| GCP Vertex AI | `CLAUDE_CODE_USE_VERTEX=1` | Thông tin xác thực GCP |
| Azure Foundry | `CLAUDE_CODE_USE_FOUNDRY=1` | Thông tin xác thực Azure |
| Khóa API trực tiếp | `ANTHROPIC_API_KEY=sk-...` | Truyền trực tiếp |
| Trình hỗ trợ khóa API | Cấu hình `apiKeyHelper` | Lệnh tùy chỉnh |

```typescript
// restored-src/src/utils/auth.ts:208-212
type ApiKeySource =
  | 'ANTHROPIC_API_KEY'     // Biến môi trường
  | 'apiKeyHelper'          // Lệnh tùy chỉnh
  | '/login managed key'    // Khóa được tạo qua OAuth
  | 'none'                  // Không xác thực
```

## G.2 Các cấp đăng ký thuê bao và Giới hạn tốc độ

### G.2.1 Bốn cấp đăng ký thuê bao

Hàm phát hiện đăng ký thuê bao trong mã nguồn (`restored-src/src/utils/auth.ts:1662-1711`) tiết lộ hệ thống phân cấp đầy đủ:

| Cấp thuê bao | Kiểu tổ chức | Hệ số nhân tốc độ | Giá (Hàng tháng) |
|------|------------------|-----------------|-----------------|
| **Pro** | `claude_pro` | 1x | $20 |
| **Max** | `claude_max` | 5x hoặc 20x | $100 / $200 |
| **Team** | `claude_team` | 5x (Cao cấp) | Theo mỗi vị trí |
| **Enterprise** | `claude_enterprise` | Tùy chỉnh | Theo hợp đồng |

```typescript
// restored-src/src/utils/auth.ts:1662-1711
function getSubscriptionType(): 'max' | 'pro' | 'team' | 'enterprise' | null
function isMaxSubscriber(): boolean
function isTeamPremiumSubscriber(): boolean  // Team với giới hạn tốc độ gấp 5 lần
function getRateLimitTier(): string  // ví dụ: 'default_claude_max_20x'
```

### G.2.2 Các cấp giới hạn tốc độ (Rate Limit Tiers)

Các giá trị được trả về bởi hàm `getRateLimitTier()` ảnh hưởng trực tiếp đến giới hạn tần suất gọi API:

- `default_claude_max_20x` — Cấp Max cao nhất, gấp 20 lần tốc độ mặc định
- `default_claude_max_5x` — Cấp Max tiêu chuẩn / Team Premium
- Mặc định (Default) — Cấp Pro và Team thông thường

### G.2.3 Sử dụng thêm (Extra Usage)

Một số thao tác nhất định sẽ kích hoạt việc tính phí bổ sung (`restored-src/src/utils/extraUsage.ts:4-24`):

```typescript
function isBilledAsExtraUsage(): boolean {
  // Các trường hợp sau sẽ kích hoạt tính phí Extra Usage:
  // 1. Người dùng đăng ký thuê bao Claude.ai sử dụng Chế độ nhanh (Fast Mode)
  // 2. Sử dụng các mô hình có cửa sổ ngữ cảnh 1M (Opus 4.6, Sonnet 4.6)
}
```

Các kiểu tính phí được hỗ trợ:
- `stripe_subscription` — Đăng ký thuê bao Stripe tiêu chuẩn
- `stripe_subscription_contracted` — Dựa trên hợp đồng
- `apple_subscription` — Mua trong ứng dụng (IAP) Apple
- `google_play_subscription` — Mua trong ứng dụng Google Play

## G.3 Quản lý mã thông báo và Lưu trữ an toàn

### G.3.1 Vòng đời của Token

```
Nhận mã thông báo (token) → Lưu trữ trong macOS Keychain → Đọc từ Keychain khi cần thiết
  → Tự động làm mới 5 phút trước khi hết hạn → Thử lại nếu làm mới thất bại (tối đa 3 lần)
  → Tất cả lượt thử lại đều thất bại → Yêu cầu người dùng đăng nhập lại
```

Hiện thực hóa cốt lõi (`restored-src/src/utils/auth.ts`):

```typescript
// Kiểm tra hết hạn: khoảng đệm 5 phút
function isOAuthTokenExpired(token): boolean {
  return token.expires_at < Date.now() + 5 * 60 * 1000
}

// Tự động làm mới
async function checkAndRefreshOAuthTokenIfNeeded() {
  // Làm mới token với logic thử lại
  // Xóa bộ nhớ đệm nếu thất bại, tải lại trong cuộc gọi tiếp theo
}
```

### G.3.2 Lưu trữ an toàn

- **macOS**: Keychain Services (lưu trữ mã hóa)
- **Linux**: libsecret / phương án dự phòng trên hệ thống tệp
- **Truyền qua tiến trình con (Subprocess passing)**: Thông qua File Descriptor (`CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR`), tránh rò rỉ qua biến môi trường
- **Trình hỗ trợ khóa API**: Hỗ trợ các lệnh tùy chỉnh để lấy khóa, với thời gian sống (TTL) của cache mặc định là 5 phút

### G.3.3 Dọn dẹp khi đăng xuất

Hành động `performLogout()` (`restored-src/src/commands/logout/logout.tsx:16-48`) thực hiện một quá trình dọn dẹp toàn bộ:

1. Đẩy dữ liệu đo lường từ xa (đảm bảo không bị mất dữ liệu)
2. Xóa khóa API
3. Xóa toàn bộ thông tin xác thực khỏi Keychain
4. Xóa thông tin tài khoản OAuth khỏi tệp cấu hình
5. Tùy chọn: Xóa trạng thái chào đón (onboarding)
6. Vô hiệu hóa tất cả bộ nhớ đệm: token OAuth, dữ liệu người dùng, các tính năng beta, GrowthBook, các giới hạn chính sách

## G.4 Quyền hạn và Vai trò

Vai trò tổ chức được trả về bởi hồ sơ OAuth xác định ranh giới năng lực của người dùng:

```typescript
// restored-src/src/utils/billing.ts
// Quyền truy cập thanh toán Console
function hasConsoleBillingAccess(): boolean {
  // Yêu cầu: người dùng không đăng ký thuê bao + vai trò admin hoặc billing
}

// Quyền truy cập thanh toán Claude.ai
function hasClaudeAiBillingAccess(): boolean {
  // Các cấp Max/Pro tự động có quyền truy cập
  // Team/Enterprise yêu cầu admin, billing, owner, hoặc primary_owner
}
```

| Năng lực | Vai trò yêu cầu |
|-----------|---------------|
| Truy cập thanh toán Console | admin hoặc billing (người dùng không đăng ký thuê bao) |
| Truy cập thanh toán Claude.ai | Max/Pro tự động; Team/Enterprise yêu cầu admin/billing/owner |
| Bật/tắt tính năng Extra usage | Đăng ký thuê bao Claude.ai + billingType được hỗ trợ |
| Lệnh `/upgrade` | Người dùng không thuộc cấp Max 20x |

## G.5 Đo lường từ xa và Theo dõi tài khoản

Hệ thống xác thực được tích hợp sâu với hệ thống đo lường từ xa (`restored-src/src/services/analytics/metadata.ts`):

- `isClaudeAiAuth` — Xác định xem có sử dụng xác thực Claude.ai hay không
- `subscriptionType` — Được sử dụng để phân tích người dùng hoạt động hàng ngày (DAU) theo cấp thuê bao
- `accountUuid` / `emailAddress` — Được truyền trong tiêu đề đo lường từ xa

Các sự kiện phân tích chính:
```
tengu_oauth_flow_start          → Luồng OAuth được bắt đầu
tengu_oauth_success             → Xác thực OAuth thành công
tengu_oauth_token_refresh_success/failure → Kết quả làm mới token
tengu_oauth_profile_fetch_success → Lấy thông tin hồ sơ thành công
```

## G.6 Phân tích ranh giới tuân thủ

### G.6.1 Bối cảnh: Sự cố OpenClaw tháng 4 năm 2026

Vào tháng 4 năm 2026, Anthropic đã chính thức cấm các công cụ của bên thứ ba sử dụng hạn mức thuê bao qua OAuth. Các lý do cốt lõi:

1. **Chi phí không bền vững**: Các công cụ như OpenClaw đã chạy các Agent tự động 24/7, tiêu tốn 1.000 - 5.000 USD chi phí API mỗi ngày — vượt xa những gì mà một thuê bao Max giá 200 USD/tháng có thể chi trả
2. **Bỏ qua tối ưu hóa bộ nhớ đệm**: Bộ nhớ đệm prompt 4 lớp của Claude Code (xem Chương 13-14) có thể giảm tới 90% chi phí; các công cụ bên thứ ba gọi API trực tiếp sẽ dẫn đến 100% trượt cache (cache miss)
3. **Thay đổi điều khoản dịch vụ**: Phạm vi `user:inference` của OAuth đã bị giới hạn chỉ dành cho việc sử dụng sản phẩm chính thức

### G.6.2 Phân loại hành vi

| Hành vi | Hiện thực hóa kỹ thuật | Mức độ rủi ro |
|----------|------------------------|------------|
| Sử dụng thủ công CLI Claude Code | Lệnh tương tác `claude` | **An toàn** — Mục đích sử dụng dự kiến của sản phẩm chính thức |
| Gọi qua script `claude -p` | Tự động hóa bằng mã shell script | **An toàn** — Chế độ không tương tác được hỗ trợ chính thức |
| cc-sdk khởi chạy tiến trình con claude | `cc_sdk::query()` / `cc_sdk::llm::query()` | **Rủi ro thấp** — Đi qua toàn bộ đường ống dẫn của CLI (bao gồm cả cache) |
| MCP Server được gọi bởi Claude Code | rmcp / Giao thức MCP | **An toàn** — Cơ chế mở rộng chính thức |
| Agent SDK xây dựng các công cụ cá nhân | SDK `@anthropic-ai/claude-code` | **An toàn** — Mục đích sử dụng dự kiến của SDK chính thức |
| Trích xuất token OAuth để gọi trực tiếp API | Bỏ qua CLI Claude Code | **Rủi ro cao** — Đây là hành vi bị cấm |
| Tự động hóa trong CI/CD | Sử dụng `claude -p` trong CI | **Vùng xám** — Phụ thuộc vào tần suất và mục đích sử dụng |
| Phân phối các công cụ mã nguồn mở phụ thuộc vào claude | Người dùng tự xác thực | **Vùng xám** — Phụ thuộc vào mẫu hình sử dụng |
| Tiến trình Daemon tự động 24/7 | Tiêu thụ liên tục hạn mức của gói thuê bao | **Rủi ro cao** — Theo mẫu hình thiết kế của OpenClaw |

### G.6.3 Sự khác biệt cốt lõi: Bạn có đi qua hạ tầng của Claude Code hay không

Đây là tiêu chí quan trọng nhất:

```
Đường dẫn an toàn (Safe path):
  Mã nguồn của bạn → cc-sdk → tiến trình con CLI claude → Hạ tầng CC (kèm cache) → API
  ↑ Đi qua cache prompt, chi phí của Anthropic được kiểm soát

Đường dẫn nguy hiểm (Dangerous path):
  Mã nguồn của bạn → Trích xuất token OAuth → Gọi trực tiếp API Anthropic
  ↑ Bỏ qua bộ nhớ đệm prompt, mọi yêu cầu đều bị tính giá đầy đủ
```

Hàm `getCacheControl()` của Claude Code (`restored-src/src/services/api/claude.ts:358-374`) thiết kế tỉ mỉ các điểm ngắt bộ nhớ đệm ba cấp: toàn cục (global), tổ chức (organization) và phiên làm việc (session). Các yêu cầu gửi qua CLI tự động được hưởng lợi từ việc tối ưu hóa cache này. Các công cụ bên thứ ba gọi API trực tiếp không thể tái sử dụng các cache này — đây là nguyên nhân gốc rễ của vấn đề chi phí.

**Kiểm tra nhanh: Ứng dụng có khởi chạy một tiến trình con claude hay không?**

Đây là tiêu chí tuân thủ đơn giản nhất. Tất cả các phương pháp giao tiếp thông qua tiến trình con CLI `claude` đều đi qua toàn bộ hạ tầng của CC (prompt cache + đo lường từ xa + kiểm tra phân quyền), giữ cho chi phí của Anthropic ở mức kiểm soát được; gọi trực tiếp API sẽ bỏ qua tất cả những điều này.

| Phương pháp | Khởi chạy tiến trình? | Tuân thủ |
|----------|:---:|-----------|
| cc-sdk `query()` | Có — `Command::new("claude")` | Tuân thủ |
| cc-sdk `llm::query()` | Có — tương tự, cộng thêm `--tools ""` | Tuân thủ |
| Agent SDK (`@anthropic-ai/claude-code`) | Có — SDK chính thức khởi chạy claude | Tuân thủ |
| Shell script `claude -p "..."` | Có | Tuân thủ |
| MCP Server được gọi bởi CC | Có — CC khởi tạo nó | Tuân thủ |
| Trích xuất token OAuth -> `fetch("api.anthropic.com")` | **Không** — bỏ qua CLI | **Không tuân thủ** |
| OpenClaw và các Agent bên thứ ba khác | **Không** — gọi API trực tiếp | **Không tuân thủ** |

### G.6.4 Tính tuân thủ của mã ví dụ trong cuốn sách này

Code Review Agent trong Chương 30 của cuốn sách này sử dụng các phương pháp sau:

| Backend | Hiện thực hóa | Tính tuân thủ |
|---------|---------------|------------|
| `CcSdkBackend` | cc-sdk khởi chạy tiến trình con CLI claude | **Tuân thủ** — Chạy qua CLI chính thức |
| `CcSdkWsBackend` | Kết nối WebSocket đến thực thể CC | **Tuân thủ** — Chạy qua giao thức chính thức |
| `CodexBackend` | Thuê bao Codex (OpenAI, không phải Anthropic) | **Không áp dụng** — Không liên quan đến Anthropic |
| Chế độ MCP Server | Claude Code gọi thông qua MCP | **Tuân thủ** — Cơ chế mở rộng chính thức |

**Đề xuất**:
1. Không trích xuất token OAuth từ `~/.claude/` cho các mục đích khác
2. Không xây dựng các tiến trình Daemon tự động 24/7
3. Giữ lại `CodexBackend` như một phương án thay thế không phụ thuộc vào gói thuê bao Anthropic
4. Nếu cần tự động hóa tần suất cao, hãy sử dụng cơ chế thanh toán theo mức sử dụng của khóa API (pay-as-you-go) thay vì dùng gói đăng ký thuê bao

## G.7 Chỉ mục biến môi trường chính

| Biến | Mục đích | Nguồn |
|----------|---------|--------|
| `ANTHROPIC_API_KEY` | Khóa API trực tiếp | Người dùng cấu hình |
| `CLAUDE_CODE_OAUTH_REFRESH_TOKEN` | Refresh token được xác thực trước | Triển khai tự động |
| `CLAUDE_CODE_OAUTH_SCOPES` | Phạm vi (scopes) của refresh token | Sử dụng cùng biến phía trên |
| `CLAUDE_CODE_ACCOUNT_UUID` | UUID tài khoản (cho phía gọi SDK) | Tích hợp SDK |
| `CLAUDE_CODE_USER_EMAIL` | Email người dùng (cho phía gọi SDK) | Tích hợp SDK |
| `CLAUDE_CODE_ORGANIZATION_UUID` | UUID tổ chức | Tích hợp SDK |
| `CLAUDE_CODE_USE_BEDROCK` | Bật AWS Bedrock | Tích hợp bên thứ ba |
| `CLAUDE_CODE_USE_VERTEX` | Bật GCP Vertex AI | Tích hợp bên thứ ba |
| `CLAUDE_CODE_USE_FOUNDRY` | Bật Azure Foundry | Tích hợp bên thứ ba |
| `CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR` | Bộ mô tả tệp (File descriptor) cho khóa API | Truyền an toàn |
| `CLAUDE_CODE_CUSTOM_OAUTH_URL` | Điểm cuối OAuth tùy chỉnh | Triển khai FedStart |

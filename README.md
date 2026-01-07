# React Auth Testing System

完整的 React 認證測試系統，包含 JWT Token 管理、Protected Routes、Role-based Access Control (RBAC)、MSW Mock Server 和 Vitest 自動化測試。

## 快速開始

### 安裝

```bash
npm install
```

### 啟動開發伺服器（啟用 MSW）

```bash
npm run dev
```

### 執行測試

```bash
# 互動模式
npm test

# 單次執行
npm run test:run
```

### 建置生產版本（不啟用 MSW）

```bash
npm run build
```

---

## 專案結構

```
unit_test/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vitest.setup.ts          # Test setup with localStorage mock
├── index.html
├── public/
│   └── mockServiceWorker.js  # MSW service worker
└── src/
    ├── main.tsx              # Entry point (MSW initialization)
    ├── App.tsx               # Router configuration
    ├── index.css
    ├── context/
    │   └── AuthContext.tsx   # Auth state management
    ├── utils/
    │   └── auth.ts           # Token/localStorage utilities
    ├── services/
    │   ├── api.ts            # API calls (fetch)
    │   └── apiAxios.ts       # API calls (axios alternative)
    ├── components/
    │   ├── ProtectedRoute.tsx
    │   ├── RoleBasedRoute.tsx
    │   └── DevPanel.tsx      # MSW scenario switcher
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── DashboardPage.tsx
    │   ├── AdminPage.tsx
    │   └── ForbiddenPage.tsx
    ├── mocks/
    │   ├── handlers.ts       # MSW request handlers
    │   ├── browser.ts        # Browser worker setup
    │   └── server.ts         # Node server setup (testing)
    └── __tests__/
        └── auth.test.tsx     # 8 automated test cases
```

---

## 測試帳號

| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | admin |
| user     | user123   | user  |

---

## MSW 情境控制

開發模式下可透過畫面右下角的 **Dev Panel** 切換：

| 情境             | 說明                        |
|------------------|-----------------------------|
| success          | 正常流程                    |
| invalid_password | 登入回 401                  |
| token_expired    | /api/me 回 401 Token expired|
| forbidden        | /api/admin/secret 回 403    |
| server_error     | 所有 API 回 500             |

Delay 選項：0ms / 1500ms / 3000ms

---

## 手動測試流程

### 1. 登入成功流程
1. 設定情境為 `success`
2. 輸入 admin / admin123
3. 點擊 Login
4. ✓ 應導向 /dashboard，顯示 "Welcome, admin!"

### 2. 登入失敗 (401)
1. 設定情境為 `invalid_password`
2. 輸入任意帳密
3. 點擊 Login
4. ✓ 應留在 /login，顯示 "Invalid credentials"

### 3. Token 過期
1. 先用 `success` 情境登入
2. 切換情境為 `token_expired`
3. 重新整理頁面
4. ✓ 應被導回 /login，顯示 "Session expired"

### 4. 權限不足 (403)
1. 用 user / user123 登入
2. 嘗試前往 /admin
3. ✓ 應顯示 403 Forbidden 頁面

### 5. 延遲測試
1. 設定 Delay 為 3000ms
2. 登入後觀察
3. ✓ 應先顯示 Loading，3秒後才顯示內容

### 6. Server Error + Retry
1. 設定情境為 `server_error`
2. 登入後進入 Dashboard
3. ✓ 應顯示錯誤訊息和 Retry 按鈕
4. 切換情境為 `success`
5. 點擊 Retry
6. ✓ 應成功顯示 Dashboard 內容

---

## 自動化測試 (8 個案例)

| # | 測試案例                             |
|---|--------------------------------------|
| 1 | 登入成功 → 導到 /dashboard → 顯示 Welcome |
| 2 | 登入失敗 (401) → 留在 /login → 顯示錯誤 |
| 3 | 未登入進 /dashboard → 導回 /login       |
| 4 | Token expired → 清 token → 顯示 session expired |
| 5 | role=user 進 /admin → 顯示 403         |
| 6 | role=admin 進 /admin → 顯示管理員內容  |
| 7 | delay 時先顯示 loading，之後顯示資料   |
| 8 | 500 錯誤 + Retry → 第一次失敗，第二次成功 |

---

## 環境變數

| 變數         | 說明                          |
|--------------|-------------------------------|
| VITE_USE_MSW | 設為 "true" 啟用 MSW mock server |

> 生產環境建置時不要設定此變數，MSW 將不會啟用。

---

## API 規格

### POST /api/login
- **Request**: `{ username: string, password: string }`
- **Success (200)**: `{ accessToken: string, user: { username, role } }`
- **Error (401)**: `{ message: "Invalid credentials" }`
- **Error (500)**: `{ message: "Server error" }`

### GET /api/me
- **Headers**: `Authorization: Bearer <token>`
- **Success (200)**: `{ username: string, role: "admin" | "user" }`
- **Error (401)**: `{ message: "Token expired" }` or `{ message: "Unauthorized" }`

### GET /api/admin/secret
- **Headers**: `Authorization: Bearer <token>`
- **Success (200, admin only)**: `{ secret: string }`
- **Error (403)**: `{ message: "Forbidden" }`

---

## 技術棧

- **Framework**: Vite + React 18 + TypeScript
- **Routing**: react-router-dom v6
- **HTTP Client**: fetch (主流程) + axios (備選)
- **Mocking**: MSW v2
- **Testing**: Vitest + React Testing Library
- **State**: React Context (簡單狀態管理)

---

## CI/CD - GitHub Actions

專案包含自動化 CI/CD 流程，位於 `.github/workflows/deploy.yml`。

### 流程

```
PR / Push
    ↓
┌─────────┐     ┌─────────┐     ┌─────────┐
│  Test   │ ──► │  Build  │ ──► │ Deploy  │
└─────────┘     └─────────┘     └─────────┘
                                (僅 main/master)
```

### 觸發條件

| 事件 | 分支 | 執行內容 |
|-----|------|---------|
| Push | main, master | Test → Build → Deploy |
| Pull Request | 所有分支 | Test → Build |

### GitHub Pages 部署

1. 進入 repo **Settings** → **Pages**
2. **Source** 選擇 **GitHub Actions**
3. Push 到 main/master 後會自動部署

### 自訂 Base Path

如果 repo 名稱不是 `unit_test`，請修改 `vite.config.ts`：

```typescript
base: process.env.GITHUB_ACTIONS ? '/你的repo名稱/' : '/',
```

---

## Branch Protection（Rulesets）

設定測試失敗時禁止 Merge：

### 設定步驟

1. 進入 repo **Settings** → **Rules** → **Rulesets**
2. 點擊 **New ruleset** → **New branch ruleset**

### 設定內容

| 欄位 | 值 |
|-----|-----|
| Ruleset Name | `Protect main branch` |
| Enforcement status | `Active` |
| Target branches | 點 Add target → Include by pattern → `main` |

### 勾選規則

- ✅ **Require a pull request before merging**
- ✅ **Require status checks to pass**
  - 點 **Add checks** → 搜尋 `test` → 選擇 `Run Tests`
- ✅ **Require branches to be up to date before merging**（可選）

### 儲存

點 **Create** 建立規則

### 效果

| 測試結果 | Merge 按鈕 |
|---------|-----------|
| ❌ 失敗 | 🔒 鎖住 |
| ✅ 通過 | 🔓 可合併 |

> **注意**：第一次設定時可能搜不到 check，需要先開一個 PR 讓 workflow 跑過一次。

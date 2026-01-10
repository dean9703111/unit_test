# DashboardPage 測試案例

> 狀態：初始為 [ ]、完成為 [x] Done
> 注意：狀態只能在測試通過後由流程更新。

---

## [x] 1. 載入狀態顯示 Done
**範例輸入**：已登入使用者訪問 Dashboard，API 尚未回應  
**期待輸出**：顯示 `data-testid="loading"` 的 Loading 狀態

---

## [x] 2. 成功載入使用者資料 Done
**範例輸入**：`getMe()` 回傳 `{ username: 'admin', role: 'admin' }`  
**期待輸出**：
- 顯示 `Welcome, admin!` 歡迎訊息
- 顯示使用者名稱和角色

---

## [x] 3. Admin 使用者顯示 Admin Panel 連結 Done
**範例輸入**：使用者角色為 `admin`  
**期待輸出**：顯示 `🔐 Admin Panel` 連結到 `/admin`

---

## [x] 4. 一般使用者不顯示 Admin Panel 連結 Done
**範例輸入**：使用者角色為 `user`  
**期待輸出**：不顯示 `Admin Panel` 連結

---

## [x] 5. API 錯誤時顯示錯誤訊息 Done
**範例輸入**：`getMe()` 回傳 HTTP 500 錯誤，訊息為 `Server error`  
**期待輸出**：
- 顯示 `data-testid="error-message"` 錯誤訊息
- 顯示 Retry 按鈕

---

## [x] 6. 點擊 Retry 按鈕重新載入 Done
**範例輸入**：錯誤狀態 → 點擊 Retry 按鈕 → API 成功回應  
**期待輸出**：重新載入並顯示歡迎訊息

---

## [x] 7. Token 過期時清除登入並導向到 Login 頁面 Done
**範例輸入**：`getMe()` 回傳 `Token expired` 401 錯誤  
**期待輸出**：
- 清除 localStorage token
- 導向到 `/login` 並顯示 session expired 訊息

---

## [x] 8. Logout 按鈕功能 Done
**範例輸入**：點擊 Logout 按鈕  
**期待輸出**：
- 清除 localStorage token
- 導向到 `/login` 頁面

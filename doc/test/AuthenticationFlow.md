# Authentication Flow 測試案例

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。

---

## [x] 1. 登入成功後導向 Dashboard 並顯示歡迎訊息
**範例輸入**：在 `/login` 頁面輸入正確帳密 (admin/admin123) 並點擊 Login  
**期待輸出**：
- 導向到 `/dashboard`
- 顯示 `Welcome, admin!` 歡迎訊息

---

## [x] 2. 登入失敗時顯示錯誤訊息且不儲存 Token
**範例輸入**：輸入錯誤帳密，API 回傳 401  
**期待輸出**：
- 顯示 `Invalid credentials` 錯誤訊息
- localStorage 中無 auth_token

---

## [x] 3. 未認證訪問受保護頁面時導向登入頁
**範例輸入**：未登入狀態直接訪問 `/dashboard`  
**期待輸出**：導向到 `/login` 頁面

---

## [x] 4. Token 過期時清除 Token 並顯示 Session 過期提示
**範例輸入**：有 Token 但 `/api/me` 回傳 401 Token expired  
**期待輸出**：
- 清除 localStorage 中的 auth_token
- 顯示 session-expired 提示

---

## [x] 5. 一般使用者訪問 Admin 頁面時顯示 403 Forbidden
**範例輸入**：以 role=user 身份訪問 `/admin`  
**期待輸出**：顯示 `403 - Forbidden` 頁面

---

## [x] 6. Admin 使用者可正常訪問 Admin 頁面
**範例輸入**：以 role=admin 身份訪問 `/admin`  
**期待輸出**：
- 顯示 admin-content
- 顯示 secret-content 為 `This is the admin secret`

---

## [x] 7. API 延遲時先顯示 Loading 狀態再顯示資料
**範例輸入**：`/api/me` 延遲 1 秒回應  
**期待輸出**：
- 先顯示 loading 狀態
- 延遲後顯示 `Welcome, admin!`

---

## [x] 8. 伺服器錯誤時顯示錯誤訊息，Retry 後成功
**範例輸入**：`/api/me` 第一次回傳 500，第二次回傳成功  
**期待輸出**：
- 第一次顯示 `Server error` 錯誤訊息
- 點擊 Retry 後顯示 `Welcome, admin!`

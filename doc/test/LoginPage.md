# LoginPage 測試案例

> 狀態：初始為 [ ]、完成為 [x] Done
> 注意：狀態只能在測試通過後由流程更新。

---

## [x] 1. 正確渲染登入表單 Done
**範例輸入**：訪問 `/login` 頁面  
**期待輸出**：
- 顯示 Username 輸入框
- 顯示 Password 輸入框
- 顯示 Login 按鈕

---

## [x] 2. 輸入框可正確輸入值 Done
**範例輸入**：在 Username 輸入 `testuser`，在 Password 輸入 `testpass`  
**期待輸出**：輸入框的值分別為 `testuser` 和 `testpass`

---

## [x] 3. 登入成功後導向 Dashboard Done
**範例輸入**：輸入正確帳密並點擊 Login 按鈕，API 回傳成功  
**期待輸出**：
- 呼叫 `authLogin` 儲存 token 與 user
- 導向到 `/dashboard`

---

## [x] 4. 登入成功後導向原本要訪問的頁面 Done
**範例輸入**：從 `/admin` 被重導到 `/login`，登入成功後  
**期待輸出**：導向回 `/admin` 而非 `/dashboard`

---

## [x] 5. 登入失敗時顯示錯誤訊息 Done
**範例輸入**：API 回傳 `Invalid credentials` 錯誤  
**期待輸出**：顯示 `data-testid="error-message"` 錯誤訊息

---

## [x] 6. 載入中狀態顯示 Done
**範例輸入**：點擊 Login 按鈕後，API 尚未回應  
**期待輸出**：
- 按鈕文字變為 `⏳ Loading...`
- 輸入框和按鈕被 disabled

---

## [x] 7. Session 過期訊息顯示 Done
**範例輸入**：從其他頁面因 session 過期被導向 `/login?sessionExpired=true`  
**期待輸出**：顯示 `data-testid="session-expired"` 的 session 過期提示

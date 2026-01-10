---
description: 單元測試工作流
---

根據以下步驟進行協作：

STEP 1: 根據選擇範圍撰寫測試案例清單，撰寫格式請參考.agent/workflows/test/01_TEST_CASES.md，並將發想的結果用 Markdown 格式寫入 doc/test 底下，完成後進行 Reivew，確認符合預期後再下一步

STEP 2: 參考上一步完成的 doc/test 撰寫測試程式，不同頁面需建立獨立檔案

**重要規則：**
- 每一個 `it()` 描述必須為對應的測試案例的「測試說明」
- `it()` 內的文字描述請「直接使用 Markdown 測試說明原文，不需翻譯、不需重新命名」


STEP 3: 驗證測試程式，若結果符合預期，請去 doc/test 底下，將 Markdown 打勾

STEP 4: 重複 Step 2–3，最多 5 次，仍失敗就討論原因
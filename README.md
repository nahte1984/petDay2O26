# 奧美寵物日投票系統

同事互相提名「誰長得像哪隻動物」並投票。純前端 + Firebase，**完全在免費額度內**，不需要伺服器。

---

## 檔案說明

| 檔案 | 用途 | 可以上 GitHub？ |
|---|---|---|
| `index.html` | 整個網站（登入、提名、投票） | ✅ |
| `config.js` | Firebase 與 Pexels 設定 **← 要先填** | ✅ |
| `animals.js` | 289 個中文動物名 → 英文搜尋詞對照表 | ✅ |
| `roster.json` | 226 位同事的姓名/部門/分機（**不含**身分證資料） | ✅ |
| `firestore.rules` | 資料庫安全規則，防作弊全靠它 | ✅ |
| `seed-users.mjs` | 一次性腳本，把員工建成 Firebase 帳號 | ✅ |
| `test.mjs` | 離線驗證：名單、登入邏輯、翻譯表、前後端約定一致性 | ✅ |
| `test-rules.mjs` | 離線驗證：投票額度規則與 10 種作弊手法 | ✅ |
| `people.xlsx` | 原始名單（含身分證後 4 碼） | ❌ 已列入 .gitignore |
| `users-private.json` | 同上，腳本產出的中間檔 | ❌ 已列入 .gitignore |
| `service-account.json` | Firebase 私密金鑰（你自己下載） | ❌ 已列入 .gitignore |

> `.gitignore` 已經幫你設好了。**推上 GitHub 前請跑一次 `git status`，確認上面 3 個 ❌ 檔案沒有出現在待提交清單裡。**

---

## 架構怎麼運作

```
使用者瀏覽器 (GitHub Pages 上的 index.html)
   │
   ├─ 登入 ─────────→ Firebase Auth        帳密由 Google 保管，前端不持有
   ├─ 提名／投票 ────→ Firestore           防作弊由 firestore.rules 把關
   └─ 找動物圖 ──────→ Pexels API          中翻英先查內建表，沒中才用 MyMemory
```

三個關鍵設計決定，以及原因：

**1. 密碼不放在前端。** GitHub Pages 是公開的，如果把身分證後 4 碼寫進 JS 或存進 Firestore 讓前端比對，任何人開 DevTools 就能拉走全公司的個資（4 位數就算做雜湊也是 1 萬組、秒破）。所以改用 Firebase Auth：帳號是 `u{員工編號}@petday.local`，密碼是 `{員工編號}-{身分證後4碼}`，驗證在 Google 那邊做，前端只負責把使用者打的 4 碼組成密碼送出去。

**2. 不用 Cloud Functions。** Cloud Functions 需要升級 Blaze 付費方案。所有防作弊改用 Firestore 規則完成——投票紀錄的 doc id 固定是 `{候選id}_{使用者id}`，天生一人一票；票數只能 ±1，而且規則用 `getAfter()` 確認「改票數」與「寫投票紀錄」是同一批寫入，光改 counter 不寫紀錄會被擋掉。

**3. 不用 Firebase Storage。** 新建的 Firebase 專案要用 Storage 也得升 Blaze。使用者自行上傳的圖片改成前端壓到 800px JPEG（約 60–120KB）直接存進 Firestore 文件（上限 1MB），零額外服務。

---

## 部署步驟

### 1. 建立 Firebase 專案（免費 Spark 方案就夠）

1. 到 [console.firebase.google.com](https://console.firebase.google.com) → 新增專案（不用開 Google Analytics）
2. **Authentication** → 開始使用 → 選「電子郵件/密碼」→ 啟用
3. **Firestore Database** → 建立資料庫 → 選「以正式版模式啟動」→ 位置選 `asia-east1`（台灣）
4. **Firestore → 規則** → 把 `firestore.rules` 的內容整份貼上 → 發布
5. **專案設定 → 一般 → 你的應用程式** → 點 `</>` 新增網頁應用程式 → 複製 `firebaseConfig` 內容 → 貼進 `config.js`

> 順帶檢查一下 **Authentication → 設定 → 已授權網域**，把你的 `你的帳號.github.io` 加進去，不然登入會被拒絕。

### 2. 建立 226 個員工帳號

```bash
cd 這個資料夾
npm install firebase-admin xlsx
# Firebase Console → 專案設定 → 服務帳戶 → 產生新的私密金鑰
# 存成 service-account.json 放在這個資料夾
node seed-users.mjs            # 先試跑，只印出來看
node seed-users.mjs --commit   # 確認沒問題再真的寫入
```

跑完 Authentication 頁面應該會看到 226 個使用者。這個腳本可以重複執行（既有帳號會被更新而非報錯），所以之後有人事異動改完 xlsx 再跑一次就好。

> 員工異動後記得也重新產生 `roster.json`（見下方「維護」）。

### 3. 申請 Pexels API key

到 [pexels.com/api](https://www.pexels.com/api/) 註冊 → 拿 API key → 貼進 `config.js` 的 `PEXELS_API_KEY`。

免費額度每月 2 萬次查詢。實際上圖片網址在「提名時」就存進資料庫了，之後所有人看到的是同一張圖，**不會隨瀏覽次數消耗額度**，所以 226 人的活動連 1% 都用不到。

### 4. 推上 GitHub Pages

```bash
git init
git add .
git status                     # ⚠️ 確認 people.xlsx / users-private.json / service-account.json 不在清單裡
git commit -m "奧美寵物日投票系統"
git branch -M main
git remote add origin https://github.com/你的帳號/petday.git
git push -u origin main
```

然後 GitHub repo → Settings → Pages → Source 選 `main` / `(root)` → Save。等一兩分鐘，網址是 `https://你的帳號.github.io/petday/`。

**建議把 repo 設成 Private**，Pages 在 Private repo 也能用（需要 GitHub Team 或以上方案；免費帳號則需 Public repo——這種情況下更要確認 `.gitignore` 有生效）。

### 5. 本機測試

```bash
node test.mjs                  # 名單、登入邏輯、翻譯表、前後端約定一致性
node test-rules.mjs            # 投票額度規則與作弊手法
python3 -m http.server 8000    # 然後開 http://localhost:8000
```

不能直接用 `file://` 開 `index.html`，ES module 需要 http 協定。

---

## 給同事的使用說明

> 打開 https://nahte1984.github.io/petDay2O26/
> 1. **帳號**：輸入你的分機三碼，或直接打你的英文名字（打一部分就會跳出選單）
> 2. **密碼**：身分證後 4 碼
> 3. 登入後可以「提名」某位同事像某隻動物，或到排行榜投票
> 4. **每天**可以投 10 票、提名 3 位，每天午夜 0:00 重置
> 5. 10 票可以全部投給同一個人，也可以分散投
> 6. ⚠️ **票投出去就不能取消**，所以按鈕要按兩次才算數
> 7. 撤回提名會還回當天的提名額度，但已經有人投票的提名就不能撤回了

分機 `000` 或重複分機的同事，系統會多跳一個下拉選單請他選出自己——或者直接打英文名字最快。

---

## 活動設定

改 `config.js` 的 `EVENT` 就好，改完 push 上去即生效：

```js
maxVotesPerDay: 10,        // 每人每天幾票（可重複投同一人）
maxNominationsPerDay: 3,   // 每人每天最多提名幾筆，0 = 無上限
votingOpen: true,          // 活動結束後改成 false，就變成唯讀的結果頁
```

> ⚠️ 改 `maxVotesPerDay` 時，`firestore.rules` 裡的 `MAX_VOTES_PER_DAY()` 必須同步改成一樣的數字，否則使用者投超過規則上限時會看到權限錯誤。`test-rules.mjs` 會檢查這兩個值一致。

### 每日票數額度怎麼運作（規則層強制執行）

因為「票不能取消」，額度可以用一個**只增不減的計數器**完成，這讓它成為真正無法繞過的機制：

```
quotas/{uid}_{今天}      欄位 used，規則只允許 +1，上限 10，不能歸零也不能刪除
votes/{uid}_{今天}_{n}   n 必須等於上面加完之後的 used
candidates/{候選}        voteCount +1，規則會回查上面那張票確實指向這位候選人
```

投一票 = 一個 transaction 同時寫這三份文件，三者互相驗證，缺一不可。票的 doc id 內含流水號 `n`，而 `n` 被綁死在計數器上，所以一天最多只能產生 10 筆票；想重複使用同一個 `n` 會撞到已存在的文件（規則只允許 create，不允許覆寫）。

`day` 由伺服器時間決定（`request.time + 8 小時`），把電腦時鐘調掉沒有用。**每天 0:00 自動換一份新的 quota 文件，不需要任何排程或後端。**

`test-rules.mjs` 模擬了規則邏輯，驗證正常流程外還逐一測試了 10 種作弊手法（直接改票數、只寫票不加計數、一次加 5、把計數歸零、刪掉計數、把票記到明天、冒用他人 uid、重複用流水號、刪除已投的票、票投 A 卻幫 B 加分）——全部被擋下。

改額度數字不影響已存在的紀錄，隨時可以調。

---

## 維護

**員工名單有異動**：更新 `people.xlsx` 後重新產生 `roster.json`：

```bash
python3 - <<'EOF'
import openpyxl, json, collections, re
ws = openpyxl.load_workbook('people.xlsx').active
people = []
for i, (dept, name, ext, id4) in enumerate(ws.iter_rows(min_row=2, values_only=True), 1):
    if not name: continue
    people.append({'id': i, 'name': re.sub(r'\s+', ' ', str(name)).strip(),
                   'dept': str(dept).strip(), 'ext': re.sub(r'\D', '', str(ext))})
c = collections.Counter(p['ext'] for p in people)
for p in people: p['extUnique'] = c[p['ext']] == 1 and p['ext'] != '000'
people.sort(key=lambda x: x['name'].lower())
json.dump({'count': len(people), 'people': people},
          open('roster.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('OK', len(people))
EOF
node seed-users.mjs --commit
```

⚠️ 員工的 `id` 就是 xlsx 的列號，也是他的帳號與密碼的一部分。**不要在中間插入或刪除列**，只在最後面新增，否則既有同事的帳號會全部錯位。

**活動結束後清理**：Firestore 的 `candidates` 與 `votes` 兩個 collection 直接在 Console 刪除。Authentication 的帳號建議也一併刪掉，不要讓身分證衍生的密碼一直留著。

---

## 已知限制

- 密碼只有 4 位數字的變化量，理論上可暴力破解。Firebase Auth 有 IP 層級的頻率限制會擋住大量嘗試，對內部活動夠用；但這也是活動結束後應該刪帳號的原因。
- MyMemory 免費翻譯匿名使用約每天 5,000 字元。冷門動物才會用到它，正常活動規模不會碰到上限；真的碰到就把該動物加進 `animals.js` 的對照表。
- 剛好在 0:00 前後一兩秒送出的投票，前端算的日期可能跟伺服器差一天而被規則拒絕。畫面會提示重新整理，重試即可。
- 同一個人開兩個分頁同時投票，第二個分頁可能拿到過期的計數而失敗（transaction 會重試，通常自動解決）。
- `activity` 類的資料清理：`quotas` collection 每人每天一份文件，226 人 × 活動天數，量很小，活動結束後和 `candidates`、`votes` 一起刪即可。
- `firestore.rules` 的 `getAfter()` 邏輯無法離線測試，建議部署後到 Firebase Console 的「規則 Playground」手動試一次「只改 voteCount 不寫投票紀錄」，確認會被拒絕。

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
| `test.mjs` | 離線驗證腳本 | ✅ |
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
node test.mjs                  # 離線驗證：名單、登入邏輯、翻譯表、前後端約定一致性
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
> 5. 取消投票或撤回提名，當天的額度會還給你
>
> 同一位候選人一輩子只能投一次，所以每天的 10 票是投給**不同**候選人的。

分機 `000` 或重複分機的同事，系統會多跳一個下拉選單請他選出自己——或者直接打英文名字最快。

---

## 活動設定

改 `config.js` 的 `EVENT` 就好，改完 push 上去即生效：

```js
maxVotesPerDay: 10,        // 每人每天幾票，0 = 無上限
maxNominationsPerDay: 3,   // 每人每天最多提名幾筆，0 = 無上限
votingOpen: true,          // 活動結束後改成 false，就變成唯讀的結果頁
```

### 每日額度怎麼運作

每筆投票與提名都會存一個 `day` 欄位（台北時間的 `YYYYMMDD` 整數），額度只計算 `day` 等於今天的紀錄，所以**每天 0:00 自動歸零，不需要任何排程或後端**。

`day` 的值由 `firestore.rules` 用伺服器時間驗證（`request.time + 8 小時`），使用者把電腦時鐘調掉沒有用。前端 `taipeiDayInt()` 與規則的 `todayInt()` 演算法必須一致——`test.mjs` 有跨兩年隨機取樣 5000 次的比對測試。

改額度數字不影響已存在的紀錄，隨時可以調。

> **一個誠實的限制**：「一天最多 10 票」這個**計數**是前端擋的。Firestore 規則無法對文件數量做聚合，要在規則層強制執行就得改成「取消投票不退額度」（會犧牲使用者體驗）。
>
> 這個取捨是刻意的：daily cap 的作用是控制節奏，不是防弊。真正的防弊——**同一人不能重複投同一位候選、不能竄改票數、不能冒用他人身分、不能把提名記到別天**——全部都在規則層強制執行，開 DevTools 也繞不過。有人硬要繞過 daily cap，他也只是提早投完本來就投得到的候選人，不會多出任何一票。

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
- 投票紀錄不會因為提名被撤回而自動清除，前端已處理成不佔用票數額度，但資料庫裡會留下孤兒紀錄。不影響使用。
- 「每日 10 票」的計數在前端把關，見上方「每日額度怎麼運作」的說明。
- 剛好在 0:00 前後一兩秒送出的投票，前端算的日期可能跟伺服器差一天而被規則拒絕。畫面會提示「剛好跨過午夜了，請重新整理」，重試即可。
- `firestore.rules` 的 `getAfter()` 邏輯無法離線測試，建議部署後到 Firebase Console 的「規則 Playground」手動試一次「只改 voteCount 不寫投票紀錄」，確認會被拒絕。

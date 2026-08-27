// ⚠️ 部署前必須填寫這個檔案。詳細步驟看 README.md。

// Firebase Console → 專案設定 → 一般 → 你的應用程式 → SDK 設定與配置 → 組態
// 這裡的 apiKey 可以公開，它不是密碼，真正的門鎖是 firestore.rules。
export const firebaseConfig = {
  apiKey: "AIzaSyAKHC_y-LnMB7VjJxl7Du4XxWgxO8YWbhg",
  authDomain: "petday-3b116.firebaseapp.com",
  projectId: "petday-3b116",
  storageBucket: "petday-3b116.firebasestorage.app",
  messagingSenderId: "752784749713",
  appId: "1:752784749713:web:4cfb7c03b57064a529fb30",
  measurementId: "G-C2FPXNW34E"
};

// index.html 兩種名稱都吃得下，這行只是保險，不要刪。
export const FIREBASE_CONFIG = firebaseConfig;

// https://www.pexels.com/api/ 免費申請，每月 2 萬次查詢。
// 這把 key 會出現在前端原始碼裡。Pexels 不介意（它只能搜圖，不能改任何東西），
// 但如果被濫用可以隨時到後台重新產生。
export const PEXELS_API_KEY = '4HEtQmvVIU15ese2gPl7937eFLAYBlDfoIGplXF3Co1NeJdxJC7W1MMh';

// 活動設定
export const EVENT = {
  title: '奧美非人類日大投票',
  subtitle: '人類們請先登入',

  // ── 每日額度，台北時間每天 0:00 自動重置 ──

  // 每人每天可以投幾票。可以把多票投給同一個人。
  // ⚠️ 改這個數字時，firestore.rules 裡的 MAX_VOTES_PER_DAY() 必須同步改，
  //    否則使用者會在超過規則上限時看到權限錯誤。
  maxVotesPerDay: 10,

  // 每人每天最多提名幾筆。設 0 = 無上限。
  maxNominationsPerDay: 3,

  // 票投出去不能取消。撤回提名（僅限還沒有人投票的）會還回當天的提名額度。

  // 設成 false 就會鎖住提名與投票，只能看結果（活動結束後用）
  votingOpen: true,
};
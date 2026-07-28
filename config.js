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

// https://www.pexels.com/api/ 免費申請，每月 2 萬次查詢。
// 這把 key 會出現在前端原始碼裡。Pexels 不介意（它只能搜圖，不能改任何東西），
// 但如果被濫用可以隨時到後台重新產生。
export const PEXELS_API_KEY = '4HEtQmvVIU15ese2gPl7937eFLAYBlDfoIGplXF3Co1NeJdxJC7W1MMh';

// 活動設定
export const EVENT = {
  title: '奧美寵物日',
  subtitle: '你的同事長得像哪隻動物？',
  // 每人最多可以投幾票（投給不同候選）。設 0 = 無上限。
  maxVotesPerUser: 5,
  // 每人最多可以提名幾筆。設 0 = 無上限。
  maxNominationsPerUser: 3,
  // 設成 false 就會鎖住提名與投票，只能看結果（活動結束後用）
  votingOpen: true,
};
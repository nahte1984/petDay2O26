/**
 * 一次性腳本：把 people.xlsx 的員工建成 Firebase Auth 帳號。
 *
 * 為什麼要這樣做：GitHub Pages 是公開的，身分證後 4 碼絕對不能放進前端。
 * 所以帳號密碼交給 Firebase Auth 保管，前端只負責把使用者輸入組成密碼送去驗證。
 *
 * 帳號規則（前端 login.js 必須用一樣的規則）：
 *   email    = u{員工id}@petday.local          ← 假網域，不會真的寄信
 *   password = {員工id}-{身分證後4碼}           ← 例：200-2735（湊足 Firebase 6 字元下限）
 *
 * 用法：
 *   1. npm install firebase-admin xlsx
 *   2. Firebase Console → 專案設定 → 服務帳戶 → 產生新的私密金鑰
 *      存成 service-account.json 放在同一層（已列入 .gitignore，絕對不要上傳）
 *   3. node seed-users.mjs            ← 試跑，只印出要建立的帳號
 *      node seed-users.mjs --commit   ← 真的寫進 Firebase
 */

import { readFileSync, existsSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import xlsx from 'xlsx';

const COMMIT = process.argv.includes('--commit');
const SA_PATH = './service-account.json';
const XLSX_PATH = './people.xlsx';

if (!existsSync(SA_PATH)) {
  console.error(`找不到 ${SA_PATH}。請先從 Firebase Console 下載服務帳戶金鑰。`);
  process.exit(1);
}

// ---------- 讀取並清理員工資料 ----------
function loadPeople() {
  const wb = xlsx.readFile(XLSX_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false }).slice(1);

  const people = [];
  rows.forEach((r, idx) => {
    const [dept, name, ext, id4] = r;
    if (!name) return;
    people.push({
      id: idx + 1,                                        // 列號即 uid，永遠不變
      name: String(name).replace(/\s+/g, ' ').trim(),
      dept: String(dept ?? '').trim(),
      ext: String(ext ?? '').replace(/\D/g, ''),          // 清掉 tab 之類的雜字元
      id4: String(id4 ?? '').replace(/\D/g, '').padStart(4, '0'),
    });
  });
  return people;
}

export const emailFor = (id) => `u${id}@petday.local`;
export const passwordFor = (id, id4) => `${id}-${id4}`;

// ---------- 主流程 ----------
const people = loadPeople();
console.log(`讀到 ${people.length} 位員工。`);

const bad = people.filter((p) => p.id4.length !== 4);
if (bad.length) {
  console.error('以下員工的身分證後 4 碼有問題，請先修正 xlsx：');
  bad.forEach((p) => console.error(`  #${p.id} ${p.name} → "${p.id4}"`));
  process.exit(1);
}

if (!COMMIT) {
  console.log('\n[試跑模式] 以下帳號「不會」被建立。加上 --commit 才會真的寫入。\n');
  people.slice(0, 5).forEach((p) =>
    console.log(`  ${emailFor(p.id).padEnd(24)} pw=${passwordFor(p.id, p.id4)}  (${p.name})`)
  );
  console.log(`  ... 共 ${people.length} 筆`);
  process.exit(0);
}

initializeApp({ credential: cert(JSON.parse(readFileSync(SA_PATH, 'utf8'))) });
const auth = getAuth();

let created = 0;
let updated = 0;
let failed = 0;

// Firebase Admin 的 importUsers 不能帶明文密碼，所以逐筆處理。
// 226 筆大約 30 秒，跑一次就好。
for (const p of people) {
  const email = emailFor(p.id);
  const password = passwordFor(p.id, p.id4);
  try {
    await auth.createUser({
      uid: String(p.id),
      email,
      password,
      displayName: p.name,
      emailVerified: true,
    });
    created++;
  } catch (err) {
    if (err.code === 'auth/uid-already-exists' || err.code === 'auth/email-already-exists') {
      // 重跑腳本時把密碼與姓名同步成最新的
      await auth.updateUser(String(p.id), { email, password, displayName: p.name });
      updated++;
    } else {
      console.error(`  失敗 #${p.id} ${p.name}: ${err.code ?? err.message}`);
      failed++;
    }
  }
  if ((created + updated + failed) % 25 === 0) {
    process.stdout.write(`  進度 ${created + updated + failed}/${people.length}\r`);
  }
}

console.log(`\n完成：新建 ${created}、更新 ${updated}、失敗 ${failed}`);

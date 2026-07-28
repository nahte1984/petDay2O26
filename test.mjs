/**
 * 離線驗證腳本：不需要 Firebase 帳號就能跑。
 * 檢查名單資料、登入解析邏輯、翻譯對照表，以及前端與規則／建帳號腳本的約定是否一致。
 *
 * 用法：node test.mjs
 */
import { readFileSync } from 'node:fs';
import { localTranslate, ANIMAL_DICT, normalizeAnimal } from './animals.js';

let fail = 0;
const ok = (cond, label) => {
  if (!cond) { console.log('  ✗', label); fail++; } else console.log('  ✓', label);
};

console.log('動物對照表:');
ok(Object.keys(ANIMAL_DICT).length > 250, `收錄 ${Object.keys(ANIMAL_DICT).length} 個詞`);
ok(localTranslate('柴犬') === 'shiba inu', '柴犬 → shiba inu');
ok(localTranslate('水豚') === 'capybara', '水豚 → capybara');
ok(localTranslate('golden retriever') === 'golden retriever', '英文原樣通過');
ok(localTranslate('像一隻胖胖的貓咪') === 'cat', '從句子中撈出「貓咪」');
ok(localTranslate('小熊貓') === 'red panda', '長詞優先（小熊貓 ≠ 熊貓）');
ok(localTranslate('外星人') === null, '查不到 → null，交給翻譯 API');
ok(normalizeAnimal('  柴  犬 ') === '柴 犬', '正規化空白');

console.log('\nroster.json:');
const roster = JSON.parse(readFileSync('./roster.json', 'utf8'));
ok(roster.count === 226, '226 人');
ok(roster.people.every((p) => p.id && p.name && p.ext !== undefined), '欄位完整');
ok(!JSON.stringify(roster).match(/id4|身份證|身分證/), '不含任何身分證資料 ← 關鍵');
ok(roster.people.filter((p) => !p.extUnique).length === 11, '11 人分機非唯一，已標記');

console.log('\n登入解析:');
const ROSTER = roster.people;
function resolveWho(input) {              // 與 index.html 內的同名函式一致
  const q = String(input || '').trim();
  if (!q) return [];
  if (/^\d{1,4}$/.test(q)) {
    const ext = q.padStart(3, '0');
    return ROSTER.filter((p) => p.ext === ext);
  }
  const lower = q.toLowerCase();
  const exact = ROSTER.filter((p) => p.name.toLowerCase() === lower);
  if (exact.length) return exact;
  return ROSTER.filter((p) => {
    const n = p.name.toLowerCase();
    return n.includes(lower) ||
           n.replace(/[^a-z]/g, '').includes(lower.replace(/[^a-z]/g, ''));
  });
}
ok(resolveWho('329').length === 1, '唯一分機 → 1 人');
ok(resolveWho('000').length === 7, '分機 000 → 7 人（會跳選單）');
ok(resolveWho('219').length === 2, '重複分機 219 → 2 人（會跳選單）');
ok(resolveWho('384').length === 1, '原本夾帶 tab 的 384 → 找得到');
ok(resolveWho('abbykm ku').length === 1, '姓名不分大小寫');
ok(resolveWho('Zzzz').length === 0, '不存在 → 0');
ok(ROSTER.every((p) => resolveWho(p.name).some((x) => x.id === p.id)),
   '226 人全都能用姓名登入 ← 關鍵');
ok(ROSTER.every((p) => resolveWho(p.ext).some((x) => x.id === p.id)),
   '226 人全都能用分機找到');

console.log('\n帳密規則一致性:');
const html = readFileSync('./index.html', 'utf8');
const seed = readFileSync('./seed-users.mjs', 'utf8');
ok(html.includes('`u${id}@petday.local`') && seed.includes('`u${id}@petday.local`'),
   'email 規則前後端一致');
ok(html.includes('`${id}-${pin}`') && seed.includes('`${id}-${id4}`'),
   'password 規則一致（員工id-後4碼）');
ok(!html.match(/\b\d{3}-\d{4}\b/), 'index.html 沒有硬寫任何密碼');

console.log('\nFirestore 規則對應:');
const rules = readFileSync('./firestore.rules', 'utf8');
ok(rules.includes('getAfter') && rules.includes('existsAfter'),
   '用 getAfter/existsAfter 綁定票數與投票紀錄');
ok(rules.includes("hasOnly(['voteCount'])"), '只允許改 voteCount');
ok(rules.includes('targetId != request.auth.uid'), '規則層也擋提名自己');
ok(rules.includes('voteCount == 0'), '新提名票數必須從 0 開始');
ok(html.includes('`${c.id}_${ME.id}`'), '投票 doc id 格式與規則一致');

console.log(fail === 0 ? '\n全部通過 ✅' : `\n${fail} 項失敗 ❌`);
process.exit(fail ? 1 : 0);

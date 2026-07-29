/**
 * 離線驗證：模擬 firestore.rules 的判斷邏輯，驗證投票額度機制。
 *
 * 涵蓋「每天 10 票、可重複投給同一人、投出去不能取消」的正常流程，
 * 以及 10 種作弊手法是否都會被規則擋下。
 *
 * ⚠️ 這是規則的「模型」不是規則本身。改 firestore.rules 時要記得同步改這裡，
 *    並且部署後到 Firebase Console 的規則 Playground 實際驗一次。
 *
 * 用法：node test-rules.mjs
 */
let fail = 0;
const ok = (c, l) => { if (!c) { console.log('  ✗', l); fail++; } else console.log('  ✓', l); };

const MAX = 10;
const todayInt = () => 20260729;          // 伺服器時間，攻擊者無法影響

// ---- 極簡的 Firestore + 規則模擬器 ----
function makeDb() {
  return { quotas: {}, votes: {}, candidates: {} };
}
class Denied extends Error { constructor(w) { super('permission-denied: ' + w); } }

// writes = [{col, id, op:'set'|'update', data}]，全部一起評估（等同 transaction）
function commit(db, uid, writes) {
  const after = JSON.parse(JSON.stringify(db));
  for (const w of writes) {
    if (w.op === 'set') after[w.col][w.id] = { ...w.data };
    else after[w.col][w.id] = { ...after[w.col][w.id], ...w.data };
    if (w.op === 'delete') delete after[w.col][w.id];
  }
  const usedAfter = () => (after.quotas[`${uid}_${todayInt()}`] || {}).used;

  for (const w of writes) {
    const before = db[w.col][w.id];
    const now = after[w.col][w.id];

    if (w.col === 'quotas') {
      if (w.op === 'delete') throw new Denied('quota 不能刪');
      if (w.id !== `${uid}_${todayInt()}`) throw new Denied('quota id 不是自己今天的');
      if (!before) {
        if (!(now.uid === uid && now.day === todayInt() && now.used === 1))
          throw new Denied('quota create 必須 used=1');
      } else {
        if (Object.keys(now).some((k) => k !== 'used' && now[k] !== before[k]))
          throw new Denied('quota 只能改 used');
        if (now.used !== before.used + 1) throw new Denied('quota 只能 +1');
        if (now.used > MAX) throw new Denied('超過每日上限');
      }
    }

    if (w.col === 'votes') {
      if (w.op === 'delete') throw new Denied('票不能刪除');
      if (before) throw new Denied('票不能覆寫／修改／刪除');
      if (w.id !== `${uid}_${todayInt()}_${usedAfter()}`) throw new Denied('票的流水號沒綁到 quota');
      if (now.uid !== uid) throw new Denied('不能冒用他人身分投票');
      if (now.day !== todayInt()) throw new Denied('不能把票記到別天');
      if (now.seq !== usedAfter()) throw new Denied('seq 對不上 quota');
    }

    if (w.col === 'candidates' && before) {
      const changed = Object.keys(now).filter((k) => now[k] !== before[k]);
      if (!(changed.length === 1 && changed[0] === 'voteCount')) throw new Denied('只能改 voteCount');
      if (now.voteCount !== before.voteCount + 1) throw new Denied('voteCount 只能 +1');
      const vp = after.votes[`${uid}_${todayInt()}_${usedAfter()}`];
      if (!vp || vp.candidateId !== w.id) throw new Denied('沒有對應的票，不能加票數');
    }
  }
  Object.assign(db, after);
}

// 前端 castVote 的完整寫入組合
function castVote(db, uid, cid) {
  const day = todayInt();
  const q = db.quotas[`${uid}_${day}`];
  const used = q ? q.used : 0;
  const seq = used + 1;
  commit(db, uid, [
    q ? { col: 'quotas', id: `${uid}_${day}`, op: 'update', data: { used: seq } }
      : { col: 'quotas', id: `${uid}_${day}`, op: 'set', data: { uid, day, used: seq } },
    { col: 'votes', id: `${uid}_${day}_${seq}`, op: 'set', data: { uid, day, seq, candidateId: cid } },
    { col: 'candidates', id: cid, op: 'update',
      data: { voteCount: db.candidates[cid].voteCount + 1 } },
  ]);
}

const fresh = () => {
  const db = makeDb();
  db.candidates.A = { voteCount: 0, nominatorId: '99', day: todayInt() };
  db.candidates.B = { voteCount: 0, nominatorId: '99', day: todayInt() };
  return db;
};

console.log('正常流程:');
let db = fresh();
for (let i = 0; i < 10; i++) castVote(db, '157', 'A');
ok(db.candidates.A.voteCount === 10, '10 票可以全部投給同一個人');
ok(db.quotas['157_20260729'].used === 10, 'quota 計數 = 10');
ok(Object.keys(db.votes).length === 10, '產生 10 筆投票紀錄');

db = fresh();
castVote(db, '157', 'A'); castVote(db, '157', 'B'); castVote(db, '157', 'A');
ok(db.candidates.A.voteCount === 2 && db.candidates.B.voteCount === 1, '可以分散投給不同人');

console.log('\n額度上限:');
db = fresh();
for (let i = 0; i < 10; i++) castVote(db, '157', 'A');
let blocked = false;
try { castVote(db, '157', 'A'); } catch (e) { blocked = true; }
ok(blocked, '第 11 票被規則擋下 ← 關鍵');

console.log('\n各種作弊手法:');
const t = (label, fn) => {
  db = fresh();
  let denied = false;
  try { fn(db); } catch (e) { denied = e instanceof Denied; }
  ok(denied, label);
};
t('直接改候選人的票數（不投票）', (d) =>
  commit(d, '157', [{ col: 'candidates', id: 'A', op: 'update', data: { voteCount: 999 } }]));
t('只寫票、不加 quota 計數', (d) =>
  commit(d, '157', [{ col: 'votes', id: '157_20260729_1', op: 'set',
    data: { uid: '157', day: todayInt(), seq: 1, candidateId: 'A' } }]));
t('quota 一次加 5 想換 5 票', (d) => {
  castVote(d, '157', 'A');
  commit(d, '157', [{ col: 'quotas', id: '157_20260729', op: 'update', data: { used: 6 } }]);
});
t('把 quota 歸零重來', (d) => {
  for (let i = 0; i < 10; i++) castVote(d, '157', 'A');
  commit(d, '157', [{ col: 'quotas', id: '157_20260729', op: 'update', data: { used: 0 } }]);
});
t('刪掉 quota 重來', (d) => {
  castVote(d, '157', 'A');
  commit(d, '157', [{ col: 'quotas', id: '157_20260729', op: 'delete', data: {} }]);
});
t('把票記到明天以偷額度', (d) =>
  commit(d, '157', [
    { col: 'quotas', id: '157_20260729', op: 'set', data: { uid: '157', day: 20260730, used: 1 } },
    { col: 'votes', id: '157_20260729_1', op: 'set',
      data: { uid: '157', day: 20260730, seq: 1, candidateId: 'A' } }]));
t('冒用別人的 uid 投票', (d) =>
  commit(d, '157', [
    { col: 'quotas', id: '157_20260729', op: 'set', data: { uid: '157', day: todayInt(), used: 1 } },
    { col: 'votes', id: '157_20260729_1', op: 'set',
      data: { uid: '200', day: todayInt(), seq: 1, candidateId: 'A' } }]));
t('重複使用同一個流水號', (d) => {
  castVote(d, '157', 'A');
  commit(d, '157', [
    { col: 'quotas', id: '157_20260729', op: 'update', data: { used: 2 } },
    { col: 'votes', id: '157_20260729_1', op: 'set',
      data: { uid: '157', day: todayInt(), seq: 1, candidateId: 'B' } }]);
});
t('刪除已投出的票', (d) => {
  castVote(d, '157', 'A');
  commit(d, '157', [{ col: 'votes', id: '157_20260729_1', op: 'delete', data: {} }]);
});
t('票投給 A 卻幫 B 加票數', (d) => {
  const day = todayInt();
  commit(d, '157', [
    { col: 'quotas', id: `157_${day}`, op: 'set', data: { uid: '157', day, used: 1 } },
    { col: 'votes', id: `157_${day}_1`, op: 'set',
      data: { uid: '157', day, seq: 1, candidateId: 'A' } },
    { col: 'candidates', id: 'B', op: 'update', data: { voteCount: 1 } }]);
});

console.log('\n設定同步:');
const fs = await import('node:fs');
const cfg = fs.readFileSync('config.js', 'utf8');
const rul = fs.readFileSync('firestore.rules', 'utf8');
const cfgMax = +cfg.match(/maxVotesPerDay:\s*(\d+)/)[1];
const rulMax = +rul.match(/MAX_VOTES_PER_DAY\(\)\s*\{\s*return\s*(\d+)/)[1];
ok(cfgMax === rulMax, `config.js (${cfgMax}) 與 firestore.rules (${rulMax}) 的上限一致 ← 關鍵`);

const html = fs.readFileSync('index.html', 'utf8');
ok(!html.includes('toggleVote'), '前端已移除取消投票');
ok(!/allow update, delete: if false/.test(rul) === false, '規則禁止修改／刪除票');
ok(html.includes('確定投出？（不能取消）'), '投票按鈕需要二次確認');
ok(rul.includes('resource.data.voteCount == 0') && rul.includes('allow delete'),
   '有人投票後就不能撤回提名');

console.log(fail === 0 ? '\n全部通過 ✅' : `\n${fail} 項失敗 ❌`);
process.exit(fail ? 1 : 0);

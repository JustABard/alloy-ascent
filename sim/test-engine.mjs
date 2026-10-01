// Engine sanity tests:  node sim/test-engine.mjs
import assert from 'node:assert/strict';
import { act, createGame, odds, tierOf, computeCheck, crewStats, approachesFor, specialAvailable, matchSummary } from '../web/js/engine.js';
import { MATERIALS, MATERIAL_ORDER, ROLE_ORDER, CARDS, LEGS, cardById } from '../web/js/data.js';
import { QUESTIONS, ROLE_QUESTIONS } from '../web/js/questions.js';

let seed = 7;
const rng = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log(`✓ ${name}`); };

test('odds always sum to 1 and respect natural 1/20', () => {
  for (let tot = -10; tot <= 15; tot++) for (let dc = 5; dc <= 20; dc++) {
    const o = odds(tot, dc);
    assert.ok(Math.abs(o.success + o.partial + o.fail - 1) < 1e-9);
    assert.ok(o.success >= 0.05 && o.fail >= 0.05 || o.partial > 0 || tot > 15);
  }
  assert.equal(tierOf(20, -50, 30), 'success');
  assert.equal(tierOf(1, 50, 2), 'fail');
  assert.equal(tierOf(10, 0, 11), 'partial');
  assert.equal(tierOf(5, 0, 11), 'fail');
});

test('every card has a modifier and a reason for every material', () => {
  for (const c of Object.values(CARDS)) {
    if (!c.mods) continue;
    for (const m of MATERIAL_ORDER) {
      assert.equal(typeof c.mods[m], 'number', `${c.title} ${m}`);
      assert.ok(c.why[m]?.length > 5, `${c.title} why ${m}`);
    }
    assert.ok(c.insight?.length > 20, `${c.title} insight`);
  }
});

test('legs 3 and 6 carry no material modifiers; 1,2,4,5 do', () => {
  for (const L of LEGS) {
    if (!L.cards) continue;
    for (const id of L.cards) assert.equal(!!CARDS[id].mods, L.kind === 'material', id);
  }
});

test('questions are well-formed', () => {
  for (const q of [...Object.values(QUESTIONS), ...Object.values(ROLE_QUESTIONS).flat()]) {
    assert.ok(q.options.length >= 3);
    assert.ok(q.answer >= 0 && q.answer < q.options.length);
    assert.ok(q.explain.length > 5);
  }
  for (const L of [1, 2, 3, 4, 5]) assert.ok(Object.values(QUESTIONS).filter(q => q.leg === L).length >= 5, `leg ${L} pool`);
  for (const r of ROLE_ORDER) assert.ok(ROLE_QUESTIONS[r].length >= 2, r);
});

test('lighter frames carry more cargo; heavier frames are tougher', () => {
  const st = (m) => crewStats({ material: m, processing: MATERIALS[m].processing[0].id, role: 'pilot' });
  assert.ok(st('cf').capacity > st('ss').capacity);
  assert.ok(st('ss').maxIntegrity > st('cf').maxIntegrity);
  assert.ok(st('cr').repair > st('cf').repair);
});

test('material specials are locked by metallurgy', () => {
  const crew = (m) => ({ material: m, processing: MATERIALS[m].processing[0].id, role: 'pilot', spares: 2, cargo: 2 });
  const sp = CARDS.l2a.special; // endurance limit
  assert.ok(specialAvailable(sp, crew('cr')) && specialAvailable(sp, crew('ti')));
  assert.ok(!specialAvailable(sp, crew('al')) && !specialAvailable(sp, crew('mg')));
  assert.ok(specialAvailable(CARDS.l1b.special, crew('cf')) && !specialAvailable(CARDS.l1b.special, crew('al')));
});

test('unique frames are enforced in the lobby', () => {
  let s = createGame({ mode: 'local' });
  const ctx = { now: 0, rng, actor: 'local' };
  s = act(s, { type: 'addCrew', id: 'a' }, ctx);
  s = act(s, { type: 'addCrew', id: 'b' }, ctx);
  s = act(s, { type: 'configCrew', crewId: 'a', patch: { material: 'ti' } }, ctx);
  assert.throws(() => act(s, { type: 'configCrew', crewId: 'b', patch: { material: 'ti' } }, ctx));
});

test('online permissions: only the owner acts, timeouts need an expired deadline, host can reclaim', () => {
  let s = createGame({ mode: 'online', code: 'TEST1', hostId: 'h' });
  const c = (actor, now = 1000) => ({ now, rng, actor });
  s = act(s, { type: 'join', player: { id: 'h', name: 'Host' } }, c('h'));
  s = act(s, { type: 'join', player: { id: 'p', name: 'Pat' } }, c('p'));
  s = act(s, { type: 'addCrew', id: 'ch', name: 'H' }, c('h'));
  s = act(s, { type: 'addCrew', id: 'cp', name: 'P' }, c('p'));
  assert.throws(() => act(s, { type: 'configCrew', crewId: 'cp', patch: { material: 'al' } }, c('h')));
  assert.throws(() => act(s, { type: 'start' }, c('p')));
  s = act(s, { type: 'start', force: true }, c('h'));
  assert.equal(s.phase, 'play');
  assert.equal(s.turn.step, 'event');
  const seq = s.turn.seq;
  assert.throws(() => act(s, { type: 'roll', approach: 'std', seq }, c('p')), /Not your/);
  assert.throws(() => act(s, { type: 'timeout', seq }, c('p', 2000)), /Not timed out/);
  s = act(s, { type: 'timeout', seq }, c('p', 1000 + 61000));
  assert.equal(s.crews[s.turn.crewIdx].id, 'cp');
  assert.throws(() => act(s, { type: 'reclaim', crewId: 'ch' }, c('p', 70000)));
  s = act(s, { type: 'reclaim', crewId: 'cp' }, c('h', 70000));
  assert.equal(s.crews.find(x => x.id === 'cp').owner, 'h');
});

test('a full random pass-and-play game always terminates with consistent scores', () => {
  for (let g = 0; g < 300; g++) {
    let s = createGame({ mode: 'local' });
    const ctx = { now: 0, rng, actor: 'local' };
    const n = 2 + Math.floor(rng() * 5);
    for (let i = 0; i < n; i++) s = act(s, { type: 'addCrew', id: `c${i}` }, ctx);
    s = act(s, { type: 'start', force: true }, ctx);
    let guard = 0;
    while (s.phase === 'play' && guard++ < 400) {
      const t = s.turn;
      if (t.step === 'handover') { s = act(s, { type: 'ready', seq: t.seq }, ctx); continue; }
      if (t.step === 'event') {
        const crew = s.crews[t.crewIdx];
        if (t.q && rng() < 0.5) s = act(s, { type: 'answer', choice: 0, seq: t.seq }, ctx);
        const ap = approachesFor(cardById(t.card), crew).filter(a => !a.special || specialAvailable(a, crew));
        const a = ap[Math.floor(rng() * ap.length)];
        s = act(s, { type: 'roll', approach: a.id, jettison: rng() < 0.1, ability: rng() < 0.3, seq: t.seq }, ctx);
        continue;
      }
      s = act(s, { type: 'end', seq: t.seq }, ctx);
    }
    assert.equal(s.phase, 'ended', 'game ended');
    const sum = matchSummary(s);
    for (const cr of sum.crews) {
      const b = cr.breakdown;
      assert.equal(cr.score, Object.values(b).reduce((x, y) => x + y, 0));
      if (cr.lost) assert.equal(b.cargo + b.integrity + b.time + b.complete, 0);
      assert.ok(cr.integrity >= 0);
    }
    assert.equal(new Set(sum.crews.map(c => c.material)).size, n, 'unique frames by default');
  }
});

test('computeCheck explains every modifier', () => {
  const s = { turn: null };
  const crew = { id: 'x', material: 'al', processing: 't6', role: 'structural', cargo: 4, conditions: [{ id: 'yielded' }] };
  const chk = computeCheck(s, crew, 'l1a', 'std', {});
  const kinds = chk.parts.map(p => p.kind);
  assert.deepEqual(kinds, ['material', 'processing', 'role', 'load', 'damage']);
  assert.equal(chk.total, 2 + 1 + 2 - 2 - 1);
});

console.log(`\n${passed} test groups passed.`);

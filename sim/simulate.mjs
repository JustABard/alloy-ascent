// Monte-Carlo balance testing for SkyForge.
// Plays thousands of complete games with simple bot policies through the SAME engine the
// browser uses, then reports win rates, survival, scores and estimated play time.
//
//   node sim/simulate.mjs [games=20000] [--out docs/playtest]
//
import { act, computeCheck, approachesFor, specialAvailable, hangarOptions, crewStats, abilityApplies, matchSummary } from '../web/js/engine.js';
import { MATERIALS, MATERIAL_ORDER, ROLE_ORDER, cardById, CONFIG } from '../web/js/data.js';
import { questionById } from '../web/js/questions.js';
import { writeFileSync, mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const N = +(args.find(a => /^\d+$/.test(a)) || 20000);
const outIdx = args.indexOf('--out');
const OUT = outIdx >= 0 ? args[outIdx + 1] : null;

// Seeded RNG (mulberry32) so results are reproducible.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const POLICIES = {
  // Sensible player: weighs expected damage vs time, protects integrity when low.
  sensible: { name: 'sensible', answerAcc: 0.7 },
  // Reckless player: always pushes when allowed.
  reckless: { name: 'reckless', answerAcc: 0.5 },
  // Cautious player: always plays it safe.
  cautious: { name: 'cautious', answerAcc: 0.7 },
};

function expectedCost(check, crew, card, appr) {
  // crude utility: integrity is worth ~1.6 pts, hours worth 1 pt, crates 5 pts
  const o = check.odds;
  const outcomeCost = (tier) => {
    let dmg = 0, time = 0, crates = 0, pts = 0;
    const fx = card.options ? (appr.fx[tier] || []) : (card.outcomes[tier]?.fx || []);
    const walk = (list) => list.forEach(e => {
      if (e.byMat) return walk(e.byMat[crew.material] || e.byMat.default || []);
      dmg += e.dmg || 0; time += e.time || 0; crates += e.crate ? 1 : 0; pts += e.pts || 0;
      if (e.cond) dmg += e.cond === 'crack' ? 2.5 : 1.5;
    });
    walk(fx);
    if (tier === 'fail' && appr.failDmg) dmg += appr.failDmg;
    const frag = crew.integrity <= 6 ? 3 : crew.integrity <= 9 ? 2 : 1.4;
    return dmg * frag + time + crates * 5 - pts;
  };
  if (check.auto) return outcomeCost('auto') + (appr.time || 0);
  return o.success * outcomeCost('success') + o.partial * outcomeCost('partial') + o.fail * outcomeCost('fail') + (appr.time || 0) + (appr.cost?.spare ? 2 : 0) + (appr.cost?.crate ? 5 : 0);
}

function chooseApproach(s, crew, policy) {
  const card = cardById(s.turn.card);
  let list = approachesFor(card, crew).filter(a => !a.special || specialAvailable(a, crew));
  if (policy.name === 'reckless' && !card.options) return { approach: 'push' };
  if (policy.name === 'cautious' && !card.options) return { approach: 'safe' };
  let best = null;
  for (const a of list) {
    for (const jettison of [false, true]) {
      if (jettison && (!(crew.cargo > 0) || a.cost?.crate)) continue;
      for (const ability of [false, true]) {
        if (ability && !abilityApplies(crew, card)) continue;
        const check = computeCheck(s, crew, s.turn.card, a.id, { jettison, ability });
        let cost = expectedCost(check, crew, card, a) + (jettison ? 5 : 0) + (ability ? 2 : 0);
        if (!best || cost < best.cost) best = { approach: a.id, jettison, ability, cost };
      }
    }
  }
  return best;
}

function hangarChoice(s, crew) {
  const opts = hangarOptions(s, crew);
  const st = crewStats(crew);
  if (opts.find(o => o.id === 'inspect') && crew.spares > 0) return 'inspect';
  const ht = opts.find(o => o.id.startsWith('heattreat'));
  if (ht) return ht.id;
  const crack = opts.find(o => o.id.startsWith('repair:') && /crack|Delam|Corrosion|Heat-damaged|Alpha/i.test(o.label));
  if (crack) return crack.id;
  const patch = opts.find(o => o.id === 'patch');
  if (patch && crew.integrity <= st.maxIntegrity - 4) return 'patch';
  const anyRepair = opts.find(o => o.id.startsWith('repair:'));
  if (anyRepair && crew.spares >= 2) return anyRepair.id;
  return null;
}

function playGame(nCrews, rng, policyFor, cfgFor) {
  const ctx = () => ({ now: 0, rng, actor: 'local' });
  let s = act({ v: 1, mode: 'sim', phase: 'lobby', settings: { uniqueFrames: true, questions: true, timer: 0 }, players: [], crews: [], leg: 0, turn: null, decks: {}, qdecks: {}, log: [], rollSeq: 0, seq: 0, gameNo: 0 }, { type: 'join', player: { id: 'local', name: 'sim' } }, ctx());
  const mats = [...MATERIAL_ORDER].sort(() => rng() - 0.5);
  for (let i = 0; i < nCrews; i++) {
    s = act(s, { type: 'addCrew', id: `c${i}`, name: `Crew ${i + 1}` }, ctx());
    const cfg = cfgFor(i, mats[i], rng);
    s = act(s, { type: 'configCrew', crewId: `c${i}`, patch: { material: cfg.material } }, ctx());
    s = act(s, { type: 'configCrew', crewId: `c${i}`, patch: { processing: cfg.processing, role: cfg.role } }, ctx());
    const cap = crewStats(s.crews[i]).capacity;
    s = act(s, { type: 'configCrew', crewId: `c${i}`, patch: { cargo: cfg.cargo(cap), ready: true } }, ctx());
  }
  s = act(s, { type: 'start' }, ctx());
  let turns = 0, guard = 0;
  while (s.phase === 'play' && guard++ < 500) {
    const t = s.turn;
    const crew = s.crews[t.crewIdx];
    const pol = policyFor(t.crewIdx);
    if (t.step === 'handover') { s = act(s, { type: 'ready', seq: t.seq }, ctx()); continue; }
    if (t.step === 'event') {
      turns++;
      if (t.q && !t.answer) {
        const Q = questionById(t.q);
        const right = rng() < pol.answerAcc;
        const choice = right ? Q.answer : (Q.answer + 1) % Q.options.length;
        s = act(s, { type: 'answer', choice, seq: t.seq }, ctx());
      }
      const c = chooseApproach(s, s.crews[t.crewIdx], pol);
      s = act(s, { type: 'roll', approach: c.approach, jettison: c.jettison, ability: c.ability, seq: t.seq }, ctx());
      continue;
    }
    if (t.step === 'hangar') {
      let choice = hangarChoice(s, crew);
      if (choice === 'inspect') { s = act(s, { type: 'hangar', option: 'inspect', seq: t.seq }, ctx()); choice = hangarChoice(s, s.crews[t.crewIdx]); }
      if (choice && choice !== 'inspect') s = act(s, { type: 'hangar', option: choice, seq: s.turn.seq }, ctx());
      s = act(s, { type: 'end', seq: s.turn.seq }, ctx());
      continue;
    }
    s = act(s, { type: 'end', seq: t.seq }, ctx());
  }
  return { s, turns };
}

function randomCfg(i, mat, rng) {
  const M = MATERIALS[mat];
  return {
    material: mat,
    processing: M.processing[Math.floor(rng() * 2)].id,
    role: ROLE_ORDER[Math.floor(rng() * ROLE_ORDER.length)],
    cargo: (cap) => Math.max(0, cap - Math.floor(rng() * 2)),
  };
}

function runBatch(label, games, nCrews, policyFor, cfgFor = randomCfg, seed = 1) {
  const rng = mulberry32(seed);
  const by = (k) => ({});
  const stat = { mat: {}, role: {}, proc: {}, leg: {}, tiers: {}, turns: 0, games: 0, ties: 0, lostLegs: {}, causes: {} };
  const bump = (obj, key, field, v = 1) => { obj[key] ||= {}; obj[key][field] = (obj[key][field] || 0) + v; };
  for (let g = 0; g < games; g++) {
    const { s, turns } = playGame(nCrews, rng, policyFor, cfgFor);
    stat.turns += turns; stat.games++;
    const sum = matchSummary(s);
    const top = Math.max(...sum.crews.map(c => c.score));
    const winners = sum.crews.filter(c => c.score === top);
    if (winners.length > 1) stat.ties++;
    for (const c of sum.crews) {
      const win = c.score === top ? 1 / winners.length : 0;
      const pk = `${c.material}:${c.processing}`;
      for (const [obj, key] of [[stat.mat, c.material], [stat.role, c.role], [stat.proc, pk]]) {
        bump(obj, key, 'n'); bump(obj, key, 'win', win); bump(obj, key, 'survive', c.lost ? 0 : 1);
        bump(obj, key, 'score', c.score); bump(obj, key, 'cargo', c.lost ? 0 : c.cargoEnd);
        bump(obj, key, 'time', c.time);
        for (const [bk, bv] of Object.entries(c.breakdown)) bump(obj, key, `b_${bk}`, bv);
        bump(obj, key, 'sq', c.score * c.score);
      }
      if (c.lost) { bump(stat.lostLegs, c.material, `L${c.lostLeg}`); stat.causes[c.lostCause?.replace(/ \(Leg \d\)/, '')] = (stat.causes[c.lostCause?.replace(/ \(Leg \d\)/, '')] || 0) + 1; }
      for (const h of c.history) {
        if (!['success', 'partial', 'fail'].includes(h.tier)) continue;
        bump(stat.tiers, `${c.material}|L${h.leg}`, h.tier);
      }
    }
  }
  return { label, games, nCrews, ...stat };
}

const pct = (x) => `${(100 * x).toFixed(1)}%`;
function table(rows, cols) {
  const head = `| ${cols.map(c => c[0]).join(' | ')} |\n|${cols.map(() => '---').join('|')}|`;
  return head + '\n' + rows.map(r => `| ${cols.map(c => c[1](r)).join(' | ')} |`).join('\n');
}

function report(b) {
  const lines = [];
  const turnsPerGame = b.turns / b.games;
  lines.push(`### ${b.label}`);
  lines.push(`${b.games.toLocaleString()} games · ${b.nCrews} crews · ${turnsPerGame.toFixed(1)} turns/game · ties ${pct(b.ties / b.games)}`);
  lines.push(`Estimated play time at 20–30 s per turn: **${(turnsPerGame * 20 / 60).toFixed(1)}–${(turnsPerGame * 30 / 60).toFixed(1)} min** (+≈2 min set-up)`);
  lines.push('');
  const matRows = MATERIAL_ORDER.map(k => ({ k, ...b.mat[k] })).filter(r => r.n);
  lines.push(table(matRows, [
    ['Material', r => MATERIALS[r.k].short],
    ['Win rate', r => pct(r.win / r.n)],
    ['Fair share', () => pct(1 / b.nCrews)],
    ['Survival', r => pct(r.survive / r.n)],
    ['Mean score', r => (r.score / r.n).toFixed(1)],
    ['Crates delivered', r => (r.cargo / r.n).toFixed(2)],
    ['Mean hours', r => (r.time / r.n).toFixed(1)],
    ['Score SD', r => Math.sqrt(r.sq / r.n - (r.score / r.n) ** 2).toFixed(1)],
  ]));
  lines.push('');
  lines.push('Mean score breakdown by material:');
  lines.push('');
  const bks = ['cargo', 'integrity', 'time', 'spares', 'complete', 'budget', 'insight', 'bonus', 'green'];
  lines.push(table(matRows, [['Material', r => MATERIALS[r.k].short], ...bks.map(k => [k, r => ((r[`b_${k}`] || 0) / r.n).toFixed(1)])]));
  lines.push('');
  const roleRows = ROLE_ORDER.map(k => ({ k, ...b.role[k] })).filter(r => r.n);
  lines.push(table(roleRows, [
    ['Role', r => r.k],
    ['Win rate', r => pct(r.win / r.n)],
    ['Survival', r => pct(r.survive / r.n)],
    ['Mean score', r => (r.score / r.n).toFixed(1)],
  ]));
  return lines.join('\n');
}

function legMatrix(b) {
  const lines = ['| Material | Leg 1 | Leg 2 | Leg 3 | Leg 4 | Leg 5 | Leg 6 |', '|---|---|---|---|---|---|---|'];
  for (const k of MATERIAL_ORDER) {
    const cells = [1, 2, 3, 4, 5, 6].map(L => {
      const t = b.tiers[`${k}|L${L}`];
      if (!t) return '—';
      const n = (t.success || 0) + (t.partial || 0) + (t.fail || 0);
      return `${pct((t.success || 0) / n)} / ${pct((t.fail || 0) / n)}`;
    });
    lines.push(`| ${MATERIALS[k].short} | ${cells.join(' | ')} |`);
  }
  return lines.join('\n');
}

function procTable(b) {
  const lines = ['| Material : processing | Win rate | Survival | Mean score |', '|---|---|---|---|'];
  for (const k of MATERIAL_ORDER) for (const p of MATERIALS[k].processing) {
    const r = b.proc[`${k}:${p.id}`];
    if (!r) continue;
    lines.push(`| ${MATERIALS[k].short} ${p.name} | ${pct(r.win / r.n)} | ${pct(r.survive / r.n)} | ${(r.score / r.n).toFixed(1)} |`);
  }
  return lines.join('\n');
}

const sensible = () => POLICIES.sensible;
const t0 = Date.now();
const main6 = runBatch('6 crews · all materials · sensible bots', N, 6, sensible, randomCfg, 11);
const four = runBatch('4 crews · random materials · sensible bots', Math.round(N / 2), 4, sensible, randomCfg, 22);
const two = runBatch('2 crews · random materials · sensible bots', Math.round(N / 2), 2, sensible, randomCfg, 33);
const mixed = runBatch('6 crews · policy mix (2 reckless, 2 cautious, 2 sensible)', Math.round(N / 2), 6,
  (i) => [POLICIES.reckless, POLICIES.reckless, POLICIES.cautious, POLICIES.cautious, POLICIES.sensible, POLICIES.sensible][i], randomCfg, 44);

// Policy comparison: same material set, measure the value of decision-making.
const polStat = { reckless: { n: 0, win: 0, sur: 0, sc: 0 }, cautious: { n: 0, win: 0, sur: 0, sc: 0 }, sensible: { n: 0, win: 0, sur: 0, sc: 0 } };
{
  const rng = mulberry32(55);
  const pols = ['reckless', 'reckless', 'cautious', 'cautious', 'sensible', 'sensible'];
  for (let g = 0; g < Math.round(N / 2); g++) {
    const order = [...pols].sort(() => rng() - 0.5);
    const { s } = playGame(6, rng, (i) => POLICIES[order[i]], randomCfg);
    const sum = matchSummary(s);
    const top = Math.max(...sum.crews.map(c => c.score));
    const winners = sum.crews.filter(c => c.score === top).length;
    sum.crews.forEach((c, i) => { const p = polStat[order[i]]; p.n++; p.win += c.score === top ? 1 / winners : 0; p.sur += c.lost ? 0 : 1; p.sc += c.score; });
  }
}

const md = [];
md.push(`# Automated playtest results`);
md.push(`Generated ${new Date().toISOString().slice(0, 10)} by \`sim/simulate.mjs\` (${((Date.now() - t0) / 1000).toFixed(1)} s). Same rules engine as the web game; seeded RNG so results are reproducible.`);
md.push('');
md.push(report(main6));
md.push('');
md.push('#### Success / failure rate by leg (6-crew batch) — shows WHERE each material is strong or weak');
md.push('Each cell: success % / failure % on that leg’s main check.');
md.push('');
md.push(legMatrix(main6));
md.push('');
md.push('#### Processing route comparison (6-crew batch)');
md.push('');
md.push(procTable(main6));
md.push('');
md.push('#### Causes of craft loss (6-crew batch)');
md.push('');
md.push(Object.entries(main6.causes).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `- ${k}: ${v} (${pct(v / (main6.games * 6))} of crews)`).join('\n'));
md.push('');
md.push(report(four));
md.push('');
md.push(report(two));
md.push('');
md.push('#### Does decision-making matter? (6 crews: 2 reckless, 2 cautious, 2 sensible, random seats)');
md.push('');
md.push('| Policy | Win rate | Survival | Mean score |\n|---|---|---|---|');
for (const [k, p] of Object.entries(polStat)) md.push(`| ${k} | ${pct(p.win / p.n)} | ${pct(p.sur / p.n)} | ${(p.sc / p.n).toFixed(1)} |`);
const text = md.join('\n');
console.log(text);
if (OUT) {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(`${OUT}/sim-results.md`, text + '\n');
  writeFileSync(`${OUT}/sim-results.json`, JSON.stringify({ main6, four, two, mixed, polStat }, null, 1));
  console.error(`wrote ${OUT}/sim-results.md`);
}

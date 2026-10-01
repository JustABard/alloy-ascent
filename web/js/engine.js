// SkyForge — rules engine.
// Pure state machine shared by the browser (pass-and-play and online rooms) and the Node
// balance simulator. act(state, action, ctx) returns a NEW state; ctx = { now, rng, actor }.

import { CONFIG, MATERIALS, MATERIAL_ORDER, ROLES, ROLE_ORDER, CONDITIONS, STD_APPROACHES, LEGS, CARDS, DOCK_CARDS, cardById, FOOTPRINT } from './data.js';
import { QUESTIONS, ROLE_QUESTIONS, questionById } from './questions.js';

export const LOCAL_ACTOR = 'local';
const clone = (o) => structuredClone(o);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// ------------------------------------------------------------------ helpers
export function procOf(crew) {
  const M = MATERIALS[crew.material];
  if (!M) return null;
  return M.processing.find(p => p.id === crew.processing) || M.processing[0];
}

export function crewStats(crew) {
  const M = MATERIALS[crew.material];
  if (!M) return null;
  const P = procOf(crew);
  const R = ROLES[crew.role] || {};
  const e = P.effects || {};
  return {
    maxIntegrity: M.stats.integrity + (e.integrity || 0),
    capacity: M.stats.capacity + (R.capacity || 0),
    spares: M.stats.spares + (R.spares || 0),
    repair: M.stats.repair + (e.repair || 0),
    crackTol: M.stats.crackTol + (e.crackTol || 0),
    legTime: M.stats.legTime,
  };
}

export const loadPenalty = (cargo) => Math.floor((cargo || 0) / 2);
export const legHours = (crew) => (crewStats(crew)?.legTime || 10) + CONFIG.loadTimePerCrate * (crew.cargo || 0);

export function odds(total, dc) {
  let s = 0, p = 0, f = 0;
  for (let r = 1; r <= CONFIG.die; r++) {
    const t = tierOf(r, total, dc);
    if (t === 'success') s++; else if (t === 'partial') p++; else f++;
  }
  return { success: s / 20, partial: p / 20, fail: f / 20 };
}

export function tierOf(r, total, dc) {
  if (r === 20) return 'success';
  if (r === 1) return 'fail';
  const t = r + total;
  if (t >= dc) return 'success';
  if (t >= dc - CONFIG.partialBand) return 'partial';
  return 'fail';
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function draw(decks, key, pool, rng) {
  if (!decks[key] || decks[key].length === 0) decks[key] = shuffle(pool, rng);
  return decks[key].shift();
}

export const questionIdsForLeg = (leg) => Object.keys(QUESTIONS).filter(k => QUESTIONS[k].leg === leg);

function isOwner(state, crew, actor) {
  return state.mode === 'local' || actor === LOCAL_ACTOR || crew.owner === actor;
}
function isHost(state, actor) {
  return state.mode === 'local' || actor === LOCAL_ACTOR || state.hostId === actor;
}

function log(s, kind, text, crewId = null) {
  s.log.push({ n: (s.logN = (s.logN || 0) + 1), leg: s.leg, kind, text, crewId });
  if (s.log.length > 250) s.log.splice(0, s.log.length - 250);
}

// ------------------------------------------------------------------ creation
export function createGame({ mode = 'local', code = null, hostId = null, settings = {} } = {}) {
  return {
    v: 1, mode, code, hostId,
    phase: 'lobby',
    settings: { uniqueFrames: true, questions: true, timer: CONFIG.defaultTimer, shareResults: true, ...settings },
    players: [], crews: [],
    leg: 0, turn: null, decks: {}, qdecks: {},
    log: [], logN: 0, rollSeq: 0, seq: 0, gameNo: 0,
    startedAt: null, endedAt: null, results: null, paused: null,
  };
}

function blankCrew(id, name, owner) {
  return { id, name, owner, material: null, processing: null, role: null, cargo: null, ready: false };
}

export function materialTaken(state, mat, exceptCrewId) {
  return state.settings.uniqueFrames && state.crews.some(c => c.material === mat && c.id !== exceptCrewId);
}

export function crewConfigured(c) {
  return !!(c.material && c.processing && c.role && c.cargo !== null && c.cargo !== undefined);
}

// ------------------------------------------------------------------ checks
export function approachesFor(card, crew) {
  if (card.options) return card.options.map(o => ({ ...o, abs: true }));
  const R = ROLES[crew.role] || {};
  const list = STD_APPROACHES.map(a => {
    const o = { ...a, label: card.labels?.[a.id] || a.label };
    if (a.id === 'push' && R.pushDC !== undefined) o.dc = R.pushDC;
    if (a.id === 'push' && R.pushTime !== undefined) o.time = R.pushTime;
    return o;
  });
  if (card.special) list.push({ ...card.special, special: true });
  return list;
}

export function specialAvailable(sp, crew) {
  if (!sp) return false;
  if (sp.avail && sp.avail !== 'all' && !sp.avail.includes(crew.material)) return false;
  if (sp.cost?.spare && (crew.spares || 0) < sp.cost.spare) return false;
  if (sp.cost?.crate && (crew.cargo || 0) < sp.cost.crate) return false;
  return true;
}

export function abilityApplies(crew, card) {
  const R = ROLES[crew.role];
  if (!R || crew.abilityUsed) return false;
  const ab = R.ability;
  if (ab.when !== 'preroll') return false;
  if (ab.tags) return card.tags.some(t => ab.tags.includes(t));
  return true;
}

// Returns modifier breakdown for a crew attempting a card with a given approach.
export function computeCheck(state, crew, cardId, approachId, opts = {}) {
  const card = cardById(cardId);
  const leg = card.leg;
  const appr = approachesFor(card, crew).find(a => a.id === approachId) || approachesFor(card, crew)[0];
  const parts = [];
  const M = MATERIALS[crew.material];
  const P = procOf(crew);
  const R = ROLES[crew.role] || {};
  const tags = card.tags;

  if (card.mods) {
    const v = card.mods[crew.material] || 0;
    parts.push({ kind: 'material', label: M.short, value: v, why: card.why?.[crew.material] || '' });
    let pv = 0;
    for (const t of tags) pv += (P.mods?.[t] || 0);
    if (pv) parts.push({ kind: 'processing', label: P.name, value: pv, why: P.micro });
  }
  if (leg === 6) {
    if (card.role === crew.role) parts.push({ kind: 'role', label: `${R.name} — your speciality`, value: CONFIG.specialistBonus, why: 'Specialist leg' });
  } else if (R.tags && tags.some(t => R.tags.includes(t))) {
    parts.push({ kind: 'role', label: R.name, value: R.bonus, why: R.summary });
  }
  if (tags.includes('strength') || tags.includes('fatigue')) {
    const lp = loadPenalty(crew.cargo);
    if (lp) parts.push({ kind: 'load', label: `Cargo load (${crew.cargo} crates)`, value: -lp, why: 'Heavier craft → higher stress per g and per gust' });
  }
  let cv = 0, hidden = false;
  for (const c of crew.conditions || []) {
    const C = CONDITIONS[c.id];
    let v = 0;
    for (const t of tags) v += (C.mods?.[t] || 0);
    if (v) { cv += v; if (c.hidden) hidden = true; }
  }
  if (cv) parts.push({ kind: 'damage', label: hidden ? 'Damage (incl. undetected)' : 'Existing damage', value: cv, why: 'Conditions carried from earlier legs' });

  const t = state.turn;
  if (t && t.answer?.correct && t.crewId === crew.id) {
    const b = leg === 6 ? CONFIG.specialistQuestionBonus : (R.briefingBonus || CONFIG.briefingBonus);
    parts.push({ kind: 'briefing', label: leg === 6 ? 'Specialist answer' : 'Briefing answered', value: b, why: 'Knowledge pays' });
  }
  if (opts.jettison && (crew.cargo || 0) > 0 && !(appr.cost?.crate)) {
    parts.push({ kind: 'jettison', label: 'Jettison a crate', value: R.jettison || CONFIG.jettisonBonus, why: 'Less mass, lower loads' });
  }
  if (opts.ability && abilityApplies(crew, card) && R.ability.value) {
    parts.push({ kind: 'ability', label: R.ability.name, value: R.ability.value, why: R.ability.desc });
  }
  const total = parts.reduce((a, p) => a + p.value, 0);
  const dc = appr.abs ? appr.dc : card.dc + (appr.dc || 0);
  const auto = appr.abs && (appr.dc === null || appr.dc === undefined);
  return { card, appr, parts, total, dc, auto, odds: auto ? { success: 1, partial: 0, fail: 0 } : odds(total, dc) };
}

// ------------------------------------------------------------------ effects
function addCondition(crew, id, { stage = 1, hidden = false } = {}) {
  if (crew.role === 'ndt' && CONDITIONS[id].ndt) hidden = false;
  const existing = crew.conditions.find(c => c.id === id);
  if (existing) {
    if (id === 'crack') { existing.stage += stage; existing.hidden = existing.hidden && hidden; }
    return existing;
  }
  const c = { id, hidden };
  if (id === 'crack') c.stage = stage;
  crew.conditions.push(c);
  return c;
}

function damage(s, crew, n, notes, cause) {
  if (n <= 0 || crew.lost) return;
  crew.integrity -= n;
  crew.dmgTaken = (crew.dmgTaken || 0) + n;
  notes.push({ t: 'dmg', v: n, text: `−${n} integrity` });
  if (crew.integrity <= 0) {
    crew.integrity = 0;
    crew.lost = true;
    crew.lostLeg = s.leg;
    crew.lostCause = cause;
    notes.push({ t: 'lost', text: 'Structural failure — the crew ejects safely, but the craft is lost.' });
    log(s, 'lost', `${crew.name}’s ${MATERIALS[crew.material].short} frame failed: ${cause}. Crew ejected safely.`, crew.id);
  }
}

function loseCrate(s, crew, notes, why = 'A crate is lost') {
  if ((crew.cargo || 0) <= 0) return;
  if (crew.role === 'quartermaster' && !crew.abilityUsed) {
    crew.abilityUsed = true;
    notes.push({ t: 'save', text: 'Secured cargo: the Quartermaster saves a crate that would have been lost' });
    return;
  }
  crew.cargo -= 1;
  crew.cratesLost = (crew.cratesLost || 0) + 1;
  notes.push({ t: 'crate', text: `${why} (−1 crate)` });
}

function resolveByMat(crew, map) {
  const key = `${crew.material}:${crew.processing}`;
  if (map[key]) return map[key];
  if (map[crew.material]) return map[crew.material];
  return map.default || [];
}

function applyFx(s, crew, fx, notes, cause) {
  for (const e of fx || []) {
    if (crew.lost) return;
    if (e.byMat) { applyFx(s, crew, resolveByMat(crew, e.byMat), notes, cause); continue; }
    if (e.dmg) damage(s, crew, e.dmg, notes, cause);
    if (e.time) { crew.time += e.time; notes.push({ t: 'time', v: e.time, text: `${e.time > 0 ? '+' : '−'}${Math.abs(e.time)} h` }); }
    if (e.crate) loseCrate(s, crew, notes);
    if (e.spare) { crew.spares += e.spare; notes.push({ t: 'spare', text: `+${e.spare} spare part` }); }
    if (e.pts) { crew.bonus += e.pts; notes.push({ t: 'pts', text: `+${e.pts} mission points` }); }
    if (e.cond) {
      const c = addCondition(crew, e.cond, { stage: e.stage || 1, hidden: !!e.hidden });
      const C = CONDITIONS[e.cond];
      notes.push({ t: 'cond', cond: e.cond, hidden: c.hidden, text: c.hidden ? 'Possible hidden damage' : `${C.name}${e.cond === 'crack' ? ` (stage ${c.stage})` : ''}` });
    }
  }
}

// Start-of-turn effects: crack growth (fracture mechanics) and corrosion.
function applyLegStart(s, crew, notes) {
  const st = crewStats(crew);
  for (const c of [...crew.conditions]) {
    if (c.id === 'crack') {
      if (crew.role === 'ndt' && !c.hidden) {
        notes.push({ t: 'info', text: 'Crack stop-drilled by your NDT Inspector — no growth' });
        continue;
      }
      c.stage += 1;
      if (c.stage > st.crackTol) {
        crew.conditions = crew.conditions.filter(x => x !== c);
        notes.push({ t: 'fracture', text: `A ${c.hidden ? 'hidden ' : ''}fatigue crack reached critical length and fast-fractured!` });
        log(s, 'fracture', `${crew.name}: a ${c.hidden ? 'hidden ' : ''}fatigue crack reached critical length (a > a꜀) and fast-fractured.`, crew.id);
        damage(s, crew, CONFIG.fractureDamage, notes, 'fast fracture from a growing fatigue crack');
      } else if (!c.hidden) {
        notes.push({ t: 'info', text: `Fatigue crack grew to stage ${c.stage} of ${st.crackTol} (critical)` });
      }
    }
    if (c.id === 'corrosion') {
      notes.push({ t: 'info', text: 'Corrosion continues to eat the structure' });
      damage(s, crew, CONDITIONS.corrosion.perLeg, notes, 'corrosion');
    }
    if (crew.lost) return;
  }
}

// ------------------------------------------------------------------ turns
function firstActiveIdx(s, from = 0) {
  for (let i = from; i < s.crews.length; i++) if (!s.crews[i].lost) return i;
  return -1;
}

function beginTurn(s, idx, ctx) {
  const crew = s.crews[idx];
  const notes = [];
  if (s.leg > 1) applyLegStart(s, crew, notes);
  if (crew.lost) {
    crew.history.push({ leg: s.leg, title: 'Lost before the leg began', tier: 'lost', notes });
    return advance(s, idx, ctx);
  }
  const leg = LEGS[s.leg - 1];
  const card = s.leg === 6 ? `dock:${crew.role}` : draw(s.decks, s.leg, leg.cards, ctx.rng);
  let q = null;
  if (s.settings.questions) {
    if (s.leg === 6) {
      const arr = ROLE_QUESTIONS[crew.role];
      q = `r:${crew.role}:${Math.floor(ctx.rng() * arr.length)}`;
    } else {
      q = draw(s.qdecks, s.leg, questionIdsForLeg(s.leg), ctx.rng);
    }
  }
  s.turn = {
    seq: ++s.seq, crewIdx: idx, crewId: crew.id, leg: s.leg,
    step: s.mode === 'local' ? 'handover' : 'event',
    card, q, answer: null, roll: null, hangar: null, inspected: false,
    startNotes: notes, startedAt: ctx.now,
    deadline: (s.mode !== 'local' && s.settings.timer) ? ctx.now + s.settings.timer * 1000 : null,
  };
  s.paused = null;
  return s;
}

function advance(s, idx, ctx) {
  const next = firstActiveIdx(s, idx + 1);
  if (next >= 0) return beginTurn(s, next, ctx);
  // leg complete
  if (s.leg >= 6 || s.crews.every(c => c.lost)) return endGame(s, ctx);
  s.leg += 1;
  log(s, 'leg', `Leg ${s.leg}: ${LEGS[s.leg - 1].name} — ${LEGS[s.leg - 1].topic}`);
  const first = firstActiveIdx(s, 0);
  if (first < 0) return endGame(s, ctx);
  return beginTurn(s, first, ctx);
}

function resolveRoll(s, action, ctx, timedOut = false) {
  const t = s.turn;
  const crew = s.crews[t.crewIdx];
  const card = cardById(t.card);
  const appr = approachesFor(card, crew).find(a => a.id === action.approach);
  if (!appr) throw new Error('Unknown approach');
  if (appr.special && !specialAvailable(appr, crew)) throw new Error('That option is not available to your crew');
  const R = ROLES[crew.role];
  const notes = [];
  const fuelCargo = crew.cargo;

  // costs paid up front
  if (appr.cost?.spare) { crew.spares -= appr.cost.spare; notes.push({ t: 'spare', text: `−${appr.cost.spare} spare used` }); }
  if (appr.cost?.crate) { crew.cargo -= appr.cost.crate; crew.cratesLost = (crew.cratesLost || 0) + 1; notes.push({ t: 'crate', text: '−1 crate dumped for mass' }); }

  const useAbility = !!action.ability && abilityApplies(crew, card);
  const check = computeCheck(s, crew, t.card, appr.id, { jettison: action.jettison, ability: useAbility });
  if (action.jettison && crew.cargo > 0 && !appr.cost?.crate) {
    crew.cargo -= 1; crew.cratesLost = (crew.cratesLost || 0) + 1;
    crew.jettisoned = (crew.jettisoned || 0) + 1;
    notes.push({ t: 'crate', text: 'Jettisoned 1 crate' });
  }

  let d = null, d2 = null, tier;
  if (check.auto) tier = 'auto';
  else {
    d = 1 + Math.floor(ctx.rng() * CONFIG.die);
    tier = tierOf(d, check.total, check.dc);
    if (useAbility && R.ability.id === 'reroll' && tier !== 'success') {
      d2 = 1 + Math.floor(ctx.rng() * CONFIG.die);
      const t2 = tierOf(d2, check.total, check.dc);
      const rank = { fail: 0, partial: 1, success: 2 };
      if (rank[t2] > rank[tier]) tier = t2;
    }
    if (useAbility && R.ability.id === 'loadpath' && tier === 'fail') { tier = 'partial'; notes.push({ t: 'save', text: 'Redundant load path: Failure → Partial' }); }
    if (appr.effect === 'failToPartialSet' && tier === 'fail') {
      tier = 'partial';
      addCondition(crew, 'yielded');
      notes.push({ t: 'cond', cond: 'yielded', text: 'Ductile reserve: Failure → Partial, but a spar takes a permanent set' });
    }
  }
  if (useAbility) crew.abilityUsed = true;

  // time for the leg
  const base = legHours({ ...crew, cargo: fuelCargo });
  crew.time += base + (appr.time || 0);
  notes.unshift({ t: 'time', v: base + (appr.time || 0), text: `${(base + (appr.time || 0)).toFixed(1).replace(/\.0$/, '')} h flown` });
  // fuel / footprint
  const M = MATERIALS[crew.material];
  crew.fuelCO2 = (crew.fuelCO2 || 0) + (M.frameMass + FOOTPRINT.baseMass + FOOTPRINT.crateMass * fuelCargo) * FOOTPRINT.fuelPerTonneLeg;

  let text = '';
  const cause = `${card.title} (Leg ${s.leg})`;
  if (card.options) {
    const fx = appr.fx[tier === 'auto' ? 'auto' : tier] || [];
    applyFx(s, crew, fx, notes, cause);
    text = tier === 'auto' ? 'You take the certain option.' : ({ success: 'It works out.', partial: 'Mixed fortunes.', fail: 'It goes badly.' })[tier];
  } else {
    const out = card.outcomes[tier];
    text = out.text;
    applyFx(s, crew, out.fx, notes, cause);
    if (tier === 'fail' && appr.failDmg) damage(s, crew, appr.failDmg, notes, cause);
  }

  t.roll = {
    seq: ++s.rollSeq, d, d2, total: check.total, dc: check.dc, tier, approach: appr.id, approachLabel: appr.label,
    parts: check.parts, notes, text, timedOut, jettison: !!action.jettison && !appr.cost?.crate, ability: useAbility,
  };
  crew.history.push({ leg: s.leg, card: t.card, title: card.title, tier, approach: appr.id, d, total: check.total, dc: check.dc, timedOut, answered: t.answer ? (t.answer.correct ? 'right' : 'wrong') : null });
  const tierWord = { success: 'SUCCESS', partial: 'PARTIAL', fail: 'FAILURE', auto: 'CHOSEN' }[tier];
  log(s, tier, `${crew.name} · ${card.title} · ${appr.label}${d ? ` · rolled ${d}${d2 ? `/${d2}` : ''}${check.total >= 0 ? '+' : ''}${check.total} vs ${check.dc}` : ''} → ${tierWord}${timedOut ? ' (timer ran out — autopilot)' : ''}`, crew.id);
  if (t.deadline) t.deadline = Math.max(t.deadline, ctx.now + 15000);
}

// ------------------------------------------------------------------ hangar
export function hangarOptions(s, crew) {
  const st = crewStats(crew);
  const opts = [];
  const t = s.turn;
  const hasHidden = crew.conditions.some(c => c.hidden);
  if (hasHidden && !t?.inspected) opts.push({ id: 'inspect', label: 'Inspect the airframe', time: CONFIG.inspectTime, desc: 'Find hidden damage so it can be repaired (+1 h).' });
  if (crew.spares > 0) {
    if (crew.integrity < st.maxIntegrity) opts.push({ id: 'patch', label: 'Patch the hull', dc: repairDC(crew, null), time: CONFIG.repairTime, desc: `+${CONFIG.patchHeal} integrity on success. Uses 1 spare.` });
    crew.conditions.forEach((c, i) => {
      const C = CONDITIONS[c.id];
      if (c.hidden || !C.repairable) return;
      const auto = c.id === 'corrosion' && crew.role === 'coatings';
      opts.push({ id: `repair:${i}`, label: `Repair: ${C.name}`, dc: auto ? null : repairDC(crew, c), time: CONFIG.repairTime, desc: auto ? 'Your Surface Engineer treats corrosion reliably. Uses 1 spare.' : 'Remove this condition on success. Uses 1 spare.' });
    });
    if (crew.role === 'metallurgist' && !crew.abilityUsed) {
      crew.conditions.forEach((c, i) => {
        if (!c.hidden && CONDITIONS[c.id].heatTreat) opts.push({ id: `heattreat:${i}`, label: `Field heat treatment: ${CONDITIONS[c.id].name}`, dc: null, time: 3, desc: 'Once per game. Re-processes the microstructure (+3 h, 1 spare). Always succeeds.' });
      });
    }
  }
  return opts;
}

export function repairDC(crew, cond) {
  // Returns the modifier-adjusted DC shown to players: success if d20 >= this number.
  const st = crewStats(crew);
  let mod = st.repair;
  let dc = CONFIG.repairDC;
  if (cond) {
    dc += CONDITIONS[cond.id].repairAdj || 0;
    if (crew.role === 'ndt' && ['crack', 'delam', 'microcrack'].includes(cond.id)) mod += 3;
  }
  return { dc, mod };
}

function resolveHangar(s, action, ctx) {
  const t = s.turn;
  const crew = s.crews[t.crewIdx];
  const opt = action.option;
  const notes = [];
  if (opt === 'inspect') {
    if (t.inspected) throw new Error('Already inspected');
    t.inspected = true;
    crew.time += CONFIG.inspectTime;
    const found = crew.conditions.filter(c => c.hidden);
    found.forEach(c => { c.hidden = false; });
    t.hangar = { kind: 'inspect', found: found.map(c => ({ id: c.id, stage: c.stage })), notes };
    log(s, 'inspect', `${crew.name} inspected: ${found.length ? found.map(c => CONDITIONS[c.id].name + (c.stage ? ` (stage ${c.stage})` : '')).join(', ') : 'nothing found'}.`, crew.id);
    return; // inspection does not end the hangar stop
  }
  if (crew.spares <= 0) throw new Error('No spares left');
  const [kind, idxStr] = opt.split(':');
  const idx = idxStr !== undefined ? +idxStr : null;
  const cond = idx !== null ? crew.conditions[idx] : null;
  crew.spares -= 1;
  crew.repairs = (crew.repairs || 0) + 1;
  if (kind === 'heattreat') {
    if (crew.role !== 'metallurgist' || crew.abilityUsed || !cond) throw new Error('Not available');
    crew.abilityUsed = true;
    crew.time += 3;
    crew.conditions.splice(idx, 1);
    t.hangar = { kind, success: true, label: CONDITIONS[cond.id].name };
    log(s, 'repair', `${crew.name} re-heat-treated the frame: ${CONDITIONS[cond.id].name} removed.`, crew.id);
  } else {
    crew.time += CONFIG.repairTime;
    let success, d = null, rd = null;
    if (kind === 'repair' && cond?.id === 'corrosion' && crew.role === 'coatings') success = true;
    else {
      rd = repairDC(crew, kind === 'repair' ? cond : null);
      d = 1 + Math.floor(ctx.rng() * CONFIG.die);
      success = d === 20 || (d !== 1 && d + rd.mod >= rd.dc);
    }
    if (success) {
      if (kind === 'patch') crew.integrity = Math.min(crewStats(crew).maxIntegrity, crew.integrity + CONFIG.patchHeal);
      else crew.conditions.splice(idx, 1);
    }
    const label = kind === 'patch' ? 'Hull patch' : CONDITIONS[cond.id].name;
    t.hangar = { kind, success, d, mod: rd?.mod, dc: rd?.dc, label, seq: ++s.rollSeq };
    log(s, 'repair', `${crew.name} · repair (${label})${d ? ` · rolled ${d}${rd.mod >= 0 ? '+' : ''}${rd.mod} vs ${rd.dc}` : ''} → ${success ? 'fixed' : 'failed, spare wasted'}.`, crew.id);
  }
  t.step = 'hangarDone';
}

// ------------------------------------------------------------------ scoring
export function scoreCrew(crew) {
  const finished = !crew.lost;
  const M = MATERIALS[crew.material];
  const cargoPts = finished ? crew.cargo * CONFIG.crateValue : 0;
  const integrityPts = finished ? crew.integrity : 0;
  const delta = CONFIG.deadline - crew.time;
  const timePts = finished ? Math.round(Math.max(-CONFIG.latePenaltyCap, delta) * CONFIG.timeBonusPerHour) : 0;
  const sparePts = finished ? crew.spares : 0;
  const completePts = finished ? CONFIG.completionBonus : 0;
  const budgetPts = finished ? M.stats.budget : 0;
  const embodied = M.frameMass * M.co2PerKg; // t CO2e for the frame
  const perMission = (crew.fuelCO2 || 0) + embodied / CONFIG.missionsPerLife;
  const perCrate = finished && crew.cargo > 0 ? perMission / crew.cargo : null;
  return { finished, cargoPts, integrityPts, timePts, sparePts, completePts, budgetPts, insightPts: crew.insight, bonusPts: crew.bonus, greenPts: 0, embodied, fuel: crew.fuelCO2 || 0, perMission, perCrate };
}

function endGame(s, ctx) {
  s.phase = 'ended';
  s.endedAt = ctx.now;
  s.turn = null;
  const rows = s.crews.map(c => ({ crewId: c.id, ...scoreCrew(c) }));
  const eligible = rows.filter(r => r.perCrate !== null);
  if (eligible.length) {
    const best = eligible.reduce((a, b) => (b.perCrate < a.perCrate ? b : a));
    best.greenPts = CONFIG.greenAward;
  }
  rows.forEach(r => { r.total = r.cargoPts + r.integrityPts + r.timePts + r.sparePts + r.completePts + r.budgetPts + r.insightPts + r.bonusPts + r.greenPts; });
  const ranked = [...rows].sort((a, b) => b.total - a.total);
  ranked.forEach((r, i) => { r.rank = i + 1; });
  s.results = { rows, winner: ranked[0]?.crewId, durationMs: s.endedAt - s.startedAt };
  log(s, 'end', `Mission complete. ${s.crews.find(c => c.id === ranked[0]?.crewId)?.name || '—'} wins with ${ranked[0]?.total} points.`);
  return s;
}

// ------------------------------------------------------------------ start
function initCrewRuntime(c) {
  const st = crewStats(c);
  Object.assign(c, {
    integrity: st.maxIntegrity, spares: st.spares, cargoStart: c.cargo, time: 0, conditions: [],
    abilityUsed: false, insight: 0, answered: 0, bonus: 0, lost: false, lostLeg: null, lostCause: null,
    history: [], fuelCO2: 0, dmgTaken: 0, cratesLost: 0, jettisoned: 0, repairs: 0,
  });
}

function autoConfigure(s, c, rng) {
  if (!c.material) {
    const free = MATERIAL_ORDER.filter(mm => !materialTaken(s, mm, c.id));
    c.material = (free.length ? free : MATERIAL_ORDER)[Math.floor(rng() * (free.length || 6))];
  }
  if (!c.processing) c.processing = MATERIALS[c.material].processing[0].id;
  if (!c.role) c.role = ROLE_ORDER[Math.floor(rng() * ROLE_ORDER.length)];
  if (c.cargo === null || c.cargo === undefined) c.cargo = Math.max(0, crewStats(c).capacity - 1);
}

function resetToLobby(s) {
  s.phase = 'lobby';
  s.turn = null; s.leg = 0; s.results = null; s.paused = null; s.decks = {}; s.qdecks = {};
  s.crews = s.crews.map(c => ({ id: c.id, name: c.name, owner: c.owner, material: c.material, processing: c.processing, role: c.role, cargo: c.cargoStart ?? c.cargo, ready: false }));
}

// ------------------------------------------------------------------ dispatcher
export function act(prev, action, ctx) {
  const s = clone(prev);
  const actor = ctx.actor ?? LOCAL_ACTOR;
  const turnAction = ['ready', 'answer', 'roll', 'hangar', 'end', 'timeout'].includes(action.type);
  if (turnAction) {
    if (s.phase !== 'play' || !s.turn) throw new Error('No turn in progress');
    if (action.seq !== undefined && action.seq !== s.turn.seq) throw new Error('stale');
    const crew = s.crews[s.turn.crewIdx];
    if (action.type !== 'timeout' && !isOwner(s, crew, actor)) throw new Error('Not your crew’s turn');
  }
  switch (action.type) {
    // ---- lobby
    case 'join': {
      const p = s.players.find(x => x.id === action.player.id);
      if (p) p.name = action.player.name || p.name;
      else s.players.push({ id: action.player.id, name: action.player.name || 'Player' });
      return s;
    }
    case 'leave': {
      if (action.playerId !== actor && !isHost(s, actor)) throw new Error('Host only');
      s.players = s.players.filter(p => p.id !== action.playerId);
      if (s.phase === 'lobby') s.crews = s.crews.filter(c => c.owner !== action.playerId);
      return s;
    }
    case 'addCrew': {
      if (s.phase !== 'lobby') throw new Error('Crews can only be added in the lobby');
      if (s.crews.length >= CONFIG.maxCrews) throw new Error('Maximum six crews');
      const owner = s.mode === 'local' ? LOCAL_ACTOR : actor;
      s.crews.push(blankCrew(action.id, (action.name || `Crew ${s.crews.length + 1}`).slice(0, 24), owner));
      return s;
    }
    case 'removeCrew': {
      const c = s.crews.find(x => x.id === action.crewId);
      if (!c) return s;
      if (!isOwner(s, c, actor) && !isHost(s, actor)) throw new Error('Not your crew');
      if (s.phase !== 'lobby') throw new Error('Return to the lobby first');
      s.crews = s.crews.filter(x => x.id !== action.crewId);
      return s;
    }
    case 'configCrew': {
      if (s.phase !== 'lobby') throw new Error('Configuration is locked during a mission');
      const c = s.crews.find(x => x.id === action.crewId);
      if (!c) throw new Error('No such crew');
      if (!isOwner(s, c, actor)) throw new Error('Not your crew');
      const p = action.patch || {};
      if (p.name !== undefined) c.name = String(p.name).slice(0, 24) || c.name;
      if (p.material !== undefined && p.material !== c.material) {
        if (p.material && materialTaken(s, p.material, c.id)) throw new Error('That frame is already taken');
        c.material = p.material;
        c.processing = p.material ? MATERIALS[p.material].processing[0].id : null;
        c.ready = false;
      }
      if (p.processing !== undefined && c.material && MATERIALS[c.material].processing.some(x => x.id === p.processing)) c.processing = p.processing;
      if (p.role !== undefined) { c.role = p.role; c.ready = false; }
      if (c.material) {
        const cap = crewStats(c).capacity;
        if (p.cargo !== undefined) c.cargo = clamp(+p.cargo, 0, cap);
        if (c.cargo === null || c.cargo === undefined) c.cargo = Math.max(0, cap - 1);
        if (c.cargo > cap) c.cargo = cap;
      }
      if (p.ready !== undefined) c.ready = !!p.ready && crewConfigured(c);
      return s;
    }
    case 'setting': {
      if (!isHost(s, actor)) throw new Error('Host only');
      if (s.phase !== 'lobby' && action.key !== 'timer') throw new Error('Settings are locked during a mission');
      s.settings[action.key] = action.value;
      if (action.key === 'uniqueFrames' && action.value) {
        const seen = new Set();
        for (const c of s.crews) { if (c.material && seen.has(c.material)) { c.material = null; c.processing = null; c.ready = false; } else if (c.material) seen.add(c.material); }
      }
      return s;
    }
    case 'start': {
      if (!isHost(s, actor)) throw new Error('Only the host can launch');
      if (s.phase !== 'lobby') throw new Error('Already started');
      if (s.crews.length < CONFIG.minCrews) throw new Error('At least two crews are needed');
      if (!action.force && !s.crews.every(c => c.ready)) throw new Error('Every crew must be ready');
      s.crews.forEach(c => { autoConfigure(s, c, ctx.rng); c.ready = true; initCrewRuntime(c); });
      s.phase = 'play'; s.leg = 1; s.gameNo += 1; s.startedAt = ctx.now; s.endedAt = null; s.results = null;
      s.decks = {}; s.qdecks = {}; s.log = []; s.logN = 0;
      log(s, 'leg', `Leg 1: ${LEGS[0].name} — ${LEGS[0].topic}`);
      return beginTurn(s, 0, ctx);
    }
    case 'reclaim': {
      // Take over a crew whose player disconnected: the host may take any crew; a player may
      // reclaim a crew registered under their own display name (e.g. after reopening the tab).
      const c = s.crews.find(x => x.id === action.crewId);
      const me = s.players.find(p => p.id === actor);
      if (!c || !me) throw new Error('Join the room first');
      const prev = s.players.find(p => p.id === c.owner);
      if (!isHost(s, actor) && prev && prev.name !== me.name) throw new Error('Only the host can reassign another player’s crew');
      c.owner = actor;
      log(s, 'info', `${me.name} took control of ${c.name}.`);
      return s;
    }
    case 'claimHost': {
      if (!s.players.some(p => p.id === actor)) throw new Error('Join the room first');
      s.hostId = actor;
      log(s, 'info', `${s.players.find(p => p.id === actor).name} is now the host.`);
      return s;
    }
    case 'returnToLobby': {
      if (!isHost(s, actor)) throw new Error('Host only');
      resetToLobby(s);
      return s;
    }
    case 'pause': {
      if (!isHost(s, actor)) throw new Error('Host only');
      if (!s.turn || !s.turn.deadline || s.paused) return s;
      s.paused = { remaining: Math.max(0, s.turn.deadline - ctx.now) };
      s.turn.deadline = null;
      return s;
    }
    case 'resume': {
      if (!isHost(s, actor)) throw new Error('Host only');
      if (!s.turn || !s.paused) return s;
      s.turn.deadline = ctx.now + Math.max(5000, s.paused.remaining);
      s.paused = null;
      return s;
    }
    // ---- turn
    case 'ready': {
      if (s.turn.step !== 'handover') return s;
      s.turn.step = 'event';
      s.turn.deadline = s.settings.timer && !s.paused ? ctx.now + s.settings.timer * 1000 : null;
      return s;
    }
    case 'answer': {
      const t = s.turn;
      if (t.step !== 'event' || !t.q || t.answer) throw new Error('Cannot answer now');
      const Q = questionById(t.q);
      const correct = action.choice === Q.answer;
      t.answer = { choice: action.choice, correct };
      const crew = s.crews[t.crewIdx];
      crew.answered += 1;
      if (correct) crew.insight += 1;
      return s;
    }
    case 'roll': {
      if (s.turn.step !== 'event') throw new Error('Already rolled');
      resolveRoll(s, action, ctx);
      const crew = s.crews[s.turn.crewIdx];
      s.turn.step = crew.lost ? 'hangarDone' : 'hangar';
      return s;
    }
    case 'hangar': {
      if (s.turn.step !== 'hangar') throw new Error('Not at the hangar');
      resolveHangar(s, action, ctx);
      return s;
    }
    case 'end': {
      if (!['hangar', 'hangarDone', 'result'].includes(s.turn.step)) throw new Error('Finish the roll first');
      return advance(s, s.turn.crewIdx, ctx);
    }
    case 'timeout': {
      const t = s.turn;
      if (!t.deadline || ctx.now < t.deadline - 1000) throw new Error('Not timed out');
      if (t.step === 'event') {
        const card = cardById(t.card);
        const def = card.options ? (card.options.find(o => o.dc === null) || card.options.find(o => o.id === 'std') || card.options[0]).id : 'std';
        resolveRoll(s, { approach: def }, ctx, true);
      }
      return advance(s, t.crewIdx, ctx);
    }
    default:
      throw new Error(`Unknown action ${action.type}`);
  }
}

// ------------------------------------------------------------------ result summary (for logs/analytics)
export function matchSummary(s) {
  if (!s.results) return null;
  return {
    v: 1,
    mode: s.mode,
    crews: s.crews.map(c => {
      const r = s.results.rows.find(x => x.crewId === c.id);
      return {
        material: c.material, processing: c.processing, role: c.role, cargoStart: c.cargoStart,
        cargoEnd: c.cargo, integrity: c.integrity, time: +c.time.toFixed(1), lost: c.lost, lostLeg: c.lostLeg,
        lostCause: c.lostCause, insight: c.insight, answered: c.answered, repairs: c.repairs, jettisoned: c.jettisoned,
        score: r.total, rank: r.rank, breakdown: { cargo: r.cargoPts, integrity: r.integrityPts, time: r.timePts, spares: r.sparePts, complete: r.completePts, budget: r.budgetPts, insight: r.insightPts, bonus: r.bonusPts, green: r.greenPts },
        perCrateCO2: r.perCrate, history: c.history.map(h => ({ leg: h.leg, card: h.card, tier: h.tier, approach: h.approach, timedOut: h.timedOut })),
      };
    }),
    durationS: Math.round((s.results.durationMs || 0) / 1000),
    settings: { questions: s.settings.questions, timer: s.settings.timer, uniqueFrames: s.settings.uniqueFrames },
  };
}

// ALLOY ASCENT — user interface. Vanilla JS: render() rebuilds the view from state;
// all clicks go through one delegated handler (data-act attributes).
import * as E from './engine.js';
import { CONFIG, MATERIALS, MATERIAL_ORDER, ROLES, ROLE_ORDER, LEGS, CONDITIONS, TAGS, CARDS, cardById } from './data.js';
import { questionById } from './questions.js';
import { CODEX, CARGO_TEXT, SCORING, GLOSSARY, DISCUSSION, SOURCES } from './content.js';
import { TUTORIAL } from './tutorial.js';
import * as Net from './net.js';

// ------------------------------------------------------------------ utilities
const $app = document.getElementById('app');
const $overlay = document.getElementById('overlay');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (x) => `${Math.round(x * 100)}%`;
const sgn = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '±0');
const hrs = (h) => `${(+h).toFixed(1).replace(/\.0$/, '')} h`;
const rng = () => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] / 4294967296; };
const uid = (p = '') => p + Array.from(crypto.getRandomValues(new Uint8Array(6)), b => b.toString(36).padStart(2, '0')).join('').slice(0, 10);
const store = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};

// One identity per browser tab (so two tabs on one laptop are two players); kept across reloads.
function tabId() {
  try { let id = sessionStorage.getItem('aa_cid'); if (!id) { id = uid('p'); sessionStorage.setItem('aa_cid', id); } return id; } catch { return uid('p'); }
}
const S = {
  screen: 'title',          // title | host | join | room
  mode: null,               // local | online
  state: null,
  room: null,
  me: { id: tabId(), name: store.get('aa_name', '') },
  presence: [],
  netStatus: '',
  busy: false,
  ui: { sel: null, editCrew: null, codexTab: 'materials', codexMat: 'ti', tut: 0, lastSeq: null, legSeen: null, submitted: {}, joinCode: '', hostErr: '', joinErr: '', theme: store.get('aa_theme', 'dark') },
  overlay: null,            // { kind, ... }
  timeoutSent: {},
};
document.documentElement.dataset.theme = S.ui.theme;

function toast(msg, kind = '') {
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = msg;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.classList.add('out'), 3200);
  setTimeout(() => el.remove(), 3800);
}

const now = () => (S.mode === 'online' ? Net.serverNow() : Date.now());
const actor = () => (S.mode === 'local' ? E.LOCAL_ACTOR : S.me.id);
const isHost = () => S.mode === 'local' || S.state?.hostId === S.me.id;
const canControl = (crew) => !!crew && (S.mode === 'local' || crew.owner === S.me.id);
const shareLink = (code) => `${location.origin}${location.pathname}?room=${code}`;

// ------------------------------------------------------------------ dispatch
async function dispatch(action, { quiet = false } = {}) {
  const ctx = () => ({ now: now(), rng, actor: actor() });
  if (S.mode === 'local') {
    try { S.state = E.act(S.state, action, ctx()); store.set('aa_local', S.state); }
    catch (e) { if (!quiet && e.message !== 'stale') toast(e.message, 'bad'); }
    afterState();
    return;
  }
  if (!S.room) return;
  S.busy = true; renderBusy();
  try { await S.room.dispatch(st => E.act(st, action, ctx())); }
  catch (e) { if (!quiet && e.message !== 'stale') toast(e.message, 'bad'); }
  finally { S.busy = false; renderBusy(); }
}

function onRemoteState(state) {
  S.state = state;
  afterState();
}

function afterState() {
  const s = S.state;
  if (!s) return render();
  // dice animation for new rolls (including hangar repairs)
  const t = s.turn;
  const seq = Math.max(t?.roll?.seq || 0, t?.hangar?.seq || 0);
  if (S.ui.lastSeq === null) S.ui.lastSeq = s.rollSeq || 0;
  else if (seq && seq > S.ui.lastSeq) {
    S.ui.lastSeq = seq;
    const r = t.hangar?.seq === seq ? { d: t.hangar.d, total: t.hangar.mod, dc: t.hangar.dc, tier: t.hangar.success ? 'success' : 'fail', label: t.hangar.label, repair: true } : t.roll;
    if (r && r.d) showDice(r, s.crews[t.crewIdx]);
  }
  if (s.rollSeq > S.ui.lastSeq && !(seq && seq === s.rollSeq)) S.ui.lastSeq = s.rollSeq; // rolls finished before we looked
  // leg intro
  if (s.phase === 'play' && s.leg && S.ui.legSeen !== `${s.gameNo}:${s.leg}`) {
    S.ui.legSeen = `${s.gameNo}:${s.leg}`;
    if (!S.overlay || S.overlay.kind === 'leg') S.overlay = { kind: 'leg', leg: s.leg };
  }
  if (s.phase !== 'play' && S.overlay?.kind === 'leg') S.overlay = null;
  // results submission (once per finished game, by the host device)
  if (s.phase === 'ended' && s.settings.shareResults && isHost()) {
    const key = `aa_sub_${s.code || 'local'}_${s.gameNo}_${s.startedAt}`;
    if (!S.ui.submitted[key] && !store.get(key)) {
      S.ui.submitted[key] = true; store.set(key, 1);
      const sum = E.matchSummary(s);
      if (sum) Net.submitResult(sum);
    }
  }
  const view = s.phase === 'play' && t ? `${t.seq}:${t.step === 'event' || t.step === 'handover' ? t.step : 'result'}` : s.phase;
  const changed = view !== S.ui.view;
  S.ui.view = view;
  render();
  if (changed) {
    if (view.endsWith(':result')) document.querySelector('.result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ------------------------------------------------------------------ small components
function matBadge(id, size = '') {
  const M = MATERIALS[id];
  if (!M) return `<span class="hexb ${size} empty">?</span>`;
  return `<span class="hexb ${size}" style="--mc:${M.color}" title="${esc(M.name)}">${esc(M.symbol)}</span>`;
}
function roleIcon(id) { const R = ROLES[id]; return R ? `<span class="role-ic" title="${esc(R.name)}">${R.icon}</span>` : ''; }
function bars(r) {
  const rows = [['Lightness', r.lightness], ['Strength/kg', r.strength], ['Torsion/kg', r.torsion], ['Fatigue', r.fatigue], ['Heat', r.heat], ['Space env.', r.space], ['Corrosion', r.corrosion], ['Repairability', r.repair], ['Toughness', r.toughness], ['Low cost', r.cheapness]];
  return `<div class="bars">${rows.map(([k, v]) => `<div class="bar-row"><span>${k}</span><i>${'<b></b>'.repeat(v)}${'<b class="off"></b>'.repeat(5 - v)}</i></div>`).join('')}</div>`;
}
function oddsBar(o, compact = false) {
  return `<div class="odds ${compact ? 'compact' : ''}"><div class="ob s" style="flex:${o.success}"></div><div class="ob p" style="flex:${o.partial}"></div><div class="ob f" style="flex:${o.fail}"></div></div>
  <div class="odds-l"><span class="s">✓ ${pct(o.success)}</span><span class="p">~ ${pct(o.partial)}</span><span class="f">✗ ${pct(o.fail)}</span></div>`;
}
function tagChips(tags) { return tags.filter(t => t !== 'luck').map(t => `<span class="tag">${TAGS[t].icon} ${TAGS[t].name}</span>`).join(''); }
function condChips(crew) {
  if (!crew.conditions?.length) return '';
  const hidden = crew.conditions.filter(c => c.hidden).length;
  const shown = crew.conditions.filter(c => !c.hidden).map(c => {
    const C = CONDITIONS[c.id];
    const tip = `${C.name}${c.stage ? ` — stage ${c.stage} of ${E.crewStats(crew).crackTol}` : ''}: ${C.desc}`;
    return `<span class="cond ${C.repairable ? '' : 'perm'}" title="${esc(tip)}">${C.icon} ${esc(C.name)}${c.stage ? ` ${c.stage}/${E.crewStats(crew).crackTol}` : ''}</span>`;
  });
  if (hidden) shown.push(`<span class="cond hidden" title="Something may be damaged — inspect at a hangar stop to find out.">⚠ Suspected damage</span>`);
  return `<div class="conds">${shown.join('')}</div>`;
}
const d20svg = (n = '', cls = '') => `<svg class="d20 ${cls}" viewBox="0 0 100 100" aria-hidden="true"><polygon class="d20-o" points="50,3 90.7,26.5 90.7,73.5 50,97 9.3,73.5 9.3,26.5"/><polygon class="d20-f" points="50,22 74,66 26,66"/><path class="d20-l" d="M50,3 L50,22 M90.7,26.5 L50,22 M9.3,26.5 L50,22 M90.7,26.5 L74,66 M90.7,73.5 L74,66 M50,97 L74,66 M50,97 L26,66 M9.3,73.5 L26,66 M9.3,26.5 L26,66"/><text x="50" y="57" class="d20-n">${n}</text></svg>`;

// ------------------------------------------------------------------ screens
function render() {
  const s = S.state;
  let html = '';
  if (S.screen === 'title') html = titleScreen();
  else if (S.screen === 'host') html = hostScreen();
  else if (S.screen === 'join') html = joinScreen();
  else if (S.screen === 'room' && s) {
    if (s.phase === 'lobby') html = lobbyScreen(s);
    else if (s.phase === 'play') html = gameScreen(s);
    else html = resultsScreen(s);
  } else html = titleScreen();
  const ae = document.activeElement;
  const focus = ae?.id && $app.contains(ae) ? { id: ae.id, a: ae.selectionStart, b: ae.selectionEnd, v: ae.tagName === 'INPUT' && ae.type === 'text' ? ae.value : null } : null;
  $app.innerHTML = html;
  if (focus) {
    const el = document.getElementById(focus.id);
    if (el) {
      if (focus.v !== null && el.tagName === 'INPUT') el.value = focus.v; // keep what the user is typing
      el.focus();
      try { if (focus.a !== null && focus.a !== undefined) el.setSelectionRange(focus.a, focus.b); } catch { /* not a text input */ }
    }
  }
  renderOverlay();
  tick();
  if (S.screen === 'room' && s?.phase === 'lobby' && S.mode === 'online') drawQR(s.code);
}

function renderBusy() { document.body.classList.toggle('busy', S.busy); }

function topbar(extra = '') {
  return `<header class="topbar">
    <button class="brand" data-act="home" title="Back to title">${d20svg('', 'tiny')}<span>ALLOY <em>ASCENT</em></span></button>
    <div class="tb-mid">${extra}</div>
    <nav class="tb-nav">
      <button class="ghost" data-act="codex">Codex</button>
      <button class="ghost" data-act="tutorial">How to play</button>
      <button class="ghost icon" data-act="theme" title="Toggle projector (light) mode">${S.ui.theme === 'dark' ? '☀' : '☾'}</button>
    </nav>
  </header>`;
}

function titleScreen() {
  const saved = store.get('aa_local');
  const canResume = saved && saved.phase && saved.mode === 'local';
  return `<div class="title-wrap">
    ${topbar()}
    <main class="title">
      <section class="hero">
        <div class="hero-dice">${d20svg('20', 'hero-d')}</div>
        <p class="eyebrow">A metallurgical tabletop adventure · 2–6 crews · 5–15 minutes</p>
        <h1>ALLOY <em>ASCENT</em></h1>
        <p class="sub">Six legs to orbit. Six frames to choose from — titanium, aluminium, stainless steel, carbon composite, magnesium, chromoly. Your metallurgy decides your odds.</p>
        <div class="cta">
          <button class="btn primary big" data-act="go-host">Host an online room</button>
          <button class="btn big" data-act="go-join">Join with a code</button>
          <button class="btn big" data-act="local-new">Pass-and-play on one screen</button>
          ${canResume ? `<button class="btn ghost" data-act="local-resume">Resume saved pass-and-play game</button>` : ''}
        </div>
        <div class="cta small">
          <button class="link" data-act="tutorial">▶ Tutorial — learn in 3 minutes</button>
          <button class="link" data-act="codex">📖 Materials Codex</button>
          <button class="link" data-act="playtest">📊 Playtest data</button>
        </div>
      </section>
      <section class="route-teaser">${routeSVG(null)}</section>
      <section class="mat-strip">${MATERIAL_ORDER.map(k => `<button class="mat-mini" data-act="codex-mat" data-mat="${k}" style="--mc:${MATERIALS[k].color}">${matBadge(k)}<span>${esc(MATERIALS[k].short)}</span></button>`).join('')}</section>
    </main>
    <footer class="foot">Second-year metallurgical engineering design project · prototype · <button class="link" data-act="about">About & design rationale</button></footer>
  </div>`;
}

function hostScreen() {
  return `${topbar()}<main class="narrow">
    <h2 class="h-display">Host an online room</h2>
    <p class="muted">You will get a room code, a link and a QR code to share. Everyone plays on their own device; each crew gets a one-minute control window per turn.</p>
    <label class="field"><span>Your name</span><input id="host-name" maxlength="24" value="${esc(S.me.name)}" placeholder="e.g. Josh" autocomplete="off"></label>
    ${S.ui.hostErr ? `<p class="err">${esc(S.ui.hostErr)}</p>` : ''}
    <div class="row"><button class="btn primary" data-act="host-create">Create room</button><button class="btn ghost" data-act="home">Back</button></div>
    <p class="muted small">Tip: on a projector, host the room, then remove your own crew to use the big screen as a spectator board.</p>
  </main>`;
}

function joinScreen() {
  return `${topbar()}<main class="narrow">
    <h2 class="h-display">Join a room</h2>
    <label class="field"><span>Room code</span><input id="join-code" class="code-in" maxlength="8" value="${esc(S.ui.joinCode)}" placeholder="ABCDE" autocomplete="off" autocapitalize="characters"></label>
    <label class="field"><span>Your name</span><input id="join-name" maxlength="24" value="${esc(S.me.name)}" placeholder="e.g. Priya" autocomplete="off"></label>
    ${S.ui.joinErr ? `<p class="err">${esc(S.ui.joinErr)}</p>` : ''}
    <div class="row"><button class="btn primary" data-act="join-go">Join</button><button class="btn ghost" data-act="join-spectate">Watch as spectator</button><button class="btn ghost" data-act="home">Back</button></div>
  </main>`;
}

// ------------------------------------------------------------------ lobby
function lobbyScreen(s) {
  const host = isHost();
  const online = S.mode === 'online';
  const myCrews = s.crews.filter(canControl);
  const allReady = s.crews.length >= 2 && s.crews.every(c => c.ready);
  const header = online ? `<div class="roomcode"><span class="muted">Room</span> <b>${esc(s.code)}</b></div>` : `<div class="roomcode"><b>Pass-and-play</b></div>`;
  if (!S.ui.editCrew || !s.crews.some(c => c.id === S.ui.editCrew && canControl(c))) S.ui.editCrew = myCrews[0]?.id || null;
  return `${topbar(header)}
  <main class="lobby">
    <section class="lobby-side">
      ${online ? `<div class="panel invite">
        <h3>Invite crews</h3>
        <div class="invite-grid"><div id="qr" class="qr"></div>
        <div><div class="big-code">${esc(s.code)}</div>
        <button class="btn small" data-act="copy-link">Copy invite link</button>
        <p class="muted small break">${esc(shareLink(s.code))}</p></div></div>
      </div>
      <div class="panel"><h3>People here</h3><ul class="people">${s.players.map(p => `<li><i class="dot ${S.presence.includes(p.id) ? 'on' : ''}"></i>${esc(p.name)}${p.id === s.hostId ? ' <span class="pill">host</span>' : ''}${p.id === S.me.id ? ' <span class="pill">you</span>' : ''}</li>`).join('')}</ul>
        ${!S.presence.includes(s.hostId) && !host && S.presence.length ? `<button class="btn small ghost" data-act="claim-host">Host left? Take over as host</button>` : ''}</div>` : ''}
      <div class="panel settings">
        <h3>Mission settings ${host ? '' : '<span class="muted small">(host)</span>'}</h3>
        <label class="tog"><input type="checkbox" data-set="uniqueFrames" ${s.settings.uniqueFrames ? 'checked' : ''} ${host ? '' : 'disabled'}> One crew per frame material</label>
        <label class="tog"><input type="checkbox" data-set="questions" ${s.settings.questions ? 'checked' : ''} ${host ? '' : 'disabled'}> Briefing questions (+1 for a right answer)</label>
        <label class="tog"><input type="checkbox" data-set="shareResults" ${s.settings.shareResults ? 'checked' : ''} ${host ? '' : 'disabled'}> Share anonymous results for playtest data</label>
        <label class="sel">Control window per crew
          <select data-set="timer" ${host ? '' : 'disabled'}>${[[0, 'Off (untimed)'], [45, '45 s'], [60, '60 s (standard)'], [90, '90 s']].map(([v, l]) => `<option value="${v}" ${+s.settings.timer === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      </div>
      <div class="panel launch">
        ${host ? `<button class="btn primary big wide" data-act="start" ${s.crews.length >= 2 ? '' : 'disabled'}>${allReady ? 'Launch mission' : 'Launch (auto-fill unready crews)'}</button>
        <p class="muted small">${s.crews.length < 2 ? 'Need at least 2 crews.' : allReady ? 'All crews ready.' : `${s.crews.filter(c => !c.ready).length} crew(s) not ready — launching fills in their choices.`}</p>` : `<p class="muted">Waiting for the host to launch…</p>`}
        <button class="btn ghost small" data-act="leave">${online ? 'Leave room' : 'Quit to title'}</button>
      </div>
    </section>
    <section class="lobby-main">
      <div class="crew-tabs">
        ${s.crews.map(c => `<button class="crew-tab ${c.id === S.ui.editCrew ? 'on' : ''} ${canControl(c) ? 'mine' : ''}" data-act="edit-crew" data-crew="${c.id}" style="--mc:${MATERIALS[c.material]?.color || 'var(--line)'}">
          ${matBadge(c.material, 'sm')}<span>${esc(c.name)}</span>${c.role ? roleIcon(c.role) : ''}${c.ready ? '<i class="ready">✓</i>' : ''}</button>`).join('')}
        ${s.crews.length < CONFIG.maxCrews ? `<button class="crew-tab add" data-act="add-crew">＋ ${online ? 'Add a crew on this device' : 'Add crew'}</button>` : ''}
      </div>
      ${S.ui.editCrew ? crewEditor(s, s.crews.find(c => c.id === S.ui.editCrew)) : `<div class="panel empty-state"><p>${online ? 'You are spectating. Add a crew on this device to play, or watch the crews configure their frames.' : 'Add a crew to begin.'}</p></div>`}
      ${s.crews.filter(c => c.id !== S.ui.editCrew).length ? `<div class="crew-summaries">${s.crews.filter(c => c.id !== S.ui.editCrew).map(c => crewSummary(c)).join('')}</div>` : ''}
    </section>
  </main>`;
}

function crewSummary(c) {
  const M = MATERIALS[c.material];
  const P = M ? E.procOf(c) : null;
  return `<div class="panel crew-sum" style="--mc:${M?.color || 'var(--line)'}">
    ${matBadge(c.material)}<div><b>${esc(c.name)}</b> ${c.ready ? '<span class="pill ok">ready</span>' : '<span class="pill">choosing…</span>'}
    <div class="muted small">${M ? `${esc(M.short)} · ${esc(P.name)}` : 'No frame yet'}${c.role ? ` · ${esc(ROLES[c.role].name)}` : ''}${c.cargo !== null && c.cargo !== undefined && M ? ` · ${c.cargo} crates` : ''}</div>
    ${reclaimBtn(S.state, c)}</div>
  </div>`;
}

// Offer to take over a crew whose player is no longer connected.
function reclaimBtn(s, c) {
  if (S.mode !== 'online' || c.owner === S.me.id || S.presence.includes(c.owner) || !S.presence.length) return '';
  const owner = s.players.find(p => p.id === c.owner);
  if (!isHost() && owner && owner.name !== S.me.name) return '';
  return `<button class="btn small ghost" data-act="reclaim" data-crew="${c.id}" title="${esc(owner ? owner.name : 'Player')} is offline">Take control (player offline)</button>`;
}

function crewEditor(s, c) {
  if (!c) return '';
  const st = c.material ? E.crewStats(c) : null;
  const M = MATERIALS[c.material];
  return `<div class="panel editor" style="--mc:${M?.color || 'var(--brass)'}">
    <div class="ed-head">
      <input id="crew-name-${c.id}" class="crew-name-in" data-crewname="${c.id}" maxlength="24" value="${esc(c.name)}" aria-label="Crew name">
      <button class="btn ghost small" data-act="remove-crew" data-crew="${c.id}">Remove crew</button>
    </div>
    <h4 class="step"><span>1</span> Choose your frame material <button class="link small" data-act="codex" data-tab="compare">compare all →</button></h4>
    <div class="mat-grid">${MATERIAL_ORDER.map(k => {
      const X = MATERIALS[k]; const taken = E.materialTaken(s, k, c.id);
      return `<button class="mat-card ${c.material === k ? 'on' : ''}" data-act="pick-mat" data-crew="${c.id}" data-mat="${k}" ${taken ? 'disabled' : ''} style="--mc:${X.color}">
        <div class="mc-head">${matBadge(k)}<div><b>${esc(X.short)}</b><small>${esc(X.family)}</small></div></div>
        <p>${esc(X.tagline)}</p>${bars(X.ratings)}
        ${taken ? '<span class="taken">taken</span>' : ''}</button>`;
    }).join('')}</div>
    ${M ? `<h4 class="step"><span>2</span> Processing route → microstructure</h4>
    <div class="proc-grid">${M.processing.map(p => `<button class="proc ${c.processing === p.id ? 'on' : ''}" data-act="pick-proc" data-crew="${c.id}" data-proc="${p.id}">
      <b>${esc(p.name)}</b><em>${esc(p.micro)}</em><p>${esc(p.desc)}</p>
      <div class="fx">${procEffects(p)}</div></button>`).join('')}</div>` : ''}
    <h4 class="step"><span>3</span> Specialist role</h4>
    <div class="role-grid">${ROLE_ORDER.map(r => { const R = ROLES[r]; return `<button class="role ${c.role === r ? 'on' : ''}" data-act="pick-role" data-crew="${c.id}" data-role="${r}">
      <span class="role-big">${R.icon}</span><b>${esc(R.name)}</b><small>Home: ${esc(R.home)}</small><p>${esc(R.summary)}</p><p class="ab"><i>Ability:</i> ${esc(R.ability.name)} — ${esc(R.ability.desc)}</p></button>`; }).join('')}</div>
    ${M ? `<h4 class="step"><span>4</span> Load cargo <button class="link small" data-act="codex" data-tab="cargo">what does cargo do? →</button></h4>
    <div class="cargo-row">
      <div class="stepper"><button class="btn small" data-act="cargo" data-crew="${c.id}" data-d="-1" ${c.cargo <= 0 ? 'disabled' : ''}>−</button>
      <div class="crates">${Array.from({ length: st.capacity }, (_, i) => `<span class="crate ${i < c.cargo ? 'full' : ''}"></span>`).join('')}</div>
      <button class="btn small" data-act="cargo" data-crew="${c.id}" data-d="1" ${c.cargo >= st.capacity ? 'disabled' : ''}>＋</button></div>
      <div class="cargo-facts"><b>${c.cargo}/${st.capacity} crates</b> → worth ${c.cargo * CONFIG.crateValue} pts if delivered · Load penalty <b>${sgn(-E.loadPenalty(c.cargo))}</b> on strength & fatigue checks · ${hrs(E.legHours(c))} per leg</div>
    </div>
    <div class="derived">
      ${[['Integrity', st.maxIntegrity], ['Hours / leg', hrs(E.legHours(c))], ['Spares', st.spares], ['Repair mod', sgn(st.repair)], ['Critical crack', `stage ${st.crackTol}`], ['Budget pts', M.stats.budget]].map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}
    </div>` : ''}
    <div class="ed-foot">
      <button class="btn ${c.ready ? '' : 'primary'} big" data-act="ready" data-crew="${c.id}" ${E.crewConfigured(c) ? '' : 'disabled'}>${c.ready ? '✓ Ready — click to edit' : 'Ready for launch'}</button>
    </div>
  </div>`;
}

function procEffects(p) {
  const out = [];
  for (const [k, v] of Object.entries(p.mods || {})) out.push(`<span class="${v > 0 ? 'up' : 'down'}">${sgn(v)} ${TAGS[k].name}</span>`);
  const e = p.effects || {};
  if (e.integrity) out.push(`<span class="${e.integrity > 0 ? 'up' : 'down'}">${sgn(e.integrity)} integrity</span>`);
  if (e.crackTol) out.push(`<span class="up">${sgn(e.crackTol)} crack tolerance</span>`);
  if (e.repair) out.push(`<span class="${e.repair > 0 ? 'up' : 'down'}">${sgn(e.repair)} repair</span>`);
  return out.join('') || '<span class="neutral">Reference condition</span>';
}

// ------------------------------------------------------------------ game
function gameScreen(s) {
  const t = s.turn;
  const leg = LEGS[s.leg - 1];
  const crew = t ? s.crews[t.crewIdx] : null;
  const mid = `<div class="legbar"><span class="leg-n">Leg ${s.leg}/6</span><b>${esc(leg.name)}</b><span class="muted">${esc(leg.topic)}</span></div>
    <div class="timer" id="timer"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" class="tr-bg"/><circle cx="22" cy="22" r="18" class="tr-fg" id="timer-ring"/></svg><span id="timer-text">—</span></div>
    ${isHost() && s.settings.timer ? `<button class="ghost small" data-act="${s.paused ? 'resume' : 'pause'}">${s.paused ? '▶ Resume' : '❚❚ Pause'}</button>` : ''}
    ${isHost() ? `<button class="ghost small" data-act="to-lobby">Lobby</button>` : ''}
    ${S.mode === 'online' ? `<span class="net ${S.room?.status === 'SUBSCRIBED' ? 'ok' : ''}" title="Connection">${esc(s.code)}</span>` : ''}`;
  return `${topbar(mid)}
  <main class="game">
    <aside class="g-left">
      <div class="panel map-panel">${routeSVG(s)}</div>
      <div class="roster">${s.crews.map((c, i) => rosterCard(s, c, i)).join('')}</div>
    </aside>
    <section class="g-main">${t ? turnPanel(s, t, crew) : ''}</section>
    <aside class="g-right"><div class="panel log"><h3>Mission log</h3><ol>${[...s.log].reverse().slice(0, 40).map(l => `<li class="lg ${l.kind}">${esc(l.text)}</li>`).join('')}</ol></div></aside>
  </main>`;
}

function rosterCard(s, c, i) {
  const st = E.crewStats(c);
  const active = s.turn?.crewIdx === i;
  const M = MATERIALS[c.material];
  return `<div class="rc ${active ? 'active' : ''} ${c.lost ? 'lost' : ''}" style="--mc:${M.color}">
    <div class="rc-top">${matBadge(c.material, 'sm')}<b>${esc(c.name)}</b>${roleIcon(c.role)}${canControl(c) && S.mode === 'online' ? '<span class="pill">you</span>' : ''}</div>
    ${reclaimBtn(s, c)}
    <div class="rc-sub">${esc(M.short)} · ${esc(E.procOf(c).name)}</div>
    ${c.lost ? `<div class="lost-tag">Lost on leg ${c.lostLeg} — ${esc(c.lostCause)}</div>` : `
    <div class="hp"><i style="width:${(100 * c.integrity / st.maxIntegrity).toFixed(0)}%"></i><span>${c.integrity}/${st.maxIntegrity}</span></div>
    <div class="rc-stats"><span title="Cargo crates">▣ ${c.cargo}</span><span title="Spare parts">⚙ ${c.spares}</span><span title="Hours flown">◷ ${hrs(c.time)}</span><span title="Correct briefing answers">✎ ${c.insight}</span></div>
    ${condChips(c)}`}
  </div>`;
}

function turnPanel(s, t, crew) {
  const mine = canControl(crew);
  const M = MATERIALS[crew.material];
  if (t.step === 'handover') return handoverPanel(s, t, crew);
  const card = cardById(t.card);
  if (!S.ui.sel || S.ui.sel.seq !== t.seq) S.ui.sel = { seq: t.seq, approach: card.options ? card.options[0].id : 'std', jettison: false, ability: false };
  const head = `<div class="turn-head" style="--mc:${M.color}">${matBadge(crew.material, 'lg')}
    <div><div class="th-name">${esc(crew.name)} ${mine ? '<span class="pill hot">your turn</span>' : '<span class="pill">watching</span>'}</div>
    <div class="muted">${esc(M.short)} · ${esc(E.procOf(crew).name)} · ${ROLES[crew.role].icon} ${esc(ROLES[crew.role].name)}</div></div></div>`;
  const notes = t.startNotes?.length ? `<div class="start-notes">${t.startNotes.map(n => `<div class="sn ${n.t}">${esc(n.text)}</div>`).join('')}</div>` : '';
  const ev = `<article class="event" style="--mc:${M.color}">
    <div class="ev-tags"><span class="ev-leg">Leg ${t.leg} · ${esc(LEGS[t.leg - 1].topic)}</span>${tagChips(card.tags)}</div>
    <h2>${esc(card.title)}</h2><p>${esc(card.text)}</p></article>`;
  if (t.step === 'event') return `<div class="turn">${head}${notes}${ev}${briefing(t, crew, mine)}${choices(s, t, crew, card, mine)}</div>`;
  return `<div class="turn">${head}${notes}${ev}${resultBlock(s, t, crew, card)}${hangarBlock(s, t, crew, mine)}</div>`;
}

function handoverPanel(s, t, crew) {
  const M = MATERIALS[crew.material];
  const recent = s.log.slice(-6).reverse();
  return `<div class="handover" style="--mc:${M.color}">
    <p class="eyebrow">Pass the device to</p>
    <div class="ho-crew">${matBadge(crew.material, 'xl')}<h2>${esc(crew.name)}</h2></div>
    <p class="muted">${esc(M.short)} · ${esc(E.procOf(crew).name)} · ${ROLES[crew.role].icon} ${esc(ROLES[crew.role].name)}</p>
    <p>Leg ${t.leg}: <b>${esc(LEGS[t.leg - 1].name)}</b> — ${esc(LEGS[t.leg - 1].topic)}</p>
    ${t.startNotes?.length ? `<div class="start-notes">${t.startNotes.map(n => `<div class="sn ${n.t}">${esc(n.text)}</div>`).join('')}</div>` : ''}
    <button class="btn primary huge" data-act="ready-turn" data-seq="${t.seq}">I’m ready — start our ${s.settings.timer ? `${s.settings.timer}-second` : ''} turn</button>
    <div class="ho-recent"><h4>Since your last turn</h4><ol>${recent.map(l => `<li class="lg ${l.kind}">${esc(l.text)}</li>`).join('')}</ol></div>
  </div>`;
}

function briefing(t, crew, mine) {
  if (!t.q) return '';
  const Q = questionById(t.q);
  const leg6 = t.leg === 6;
  const bonus = leg6 ? CONFIG.specialistQuestionBonus : (ROLES[crew.role].briefingBonus || CONFIG.briefingBonus);
  if (!t.answer) {
    return `<section class="brief"><div class="br-h">${leg6 ? 'Specialist question' : 'Engineering briefing'} <span class="pill">${sgn(bonus)} if correct</span></div>
      <p class="q">${esc(Q.q)}</p><div class="q-opts">${Q.options.map((o, i) => `<button class="qo" data-act="answer" data-i="${i}" data-seq="${t.seq}" ${mine ? '' : 'disabled'}>${String.fromCharCode(65 + i)}. ${esc(o)}</button>`).join('')}</div></section>`;
  }
  return `<section class="brief done ${t.answer.correct ? 'right' : 'wrong'}"><div class="br-h">${t.answer.correct ? `✓ Correct — ${sgn(bonus)} on this roll` : '✗ Not quite'}</div>
    <p class="q">${esc(Q.q)}</p><p class="ans"><b>${esc(Q.options[Q.answer])}</b> — ${esc(Q.explain)}</p></section>`;
}

function choices(s, t, crew, card, mine) {
  const sel = S.ui.sel;
  const list = E.approachesFor(card, crew);
  const R = ROLES[crew.role];
  const showAbility = E.abilityApplies(crew, card);
  const items = list.map(a => {
    const avail = !a.special || E.specialAvailable(a, crew);
    const chk = E.computeCheck(s, crew, t.card, a.id, { jettison: sel.jettison, ability: sel.ability });
    const meta = a.abs ? (a.dc === null ? 'No roll' : `DC ${a.dc}`) : `DC ${chk.dc}`;
    const time = a.time ? ` · ${a.time > 0 ? '+' : '−'}${Math.abs(a.time)} h` : '';
    const costs = a.cost?.spare ? ' · costs 1 spare' : a.cost?.crate ? ' · dump 1 crate' : '';
    return `<button class="appr ${sel.approach === a.id ? 'on' : ''} ${avail ? '' : 'locked'} ${a.special ? 'special' : ''}" data-act="sel-appr" data-id="${a.id}" ${avail && mine ? '' : 'disabled'}>
      <div class="ap-h"><b>${a.special ? '★ ' : ''}${esc(a.label)}</b><span class="meta">${meta}${time}${costs}</span></div>
      ${a.desc ? `<p>${esc(a.desc)}</p>` : ''}
      ${!avail ? `<p class="lock">🔒 ${esc(a.locked || 'Not available to your crew.')}</p>` : oddsBar(chk.odds, true)}
      ${a.fx && !a.special ? `<p class="fxline">${fxSummary(a.fx)}</p>` : ''}
    </button>`;
  }).join('');
  // if a special is listed but locked for this material, still show it (educational)
  const chk = E.computeCheck(s, crew, t.card, sel.approach, { jettison: sel.jettison, ability: sel.ability });
  const toggles = `<div class="toggles">
    ${crew.cargo > 0 && !chk.appr.cost?.crate ? `<label class="tog"><input type="checkbox" data-act="sel-jet" ${sel.jettison ? 'checked' : ''} ${mine ? '' : 'disabled'}> Jettison a crate first (${sgn(R.jettison || CONFIG.jettisonBonus)}, lose its points)</label>` : ''}
    ${showAbility ? `<label class="tog"><input type="checkbox" data-act="sel-ab" ${sel.ability ? 'checked' : ''} ${mine ? '' : 'disabled'}> Use ${esc(R.ability.name)} (once per game): ${esc(R.ability.desc)}</label>` : ''}
  </div>`;
  const parts = chk.auto ? '<p class="muted">No roll needed.</p>' : `<ul class="mods">${chk.parts.map(p => `<li class="m-${p.kind}"><span class="mv ${p.value > 0 ? 'up' : p.value < 0 ? 'down' : ''}">${sgn(p.value)}</span><span><b>${esc(p.label)}</b>${p.why ? ` <small>${esc(p.why)}</small>` : ''}</span></li>`).join('') || '<li class="muted">No modifiers.</li>'}</ul>
    <div class="need">Roll d20 ${sgn(chk.total)} — need <b>${Math.max(2, chk.dc - chk.total)}+</b> to succeed (DC ${chk.dc}); ${Math.max(2, chk.dc - 5 - chk.total)}+ for a partial.</div>`;
  return `<section class="choose"><h3>Choose your approach</h3><div class="apprs">${items}</div>${toggles}
    <div class="checkbox"><h4>Your odds</h4>${parts}${chk.auto ? '' : oddsBar(chk.odds)}</div>
    ${mine ? `<button class="btn primary huge roll-btn" data-act="roll" data-seq="${t.seq}">${chk.auto ? 'Confirm choice' : `${d20svg('', 'tiny')} Roll the d20`}</button>` : `<p class="waiting">Waiting for ${esc(crew.name)} to decide…</p>`}
  </section>`;
}

function fxSummary(fx) {
  const word = (list) => (list || []).map(e => e.dmg ? `−${e.dmg} integrity` : e.time ? `${e.time > 0 ? '+' : '−'}${Math.abs(e.time)} h` : e.spare ? `+${e.spare} spare` : e.pts ? `+${e.pts} pts` : e.crate ? '−1 crate' : '').filter(Boolean).join(', ') || 'no effect';
  if (fx.auto) return `Result: ${word(fx.auto)}`;
  return `✓ ${word(fx.success)} · ~ ${word(fx.partial)} · ✗ ${word(fx.fail)}`;
}

function resultBlock(s, t, crew, card) {
  const r = t.roll;
  if (!r) return '';
  const tierName = { success: 'Success', partial: 'Partial success', fail: 'Failure', auto: 'Decision made' }[r.tier];
  return `<section class="result tier-${r.tier}">
    <div class="res-top">${r.d ? d20svg(r.d, `res-d ${r.d === 20 ? 'crit' : r.d === 1 ? 'fumble' : ''}`) : ''}
      <div><div class="res-tier">${tierName}${r.timedOut ? ' <span class="pill">autopilot — time ran out</span>' : ''}</div>
      ${r.d ? `<div class="res-math">${r.d}${r.d2 ? ` (reroll ${r.d2})` : ''} ${sgn(r.total)} = <b>${(r.d2 ? Math.max(r.d, r.d2) : r.d) + r.total}</b> vs DC ${r.dc}${r.d === 20 ? ' · natural 20!' : r.d === 1 ? ' · natural 1' : ''}</div>` : ''}
      <div class="muted small">${esc(r.approachLabel)}${r.jettison ? ' · jettisoned a crate' : ''}${r.ability ? ' · ability used' : ''}</div></div></div>
    <p class="res-text">${esc(r.text)}</p>
    <ul class="notes">${r.notes.map(n => `<li class="n-${n.t}">${esc(n.text)}</li>`).join('')}</ul>
    ${card.insight ? `<div class="insight"><b>🔬 Metallurgy note</b><p>${esc(card.insight)}</p></div>` : ''}
  </section>`;
}

function hangarBlock(s, t, crew, mine) {
  if (crew.lost) return `<section class="hangar lost"><h3>Craft lost</h3><p>${esc(crew.lostCause)}. The crew ejected safely — they keep any insight and bonus points.</p>${mine ? `<button class="btn primary big" data-act="end" data-seq="${t.seq}">End turn</button>` : ''}</section>`;
  if (t.step === 'hangarDone') {
    const h = t.hangar;
    return `<section class="hangar"><h3>Hangar stop</h3>
      ${h ? `<p class="${h.success ? 'good' : 'bad'}">${esc(h.label)}: ${h.success ? 'repaired ✓' : 'repair failed — spare used ✗'}${h.d ? ` (rolled ${h.d}${sgn(h.mod)} vs ${h.dc})` : ''}</p>` : ''}
      ${mine ? `<button class="btn primary big" data-act="end" data-seq="${t.seq}">End turn ▶</button>` : `<p class="waiting">Waiting for ${esc(crew.name)}…</p>`}</section>`;
  }
  const opts = E.hangarOptions(s, crew);
  const insp = t.hangar?.kind === 'inspect' ? `<p class="${t.hangar.found.length ? 'bad' : 'good'}">Inspection: ${t.hangar.found.length ? t.hangar.found.map(f => CONDITIONS[f.id].name + (f.stage ? ` (stage ${f.stage})` : '')).join(', ') : 'no hidden damage found'}.</p>` : '';
  const items = opts.map(o => {
    let odds = '';
    if (o.dc) { const p = Math.min(0.95, Math.max(0.05, (21 - (o.dc.dc - o.dc.mod)) / 20)); odds = ` · ${pct(p)} chance (need ${Math.max(2, o.dc.dc - o.dc.mod)}+)`; }
    return `<button class="hopt" data-act="hangar" data-opt="${o.id}" data-seq="${t.seq}" ${mine ? '' : 'disabled'}><b>${esc(o.label)}</b><small>${esc(o.desc)} +${o.time} h${odds}</small></button>`;
  }).join('');
  return `<section class="hangar"><h3>Hangar stop <span class="muted small">optional · spares left: ${crew.spares}</span></h3>${insp}
    ${items ? `<div class="hopts">${items}</div>` : '<p class="muted">Nothing to repair (or no spares).</p>'}
    ${mine ? `<button class="btn primary big" data-act="end" data-seq="${t.seq}">Continue to next crew ▶</button>` : `<p class="waiting">Waiting for ${esc(crew.name)}…</p>`}</section>`;
}

// ------------------------------------------------------------------ route map
function routeSVG(s) {
  const W = 360, H = 250;
  const pts = [[30, 225], [90, 190], [150, 165], [205, 130], [255, 95], [300, 60], [335, 28]];
  const names = ['Ironhold', ...LEGS.map(l => l.name)];
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  const cur = s?.leg || 0;
  let tokens = '';
  if (s && s.crews) {
    s.crews.forEach((c, i) => {
      const done = Math.max(0, (s.phase === 'ended' ? 6 : s.leg - 1) + (s.turn && s.turn.crewIdx > i && s.phase === 'play' ? 1 : 0));
      const idx = c.lost ? Math.max(0, (c.lostLeg || 1) - 1) : Math.min(6, done);
      const [x, y] = pts[idx];
      const off = (i - (s.crews.length - 1) / 2) * 9;
      tokens += `<g class="tok ${s.turn?.crewIdx === i ? 'pulse' : ''} ${c.lost ? 'lost' : ''}" transform="translate(${x + off},${y + 16})"><polygon points="0,-7 6,-3.5 6,3.5 0,7 -6,3.5 -6,-3.5" style="fill:${MATERIALS[c.material]?.color || '#888'}"/></g>`;
    });
  }
  return `<svg class="route" viewBox="0 0 ${W} ${H}" role="img" aria-label="Route map">
    <defs><linearGradient id="sky" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="var(--sky0)"/><stop offset=".55" stop-color="var(--sky1)"/><stop offset="1" stop-color="var(--sky2)"/></linearGradient></defs>
    <rect width="${W}" height="${H}" rx="10" fill="url(#sky)"/>
    ${Array.from({ length: 28 }, (_, i) => `<circle cx="${(i * 97) % W}" cy="${(i * 53) % 110}" r="${i % 3 ? 0.7 : 1.2}" class="star"/>`).join('')}
    <path d="M0,${H} L0,215 L40,200 L70,212 L105,178 L130,196 L160,170 L190,198 L220,${H} Z" class="mtn"/>
    <line x1="0" y1="78" x2="${W}" y2="78" class="karman"/><text x="6" y="74" class="kl">Kármán line</text>
    <path d="${path}" class="rpath"/>
    ${pts.map((p, i) => `<g class="node ${i <= cur ? 'past' : ''} ${i === cur ? 'cur' : ''}"><circle cx="${p[0]}" cy="${p[1]}" r="${i === 0 || i === 6 ? 7 : 5.5}"/>${i ? `<text x="${p[0] - 8}" y="${p[1] - 9}" class="nl">${i}</text>` : ''}</g>`).join('')}
    <text x="${pts[6][0] - 52}" y="${pts[6][1] + 4}" class="nl2">Meridian</text>
    <text x="${pts[0][0] - 10}" y="${pts[0][1] + 18}" class="nl2">Ironhold</text>
    ${tokens}
  </svg>`;
}

// ------------------------------------------------------------------ results
function resultsScreen(s) {
  const R = s.results;
  const rows = [...R.rows].sort((a, b) => a.rank - b.rank);
  const crewOf = (id) => s.crews.find(c => c.id === id);
  const win = crewOf(R.winner);
  const cols = [['Cargo', 'cargoPts'], ['Integrity', 'integrityPts'], ['Complete', 'completePts'], ['Schedule', 'timePts'], ['Budget', 'budgetPts'], ['Spares', 'sparePts'], ['Insight', 'insightPts'], ['Events', 'bonusPts'], ['Green', 'greenPts']];
  const mins = Math.round(R.durationMs / 60000);
  return `${topbar(`<div class="legbar"><b>Mission debrief</b><span class="muted">${mins} min · ${s.crews.length} crews</span></div>`)}
  <main class="results">
    <section class="podium" style="--mc:${MATERIALS[win.material].color}">
      <p class="eyebrow">Mission complete</p>${matBadge(win.material, 'xl')}
      <h1>${esc(win.name)} wins</h1><p class="sub">${esc(MATERIALS[win.material].short)} · ${esc(E.procOf(win).name)} · ${esc(ROLES[win.role].name)} — ${rows[0].total} points</p>
    </section>
    <section class="panel"><h3>Scoreboard</h3><div class="tablewrap"><table class="score">
      <thead><tr><th>#</th><th>Crew</th>${cols.map(c => `<th>${c[0]}</th>`).join('')}<th>Total</th></tr></thead>
      <tbody>${rows.map(r => { const c = crewOf(r.crewId); return `<tr class="${c.lost ? 'lost' : ''}"><td>${r.rank}</td><td class="sc-crew">${matBadge(c.material, 'sm')} <b>${esc(c.name)}</b><small>${esc(MATERIALS[c.material].short)} ${esc(E.procOf(c).name)} · ${esc(ROLES[c.role].name)}</small></td>${cols.map(([, k]) => `<td>${r[k]}</td>`).join('')}<td class="tot">${r.total}</td></tr>`; }).join('')}</tbody></table></div>
      <p class="muted small">Lost craft score only insight and event points. Scoring rules: <button class="link small" data-act="codex" data-tab="scoring">see the Codex</button>.</p></section>
    <section class="panel"><h3>Each crew’s journey</h3><div class="journeys">${s.crews.map(c => journey(c)).join('')}</div></section>
    <section class="panel"><h3>Cost & environment — the life-cycle view</h3>${lifeCycle(s)}</section>
    <section class="panel"><h3>Discuss</h3><ol class="discuss">${DISCUSSION.map(d => `<li>${esc(d)}</li>`).join('')}</ol></section>
    <section class="row center">
      ${isHost() ? `<button class="btn primary big" data-act="to-lobby">Return to lobby — play again</button>` : '<p class="muted">The host can return everyone to the lobby.</p>'}
      <button class="btn" data-act="dl-json">Download match log (JSON)</button>
      <button class="btn" data-act="dl-csv">Download results (CSV)</button>
      <button class="btn ghost" data-act="playtest">Playtest data</button>
      <button class="btn ghost" data-act="leave">${S.mode === 'online' ? 'Leave room' : 'Quit to title'}</button>
    </section>
  </main>`;
}

function journey(c) {
  const M = MATERIALS[c.material];
  const legs = [1, 2, 3, 4, 5, 6].map(L => {
    const h = c.history.find(x => x.leg === L && x.tier !== 'lost');
    const lostHere = c.lost && c.lostLeg === L;
    const tier = h ? h.tier : lostHere ? 'lost' : 'none';
    const sym = { success: '✓', partial: '~', fail: '✗', auto: '•', lost: '☠', none: '·' }[tier];
    return `<span class="jl t-${tier}" title="Leg ${L}${h ? `: ${esc(h.title)} — ${tier}` : ''}">${sym}</span>`;
  }).join('');
  const lessons = [];
  for (const h of c.history) {
    const card = CARDS[h.card];
    if (!card?.mods) continue;
    const v = card.mods[c.material];
    if (h.tier === 'fail' && v < 0) lessons.push(`✗ ${card.title}: ${card.why[c.material]}`);
    else if (h.tier === 'success' && v >= 2) lessons.push(`✓ ${card.title}: ${card.why[c.material]}`);
  }
  return `<div class="jr" style="--mc:${M.color}"><div class="jr-h">${matBadge(c.material, 'sm')}<b>${esc(c.name)}</b><span class="muted small">${esc(M.short)} · ${esc(E.procOf(c).name)}</span></div>
    <div class="jlegs">${legs}</div>
    ${c.lost ? `<p class="bad small">Lost on leg ${c.lostLeg}: ${esc(c.lostCause)}</p>` : ''}
    <ul class="lessons">${lessons.slice(0, 4).map(l => `<li>${esc(l)}</li>`).join('') || '<li class="muted">No decisive material moments — fortune and choices carried this flight.</li>'}</ul></div>`;
}

function lifeCycle(s) {
  const rows = s.results.rows.map(r => ({ r, c: s.crews.find(c => c.id === r.crewId) }));
  const maxPer = Math.max(...rows.map(x => x.r.perCrate || 0), 1);
  return `<div class="tablewrap"><table class="lca"><thead><tr><th>Crew</th><th>Frame mass*</th><th>Embodied CO₂e (frame)</th><th>Fuel CO₂e (this mission)</th><th>Per crate delivered**</th><th>Material cost*</th><th>Recyclability</th></tr></thead><tbody>
    ${rows.map(({ r, c }) => { const M = MATERIALS[c.material]; return `<tr><td>${matBadge(c.material, 'sm')} ${esc(c.name)}</td><td>${M.frameMass.toFixed(1)} t</td><td>${Math.round(r.embodied)} t</td><td>${r.fuel.toFixed(1)} t</td>
      <td>${r.perCrate ? `<div class="mini-bar"><i style="width:${(100 * r.perCrate / maxPer).toFixed(0)}%"></i></div>${r.perCrate.toFixed(2)} t ${r.greenPts ? '🌿' : ''}` : '—'}</td><td>≈ $${Math.round(M.frameMass * M.costPerKg)}k</td><td class="small">${esc(M.recyclability)}</td></tr>`; }).join('')}
  </tbody></table></div>
  <p class="muted small">* Notional craft sized for the same loads (stiffness-dominated), raw material only. ** Fuel for this mission plus the frame’s embodied carbon shared over a ${CONFIG.missionsPerLife}-mission life. 🌿 = Green award. For aircraft the use phase usually dominates, so light frames repay a high embodied carbon — but only if they survive long enough. Try the break-even: how many missions would a ${MATERIALS.cf.short} frame need to fly to repay its extra embodied carbon over ${MATERIALS.cr.short}?</p>`;
}

// ------------------------------------------------------------------ overlays
function renderOverlay() {
  const o = S.overlay;
  if (!o) { $overlay.innerHTML = ''; $overlay.className = ''; return; }
  let inner = '';
  if (o.kind === 'codex') inner = codexView();
  else if (o.kind === 'tutorial') inner = tutorialView();
  else if (o.kind === 'leg') inner = legIntro(o.leg);
  else if (o.kind === 'playtest') inner = playtestView(o);
  else if (o.kind === 'confirm') inner = `<div class="modal small-modal"><h3>${esc(o.title)}</h3><p>${esc(o.text)}</p><div class="row"><button class="btn primary" data-act="confirm-yes">${esc(o.yes || 'Yes')}</button><button class="btn ghost" data-act="close">Cancel</button></div></div>`;
  else if (o.kind === 'about') inner = aboutView();
  $overlay.className = `open ${o.kind}`;
  $overlay.innerHTML = `<div class="scrim" data-act="close"></div>${inner}`;
  if (o.kind === 'tutorial') wireTutorial();
}

function legIntro(n) {
  const L = LEGS[n - 1];
  return `<div class="modal leg-modal">
    <p class="eyebrow">Leg ${n} of 6 · ${esc(L.place)}</p>
    <h2 class="h-display">${esc(L.name)}</h2>
    <p class="leg-topic">${esc(L.topic)}${L.kind === 'luck' ? ' — no material modifiers' : L.kind === 'specialist' ? ' — your role decides it' : ''}</p>
    <p>${esc(L.intro)}</p>
    <div class="watch">${L.watch.map(w => `<span class="tag">${esc(w)}</span>`).join('')}</div>
    <button class="btn primary big" data-act="close">Begin leg ${n}</button>
  </div>`;
}

function codexView() {
  const tabs = [['materials', 'Materials'], ['compare', 'Compare'], ['roles', 'Roles'], ['route', 'The route'], ['cargo', 'Cargo'], ['scoring', 'Scoring'], ['rules', 'Rules'], ['glossary', 'Glossary'], ['sources', 'Sources']];
  const tab = S.ui.codexTab;
  let body = '';
  if (tab === 'materials') body = codexMaterial(S.ui.codexMat);
  else if (tab === 'compare') body = codexCompare();
  else if (tab === 'roles') body = `<div class="role-grid static">${ROLE_ORDER.map(r => { const R = ROLES[r]; return `<div class="role"><span class="role-big">${R.icon}</span><b>${esc(R.name)}</b><small>Home: ${esc(R.home)}</small><p>${esc(R.summary)}</p><p class="ab"><i>Ability:</i> ${esc(R.ability.name)} — ${esc(R.ability.desc)}</p></div>`; }).join('')}</div>
    <p class="muted">Leg 6 is specialist-focused: every crew faces a docking crisis written for its own role, gets +${CONFIG.specialistBonus} for its speciality and +${CONFIG.specialistQuestionBonus} for answering its specialist question.</p>`;
  else if (tab === 'route') body = LEGS.map(L => `<div class="route-leg"><h4>Leg ${L.n} · ${esc(L.name)} <span class="muted">— ${esc(L.topic)}</span></h4><p>${esc(L.intro)}</p>
    ${L.cards ? `<p class="small muted">Event cards: ${L.cards.map(id => esc(CARDS[id].title)).join(' · ')}</p>` : '<p class="small muted">Event cards: one per specialist role.</p>'}</div>`).join('');
  else if (tab === 'cargo') body = `<dl class="cargo-dl">${CARGO_TEXT.points.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    <p>Crates are worth <b>${CONFIG.crateValue} points</b> each. Capacity by frame: ${MATERIAL_ORDER.map(k => `${esc(MATERIALS[k].short)} ${MATERIALS[k].stats.capacity}`).join(' · ')} (Quartermaster +1).</p>`;
  else if (tab === 'scoring') body = `<table class="plain">${SCORING.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>
    <p class="muted small">Crate value ${CONFIG.crateValue} · mission-complete bonus ${CONFIG.completionBonus} · docking window ${CONFIG.deadline} h.</p>`;
  else if (tab === 'rules') body = rulesText();
  else if (tab === 'glossary') body = `<dl class="gloss">${GLOSSARY.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
  else if (tab === 'sources') body = `<ol class="sources">${SOURCES.map(x => `<li>${esc(x)}</li>`).join('')}</ol><p class="muted small">Property values are typical figures for the stated condition and vary with product form and supplier; game modifiers are rankings derived from them, not design allowables.</p>`;
  return `<div class="modal codex"><div class="cx-head"><h2 class="h-display">Materials Codex</h2><button class="x" data-act="close" aria-label="Close">✕</button></div>
    <nav class="cx-tabs">${tabs.map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-act="cx-tab" data-tab="${k}">${l}</button>`).join('')}</nav>
    <div class="cx-body">${body}</div></div>`;
}

function codexMaterial(k) {
  const M = MATERIALS[k], C = CODEX[k];
  const strong = [], weak = [];
  for (const card of Object.values(CARDS)) {
    if (!card.mods) continue;
    const v = card.mods[k];
    if (v >= 2) strong.push(`<li><b>${esc(card.title)}</b> (${sgn(v)}): ${esc(card.why[k])}</li>`);
    if (v <= -2) weak.push(`<li><b>${esc(card.title)}</b> (${sgn(v)}): ${esc(card.why[k])}</li>`);
  }
  const p = M.props;
  const props = [['Density', `${p.density} g/cm³`], ['Young’s modulus E', `${p.E} GPa`], ['Shear modulus G', `${p.G} GPa`], ['Yield strength', `${p.yield} MPa`], ['Tensile strength', `${p.uts} MPa`], ['Elongation', `${p.elong} %`], ['Fatigue', `${p.fatigue} MPa`], ['Fracture toughness', `${p.kic} MPa√m`], ['Max service temp.', `${p.tmax} °C`], ['Thermal conductivity', `${p.k} W/m·K`], ['Thermal expansion', `${p.cte} µm/m·K`], ['Melting range', `${p.melt} °C`], ['Crystal structure', p.structure], ['Price', `${p.cost} $/kg`], ['Embodied carbon', `${p.co2} kg CO₂e/kg`]];
  return `<div class="cx-mat">
    <nav class="cx-mats">${MATERIAL_ORDER.map(x => `<button class="${x === k ? 'on' : ''}" data-act="cx-mat" data-mat="${x}" style="--mc:${MATERIALS[x].color}">${matBadge(x, 'sm')} ${esc(MATERIALS[x].short)}</button>`).join('')}</nav>
    <article style="--mc:${M.color}">
      <header class="cxm-h">${matBadge(k, 'xl')}<div><h3>${esc(M.name)}</h3><p class="muted">${esc(M.family)}</p><p>${esc(M.tagline)}</p></div></header>
      <p>${esc(C.overview)}</p>
      <div class="cx-cols"><div><h4>Microstructure</h4><p>${esc(C.microstructure)}</p><h4>Processing route</h4><p>${esc(C.processing)}</p>
        <h4>In-game processing choices</h4>${M.processing.map(pp => `<div class="proc static"><b>${esc(pp.name)}</b><em>${esc(pp.micro)}</em><div class="fx">${procEffects(pp)}</div></div>`).join('')}</div>
      <div><h4>Typical properties</h4><table class="plain props">${props.map(([a, b]) => `<tr><th>${a}</th><td>${esc(b)}</td></tr>`).join('')}</table></div></div>
      <div class="cx-cols"><div><h4>Strengths</h4><ul>${C.pros.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div><div><h4>Weaknesses</h4><ul>${C.cons.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
      <h4>Real-world uses</h4><ul>${C.uses.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <h4>Selection rationale</h4><p>${esc(C.selection)}</p>
      <h4>Cost & sustainability</h4><p>${esc(C.sustainability)} Recyclability: ${esc(M.recyclability)}.</p>
      <h4>In the game</h4><div class="cx-cols"><div><p class="good small">Where it shines</p><ul class="small">${strong.join('') || '<li>—</li>'}</ul></div><div><p class="bad small">Where it struggles</p><ul class="small">${weak.join('') || '<li>—</li>'}</ul></div></div>
      <p class="small muted">Game stats: integrity ${M.stats.integrity}, ${M.stats.legTime} h per leg, ${M.stats.capacity} crates, ${M.stats.spares} spares, repair ${sgn(M.stats.repair)}, critical crack stage ${M.stats.crackTol}, budget ${M.stats.budget}.</p>
    </article></div>`;
}

function codexCompare() {
  const pts = { ti: [4.43, 880, 114], al: [2.81, 503, 71.7], ss: [8.0, 250, 193], cf: [1.58, 700, 60], mg: [1.84, 185, 44], cr: [7.85, 460, 205] };
  const W = 420, H = 300, pad = 46;
  const lx = (v) => pad + (Math.log10(v) - Math.log10(1)) / (Math.log10(10) - Math.log10(1)) * (W - pad - 12);
  const chart = (title, yIdx, yMin, yMax, yLabel, guides) => {
    const ly = (v) => H - pad - (Math.log10(v) - Math.log10(yMin)) / (Math.log10(yMax) - Math.log10(yMin)) * (H - pad - 14);
    const ticksX = [1, 2, 5, 10], ticksY = yIdx === 1 ? [100, 200, 500, 1000, 2000] : [20, 50, 100, 200, 500];
    const dy = (k) => (yIdx === 2 && k === 'ss' ? 16 : yIdx === 2 && k === 'cr' ? -6 : 4);
    return `<figure class="ashby"><figcaption>${title}</figcaption><svg viewBox="0 0 ${W} ${H}">
      <defs><clipPath id="clip${yIdx}"><rect x="${pad}" y="14" width="${W - pad - 12}" height="${H - pad - 14}"/></clipPath></defs>
      ${ticksX.map(v => `<line x1="${lx(v)}" x2="${lx(v)}" y1="14" y2="${H - pad}" class="grid"/><text x="${lx(v)}" y="${H - pad + 16}" class="ax">${v}</text>`).join('')}
      ${ticksY.map(v => `<line x1="${pad}" x2="${W - 12}" y1="${ly(v)}" y2="${ly(v)}" class="grid"/><text x="${pad - 6}" y="${ly(v) + 4}" class="ax end">${v}</text>`).join('')}
      <g clip-path="url(#clip${yIdx})">${guides.map(g => `<line x1="${lx(1)}" y1="${ly(g.k * 1 ** g.p)}" x2="${lx(10)}" y2="${ly(g.k * 10 ** g.p)}" class="guide"/>`).join('')}</g>
      ${guides.map(g => `<text x="${lx(g.lx || 1.15)}" y="${ly(g.k * (g.lx || 1.15) ** g.p) - 5}" class="gl">${g.label}</text>`).join('')}
      ${Object.entries(pts).map(([k, v]) => `<g><circle cx="${lx(v[0])}" cy="${ly(v[yIdx])}" r="7" style="fill:${MATERIALS[k].color}"/><text x="${lx(v[0]) + 10}" y="${ly(v[yIdx]) + dy(k)}" class="pl">${MATERIALS[k].short}</text></g>`).join('')}
      <text x="${W / 2}" y="${H - 8}" class="ax">Density ρ (g/cm³, log)</text><text x="12" y="${H / 2}" class="ax" transform="rotate(-90 12 ${H / 2})">${yLabel}</text>
    </svg></figure>`;
  };
  const rows = MATERIAL_ORDER.map(k => { const p = pts[k]; return `<tr><td>${matBadge(k, 'sm')} ${esc(MATERIALS[k].short)}</td><td>${p[0]}</td><td>${p[1]}</td><td>${p[2]}</td><td><b>${Math.round(p[1] / p[0])}</b></td><td>${(p[2] / p[0]).toFixed(1)}</td><td>${(Math.sqrt(p[2]) / p[0]).toFixed(2)}</td><td><b>${(Math.cbrt(p[2]) / p[0]).toFixed(2)}</b></td></tr>`; }).join('');
  return `<p>Ashby-style charts for the six frames (representative conditions; 4130 normalised, 316L annealed, CFRP quasi-isotropic). Points on the same dashed line perform equally for that design. Up-and-left is better.</p>
    <div class="charts">${chart('Strength vs density', 1, 100, 2000, 'Yield strength σy (MPa, log)', [{ k: 100, p: 1, label: 'σy/ρ = 100' }, { k: 300, p: 1, label: 'σy/ρ = 300' }])}
    ${chart('Stiffness vs density', 2, 20, 500, 'Young’s modulus E (GPa, log)', [{ k: 25, p: 1, label: 'E/ρ = 25 (tie)', lx: 1.12 }, { k: 2.4 ** 3, p: 3, label: '∛E/ρ = 2.4 (panel)', lx: 2.2 }])}</div>
    <div class="tablewrap"><table class="plain cmp"><thead><tr><th>Frame</th><th>ρ</th><th>σy</th><th>E</th><th>σy/ρ</th><th>E/ρ</th><th>√E/ρ</th><th>∛E/ρ</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="small muted">Notice E/ρ: titanium, aluminium, magnesium and both steels all sit near 25. That is why "specific stiffness" alone cannot separate the metals — the panel index ∛E/ρ and specific strength σy/ρ can.</p>
    <h4>Ratings used in the game</h4><div class="mat-grid static">${MATERIAL_ORDER.map(k => `<div class="mat-card static" style="--mc:${MATERIALS[k].color}"><div class="mc-head">${matBadge(k)}<b>${esc(MATERIALS[k].short)}</b></div>${bars(MATERIALS[k].ratings)}</div>`).join('')}</div>`;
}

function rulesText() {
  return `<div class="rules">
  <h4>Goal</h4><p>Fly your crew’s craft from Ironhold Spaceport to Station Meridian across six legs and score the most mission points — mostly by delivering cargo and arriving intact and on time.</p>
  <h4>Setup (per crew)</h4><ol><li>Choose a <b>frame material</b> (one crew per material by default).</li><li>Choose its <b>processing route</b> — this sets the microstructure and shifts some checks.</li><li>Choose a <b>specialist role</b>.</li><li>Load <b>cargo</b> (0 to capacity). More cargo = more points, but heavier, slower and harder checks.</li></ol>
  <h4>A turn (one-minute control window)</h4><ol><li>Start-of-turn effects: cracks grow, corrosion bites.</li><li>Draw the leg’s event card. Optionally answer the briefing question (+1 if right).</li><li>Choose an approach: <b>Standard</b>, <b>Push hard</b> (+3 DC, −3 h, failure +1 damage), <b>Play it safe</b> (−3 DC, +3 h), or a ★ material/role special if your frame allows it. Optionally jettison a crate (+3) or use your once-per-game ability.</li><li>Roll d20 + modifiers vs the DC. Total ≥ DC: <b>Success</b>. Within 5 below: <b>Partial</b>. Lower: <b>Failure</b>. A natural 20 always succeeds; a natural 1 always fails. Odds are shown before you roll.</li><li>Apply the outcome: damage, time, lost crates, conditions.</li><li>Optional <b>hangar stop</b>: inspect for hidden damage (+1 h), then spend a spare on one repair (+2 h; roll d20 + repair modifier ≥ 10).</li></ol>
  <p>If the timer runs out, the autopilot flies the standard (or no-roll) option and control passes on.</p>
  <h4>The legs</h4><p>1 Specific strength & stiffness · 2 Fatigue · 3 Probability (no material modifiers) · 4 Thermal · 5 Vacuum & space · 6 Specialist docking (your role decides it).</p>
  <h4>Damage</h4><p>Integrity 0 = craft lost (crew ejects safely). Conditions persist: fatigue cracks grow one stage per leg and fast-fracture (−5) beyond your material’s critical crack stage; corrosion costs 1 integrity per leg; heat can permanently over-age or soften a microstructure (only a Metallurgist’s field heat treatment fixes that). Some damage is hidden until inspected.</p>
  <h4>Scoring</h4><table class="plain">${SCORING.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table></div>`;
}

function aboutView() {
  return `<div class="modal about"><div class="cx-head"><h2 class="h-display">About this prototype</h2><button class="x" data-act="close">✕</button></div>
  <div class="cx-body"><p>ALLOY ASCENT is a second-year metallurgical engineering design project: a short, replayable tabletop-style game in which the choice of airframe material, its processing route and the crew specialist change the odds of completing a six-leg journey to orbit.</p>
  <h4>Design intent</h4><ul><li>Every material modifier comes from a real property ranking (σy/ρ, ∛E/ρ, endurance limit, max service temperature, k/α, DBTT, Pilling–Bedworth ratio…) and the reason is shown at the moment of the roll.</li>
  <li>No material dominates: each wins some legs and loses others, and the processing route trades one property for another, as it does in practice (T6 vs T73, normalised vs Q&T, cast vs extruded…).</li>
  <li>Legs 3 and 6 are deliberately not material-driven — Leg 3 is pure probability and risk, Leg 6 is decided by the specialist role.</li>
  <li>Cost and sustainability are scored (budget points, green award) and broken down in the debrief to start a discussion, not to settle it.</li></ul>
  <h4>Balance testing</h4><p>The same rules engine was run through tens of thousands of automated games with simple player bots to tune difficulty, survival rates and game length. The design rationale, critical reflection, rules and playtesting report are in the <a href="https://github.com/JustABard/alloy-ascent/tree/main/docs" target="_blank" rel="noopener">project repository</a>.</p>
  <h4>Limitations</h4><p>Modifiers are ordinal rankings, not design allowables; one property often stands in for a complex behaviour; online rooms trust the clients (fine for a classroom, not for a tournament).</p></div></div>`;
}

// ------------------------------------------------------------------ tutorial
function tutorialView() {
  const step = TUTORIAL[S.ui.tut];
  return `<div class="modal tutorial"><div class="cx-head"><h2 class="h-display">How to play</h2><button class="x" data-act="close">✕</button></div>
    <div class="tut-progress">${TUTORIAL.map((_, i) => `<button class="${i === S.ui.tut ? 'on' : i < S.ui.tut ? 'done' : ''}" data-act="tut-go" data-i="${i}" aria-label="Step ${i + 1}"></button>`).join('')}</div>
    <div class="tut-body"><p class="eyebrow">Step ${S.ui.tut + 1} of ${TUTORIAL.length}</p><h3>${esc(step.title)}</h3>${step.html()}</div>
    <div class="row between"><button class="btn ghost" data-act="tut-prev" ${S.ui.tut === 0 ? 'disabled' : ''}>← Back</button>
    ${S.ui.tut < TUTORIAL.length - 1 ? `<button class="btn primary" data-act="tut-next">Next →</button>` : `<button class="btn primary" data-act="close">Let’s fly</button>`}</div></div>`;
}
function wireTutorial() {
  const step = TUTORIAL[S.ui.tut];
  if (step.wire) step.wire($overlay);
}

// ------------------------------------------------------------------ playtest data
function playtestView(o) {
  if (o.loading) return `<div class="modal playtest"><div class="cx-head"><h2 class="h-display">Playtest data</h2><button class="x" data-act="close">✕</button></div><p>Loading results…</p></div>`;
  if (o.error) return `<div class="modal playtest"><div class="cx-head"><h2 class="h-display">Playtest data</h2><button class="x" data-act="close">✕</button></div><p class="err">${esc(o.error)}</p></div>`;
  const games = o.rows || [];
  const agg = {}, ragg = {};
  let dur = 0, durN = 0;
  for (const g of games) {
    if (g.duration_s) { dur += g.duration_s; durN++; }
    for (const c of g.data?.crews || []) {
      for (const [key, A] of [[c.material, agg], [c.role, ragg]]) {
        A[key] ||= { n: 0, win: 0, sur: 0, sc: 0 };
        A[key].n++; A[key].win += c.rank === 1 ? 1 : 0; A[key].sur += c.lost ? 0 : 1; A[key].sc += c.score;
      }
    }
  }
  const bar = (v, max = 1) => `<div class="mini-bar"><i style="width:${Math.min(100, 100 * v / max).toFixed(0)}%"></i></div>`;
  const table = (A, order, name) => `<table class="plain"><thead><tr><th>${name}</th><th>Crews</th><th>Win rate</th><th>Survival</th><th>Mean score</th></tr></thead><tbody>${order.filter(k => A[k]).map(k => { const a = A[k]; return `<tr><td>${name === 'Material' ? `${matBadge(k, 'sm')} ${esc(MATERIALS[k].short)}` : esc(ROLES[k].name)}</td><td>${a.n}</td><td>${bar(a.win / a.n)}${pct(a.win / a.n)}</td><td>${bar(a.sur / a.n)}${pct(a.sur / a.n)}</td><td>${(a.sc / a.n).toFixed(1)}</td></tr>`; }).join('')}</tbody></table>`;
  return `<div class="modal playtest"><div class="cx-head"><h2 class="h-display">Playtest data</h2><button class="x" data-act="close">✕</button></div>
    <p>${games.length} recorded games (anonymous; most recent ${games.length >= 500 ? '500' : 'all'}). Mean duration ${durN ? (dur / durN / 60).toFixed(1) : '—'} min.</p>
    ${games.length ? `${table(agg, MATERIAL_ORDER, 'Material')}${table(ragg, ROLE_ORDER, 'Role')}<button class="btn small" data-act="dl-playtest">Download all results (CSV)</button>` : '<p class="muted">No games recorded yet — finish a game with “Share anonymous results” switched on.</p>'}
    <p class="small muted">Automated balance results (bots) are in the project’s docs/playtest folder; this page shows real human games.</p></div>`;
}

// ------------------------------------------------------------------ dice overlay
let diceTimer = null;
function showDice(r, crew) {
  const el = document.getElementById('dice');
  clearTimeout(diceTimer);
  const tierName = { success: 'SUCCESS', partial: 'PARTIAL', fail: r.repair ? 'REPAIR FAILED' : 'FAILURE' }[r.tier] || '';
  el.className = 'show rolling';
  el.innerHTML = `<div class="dice-card" style="--mc:${MATERIALS[crew.material].color}"><div class="dc-who">${esc(crew.name)}${r.repair ? ` · ${esc(r.label)}` : ''}</div>${d20svg('?', 'big-d')}<div class="dc-tier"></div><div class="dc-math"></div></div>`;
  const numEl = el.querySelector('.d20-n');
  let k = 0;
  const spin = setInterval(() => { numEl.textContent = 1 + Math.floor(Math.random() * 20); if (++k > 14) clearInterval(spin); }, 60);
  diceTimer = setTimeout(() => {
    clearInterval(spin);
    numEl.textContent = r.d2 ? Math.max(r.d, r.d2) : r.d;
    el.className = `show landed t-${r.tier} ${r.d === 20 ? 'crit' : r.d === 1 ? 'fumble' : ''}`;
    el.querySelector('.dc-tier').textContent = tierName;
    el.querySelector('.dc-math').textContent = `${r.d}${r.d2 ? `/${r.d2}` : ''} ${sgn(r.total)} vs DC ${r.dc}`;
    diceTimer = setTimeout(() => { el.className = ''; el.innerHTML = ''; }, 1700);
  }, 950);
}
document.getElementById('dice').addEventListener('click', () => { const el = document.getElementById('dice'); el.className = ''; el.innerHTML = ''; });

// ------------------------------------------------------------------ timer
function tick() {
  const s = S.state;
  const txt = document.getElementById('timer-text');
  const ring = document.getElementById('timer-ring');
  const box = document.getElementById('timer');
  if (!s || s.phase !== 'play' || !s.turn) return;
  const t = s.turn;
  if (!txt) return;
  if (s.paused) { txt.textContent = '❚❚'; box.className = 'timer paused'; ring.style.strokeDashoffset = 0; return; }
  if (!t.deadline) { txt.textContent = s.settings.timer ? '—' : '∞'; box.className = 'timer idle'; ring.style.strokeDashoffset = 0; return; }
  const rem = t.deadline - now();
  const total = (s.settings.timer || 60) * 1000;
  const sec = Math.max(0, Math.ceil(rem / 1000));
  txt.textContent = sec;
  const C = 2 * Math.PI * 18;
  ring.style.strokeDasharray = C;
  ring.style.strokeDashoffset = C * (1 - Math.max(0, Math.min(1, rem / total)));
  box.className = `timer ${sec <= 10 ? 'low' : ''}`;
  if (rem <= 0 && !S.timeoutSent[t.seq]) {
    const crew = s.crews[t.crewIdx];
    const mine = canControl(crew);
    const grace = mine ? 0 : isHost() ? 3000 : 6000;
    if (rem <= -grace) { S.timeoutSent[t.seq] = true; dispatch({ type: 'timeout', seq: t.seq }, { quiet: true }); }
  }
}
setInterval(tick, 250);

// ------------------------------------------------------------------ QR
let qrLib = null;
async function drawQR(code) {
  const el = document.getElementById('qr');
  if (!el || el.dataset.code === code) return;
  try {
    qrLib ||= (await import('https://cdn.jsdelivr.net/npm/qrcode-generator@2.0.4/dist/qrcode.mjs')).default;
    const q = qrLib(0, 'M');
    q.addData(shareLink(code));
    q.make();
    el.innerHTML = q.createSvgTag(4, 2);
    el.dataset.code = code;
  } catch { el.textContent = 'QR unavailable'; }
}

// ------------------------------------------------------------------ modes
function newLocalGame() {
  let s = E.createGame({ mode: 'local' });
  s = E.act(s, { type: 'addCrew', id: uid('c'), name: 'Crew 1' }, { now: Date.now(), rng, actor: E.LOCAL_ACTOR });
  s = E.act(s, { type: 'addCrew', id: uid('c'), name: 'Crew 2' }, { now: Date.now(), rng, actor: E.LOCAL_ACTOR });
  return s;
}

async function openRoom(code, { join = true, spectate = false } = {}) {
  S.mode = 'online';
  const room = new Net.Room(code, {
    onState: (st) => { if (S.room === room) onRemoteState(st); },
    onPresence: (list) => { S.presence = list; if (S.state?.phase === 'lobby') render(); },
    onStatus: (st) => { S.netStatus = st; },
  });
  S.room = room;
  Net.syncClock();
  await room.connect(S.me);
  S.screen = 'room';
  history.replaceState(null, '', `?room=${code}`);
  store.set('aa_last_room', code);
  if (join) {
    const st = room.state;
    const known = st.players.some(p => p.id === S.me.id);
    if (!known || st.players.find(p => p.id === S.me.id)?.name !== S.me.name) await dispatch({ type: 'join', player: { id: S.me.id, name: S.me.name } });
    let hasCrew = room.state.crews.some(c => c.owner === S.me.id);
    // Rejoining from a new tab: reclaim a crew registered under the same name if its player is offline.
    if (!spectate && !hasCrew) {
      const mine = room.state.crews.find(c => room.state.players.find(p => p.id === c.owner)?.name === S.me.name);
      if (mine) {
        await new Promise(r => setTimeout(r, 1500)); // let presence sync first
        if (!S.presence.includes(mine.owner)) { await dispatch({ type: 'reclaim', crewId: mine.id }, { quiet: true }); hasCrew = true; }
      }
    }
    if (!spectate && !hasCrew && room.state.phase === 'lobby' && room.state.crews.length < CONFIG.maxCrews) await dispatch({ type: 'addCrew', id: uid('c'), name: S.me.name });
    if (!spectate && !hasCrew && room.state.phase !== 'lobby') toast('Mission in progress — you are watching. You can join the next game from the lobby.');
  }
  afterState();
}

async function leaveRoom() {
  if (S.mode === 'online' && S.room) {
    if (S.state?.phase === 'lobby') await dispatch({ type: 'leave', playerId: S.me.id }, { quiet: true });
    await S.room.close();
  }
  S.room = null; S.state = null; S.mode = null; S.screen = 'title'; S.overlay = null; S.ui.lastSeq = null; S.ui.legSeen = null;
  history.replaceState(null, '', location.pathname);
  render();
}

function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function csvOf(rows) { return rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n'); }
function resultsCSV(s) {
  const sum = E.matchSummary(s);
  const head = ['crew', 'material', 'processing', 'role', 'cargo_start', 'cargo_end', 'integrity', 'hours', 'lost', 'lost_leg', 'lost_cause', 'insight', 'answered', 'repairs', 'jettisoned', 'score', 'rank', 'cargo_pts', 'integrity_pts', 'complete_pts', 'time_pts', 'budget_pts', 'spare_pts', 'insight_pts', 'event_pts', 'green_pts', 'leg1', 'leg2', 'leg3', 'leg4', 'leg5', 'leg6'];
  const rows = sum.crews.map((c, i) => [s.crews[i].name, c.material, c.processing, c.role, c.cargoStart, c.cargoEnd, c.integrity, c.time, c.lost, c.lostLeg, c.lostCause, c.insight, c.answered, c.repairs, c.jettisoned, c.score, c.rank, c.breakdown.cargo, c.breakdown.integrity, c.breakdown.complete, c.breakdown.time, c.breakdown.budget, c.breakdown.spares, c.breakdown.insight, c.breakdown.bonus, c.breakdown.green,
    ...[1, 2, 3, 4, 5, 6].map(L => { const h = c.history.find(x => x.leg === L); return h ? `${h.card}:${h.tier}${h.timedOut ? ':timeout' : ''}` : ''; })]);
  return csvOf([head, ...rows]);
}

// ------------------------------------------------------------------ events
document.addEventListener('click', async (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const a = el.dataset.act;
  const s = S.state;
  const crewId = el.dataset.crew;
  switch (a) {
    case 'home': if (S.screen === 'room') return confirmBox('Leave this game?', S.mode === 'online' ? 'You can rejoin with the same link while the room exists.' : 'Your pass-and-play game is saved on this device.', 'Leave', leaveRoom); S.screen = 'title'; render(); break;
    case 'theme': S.ui.theme = S.ui.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = S.ui.theme; store.set('aa_theme', S.ui.theme); render(); break;
    case 'codex': S.overlay = { kind: 'codex' }; if (el.dataset.tab) S.ui.codexTab = el.dataset.tab; renderOverlay(); break;
    case 'codex-mat': S.ui.codexTab = 'materials'; S.ui.codexMat = el.dataset.mat; S.overlay = { kind: 'codex' }; renderOverlay(); break;
    case 'cx-tab': S.ui.codexTab = el.dataset.tab; renderOverlay(); $overlay.querySelector('.cx-body')?.scrollTo(0, 0); break;
    case 'cx-mat': S.ui.codexMat = el.dataset.mat; renderOverlay(); $overlay.querySelector('.cx-body')?.scrollTo(0, 0); break;
    case 'tutorial': S.overlay = { kind: 'tutorial' }; renderOverlay(); break;
    case 'tut-next': S.ui.tut = Math.min(TUTORIAL.length - 1, S.ui.tut + 1); renderOverlay(); break;
    case 'tut-prev': S.ui.tut = Math.max(0, S.ui.tut - 1); renderOverlay(); break;
    case 'tut-go': S.ui.tut = +el.dataset.i; renderOverlay(); break;
    case 'about': S.overlay = { kind: 'about' }; renderOverlay(); break;
    case 'close': S.overlay = null; renderOverlay(); break;
    case 'confirm-yes': { const fn = S.overlay?.fn; S.overlay = null; renderOverlay(); fn?.(); break; }
    case 'playtest': S.overlay = { kind: 'playtest', loading: true }; renderOverlay();
      try { const rows = await Net.fetchResults(500); S.overlay = { kind: 'playtest', rows }; } catch (e) { S.overlay = { kind: 'playtest', error: `Could not load results: ${e.message}` }; }
      renderOverlay(); break;
    case 'dl-playtest': {
      const rows = S.overlay?.rows || [];
      const out = [['date', 'mode', 'crews', 'duration_s', 'material', 'processing', 'role', 'cargo_start', 'cargo_end', 'lost', 'lost_leg', 'score', 'rank']];
      for (const g of rows) for (const c of g.data?.crews || []) out.push([g.created_at, g.mode, g.crews, g.duration_s, c.material, c.processing, c.role, c.cargoStart, c.cargoEnd, c.lost, c.lostLeg, c.score, c.rank]);
      download('alloy-ascent-playtests.csv', csvOf(out), 'text/csv'); break;
    }
    case 'go-host': S.overlay = null; S.screen = 'host'; S.ui.hostErr = ''; render(); setTimeout(() => document.getElementById('host-name')?.focus(), 30); break;
    case 'go-join': S.screen = 'join'; S.ui.joinErr = ''; render(); setTimeout(() => document.getElementById(S.ui.joinCode ? 'join-name' : 'join-code')?.focus(), 30); break;
    case 'host-create': {
      const name = document.getElementById('host-name').value.trim();
      if (!name) { S.ui.hostErr = 'Please enter your name.'; return render(); }
      S.me.name = name; store.set('aa_name', name);
      el.disabled = true; el.textContent = 'Creating…';
      try {
        const { code } = await Net.createRoom((code) => {
          let st = E.createGame({ mode: 'online', code, hostId: S.me.id });
          st = E.act(st, { type: 'join', player: { id: S.me.id, name } }, { now: Date.now(), rng, actor: S.me.id });
          st = E.act(st, { type: 'addCrew', id: uid('c'), name }, { now: Date.now(), rng, actor: S.me.id });
          return st;
        });
        await openRoom(code, { join: false });
      } catch (e) { S.ui.hostErr = `Could not create a room: ${e.message}. Pass-and-play still works offline.`; S.screen = 'host'; render(); }
      break;
    }
    case 'join-go': case 'join-spectate': {
      const code = Net.normaliseCode(document.getElementById('join-code').value);
      const name = document.getElementById('join-name').value.trim();
      S.ui.joinCode = code;
      if (!code) { S.ui.joinErr = 'Enter the room code.'; return render(); }
      if (!name) { S.ui.joinErr = 'Please enter your name.'; return render(); }
      S.me.name = name; store.set('aa_name', name);
      el.disabled = true; el.textContent = 'Joining…';
      try {
        const row = await Net.fetchRoom(code);
        if (!row) { S.ui.joinErr = `No room called ${code}. Check the code with your host.`; return render(); }
        await openRoom(code, { join: true, spectate: a === 'join-spectate' });
      } catch (e) { S.ui.joinErr = `Could not join: ${e.message}`; S.screen = 'join'; render(); }
      break;
    }
    case 'local-new': S.overlay = null; S.mode = 'local'; S.state = newLocalGame(); S.screen = 'room'; S.ui.lastSeq = null; S.ui.legSeen = null; store.set('aa_local', S.state); afterState(); break;
    case 'local-resume': S.mode = 'local'; S.state = store.get('aa_local'); S.screen = 'room'; S.ui.lastSeq = null; S.ui.legSeen = S.state.phase === 'play' ? `${S.state.gameNo}:${S.state.leg}` : null; afterState(); break;
    case 'leave': confirmBox(S.mode === 'online' ? 'Leave this room?' : 'Quit to the title screen?', S.mode === 'online' ? 'Your crew is removed if the mission has not started.' : 'Your pass-and-play game stays saved on this device.', 'Leave', leaveRoom); break;
    case 'copy-link': try { await navigator.clipboard.writeText(shareLink(s.code)); toast('Invite link copied'); } catch { toast(shareLink(s.code)); } break;
    case 'claim-host': dispatch({ type: 'claimHost' }); break;
    case 'reclaim': dispatch({ type: 'reclaim', crewId }); break;
    case 'add-crew': { const n = s.crews.length + 1; const id = uid('c'); S.ui.editCrew = id; await dispatch({ type: 'addCrew', id, name: S.mode === 'online' && !s.crews.some(c => c.owner === S.me.id) ? S.me.name : `Crew ${n}` }); break; }
    case 'remove-crew': confirmBox('Remove this crew?', 'Their choices will be lost.', 'Remove', () => dispatch({ type: 'removeCrew', crewId })); break;
    case 'edit-crew': S.ui.editCrew = crewId; render(); break;
    case 'pick-mat': dispatch({ type: 'configCrew', crewId, patch: { material: el.dataset.mat } }); break;
    case 'pick-proc': dispatch({ type: 'configCrew', crewId, patch: { processing: el.dataset.proc } }); break;
    case 'pick-role': dispatch({ type: 'configCrew', crewId, patch: { role: el.dataset.role } }); break;
    case 'cargo': { const c = s.crews.find(x => x.id === crewId); dispatch({ type: 'configCrew', crewId, patch: { cargo: c.cargo + +el.dataset.d, ready: false } }); break; }
    case 'ready': { const c = s.crews.find(x => x.id === crewId); dispatch({ type: 'configCrew', crewId, patch: { ready: !c.ready } }); break; }
    case 'start': {
      const allReady = s.crews.every(c => c.ready);
      if (!allReady) return confirmBox('Launch now?', 'Unready crews get their current choices, with anything missing filled in at random.', 'Launch', () => dispatch({ type: 'start', force: true }));
      dispatch({ type: 'start' }); break;
    }
    case 'to-lobby': confirmBox('Return everyone to the lobby?', s.phase === 'play' ? 'The current mission will be abandoned.' : 'Crews keep their names and choices so you can tweak and fly again.', 'Return to lobby', () => dispatch({ type: 'returnToLobby' })); break;
    case 'pause': dispatch({ type: 'pause' }); break;
    case 'resume': dispatch({ type: 'resume' }); break;
    case 'ready-turn': dispatch({ type: 'ready', seq: +el.dataset.seq }); break;
    case 'answer': dispatch({ type: 'answer', choice: +el.dataset.i, seq: +el.dataset.seq }); break;
    case 'sel-appr': S.ui.sel.approach = el.dataset.id; render(); break;
    case 'roll': { const sel = S.ui.sel; dispatch({ type: 'roll', approach: sel.approach, jettison: sel.jettison, ability: sel.ability, seq: +el.dataset.seq }); break; }
    case 'hangar': dispatch({ type: 'hangar', option: el.dataset.opt, seq: +el.dataset.seq }); break;
    case 'end': dispatch({ type: 'end', seq: +el.dataset.seq }); break;
    case 'dl-json': download(`alloy-ascent-${s.code || 'local'}-game${s.gameNo}.json`, JSON.stringify({ summary: E.matchSummary(s), log: s.log, crews: s.crews.map(c => ({ name: c.name, material: c.material, processing: c.processing, role: c.role, history: c.history })) }, null, 2), 'application/json'); break;
    case 'dl-csv': download(`alloy-ascent-${s.code || 'local'}-game${s.gameNo}.csv`, resultsCSV(s), 'text/csv'); break;
    default: break;
  }
});

document.addEventListener('change', (ev) => {
  const el = ev.target;
  if (el.dataset.set) {
    const v = el.type === 'checkbox' ? el.checked : +el.value;
    dispatch({ type: 'setting', key: el.dataset.set, value: v });
  } else if (el.dataset.act === 'sel-jet') { S.ui.sel.jettison = el.checked; render(); }
  else if (el.dataset.act === 'sel-ab') { S.ui.sel.ability = el.checked; render(); }
  else if (el.dataset.crewname) { const name = el.value.trim(); if (name) dispatch({ type: 'configCrew', crewId: el.dataset.crewname, patch: { name } }); }
});
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && S.overlay) { S.overlay = null; renderOverlay(); }
  if (ev.key === 'Enter' && ev.target.id === 'host-name') document.querySelector('[data-act="host-create"]')?.click();
  if (ev.key === 'Enter' && (ev.target.id === 'join-code' || ev.target.id === 'join-name')) document.querySelector('[data-act="join-go"]')?.click();
  if (ev.key === 'Enter' && ev.target.dataset?.crewname) ev.target.blur();
});

function confirmBox(title, text, yes, fn) { S.overlay = { kind: 'confirm', title, text, yes, fn }; renderOverlay(); }

// ------------------------------------------------------------------ boot
(async function boot() {
  const params = new URLSearchParams(location.search);
  const code = Net.normaliseCode(params.get('room'));
  if (code) {
    S.ui.joinCode = code;
    // Refreshing a tab that is already in the room resumes straight away; a fresh invite link
    // shows the join screen (pre-filled) so a shared PC never joins under someone else's name.
    try {
      const row = await Net.fetchRoom(code);
      if (row && row.state.players.some(p => p.id === S.me.id)) { await openRoom(code, { join: true, spectate: false }); return; }
      if (!row) S.ui.joinErr = `Room ${code} was not found — it may have expired. Ask your host for a new code.`;
    } catch { /* offline: fall through to the join screen */ }
    S.screen = 'join';
  }
  render();
})();

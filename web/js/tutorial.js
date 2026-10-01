// Interactive tutorial. Each step returns HTML; optional wire(root) adds live widgets.
import { odds, crewStats, loadPenalty, legHours } from './engine.js';
import { CONFIG, MATERIALS, MATERIAL_ORDER, ROLES, ROLE_ORDER, LEGS } from './data.js';
import { CARGO_TEXT, SCORING } from './content.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (x) => `${Math.round(x * 100)}%`;
const sgn = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '±0');
const badge = (k) => `<span class="hexb sm" style="--mc:${MATERIALS[k].color}">${MATERIALS[k].symbol}</span>`;
const oddsBar = (o) => `<div class="odds"><div class="ob s" style="flex:${o.success}"></div><div class="ob p" style="flex:${o.partial}"></div><div class="ob f" style="flex:${o.fail}"></div></div>
  <div class="odds-l"><span class="s">✓ Success ${pct(o.success)}</span><span class="p">~ Partial ${pct(o.partial)}</span><span class="f">✗ Failure ${pct(o.fail)}</span></div>`;

const tutState = { mod: 2, dc: 11, mat: 'al', crates: 4, last: null };

export const TUTORIAL = [
  { title: 'Welcome, crews', html: () => `
    <p>Each crew flies an experimental craft from <b>Ironhold Spaceport</b> to <b>Station Meridian</b> in orbit, across <b>six legs</b>. Along the way, scripted events test your airframe — and the dice decide how it copes.</p>
    <p>You win by scoring the most <b>mission points</b>: deliver cargo, arrive intact, stay on schedule and on budget. A game takes 5–15 minutes for 2–6 crews.</p>
    <p class="callout">Think of it as a tabletop adventure where the character sheet is a <b>materials datasheet</b>: your frame material, its processing route and your specialist set the modifiers on every roll.</p>` },
  { title: 'Six frames, six personalities', html: () => `
    <p>Each crew picks one frame material. None is best at everything — that is the point.</p>
    <div class="tut-mats">${MATERIAL_ORDER.map(k => `<div style="--mc:${MATERIALS[k].color}">${badge(k)}<b>${esc(MATERIALS[k].short)}</b><small>${esc(MATERIALS[k].tagline)}</small></div>`).join('')}</div>
    <p>Every event card has a modifier for each material, taken from a real property: specific strength, fatigue endurance limit, maximum service temperature, ductile-to-brittle transition, and so on. When you roll, the game tells you <i>why</i> your material got its bonus or penalty.</p>` },
  { title: 'Processing changes the microstructure', html: () => `
    <p>The same alloy can be processed in different ways, and the <b>microstructure</b> that results shifts your odds. Every frame offers two routes. For example:</p>
    <div class="tut-proc"><div><b>7075-T6 (peak-aged)</b><small>fine η′ precipitates</small><span class="up">+1 strength</span><span class="down">−1 corrosion</span></div>
    <div><b>7075-T73 (over-aged)</b><small>coarser, stable η precipitates</small><span class="down">−1 strength</span><span class="up">+2 corrosion</span><span class="up">+1 crack tolerance</span></div></div>
    <p>Others: mill-annealed vs β-annealed titanium, annealed vs cold-worked 316L, epoxy vs cyanate-ester CFRP, cast vs extruded WE43, normalised vs quenched-and-tempered 4130.</p>` },
  { title: 'Pick a specialist', html: () => `
    <p>Your role gives a bonus on its home checks and a once-per-game ability. Leg 6 is written specifically for your role.</p>
    <div class="tut-roles">${ROLE_ORDER.map(r => `<div><span class="role-big">${ROLES[r].icon}</span><b>${esc(ROLES[r].name)}</b><small>${esc(ROLES[r].summary)}</small></div>`).join('')}</div>
    <p class="callout">Good pairings cover a weakness: a Surface Engineer protects corrosion-prone magnesium; a Metallurgist steadies heat-sensitive 7075; an NDT Inspector finds CFRP’s hidden delaminations.</p>` },
  { title: 'Cargo: what it is for', html: () => `
    <div class="cargo-dl tut">${CARGO_TEXT.points.slice(0, 4).map(([k, v]) => `<p><b>${esc(k)}.</b> ${esc(v)}</p>`).join('')}</div>
    <div class="tut-widget" id="tw-cargo"></div>`,
    wire(root) {
      const box = root.querySelector('#tw-cargo');
      const draw = () => {
        const c = { material: tutState.mat, processing: MATERIALS[tutState.mat].processing[0].id, role: 'pilot', cargo: 0 };
        const cap = crewStats(c).capacity;
        tutState.crates = Math.min(tutState.crates, cap);
        c.cargo = tutState.crates;
        box.innerHTML = `<div class="tw-mats">${MATERIAL_ORDER.map(k => `<button class="${k === tutState.mat ? 'on' : ''}" data-m="${k}" style="--mc:${MATERIALS[k].color}">${badge(k)} ${esc(MATERIALS[k].short)}</button>`).join('')}</div>
          <div class="stepper"><button class="btn small" data-d="-1">−</button><div class="crates">${Array.from({ length: cap }, (_, i) => `<span class="crate ${i < c.cargo ? 'full' : ''}"></span>`).join('')}</div><button class="btn small" data-d="1">＋</button></div>
          <p><b>${c.cargo}/${cap} crates</b> → <b>${c.cargo * CONFIG.crateValue} pts</b> if delivered · load penalty <b>${sgn(-loadPenalty(c.cargo))}</b> on strength & fatigue checks · <b>${legHours(c).toFixed(1)} h</b> per leg</p>`;
      };
      box.addEventListener('click', (e) => {
        const m = e.target.closest('[data-m]'); const d = e.target.closest('[data-d]');
        if (m) tutState.mat = m.dataset.m;
        if (d) tutState.crates = Math.max(0, tutState.crates + +d.dataset.d);
        draw();
      });
      draw();
    } },
  { title: 'The route', html: () => `
    <ol class="tut-legs">${LEGS.map(L => `<li><b>Leg ${L.n} · ${esc(L.name)}</b> — ${esc(L.topic)}${L.kind === 'luck' ? ' <span class="pill">pure probability</span>' : L.kind === 'specialist' ? ' <span class="pill">specialist</span>' : ''}</li>`).join('')}</ol>
    <p>Each crew draws its own event card for the leg, so the class sees a range of hazards. Legs 3 and 6 deliberately ignore your material: Leg 3 is about reading odds; Leg 6 is your specialist’s moment.</p>` },
  { title: 'Rolling the d20', html: () => `
    <p>Roll a twenty-sided die and add your modifiers. Reach the <b>DC</b> (difficulty class) for a <b>Success</b>; land up to 5 below for a <b>Partial</b>; anything lower is a <b>Failure</b>. A natural 20 always succeeds and a natural 1 always fails. Each +1 is worth 5 percentage points.</p>
    <div class="tut-widget" id="tw-dice"></div>`,
    wire(root) {
      const box = root.querySelector('#tw-dice');
      const draw = () => {
        const o = odds(tutState.mod, tutState.dc);
        box.innerHTML = `<label>Your total modifier <b>${sgn(tutState.mod)}</b><input type="range" min="-6" max="8" value="${tutState.mod}" data-k="mod"></label>
          <label>Difficulty class <b>DC ${tutState.dc}</b><input type="range" min="6" max="18" value="${tutState.dc}" data-k="dc"></label>
          <p>You need <b>${Math.max(2, tutState.dc - tutState.mod)}+</b> on the die to succeed.</p>${oddsBar(o)}
          <div class="row"><button class="btn small" data-roll="1">Try a roll</button><span class="tw-roll">${tutState.last ? tutState.last : ''}</span></div>`;
      };
      box.addEventListener('input', (e) => { const k = e.target.dataset.k; if (k) { tutState[k] = +e.target.value; draw(); } });
      box.addEventListener('click', (e) => {
        if (!e.target.closest('[data-roll]')) return;
        const d = 1 + Math.floor(Math.random() * 20); const t = d + tutState.mod;
        const tier = d === 20 ? 'Success (natural 20!)' : d === 1 ? 'Failure (natural 1)' : t >= tutState.dc ? 'Success' : t >= tutState.dc - 5 ? 'Partial' : 'Failure';
        tutState.last = `Rolled ${d} ${sgn(tutState.mod)} = ${t} → ${tier}`; draw();
      });
      draw();
    } },
  { title: 'Choosing an approach', html: () => `
    <ul class="tut-list">
      <li><b>Standard profile</b> — the card’s normal DC and time.</li>
      <li><b>Push hard</b> — the shortcut: +3 DC, 3 h faster, and a Failure does +1 damage.</li>
      <li><b>Play it safe</b> — −3 DC but +3 h.</li>
      <li><b>★ Special</b> — options that only some frames can use, because of their metallurgy. A locked special tells you why: e.g. only steels and Ti can “stay below the endurance limit”; only a laminate can use aeroelastic tailoring.</li>
      <li><b>Jettison a crate</b> — +3 now, but you lose that crate’s points.</li>
      <li><b>Abilities</b> — once per game, e.g. the Test Pilot’s reroll or the Structural Engineer’s fail-safe.</li>
    </ul><p>Optional <b>briefing questions</b> give +1 for a right answer (+2 for a Metallurgist, +3 for the Leg 6 specialist question).</p>` },
  { title: 'Damage, hidden cracks and the hangar', html: () => `
    <p><b>Integrity</b> is your hull’s health. At 0 the craft is lost (the crew ejects safely) and scores very little.</p>
    <p><b>Conditions</b> persist between legs: a permanent set, a twisted wing box, active corrosion (−1 per leg), an over-aged microstructure (only a Metallurgist can re-heat-treat it)…</p>
    <p><b>Fatigue cracks</b> are often <i>hidden</i>. They grow one stage per leg; past your material’s critical stage (higher for tougher materials, because a꜀ ∝ (K_IC/σ)²) they fast-fracture for 5 damage.</p>
    <p>After each roll you get an optional <b>hangar stop</b>: <b>inspect</b> (+1 h) to find hidden damage, then spend a spare on one <b>repair</b> (+2 h). Your material’s repairability matters: 4130 welds anywhere; CFRP needs a difficult scarf repair.</p>` },
  { title: 'One-minute control windows', html: () => `
    <p>Each crew has <b>60 seconds</b> per turn (the host can change this or pause). If time runs out, the autopilot flies the standard option and control passes to the next crew.</p>
    <ul class="tut-list"><li><b>Online rooms:</b> the host creates a room and shares the code, link or QR code. Everyone plays on their own phone or laptop; a projector can join as a spectator.</li>
    <li><b>Pass-and-play:</b> one screen. Between turns a hand-over screen appears; the next crew’s minute starts when they tap “ready”.</li>
    <li>After the debrief the host can <b>return everyone to the lobby</b> to swap frames and fly again.</li></ul>` },
  { title: 'Scoring', html: () => `<table class="plain">${SCORING.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>
    <p class="muted small">Crates ${CONFIG.crateValue} pts each · mission complete +${CONFIG.completionBonus} · window ${CONFIG.deadline} h.</p>` },
  { title: 'Ready for launch', html: () => `
    <p>That is everything. The <b>Codex</b> (top bar) explains every material, property, leg and term whenever you need it.</p>
    <div class="row"><button class="btn primary" data-act="local-new">Start a pass-and-play game</button><button class="btn" data-act="go-host">Host an online room</button></div>` },
];

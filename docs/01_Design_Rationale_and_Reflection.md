# SkyForge — Design Rationale and Critical Reflection

*Second-year metallurgical engineering design project · game prototype*
**Play:** https://justabard.github.io/alloy-ascent/ · **Code:** https://github.com/JustABard/alloy-ascent

---

## 1. The brief, and how the prototype answers it

| Requirement | Where it is met |
|---|---|
| 2–6 players (crews); 5–15 min | Lobby allows 2–6 crews. Estimated length including set-up: ≈6–8 min for 2 crews, ≈10–14 min for 4 crews, ≈14–19 min for 6 crews. For 6 crews, a 45 s timer or briefing questions off brings it under 15 min (playtesting report §A.4). |
| Six candidate frames: Ti-6Al-4V, 7075-T6, 316L, CFRP, WE43, 4130 chromoly | `web/js/data.js` → `MATERIALS`; Materials Codex in-game |
| Choose a craft/frame **and** a role; choices must change the odds of finishing | Material, processing route, role and cargo load all feed every roll; survival ranges from 67% (WE43) to 99% (316L) (§7) |
| Material sets weight, speed, transport capacity, torsional performance and environmental resistance | Frame mass → hours per leg and cargo capacity; stiffness/torsion, heat, cryogenic, corrosion and space modifiers on event cards (§3) |
| Genuine trade-offs (light/fast/more cargo vs vulnerable) | CFRP: 6 crates and 7 h/leg but 73% survival. 316L: 3 crates and 10 h/leg but 99% survival (§7) |
| Board/route, scripted events, dice, understandable success %, repair and shortcut decisions | Six-leg route map; per-leg event decks; d20 vs DC with the success/partial/fail % shown before every roll; *Push hard* (shortcut), *Play it safe*, hangar repairs and inspections |
| Legs 3 and 6 are probability-based; Leg 6 is specialist-focused | Leg 3 cards have no material modifiers. Leg 6 has one crisis card per role, with +3 for the specialist and a +3 specialist question |
| Legs 1, 2, 4, 5 = specific strength & stiffness, fatigue, thermal, vacuum/space | Card decks `l1*`, `l2*`, `l4*`, `l5*` (§4) |
| Metallurgy central: operating conditions ↔ properties ↔ processing ↔ microstructure | Two processing routes per frame change modifiers; heat can permanently over-age or soften a microstructure; fatigue cracks grow, and their critical size scales with K_IC (§3.3, §5) |
| Material-selection rationale, cost and environment | Codex pages and Ashby charts; budget points; life-cycle CO₂e per crate; debrief discussion prompts (§6) |
| Hosted online; host room via code and link; one-screen pass-and-play; return to lobby | GitHub Pages and Supabase rooms with code, link and QR. Pass-and-play has a hand-over screen. The host can return everyone to the lobby with their choices kept (§8) |
| One-minute control window per crew | 60 s per turn, enforced by a shared server clock. When time runs out the autopilot flies the standard option and control passes on. The host can pause; the timer can be set to 45 s, 90 s or off |
| Tutorial teaches play; cargo purpose explained | 12-step interactive tutorial with a live dice-odds widget and a cargo calculator; Codex "Cargo" and "Scoring" tabs; cargo facts shown in setup |
| Rubric: fidelity, rationale and reflection, playable rules, playtesting evidence, presentation | This document; `02_Rules.md`; `03_Playtesting_Report.md`; `04_Presentation_Plan.md` |

---

## 2. Design concept

**Fantasy layer.** A tabletop adventure in which each crew's character sheet is a materials datasheet. Crews fly an experimental craft from *Ironhold Spaceport* to *Station Meridian* in orbit. The journey climbs physically through the environments where real material limits appear: heavy-lift climb → gust-loaded storm → open sky → hypersonic heating → hard vacuum → docking.

**Learning layer.** Every modifier is a *ranking derived from a real property*, and the game shows the reason at the moment it matters. A 4130 crew entering Earth's shadow sees: "−4: BCC steel below its ductile-to-brittle transition: cleavage fracture (cf. Liberty ships)". A short "Metallurgy note" after each roll gives the general principle. The aim is that players *experience* a property relationship (it cost them a crate) before they *read* it.

**Design principles**

1. *No dominant material.* Each frame should win some legs, lose others, and have a real chance overall.
2. *Visible odds.* D&D-style d20 rolls, but the success/partial/failure percentages are always shown. Decisions are about risk, not guesswork.
3. *Processing matters.* The same alloy, processed differently, should play differently.
4. *Short and replayable.* Each crew draws its own event card per leg (3–8 per deck), so a class sees many hazards in one game.
5. *Classroom-ready.* Phones join by QR code; a projector can spectate; the host can pause for discussion.

---

## 3. Materials: data, selection rationale and game translation

### 3.1 Property basis

Typical values for the stated condition, taken from ASM handbooks, manufacturer and MatWeb datasheets and the textbooks in the Harvard reference list.

| Frame (condition) | ρ (g/cm³) | E (GPa) | σy (MPa) | σy/ρ (kN·m/kg) | ∛E/ρ | Fatigue | K_IC (MPa√m) | Max service T (°C) | k/α | Structure |
|---|---|---|---|---|---|---|---|---|---|---|
| Ti-6Al-4V (mill-annealed) | 4.43 | 114 | 880 | 199 | 1.09 | ≈510 MPa, endurance limit | 55–75 | ≈350–400 | 0.8 | HCP α + BCC β |
| 7075-T6 | 2.81 | 71.7 | 503 | 179 | 1.48 | ≈159 MPa at 5×10⁸, no limit | 20–29 | ≈120 | 5.5 | FCC |
| 316L (annealed) | 8.0 | 193 | 170–290 | ≈30 | 0.72 | ≈240 MPa, endurance limit | >100 | ≈800 | 1.0 | FCC |
| CFRP (quasi-iso., epoxy) | 1.58 | 50–70 | 600–800 (UTS) | ≈440 | 2.48 | 60–70% of static at 10⁷ | n/a (G_IC) | ≈120–150 (Tg 180) | ≈5 | Laminate |
| WE43 (T6) | 1.84 | 44 | 165–200 | ≈100 | 1.92 | ≈85–110 MPa, no limit | 14–16 | ≈250 | 1.9 | HCP |
| 4130 (normalised) | 7.85 | 205 | 435–460 | ≈58 | 0.75 | ≈300–480, endurance limit | 60–110 | ≈400–450 | 3.5 | BCC ferrite + pearlite |

Two observations drive much of the design:

- **E/ρ ≈ 25 for every metal here.** Specific stiffness alone cannot separate Ti, Al, Mg and steel. The separation comes from the *shape* of the design. A panel resisting buckling scales with ∛E/ρ, and a thin-walled tube resisting torsional buckling at fixed mass gains from low density through thicker walls. That is why WE43, a weak alloy, wins the panel-buckling card, and why Leg 1 has three different cards (strength-limited, flutter/torsion-limited and panel-limited).
- **No material wins every thermal test.** The materials that hold strength when hot (316L, Ti) have the worst conductivity-to-expansion ratio (k/α) and distort badly in a thermal gradient. Al and CFRP are the reverse. Leg 4 therefore contains both cards, plus a fire card.

### 3.2 From properties to game statistics

| Game statistic | Physical basis | Ti | Al | 316L | CFRP | Mg | 4130 |
|---|---|---|---|---|---|---|---|
| Hours per leg | Relative frame mass for equal loads (≈80% stiffness/buckling-limited, 20% strength-limited) → thrust-to-weight | 8.5 | 8 | 10 | 7 | 7 | 10 |
| Cargo capacity (crates) | Payload = fixed max mass − frame mass | 5 | 5 | 3 | 6 | 5 | 4 |
| Integrity | Toughness / damage tolerance | 13 | 11 | 17 | 10 | 10 | 14 |
| Critical crack stage | a꜀ ∝ (K_IC/σ)² | 3 | 2 | 4 | (delamination) | 2 | 3 |
| Repair modifier | Field repairability: weldable 4130 and 316L; riveted doublers on Al; inert-gas welding for Ti; scarf repair for CFRP | −1 | +1 | +2 | −2 | −1 | +3 |
| Starting spares and budget points | Cost of material plus fabrication | 1 / +1 | 3 / +3 | 3 / +3 | 1 / 0 | 2 / +2 | 4 / +4 |

Event-card modifiers run from −4 to +4 (±20 percentage points). Each card's modifiers come from the specific mechanism it tests. For example, *Cold Soak* uses crystal structure and DBTT, *Atomic Oxygen* uses the Pilling–Bedworth ratio and polymer reactivity, and *Outgassing & Cold Welding* uses galling tendency, outgassing and vapour pressure. A single generic "space" stat is avoided on purpose: in reality each environmental mechanism ranks the materials differently.

### 3.3 Processing routes (microstructure → modifiers)

| Frame | Route A | Route B | Real trade-off represented |
|---|---|---|---|
| Ti-6Al-4V | Mill-annealed: fine equiaxed α (+fatigue, +notch) | β-annealed: lamellar α (+toughness, +crack tolerance, +creep; −HCF) | Equiaxed resists crack *initiation*; lamellar resists crack *growth* |
| 7075 | T6 peak-aged (+strength, −SCC) | T73 over-aged (−strength, +SCC/corrosion, +crack tolerance) | The classic strength-vs-stress-corrosion choice in thick aerospace sections |
| 316L | Solution-annealed (+toughness) | Cold-worked (+3 strength; −heat, −corrosion, −integrity) | Strain hardening; recovery and recrystallisation at temperature; strain-induced martensite |
| CFRP | Toughened epoxy, autoclave | Cyanate ester (+heat, +vacuum, +AO; −impact, −integrity) | Space-grade low-outgassing matrices are more brittle |
| WE43 | Sand-cast + T6, coarse grains (+creep) | Extruded, fine grains (+strength, +fatigue; −creep) | Hall–Petch (steep for Mg) vs grain-boundary sliding at temperature |
| 4130 | Normalised ferrite–pearlite (+repair, +integrity) | Quenched & tempered martensite (+strength, +fatigue, +cryo; −repair, −corrosion/H₂) | Welding destroys a Q&T temper; high strength raises hydrogen-embrittlement risk |

Heat can also **change the microstructure during play**. A failed Mach 3 check over-ages 7075 (−2 strength, permanently), softens cold-worked 316L or Q&T 4130, forms α-case on Ti, or damages the CFRP matrix. A patch cannot fix a microstructure; only the Metallurgist's once-per-game *field heat treatment* can. This turns the processing ↔ microstructure ↔ property link into a game mechanic rather than a footnote.

### 3.4 Material-locked options ("★ specials")

Some options are available only when the metallurgy allows them. Locked options stay on screen with the reason, because the lock itself teaches something:

- *Stay below the endurance limit* — Ti, 316L and 4130 only. "Aluminium and magnesium alloys have no true endurance limit…"
- *Let it yield (ductile reserve)* — 316L and 4130 only, because of their high elongation and work hardening.
- *Aeroelastic tailoring* — CFRP only, using bend–twist coupling (as on the X-29).
- *Thicken the skin* — low-density frames only. This is the ∛E/ρ argument as an action.
- *Cold-expand the holes* — metals only, using compressive residual stress.

---

## 4. Route and legs

| Leg | Topic | Cards (each crew draws one) | Teaching focus |
|---|---|---|---|
| 1 The Heavy Lift | Specific strength & stiffness | Max-G pull-up (σy/ρ) · Flutter boundary (torsion per kg) · Skin-panel buckling (∛E/ρ) | Material indices; cargo raises loads |
| 2 The Storm Corridor | Fatigue | Ten thousand gusts (S–N, endurance limit) · Rivet-hole hot spot (Kt, Aloha 243, Comet) · Engine-mount resonance (damping) · Salt-spray corrosion fatigue | Initiation vs growth; hidden cracks; damage tolerance |
| 3 Wildcard Skies | Probability (no material modifiers) | Tailwind, bird strike, navigation glitch, supply drone, solar storm, distress beacon, canyon shortcut, flame-out | Probability × consequence, expected value, risk appetite |
| 4 The Hypersonic Burn | Thermal behaviour | Mach 3 skin heating (SR-71) · Sun-side warp (k/α) · Engine-bay fire | Microstructural stability, Tg, creep, distortion, ignition |
| 5 The Edge of Space | Vacuum & space | Cold soak (DBTT) · Atomic oxygen & UV (Pilling–Bedworth, LDEF) · Outgassing & cold welding (ASTM E595, galling, Mg sublimation) · Micrometeoroid (Whipple shield, BVID) | Environment-specific mechanisms |
| 6 Docking at Meridian | Specialist challenge | One crisis per role (manual docking, cracked collar, fracture detective, weld-flaw NDT, seal/coating crisis, cargo transfer) | Fractography, NDT selection, safety factors, surface engineering, payload |

**Fatigue as a persistent system.** Fatigue cracks are created *hidden*; players see "suspected damage". Each crack grows one stage at the start of every leg. Past the material's critical stage (higher for tougher materials) it fast-fractures for 5 damage. Crews can spend an hour to inspect and then a spare to repair. The NDT Inspector finds damage at once and stop-drills it. Fast fracture was the single largest cause of craft loss in simulation (3.9% of crews), which suits a fatigue-centred course.

---

## 5. Core mechanics and why they were chosen

- **d20 vs DC with three tiers.** The d20 was chosen because each +1 is a clean 5 percentage points, so odds are easy to read and to teach. The *partial* tier (within 5 of the DC) reduces swinginess and gives "damaged but flying" outcomes, which better represent real structures than pass/fail.
- **Approach choice on every card.** *Standard*, *Push hard* (shortcut: +3 DC, −3 h, +1 damage on a failure), *Play it safe* (−3 DC, +3 h), and ★ specials. A strong material lets a crew afford shortcuts, so material advantage turns into speed or safety rather than only into a better roll.
- **Cargo.** Cargo is the payload and the main scoring source, so it is the purpose of the mission. Capacity follows from frame mass (payload fraction). Each 2 crates aboard gives −1 on strength and fatigue checks (higher load per g and per gust) and each crate adds 0.5 h per leg. Players can jettison a crate for +3 just before a roll. This makes the classic airframe trade — structure mass vs payload — the first decision every crew makes.
- **Roles.** Each role has a home leg, a passive bonus and a once-per-game ability. Leg 6 is written per role, so role choice matters at the climax even though the material does not.
- **Briefing questions.** These are optional multiple-choice questions, three options each with an explanation, worth +1 on that roll. They reward revision without blocking play. The Metallurgist gets +2, and the Leg 6 specialist question is worth +3.
- **Timer.** A one-minute control window keeps six-crew games moving and fulfils the brief. When it expires, the autopilot chooses the safe default (the standard profile, or the no-roll option on Leg 3), so a distracted crew is never punished by a random choice.

---

## 6. Cost and environmental considerations

- **Cost.** The material-plus-fabrication cost tier sets starting spares (maintenance budget) and end-of-game budget points (4130 +4, Al and 316L +3, Mg +2, Ti +1, CFRP 0). Expensive frames therefore pay twice: fewer repairs and less programme credit. The debrief shows an indicative raw-material cost per frame.
- **Environment.** The debrief gives a life-cycle view for each crew:
  - embodied CO₂e of the frame (frame mass × kg CO₂e/kg);
  - fuel CO₂e for the mission (all-up mass × legs);
  - CO₂e per delivered crate, with embodied carbon shared over a 200-mission life.

  A Green award (+3) goes to the lowest per-crate figure. The functional unit — CO₂e *per crate delivered*, not per kg of material — is deliberate: it shows why aircraft accept high-embodied materials (the use phase dominates). The debrief then asks the break-even question: how many missions must CFRP fly to repay its embodied carbon over 4130?
- **Recyclability.** Recyclability is listed in the Codex and the debrief (thermoset CFRP poor; steels and Al excellent). It feeds the discussion prompts rather than the score.

---

## 7. Balance: method and outcome (summary — full data in `03_Playtesting_Report.md`)

Bots played the game through the same engine the browser uses, with seeded and reproducible random numbers. The final configuration over 20,000 six-crew games:

| Frame | Win rate (fair = 16.7%) | Survival | Mean score | Score SD |
|---|---|---|---|---|
| Ti-6Al-4V | 13.5% | 83.7% | 41.2 | 17.6 |
| Al 7075 | 21.0% | 83.4% | 42.3 | 18.7 |
| 316L | 7.9% | 99.1% | 44.2 | 8.4 |
| CFRP | 29.9% | 72.5% | 39.8 | 22.8 |
| Mg WE43 | 16.0% | 67.1% | 34.8 | 22.9 |
| 4130 | 11.6% | 97.0% | 44.8 | 10.4 |

The first version was badly unbalanced: CFRP won 54% of six-crew games and 316L 0.7%. Five tuning passes, logged in the playtesting report, brought every frame into a 8–30% band. The remaining spread is mostly *variance*, not average strength. 316L and 4130 have the **highest mean scores** but the lowest spread, so they rarely top a six-crew table. CFRP and WE43 are high-risk and high-reward. This was kept on purpose, because it is a real engineering lesson about reliability and risk, and the debrief asks students about it directly. In two-crew games the spread narrows to 38–58%.

Decisions matter. In mixed games, "sensible" bots (expected-value reasoning) won 25.2% against 7.1% for always-cautious and 17.7% for always-reckless bots.

---

## 8. Technical architecture

- **Static web app** (HTML, CSS, vanilla JavaScript modules; no build step) hosted on GitHub Pages, so there are no local files for players.
- **Rules engine** (`engine.js`): a pure state machine, `act(state, action, ctx) → newState`. The same code runs pass-and-play, online rooms, the test suite and the balance simulator, so the tested game is the played game.
- **Online rooms** (Supabase, Postgres 17):
  - each room is one row;
  - clients apply actions locally and write the next state with an optimistic version check (a database trigger rejects out-of-order versions);
  - Realtime pushes changes to every device; polling is the fallback for restrictive campus Wi-Fi;
  - presence shows who is connected;
  - a shared server clock enforces the 60 s window, and any device can trigger the timeout after a grace period, so a dropped phone never stalls the game;
  - the host can pause, return everyone to the lobby or take control of an offline player's crew.
- **Pass-and-play** shares the engine. A hand-over screen starts each crew's minute only when they are ready. The game is saved on the device.
- **Privacy.** Only anonymous results (materials, roles, scores, timings) are stored, and only when the host leaves sharing on.

---

## 9. Critical reflection

**What works**

- The "reason at the moment of the roll" pattern makes property relationships concrete. The locked ★ options teach as much as the open ones.
- Splitting each environment into mechanism-specific cards produced genuinely different winners on each card. That is more faithful than a single "heat" or "space" stat, and it avoided an obvious best material.
- Simulation-led balancing turned subjective tuning into evidence. It also exposed things design intuition missed, such as the effect of variance on win rate and the time bonus initially dominating the score.

**Limitations and simplifications**

1. *Ordinal modifiers.* A −4 to +4 scale compresses large real differences (CFRP's specific strength is about 15× that of annealed 316L) and exaggerates small ones. The numbers rank materials; they do not predict them.
2. *One property per mechanism.* Real performance depends on product form, thickness, orientation (especially for anisotropic CFRP and textured Mg), surface finish and design detail. These are mostly abstracted away.
3. *Frame-mass model.* Relative frame masses assume one blend of strength- and stiffness-limited structure. Another blend would reorder Mg against Al, and Ti against 4130.
4. *Life-cycle numbers* are indicative: CO₂e/kg varies by route (Pidgeon vs electrolytic Mg, primary vs recycled Al), and the fuel model is linear in mass. The award judges a single functional unit and service life; changing either changes the winner, which is a discussion point but also a sensitivity.
5. *Cost counts twice* (spares and budget points). This was deliberate, to give cost enough weight, but it is a modelling choice.
6. *Bots are not people.* Simulated players answer 70% of questions correctly and reason about expected value. Real students will be more risk-seeking, slower in large groups, and will learn across games. Human playtesting (protocol in the playtesting report) is needed to confirm timings and learning outcomes.
7. *Variance-driven win rates.* Reliable frames rarely win six-crew games. Raising their reward ceiling further would undermine the payload trade-off, so this is accepted and discussed rather than removed.
8. *Trust model.* Online rooms trust the clients, so a determined student could cheat through the browser console. That is acceptable for a classroom but not for competitive play; a server-authoritative edge function would fix it.
9. *Accessibility.* Colour is never the only cue (✓ ~ ✗ symbols and text accompany it), and there is a light projector mode and reduced-motion support. A full screen-reader and contrast audit has not been done.

**Future work**

- Additional processing routes (additively manufactured Ti with HIP; Al-Li alloys; thermoplastic CFRP), plus an "upgrade" phase between games.
- Teacher dashboard: aggregated briefing-question accuracy per topic for formative assessment.
- Server-authoritative rooms; a reconnect-by-code flow.
- Calibrate the time-per-turn estimates and difficulty with human playtest data, then retune.

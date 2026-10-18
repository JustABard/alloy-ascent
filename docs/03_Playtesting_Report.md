# SkyForge — Playtesting Report

Playtesting has two strands:

- **A. Automated playtesting.** Bots play complete games through the same rules engine the web game uses. This was used for balance, game length and edge cases.
- **B. Human playtesting.** Structured classroom sessions using the protocol, log and questionnaire below, with built-in data capture from the game itself.

Strand A is complete; its numbers are reproducible with `npm run sim`. Strand B is set up and ready: complete it with your team and add the results in §B.5. Do not mix the two kinds of evidence when reporting.

---

## A. Automated playtesting

### A.1 Method
- **Engine.** `web/js/engine.js` is the same file the browser loads. The simulator (`sim/simulate.mjs`) imports it directly, so balance results describe the real game.
- **Bots:**
  - **Sensible** — for each option, including jettison and ability use, estimates expected cost = Σ P(tier) × (damage × fragility weight + hours + 5 × crates lost − points). Picks the lowest. Inspects and repairs cracks when it has spares.
  - **Reckless** — always pushes hard.
  - **Cautious** — always plays it safe.
- **Set-up.** Random material assignment (unique frames), random processing route and role, and a cargo load of full capacity or capacity − 1.
- **Sample.** 20,000 six-crew games, 10,000 four-crew games and 10,000 two-crew games, plus 10,000 mixed-policy games, all on the standard route (the same event for every crew), and 10,000 six-crew games with *Random events* on. Seeded RNG (mulberry32) makes the run reproducible.
- **Engine tests.** `sim/test-engine.mjs` checks:
  - only Success or Failure, and the odds sum to 1;
  - on the standard route every crew faces the same event and Leg 6 is Manual Docking; with random events, crews draw from the leg decks and Leg 6 follows the role;
  - every card explains every material;
  - Legs 3 and 6 have no material modifiers;
  - permission rules for online play;
  - 300 random full games always terminate with consistent score breakdowns.

### A.2 Balance iteration log (6 crews, sensible bots)

| Version | Change | CFRP | Al | WE43 | Ti | 4130 | 316L | Mean-score range |
|---|---|---|---|---|---|---|---|---|
| v0 | First draft: DC 12, crate 5 pts, time 1 pt/h, no completion bonus | **53.9%** | 23.6% | 9.1% | 9.3% | 3.4% | **0.7%** | 25.7–39.7 |
| v1 | DC 11; time ½ pt/h; +8 completion bonus; budget points; WE43 integrity 10; role tweaks | 43.1% | 26.9% | 17.5% | 6.4% | 5.5% | 0.6% | 35.2–44.5 |
| v2 | Payload capacity Ti 4→5, 4130 3→4, 316L 2→3; 316L faster | 36.6% | 22.1% | 16.6% | 10.5% | 11.0% | 3.3% | 36.0–46.0 |
| v3 | +10 completion bonus; 316L integrity 17, 10 h/leg; CFRP fatigue/galvanic/impact corrected | 34.5% | 23.1% | 17.1% | 10.9% | 9.7% | 4.8% | 37.7–47.6 |
| v4 | Crate value 5→4 (narrows high-payload upside) | 30.0% | 23.0% | 17.4% | 10.1% | 12.0% | 7.4% | 34.8–44.5 |
| v5 | Ti 9→8.5 h/leg | 29.9% | 21.0% | 16.0% | 13.5% | 11.6% | 7.9% | 34.8–44.8 |
| v6 | Structural Engineer's *Redundant load path* made automatic (no checkbox) | 31.1% | 21.5% | 15.9% | 12.9% | 10.9% | 7.5% | 36.1–45.4 |
| **v7 (final)** | Partial tier folded into Success (every DC −5); in-game quiz removed; standard route of fixed events with *Random events* as an option; Leg 6 = Manual Docking; role retune | **26.7%** | **19.4%** | **15.3%** | **17.8%** | **10.2%** | **10.6%** | **31.9–40.8** |

Fair share for 6 crews is 16.7%. Versions v0–v4 used 1,500–2,000 games each; v5–v7 used 20,000. Mean scores fall by about 4 points in v7 because the quiz's insight points are gone, not because crews do worse.

**What the tuning taught us**
- In v0 the schedule bonus (1 pt/h) was the biggest score difference between light and heavy frames. Speed was over-rewarded compared with survival.
- Mean score and win rate are different things. 316L and 4130 finish with among the **highest mean scores** (40–41, level with Ti) but the **lowest spread** (SD 9–10 vs 21–22 for CFRP and WE43). In a six-way contest, the top score usually comes from a high-variance frame that got lucky. More payload for steels would have fixed this numerically, but it would break the core physical trade-off (heavier structure → less payload). So we kept it and turned it into a discussion question.
- v6 made the Structural Engineer's once-per-game save trigger automatically on the first Failure, instead of needing a checkbox ticked before the roll. Its six-crew win rate rose from 13.0% (weakest role) to 20.6% (strongest), because a pre-roll choice is easy to waste: you have to guess which roll will fail. All six roles now sit between 12.7% and 20.6%, and every frame shifted by less than 1.5 points.
- v7 applied four review requests together: no Partial results (a roll within 5 of the old DC now succeeds, so every DC dropped by 5), no in-game quiz, every crew facing the same event on each leg by default, and Manual Docking as the Leg 6 event. Two-tier rolls made the Structural Engineer's automatic save (now Failure → Success) too strong: 27.9% win rate in a 2,000-game check. It was limited to strength and stiffness checks. The Metallurgist lost the quiz bonus and gained +1 on every other material check, the NDT Inspector's passive rose from +1 to +2, and the Surface Engineer's bonus now covers cryogenic checks. Roles now sit between 13.2% and 21.7%.
- A fixed route concentrates risk. When every crew faces the same Leg 5 cold soak, BCC 4130 is the frame that suffers, and on the standard route Leg 6 is Manual Docking, where only a Test Pilot gets a bonus. Both now appear at the top of the causes of loss (below). Frame win rates moved by less than 5 points; Ti gained most (12.9% → 17.8%) and CFRP lost most (31.1% → 26.7%).
- The material modifiers were mostly right first time. The imbalance came from **scoring weights**. Material fidelity and game balance can be tuned largely independently.

### A.3 Final results (v7)

**Six crews, standard route** — 20,000 games · 34.9 turns per game · 7.6% ties

| Frame | Win rate | Survival | Mean score | Crates delivered | Mean hours | Score SD |
|---|---|---|---|---|---|---|
| Ti-6Al-4V | 17.8% | 90.2% | 40.5 | 3.72 | 51.1 | 15.0 |
| Al 7075 | 19.4% | 85.1% | 38.5 | 3.48 | 52.0 | 17.6 |
| 316L | 10.6% | 99.3% | 40.8 | 1.94 | 57.1 | 8.7 |
| CFRP | 26.7% | 77.4% | 37.5 | 4.02 | 49.0 | 21.0 |
| Mg WE43 | 15.3% | 69.7% | 31.9 | 2.83 | 43.3 | 21.9 |
| 4130 | 10.2% | 97.8% | 40.1 | 2.91 | 61.6 | 10.0 |

**Six crews, random events on** (10,000 games): Ti 14.5% · Al 20.4% · 316L 7.8% · CFRP 29.5% · WE43 16.5% · 4130 11.2%; survival 76.0% (WE43) to 99.3% (316L).

**Four crews** (fair share 25%): Ti 26.9% · Al 29.6% · 316L 15.6% · CFRP 36.4% · WE43 23.5% · 4130 16.1%.

**Two crews** (fair share 50%): Ti 53.1% · Al 52.5% · 316L 42.0% · CFRP 57.9% · WE43 44.8% · 4130 43.4%.

**Roles** (six crews, standard route): Test Pilot 21.7% · Structural Engineer 16.5% · Metallurgist 13.8% · NDT Inspector 13.4% · Surface & Corrosion Engineer 13.2% · Quartermaster 21.4%.

**Where each frame struggles.** Success % / failure % on each leg's standard event, six-crew batch:

| Frame | L1 Max-G pull-up | L2 Ten thousand gusts | L3 Engine flame-out | L4 Mach 3 heating | L5 Cold soak | L6 Manual docking |
|---|---|---|---|---|---|---|
| Ti-6Al-4V | 71.9 / 28.1 | 63.9 / 36.1 | 93.5 / 6.5 | 79.6 / 20.4 | 77.6 / 22.4 | 57.2 / 42.8 |
| Al 7075 | 67.6 / 32.4 | **46.9 / 53.1** | 93.4 / 6.6 | **50.2 / 49.8** | 79.1 / 20.9 | 57.7 / 42.3 |
| 316L | **58.0 / 42.0** | 64.1 / 35.9 | 93.3 / 6.7 | 79.8 / 20.2 | **84.5 / 15.5** | 57.2 / 42.8 |
| CFRP | **75.0 / 25.0** | 64.1 / 35.9 | 93.0 / 7.0 | 58.1 / 41.9 | 69.0 / 31.0 | 57.3 / 42.7 |
| Mg WE43 | 61.3 / 38.7 | 50.3 / 49.7 | 93.4 / 6.6 | 69.4 / 30.6 | 63.4 / 36.6 | 55.9 / 44.1 |
| 4130 | 61.5 / 38.5 | **69.0 / 31.0** | 93.1 / 6.9 | 72.2 / 27.8 | **51.2 / 48.8** | 57.2 / 42.8 |

The fixed route makes each leg's lesson easy to read: 7075 struggles with fatigue (no endurance limit) and heat (over-ageing), 4130 with the cold soak (BCC below its DBTT), 316L with the strength-limited pull-up, and CFRP leads the pull-up. Legs 3 and 6 are flat across materials, as the brief requires. On the material legs, raw success rates differ less than the modifiers suggest. Bots with weak frames choose *Play it safe* (slower) and bots with strong frames choose *Push hard* (faster). Material advantage therefore shows up as **time and risk**, not only as success rate. That matches how engineers actually use a margin.

**Processing routes** (six-crew win rate / survival):

| Frame | Route A | Route B | Reading |
|---|---|---|---|
| Ti-6Al-4V | Mill-annealed 17.1% / 89.9% | β-annealed 18.5% / 90.4% | Evenly matched: initiation resistance vs growth resistance |
| Al 7075 | T6 **20.5%** / 84.4% | T73 18.3% / **85.7%** | T6's strength wins slightly more; T73's SCC and toughness benefits survive slightly more |
| 316L | Annealed **11.8%** / 99.5% | Cold-worked 9.4% / 99.0% | Extra strength is lost to heat and corrosion |
| CFRP | Epoxy **28.0%** / 76.3% | Cyanate ester 25.4% / **78.5%** | Space-grade matrix survives Legs 4–5 better but costs impact toughness and payload score |
| WE43 | Cast T6 14.6% / 68.3% | Extruded **16.0%** / 71.2% | Fine grains (Hall–Petch) slightly ahead |
| 4130 | Normalised **10.4%** / 98.8% | Q&T 10.0% / 96.8% | Repairability and toughness edge out peak strength |

The higher-strength route wins in only two of six frames (7075-T6 and extruded WE43), and only narrowly. Elsewhere damage tolerance, repairability and environmental resistance matter more over a whole mission — the same reasoning behind T73/T7351 tempers and normalised tube frames in practice.

**Causes of craft loss** (share of all crews, six-crew batch, standard route):

| Cause | Share of crews |
|---|---|
| Manual docking (Leg 6) | 5.0% |
| Cold soak (DBTT, Leg 5) | 3.5% |
| Fast fracture from a growing fatigue crack | 2.5% |
| Mach 3 skin heating (Leg 4) | 2.0% |
| Engine flame-out (Leg 3) | 0.3% |
| Ten thousand gusts (Leg 2) | 0.1% |

The docking figure partly reflects the bots, not the rules. Their cost model does not know that a failure can destroy the craft, so a badly damaged bot still flies the bold approach (DC 10, 3 damage on a failure). A human crew with 3 integrity or less would wait for station support (DC 2). Check this in the human playtests.

**Does decision-making matter?** Mixed games with 6 crews: 2 reckless, 2 cautious and 2 sensible, in random seats.

| Policy | Win rate | Survival | Mean score |
|---|---|---|---|
| Sensible | 21.5% | 86.8% | **38.1** |
| Reckless | **22.3%** | 80.6% | 36.1 |
| Cautious | 6.2% | 98.1% | 37.9 |

Always playing it safe is clearly punished. Sensible play has the highest mean score, but reckless play now wins about as often. In v6 sensible bots won 25.5% to the reckless bots' 18.1%. Folding the partial band into Success made *Push hard* succeed far more often, so a high-variance strategy pays off in a six-way contest. If human playtests show students pushing every roll, the fix is to raise the *Push hard* failure damage from 1 to 2.

### A.4 Game length
Turns per game are 11.7 (2 crews), 23.3 (4 crews) and 34.9 (6 crews). At 20–30 s per turn, plus about 2 minutes of set-up:

| Crews | Estimated length |
|---|---|
| 2 | ≈ 6–8 min |
| 4 | ≈ 10–14 min |
| 6 | ≈ 14–19 min |

The 60 s window caps the worst case. To keep six-crew games within 15 minutes:
- use a 45 s timer;
- or group the class into fewer, larger crews.

These timings are estimates. Measure them in strand B.

### A.5 Bugs and issues found during testing (and fixed)
- **Greek letters uppercased.** Uppercase styling turned "σy/ρ" into "ΣY/Ρ" in tags. Fixed by removing the text transform from tags.
- **Small-caps alloy names.** The display font rendered "Ti-6Al-4V" as "TI-6AL-4V" in Codex headings. Changed to a condensed sans font.
- **Shared tab identity.** Two browser tabs on one laptop shared a player identity, so one-laptop demos could not show two players. Identity is now per tab, plus *Take control* for crews whose player has disconnected.
- **Typing overwritten.** Remote updates could overwrite text being typed in the lobby. The focused input's value is now preserved across re-renders.
- **Overlapping chart labels.** Ashby chart labels overlapped for 316L and 4130. Labels are now offset and guide lines clipped.
- **Verified online behaviour:**
  - two clients joining by code;
  - live sync and presence;
  - the 60 s timeout autopilot handing control on;
  - host pause and resume;
  - return to lobby with choices kept;
  - offline-player takeover.

---

## B. Human playtesting (protocol — to be completed by the team)

### B.1 Aims
1. Can new players learn the game from the tutorial alone, in under 5 minutes?
2. Does a full game fit 5–15 minutes with 2, 4 and 6 crews?
3. Do players notice, and can they explain, *why* their material helped or hurt them? This is the learning outcome.
4. Do players feel their choices (frame, processing, role, cargo, approach) mattered?
5. Usability: joining by QR or link, the 60 s window, hand-over in pass-and-play.

### B.2 Sessions (suggested)
| Session | Format | Crews | Who |
|---|---|---|---|
| P1 | Pass-and-play on one laptop | 2 | Team members (rules check) |
| P2 | Online, phones | 4 | Course-mates who have not seen the game |
| P3 | Online, phones + projector spectator | 6 | Class-sized group (dress rehearsal for the presentation) |

### B.3 Procedure
1. **Brief:** 30 s. Do not explain the rules; point players to *How to play*.
2. Ask players to do the tutorial, and time it.
3. Play one full game. The observer fills in `playtest/human-playtest-log-template.csv`: start and end times, crews, frames, roles, confusions, bugs and notable moments.
4. At the debrief screen, press **Download results (CSV)** and **Download match log (JSON)**. Save them as `playtest/P#_results.csv` and `playtest/P#_log.json`. With *Share anonymous results* on, the game is also added to **Playtest data** on the title screen.
5. Questionnaire (`playtest/questionnaire.md`), 2 minutes.
6. Quick quiz, 1 minute, before and after if possible: the three questions at the end of the questionnaire, to look for a learning gain.

### B.4 Success criteria
| Measure | Target |
|---|---|
| Tutorial completion time | ≤ 5 min |
| Game length (4 crews) | 8–15 min |
| "I understood why my material helped/hurt me" | ≥ 4 / 5 average |
| "My choices mattered" | ≥ 4 / 5 average |
| Join success (online) | All players join within 2 min |
| Before/after quiz (questionnaire) | More correct answers after the game than before |

### B.5 Results (fill in)
| Session | Date | Crews | Game length | Tutorial time | Winner (frame) | Issues found | Changes made |
|---|---|---|---|---|---|---|---|
| P1 | | | | | | | |
| P2 | | | | | | | |
| P3 | | | | | | | |

*Summary of questionnaire results, notable quotes, and how the design changed in response — keep this honest. Negative findings, and what you did about them, score well under "critical reflection".*

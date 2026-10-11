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
  - **Sensible** — for each option, including jettison and ability use, estimates expected cost = Σ P(tier) × (damage × fragility weight + hours + 5 × crates lost − points). Picks the lowest. Inspects and repairs cracks when it has spares. Answers 70% of briefing questions correctly.
  - **Reckless** — always pushes hard (50% answer accuracy).
  - **Cautious** — always plays it safe.
- **Set-up.** Random material assignment (unique frames), random processing route and role, and a cargo load of full capacity or capacity − 1.
- **Sample.** 20,000 six-crew games, 10,000 four-crew games and 10,000 two-crew games, plus 10,000 mixed-policy games. Seeded RNG (mulberry32) makes the run reproducible.
- **Engine tests.** `sim/test-engine.mjs` checks:
  - odds sum to 1;
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
| **v6 (final)** | Structural Engineer's *Redundant load path* made automatic (no checkbox) | **31.1%** | **21.5%** | **15.9%** | **12.9%** | **10.9%** | **7.5%** | **36.1–45.4** |

Fair share for 6 crews is 16.7%. Versions v0–v4 used 1,500–2,000 games each; v5 and v6 used 20,000.

**What the tuning taught us**
- In v0 the schedule bonus (1 pt/h) was the biggest score difference between light and heavy frames. Speed was over-rewarded compared with survival.
- Mean score and win rate are different things. 316L and 4130 finish with the **highest mean scores** (44–45) but the **lowest spread** (SD 8–10 vs 22–23 for CFRP and WE43). In a six-way contest, the top score usually comes from a high-variance frame that got lucky. More payload for steels would have fixed this numerically, but it would break the core physical trade-off (heavier structure → less payload). So we kept it and turned it into a discussion question.
- v6 made the Structural Engineer's once-per-game save trigger automatically on the first Failure, instead of needing a checkbox ticked before the roll. Its six-crew win rate rose from 13.0% (weakest role) to 20.6% (strongest), because a pre-roll choice is easy to waste: you have to guess which roll will fail. All six roles now sit between 12.7% and 20.6%, and every frame shifted by less than 1.5 points.
- The material modifiers were mostly right first time. The imbalance came from **scoring weights**. Material fidelity and game balance can be tuned largely independently.

### A.3 Final results (v6)

**Six crews** — 20,000 games · 34.8 turns per game · 8.1% ties

| Frame | Win rate | Survival | Mean score | Crates delivered | Mean hours | Score SD |
|---|---|---|---|---|---|---|
| Ti-6Al-4V | 12.9% | 85.7% | 42.2 | 3.73 | 51.6 | 16.9 |
| Al 7075 | 21.5% | 85.1% | 43.4 | 3.67 | 51.8 | 18.1 |
| 316L | 7.5% | 99.2% | 44.9 | 2.28 | 58.0 | 8.2 |
| CFRP | 31.1% | 75.2% | 41.4 | 4.03 | 47.7 | 22.3 |
| Mg WE43 | 15.9% | 69.3% | 36.1 | 3.00 | 43.9 | 22.7 |
| 4130 | 10.9% | 97.5% | 45.4 | 3.21 | 62.1 | 10.0 |

**Four crews** (fair share 25%): Ti 22.0% · Al 32.4% · 316L 12.7% · CFRP 39.7% · WE43 24.1% · 4130 16.8%.

**Two crews** (fair share 50%): Ti 47.5% · Al 57.6% · 316L 38.1% · CFRP 61.0% · WE43 46.4% · 4130 44.8%.

**Where each frame struggles.** Success % / failure % on the main check of each leg, six-crew batch:

| Frame | L1 strength/stiffness | L2 fatigue | L3 odds | L4 thermal | L5 space | L6 specialist |
|---|---|---|---|---|---|---|
| Ti-6Al-4V | 45.8 / 25.2 | 40.1 / 30.0 | 54.1 / 19.2 | 44.7 / 28.3 | 50.1 / 23.9 | 52.5 / 21.6 |
| Al 7075 | 48.8 / 23.2 | **29.8 / 38.4** | 56.2 / 18.4 | 41.4 / 31.5 | 53.0 / 20.7 | 54.7 / 20.2 |
| 316L | **31.4 / 37.7** | 42.4 / 28.6 | 53.2 / 20.1 | 49.6 / 24.1 | 50.9 / 23.2 | 53.4 / 20.7 |
| CFRP | **55.4 / 17.5** | 38.8 / 30.4 | 56.2 / 17.3 | 43.2 / 29.0 | **42.2 / 30.8** | 54.1 / 20.7 |
| Mg WE43 | 47.9 / 23.8 | 36.8 / 32.7 | 55.5 / 18.1 | 43.4 / 29.2 | 44.3 / 28.3 | 54.7 / 20.0 |
| 4130 | 33.8 / 35.5 | 42.0 / 28.9 | 54.2 / 19.7 | **49.4 / 23.5** | 42.8 / 30.4 | 54.7 / 19.8 |

Legs 3 and 6 are flat across materials, as the brief requires. On the material legs, raw success rates differ less than the modifiers suggest. Bots with weak frames choose *Play it safe* (slower) and bots with strong frames choose *Push hard* (faster). Material advantage therefore shows up as **time and risk**, not only as success rate. That matches how engineers actually use a margin.

**Processing routes** (six-crew win rate / survival):

| Frame | Route A | Route B | Reading |
|---|---|---|---|
| Ti-6Al-4V | Mill-annealed 12.6% / 85.4% | β-annealed 13.3% / 86.1% | Evenly matched: initiation resistance vs growth resistance |
| Al 7075 | T6 21.1% / 83.2% | T73 22.0% / **87.0%** | Over-aged temper's SCC and toughness benefits pay for its strength loss |
| 316L | Annealed **9.4%** / 99.6% | Cold-worked 5.7% / 98.8% | Extra strength is lost to heat and corrosion |
| CFRP | Epoxy **33.0%** / 77.7% | Cyanate ester 29.3% / 72.7% | Space-grade matrix helps Legs 4–5 but costs impact toughness on a mixed mission |
| WE43 | Cast T6 15.1% / 67.7% | Extruded 16.7% / 70.9% | Fine grains (Hall–Petch) slightly ahead |
| 4130 | Normalised **12.1%** / 98.8% | Q&T 9.7% / 96.2% | Repairability and toughness beat peak strength |

Across the frames, the *peak-strength* processing route rarely wins. Damage tolerance, repairability and environmental resistance matter over a whole mission — the same reasoning behind T73/T7351 tempers and normalised tube frames in practice.

**Causes of craft loss** (share of all crews, six-crew batch):

| Cause | Share of crews |
|---|---|
| Fast fracture from a growing fatigue crack | 3.4% (largest single cause) |
| Cold soak (DBTT) | 1.1% |
| Engine-bay fire | 1.0% |
| Atomic oxygen | 1.0% |
| Micrometeoroid | 0.9% |
| Outgassing & cold welding | 0.9% |

**Does decision-making matter?** Mixed games with 6 crews: 2 reckless, 2 cautious and 2 sensible, in random seats.

| Policy | Win rate | Survival | Mean score |
|---|---|---|---|
| Sensible | **25.5%** | 85.6% | 42.3 |
| Reckless | 18.1% | 77.6% | 37.5 |
| Cautious | 6.4% | 97.3% | 42.2 |

Good decisions beat both extremes, so the game rewards thought rather than only luck.

### A.4 Game length
Turns per game are 11.6 (2 crews), 23.2 (4 crews) and 34.8 (6 crews). At 20–30 s per turn, plus about 2 minutes of set-up:

| Crews | Estimated length |
|---|---|
| 2 | ≈ 6–8 min |
| 4 | ≈ 10–14 min |
| 6 | ≈ 14–19 min |

The 60 s window caps the worst case. To keep six-crew games within 15 minutes:
- use a 45 s timer;
- switch briefing questions off;
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
6. Quick quiz, 1 minute, before and after if possible: three of the briefing questions, to look for a learning gain.

### B.4 Success criteria
| Measure | Target |
|---|---|
| Tutorial completion time | ≤ 5 min |
| Game length (4 crews) | 8–15 min |
| "I understood why my material helped/hurt me" | ≥ 4 / 5 average |
| "My choices mattered" | ≥ 4 / 5 average |
| Join success (online) | All players join within 2 min |
| Briefing-question accuracy (in-game) | Rising from Leg 1 to Leg 5, or between first and second game |

### B.5 Results (fill in)
| Session | Date | Crews | Game length | Tutorial time | Winner (frame) | Issues found | Changes made |
|---|---|---|---|---|---|---|---|
| P1 | | | | | | | |
| P2 | | | | | | | |
| P3 | | | | | | | |

*Summary of questionnaire results, notable quotes, and how the design changed in response — keep this honest. Negative findings, and what you did about them, score well under "critical reflection".*

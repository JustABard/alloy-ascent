# ALLOY ASCENT — Classroom Presentation Plan (≈12 minutes + questions)

**Format:** short talk → live game with the class → evidence and reflection.
**You need:** a laptop on the projector, the site open at https://justabard.github.io/alloy-ascent/ in **light (projector) mode** (☀ button), and phones for 2–6 volunteer crews.

## Run sheet

| Time | Slide / action | Say (speaker notes) |
|---|---|---|
| 0:00 | **1. Title + QR code.** On the projector, *Host an online room* and remove your own crew (spectator board). Leave the QR code up. | "Scan this now — four to six of you are about to fly a spacecraft built from one of six materials. Everyone else: watch the big screen." |
| 0:45 | **2. The brief** | Six candidate frames; six legs; 2–6 crews; 5–15 minutes. The metallurgy has to *drive* the game, not decorate it. |
| 1:30 | **3. Why these six?** Codex → *Compare* (Ashby charts) | "E/ρ is about 25 for every metal here — specific stiffness can't separate them. Shape-dependent indices (∛E/ρ for panels, σy/ρ for ties) and environment-specific mechanisms can. So every leg tests a different mechanism, and no frame wins them all." |
| 2:30 | **4. Property → dice.** Show a turn's *Your odds* box | Each card has a −4…+4 modifier per material from a real property, shown with its reason. Example: Cold Soak — 4130 −4 (BCC, below its DBTT); 316L +4 (FCC, no transition). Success % is shown before rolling. |
| 3:15 | **5. Processing → microstructure → odds** | 7075-T6 vs T73: strength vs stress-corrosion. Heat can *over-age* 7075 mid-game, and a patch can't fix a microstructure. Fatigue cracks hide, grow each leg, and fast-fracture past a size set by K_IC. |
| 4:00 | **6. Route, cargo, roles** (route map + Codex *Cargo*) | Light frames carry more payload (CFRP 6 crates, 316L 3) but are fragile. Leg 3 is pure probability; Leg 6 belongs to your specialist. |
| 4:45 | **7. LIVE: launch.** Volunteers press *Ready*; the host presses *Launch*. Set the timer to **45 s**. | Talk through the first crew's choices out loud: "Your odds are 60% — push hard to save 3 hours, or play it safe?" |
| 5:00–9:00 | **Play Legs 1–2** (and 3 if time allows). Press **Pause** once to discuss a result. | After a fatigue partial: "Notice the ⚠ suspected damage — that's a hidden crack. Do you inspect now, or gamble?" |
| 9:00 | Host → **Lobby** (or let it run during the next slides if the class is engaged) | |
| 9:15 | **8. Playtesting evidence** (`03_Playtesting_Report.md` tables) | 20,000 simulated games: first draft CFRP won 54%, 316L 0.7%. Five tuning passes → 8–30% for every frame. Key insight: steels have the *highest mean score* but the *lowest variance*, so they rarely win a six-way race. That's reliability vs performance. |
| 10:15 | **9. Cost & environment** (a debrief screen) | Budget points and life-cycle CO₂e per crate delivered. The use phase dominates aircraft, so light frames repay embodied carbon — *if* they survive. Ask: how many missions before CFRP beats 4130? |
| 11:00 | **10. Critical reflection** | Ordinal modifiers; one property per mechanism; bots ≠ people; trust model; next steps (human playtests, server-authoritative rooms, more processing routes). |
| 11:45 | **11. Close** — link and QR code | "Play it yourselves — pass-and-play works on one laptop." |

## Suggested slide visuals
- Hero: title screen (dark) with the route map.
- Ashby charts: Codex → Compare.
- A live event card with the *Your odds* breakdown, and the dice overlay.
- Balance table: v0 → v5 win rates (bar chart from `03_Playtesting_Report.md` §A.2).
- Debrief: scoreboard and life-cycle table.

## Pre-flight checklist (the day before and 10 minutes before)
- [ ] **Within 7 days before the presentation**, open the site and host a test room. The free database pauses after a week with no use, unless you enable the keep-alive in `ci/README.md`. If it is paused, press *Restore* in the Supabase dashboard.
- [ ] Test a room with two phones on the classroom Wi-Fi (campus networks sometimes block real-time connections; the game falls back to polling every 2.5 s).
- [ ] Projector: light mode (☀), browser zoom 110–125%.
- [ ] Settings: 45 s timer for the demo, questions on, one crew per frame.
- [ ] Backup plan: if Wi-Fi fails, use **pass-and-play** on the laptop with two volunteers.
- [ ] Have `03_Playtesting_Report.md` tables and two screenshots ready in case the demo overruns.

## Team roles (adjust to your team)
| Person | Role |
|---|---|
| A | Presenter (slides 2–6) |
| B | Host / game master: runs the room on the projector, pauses for discussion |
| C | Evidence and reflection (slides 8–10), handles questions on balance |
| D | Floor support: helps volunteers join, keeps time |

## Likely questions — prepared answers
- **"Why does CFRP win most often?"** It has the highest payload and specific strength. Its 27% loss rate and zero budget points are the counterweights. Steels have higher *average* scores; CFRP wins on *variance*.
- **"Aren't the numbers made up?"** The modifiers are rankings of real properties (table in `01_Design_Rationale_and_Reflection.md` §3). Every one is shown with its reason. They teach ranking and mechanism, not design allowables.
- **"Why is WE43 even an option?"** It is the best metal for panel stiffness per kg and holds strength to 250 °C, but corrosion, low toughness and space effects make it a specialist choice. A Surface & Corrosion Engineer pairs well with it.
- **"Is this cheat-proof?"** No. Clients are trusted (fine for a classroom). Next step: server-authoritative rooms.

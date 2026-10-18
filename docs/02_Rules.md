# SkyForge — Rules of Play

**Players:** 2–6 crews (one device each online, or one shared screen) · **Time:** 5–15 minutes · **Play at:** https://skyforge-game.vercel.app

## Goal
Fly your crew from Ironhold Spaceport to Station Meridian across **six legs** and finish with the most **mission points**. Most points come from delivering cargo and arriving intact, on time and on budget.

## Getting started
- **Online room.** The host presses *Host an online room* and shares the 5-letter code, the link or the QR code. Players open the link on any phone or laptop. A projector can join with *Watch as spectator*.
- **Pass-and-play.** Press *Pass-and-play on one screen* and add crews (2–6).
- **Host settings:**
  - one crew per material (default on);
  - random events (off by default: every crew faces the same event on each leg; on: each crew draws its own card and Leg 6 is a crisis for its role);
  - turn timer (45 s, 60 s, 90 s or off);
  - share anonymous results.

## Set-up (each crew)
1. **Frame material.** Choose Ti-6Al-4V, 7075 aluminium, 316L stainless, CFRP, WE43 magnesium or 4130 chromoly. This sets integrity, hours per leg, cargo capacity, spares, repairability, crack tolerance and budget, plus a modifier on every material event.
2. **Processing route.** Pick one of two routes. It sets the microstructure and shifts certain checks (e.g. 7075-T6 vs T73).
3. **Specialist role.** Pick one of: Test Pilot, Structural Engineer, Metallurgist, NDT Inspector, Surface & Corrosion Engineer, Quartermaster. Each has a home-check bonus and a once-per-game ability.
4. **Cargo.** Load 0 up to your capacity in crates. Each delivered crate scores points. Every 2 crates aboard gives −1 on Strength and Fatigue checks, and each crate adds 0.5 h to every leg.
5. Press **Ready**. The host launches; unready crews are filled in automatically.

## A turn — the one-minute control window
Crews take turns in seat order. Each crew has **60 seconds** (in pass-and-play, the clock starts when the crew taps *I'm ready*).

1. **Start-of-turn effects.** Fatigue cracks grow one stage, and active corrosion costs 1 integrity.
2. **Event.** On the standard route every crew faces the same event on each leg. With *Random events* on, your crew draws its own card for the leg.
3. **Choose an approach.** The success and failure chances are shown for each option:
   - **Standard profile:** the card's DC.
   - **Push hard (shortcut):** DC +3, 3 h faster; a Failure does +1 damage. (Test Pilot: +2 DC, 4 h faster.)
   - **Play it safe:** DC −3, +3 h.
   - **★ Special:** an extra option some frames or crews can use because of their metallurgy. Locked specials show why they are locked.
   - Optionally **jettison a crate** (+3; Quartermaster +4) or use a **once-per-game ability**.
4. **Roll d20 + modifiers.**
   - Total ≥ DC → **Success**.
   - Lower → **Failure**.
   - A natural 20 always succeeds; a natural 1 always fails.
5. **Apply the outcome.** It may cost integrity, hours, crates or spares, or add conditions.
6. **Hangar stop (optional).**
   - **Inspect** (+1 h) to reveal hidden damage.
   - Then one action: **repair** a known condition or **patch the hull** (+3 integrity). This uses 1 spare and +2 h, and succeeds on d20 + repair modifier ≥ 10.
   - Metallurgists may instead **re-heat-treat** once per game.
7. Press **Continue** — control passes to the next crew.

If the timer runs out, the autopilot flies the standard option (or the no-roll option on Leg 3) and control passes on. The host can pause the timer for discussion.

## The six legs
| Leg | Name | Tests | Standard event | Material modifiers? |
|---|---|---|---|---|
| 1 | The Heavy Lift | Specific strength & stiffness (σy/ρ, torsion per kg, ∛E/ρ) | Max-G Pull-Up | Yes |
| 2 | The Storm Corridor | Fatigue (endurance limit, notches, damping, corrosion fatigue) | Ten Thousand Gusts | Yes |
| 3 | Wildcard Skies | Probability and risk | Engine Flame-Out | **No** — pure odds |
| 4 | The Hypersonic Burn | Thermal behaviour (hot strength, k/α distortion, fire) | Mach 3 Skin Heating | Yes |
| 5 | The Edge of Space | Vacuum & space (cold soak/DBTT, atomic oxygen, outgassing/cold welding, micrometeoroids) | Cold Soak in Earth’s Shadow | Yes |
| 6 | Docking at Meridian | Hand-flying the final approach (Test Pilot +3) | Manual Docking — Guidance Lost | **No** — role-driven |

With *Random events* on, Legs 1–5 deal each crew a random card from the leg's deck, and Leg 6 becomes a crisis written for the crew's own role (+3 for its speciality).

## Damage and conditions
- **Integrity 0 = craft lost.** The crew ejects safely, but a lost craft scores only event points.
- **Conditions** persist until repaired:
  - permanent set, misaligned structure, delamination, galled joint, fogged optics, and others;
  - **active corrosion** costs 1 integrity per leg;
  - **over-aged** or **heat-softened** microstructures cannot be patched — only a Metallurgist's field heat treatment fixes them.
- **Fatigue cracks** often start **hidden** ("suspected damage"). They grow one stage per leg and **fast-fracture for 5 damage** beyond your frame's critical stage (316L 4; Ti and 4130 3; Al and Mg 2; +1 for β-annealed Ti or T73 Al). Inspect them, then repair them. An NDT Inspector finds damage at once and stops detected cracks growing.

## Scoring (at the end of Leg 6)
| Category | Points |
|---|---|
| Cargo delivered | 4 per crate |
| Airframe integrity | 1 per point left |
| Mission complete | +10 if your craft arrives |
| Schedule | +½ per hour under the 66 h docking window (−½ per hour late, max −5) |
| Programme budget | 4130 +4 · Al, 316L +3 · Mg +2 · Ti +1 · CFRP 0 |
| Spare parts | +1 per unused spare |
| Event bonuses | e.g. answering a distress call |
| Green award | +3 for the lowest life-cycle CO₂e per delivered crate |

Lost craft score only event points. The debrief shows each crew's journey, the material lessons, a cost and CO₂e table, and discussion questions. The host can then **return everyone to the lobby**, where crews keep their choices, to play again.

## Roles at a glance
| Role | Passive | Once per game |
|---|---|---|
| Test Pilot | +2 handling; cheaper, faster shortcuts; +3 on Manual Docking | Reroll a Failure |
| Structural Engineer | +2 strength, stiffness and notch checks | Automatic: the first failed strength or stiffness check becomes a Success |
| Metallurgist | +2 thermal and cryogenic checks; +1 on every other material check | Field heat treatment (remove over-ageing/softening) |
| NDT Inspector | +2 fatigue and impact checks; sees hidden damage; stops cracks; +3 on crack repairs | +4 on a fatigue/notch/impact check |
| Surface & Corrosion Engineer | +2 corrosion, atomic-oxygen, vacuum and cryogenic checks; corrosion repairs always succeed | +4 on a corrosion/oxidation/vacuum/cryo check |
| Quartermaster | +1 cargo capacity, +1 spare; jettison +4 | First lost crate is saved |

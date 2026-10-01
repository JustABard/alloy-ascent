# ALLOY ASCENT — Six Legs to Orbit

A tabletop-style (D&D-flavoured) engineering game for **2–6 crews** and **5–15 minutes**, built as a second-year metallurgical engineering design project. Each crew chooses an airframe material, its processing route, a specialist role and a cargo load. They then fly six legs to an orbital station, rolling a d20 against odds that come straight from the metallurgy.

**Play online:** https://justabard.github.io/alloy-ascent/
Host a room and share the code, link or QR code, or choose *Pass-and-play* to play on one screen.

| Frame | Family | Character |
|---|---|---|
| Ti-6Al-4V | α+β titanium alloy | Strong, hot-capable, corrosion-proof, expensive |
| 7075 (T6/T73) | Precipitation-hardened Al-Zn-Mg-Cu | Light, cheap, repairable; hates heat and fatigue |
| 316L | Austenitic stainless steel | Heavy and soft, but nearly indestructible |
| CFRP | Carbon-fibre composite | Lightest and stiffest per kg; impact, heat and atomic oxygen are its weak points |
| WE43 | Mg-Y-Nd rare-earth alloy | Lightest metal, stiff panels, good heat; corrodes and dislikes the cold |
| 4130 chromoly | Low-alloy Cr-Mo steel | Cheap, tough, weldable; heavy, rusts, brittle when deep-cold |

The six legs are:

1. Specific strength and stiffness
2. Fatigue
3. Probability (no material modifiers)
4. Thermal behaviour
5. Vacuum and space environment
6. Specialist docking (decided by your role)

## Repository map

| Path | What it is |
|---|---|
| `web/` | The game: static HTML/CSS/JS with no build step. Deployed to GitHub Pages by `.github/workflows/pages.yml`. |
| `web/js/engine.js` | Pure rules engine (state machine), shared by the browser and the simulator. |
| `web/js/data.js` | Materials, processing routes, roles, legs, event cards and every modifier with its reason. |
| `web/js/net.js`, `supabase/schema.sql` | Online rooms: one Postgres row per room, optimistic version checks and Realtime push. |
| `sim/simulate.mjs` | Monte-Carlo balance testing (bots play thousands of games through the real engine). |
| `sim/test-engine.mjs` | Engine test suite, run in CI before every deploy. |
| `docs/` | Design rationale and critical reflection, rules, playtesting report, presentation plan and playtest log template. |

## Running locally

```bash
npm run serve
```

Then open http://localhost:5173. Pass-and-play works offline; online rooms need internet access.

```bash
npm test
```

```bash
npm run sim
```

`npm test` runs the engine tests. `npm run sim` reruns the 20,000-game balance study and writes the results to `docs/playtest/`.

## Online infrastructure

- **Hosting:** GitHub Pages (static).
- **Rooms:** Supabase free tier (Postgres with Realtime). The publishable key in `web/js/config.js` is designed to be public; row-level security restricts it to reading and updating rooms and inserting anonymous results.
- **Keep-alive:** `.github/workflows/keepalive.yml` pings the database daily so the free project does not pause, and it purges rooms that have been idle for three days.
- **Analytics:** anonymous match results (materials, roles, scores, no names) are stored for the in-game **Playtest data** page when the host leaves *Share anonymous results* switched on.

## Licence

MIT. The material property values are typical figures for teaching; they are not design allowables.

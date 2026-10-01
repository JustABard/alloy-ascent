# Automated playtest results
Generated 2026-10-01 by `sim/simulate.mjs` (354.7 s). Same rules engine as the web game; seeded RNG so results are reproducible.

### 6 crews · all materials · sensible bots
20 000 games · 6 crews · 34.7 turns/game · ties 7.6%
Estimated play time at 20–30 s per turn: **11.6–17.3 min** (+≈2 min set-up)

| Material | Win rate | Fair share | Survival | Mean score | Crates delivered | Mean hours | Score SD |
|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 13.5% | 16.7% | 83.7% | 41.2 | 3.63 | 51.5 | 17.6 |
| Al 7075 | 21.0% | 16.7% | 83.4% | 42.3 | 3.58 | 51.7 | 18.7 |
| 316L | 7.9% | 16.7% | 99.1% | 44.2 | 2.23 | 58.2 | 8.4 |
| CFRP | 29.9% | 16.7% | 72.5% | 39.8 | 3.88 | 47.9 | 22.8 |
| Mg WE43 | 16.0% | 16.7% | 67.1% | 34.8 | 2.90 | 43.8 | 22.9 |
| 4130 | 11.6% | 16.7% | 97.0% | 44.8 | 3.17 | 62.3 | 10.4 |

Mean score breakdown by material:

| Material | cargo | integrity | time | spares | complete | budget | insight | bonus | green |
|---|---|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 14.5 | 5.8 | 5.8 | 0.1 | 8.4 | 0.8 | 4.1 | 1.6 | 0.1 |
| Al 7075 | 14.3 | 5.3 | 5.3 | 0.5 | 8.3 | 2.5 | 4.0 | 1.6 | 0.5 |
| 316L | 8.9 | 11.9 | 4.1 | 0.6 | 9.9 | 3.0 | 4.2 | 1.7 | 0.0 |
| CFRP | 15.5 | 3.0 | 6.3 | 0.1 | 7.2 | 0.0 | 4.0 | 1.5 | 2.1 |
| Mg WE43 | 11.6 | 3.2 | 6.3 | 0.2 | 6.7 | 1.3 | 3.8 | 1.4 | 0.3 |
| 4130 | 12.7 | 9.6 | 1.9 | 1.0 | 9.7 | 3.9 | 4.2 | 1.7 | 0.0 |

| Role | Win rate | Survival | Mean score |
|---|---|---|---|
| pilot | 20.1% | 78.6% | 40.2 |
| structural | 13.0% | 82.2% | 39.3 |
| metallurgist | 15.3% | 84.6% | 41.0 |
| ndt | 16.0% | 89.9% | 43.6 |
| coatings | 14.3% | 84.3% | 40.5 |
| quartermaster | 21.3% | 83.1% | 42.6 |

#### Success / failure rate by leg (6-crew batch) — shows WHERE each material is strong or weak
Each cell: success % / failure % on that leg’s main check.

| Material | Leg 1 | Leg 2 | Leg 3 | Leg 4 | Leg 5 | Leg 6 |
|---|---|---|---|---|---|---|
| Ti-6Al-4V | 44.6% / 30.1% | 40.7% / 34.8% | 53.8% / 20.5% | 45.8% / 29.5% | 50.9% / 23.9% | 53.5% / 21.2% |
| Al 7075 | 48.5% / 25.7% | 30.1% / 44.8% | 55.0% / 19.5% | 42.0% / 32.9% | 53.5% / 21.0% | 54.2% / 20.4% |
| 316L | 30.8% / 44.3% | 42.9% / 32.2% | 53.3% / 21.5% | 49.1% / 25.7% | 51.1% / 23.8% | 53.0% / 22.6% |
| CFRP | 55.2% / 20.3% | 38.8% / 36.4% | 56.9% / 18.4% | 44.0% / 30.9% | 43.2% / 31.8% | 53.6% / 21.5% |
| Mg WE43 | 47.3% / 27.5% | 37.3% / 38.1% | 55.9% / 19.4% | 44.4% / 30.6% | 45.6% / 29.6% | 54.6% / 20.4% |
| 4130 | 34.2% / 41.1% | 41.9% / 32.9% | 53.6% / 21.5% | 50.0% / 25.1% | 44.4% / 30.8% | 55.0% / 19.9% |

#### Processing route comparison (6-crew batch)

| Material : processing | Win rate | Survival | Mean score |
|---|---|---|---|
| Ti-6Al-4V Mill-annealed | 13.0% | 83.9% | 41.1 |
| Ti-6Al-4V β-annealed | 14.0% | 83.6% | 41.3 |
| Al 7075 T6 — peak-aged | 20.9% | 81.2% | 41.4 |
| Al 7075 T73 — over-aged | 21.1% | 85.6% | 43.3 |
| 316L Solution-annealed | 9.6% | 99.4% | 45.3 |
| 316L Cold-worked | 6.2% | 98.7% | 43.2 |
| CFRP Toughened epoxy, autoclave | 31.5% | 75.6% | 41.4 |
| CFRP Cyanate-ester, space-grade | 28.3% | 69.3% | 38.1 |
| Mg WE43 Sand-cast + T6 | 15.3% | 66.0% | 34.2 |
| Mg WE43 Extruded, fine-grained | 16.7% | 68.2% | 35.4 |
| 4130 Normalised | 13.1% | 98.4% | 46.0 |
| 4130 Quenched & tempered | 10.0% | 95.6% | 43.6 |

#### Causes of craft loss (6-crew batch)

- fast fracture from a growing fatigue crack: 4622 (3.9% of crews)
- Cold Soak in Earth’s Shadow: 1501 (1.3% of crews)
- Engine-Bay Fire: 1285 (1.1% of crews)
- Outgassing & Cold Welding: 1270 (1.1% of crews)
- Atomic Oxygen & UV: 1244 (1.0% of crews)
- Micrometeoroid Strike: 1199 (1.0% of crews)
- Cracked Docking Collar: 1129 (0.9% of crews)
- Weld-Flaw Hunt: 1051 (0.9% of crews)
- Seal & Surface Crisis: 1020 (0.9% of crews)
- Cargo Transfer Race: 1014 (0.8% of crews)

### 4 crews · random materials · sensible bots
10 000 games · 4 crews · 23.1 turns/game · ties 6.0%
Estimated play time at 20–30 s per turn: **7.7–11.6 min** (+≈2 min set-up)

| Material | Win rate | Fair share | Survival | Mean score | Crates delivered | Mean hours | Score SD |
|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 22.0% | 25.0% | 84.1% | 41.7 | 3.66 | 51.5 | 17.7 |
| Al 7075 | 31.9% | 25.0% | 83.0% | 42.8 | 3.58 | 51.6 | 19.1 |
| 316L | 12.8% | 25.0% | 99.1% | 44.3 | 2.24 | 58.2 | 8.4 |
| CFRP | 39.4% | 25.0% | 73.1% | 40.1 | 3.93 | 47.9 | 22.7 |
| Mg WE43 | 23.2% | 25.0% | 66.2% | 34.7 | 2.86 | 43.7 | 23.3 |
| 4130 | 18.4% | 25.0% | 96.7% | 44.9 | 3.17 | 62.2 | 10.7 |

Mean score breakdown by material:

| Material | cargo | integrity | time | spares | complete | budget | insight | bonus | green |
|---|---|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 14.7 | 5.8 | 5.8 | 0.1 | 8.4 | 0.8 | 4.1 | 1.6 | 0.4 |
| Al 7075 | 14.3 | 5.3 | 5.3 | 0.5 | 8.3 | 2.5 | 4.0 | 1.6 | 1.0 |
| 316L | 8.9 | 11.8 | 4.1 | 0.6 | 9.9 | 3.0 | 4.2 | 1.7 | 0.0 |
| CFRP | 15.7 | 3.0 | 6.3 | 0.1 | 7.3 | 0.0 | 4.0 | 1.5 | 2.1 |
| Mg WE43 | 11.4 | 3.2 | 6.3 | 0.2 | 6.6 | 1.3 | 3.8 | 1.3 | 0.6 |
| 4130 | 12.7 | 9.6 | 1.9 | 1.1 | 9.7 | 3.9 | 4.2 | 1.7 | 0.1 |

| Role | Win rate | Survival | Mean score |
|---|---|---|---|
| pilot | 28.6% | 78.8% | 40.5 |
| structural | 19.9% | 81.6% | 39.3 |
| metallurgist | 23.1% | 84.8% | 41.5 |
| ndt | 24.5% | 89.9% | 43.9 |
| coatings | 22.3% | 85.0% | 41.1 |
| quartermaster | 31.7% | 83.3% | 43.2 |

### 2 crews · random materials · sensible bots
10 000 games · 2 crews · 11.6 turns/game · ties 3.1%
Estimated play time at 20–30 s per turn: **3.9–5.8 min** (+≈2 min set-up)

| Material | Win rate | Fair share | Survival | Mean score | Crates delivered | Mean hours | Score SD |
|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 47.2% | 50.0% | 83.6% | 42.3 | 3.63 | 51.5 | 18.3 |
| Al 7075 | 57.4% | 50.0% | 82.7% | 43.5 | 3.54 | 51.8 | 19.6 |
| 316L | 38.4% | 50.0% | 99.3% | 45.1 | 2.26 | 58.4 | 8.3 |
| CFRP | 57.6% | 50.0% | 71.6% | 39.4 | 3.84 | 48.1 | 23.0 |
| Mg WE43 | 47.0% | 50.0% | 65.9% | 35.3 | 2.85 | 43.7 | 23.9 |
| 4130 | 49.0% | 50.0% | 97.4% | 46.4 | 3.23 | 62.3 | 10.2 |

Mean score breakdown by material:

| Material | cargo | integrity | time | spares | complete | budget | insight | bonus | green |
|---|---|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 14.5 | 5.8 | 5.8 | 0.1 | 8.4 | 0.8 | 4.1 | 1.6 | 1.2 |
| Al 7075 | 14.1 | 5.3 | 5.3 | 0.5 | 8.3 | 2.5 | 4.0 | 1.6 | 1.9 |
| 316L | 9.0 | 11.9 | 4.0 | 0.6 | 9.9 | 3.0 | 4.2 | 1.7 | 0.6 |
| CFRP | 15.3 | 2.9 | 6.2 | 0.1 | 7.2 | 0.0 | 4.1 | 1.5 | 2.1 |
| Mg WE43 | 11.4 | 3.2 | 6.2 | 0.2 | 6.6 | 1.3 | 3.8 | 1.3 | 1.4 |
| 4130 | 12.9 | 9.7 | 1.9 | 1.1 | 9.7 | 3.9 | 4.2 | 1.8 | 1.1 |

| Role | Win rate | Survival | Mean score |
|---|---|---|---|
| pilot | 50.0% | 76.5% | 40.4 |
| structural | 47.0% | 82.0% | 40.8 |
| metallurgist | 49.2% | 83.3% | 41.7 |
| ndt | 51.5% | 89.2% | 44.3 |
| coatings | 48.1% | 84.1% | 41.7 |
| quartermaster | 54.3% | 82.7% | 43.4 |

#### Does decision-making matter? (6 crews: 2 reckless, 2 cautious, 2 sensible, random seats)

| Policy | Win rate | Survival | Mean score |
|---|---|---|---|
| reckless | 17.7% | 74.9% | 35.8 |
| cautious | 7.1% | 97.0% | 41.8 |
| sensible | 25.2% | 84.3% | 41.3 |

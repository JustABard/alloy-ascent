# Automated playtest results
Generated 2026-10-11 by `sim/simulate.mjs` (363.5 s). Same rules engine as the web game; seeded RNG so results are reproducible.

### 6 crews · all materials · sensible bots
20 000 games · 6 crews · 34.8 turns/game · ties 8.1%
Estimated play time at 20–30 s per turn: **11.6–17.4 min** (+≈2 min set-up)

| Material | Win rate | Fair share | Survival | Mean score | Crates delivered | Mean hours | Score SD |
|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 12.9% | 16.7% | 85.7% | 42.2 | 3.73 | 51.6 | 16.9 |
| Al 7075 | 21.5% | 16.7% | 85.1% | 43.4 | 3.67 | 51.8 | 18.1 |
| 316L | 7.5% | 16.7% | 99.2% | 44.9 | 2.28 | 58.0 | 8.2 |
| CFRP | 31.1% | 16.7% | 75.2% | 41.4 | 4.03 | 47.7 | 22.3 |
| Mg WE43 | 15.9% | 16.7% | 69.3% | 36.1 | 3.00 | 43.9 | 22.7 |
| 4130 | 10.9% | 16.7% | 97.5% | 45.4 | 3.21 | 62.1 | 10.0 |

Mean score breakdown by material:

| Material | cargo | integrity | time | spares | complete | budget | insight | bonus | green |
|---|---|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 14.9 | 6.1 | 6.0 | 0.1 | 8.6 | 0.9 | 4.1 | 1.5 | 0.1 |
| Al 7075 | 14.7 | 5.5 | 5.5 | 0.6 | 8.5 | 2.6 | 4.0 | 1.6 | 0.5 |
| 316L | 9.1 | 12.1 | 4.1 | 0.7 | 9.9 | 3.0 | 4.2 | 1.7 | 0.0 |
| CFRP | 16.1 | 3.2 | 6.7 | 0.1 | 7.5 | 0.0 | 4.1 | 1.5 | 2.2 |
| Mg WE43 | 12.0 | 3.4 | 6.6 | 0.2 | 6.9 | 1.4 | 3.8 | 1.4 | 0.3 |
| 4130 | 12.9 | 9.8 | 2.1 | 1.1 | 9.8 | 3.9 | 4.2 | 1.7 | 0.0 |

| Role | Win rate | Survival | Mean score |
|---|---|---|---|
| pilot | 18.8% | 77.6% | 39.7 |
| structural | 20.6% | 92.0% | 46.3 |
| metallurgist | 13.6% | 84.6% | 40.9 |
| ndt | 14.7% | 90.2% | 43.6 |
| coatings | 12.7% | 84.2% | 40.3 |
| quartermaster | 19.6% | 83.2% | 42.6 |

#### Success / failure rate by leg (6-crew batch) — shows WHERE each material is strong or weak
Each cell: success % / failure % on that leg’s main check.

| Material | Leg 1 | Leg 2 | Leg 3 | Leg 4 | Leg 5 | Leg 6 |
|---|---|---|---|---|---|---|
| Ti-6Al-4V | 45.8% / 25.2% | 40.1% / 30.0% | 54.1% / 19.2% | 44.7% / 28.3% | 50.1% / 23.9% | 52.5% / 21.6% |
| Al 7075 | 48.8% / 23.2% | 29.8% / 38.4% | 56.2% / 18.4% | 41.4% / 31.5% | 53.0% / 20.7% | 54.7% / 20.2% |
| 316L | 31.4% / 37.7% | 42.4% / 28.6% | 53.2% / 20.1% | 49.6% / 24.1% | 50.9% / 23.2% | 53.4% / 20.7% |
| CFRP | 55.4% / 17.5% | 38.8% / 30.4% | 56.2% / 17.3% | 43.2% / 29.0% | 42.2% / 30.8% | 54.1% / 20.7% |
| Mg WE43 | 47.9% / 23.8% | 36.8% / 32.7% | 55.5% / 18.1% | 43.4% / 29.2% | 44.3% / 28.3% | 54.7% / 20.0% |
| 4130 | 33.8% / 35.5% | 42.0% / 28.9% | 54.2% / 19.7% | 49.4% / 23.5% | 42.8% / 30.4% | 54.7% / 19.8% |

#### Processing route comparison (6-crew batch)

| Material : processing | Win rate | Survival | Mean score |
|---|---|---|---|
| Ti-6Al-4V Mill-annealed | 12.6% | 85.4% | 41.9 |
| Ti-6Al-4V β-annealed | 13.3% | 86.1% | 42.6 |
| Al 7075 T6 — peak-aged | 21.1% | 83.2% | 42.5 |
| Al 7075 T73 — over-aged | 22.0% | 87.0% | 44.4 |
| 316L Solution-annealed | 9.4% | 99.6% | 45.9 |
| 316L Cold-worked | 5.7% | 98.8% | 43.9 |
| CFRP Toughened epoxy, autoclave | 33.0% | 77.7% | 42.8 |
| CFRP Cyanate-ester, space-grade | 29.3% | 72.7% | 40.1 |
| Mg WE43 Sand-cast + T6 | 15.1% | 67.7% | 35.2 |
| Mg WE43 Extruded, fine-grained | 16.7% | 70.9% | 36.9 |
| 4130 Normalised | 12.1% | 98.8% | 46.5 |
| 4130 Quenched & tempered | 9.7% | 96.2% | 44.4 |

#### Causes of craft loss (6-crew batch)

- fast fracture from a growing fatigue crack: 4070 (3.4% of crews)
- Cold Soak in Earth’s Shadow: 1321 (1.1% of crews)
- Engine-Bay Fire: 1183 (1.0% of crews)
- Atomic Oxygen & UV: 1157 (1.0% of crews)
- Micrometeoroid Strike: 1131 (0.9% of crews)
- Outgassing & Cold Welding: 1117 (0.9% of crews)
- Seal & Surface Crisis: 1031 (0.9% of crews)
- Manual Docking — Guidance Lost: 1011 (0.8% of crews)
- Weld-Flaw Hunt: 976 (0.8% of crews)
- Cargo Transfer Race: 974 (0.8% of crews)

### 4 crews · random materials · sensible bots
10 000 games · 4 crews · 23.2 turns/game · ties 6.0%
Estimated play time at 20–30 s per turn: **7.7–11.6 min** (+≈2 min set-up)

| Material | Win rate | Fair share | Survival | Mean score | Crates delivered | Mean hours | Score SD |
|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 22.0% | 25.0% | 85.9% | 42.8 | 3.76 | 51.5 | 17.1 |
| Al 7075 | 32.4% | 25.0% | 85.4% | 44.2 | 3.68 | 51.7 | 18.2 |
| 316L | 12.7% | 25.0% | 99.3% | 44.9 | 2.27 | 58.0 | 8.2 |
| CFRP | 39.7% | 25.0% | 75.0% | 41.4 | 4.04 | 47.8 | 22.3 |
| Mg WE43 | 24.1% | 25.0% | 69.2% | 36.4 | 3.00 | 43.9 | 22.9 |
| 4130 | 16.8% | 25.0% | 97.3% | 45.5 | 3.19 | 62.0 | 10.1 |

Mean score breakdown by material:

| Material | cargo | integrity | time | spares | complete | budget | insight | bonus | green |
|---|---|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 15.0 | 6.1 | 6.0 | 0.1 | 8.6 | 0.9 | 4.1 | 1.6 | 0.4 |
| Al 7075 | 14.7 | 5.6 | 5.6 | 0.6 | 8.5 | 2.6 | 4.0 | 1.6 | 1.0 |
| 316L | 9.1 | 12.1 | 4.2 | 0.7 | 9.9 | 3.0 | 4.2 | 1.7 | 0.0 |
| CFRP | 16.1 | 3.3 | 6.6 | 0.1 | 7.5 | 0.0 | 4.0 | 1.5 | 2.2 |
| Mg WE43 | 12.0 | 3.4 | 6.7 | 0.2 | 6.9 | 1.4 | 3.8 | 1.4 | 0.6 |
| 4130 | 12.8 | 9.8 | 2.1 | 1.2 | 9.7 | 3.9 | 4.2 | 1.8 | 0.1 |

| Role | Win rate | Survival | Mean score |
|---|---|---|---|
| pilot | 26.1% | 78.7% | 40.4 |
| structural | 31.0% | 92.3% | 46.8 |
| metallurgist | 20.5% | 83.4% | 40.6 |
| ndt | 23.5% | 90.7% | 44.2 |
| coatings | 20.3% | 84.6% | 40.8 |
| quartermaster | 28.6% | 83.5% | 43.1 |

### 2 crews · random materials · sensible bots
10 000 games · 2 crews · 11.6 turns/game · ties 2.9%
Estimated play time at 20–30 s per turn: **3.9–5.8 min** (+≈2 min set-up)

| Material | Win rate | Fair share | Survival | Mean score | Crates delivered | Mean hours | Score SD |
|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 47.5% | 50.0% | 84.5% | 43.1 | 3.70 | 51.6 | 18.0 |
| Al 7075 | 57.6% | 50.0% | 85.0% | 44.8 | 3.66 | 51.6 | 18.8 |
| 316L | 38.1% | 50.0% | 98.9% | 45.4 | 2.29 | 58.1 | 8.6 |
| CFRP | 61.0% | 50.0% | 74.6% | 41.3 | 4.02 | 47.5 | 22.5 |
| Mg WE43 | 46.4% | 50.0% | 68.4% | 36.9 | 2.97 | 43.9 | 23.6 |
| 4130 | 44.8% | 50.0% | 97.3% | 46.4 | 3.20 | 62.0 | 10.3 |

Mean score breakdown by material:

| Material | cargo | integrity | time | spares | complete | budget | insight | bonus | green |
|---|---|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 14.8 | 6.1 | 5.9 | 0.1 | 8.5 | 0.8 | 4.1 | 1.6 | 1.2 |
| Al 7075 | 14.6 | 5.5 | 5.5 | 0.6 | 8.5 | 2.5 | 4.0 | 1.6 | 2.0 |
| 316L | 9.2 | 12.0 | 4.1 | 0.7 | 9.9 | 3.0 | 4.2 | 1.7 | 0.6 |
| CFRP | 16.1 | 3.3 | 6.6 | 0.1 | 7.5 | 0.0 | 4.0 | 1.5 | 2.2 |
| Mg WE43 | 11.9 | 3.4 | 6.6 | 0.2 | 6.8 | 1.4 | 3.8 | 1.3 | 1.5 |
| 4130 | 12.8 | 9.9 | 2.1 | 1.1 | 9.7 | 3.9 | 4.2 | 1.7 | 1.0 |

| Role | Win rate | Survival | Mean score |
|---|---|---|---|
| pilot | 47.5% | 75.8% | 39.7 |
| structural | 57.8% | 92.5% | 47.9 |
| metallurgist | 45.5% | 83.8% | 41.6 |
| ndt | 49.8% | 89.9% | 44.9 |
| coatings | 45.8% | 83.7% | 41.3 |
| quartermaster | 53.4% | 82.1% | 43.1 |

#### Does decision-making matter? (6 crews: 2 reckless, 2 cautious, 2 sensible, random seats)

| Policy | Win rate | Survival | Mean score |
|---|---|---|---|
| reckless | 18.1% | 77.6% | 37.5 |
| cautious | 6.4% | 97.3% | 42.2 |
| sensible | 25.5% | 85.6% | 42.3 |

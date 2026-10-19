# Automated playtest results
Generated 2026-10-19 by `sim/simulate.mjs` (414.0 s). Same rules engine as the web game; seeded RNG so results are reproducible.

### 6 crews · all materials · sensible bots
20 000 games · 6 crews · 34.9 turns/game · ties 7.6%
Estimated play time at 20–30 s per turn: **11.6–17.5 min** (+≈2 min set-up)

| Material | Win rate | Fair share | Survival | Mean score | Crates delivered | Mean hours | Score SD |
|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 17.8% | 16.7% | 90.2% | 40.5 | 3.72 | 51.1 | 15.0 |
| Al 7075 | 19.4% | 16.7% | 85.1% | 38.5 | 3.48 | 52.0 | 17.6 |
| 316L | 10.6% | 16.7% | 99.3% | 40.8 | 1.94 | 57.1 | 8.7 |
| CFRP | 26.7% | 16.7% | 77.4% | 37.5 | 4.02 | 49.0 | 21.0 |
| Mg WE43 | 15.3% | 16.7% | 69.7% | 31.9 | 2.83 | 43.3 | 21.9 |
| 4130 | 10.2% | 16.7% | 97.8% | 40.1 | 2.91 | 61.6 | 10.0 |

Mean score breakdown by material:

| Material | cargo | integrity | time | spares | complete | budget | bonus | green |
|---|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 14.9 | 7.2 | 6.4 | 0.3 | 9.0 | 0.9 | 1.6 | 0.1 |
| Al 7075 | 13.9 | 5.5 | 5.5 | 0.6 | 8.5 | 2.6 | 1.6 | 0.4 |
| 316L | 7.7 | 12.8 | 4.6 | 1.0 | 9.9 | 3.0 | 1.7 | 0.0 |
| CFRP | 16.1 | 3.4 | 6.4 | 0.2 | 7.7 | 0.0 | 1.5 | 2.2 |
| Mg WE43 | 11.3 | 3.4 | 7.0 | 0.3 | 7.0 | 1.4 | 1.3 | 0.2 |
| 4130 | 11.7 | 9.4 | 2.3 | 1.3 | 9.8 | 3.9 | 1.7 | 0.0 |

| Role | Win rate | Survival | Mean score |
|---|---|---|---|
| pilot | 21.7% | 80.8% | 37.7 |
| structural | 16.5% | 89.2% | 39.6 |
| metallurgist | 13.8% | 87.7% | 37.5 |
| ndt | 13.4% | 90.7% | 38.5 |
| coatings | 13.2% | 86.2% | 36.8 |
| quartermaster | 21.4% | 84.7% | 39.3 |

#### Success / failure rate by leg (6-crew batch) — shows WHERE each material is strong or weak
Each cell: success % / failure % on that leg’s main check.

| Material | Leg 1 | Leg 2 | Leg 3 | Leg 4 | Leg 5 | Leg 6 |
|---|---|---|---|---|---|---|
| Ti-6Al-4V | 71.9% / 28.1% | 63.9% / 36.1% | 93.5% / 6.5% | 79.6% / 20.4% | 77.6% / 22.4% | 57.2% / 42.8% |
| Al 7075 | 67.6% / 32.4% | 46.9% / 53.1% | 93.4% / 6.6% | 50.2% / 49.8% | 79.1% / 20.9% | 57.7% / 42.3% |
| 316L | 58.0% / 42.0% | 64.1% / 35.9% | 93.3% / 6.7% | 79.8% / 20.2% | 84.5% / 15.5% | 57.2% / 42.8% |
| CFRP | 75.0% / 25.0% | 64.1% / 35.9% | 93.0% / 7.0% | 58.1% / 41.9% | 69.0% / 31.0% | 57.3% / 42.7% |
| Mg WE43 | 61.3% / 38.7% | 50.3% / 49.7% | 93.4% / 6.6% | 69.4% / 30.6% | 63.4% / 36.6% | 55.9% / 44.1% |
| 4130 | 61.5% / 38.5% | 69.0% / 31.0% | 93.1% / 6.9% | 72.2% / 27.8% | 51.2% / 48.8% | 57.2% / 42.8% |

#### Processing route comparison (6-crew batch)

| Material : processing | Win rate | Survival | Mean score |
|---|---|---|---|
| Ti-6Al-4V Mill-annealed | 17.1% | 89.9% | 40.2 |
| Ti-6Al-4V β-annealed | 18.5% | 90.4% | 40.8 |
| Al 7075 T6 — peak-aged | 20.5% | 84.4% | 38.5 |
| Al 7075 T73 — over-aged | 18.3% | 85.7% | 38.5 |
| 316L Solution-annealed | 11.8% | 99.5% | 41.5 |
| 316L Cold-worked | 9.4% | 99.0% | 40.1 |
| CFRP Toughened epoxy, autoclave | 28.0% | 76.3% | 37.4 |
| CFRP Cyanate-ester, space-grade | 25.4% | 78.5% | 37.6 |
| Mg WE43 Sand-cast + T6 | 14.6% | 68.3% | 31.3 |
| Mg WE43 Extruded, fine-grained | 16.0% | 71.2% | 32.6 |
| 4130 Normalised | 10.4% | 98.8% | 40.6 |
| 4130 Quenched & tempered | 10.0% | 96.8% | 39.6 |

#### Causes of craft loss (6-crew batch)

- Manual Docking — Guidance Lost: 6001 (5.0% of crews)
- Cold Soak in Earth’s Shadow: 4157 (3.5% of crews)
- fast fracture from a growing fatigue crack: 3020 (2.5% of crews)
- Mach 3 Skin Heating: 2432 (2.0% of crews)
- Engine Flame-Out: 399 (0.3% of crews)
- Ten Thousand Gusts: 109 (0.1% of crews)

### 4 crews · random materials · sensible bots
10 000 games · 4 crews · 23.3 turns/game · ties 5.7%
Estimated play time at 20–30 s per turn: **7.8–11.7 min** (+≈2 min set-up)

| Material | Win rate | Fair share | Survival | Mean score | Crates delivered | Mean hours | Score SD |
|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 26.9% | 25.0% | 90.1% | 40.8 | 3.72 | 51.1 | 15.2 |
| Al 7075 | 29.6% | 25.0% | 85.0% | 39.1 | 3.46 | 51.9 | 18.0 |
| 316L | 15.6% | 25.0% | 99.3% | 40.8 | 1.93 | 57.1 | 8.6 |
| CFRP | 36.4% | 25.0% | 78.5% | 38.1 | 4.08 | 49.0 | 20.7 |
| Mg WE43 | 23.5% | 25.0% | 68.8% | 32.1 | 2.82 | 43.1 | 22.4 |
| 4130 | 16.1% | 25.0% | 98.0% | 40.2 | 2.92 | 61.6 | 9.9 |

Mean score breakdown by material:

| Material | cargo | integrity | time | spares | complete | budget | bonus | green |
|---|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 14.9 | 7.3 | 6.4 | 0.3 | 9.0 | 0.9 | 1.6 | 0.4 |
| Al 7075 | 13.9 | 5.5 | 5.5 | 0.6 | 8.5 | 2.5 | 1.6 | 0.9 |
| 316L | 7.7 | 12.8 | 4.6 | 1.0 | 9.9 | 3.0 | 1.7 | 0.0 |
| CFRP | 16.3 | 3.5 | 6.5 | 0.2 | 7.8 | 0.0 | 1.5 | 2.3 |
| Mg WE43 | 11.3 | 3.5 | 6.9 | 0.3 | 6.9 | 1.4 | 1.3 | 0.6 |
| 4130 | 11.7 | 9.4 | 2.3 | 1.3 | 9.8 | 3.9 | 1.7 | 0.1 |

| Role | Win rate | Survival | Mean score |
|---|---|---|---|
| pilot | 30.2% | 80.8% | 38.1 |
| structural | 25.3% | 89.5% | 40.1 |
| metallurgist | 21.6% | 88.0% | 37.9 |
| ndt | 21.0% | 90.9% | 38.8 |
| coatings | 20.8% | 86.5% | 37.2 |
| quartermaster | 31.1% | 85.1% | 39.8 |

### 2 crews · random materials · sensible bots
10 000 games · 2 crews · 11.7 turns/game · ties 3.6%
Estimated play time at 20–30 s per turn: **3.9–5.8 min** (+≈2 min set-up)

| Material | Win rate | Fair share | Survival | Mean score | Crates delivered | Mean hours | Score SD |
|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 53.1% | 50.0% | 90.4% | 41.7 | 3.73 | 51.2 | 15.3 |
| Al 7075 | 52.5% | 50.0% | 83.7% | 39.2 | 3.41 | 51.9 | 18.7 |
| 316L | 42.0% | 50.0% | 99.5% | 41.5 | 1.96 | 57.2 | 8.6 |
| CFRP | 57.9% | 50.0% | 77.4% | 37.5 | 4.00 | 48.9 | 21.0 |
| Mg WE43 | 44.8% | 50.0% | 68.9% | 32.6 | 2.78 | 43.4 | 22.7 |
| 4130 | 43.4% | 50.0% | 98.2% | 41.1 | 2.92 | 61.6 | 10.1 |

Mean score breakdown by material:

| Material | cargo | integrity | time | spares | complete | budget | bonus | green |
|---|---|---|---|---|---|---|---|---|
| Ti-6Al-4V | 14.9 | 7.1 | 6.4 | 0.3 | 9.0 | 0.9 | 1.6 | 1.4 |
| Al 7075 | 13.6 | 5.4 | 5.4 | 0.5 | 8.4 | 2.5 | 1.5 | 1.9 |
| 316L | 7.9 | 12.8 | 4.5 | 1.0 | 9.9 | 3.0 | 1.7 | 0.6 |
| CFRP | 16.0 | 3.4 | 6.4 | 0.2 | 7.7 | 0.0 | 1.5 | 2.3 |
| Mg WE43 | 11.1 | 3.4 | 6.9 | 0.3 | 6.9 | 1.4 | 1.3 | 1.4 |
| 4130 | 11.7 | 9.4 | 2.3 | 1.3 | 9.8 | 3.9 | 1.7 | 1.0 |

| Role | Win rate | Survival | Mean score |
|---|---|---|---|
| pilot | 52.5% | 79.0% | 38.0 |
| structural | 52.1% | 89.3% | 40.6 |
| metallurgist | 46.4% | 88.2% | 38.7 |
| ndt | 48.6% | 91.4% | 40.0 |
| coatings | 46.7% | 85.7% | 37.9 |
| quartermaster | 53.6% | 84.5% | 40.0 |

#### Does decision-making matter? (6 crews: 2 reckless, 2 cautious, 2 sensible, random seats)

| Policy | Win rate | Survival | Mean score |
|---|---|---|---|
| reckless | 22.3% | 80.6% | 36.1 |
| cautious | 6.2% | 98.1% | 37.9 |
| sensible | 21.5% | 86.8% | 38.1 |

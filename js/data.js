// SkyForge — game data (rules-facing).
// Every modifier below is derived from a real property ranking; the "why" strings are shown
// to players at the moment of the roll so the metallurgy is visible, not hidden in a table.

export const CONFIG = {
  die: 20,
  partialBand: 5,          // total >= DC-5 (but < DC) is a Partial
  crateValue: 4,           // points per delivered crate
  deadline: 66,            // docking window (hours)
  latePenaltyCap: 10,
  timeBonusPerHour: 0.5,
  completionBonus: 10,      // craft reaches the station intact
  loadTimePerCrate: 0.5,   // hours added per leg per crate carried
  pushDC: 3, pushTime: -3, pushFailDmg: 1,
  safeDC: -3, safeTime: 3,
  jettisonBonus: 3,
  briefingBonus: 1,
  specialistBonus: 3,      // leg 6: your own speciality
  specialistQuestionBonus: 3,
  repairDC: 10, repairTime: 2, patchHeal: 3, inspectTime: 1,
  fractureDamage: 5,
  greenAward: 3,
  missionsPerLife: 200,
  minCrews: 2, maxCrews: 6,
  defaultTimer: 60,
};

// Check tags. Load (cargo mass) penalises 'strength' and 'fatigue' checks.
export const TAGS = {
  strength:  { name: 'Specific strength', icon: '⛓' },
  stiffness: { name: 'Stiffness & torsion', icon: '⟲' },
  fatigue:   { name: 'Fatigue', icon: '∿' },
  notch:     { name: 'Notch sensitivity', icon: '◔' },
  corrosion: { name: 'Corrosion', icon: '☂' },
  heat:      { name: 'High-temperature strength', icon: '♨' },
  distortion:{ name: 'Thermal distortion', icon: '⇋' },
  fire:      { name: 'Fire', icon: '🔥' },
  cryo:      { name: 'Cryogenic toughness', icon: '❄' },
  oxidation: { name: 'Atomic oxygen', icon: 'O' },
  vacuum:    { name: 'Hard vacuum', icon: '○' },
  impact:    { name: 'Impact', icon: '✦' },
  handling:  { name: 'Handling', icon: '✈' },
  luck:      { name: 'Fortune', icon: '⚄' },
};

export const MATERIALS = {
  ti: {
    id: 'ti', name: 'Ti-6Al-4V', short: 'Ti-6Al-4V', symbol: 'Ti', color: '#a594ff',
    family: 'Titanium alloy · α+β', tagline: 'Strong, hot-capable, corrosion-proof — and very expensive.',
    stats: { integrity: 13, legTime: 8.5, capacity: 5, spares: 1, repair: -1, crackTol: 3, budget: 1 },
    ratings: { lightness: 3, strength: 4, torsion: 3, fatigue: 4, heat: 4, space: 3, corrosion: 5, repair: 2, toughness: 4, cheapness: 1 },
    frameMass: 5.0, co2PerKg: 40, costPerKg: 30, recyclability: 'Good (high scrap value), but contamination-sensitive',
    props: { density: '4.43', E: '114', G: '44', yield: '880', uts: '950', elong: '14', fatigue: '≈510 (10⁷, unnotched)', kic: '55–75', tmax: '≈350–400', k: '6.7', cte: '8.6', melt: '1604–1660', cost: '≈20–35', co2: '≈35–45', structure: 'HCP α + BCC β' },
    processing: [
      { id: 'ma', name: 'Mill-annealed', micro: 'Fine equiaxed α grains with intergranular β',
        desc: 'Forged in the α+β field then annealed ≈730 °C. Fine, equiaxed α resists fatigue-crack initiation — the default aerospace condition.',
        mods: { fatigue: 1, notch: 1 }, effects: {} },
      { id: 'ba', name: 'β-annealed', micro: 'Coarse lamellar (Widmanstätten) α colonies',
        desc: 'Heated above the β-transus (≈995 °C) and cooled: lamellar α. The tortuous crack path slows crack growth and raises toughness and creep resistance, but coarse lamellae initiate fatigue cracks more easily.',
        mods: { fatigue: -1, heat: 1 }, effects: { integrity: 1, crackTol: 1 } },
    ],
  },
  al: {
    id: 'al', name: '7075 aluminium', short: 'Al 7075', symbol: 'Al', color: '#5fd0e8',
    family: 'Aluminium alloy · Al-Zn-Mg-Cu, precipitation-hardened', tagline: 'Light, strong, cheap and repairable — until it gets hot or wet.',
    stats: { integrity: 11, legTime: 8, capacity: 5, spares: 3, repair: 1, crackTol: 2, budget: 3 },
    ratings: { lightness: 4, strength: 4, torsion: 4, fatigue: 2, heat: 1, space: 4, corrosion: 2, repair: 3, toughness: 3, cheapness: 4 },
    frameMass: 4.0, co2PerKg: 12, costPerKg: 6, recyclability: 'Excellent — remelting uses ≈5% of primary energy',
    props: { density: '2.81', E: '71.7', G: '26.9', yield: '503 (T6)', uts: '572 (T6)', elong: '11', fatigue: '≈159 (5×10⁸, no true limit)', kic: '20–29', tmax: '≈120', k: '130', cte: '23.6', melt: '477–635', cost: '≈4–8', co2: '≈12–13 primary (≈1–2 recycled)', structure: 'FCC' },
    processing: [
      { id: 't6', name: 'T6 — peak-aged', micro: 'Dense, fine η′ (MgZn₂) precipitates',
        desc: 'Solution-treated ≈480 °C, quenched, aged ≈120 °C for 24 h. Maximum strength, but susceptible to stress-corrosion cracking and exfoliation.',
        mods: { strength: 1, corrosion: -1 }, effects: {} },
      { id: 't73', name: 'T73 — over-aged', micro: 'Coarser, more stable η precipitates',
        desc: 'Two-step over-ageing. Gives up ≈10–15% strength for far better stress-corrosion and exfoliation resistance and slightly better toughness.',
        mods: { strength: -1, corrosion: 2 }, effects: { crackTol: 1 } },
    ],
  },
  ss: {
    id: 'ss', name: '316L stainless steel', short: '316L', symbol: 'Fe', color: '#a7c4b5',
    family: 'Austenitic stainless steel · Fe-Cr-Ni-Mo', tagline: 'Heavy and soft, but almost indestructible by heat, cold, corrosion or vacuum.',
    stats: { integrity: 17, legTime: 10, capacity: 3, spares: 3, repair: 2, crackTol: 4, budget: 3 },
    ratings: { lightness: 1, strength: 1, torsion: 1, fatigue: 3, heat: 5, space: 5, corrosion: 5, repair: 4, toughness: 5, cheapness: 4 },
    frameMass: 11.0, co2PerKg: 6, costPerKg: 5, recyclability: 'Excellent — high recycled content, valuable Ni/Cr/Mo',
    props: { density: '8.0', E: '193', G: '77', yield: '170–290 (annealed)', uts: '485–620', elong: '40–60', fatigue: '≈240 (endurance limit)', kic: '>100', tmax: '≈800', k: '16.3', cte: '16.0', melt: '1375–1400', cost: '≈4–7', co2: '≈5–7', structure: 'FCC (austenite)' },
    processing: [
      { id: 'sa', name: 'Solution-annealed', micro: 'Soft, equiaxed austenite with annealing twins',
        desc: 'Annealed ≈1050 °C and rapidly cooled. Maximum ductility and toughness; low yield strength. The "L" (≤0.03% C) avoids sensitisation when welded.',
        mods: {}, effects: { integrity: 1 } },
      { id: 'cw', name: 'Cold-worked', micro: 'High dislocation density; some strain-induced martensite',
        desc: 'Strain-hardened (¼-hard). Yield strength roughly doubles — but heat can anneal the cold work away, and ductility and corrosion resistance drop.',
        mods: { strength: 3, heat: -1, corrosion: -1 }, effects: { integrity: -1 } },
    ],
  },
  cf: {
    id: 'cf', name: 'CFRP composite', short: 'CFRP', symbol: 'C', color: '#f0c43c',
    family: 'Carbon-fibre reinforced polymer · ≈60% fibres in a polymer matrix', tagline: 'The lightest and stiffest per kilogram — fragile to impact, heat and atomic oxygen.',
    stats: { integrity: 10, legTime: 7, capacity: 6, spares: 1, repair: -2, crackTol: 3, budget: 0 },
    ratings: { lightness: 5, strength: 5, torsion: 5, fatigue: 5, heat: 2, space: 2, corrosion: 4, repair: 1, toughness: 2, cheapness: 1 },
    frameMass: 2.2, co2PerKg: 30, costPerKg: 60, recyclability: 'Poor — thermoset matrix; pyrolysis recovers shortened fibres',
    props: { density: '1.55–1.60', E: '50–70 quasi-iso (130–180 along fibres)', G: '≈20 (more with ±45° plies)', yield: 'no yield — linear to failure', uts: '600–800 quasi-iso (≈2000 along fibres)', elong: '≈1.5 (strain to failure)', fatigue: '≈60–70% of static at 10⁷ (tension)', kic: 'n/a — delamination G_IC ≈0.2–0.5 kJ/m²', tmax: '≈120–150 (epoxy Tg ≈180)', k: '≈5 in-plane, <1 through-thickness', cte: '≈0–3 in-plane', melt: 'n/a (matrix decomposes ≈300–400)', cost: '≈30–100+ (prepreg)', co2: '≈20–40', structure: 'Anisotropic laminate' },
    processing: [
      { id: 'ep', name: 'Toughened epoxy, autoclave', micro: '[0/±45/90] plies, thermoplastic-toughened epoxy, Tg ≈180 °C',
        desc: 'Prepreg laid up and cured at 180 °C under pressure. The aerospace workhorse (Boeing 787, Airbus A350): good damage tolerance, modest temperature limit.',
        mods: {}, effects: {} },
      { id: 'ce', name: 'Cyanate-ester, space-grade', micro: 'Same fibres; cyanate-ester matrix, Tg ≈250 °C',
        desc: 'Higher-temperature, very low-outgassing, low-moisture matrix used on satellites and telescopes — but more brittle, so impact damage spreads further.',
        mods: { heat: 2, vacuum: 3, oxidation: 1, impact: -1 }, effects: { integrity: -1 } },
    ],
  },
  mg: {
    id: 'mg', name: 'WE43 magnesium', short: 'Mg WE43', symbol: 'Mg', color: '#ff8f4d',
    family: 'Magnesium alloy · Mg-Y-Nd-Zr (rare earth)', tagline: 'The lightest structural metal, stiff panels and good heat — but corrodes and hates the cold.',
    stats: { integrity: 10, legTime: 7, capacity: 5, spares: 2, repair: -1, crackTol: 2, budget: 2 },
    ratings: { lightness: 4, strength: 2, torsion: 5, fatigue: 2, heat: 3, space: 1, corrosion: 1, repair: 2, toughness: 2, cheapness: 3 },
    frameMass: 3.8, co2PerKg: 35, costPerKg: 22, recyclability: 'Good in principle; scrap must be kept clean and segregated',
    props: { density: '1.84', E: '44', G: '17', yield: '165–200', uts: '250–280', elong: '2–7', fatigue: '≈85–110 (10⁷)', kic: '14–16', tmax: '≈250', k: '51', cte: '26.7', melt: '540–640', cost: '≈15–30', co2: '≈25–45 (Pidgeon process)', structure: 'HCP' },
    processing: [
      { id: 'ct6', name: 'Sand-cast + T6', micro: 'Coarse Zr-refined grains with Y/Nd-rich precipitates',
        desc: 'Cast then solution-treated and aged. Coarse grains and thermally stable rare-earth precipitates give the best creep resistance — the helicopter-gearbox condition.',
        mods: { heat: 1 }, effects: {} },
      { id: 'ext', name: 'Extruded, fine-grained', micro: 'Fine recrystallised grains with basal texture',
        desc: 'Hot-extruded. Magnesium has a steep Hall–Petch slope, so fine grains raise strength and fatigue resistance — but grain-boundary sliding lowers creep resistance at high temperature.',
        mods: { strength: 1, fatigue: 1, notch: 1, heat: -1 }, effects: {} },
    ],
  },
  cr: {
    id: 'cr', name: '4130 chromoly steel', short: '4130', symbol: 'Cr', color: '#ff5d5d',
    family: 'Low-alloy steel · Fe-Cr-Mo, 0.3% C', tagline: 'Cheap, tough, endlessly weldable — heavy, rusts, and turns brittle in deep cold.',
    stats: { integrity: 14, legTime: 10, capacity: 4, spares: 4, repair: 3, crackTol: 3, budget: 4 },
    ratings: { lightness: 2, strength: 2, torsion: 2, fatigue: 4, heat: 4, space: 2, corrosion: 2, repair: 5, toughness: 4, cheapness: 5 },
    frameMass: 7.9, co2PerKg: 2.3, costPerKg: 2.5, recyclability: 'Excellent — the most-recycled material on Earth',
    props: { density: '7.85', E: '205', G: '80', yield: '435–460 normalised (≈900–1000 Q&T)', uts: '670 (≈1000–1100 Q&T)', elong: '25 (≈15 Q&T)', fatigue: '≈300–480 (true endurance limit)', kic: '60–110', tmax: '≈400–450', k: '42.7', cte: '12.2', melt: '≈1430', cost: '≈1.5–3', co2: '≈2–2.5', structure: 'BCC ferrite (normalised) / tempered martensite' },
    processing: [
      { id: 'n', name: 'Normalised', micro: 'Fine ferrite + pearlite',
        desc: 'Air-cooled from ≈870 °C. Tough, ductile and easy to TIG-weld in the field — the classic tube-frame condition (Piper Cub, Pitts, race-car spaceframes).',
        mods: {}, effects: { integrity: 1, repair: 1 } },
      { id: 'qt', name: 'Quenched & tempered', micro: 'Tempered martensite',
        desc: 'Oil-quenched and tempered ≈540 °C: about twice the strength and a lower ductile-to-brittle transition. But welding ruins the heat treatment, and high strength raises hydrogen-embrittlement risk.',
        mods: { strength: 2, fatigue: 1, cryo: 1, corrosion: -1 }, effects: { repair: -2 } },
    ],
  },
};
export const MATERIAL_ORDER = ['ti', 'al', 'ss', 'cf', 'mg', 'cr'];

export const ROLES = {
  pilot: {
    id: 'pilot', name: 'Test Pilot', icon: '✈', home: 'Legs 1, 3, 6',
    tags: ['handling'], bonus: 2,
    summary: '+2 on handling checks. Pushing hard costs only +2 DC (not +3) and saves 4 h (not 3).',
    ability: { id: 'reroll', name: 'Stick-and-rudder', when: 'preroll', desc: 'Once per game: if this roll is a Partial or Failure, reroll the d20 once and keep the better result.' },
    pushDC: 2, pushTime: -4,
  },
  structural: {
    id: 'structural', name: 'Structural Engineer', icon: '⌂', home: 'Legs 1–2',
    tags: ['strength', 'stiffness', 'notch'], bonus: 2,
    summary: '+2 on strength, stiffness and stress-concentration (notch) checks.',
    ability: { id: 'loadpath', name: 'Redundant load path', when: 'preroll', desc: 'Once per game: if this roll is a Failure, treat it as a Partial (a fail-safe design).' },
  },
  metallurgist: {
    id: 'metallurgist', name: 'Metallurgist', icon: '⚗', home: 'Legs 4–5',
    tags: ['heat', 'distortion', 'fire', 'cryo'], bonus: 2,
    summary: '+2 on thermal and cryogenic checks. Correct briefing answers give +2 instead of +1.',
    ability: { id: 'heattreat', name: 'Field heat treatment', when: 'hangar', desc: 'Once per game at a hangar stop: remove a permanent microstructural condition (over-aged, softened). Costs 1 spare.' },
    briefingBonus: 2,
  },
  ndt: {
    id: 'ndt', name: 'NDT Inspector', icon: '◎', home: 'Leg 2',
    tags: ['fatigue', 'notch', 'impact'], bonus: 1,
    summary: '+1 on fatigue and impact checks. Hidden damage is found at once, detected cracks are stop-drilled (no growth), +3 on crack and delamination repairs.',
    ability: { id: 'eddy', name: 'Eddy-current survey', when: 'preroll', desc: 'Once per game: +4 on a fatigue, notch or impact check.', tags: ['fatigue', 'notch', 'impact'], value: 4 },
  },
  coatings: {
    id: 'coatings', name: 'Surface & Corrosion Engineer', icon: '◈', home: 'Leg 5',
    tags: ['corrosion', 'oxidation', 'vacuum'], bonus: 2,
    summary: '+2 on corrosion, atomic-oxygen and vacuum checks. Corrosion repairs always succeed.',
    ability: { id: 'coat', name: 'Protective coating', when: 'preroll', desc: 'Once per game: +4 on a corrosion, oxidation, vacuum or cryo check (anodise, PEO, SiO₂ film, MoS₂ dry lube, heater blanket).', tags: ['corrosion', 'oxidation', 'vacuum', 'cryo'], value: 4 },
  },
  quartermaster: {
    id: 'quartermaster', name: 'Quartermaster', icon: '▣', home: 'Cargo',
    tags: [], bonus: 0,
    summary: '+1 cargo capacity and +1 spare. Jettisoning a crate gives +4 instead of +3.',
    ability: { id: 'secure', name: 'Secured cargo', when: 'auto', desc: 'Once per game: the first crate you would lose is saved automatically.' },
    capacity: 1, spares: 1, jettison: 4,
  },
};
export const ROLE_ORDER = ['pilot', 'structural', 'metallurgist', 'ndt', 'coatings', 'quartermaster'];

// Conditions — persistent damage states. mods apply to checks carrying that tag.
export const CONDITIONS = {
  crack:     { name: 'Fatigue crack', icon: '⚡', mods: { strength: -1, fatigue: -1 }, grows: true, repairable: true, ndt: true,
               desc: 'A crack is growing a little every leg. If it passes your critical crack length (set by fracture toughness) it fast-fractures for 5 damage.' },
  microcrack:{ name: 'Matrix microcracking', icon: '⋰', mods: { strength: -1 }, repairable: true, ndt: true,
               desc: 'Fine cracks in the polymer matrix between fibres. Reduces compression and shear performance.' },
  delam:     { name: 'Delamination', icon: '≋', mods: { strength: -2, stiffness: -1, impact: -1 }, repairable: true, repairAdj: 2, ndt: true,
               desc: 'Plies have separated inside the laminate — often barely visible from the surface (BVID). Compression strength falls sharply.' },
  yielded:   { name: 'Permanent set', icon: '⌒', mods: { strength: -1 }, repairable: true,
               desc: 'A spar has yielded and is permanently bent. It still carries load, but with less margin.' },
  twisted:   { name: 'Misaligned structure', icon: '⟲', mods: { stiffness: -1, handling: -1 }, repairable: true,
               desc: 'The wing box or control linkages are twisted out of true.' },
  overaged:  { name: 'Over-aged', icon: '♨', mods: { strength: -2 }, repairable: false, heatTreat: true,
               desc: 'Heat coarsened the strengthening precipitates. A patch cannot fix a microstructure — only a full re-heat-treatment can.' },
  softened:  { name: 'Heat-softened', icon: '♨', mods: { strength: -2 }, repairable: false, heatTreat: true,
               desc: 'Heat annealed out the cold work or over-tempered the martensite. Strength is permanently reduced until re-processed.' },
  matrix:    { name: 'Heat-damaged matrix', icon: '♨', mods: { strength: -2, stiffness: -1 }, repairable: true, repairAdj: 2,
               desc: 'The polymer matrix passed its glass transition and blistered. Needs a scarf repair.' },
  alphacase: { name: 'Alpha case', icon: '◍', mods: { fatigue: -2 }, repairable: true,
               desc: 'Oxygen diffused into the hot titanium surface, forming a hard, brittle α-case layer that seeds fatigue cracks. Remove by chemical milling.' },
  creep:     { name: 'Creep distortion', icon: '⌇', mods: { stiffness: -1, handling: -1 }, repairable: true,
               desc: 'Sustained load at high temperature slowly and permanently deformed the structure.' },
  corrosion: { name: 'Active corrosion', icon: '☂', mods: { fatigue: -1 }, perLeg: 1, repairable: true, repairAdj: -2,
               desc: 'Pitting or exfoliation is eating the structure: −1 integrity at the start of every leg until treated.' },
  galled:    { name: 'Galled joint', icon: '⚙', mods: { handling: -2 }, repairable: true,
               desc: 'Clean metal surfaces cold-welded in vacuum. A hinge or latch is seized.' },
  outgassed: { name: 'Contaminated optics', icon: '◌', mods: { handling: -2 }, repairable: true, repairAdj: -2,
               desc: 'Volatiles out-gassed from the matrix and condensed on sensors and windows.' },
  eroded:    { name: 'Atomic-oxygen erosion', icon: '◐', mods: { strength: -1, oxidation: -1 }, repairable: true,
               desc: 'Atomic oxygen has eaten into the surface plies.' },
};

// Standard approaches used by material legs (1, 2, 4, 5).
export const STD_APPROACHES = [
  { id: 'std', label: 'Standard profile', dc: 0, time: 0, desc: 'Fly the planned profile.' },
  { id: 'push', label: 'Push hard', dc: CONFIG.pushDC, time: CONFIG.pushTime, failDmg: CONFIG.pushFailDmg, desc: 'Shortcut: faster but harder, and a Failure does +1 damage.' },
  { id: 'safe', label: 'Play it safe', dc: CONFIG.safeDC, time: CONFIG.safeTime, desc: 'Gentler, slower profile: easier check, +3 h.' },
];

const m = (ti, al, ss, cf, mg, cr) => ({ ti, al, ss, cf, mg, cr });

export const LEGS = [
  { n: 1, id: 'lift', name: 'The Heavy Lift', topic: 'Specific strength & stiffness', kind: 'material',
    place: 'Ironhold Spaceport → the Serrated Range',
    intro: 'Climbing out at maximum take-off weight. Structure is sized by load per kilogram: specific strength (σy/ρ) for parts that must not yield, and stiffness indices such as E/ρ, √E/ρ and ∛E/ρ for parts that must not bend, twist or buckle. Cargo mass raises every load.',
    watch: ['Specific strength σy/ρ', 'Torsional & buckling stiffness per kg', 'Cargo load penalty'],
    cards: ['l1a', 'l1b', 'l1c'] },
  { n: 2, id: 'storm', name: 'The Storm Corridor', topic: 'Fatigue under repeated loading', kind: 'material',
    place: 'Jet-stream gust belt over the Grey Sea',
    intro: 'Hours of turbulence put tens of thousands of load cycles into the frame. Fatigue cracks start at notches and surface flaws far below the yield stress, then grow each cycle. Some alloys have a true endurance limit; others accumulate damage at any stress.',
    watch: ['Endurance limit (S–N curve)', 'Notch sensitivity', 'Corrosion fatigue', 'Hidden cracks grow every leg'],
    cards: ['l2a', 'l2b', 'l2c', 'l2d'] },
  { n: 3, id: 'wild', name: 'Wildcard Skies', topic: 'Probability & risk', kind: 'luck',
    place: 'Open stratosphere',
    intro: 'No single material property rules here — just weather, wildlife and fortune. Read the odds, weigh probability × consequence, and decide how much risk your crew can afford.',
    watch: ['Odds on every option', 'Expected value', 'Your current integrity'],
    cards: ['l3a', 'l3b', 'l3c', 'l3d', 'l3e', 'l3f', 'l3g', 'l3h'] },
  { n: 4, id: 'burn', name: 'The Hypersonic Burn', topic: 'Thermal behaviour', kind: 'material',
    place: 'Mach 3 climb through the upper atmosphere',
    intro: 'Air friction heats the skin to 300 °C and beyond. Precipitates coarsen, polymer matrices pass their glass transition, cold work anneals out and creep begins. Thermal gradients warp structures, and fire tests melting and ignition behaviour.',
    watch: ['Maximum service temperature', 'Microstructural stability', 'Conductivity ÷ expansion (k/α)'],
    cards: ['l4a', 'l4b', 'l4c'] },
  { n: 5, id: 'edge', name: 'The Edge of Space', topic: 'Vacuum & space environment', kind: 'material',
    place: 'Above the Kármán line → low Earth orbit',
    intro: 'Hard vacuum, atomic oxygen, ultraviolet light, micrometeoroids and −150 °C shadow passes. Oxide films are not replenished, polymers outgas, magnesium can sublime and BCC steels can turn brittle.',
    watch: ['Ductile-to-brittle transition', 'Protective oxides (Pilling–Bedworth)', 'Outgassing & cold welding'],
    cards: ['l5a', 'l5b', 'l5c', 'l5d'] },
  { n: 6, id: 'dock', name: 'Docking at Meridian', topic: 'Specialist challenge', kind: 'specialist',
    place: 'Station Meridian, 400 km orbit',
    intro: 'The station is in trouble and your specialist must step up. Your frame material no longer decides the odds — your crew role and its expertise do. Damage you carried here (seized joints, fogged sensors) still matters.',
    watch: ['Your role’s +3 specialist bonus', 'Specialist question (+3)', 'Lingering handling damage'],
    cards: null },
];

// ---------------------------------------------------------------- Event cards
export const CARDS = {
  // ===== LEG 1 — specific strength & stiffness
  l1a: {
    leg: 1, title: 'Max-G Pull-Up', tags: ['strength'], dc: 11,
    text: 'Wind shear over the ridge! You must pull 4.5 g at full take-off weight. Every spar and longeron sees peak stress — and every crate adds to it.',
    labels: { std: 'Firm, steady pull-up', push: 'Full-power zoom climb', safe: 'Dump fuel, shallow climb' },
    mods: m(3, 2, -3, 3, 0, -1),
    why: {
      ti: 'σy/ρ ≈ 200 kN·m/kg (880 MPa at 4.43 g/cm³)',
      al: 'σy/ρ ≈ 180 kN·m/kg — 7075-T6 is the strongest common Al alloy',
      ss: 'σy/ρ ≈ 30 kN·m/kg: soft austenite carrying 8 g/cm³',
      cf: 'σy/ρ ≈ 400 kN·m/kg (quasi-isotropic) — far ahead of any metal',
      mg: 'σy/ρ ≈ 100 kN·m/kg: very light but weak',
      cr: 'σy/ρ ≈ 58 kN·m/kg normalised (Q&T roughly doubles it)',
    },
    special: { id: 'ductile', label: 'Let it yield (ductile reserve)', dc: 0, time: 0, avail: ['ss', 'cr'], effect: 'failToPartialSet',
      desc: 'Rely on huge ductility and work hardening: a Failure becomes a Partial, but the spar takes a permanent set.',
      locked: 'Needs high ductility and strain hardening (316L ≈50% elongation, normalised 4130 ≈25%). Ti-6Al-4V (14%), 7075 (11%), WE43 (2–7%) and CFRP (≈1.5% strain, no yield) would crack instead.' },
    outcomes: {
      success: { text: 'The frame takes the load with margin to spare.', fx: [] },
      partial: { text: 'Rivets pop and a stringer buckles locally — but you clear the ridge.', fx: [{ dmg: 2 }] },
      fail:    { text: 'A main spar yields. Something heavy breaks loose in the hold.', fx: [{ dmg: 4 }, { cond: 'yielded' }, { crate: -1 }] },
    },
    insight: 'For a tie of fixed load and length, minimum mass means maximising σy/ρ. CFRP and Ti lead; annealed 316L needs about six times the mass of 7075 for the same strength. Cargo mass raises the load itself — the reason payload fraction is the airframe designer’s obsession.',
  },
  l1b: {
    leg: 1, title: 'Flutter Boundary', tags: ['stiffness', 'handling'], dc: 11,
    text: 'Approaching Mach 0.9 the wingtips start to buzz: bending and twisting are coupling into flutter. Torsional stiffness per kilogram decides whether it damps out or tears the wing off.',
    labels: { std: 'Hold speed, damp with controls', push: 'Punch through to supersonic', safe: 'Slow below flutter speed' },
    mods: m(1, 2, -2, 3, 2, -1),
    why: {
      ti: 'G/ρ ≈ 10 MN·m/kg like every metal; 4.4 g/cm³ means thinner walls than Al',
      al: 'Low density allows thick-walled, torsionally stiff box sections',
      ss: 'Densest frame: at equal mass its walls are thin and twist easily',
      cf: '±45° plies tailor shear stiffness — G/ρ up to ≈20 MN·m/kg',
      mg: 'Lightest metal: thickest walls for the mass, high torsional-buckling resistance',
      cr: 'Dense: at equal mass, thin tube walls give up torsional stiffness',
    },
    special: { id: 'tailor', label: 'Aeroelastic tailoring', dc: -4, time: 0, avail: ['cf'],
      desc: 'Exploit the laminate’s bend–twist coupling so the wing washes out under load (as on the X-29).',
      locked: 'Only an anisotropic laminate can couple bending and twisting by fibre orientation — isotropic metals cannot.' },
    outcomes: {
      success: { text: 'The oscillation damps out. Smooth air.', fx: [] },
      partial: { text: 'The buzz rattles fittings loose before it damps.', fx: [{ dmg: 2 }] },
      fail:    { text: 'Violent flutter twists the wing box before you can slow down.', fx: [{ dmg: 3 }, { cond: 'twisted' }, { time: 2 }] },
    },
    insight: 'Flutter speed rises with torsional stiffness GJ. Shear modulus per density (G/ρ) is almost identical for Ti, Al, Mg and steel (≈10 MN·m/kg) — light metals win only because low density buys thicker walls for the same mass, which resists twisting and torsional buckling. Composites go further by aligning ±45° fibres.',
  },
  l1c: {
    leg: 1, title: 'Skin-Panel Buckling', tags: ['stiffness'], dc: 11,
    text: 'The climb compresses the upper skin. Thin panels want to ripple and buckle. For panels, the mass-saving index is ∛E/ρ — density matters far more than modulus.',
    labels: { std: 'Hold the planned climb', push: 'Steeper, faster climb', safe: 'Shallow climb, lower loads' },
    mods: m(0, 2, -2, 3, 3, -2),
    why: {
      ti: '∛E/ρ ≈ 1.1',
      al: '∛E/ρ ≈ 1.5',
      ss: '∛E/ρ ≈ 0.72 — steel skins must be very thin',
      cf: '∛E/ρ ≈ 2.4 — the best here',
      mg: '∛E/ρ ≈ 1.9 — the best metal for panel stiffness per kg',
      cr: '∛E/ρ ≈ 0.75 — steel skins must be very thin',
    },
    special: { id: 'thick', label: 'Thicken the skin', dc: -4, time: 1, avail: ['al', 'mg', 'cf'],
      desc: 'Low density makes a thicker, buckle-proof skin cheap in mass (+1 h for the extra weight).',
      locked: 'At 4.4–8 g/cm³, thickening the skin costs too much mass. This is exactly why the ∛E/ρ index punishes dense materials.' },
    outcomes: {
      success: { text: 'Panels stay flat; the climb is clean.', fx: [] },
      partial: { text: 'Panels ripple and fasteners work loose.', fx: [{ dmg: 2 }] },
      fail:    { text: 'An upper panel buckles and the stiffener under it cracks.', fx: [{ dmg: 3 }, { cond: 'yielded' }, { time: 1 }] },
    },
    insight: 'A panel’s buckling load scales with E·t³; at fixed mass t ∝ 1/ρ, so the index to maximise is ∛E/ρ. Magnesium beats aluminium, titanium and steel here — why it is used for gearbox casings, seat frames and laptop chassis.',
  },

  // ===== LEG 2 — fatigue
  l2a: {
    leg: 2, title: 'Ten Thousand Gusts', tags: ['fatigue'], dc: 11,
    text: 'The jet stream hammers you for hours. Each gust is a small load cycle — far below yield — but there are tens of thousands of them.',
    labels: { std: 'Fly the corridor', push: 'Straight through the core', safe: 'Climb above the jet stream' },
    mods: m(2, -2, 1, 2, -2, 2),
    why: {
      ti: 'High endurance ratio: fatigue limit ≈ 510 MPa unnotched',
      al: 'No endurance limit: ≈160 MPa at 5×10⁸ cycles vs 503 MPa yield',
      ss: 'Tough FCC with an endurance limit ≈ 240 MPa, but low yield',
      cf: 'Fibres carry cyclic tension superbly (≈60–70% of static strength after 10⁷ cycles)',
      mg: 'No true endurance limit and low fatigue strength (≈90 MPa)',
      cr: 'BCC steel: a true endurance limit — solute carbon pins dislocations',
    },
    special: { id: 'endurance', label: 'Stay below the endurance limit', dc: -6, time: 3, avail: ['ti', 'ss', 'cr'],
      desc: 'Throttle back so the stress amplitude stays under the fatigue limit — in theory, infinite life (+3 h).',
      locked: 'Aluminium and magnesium alloys have no true endurance limit: every cycle does some damage (Miner’s rule). Composites accumulate matrix damage instead.' },
    outcomes: {
      success: { text: 'The frame rides out the corridor without a mark.', fx: [] },
      partial: { text: 'Fine. Probably. (A crack may have initiated somewhere you can’t see.)', fx: [{ byMat: { cf: [{ cond: 'microcrack', hidden: true }], default: [{ cond: 'crack', stage: 1, hidden: true }] } }] },
      fail:    { text: 'Something cracked — you heard it. Finding it is another matter.', fx: [{ dmg: 3 }, { byMat: { cf: [{ cond: 'delam', hidden: true }], default: [{ cond: 'crack', stage: 2, hidden: true }] } }] },
    },
    insight: 'BCC steels and Ti alloys show an endurance limit on the S–N curve; aluminium and magnesium alloys do not, so designers use a finite life and Miner’s rule. Damage-tolerant design assumes cracks exist and inspects before they reach critical size.',
  },
  l2b: {
    leg: 2, title: 'Rivet-Hole Hot Spot', tags: ['fatigue', 'notch'], dc: 11,
    text: 'Every fastener hole concentrates stress about three times. In this turbulence the holes along the lap joints are where cracks will start.',
    labels: { std: 'Fly the corridor', push: 'Accept the pounding, go fast', safe: 'Reduce speed in the gusts' },
    mods: m(0, -2, 2, 1, -2, 1),
    why: {
      ti: 'Superb unnotched, but Ti-6Al-4V is notch-sensitive (Kt = 3 roughly halves fatigue strength)',
      al: 'Notch-sensitive: multi-site cracks at rivet holes tore open Aloha 243 in 1988',
      ss: 'Extremely ductile: local yielding blunts the notch',
      cf: 'Can be co-cured or bonded with fewer holes; low fatigue notch sensitivity',
      mg: 'Low ductility and fatigue strength: notches bite hard',
      cr: 'Endurance limit plus good toughness',
    },
    special: { id: 'coldx', label: 'Cold-expand the holes', dc: -3, time: 1, avail: ['ti', 'al', 'ss', 'mg', 'cr'],
      desc: 'Pull an oversized mandrel through each hole: a ring of compressive residual stress keeps cracks closed (+1 h).',
      locked: 'Cold expansion relies on plastic deformation of a metal — it would crush and delaminate a composite.' },
    outcomes: {
      success: { text: 'The joints hold. No cracks at the holes.', fx: [] },
      partial: { text: 'Tiny cracks may be starting at a few rivet holes.', fx: [{ byMat: { cf: [{ cond: 'microcrack', hidden: true }], default: [{ cond: 'crack', stage: 1, hidden: true }] } }] },
      fail:    { text: 'A lap joint fails along a row of rivet holes.', fx: [{ dmg: 3 }, { byMat: { cf: [{ cond: 'delam', hidden: true }], default: [{ cond: 'crack', stage: 2, hidden: true }] } }] },
    },
    insight: 'Fatigue cracks start at stress concentrations: holes, corners, scratches. The Comet 1 losses (1954) began at window and antenna cut-out corners; Aloha 243 lost a section of roof to multi-site cracks at rivet holes after 89,000 flights. Cold expansion and shot peening fight back with compressive residual stress.',
  },
  l2c: {
    leg: 2, title: 'Engine-Mount Resonance', tags: ['fatigue'], dc: 11,
    text: 'An engine imbalance hits the natural frequency of its mount. Amplitude climbs every second — damping capacity suddenly matters.',
    labels: { std: 'Ride it and adjust throttle', push: 'Ignore it, full power', safe: 'Shut down and relight' },
    mods: m(1, -1, 0, 1, 2, 1),
    why: {
      ti: 'Strong high-cycle fatigue, but low internal damping',
      al: 'Low damping and no endurance limit',
      ss: 'Moderate damping, decent endurance limit',
      cf: 'The polymer matrix dissipates some vibration energy',
      mg: 'High damping capacity — dislocation and twin motion soak up vibration energy',
      cr: 'Endurance limit keeps small amplitudes harmless',
    },
    outcomes: {
      success: { text: 'You detune the resonance before it does harm.', fx: [] },
      partial: { text: 'The mount shook hard. There may be cracks at the welds.', fx: [{ dmg: 1 }, { byMat: { cf: [{ cond: 'microcrack', hidden: true }], default: [{ cond: 'crack', stage: 1, hidden: true }] } }] },
      fail:    { text: 'A mount bracket cracks through and the engine sags.', fx: [{ dmg: 3 }, { time: 1 }, { byMat: { cf: [{ cond: 'delam', hidden: true }], default: [{ cond: 'crack', stage: 2, hidden: true }] } }] },
    },
    insight: 'At resonance, stress amplitude is limited mainly by damping. Magnesium alloys have unusually high damping capacity (strongest in pure Mg and Mg-Zr alloys, moderate in WE43), which is one reason Mg is used for vibrating housings. Steels and titanium ring like bells.',
  },
  l2d: {
    leg: 2, title: 'Salt-Spray Corrosion Fatigue', tags: ['fatigue', 'corrosion'], dc: 11,
    text: 'The storm drags you low over the sea. Salt spray coats the structure while it flexes — corrosion pits become crack starters and cracks grow faster in brine.',
    labels: { std: 'Push through the spray', push: 'Skim the waves for speed', safe: 'Climb out of the spray' },
    mods: m(3, -2, 2, 1, -3, -1),
    why: {
      ti: 'TiO₂ passive film: practically immune to seawater',
      al: '7075-T6 is prone to pitting, exfoliation and stress-corrosion cracking',
      ss: 'Cr₂O₃ film plus 2–3% Mo resists chloride pitting',
      cf: 'Carbon fibre does not corrode (beware galvanic coupling with Al fasteners)',
      mg: 'The most anodic structural metal — corrodes rapidly in salt, worse when coupled to other metals',
      cr: 'Rust pits act as fatigue crack starters — paint is essential',
    },
    outcomes: {
      success: { text: 'Protective films hold. A good wash at the next stop.', fx: [] },
      partial: { text: 'Pitting has started under the paint.', fx: [{ byMat: { ti: [], ss: [], cf: [{ dmg: 1 }], default: [{ cond: 'corrosion' }] } }] },
      fail:    { text: 'Corrosion pits have become cracks.', fx: [{ dmg: 3 }, { byMat: { ti: [{ cond: 'crack', stage: 1, hidden: true }], ss: [{ cond: 'crack', stage: 1, hidden: true }], cf: [{ cond: 'microcrack', hidden: true }], default: [{ cond: 'corrosion' }, { cond: 'crack', stage: 1, hidden: true }] } }] },
    },
    insight: 'Corrosion and fatigue together are worse than either alone: pits concentrate stress, and many alloys lose their endurance limit in a corrosive environment. Over-ageing 7075 to T73 trades strength for stress-corrosion resistance; magnesium needs coatings and careful galvanic isolation.',
  },

  // ===== LEG 3 — probability (no material modifiers)
  l3a: { leg: 3, title: 'Jet-Stream Tailwind', tags: ['luck'], text: 'A screaming tailwind core lies just above you. Riding it could save hours — or shake you badly if you misjudge the shear.',
    options: [
      { id: 'ride', label: 'Ride the jet core', dc: 10, fx: { success: [{ time: -4 }], partial: [{ time: -1 }], fail: [{ time: 2 }, { dmg: 1 }] } },
      { id: 'hold', label: 'Hold cruise altitude', dc: null, fx: { auto: [] } },
    ], insight: 'Risk = probability × consequence. A 55% chance of −4 h against a 20% chance of +2 h has a strongly positive expected value.' },
  l3b: { leg: 3, title: 'Bird Strike!', tags: ['luck', 'handling'], text: 'A skein of geese fills the windscreen.',
    options: [
      { id: 'evade', label: 'Hard evasive turn', dc: 12, fx: { success: [], partial: [{ dmg: 1 }], fail: [{ dmg: 3 }] } },
      { id: 'climb', label: 'Pull up steeply over them', dc: 8, fx: { success: [{ time: 2 }], partial: [{ time: 2 }, { dmg: 1 }], fail: [{ time: 2 }, { dmg: 3 }] } },
    ], insight: 'Two options, two risk profiles: one costs time for certain, the other risks damage. Which is "better" depends on what your crew can afford to lose.' },
  l3c: { leg: 3, title: 'Navigation Glitch', tags: ['luck'], text: 'Your satellite fix suddenly jumps 40 km. Spoofing? A fault? You can trust the box — or take a star sighting.',
    options: [
      { id: 'trust', label: 'Trust the instruments', dc: 11, fx: { success: [], partial: [{ time: 2 }], fail: [{ time: 4 }] } },
      { id: 'stars', label: 'Recalibrate by star sighting', dc: null, fx: { auto: [{ time: 2 }] } },
    ], insight: 'A certain small loss versus a gamble with a similar average cost: risk-averse crews take the sighting.' },
  l3d: { leg: 3, title: 'Supply-Drone Rendezvous', tags: ['luck', 'handling'], text: 'A resupply drone is loitering nearby with a spare-parts pod. A mid-air grab is tricky.',
    options: [
      { id: 'grab', label: 'Attempt the mid-air pickup', dc: 12, fx: { success: [{ spare: 1 }], partial: [], fail: [{ dmg: 2 }] } },
      { id: 'wave', label: 'Wave it off', dc: null, fx: { auto: [] } },
    ], insight: 'Spares become repair attempts later. Is a 45% chance of a spare worth a 25% chance of 2 damage?' },
  l3e: { leg: 3, title: 'Solar Storm Warning', tags: ['luck'], text: 'A coronal mass ejection will arrive within the hour. Avionics may reset; you could wait it out in the planet’s shadow.',
    options: [
      { id: 'fly', label: 'Fly through it', dc: 12, fx: { success: [], partial: [{ dmg: 1 }, { time: 1 }], fail: [{ dmg: 2 }, { time: 2 }] } },
      { id: 'wait', label: 'Shelter and wait', dc: null, fx: { auto: [{ time: 3 }] } },
    ], insight: 'Waiting costs a certain 3 h; flying risks smaller losses. Compare the expected time and damage.' },
  l3f: { leg: 3, title: 'Distress Beacon', tags: ['luck'], text: 'A weather-balloon crew is down on a glacier below. Helping will cost time.',
    options: [
      { id: 'help', label: 'Divert and assist', dc: 9, fx: { success: [{ time: 3 }, { pts: 4 }], partial: [{ time: 3 }, { pts: 2 }], fail: [{ time: 3 }] } },
      { id: 'relay', label: 'Relay their position, continue', dc: null, fx: { auto: [{ pts: 1 }] } },
    ], insight: 'Not every decision is about winning the race. (Engineers have a duty of care.)' },
  l3g: { leg: 3, title: 'Canyon Updraft Shortcut', tags: ['luck', 'handling'], text: 'A narrow canyon funnels a powerful updraft — a short cut to altitude, if you can thread it.',
    options: [
      { id: 'thread', label: 'Thread the canyon', dc: 14, fx: { success: [{ time: -5 }], partial: [{ time: -2 }, { dmg: 1 }], fail: [{ dmg: 3 }, { time: 1 }] } },
      { id: 'around', label: 'Go around', dc: null, fx: { auto: [] } },
    ], insight: 'A low-probability, high-reward gamble. Worth it if you are behind; foolish if your integrity is low.' },
  l3h: { leg: 3, title: 'Engine Flame-Out', tags: ['luck', 'handling'], text: 'Number two engine flames out in the thin air.',
    options: [
      { id: 'windmill', label: 'Windmill relight at altitude', dc: 11, fx: { success: [], partial: [{ time: 1 }], fail: [{ time: 3 }, { dmg: 2 }] } },
      { id: 'dive', label: 'Dive for a starter-assisted relight', dc: 7, fx: { success: [{ time: 1 }], partial: [{ time: 2 }], fail: [{ time: 3 }, { dmg: 2 }] } },
    ], insight: 'The safer option has a certain small cost built in. Many engineering choices look like this.' },

  // ===== LEG 4 — thermal behaviour
  l4a: {
    leg: 4, title: 'Mach 3 Skin Heating', tags: ['heat'], dc: 11,
    text: 'At Mach 3 the stagnation temperature drives the skin past 300 °C. Strength now depends on whether your microstructure is stable at temperature.',
    labels: { std: 'Cruise at Mach 3', push: 'Sprint at Mach 3.5', safe: 'Throttle back to Mach 2.2' },
    mods: m(3, -3, 4, -3, 1, 2),
    why: {
      ti: 'Useful strength to ≈400 °C — why the SR-71 was ≈90% titanium',
      al: '7075-T6 over-ages above ≈150 °C: η′ precipitates coarsen and strength falls for good',
      ss: 'Austenitic stainless keeps useful strength to ≈800 °C',
      cf: 'The epoxy matrix nears its glass transition (Tg ≈ 180 °C): compression strength collapses',
      mg: 'WE43’s Y/Nd precipitates resist coarsening to ≈250 °C — exceptional for magnesium',
      cr: 'Keeps its strength while below its tempering temperature (≈540–650 °C)',
    },
    special: { id: 'tps', label: 'Bolt on a thermal blanket', dc: -5, time: 1, cost: { crate: 1 },
      desc: 'Insulation keeps the structure cool — but its mass means dumping one crate (+1 h).',
      locked: 'You have no cargo to give up for the blanket’s mass.' },
    outcomes: {
      success: { text: 'The structure soaks the heat and holds.', fx: [] },
      partial: { text: 'Hot spots near the leading edges. The frame groans but holds.', fx: [{ dmg: 2 }] },
      fail: { text: 'The heat has changed your material.', fx: [{ dmg: 3 }, { byMat: {
        al: [{ cond: 'overaged' }], cf: [{ cond: 'matrix' }], ti: [{ cond: 'alphacase' }], mg: [{ cond: 'creep' }],
        'ss:cw': [{ cond: 'softened' }], ss: [], 'cr:qt': [{ cond: 'softened' }], cr: [{ cond: 'creep' }] } }] },
    },
    insight: 'The SR-71 Blackbird cruised at Mach 3.2 with skin temperatures of about 260–320 °C. Aluminium alloys lose their precipitation strengthening above ≈150 °C, so Lockheed built the airframe mostly from titanium. Strength at temperature depends on microstructural stability: precipitates coarsen, cold work recovers, polymers soften past Tg.',
  },
  l4b: {
    leg: 4, title: 'Sun-Side Warp', tags: ['distortion'], dc: 11,
    text: 'One flank is in blazing sun, the other faces black sky and cold fuel. The temperature gradient bends the airframe like a bimetallic strip, misaligning control surfaces.',
    labels: { std: 'Trim and carry on', push: 'Ignore the warp, keep pace', safe: 'Slow down and re-trim' },
    mods: m(-2, 3, -2, 3, 0, 1),
    why: {
      ti: 'Lowest conductivity here (k ≈ 6.7 W/m·K): steep gradients, k/α ≈ 0.8',
      al: 'k ≈ 130 W/m·K spreads heat quickly: k/α ≈ 5.5',
      ss: 'Poor conductor with high expansion: k/α ≈ 1.0',
      cf: 'Near-zero expansion along the fibres — why telescope trusses are CFRP',
      mg: 'Good conductor but high expansion: k/α ≈ 1.9',
      cr: 'k/α ≈ 3.5',
    },
    special: { id: 'bbq', label: 'Barbecue roll', dc: -4, time: 2, avail: 'all',
      desc: 'Roll slowly about your long axis to even out solar heating — Apollo’s "passive thermal control" (+2 h).' },
    outcomes: {
      success: { text: 'Heat spreads evenly; the frame stays true.', fx: [] },
      partial: { text: 'The warp costs you time re-trimming.', fx: [{ dmg: 1 }, { time: 2 }] },
      fail:    { text: 'The frame warps and control linkages bind.', fx: [{ dmg: 2 }, { cond: 'twisted' }, { time: 1 }] },
    },
    insight: 'Thermal distortion is controlled by k/α: high conductivity evens out the temperature and low expansion limits the strain. Aluminium and CFRP excel; titanium and stainless steel — the hot-strength champions — distort badly. No material wins every thermal test.',
  },
  l4c: {
    leg: 4, title: 'Engine-Bay Fire', tags: ['fire'], dc: 11,
    text: 'A fuel line fails and the engine bay is burning. Can the structure keep its strength long enough to put it out?',
    labels: { std: 'Fire drill: shut off, extinguish', push: 'Keep thrust, fight it en route', safe: 'Dive, slow, extinguish' },
    mods: m(0, -1, 3, -2, -1, 2),
    why: {
      ti: 'Melts ≈1650 °C, but titanium can sustain combustion in oxygen-rich rubs (compressor “titanium fires”)',
      al: 'Melts at only ≈480–635 °C — loses strength fast in a fire',
      ss: 'Melts ≈1400 °C and resists oxidation',
      cf: 'The epoxy matrix burns and gives toxic smoke; the laminate delaminates',
      mg: 'WE43’s yttrium-rich oxide makes it ignition-resistant (FAA-accepted for seats since 2015), but Mg is still combustible',
      cr: 'Melts ≈1430 °C; keeps strength well in a short fire',
    },
    special: { id: 'halon', label: 'Dump extinguisher & dive', dc: -3, time: 1, avail: 'all', cost: { spare: 1 },
      desc: 'Use a spare extinguisher bottle (costs 1 spare, +1 h).',
      locked: 'You have no spares to use.' },
    outcomes: {
      success: { text: 'Fire out. Scorched paint, sound structure.', fx: [] },
      partial: { text: 'The fire is out, but the bay is cooked.', fx: [{ dmg: 2 }] },
      fail:    { text: 'The fire burns through a bulkhead and into the hold.', fx: [{ dmg: 4 }, { crate: -1 }] },
    },
    insight: 'Fire behaviour depends on melting point, ignition resistance and what burns. Rare-earth Mg alloys such as WE43 form protective Y-rich oxides that raise ignition resistance — one reason Mg returned to aircraft cabins after decades of being banned.',
  },

  // ===== LEG 5 — vacuum & space environment
  l5a: {
    leg: 5, title: 'Cold Soak in Earth’s Shadow', tags: ['cryo'], dc: 11,
    text: 'Forty minutes in Earth’s shadow: the structure soaks down towards −150 °C. Some crystal structures stay tough. Others cleave like glass.',
    labels: { std: 'Ride out the eclipse', push: 'Manoeuvre while cold', safe: 'Heaters on, minimum loads' },
    mods: m(2, 2, 4, -1, -2, -4),
    why: {
      ti: 'Ti-6Al-4V (ELI grade) is used for cryogenic pressure vessels',
      al: 'FCC: no ductile-to-brittle transition — the standard cryogenic-tank material',
      ss: 'FCC austenite stays tough to −196 °C and actually gets stronger',
      cf: 'Fibre/matrix expansion mismatch causes matrix microcracking at cryogenic temperatures',
      mg: 'HCP: few active slip systems — ductility falls further in the cold',
      cr: 'BCC steel below its ductile-to-brittle transition: cleavage fracture (cf. Liberty ships)',
    },
    outcomes: {
      success: { text: 'The structure rings, but stays tough.', fx: [] },
      partial: { text: 'Thermal contraction pops a few fasteners.', fx: [{ dmg: 2 }] },
      fail:    { text: 'A brittle crack runs through a cold fitting.', fx: [{ dmg: 4 }, { byMat: { cf: [{ cond: 'microcrack', hidden: true }], default: [{ cond: 'crack', stage: 1 }] } }] },
    },
    insight: 'BCC metals (ferritic and martensitic steels) show a ductile-to-brittle transition: at low temperature dislocations move only with difficulty and cleavage wins. FCC metals (aluminium, austenitic stainless) do not — so 300-series stainless and aluminium alloys are the go-to for cryogenic tanks. Fine-grained tempered martensite lowers the transition temperature.',
  },
  l5b: {
    leg: 5, title: 'Atomic Oxygen & UV', tags: ['oxidation'], dc: 11,
    text: 'At 400 km the thin atmosphere is mostly atomic oxygen, slamming into your leading surfaces at 7.8 km/s with ≈5 eV each, under unfiltered ultraviolet.',
    labels: { std: 'Normal attitude', push: 'Fly lower for speed (denser AO)', safe: 'Edge-on attitude, slower' },
    mods: m(2, 2, 2, -4, -1, 0),
    why: {
      ti: 'Stable, adherent TiO₂ film',
      al: 'Al₂O₃ (Pilling–Bedworth ratio 1.28) seals the surface',
      ss: 'Cr₂O₃ film protects',
      cf: 'Atomic oxygen reacts with epoxy AND carbon to form CO/CO₂ — the laminate erodes',
      mg: 'MgO is porous (Pilling–Bedworth ratio 0.81) — not protective',
      cr: 'Iron oxide (PBR ≈ 2.1) cracks and flakes — needs a coating',
    },
    special: { id: 'sio2', label: 'Spend a spare on SiO₂ coating', dc: -5, time: 0, avail: 'all', cost: { spare: 1 },
      desc: 'A thin glassy SiO₂ film converts AO-reactive surfaces into AO-proof ones (costs 1 spare).',
      locked: 'You have no spares to use.' },
    outcomes: {
      success: { text: 'Surfaces hold. A faint glow on the leading edges.', fx: [] },
      partial: { text: 'Surfaces are etched and dulled.', fx: [{ dmg: 1 }] },
      fail:    { text: 'The surface is eroding away.', fx: [{ dmg: 3 }, { byMat: { cf: [{ cond: 'eroded' }], mg: [{ cond: 'corrosion' }], default: [] } }] },
    },
    insight: 'NASA’s Long Duration Exposure Facility spent 69 months in orbit: unprotected polymers and composites were deeply eroded by atomic oxygen while most metals barely changed. The Pilling–Bedworth ratio predicts which oxides protect — Al₂O₃ and Cr₂O₃ do; porous MgO does not.',
  },
  l5c: {
    leg: 5, title: 'Outgassing & Cold Welding', tags: ['vacuum'], dc: 11,
    text: 'Hard vacuum. Absorbed water boils out of polymers, and the oxide films that normally separate sliding metal surfaces are no longer replenished. Hinges and latches start to stick.',
    labels: { std: 'Cycle mechanisms normally', push: 'Skip the vacuum bake-out', safe: 'Bake out slowly, exercise joints' },
    mods: m(-2, 1, -1, -2, -2, 2),
    why: {
      ti: 'Titanium is the classic galling and cold-welding offender in vacuum',
      al: 'Anodised surfaces resist adhesion; negligible outgassing',
      ss: 'Austenitic stainless galls notoriously when self-mated',
      cf: 'The matrix releases water and volatiles — dimensional change and contamination',
      mg: 'High vapour pressure: hot magnesium can sublime in hard vacuum',
      cr: 'Ferritic steel resists galling better than Ti or austenitic stainless; no outgassing',
    },
    special: { id: 'mos2', label: 'Spend a spare on MoS₂ dry lubricant', dc: -4, time: 0, avail: 'all', cost: { spare: 1 },
      desc: 'Oils evaporate in vacuum; a dry-film lubricant does not (costs 1 spare).',
      locked: 'You have no spares to use.' },
    outcomes: {
      success: { text: 'Mechanisms move freely; sensors stay clean.', fx: [] },
      partial: { text: 'Something is sticking — or fogging.', fx: [{ byMat: { ti: [{ cond: 'galled' }], ss: [{ cond: 'galled' }], cf: [{ cond: 'outgassed' }], mg: [{ dmg: 2 }], default: [{ dmg: 1 }] } }] },
      fail:    { text: 'A latch cold-welds shut and the windows fog.', fx: [{ dmg: 3 }, { byMat: { ti: [{ cond: 'galled' }], ss: [{ cond: 'galled' }], cf: [{ cond: 'outgassed' }], mg: [{ dmg: 1 }], al: [{ cond: 'galled' }], default: [] } }] },
    },
    insight: 'In vacuum, clean similar metals pressed together can adhere ("cold welding") — titanium and austenitic stainless are notorious for galling. Polymers outgas, so space materials are screened to ASTM E595 (total mass loss < 1%, condensable volatiles < 0.1%). Magnesium, zinc and cadmium have high vapour pressures and are avoided near hot surfaces.',
  },
  l5d: {
    leg: 5, title: 'Micrometeoroid Strike', tags: ['impact'], dc: 11,
    text: 'A grain of dust at 10 km/s hits the hull. Hypervelocity impacts vaporise material and send shock waves through the structure.',
    labels: { std: 'Hold course', push: 'Ignore the debris field', safe: 'Turn the shielded side forward' },
    mods: m(2, 1, 2, -3, -1, 2),
    why: {
      ti: 'Tough α+β alloy absorbs the shock',
      al: 'The classic Whipple-shield bumper material',
      ss: 'Very tough: absorbs energy by plastic flow',
      cf: 'Impact delaminates the laminate — often barely visible from outside',
      mg: 'Low fracture toughness (K_IC ≈ 15 MPa√m)',
      cr: 'Tough steel absorbs the shock',
    },
    outcomes: {
      success: { text: 'A neat crater. Nothing more.', fx: [] },
      partial: { text: 'The hit left a mark — maybe more inside.', fx: [{ dmg: 2 }, { byMat: { cf: [{ cond: 'delam', hidden: true }], default: [] } }] },
      fail:    { text: 'The impact punches through into the hold.', fx: [{ dmg: 4 }, { crate: -1 }, { byMat: { cf: [{ cond: 'delam', hidden: true }], default: [{ cond: 'crack', stage: 1, hidden: true }] } }] },
    },
    insight: 'Spacecraft shields use a thin aluminium "bumper" to shatter and vaporise the particle before it reaches the wall (the Whipple shield). Composites are vulnerable to impact because delaminations hide below an apparently intact surface.',
  },
};

// Leg 6: one card per role. No material modifiers — the specialist decides it.
const DOCK_OPTIONS = [
  { id: 'bold', label: 'Bold: fast and precise', dc: 15, time: -3, fx: { success: [{ pts: 3 }], partial: [{ dmg: 2 }], fail: [{ dmg: 3 }, { crate: -1 }] } },
  { id: 'std', label: 'By the book', dc: 11, time: 0, fx: { success: [], partial: [{ dmg: 2 }], fail: [{ dmg: 3 }, { crate: -1 }] } },
  { id: 'safe', label: 'Wait for station support', dc: 7, time: 4, fx: { success: [], partial: [{ dmg: 1 }], fail: [{ dmg: 3 }, { crate: -1 }] } },
];
export const DOCK_CARDS = {
  pilot: { leg: 6, title: 'Manual Docking — Guidance Lost', tags: ['handling', 'luck'], role: 'pilot',
    text: 'Meridian’s docking beacon has failed. Your Test Pilot must hand-fly the final 200 m onto a spinning docking port.',
    options: DOCK_OPTIONS, insight: 'Specialist skill shifts the odds more than any material property here — but seized joints or fogged sensors from Leg 5 still hurt.' },
  structural: { leg: 6, title: 'Cracked Docking Collar', tags: ['handling', 'luck'], role: 'structural',
    text: 'The station’s docking collar has a crack. Your Structural Engineer must decide what load it can safely take and brace it.',
    options: DOCK_OPTIONS, insight: 'Safety factors exist because loads, material properties and flaws are all uncertain.' },
  metallurgist: { leg: 6, title: 'Fracture Detective', tags: ['handling', 'luck'], role: 'metallurgist',
    text: 'A station strut has snapped and nobody knows why. Your Metallurgist reads the fracture surface before anyone docks.',
    options: DOCK_OPTIONS, insight: 'Fractography — reading fracture surfaces — tells you HOW something failed, which tells you how to stop it happening again.' },
  ndt: { leg: 6, title: 'Weld-Flaw Hunt', tags: ['handling', 'luck'], role: 'ndt',
    text: 'The docking ring was weld-repaired last month. Your NDT Inspector must find any flaw before it takes your mass.',
    options: DOCK_OPTIONS, insight: 'Every NDT method has a physics behind it — and things it cannot see.' },
  coatings: { leg: 6, title: 'Seal & Surface Crisis', tags: ['handling', 'luck'], role: 'coatings',
    text: 'The docking seals and latches have degraded in orbit. Your Surface Engineer must choose the right fix under time pressure.',
    options: DOCK_OPTIONS, insight: 'Most "material" failures in service start at the surface.' },
  quartermaster: { leg: 6, title: 'Cargo Transfer Race', tags: ['handling', 'luck'], role: 'quartermaster',
    text: 'The docking window is closing. Your Quartermaster must get every crate through the hatch before the station swings out of range.',
    options: DOCK_OPTIONS, insight: 'Payload is the whole point of the mission — every kilogram of structure saved is a kilogram of payload delivered.' },
};

export function cardById(id) {
  return CARDS[id] || DOCK_CARDS[id.replace(/^dock:/, '')] || null;
}

// Footprint model (see docs: life-cycle view). Frame mass in tonnes for a notional craft.
export const FOOTPRINT = {
  fuelPerTonneLeg: 0.25,    // t CO2e per tonne of all-up mass per leg
  baseMass: 1.0,            // crew, engines, systems (t)
  crateMass: 0.5,           // t per crate
};

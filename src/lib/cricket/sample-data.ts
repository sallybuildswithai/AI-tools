import type { Delivery, Outcome } from "./types";

/** Deterministisk PRNG, så demo-data er ens ved hver indlæsning. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number) {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Genererer en syntetisk akademi-fast-medium bowler med indbyggede mønstre:
 * farten falder i sene overs, længden spreder sig, korte bolde koster runs,
 * og fulde bolde med sving skaber flest falske slag.
 */
export function generateSampleDeliveries(count = 120, seed = 7): Delivery[] {
  const rand = mulberry32(seed);
  const deliveries: Delivery[] = [];

  for (let i = 0; i < count; i++) {
    const over = Math.floor(i / 6) + 1;
    const fatigue = Math.max(0, over - 8) * 0.55;
    const speedKmh = 128 - fatigue + gaussian(rand) * 2.4;
    const releaseHeight = 2.08 + gaussian(rand) * 0.04;

    // Længden bliver mere spredt og kortere, når bowleren bliver træt.
    const pitchLength = Math.max(
      0.5,
      7.6 + fatigue * 0.25 + gaussian(rand) * (1.9 + fatigue * 0.12),
    );
    const pitchLine = 0.12 + gaussian(rand) * 0.24;

    // Sving falder med alderen på bolden.
    const swingBase = over <= 6 ? 1.6 : over <= 12 ? 0.9 : 0.4;
    const swingDeg = swingBase + gaussian(rand) * 0.7;
    const seamDeg = gaussian(rand) * 0.9;

    const lateral = (swingDeg * 0.04 + seamDeg * 0.02) * Math.min(pitchLength, 9);
    const stumpsLine = pitchLine + lateral * 0.35 + gaussian(rand) * 0.04;
    const bounce = pitchLength < 2 ? 0.25 : 0.08 * pitchLength + 0.1;
    const stumpsHeight = Math.max(0.05, bounce + gaussian(rand) * 0.08);

    const goodLength = pitchLength >= 6 && pitchLength < 8;
    const inCorridor = stumpsLine > 0 && stumpsLine < 0.45;
    let threat = 0.05;
    if (goodLength) threat += 0.1;
    if (inCorridor) threat += 0.07;
    threat += Math.min(Math.abs(swingDeg), 2.5) * 0.04;
    threat += Math.min(Math.abs(seamDeg), 2) * 0.03;

    let runChance = 0.22;
    if (pitchLength > 10) runChance += 0.28;
    if (pitchLength < 3) runChance += 0.2;
    if (Math.abs(stumpsLine) > 0.6 || stumpsLine < -0.15) runChance += 0.18;

    const roll = rand();
    let outcome: Outcome;
    let runs = 0;
    if (roll < threat * 0.12) {
      outcome = "wicket";
    } else if (roll < threat * 0.55) {
      outcome = "edge";
      runs = rand() < 0.3 ? 1 : 0;
    } else if (roll < threat) {
      outcome = "beaten";
    } else if (roll < threat + runChance * 0.22) {
      outcome = "boundary";
      runs = rand() < 0.2 ? 6 : 4;
    } else if (roll < threat + runChance) {
      outcome = "runs";
      runs = rand() < 0.75 ? 1 : 2;
    } else {
      outcome = "dot";
    }

    deliveries.push({
      ball: i + 1,
      over,
      speedKmh: round(speedKmh, 1),
      releaseHeight: round(releaseHeight, 2),
      pitchLine: round(pitchLine, 3),
      pitchLength: round(pitchLength, 2),
      stumpsLine: round(stumpsLine, 3),
      stumpsHeight: round(stumpsHeight, 3),
      swingDeg: round(swingDeg, 2),
      seamDeg: round(seamDeg, 2),
      outcome,
      runs,
    });
  }

  return deliveries;
}

function round(value: number, digits: number) {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

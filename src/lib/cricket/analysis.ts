import { benchmarkKeys, metricConfig } from "./benchmarks";
import type {
  Analysis,
  Benchmark,
  BenchmarkGap,
  Correlation,
  Delivery,
  LengthZone,
  LineZone,
  Metrics,
  OutcomeGroup,
  ZoneStat,
} from "./types";

/** Halv bredde af tre stumps inkl. bails (≈ 22,86 cm / 2). */
export const STUMP_HALF_WIDTH = 0.114;
export const STUMP_HEIGHT = 0.711;
/** Corridor of uncertainty: fra off-stump og ca. 45 cm ud. */
export const CORRIDOR_OUTER = 0.45;

export const lengthZones: { zone: LengthZone; label: string; from: number; to: number }[] = [
  { zone: "yorker", label: "Yorker / fuldtoss", from: 0, to: 2 },
  { zone: "full", label: "Fuld", from: 2, to: 6 },
  { zone: "good", label: "Good length", from: 6, to: 8 },
  { zone: "back", label: "Back of a length", from: 8, to: 10 },
  { zone: "short", label: "Kort", from: 10, to: Infinity },
];

export const lineZones: { zone: LineZone; label: string }[] = [
  { zone: "leg", label: "Legside" },
  { zone: "stumps", label: "På stumps" },
  { zone: "corridor", label: "Korridoren" },
  { zone: "wide", label: "Bred offside" },
];

export function lengthZoneOf(d: Delivery): LengthZone {
  return lengthZones.find((z) => d.pitchLength >= z.from && d.pitchLength < z.to)!.zone;
}

export function lineZoneOf(d: Delivery): LineZone {
  if (d.stumpsLine < -STUMP_HALF_WIDTH) return "leg";
  if (d.stumpsLine <= STUMP_HALF_WIDTH) return "stumps";
  if (d.stumpsLine <= CORRIDOR_OUTER) return "corridor";
  return "wide";
}

export function isFalseShot(d: Delivery) {
  return d.outcome === "beaten" || d.outcome === "edge" || d.outcome === "wicket";
}

export function outcomeGroup(d: Delivery): OutcomeGroup {
  if (isFalseShot(d)) return "threat";
  return d.runs > 0 ? "runs" : "dot";
}

/** Dansk talformat med fast antal decimaler. */
export function fmt(value: number, digits = 0) {
  return value.toLocaleString("da-DK", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

const mean = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;

function sd(values: number[]) {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(mean(values.map((v) => (v - m) ** 2)));
}

export function pearson(xs: number[], ys: number[]): number | null {
  if (xs.length < 10) return null;
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx += (xs[i] - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  }
  if (dx === 0 || dy === 0) return null;
  return num / Math.sqrt(dx * dy);
}

function slope(xs: number[], ys: number[]) {
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let den = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

const pct = (part: number, total: number) => (total === 0 ? 0 : (part / total) * 100);

function zoneStats<Z extends string>(
  deliveries: Delivery[],
  zones: Z[],
  zoneOf: (d: Delivery) => Z,
): ZoneStat<Z>[] {
  return zones.map((zone) => {
    const inZone = deliveries.filter((d) => zoneOf(d) === zone);
    return {
      zone,
      balls: inZone.length,
      pct: pct(inZone.length, deliveries.length),
      falseShotPct: pct(inZone.filter(isFalseShot).length, inZone.length),
      runsPerBall: inZone.length === 0 ? 0 : mean(inZone.map((d) => d.runs)),
    };
  });
}

const correlationFeatures: { feature: string; label: string; value: (d: Delivery) => number | null }[] = [
  { feature: "speed", label: "Fart", value: (d) => d.speedKmh },
  { feature: "length", label: "Længde (m fra stumps)", value: (d) => d.pitchLength },
  {
    feature: "corridorDistance",
    label: "Afstand fra 4.-stump-linjen",
    value: (d) => Math.abs(d.stumpsLine - 0.25),
  },
  { feature: "swing", label: "Sving (abs.)", value: (d) => Math.abs(d.swingDeg) },
  { feature: "seam", label: "Seam (abs.)", value: (d) => Math.abs(d.seamDeg) },
  { feature: "bounce", label: "Højde ved stumps", value: (d) => d.stumpsHeight },
  { feature: "release", label: "Release-højde", value: (d) => d.releaseHeight },
];

export function analyse(deliveries: Delivery[]): Analysis {
  const n = deliveries.length;
  const speeds = deliveries.map((d) => d.speedKmh);
  const overs = deliveries.map((d) => d.over);
  const runs = deliveries.reduce((sum, d) => sum + d.runs, 0);

  const metrics: Metrics = {
    balls: n,
    overs: n / 6,
    avgSpeed: mean(speeds),
    topSpeed: n ? Math.max(...speeds) : 0,
    speedSd: sd(speeds),
    speedTrendPerOver: slope(overs, speeds),
    goodLengthPct: pct(deliveries.filter((d) => lengthZoneOf(d) === "good").length, n),
    lengthSd: sd(deliveries.map((d) => d.pitchLength)),
    lineSd: sd(deliveries.map((d) => d.stumpsLine)),
    corridorPct: pct(deliveries.filter((d) => lineZoneOf(d) === "corridor").length, n),
    hittingStumpsPct: pct(
      deliveries.filter(
        (d) => Math.abs(d.stumpsLine) <= STUMP_HALF_WIDTH && d.stumpsHeight <= STUMP_HEIGHT,
      ).length,
      n,
    ),
    avgAbsSwing: mean(deliveries.map((d) => Math.abs(d.swingDeg))),
    avgAbsSeam: mean(deliveries.map((d) => Math.abs(d.seamDeg))),
    falseShotPct: pct(deliveries.filter(isFalseShot).length, n),
    dotPct: pct(deliveries.filter((d) => d.runs === 0).length, n),
    economy: n === 0 ? 0 : (runs / n) * 6,
    wickets: deliveries.filter((d) => d.outcome === "wicket").length,
    boundaryPct: pct(deliveries.filter((d) => d.outcome === "boundary").length, n),
  };

  const correlations: Correlation[] = correlationFeatures.map(({ feature, label, value }) => {
    const rows = deliveries
      .map((d) => ({ x: value(d), d }))
      .filter((r): r is { x: number; d: Delivery } => r.x !== null);
    const xs = rows.map((r) => r.x);
    return {
      feature,
      label,
      vsFalseShot: pearson(xs, rows.map((r) => (isFalseShot(r.d) ? 1 : 0))),
      vsRuns: pearson(xs, rows.map((r) => r.d.runs)),
    };
  });

  const overNumbers = [...new Set(overs)].sort((a, b) => a - b);
  const speedByOver = overNumbers.map((over) => {
    const inOver = deliveries.filter((d) => d.over === over);
    return { over, avgSpeed: mean(inOver.map((d) => d.speedKmh)), balls: inOver.length };
  });

  return {
    metrics,
    lengthZones: zoneStats(
      deliveries,
      lengthZones.map((z) => z.zone),
      lengthZoneOf,
    ),
    lineZones: zoneStats(
      deliveries,
      lineZones.map((z) => z.zone),
      lineZoneOf,
    ),
    correlations,
    speedByOver,
  };
}

export function compareToBenchmark(metrics: Metrics, benchmark: Benchmark): BenchmarkGap[] {
  return benchmarkKeys.map((key) => {
    const config = metricConfig[key];
    const player = metrics[key];
    const target = benchmark.values[key];
    const diff = config.higherIsBetter ? target - player : player - target;
    const severity = diff / config.scale;
    return {
      key,
      label: config.label,
      unit: config.unit,
      player,
      benchmark: target,
      severity,
      status: severity > 0.5 ? "behind" : severity < -0.5 ? "ahead" : "on-par",
    };
  });
}

export type Insight = { title: string; body: string };

/** Regelbaserede indsigter fra korrelationer og zoner – virker uden AI. */
export function buildInsights(analysis: Analysis): Insight[] {
  const insights: Insight[] = [];
  const { lengthZones: zones, correlations, metrics } = analysis;

  const meaningful = zones.filter((z) => z.balls >= 8);
  const deadliest = [...meaningful].sort((a, b) => b.falseShotPct - a.falseShotPct)[0];
  const costliest = [...meaningful].sort((a, b) => b.runsPerBall - a.runsPerBall)[0];
  const zoneLabel = (zone: LengthZone) => lengthZones.find((z) => z.zone === zone)!.label;

  if (deadliest) {
    insights.push({
      title: `Farligst: ${zoneLabel(deadliest.zone).toLowerCase()}`,
      body: `${fmt(deadliest.falseShotPct, 0)} % falske slag i denne zone, men kun ${fmt(deadliest.pct, 0)} % af dine bolde lander her.`,
    });
  }
  if (costliest && costliest.zone !== deadliest?.zone) {
    insights.push({
      title: `Dyrest: ${zoneLabel(costliest.zone).toLowerCase()}`,
      body: `${fmt(costliest.runsPerBall * 6, 1)} runs pr. over fra ${fmt(costliest.pct, 0)} % af dine bolde.`,
    });
  }

  const strongest = correlations
    .filter((c) => c.vsFalseShot !== null)
    .sort((a, b) => Math.abs(b.vsFalseShot!) - Math.abs(a.vsFalseShot!))[0];
  if (strongest && Math.abs(strongest.vsFalseShot!) >= 0.1) {
    const r = strongest.vsFalseShot!;
    insights.push({
      title: `${strongest.label} hænger sammen med falske slag`,
      body: `r = ${fmt(r, 2)}: jo ${r > 0 ? "højere" : "lavere"} værdi, jo flere falske slag. Det er en sammenhæng, ikke nødvendigvis en årsag.`,
    });
  }

  if (metrics.speedTrendPerOver < -0.2) {
    insights.push({
      title: "Farten falder i løbet af spellet",
      body: `Ca. ${fmt(Math.abs(metrics.speedTrendPerOver), 2)} km/t pr. over – svarer til ${fmt(Math.abs(metrics.speedTrendPerOver * 10), 1)} km/t over 10 overs.`,
    });
  }

  return insights;
}

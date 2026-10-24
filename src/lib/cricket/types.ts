/**
 * Én levering målt af et ball-tracking-system (Hawk-Eye-lignende).
 *
 * Koordinater er set fra bowlerens ende mod en højrehåndet batsman:
 * - `pitchLine` / `stumpsLine`: meter fra midterste stump, positiv = offside.
 * - `pitchLength`: meter fra batsmandens stumps til hvor bolden lander.
 * - `stumpsHeight`: meter over jorden, når bolden passerer stumplinjen.
 */
export type Delivery = {
  ball: number;
  over: number;
  speedKmh: number;
  releaseHeight: number | null;
  pitchLine: number;
  pitchLength: number;
  stumpsLine: number;
  stumpsHeight: number;
  /** Sving i luften i grader. Positiv = outswing (væk fra RHB). */
  swingDeg: number;
  /** Afvigelse fra pitch i grader. Positiv = væk fra RHB. */
  seamDeg: number;
  outcome: Outcome;
  runs: number;
};

export type Outcome = "dot" | "runs" | "boundary" | "beaten" | "edge" | "wicket";

export type OutcomeGroup = "threat" | "dot" | "runs";

export type LengthZone = "yorker" | "full" | "good" | "back" | "short";

export type LineZone = "leg" | "stumps" | "corridor" | "wide";

export type BowlerProfile = {
  name: string;
  style: "fast" | "fast-medium" | "medium" | "swing";
  level: "club" | "academy" | "first-class" | "international";
};

export type Metrics = {
  balls: number;
  overs: number;
  avgSpeed: number;
  topSpeed: number;
  speedSd: number;
  /** km/t ændring pr. over (negativ = farten falder). */
  speedTrendPerOver: number;
  goodLengthPct: number;
  lengthSd: number;
  lineSd: number;
  corridorPct: number;
  hittingStumpsPct: number;
  avgAbsSwing: number;
  avgAbsSeam: number;
  falseShotPct: number;
  dotPct: number;
  economy: number;
  wickets: number;
  boundaryPct: number;
};

export type ZoneStat<Z extends string> = {
  zone: Z;
  balls: number;
  pct: number;
  falseShotPct: number;
  runsPerBall: number;
};

export type Correlation = {
  feature: string;
  label: string;
  vsFalseShot: number | null;
  vsRuns: number | null;
};

export type BenchmarkMetricKey = keyof Pick<
  Metrics,
  | "avgSpeed"
  | "goodLengthPct"
  | "lengthSd"
  | "corridorPct"
  | "hittingStumpsPct"
  | "avgAbsSwing"
  | "avgAbsSeam"
  | "falseShotPct"
  | "dotPct"
  | "economy"
  | "speedTrendPerOver"
>;

export type Benchmark = {
  id: string;
  label: string;
  description: string;
  values: Record<BenchmarkMetricKey, number>;
};

export type BenchmarkGap = {
  key: BenchmarkMetricKey;
  label: string;
  unit: string;
  player: number;
  benchmark: number;
  /** Normaliseret afstand; positiv = spilleren er dårligere end benchmark. */
  severity: number;
  status: "ahead" | "on-par" | "behind";
};

export type Analysis = {
  metrics: Metrics;
  lengthZones: ZoneStat<LengthZone>[];
  lineZones: ZoneStat<LineZone>[];
  correlations: Correlation[];
  speedByOver: { over: number; avgSpeed: number; balls: number }[];
};

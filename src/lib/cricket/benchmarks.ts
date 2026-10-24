import type { Benchmark, BenchmarkMetricKey } from "./types";

/**
 * Indikative referenceprofiler bygget ud fra offentligt kendte niveauer i
 * professionel cricket. De er ikke officielle Hawk-Eye-tal og skal erstattes
 * med jeres egne datasæt, når I har dem.
 */
export const benchmarks: Benchmark[] = [
  {
    id: "intl-fast",
    label: "International fast bowler",
    description: "Testniveau, ny bold, ren fart og hård længde.",
    values: {
      avgSpeed: 140,
      goodLengthPct: 48,
      lengthSd: 1.5,
      corridorPct: 50,
      hittingStumpsPct: 18,
      avgAbsSwing: 1.0,
      avgAbsSeam: 0.9,
      falseShotPct: 20,
      dotPct: 75,
      economy: 3.1,
      speedTrendPerOver: -0.1,
    },
  },
  {
    id: "intl-swing",
    label: "International swing bowler",
    description: "Lavere fart, men sen og konsekvent bevægelse i luften.",
    values: {
      avgSpeed: 132,
      goodLengthPct: 45,
      lengthSd: 1.6,
      corridorPct: 52,
      hittingStumpsPct: 21,
      avgAbsSwing: 1.8,
      avgAbsSeam: 0.7,
      falseShotPct: 21,
      dotPct: 74,
      economy: 3.0,
      speedTrendPerOver: -0.08,
    },
  },
  {
    id: "first-class",
    label: "First-class seamer",
    description: "Professionel county/first-class standard.",
    values: {
      avgSpeed: 130,
      goodLengthPct: 44,
      lengthSd: 1.7,
      corridorPct: 46,
      hittingStumpsPct: 17,
      avgAbsSwing: 1.0,
      avgAbsSeam: 0.8,
      falseShotPct: 17,
      dotPct: 70,
      economy: 3.3,
      speedTrendPerOver: -0.15,
    },
  },
  {
    id: "academy",
    label: "Akademi / talent",
    description: "Stærk ungdoms- eller akademispiller på vej mod elite.",
    values: {
      avgSpeed: 122,
      goodLengthPct: 38,
      lengthSd: 2.0,
      corridorPct: 40,
      hittingStumpsPct: 14,
      avgAbsSwing: 0.9,
      avgAbsSeam: 0.7,
      falseShotPct: 14,
      dotPct: 62,
      economy: 4.2,
      speedTrendPerOver: -0.25,
    },
  },
];

export type MetricConfig = {
  label: string;
  unit: string;
  digits: number;
  higherIsBetter: boolean;
  /** Den afstand der svarer til én "enhed" af forskel ved sammenligning. */
  scale: number;
  drill: string;
};

export const metricConfig: Record<BenchmarkMetricKey, MetricConfig> = {
  avgSpeed: {
    label: "Gns. fart",
    unit: "km/t",
    digits: 1,
    higherIsBetter: true,
    scale: 4,
    drill:
      "Styrk run-up-rytme og hoftesepareringen ved landing. Arbejd med eksplosiv styrke (medicinbold-kast, plyometri) 2 gange om ugen.",
  },
  goodLengthPct: {
    label: "Good length",
    unit: "%",
    digits: 0,
    higherIsBetter: true,
    scale: 6,
    drill:
      "Læg kegler/target-måtte 6-8 m fra stumps og bowl serier af 6 bolde med point for hver landing i zonen.",
  },
  lengthSd: {
    label: "Længdespredning",
    unit: "m",
    digits: 2,
    higherIsBetter: false,
    scale: 0.3,
    drill:
      "Gentag samme release-punkt: video fra siden + fast markering af front-fod. Kort serie (3 overs) med fokus på samme længde hver bold.",
  },
  corridorPct: {
    label: "Corridor of uncertainty",
    unit: "%",
    digits: 0,
    higherIsBetter: true,
    scale: 6,
    drill:
      "Bowl mod en smal korridor-kanal (markeret 0-45 cm uden for off-stump). Tjek at front-arm og hoved peger mod målet.",
  },
  hittingStumpsPct: {
    label: "Rammer stumps",
    unit: "%",
    digits: 0,
    higherIsBetter: true,
    scale: 5,
    drill:
      "Sæt stumps uden batsman og tæl direkte træffere pr. over. Fokus på lidt fyldigere længde og linje på off-stump.",
  },
  avgAbsSwing: {
    label: "Sving (gns.)",
    unit: "°",
    digits: 2,
    higherIsBetter: true,
    scale: 0.4,
    drill:
      "Arbejd med opret søm og håndledsposition bag bolden. Brug en halvt poleret bold og bowl mod et mål med en markeret svinglinje.",
  },
  avgAbsSeam: {
    label: "Seam-bevægelse",
    unit: "°",
    digits: 2,
    higherIsBetter: true,
    scale: 0.25,
    drill:
      "Træn 'wobble seam' og opret søm skiftevis. Filmer release i slowmotion for at tjekke sømmens position.",
  },
  falseShotPct: {
    label: "Falske slag fremkaldt",
    unit: "%",
    digits: 0,
    higherIsBetter: true,
    scale: 3,
    drill:
      "Kombinér længde og linje: flere bolde i good length i korridoren. Brug matchsimulering hvor batsman skal spille på alt.",
  },
  dotPct: {
    label: "Dot balls",
    unit: "%",
    digits: 0,
    higherIsBetter: true,
    scale: 5,
    drill:
      "Byg pres: spil 'maiden-challenge' i nets, hvor hver scoringsbold giver straf. Undgå de løse bolde ved at holde rytmen.",
  },
  economy: {
    label: "Economy",
    unit: "runs/over",
    digits: 2,
    higherIsBetter: false,
    scale: 0.5,
    drill:
      "Kortlæg hvor runs kommer fra (se zonerne) og fjern den dyreste længde fra din plan.",
  },
  speedTrendPerOver: {
    label: "Fartfald pr. over",
    unit: "km/t",
    digits: 2,
    higherIsBetter: true,
    scale: 0.2,
    drill:
      "Byg spell-udholdenhed: intervaller med 6-8 overs i nets og løbetræning med gentagne sprints. Overvåg belastning (workload) ugentligt.",
  },
};

export const benchmarkKeys = Object.keys(metricConfig) as BenchmarkMetricKey[];

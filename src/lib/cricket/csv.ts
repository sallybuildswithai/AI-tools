import type { Delivery, Outcome } from "./types";

export const CSV_COLUMNS = [
  "ball",
  "over",
  "speed_kmh",
  "release_height_m",
  "pitch_line_m",
  "pitch_length_m",
  "stumps_line_m",
  "stumps_height_m",
  "swing_deg",
  "seam_deg",
  "outcome",
  "runs",
] as const;

const OUTCOMES: Outcome[] = ["dot", "runs", "boundary", "beaten", "edge", "wicket"];

const aliases: Record<string, (typeof CSV_COLUMNS)[number]> = {
  speed: "speed_kmh",
  release_speed: "speed_kmh",
  release_height: "release_height_m",
  pitch_x: "pitch_line_m",
  pitch_line: "pitch_line_m",
  pitch_y: "pitch_length_m",
  pitch_length: "pitch_length_m",
  length: "pitch_length_m",
  stumps_x: "stumps_line_m",
  stumps_line: "stumps_line_m",
  stumps_y: "stumps_height_m",
  stumps_height: "stumps_height_m",
  swing: "swing_deg",
  seam: "seam_deg",
  deviation: "seam_deg",
  result: "outcome",
};

export type ParseResult = {
  deliveries: Delivery[];
  errors: string[];
};

function normaliseHeader(raw: string) {
  const key = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return aliases[key] ?? key;
}

export function parseDeliveriesCsv(text: string): ParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  if (lines.length < 2) {
    return { deliveries: [], errors: ["Filen indeholder ingen datarækker."] };
  }

  const delimiter = lines[0].includes(";") && !lines[0].includes(",") ? ";" : ",";
  const headers: string[] = lines[0].split(delimiter).map(normaliseHeader);
  const required = [
    "speed_kmh",
    "pitch_line_m",
    "pitch_length_m",
    "stumps_line_m",
    "stumps_height_m",
    "outcome",
  ];
  const missing = required.filter((column) => !headers.includes(column));
  if (missing.length > 0) {
    return {
      deliveries: [],
      errors: [`Mangler kolonner: ${missing.join(", ")}`],
    };
  }

  const deliveries: Delivery[] = [];
  const errors: string[] = [];

  lines.slice(1).forEach((line, index) => {
    const cells = line.split(delimiter).map((cell) => cell.trim());
    const row = Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""]));
    const num = (key: string) => {
      const value = row[key];
      if (value === undefined || value === "") return null;
      const parsed = Number(value.replace(",", "."));
      return Number.isFinite(parsed) ? parsed : null;
    };

    const outcome = row.outcome?.toLowerCase() as Outcome;
    const speed = num("speed_kmh");
    const pitchLine = num("pitch_line_m");
    const pitchLength = num("pitch_length_m");
    const stumpsLine = num("stumps_line_m");
    const stumpsHeight = num("stumps_height_m");

    if (
      speed === null ||
      pitchLine === null ||
      pitchLength === null ||
      stumpsLine === null ||
      stumpsHeight === null ||
      !OUTCOMES.includes(outcome)
    ) {
      if (errors.length < 5) errors.push(`Række ${index + 2} blev sprunget over.`);
      return;
    }

    const ball = num("ball") ?? deliveries.length + 1;
    deliveries.push({
      ball,
      over: num("over") ?? Math.floor((ball - 1) / 6) + 1,
      speedKmh: speed,
      releaseHeight: num("release_height_m"),
      pitchLine,
      pitchLength,
      stumpsLine,
      stumpsHeight,
      swingDeg: num("swing_deg") ?? 0,
      seamDeg: num("seam_deg") ?? 0,
      outcome,
      runs: num("runs") ?? (outcome === "boundary" ? 4 : 0),
    });
  });

  return { deliveries, errors };
}

export function deliveriesToCsv(deliveries: Delivery[]): string {
  const rows = deliveries.map((d) =>
    [
      d.ball,
      d.over,
      d.speedKmh.toFixed(1),
      d.releaseHeight?.toFixed(2) ?? "",
      d.pitchLine.toFixed(3),
      d.pitchLength.toFixed(2),
      d.stumpsLine.toFixed(3),
      d.stumpsHeight.toFixed(3),
      d.swingDeg.toFixed(2),
      d.seamDeg.toFixed(2),
      d.outcome,
      d.runs,
    ].join(","),
  );
  return [CSV_COLUMNS.join(","), ...rows].join("\n");
}

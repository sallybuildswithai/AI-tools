"use client";

import { useState } from "react";
import {
  CORRIDOR_OUTER,
  STUMP_HALF_WIDTH,
  STUMP_HEIGHT,
  fmt,
  lengthZones,
  lineZones,
  outcomeGroup,
} from "@/lib/cricket/analysis";
import type {
  Analysis,
  Correlation,
  Delivery,
  LengthZone,
  LineZone,
  OutcomeGroup,
  ZoneStat,
} from "@/lib/cricket/types";

export const outcomeGroups: { group: OutcomeGroup; label: string; color: string }[] = [
  { group: "dot", label: "Dot ball", color: "var(--viz-series-1)" },
  { group: "runs", label: "Runs", color: "var(--viz-series-2)" },
  { group: "threat", label: "Falsk slag / wicket", color: "var(--viz-series-3)" },
];

const colorOf = (d: Delivery) =>
  outcomeGroups.find((g) => g.group === outcomeGroup(d))!.color;

const outcomeLabels: Record<Delivery["outcome"], string> = {
  dot: "Dot",
  runs: "Runs",
  boundary: "Boundary",
  beaten: "Beaten",
  edge: "Edge",
  wicket: "Wicket",
};

export function OutcomeLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {outcomeGroups.map((g) => (
        <li key={g.group} className="flex items-center gap-1.5">
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ background: g.color }}
            aria-hidden
          />
          {g.label}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span
          className="inline-block size-3 rounded-full border-2"
          style={{ borderColor: "var(--viz-ink)", background: "var(--viz-series-3)" }}
          aria-hidden
        />
        Wicket (stor markør)
      </li>
    </ul>
  );
}

function DeliveryTooltip({ d, x, y }: { d: Delivery; x: string; y: string }) {
  return (
    <div
      className="pointer-events-none absolute z-10 w-48 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md"
      style={{ left: x, top: y }}
      role="status"
    >
      <p className="font-medium text-foreground">
        Over {d.over} · bold {d.ball} · {outcomeLabels[d.outcome]}
        {d.runs > 0 ? ` (${d.runs})` : ""}
      </p>
      <dl className="mt-1 grid grid-cols-2 gap-x-2 text-muted-foreground tabular-nums">
        <dt>Fart</dt>
        <dd className="text-right text-foreground">{fmt(d.speedKmh, 1)} km/t</dd>
        <dt>Længde</dt>
        <dd className="text-right text-foreground">{fmt(d.pitchLength, 1)} m</dd>
        <dt>Linje ved stumps</dt>
        <dd className="text-right text-foreground">{fmt(d.stumpsLine * 100, 0)} cm</dd>
        <dt>Sving / seam</dt>
        <dd className="text-right text-foreground">
          {fmt(d.swingDeg, 1)}° / {fmt(d.seamDeg, 1)}°
        </dd>
      </dl>
    </div>
  );
}

type ScatterProps = {
  deliveries: Delivery[];
  /** Svg-koordinater for en levering. */
  project: (d: Delivery) => { x: number; y: number };
  width: number;
  height: number;
  children: React.ReactNode;
  label: string;
};

function DeliveryScatter({ deliveries, project, width, height, children, label }: ScatterProps) {
  const [hovered, setHovered] = useState<Delivery | null>(null);
  const hoveredPoint = hovered ? project(hovered) : null;

  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: width }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={label}
        onMouseLeave={() => setHovered(null)}
      >
        {children}
        {/* Wickets tegnes sidst, så de ligger øverst. */}
        {[...deliveries]
          .sort((a, b) => Number(a.outcome === "wicket") - Number(b.outcome === "wicket"))
          .map((d) => {
            const { x, y } = project(d);
            const wicket = d.outcome === "wicket";
            const active = hovered === d;
            return (
              <g key={d.ball}>
                <circle
                  cx={x}
                  cy={y}
                  r={wicket ? 6.5 : 4.5}
                  fill={colorOf(d)}
                  fillOpacity={hovered && !active ? 0.35 : 0.9}
                  stroke={wicket ? "var(--viz-ink)" : "var(--viz-surface)"}
                  strokeWidth={wicket ? 2 : 1.5}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={10}
                  fill="transparent"
                  onMouseEnter={() => setHovered(d)}
                  onFocus={() => setHovered(d)}
                  onBlur={() => setHovered(null)}
                  tabIndex={-1}
                />
              </g>
            );
          })}
      </svg>
      {hovered && hoveredPoint && (
        <DeliveryTooltip
          d={hovered}
          x={`${(hoveredPoint.x / width) * 100}%`}
          y={`${(hoveredPoint.y / height) * 100}%`}
        />
      )}
    </div>
  );
}

const PITCH = { width: 280, height: 430, pxPerMX: 80, pxPerMY: 28, top: 22, maxLength: 14.5 };

export function PitchMap({ deliveries }: { deliveries: Delivery[] }) {
  const cx = PITCH.width / 2;
  const toY = (m: number) => PITCH.top + Math.min(m, PITCH.maxLength) * PITCH.pxPerMY;
  const toX = (line: number) => cx - line * PITCH.pxPerMX;
  const stripHalf = 1.52 * PITCH.pxPerMX;

  return (
    <DeliveryScatter
      deliveries={deliveries}
      width={PITCH.width}
      height={PITCH.height}
      label="Pitch map: hvor bolden lander set fra bowlerens ende"
      project={(d) => ({ x: toX(Math.max(-1.6, Math.min(1.6, d.pitchLine))), y: toY(d.pitchLength) })}
    >
      <rect
        x={cx - stripHalf}
        y={PITCH.top}
        width={stripHalf * 2}
        height={PITCH.maxLength * PITCH.pxPerMY}
        fill="var(--viz-pitch)"
        rx={4}
      />
      {lengthZones.map((z) => {
        const y1 = toY(z.from);
        const y2 = toY(Math.min(z.to, PITCH.maxLength));
        return (
          <g key={z.zone}>
            {z.zone === "good" && (
              <rect x={cx - stripHalf} y={y1} width={stripHalf * 2} height={y2 - y1} fill="var(--viz-zone-good)" />
            )}
            <line x1={cx - stripHalf} x2={cx + stripHalf} y1={y1} y2={y1} stroke="var(--viz-grid)" strokeWidth={1} />
            <text x={cx - stripHalf + 4} y={(y1 + y2) / 2 + 3} fontSize={9} fill="var(--viz-ink-2)">
              {z.label}
            </text>
          </g>
        );
      })}
      {/* Stumps og crease */}
      <line x1={cx - stripHalf} x2={cx + stripHalf} y1={toY(1.22)} y2={toY(1.22)} stroke="var(--viz-axis)" strokeWidth={1.5} />
      <rect
        x={toX(STUMP_HALF_WIDTH)}
        y={PITCH.top - 4}
        width={STUMP_HALF_WIDTH * 2 * PITCH.pxPerMX}
        height={6}
        rx={2}
        fill="var(--viz-ink-2)"
      />
      <text x={cx - stripHalf} y={12} fontSize={10} fill="var(--viz-muted)">
        ← Offside
      </text>
      <text x={cx + stripHalf} y={12} fontSize={10} fill="var(--viz-muted)" textAnchor="end">
        Legside →
      </text>
    </DeliveryScatter>
  );
}

const HIVE = { width: 320, height: 250, pxPerM: 150, floor: 230, maxHeight: 1.45 };

export function Beehive({ deliveries }: { deliveries: Delivery[] }) {
  const cx = HIVE.width / 2;
  const toX = (line: number) => cx - Math.max(-1.0, Math.min(1.0, line)) * HIVE.pxPerM;
  const toY = (h: number) => HIVE.floor - Math.min(h, HIVE.maxHeight) * HIVE.pxPerM;

  return (
    <DeliveryScatter
      deliveries={deliveries}
      width={HIVE.width}
      height={HIVE.height}
      label="Beehive: hvor bolden passerer stumps set fra bowlerens ende"
      project={(d) => ({ x: toX(d.stumpsLine), y: toY(d.stumpsHeight) })}
    >
      {/* Korridoren: fra off-stump og ud */}
      <rect
        x={toX(CORRIDOR_OUTER)}
        y={toY(HIVE.maxHeight)}
        width={(CORRIDOR_OUTER - STUMP_HALF_WIDTH) * HIVE.pxPerM}
        height={HIVE.maxHeight * HIVE.pxPerM}
        fill="var(--viz-zone-good)"
      />
      <text x={toX(CORRIDOR_OUTER) + 3} y={toY(HIVE.maxHeight) + 12} fontSize={9} fill="var(--viz-ink-2)">
        Korridor
      </text>
      {[0.5, 1.0].map((h) => (
        <g key={h}>
          <line x1={0} x2={HIVE.width} y1={toY(h)} y2={toY(h)} stroke="var(--viz-grid)" />
          <text x={HIVE.width - 2} y={toY(h) - 3} fontSize={9} textAnchor="end" fill="var(--viz-muted)">
            {fmt(h, 1)} m
          </text>
        </g>
      ))}
      <line x1={0} x2={HIVE.width} y1={HIVE.floor} y2={HIVE.floor} stroke="var(--viz-axis)" strokeWidth={1.5} />
      {[-1, 0, 1].map((i) => (
        <rect
          key={i}
          x={cx + i * 0.076 * HIVE.pxPerM - 2}
          y={toY(STUMP_HEIGHT)}
          width={4}
          height={STUMP_HEIGHT * HIVE.pxPerM}
          rx={1}
          fill="var(--viz-axis)"
        />
      ))}
      <text x={4} y={HIVE.floor + 14} fontSize={10} fill="var(--viz-muted)">
        ← Offside
      </text>
      <text x={HIVE.width - 4} y={HIVE.floor + 14} fontSize={10} fill="var(--viz-muted)" textAnchor="end">
        Legside →
      </text>
    </DeliveryScatter>
  );
}

export function SpeedByOverChart({
  data,
  benchmarkSpeed,
  benchmarkLabel,
}: {
  data: Analysis["speedByOver"];
  benchmarkSpeed: number;
  benchmarkLabel: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 960;
  const H = 260;
  const pad = { l: 40, r: 16, t: 16, b: 28 };
  if (data.length === 0) return null;

  const values = [...data.map((d) => d.avgSpeed), benchmarkSpeed];
  const min = Math.floor(Math.min(...values) - 2);
  const max = Math.ceil(Math.max(...values) + 2);
  const firstOver = data[0].over;
  const lastOver = data[data.length - 1].over;
  const toX = (over: number) =>
    pad.l + ((over - firstOver) / Math.max(1, lastOver - firstOver)) * (W - pad.l - pad.r);
  const toY = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
  const ticks = niceTicks(min, max, 4);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(d.over)},${toY(d.avgSpeed)}`).join(" ");
  const active = hover !== null ? data[hover] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Gennemsnitsfart pr. over"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          let best = 0;
          data.forEach((d, i) => {
            if (Math.abs(toX(d.over) - x) < Math.abs(toX(data[best].over) - x)) best = i;
          });
          setHover(best);
        }}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={toY(t)} y2={toY(t)} stroke="var(--viz-grid)" />
            <text x={pad.l - 6} y={toY(t) + 3} fontSize={10} textAnchor="end" fill="var(--viz-muted)" className="tabular-nums">
              {t}
            </text>
          </g>
        ))}
        {data.map((d) =>
          d.over % 2 === 1 || data.length <= 10 ? (
            <text key={d.over} x={toX(d.over)} y={H - 10} fontSize={10} textAnchor="middle" fill="var(--viz-muted)">
              {d.over}
            </text>
          ) : null,
        )}
        <line
          x1={pad.l}
          x2={W - pad.r}
          y1={toY(benchmarkSpeed)}
          y2={toY(benchmarkSpeed)}
          stroke="var(--viz-series-2)"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <text x={W - pad.r} y={toY(benchmarkSpeed) - 5} fontSize={10} textAnchor="end" fill="var(--viz-ink-2)">
          {benchmarkLabel}: {fmt(benchmarkSpeed, 0)} km/t
        </text>
        <path d={path} fill="none" stroke="var(--viz-series-1)" strokeWidth={2} strokeLinejoin="round" />
        {active && (
          <>
            <line x1={toX(active.over)} x2={toX(active.over)} y1={pad.t} y2={H - pad.b} stroke="var(--viz-axis)" />
            <circle cx={toX(active.over)} cy={toY(active.avgSpeed)} r={4.5} fill="var(--viz-series-1)" stroke="var(--viz-surface)" strokeWidth={2} />
          </>
        )}
      </svg>
      {active && (
        <div
          className="pointer-events-none absolute top-2 rounded-lg border border-border bg-popover px-3 py-1.5 text-xs shadow-md"
          style={{ left: `${(toX(active.over) / W) * 100}%`, transform: "translateX(-50%)" }}
        >
          <span className="font-medium">Over {active.over}</span>
          <span className="ml-2 tabular-nums text-muted-foreground">
            {fmt(active.avgSpeed, 1)} km/t · {active.balls} bolde
          </span>
        </div>
      )}
      <p className="mt-1 text-center text-xs text-muted-foreground">Over</p>
    </div>
  );
}

function niceTicks(min: number, max: number, count: number) {
  const step = Math.max(1, Math.ceil((max - min) / count));
  const ticks: number[] = [];
  for (let t = Math.ceil(min / step) * step; t <= max; t += step) ticks.push(t);
  return ticks;
}

export function ZoneTable<Z extends LengthZone | LineZone>({
  title,
  stats,
  benchmarkPct,
}: {
  title: string;
  stats: ZoneStat<Z>[];
  benchmarkPct?: Partial<Record<Z, number>>;
}) {
  const labels = Object.fromEntries(
    [...lengthZones, ...lineZones].map((z) => [z.zone, z.label]),
  ) as Record<string, string>;
  const maxPct = Math.max(...stats.map((s) => s.pct), ...Object.values(benchmarkPct ?? {}).map(Number), 1);

  return (
    <table className="w-full text-sm">
      <caption className="sr-only">{title}</caption>
      <thead>
        <tr className="border-b border-border text-left text-xs text-muted-foreground">
          <th className="py-2 font-medium">Zone</th>
          <th className="py-2 font-medium">Andel af bolde</th>
          <th className="py-2 text-right font-medium">Falske slag</th>
          <th className="py-2 text-right font-medium">Runs/over</th>
        </tr>
      </thead>
      <tbody>
        {stats.map((s) => {
          const bench = benchmarkPct?.[s.zone];
          return (
            <tr key={s.zone} className="border-b border-border/60 last:border-0">
              <td className="py-2 pr-2 whitespace-nowrap">{labels[s.zone]}</td>
              <td className="w-1/2 py-2 pr-3">
                <div className="flex items-center gap-2">
                  <div className="relative h-3 flex-1">
                    <div
                      className="h-full rounded-r"
                      style={{ width: `${(s.pct / maxPct) * 100}%`, background: "var(--viz-series-1)" }}
                    />
                    {bench !== undefined && (
                      <div
                        className="absolute -top-1 h-5 w-0.5"
                        style={{ left: `${(bench / maxPct) * 100}%`, background: "var(--viz-series-2)" }}
                        title={`Benchmark: ${fmt(bench, 0)} %`}
                      />
                    )}
                  </div>
                  <span className="w-10 text-right tabular-nums">{fmt(s.pct, 0)} %</span>
                </div>
              </td>
              <td className="py-2 text-right tabular-nums">
                {s.balls === 0 ? "–" : `${fmt(s.falseShotPct, 0)} %`}
              </td>
              <td className="py-2 text-right tabular-nums">
                {s.balls === 0 ? "–" : fmt(s.runsPerBall * 6, 1)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function rCell(r: number | null) {
  if (r === null) return <td className="py-2 text-right text-muted-foreground">–</td>;
  const color = r >= 0 ? "var(--viz-diverge-pos)" : "var(--viz-diverge-neg)";
  const strength = Math.min(1, Math.abs(r) / 0.5);
  return (
    <td className="py-1.5 pl-2 text-right">
      <span
        className="inline-block min-w-14 rounded px-2 py-0.5 tabular-nums"
        style={{
          background: `color-mix(in oklab, ${color} ${Math.round(strength * 35)}%, transparent)`,
        }}
      >
        {r > 0 ? "+" : ""}
        {fmt(r, 2)}
      </span>
    </td>
  );
}

export function CorrelationTable({ correlations }: { correlations: Correlation[] }) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Korrelationer mellem boldmålinger og udfald</caption>
      <thead>
        <tr className="border-b border-border text-left text-xs text-muted-foreground">
          <th className="py-2 font-medium">Måling</th>
          <th className="py-2 text-right font-medium">r mod falske slag</th>
          <th className="py-2 text-right font-medium">r mod runs</th>
        </tr>
      </thead>
      <tbody>
        {correlations.map((c) => (
          <tr key={c.feature} className="border-b border-border/60 last:border-0">
            <td className="py-2 pr-2">{c.label}</td>
            {rCell(c.vsFalseShot)}
            {rCell(c.vsRuns)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

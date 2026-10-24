"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Database,
  Download,
  Minus,
  Target,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  analyse,
  buildInsights,
  compareToBenchmark,
  fmt,
} from "@/lib/cricket/analysis";
import { benchmarks, metricConfig } from "@/lib/cricket/benchmarks";
import { deliveriesToCsv, parseDeliveriesCsv } from "@/lib/cricket/csv";
import { generateSampleDeliveries } from "@/lib/cricket/sample-data";
import type { BenchmarkGap, BowlerProfile, Delivery } from "@/lib/cricket/types";
import { AiReport } from "./ai-report";
import {
  Beehive,
  CorrelationTable,
  OutcomeLegend,
  PitchMap,
  SpeedByOverChart,
  ZoneTable,
} from "./charts";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

const styleOptions: { value: BowlerProfile["style"]; label: string }[] = [
  { value: "fast", label: "Fast" },
  { value: "fast-medium", label: "Fast-medium" },
  { value: "medium", label: "Medium" },
  { value: "swing", label: "Swing" },
];

const levelOptions: { value: BowlerProfile["level"]; label: string }[] = [
  { value: "club", label: "Klub" },
  { value: "academy", label: "Akademi / talent" },
  { value: "first-class", label: "First-class" },
  { value: "international", label: "International" },
];

function downloadFile(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function CricketCoachClient() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(() => generateSampleDeliveries());
  const [source, setSource] = useState("Demo-bowler (syntetiske data)");
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [benchmarkId, setBenchmarkId] = useState("first-class");
  const [profile, setProfile] = useState<BowlerProfile>({
    name: "Demo-bowler",
    style: "fast-medium",
    level: "academy",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const benchmark = benchmarks.find((b) => b.id === benchmarkId) ?? benchmarks[0];
  const analysis = useMemo(() => analyse(deliveries), [deliveries]);
  const gaps = useMemo(
    () => compareToBenchmark(analysis.metrics, benchmark),
    [analysis, benchmark],
  );
  const insights = useMemo(() => buildInsights(analysis), [analysis]);
  const focusAreas = [...gaps]
    .filter((g) => g.status === "behind")
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 3);
  const m = analysis.metrics;
  const hasData = deliveries.length >= 6;

  async function handleFile(file: File) {
    const result = parseDeliveriesCsv(await file.text());
    setParseErrors(result.errors);
    if (result.deliveries.length > 0) {
      setDeliveries(result.deliveries);
      setSource(`${file.name} · ${result.deliveries.length} bolde`);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xl">
            <Database className="size-5 text-primary" aria-hidden />
            Data og spillerprofil
          </CardTitle>
          <CardDescription>
            Upload bolddata fra jeres ball-tracking (CSV) eller udforsk med demo-data.
            Koordinater er set fra bowlerens ende mod en højrehåndet batsman.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="bowler-name">Bowler</Label>
              <Input
                id="bowler-name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bowler-style">Type</Label>
              <select
                id="bowler-style"
                className={selectClass}
                value={profile.style}
                onChange={(e) =>
                  setProfile({ ...profile, style: e.target.value as BowlerProfile["style"] })
                }
              >
                {styleOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bowler-level">Niveau</Label>
              <select
                id="bowler-level"
                className={selectClass}
                value={profile.level}
                onChange={(e) =>
                  setProfile({ ...profile, level: e.target.value as BowlerProfile["level"] })
                }
              >
                {levelOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="benchmark">Benchmark mod</Label>
              <select
                id="benchmark"
                className={selectClass}
                value={benchmarkId}
                onChange={(e) => setBenchmarkId(e.target.value)}
              >
                {benchmarks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              aria-label="Upload CSV med bolddata"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = "";
              }}
            />
            <Button onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" aria-hidden />
              Upload CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDeliveries(generateSampleDeliveries());
                setSource("Demo-bowler (syntetiske data)");
                setParseErrors([]);
              }}
            >
              Brug demo-data
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadFile("bolddata-skabelon.csv", deliveriesToCsv(deliveries.slice(0, 12)))}
            >
              <Download className="size-4" aria-hidden />
              CSV-skabelon
            </Button>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Indlæst: <span className="font-medium text-foreground">{source}</span>
            </p>
          </div>
          {parseErrors.length > 0 && (
            <ul className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {parseErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {!hasData ? (
        <p className="text-sm text-muted-foreground">Der skal mindst være 6 bolde for at lave en analyse.</p>
      ) : (
        <>
          <section aria-label="Nøgletal" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["Bolde", `${m.balls}`, `${fmt(m.overs, 1)} overs`],
              ["Gns. fart", `${fmt(m.avgSpeed, 1)}`, `top ${fmt(m.topSpeed, 1)} km/t`],
              ["Good length", `${fmt(m.goodLengthPct, 0)} %`, `spredning ${fmt(m.lengthSd, 2)} m`],
              ["Falske slag", `${fmt(m.falseShotPct, 0)} %`, `${m.wickets} wickets`],
              ["Economy", fmt(m.economy, 2), "runs pr. over"],
              ["Sving / seam", `${fmt(m.avgAbsSwing, 1)}° / ${fmt(m.avgAbsSeam, 1)}°`, "gns. absolut"],
            ].map(([label, value, sub]) => (
              <div key={label} className="rounded-xl border border-border/80 bg-card p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Pitch map</CardTitle>
                <CardDescription>Hvor bolden lander. Den grønne zone er good length (6-8 m).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <PitchMap deliveries={deliveries} />
                <OutcomeLegend />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Beehive</CardTitle>
                <CardDescription>
                  Hvor bolden passerer stumps. Den grønne zone er corridor of uncertainty.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Beehive deliveries={deliveries} />
                <OutcomeLegend />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                <Target className="size-5 text-primary" aria-hidden />
                Det skal {profile.name || "spilleren"} arbejde på
              </CardTitle>
              <CardDescription>
                De største forskelle til benchmark: {benchmark.label}. {benchmark.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[3fr_2fr]">
              <ol className="space-y-3">
                {focusAreas.length === 0 && (
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 text-[color:var(--viz-status-good)]" aria-hidden />
                    På niveau med eller bedre end benchmark på alle målte parametre. Prøv et højere benchmark.
                  </li>
                )}
                {focusAreas.map((gap, i) => (
                  <li key={gap.key} className="rounded-lg border border-border/70 bg-muted/30 p-4">
                    <p className="font-medium">
                      {i + 1}. {gap.label}:{" "}
                      <span className="tabular-nums">
                        {fmt(gap.player, metricConfig[gap.key].digits)} {gap.unit}
                      </span>{" "}
                      <span className="font-normal text-muted-foreground">
                        mod {fmt(gap.benchmark, metricConfig[gap.key].digits)} {gap.unit}
                      </span>
                    </p>
                    <p className="mt-1.5 text-sm text-muted-foreground">{metricConfig[gap.key].drill}</p>
                  </li>
                ))}
              </ol>
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Indsigter fra dataene</h3>
                {insights.map((insight) => (
                  <div key={insight.title} className="border-l-2 border-primary/40 pl-3">
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="text-sm text-muted-foreground">{insight.body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Benchmark: {benchmark.label}</CardTitle>
              <CardDescription>
                Referenceværdierne er indikative niveauer, ikke officielle Hawk-Eye-tal. Erstat dem med jeres
                egne datasæt i <code className="text-xs">src/lib/cricket/benchmarks.ts</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <BenchmarkTable gaps={gaps} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Fart pr. over</CardTitle>
              <CardDescription>
                Tendens: {m.speedTrendPerOver >= 0 ? "+" : ""}
                {fmt(m.speedTrendPerOver, 2)} km/t pr. over. Holder farten gennem spellet?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SpeedByOverChart
                data={analysis.speedByOver}
                benchmarkSpeed={benchmark.values.avgSpeed}
                benchmarkLabel={benchmark.label}
              />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Længdezoner</CardTitle>
                <CardDescription>Den orange markør viser benchmarkets andel af good length.</CardDescription>
              </CardHeader>
              <CardContent>
                <ZoneTable
                  title="Længdezoner"
                  stats={analysis.lengthZones}
                  benchmarkPct={{ good: benchmark.values.goodLengthPct }}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Linjezoner ved stumps</CardTitle>
                <CardDescription>Den orange markør viser benchmarkets andel i korridoren.</CardDescription>
              </CardHeader>
              <CardContent>
                <ZoneTable
                  title="Linjezoner"
                  stats={analysis.lineZones}
                  benchmarkPct={{ corridor: benchmark.values.corridorPct }}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Korrelationer</CardTitle>
              <CardDescription>
                Pearson r mellem hver måling og udfaldet af bolden. Blå er positiv sammenhæng, rød er negativ.
                Over ±0,2 er værd at kigge på, men det viser kun en sammenhæng, ikke en årsag.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <CorrelationTable correlations={analysis.correlations} />
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="font-heading text-xl">AI-coach</CardTitle>
              <CardDescription>
                Claude læser analysen og skriver en coachingrapport med prioriteter, øvelser og en taktisk plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AiReport deliveries={deliveries} benchmarkId={benchmarkId} profile={profile} />
            </CardContent>
          </Card>

          <details className="rounded-xl border border-border/80 bg-card p-4">
            <summary className="cursor-pointer text-sm font-medium">Vis rådata ({deliveries.length} bolde)</summary>
            <div className="mt-3 max-h-96 overflow-auto">
              <RawTable deliveries={deliveries} />
            </div>
          </details>
        </>
      )}
    </div>
  );
}

function BenchmarkTable({ gaps }: { gaps: BenchmarkGap[] }) {
  const status = {
    ahead: { label: "Foran", icon: ArrowUpRight, color: "var(--viz-status-good)" },
    "on-par": { label: "På niveau", icon: Minus, color: "var(--viz-ink-2)" },
    behind: { label: "Bagud", icon: ArrowDownRight, color: "var(--viz-status-critical)" },
  } as const;

  return (
    <table className="w-full min-w-[480px] text-sm">
      <thead>
        <tr className="border-b border-border text-left text-xs text-muted-foreground">
          <th className="py-2 font-medium">Parameter</th>
          <th className="py-2 text-right font-medium">Spiller</th>
          <th className="py-2 text-right font-medium">Benchmark</th>
          <th className="py-2 pl-4 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {gaps.map((gap) => {
          const s = status[gap.status];
          const digits = metricConfig[gap.key].digits;
          return (
            <tr key={gap.key} className="border-b border-border/60 last:border-0">
              <td className="py-2">{gap.label}</td>
              <td className="py-2 text-right tabular-nums">
                {fmt(gap.player, digits)} <span className="text-muted-foreground">{gap.unit}</span>
              </td>
              <td className="py-2 text-right tabular-nums">
                {fmt(gap.benchmark, digits)} <span className="text-muted-foreground">{gap.unit}</span>
              </td>
              <td className="py-2 pl-4">
                <span className="inline-flex items-center gap-1 font-medium" style={{ color: s.color }}>
                  <s.icon className="size-4" aria-hidden />
                  {s.label}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function RawTable({ deliveries }: { deliveries: Delivery[] }) {
  return (
    <table className="w-full text-xs tabular-nums">
      <thead className="sticky top-0 bg-card">
        <tr className="border-b border-border text-left text-muted-foreground">
          {["Over", "Bold", "Fart", "Længde", "Linje (pitch)", "Linje (stumps)", "Højde", "Sving", "Seam", "Udfald", "Runs"].map(
            (h) => (
              <th key={h} className="px-1.5 py-1.5 font-medium">
                {h}
              </th>
            ),
          )}
        </tr>
      </thead>
      <tbody>
        {deliveries.map((d) => (
          <tr key={d.ball} className="border-b border-border/50">
            <td className="px-1.5 py-1">{d.over}</td>
            <td className="px-1.5 py-1">{d.ball}</td>
            <td className="px-1.5 py-1">{fmt(d.speedKmh, 1)}</td>
            <td className="px-1.5 py-1">{fmt(d.pitchLength, 2)}</td>
            <td className="px-1.5 py-1">{fmt(d.pitchLine, 2)}</td>
            <td className="px-1.5 py-1">{fmt(d.stumpsLine, 2)}</td>
            <td className="px-1.5 py-1">{fmt(d.stumpsHeight, 2)}</td>
            <td className="px-1.5 py-1">{fmt(d.swingDeg, 2)}</td>
            <td className="px-1.5 py-1">{fmt(d.seamDeg, 2)}</td>
            <td className="px-1.5 py-1">{d.outcome}</td>
            <td className="px-1.5 py-1">{d.runs}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

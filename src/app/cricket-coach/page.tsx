import type { Metadata } from "next";
import { CricketCoachClient } from "@/components/cricket/coach-client";

export const metadata: Metadata = {
  title: "AI Cricket Coach",
  description:
    "Analysér bowlerens ball-tracking-data – fart, pitch map, beehive, sving og seam – benchmark mod professionelle profiler og få en AI-coachingplan.",
};

export default function CricketCoachPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-medium text-primary">Bowling-analyse</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          AI Cricket Coach
        </h1>
        <p className="mt-3 text-muted-foreground">
          Upload bolddata som dem Hawk-Eye måler i kampe: fart, pitch map, beehive, sving og seam.
          Coachen finder sammenhænge mellem målingerne og udfaldet af hver bold, sammenligner med
          professionelle referenceprofiler og fortæller, hvad bowleren skal arbejde på.
        </p>
      </header>
      <CricketCoachClient />
    </div>
  );
}

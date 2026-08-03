import { Suspense } from "react";
import type { Metadata } from "next";
import { ComparisonClient } from "@/components/comparison-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sammenlign",
  description:
    "Sammenlign op til tre AI-værktøjer på capabilities, pris, governance og enterprise-funktioner.",
};

function ComparisonFallback() {
  return (
    <div className="space-y-4" aria-hidden>
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function ComparisonPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Sammenlign værktøjer
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Vælg op til tre værktøjer og få et overblik over capabilities, pris,
          governance-status, dataklassifikation, SSO og enterprise-tilgængelighed.
          Dit valg lægger sig i adressen, så sammenligningen kan deles.
        </p>
      </div>
      {/* ComparisonClient læser valget fra URL'en og skal derfor ligge i en Suspense-grænse. */}
      <Suspense fallback={<ComparisonFallback />}>
        <ComparisonClient />
      </Suspense>
    </div>
  );
}

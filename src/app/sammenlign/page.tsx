import type { Metadata } from "next";
import { ComparisonClient } from "@/components/comparison-client";

export const metadata: Metadata = {
  title: "Sammenlign",
  description:
    "Sammenlign op til tre AI-værktøjer på capabilities, pris, governance og enterprise-funktioner.",
};

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
        </p>
      </div>
      <ComparisonClient />
    </div>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { LibraryClient } from "@/components/library-client";
import { ToolGridSkeleton } from "@/components/tool-card-skeleton";
import { GovernanceNotice } from "@/components/governance-notice";

export const metadata: Metadata = {
  title: "Bibliotek",
  description:
    "Søg og filtrér AI-værktøjer efter kategori, use case, pris, godkendelse og dataklasse.",
};

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Værktøjsbibliotek
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Søg frit eller filtrér efter kategori, use case, prismodel,
          godkendelsesstatus og dataklassifikation.
        </p>
      </div>

      <div className="mb-8">
        <GovernanceNotice />
      </div>

      <Suspense fallback={<ToolGridSkeleton count={6} />}>
        <LibraryClient />
      </Suspense>
    </div>
  );
}

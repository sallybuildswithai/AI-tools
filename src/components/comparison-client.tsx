"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Link2 } from "lucide-react";
import { getToolsBySlugs, tools } from "@/lib/mock-data";
import { ToolComparisonTable } from "@/components/tool-comparison-table";
import { EmptyState } from "@/components/empty-state";
import { GovernanceNotice } from "@/components/governance-notice";
import {
  buildCompareHref,
  COMPARE_PARAM,
  MAX_COMPARE_TOOLS,
  parseCompareSlugs,
  useCompare,
} from "@/components/compare-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { DataClassificationBadge } from "@/components/data-classification-badge";

/** Vises ved allerførste besøg, hvor brugeren hverken har et link eller et gemt valg. */
const defaultCompareSlugs = ["chatgpt", "claude", "microsoft-copilot"];

export function ComparisonClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selected, hydrated, hasStoredSelection, setSelection } = useCompare();

  const urlSlugs = searchParams.get(COMPARE_PARAM);
  const [initialized, setInitialized] = useState(false);
  const [copied, setCopied] = useState(false);

  // Et delt link vinder over det gemte valg; standardtrioen kun ved allerførste besøg.
  useEffect(() => {
    if (!hydrated || initialized) return;
    setInitialized(true);

    if (urlSlugs !== null) {
      const fromLink = parseCompareSlugs(urlSlugs);
      // Et link, hvor intet slug kan genkendes, må ikke rydde brugerens eget valg.
      if (fromLink.length > 0 || !urlSlugs) {
        setSelection(fromLink);
      }
      return;
    }

    const initial = hasStoredSelection ? selected : defaultCompareSlugs;
    setSelection(initial);
    // Læg valget i adressen, så den kan deles med det samme.
    router.replace(buildCompareHref(initial), { scroll: false });
  }, [
    hydrated,
    initialized,
    urlSlugs,
    hasStoredSelection,
    selected,
    setSelection,
    router,
  ]);

  // Frem/tilbage og indsatte links: overtag adressen, når den ikke matcher valget.
  // Valget er kilden til sandhed, så vi skriver aldrig adressen tilbage herfra.
  useEffect(() => {
    if (!initialized || urlSlugs === null) return;
    const fromUrl = parseCompareSlugs(urlSlugs);
    if (fromUrl.join(",") === selected.join(",")) return;

    if (fromUrl.length === 0 && urlSlugs) {
      // Ukendte slugs: ryd adressen op i stedet for at nulstille valget.
      router.replace(buildCompareHref(selected), { scroll: false });
      return;
    }
    setSelection(fromUrl);
  }, [initialized, urlSlugs, selected, setSelection, router]);

  // Valget skrives til adressen her – ikke fra en effekt – så et tryk på tilbage
  // ikke bliver overskrevet, og hvert skift bliver et trin i historikken.
  function applySelection(next: string[]) {
    setSelection(next);
    router.push(
      // Et tomt valg får en tom parameter, så "ryddet" kan skelnes fra "ny besøgende".
      next.length > 0 ? buildCompareHref(next) : `/sammenlign?${COMPARE_PARAM}=`,
      { scroll: false },
    );
  }

  function toggleTool(slug: string) {
    if (selected.includes(slug)) {
      applySelection(selected.filter((item) => item !== slug));
      return;
    }
    if (selected.length >= MAX_COMPARE_TOOLS) return;
    applySelection([...selected, slug]);
  }

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  // getToolsBySlugs bevarer brugerens rækkefølge i tabellen.
  const selectedTools = useMemo(() => getToolsBySlugs(selected), [selected]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // Udklipsholderen kan være blokeret – brugeren kan stadig kopiere fra adressefeltet.
    }
  }

  return (
    <div className="space-y-8">
      <GovernanceNotice />

      <section className="space-y-4" aria-labelledby="select-tools-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="select-tools-heading"
              className="font-heading text-xl font-semibold tracking-tight"
            >
              Vælg op til tre værktøjer
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sammenlign capabilities, pris, governance-status, dataklasse, SSO
              og enterprise.
            </p>
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {selected.length} / {MAX_COMPARE_TOOLS} valgt
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const checked = selected.includes(tool.slug);
            const disabled = !checked && selected.length >= MAX_COMPARE_TOOLS;
            const id = `compare-${tool.slug}`;

            return (
              <label
                key={tool.id}
                htmlFor={id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-card p-4 transition-colors hover:bg-accent/40 focus-within:ring-2 focus-within:ring-ring ${
                  checked ? "border-foreground/25 bg-accent/30" : ""
                } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <Checkbox
                  id={id}
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() => toggleTool(tool.slug)}
                  className="mt-0.5"
                />
                <span className="min-w-0 flex-1 space-y-2">
                  <span className="block">
                    <Label
                      htmlFor={id}
                      className="cursor-pointer text-sm font-semibold"
                    >
                      {tool.name}
                    </Label>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {tool.vendor}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    <StatusBadge status={tool.approvalStatus} />
                    <DataClassificationBadge
                      classification={tool.dataClassification}
                      showLabel={false}
                    />
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applySelection([])}
            disabled={selected.length === 0}
          >
            Ryd valg
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyLink}
            disabled={selected.length === 0}
          >
            {copied ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <Link2 className="size-3.5" aria-hidden />
            )}
            {copied ? "Link kopieret" : "Kopiér link til sammenligning"}
          </Button>
        </div>
      </section>

      <section aria-labelledby="comparison-table-heading" className="space-y-4">
        <h2
          id="comparison-table-heading"
          className="font-heading text-xl font-semibold tracking-tight"
        >
          Sammenligningstabel
        </h2>
        {selectedTools.length === 0 ? (
          <EmptyState
            title="Ingen værktøjer valgt"
            description="Vælg op til tre værktøjer ovenfor – eller tilføj dem med “Sammenlign” ude i biblioteket."
          />
        ) : (
          <ToolComparisonTable tools={selectedTools} />
        )}
      </section>
    </div>
  );
}

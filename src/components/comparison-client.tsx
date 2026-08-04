"use client";

import { useMemo, useState } from "react";
import { tools } from "@/lib/mock-data";
import { ToolComparisonTable } from "@/components/tool-comparison-table";
import { EmptyState } from "@/components/empty-state";
import { GovernanceNotice } from "@/components/governance-notice";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { DataClassificationBadge } from "@/components/data-classification-badge";

const MAX_SELECTION = 3;

export function ComparisonClient() {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([
    "chatgpt",
    "claude",
    "microsoft-copilot",
  ]);

  const selectedTools = useMemo(
    () => tools.filter((tool) => selectedSlugs.includes(tool.slug)),
    [selectedSlugs],
  );

  function toggleTool(slug: string) {
    setSelectedSlugs((current) => {
      if (current.includes(slug)) {
        return current.filter((item) => item !== slug);
      }
      if (current.length >= MAX_SELECTION) {
        return current;
      }
      return [...current, slug];
    });
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
              Sammenlign funktioner, pris, governance-status, dataklasse, SSO
              og enterprise.
            </p>
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {selectedSlugs.length} / {MAX_SELECTION} valgt
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const checked = selectedSlugs.includes(tool.slug);
            const disabled = !checked && selectedSlugs.length >= MAX_SELECTION;
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

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSelectedSlugs([])}
          disabled={selectedSlugs.length === 0}
        >
          Ryd valg
        </Button>
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
            description="Vælg op til tre værktøjer ovenfor for at se en side-om-side sammenligning."
          />
        ) : (
          <ToolComparisonTable tools={selectedTools} />
        )}
      </section>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { tools } from "@/lib/mock-data";
import type { ToolFilters, UseCase } from "@/lib/types";
import { createDefaultFilters, filterAndSortTools } from "@/lib/tool-utils";
import { SearchBar } from "@/components/search-bar";
import { FilterPanel } from "@/components/filter-panel";
import { ToolCard } from "@/components/tool-card";
import { ToolGridSkeleton } from "@/components/tool-card-skeleton";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface LibraryClientProps {
  initialQuery?: string;
  initialUseCase?: UseCase;
}

export function LibraryClient({
  initialQuery = "",
  initialUseCase,
}: LibraryClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<ToolFilters>(() =>
    createDefaultFilters({
      query: initialQuery,
      useCases: initialUseCase ? [initialUseCase] : [],
    }),
  );
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSkeleton(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const results = useMemo(
    () => filterAndSortTools(tools, filters),
    [filters],
  );

  function updateFilters(next: ToolFilters) {
    startTransition(() => {
      setFilters(next);
    });
  }

  function resetFilters() {
    updateFilters(createDefaultFilters());
    router.replace("/bibliotek");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={filters.query}
          onChange={(query) => updateFilters({ ...filters, query })}
          placeholder="Søg på navn, leverandør, tags…"
          aria-label="Søg i værktøjsbiblioteket"
          className="flex-1"
        />
        <Sheet>
          <SheetTrigger
            render={<Button variant="outline" className="lg:hidden" />}
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filtre
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[min(100%,22rem)] overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>Filtre</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterPanel
                filters={filters}
                onChange={updateFilters}
                onReset={resetFilters}
                className="border-0 p-0 shadow-none"
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6 lg:grid-cols-[16.5rem_1fr]">
        <FilterPanel
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          className="hidden h-fit lg:block"
        />

        <div className="min-w-0 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {isPending ? "Opdaterer…" : `${results.length} værktøjer`}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="lg:hidden"
            >
              Nulstil filtre
            </Button>
          </div>

          {showSkeleton ? (
            <ToolGridSkeleton count={6} />
          ) : results.length === 0 ? (
            <EmptyState
              title="Ingen værktøjer matcher"
              description="Prøv at justere søgningen eller nulstille filtrene for at se hele biblioteket."
              actionLabel="Nulstil filtre"
              onAction={resetFilters}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

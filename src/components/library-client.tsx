"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { tools } from "@/lib/mock-data";
import type { ToolFilters } from "@/lib/types";
import {
  countActiveFilters,
  createDefaultFilters,
  filterAndSortTools,
  filtersToQueryString,
  parseFiltersFromParams,
} from "@/lib/tool-utils";
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

/** Fritekst skrives til URL'en efter en kort pause, så adressefeltet ikke opdateres pr. tastetryk. */
const queryDebounceMs = 300;

export function LibraryClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // URL'en er kilden til sandhed: filtrene kan deles, bogmærkes og navigeres med frem/tilbage.
  const filters = useMemo(
    () => parseFiltersFromParams(searchParams),
    [searchParams],
  );

  const [queryInput, setQueryInput] = useState(filters.query);
  const [showSkeleton, setShowSkeleton] = useState(true);
  // Husker den fritekst vi selv har skrevet til URL'en, så svaret ikke overskriver nyere tastetryk.
  const pendingQueryRef = useRef<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSkeleton(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  const navigate = useCallback(
    (next: ToolFilters, mode: "push" | "replace") => {
      const url = `${pathname}${filtersToQueryString(next)}`;
      startTransition(() => {
        if (mode === "replace") {
          router.replace(url, { scroll: false });
        } else {
          router.push(url, { scroll: false });
        }
      });
    },
    [pathname, router],
  );

  // Skriv fritekst til URL'en, når brugeren holder pause. Vent på en igangværende
  // navigation, så en ventende debounce ikke skriver forældede filtre tilbage.
  useEffect(() => {
    if (isPending || queryInput === filters.query) return;
    const timer = window.setTimeout(() => {
      pendingQueryRef.current = queryInput;
      navigate({ ...filters, query: queryInput }, "replace");
    }, queryDebounceMs);
    return () => window.clearTimeout(timer);
  }, [isPending, queryInput, filters, navigate]);

  // Følg med, når URL'en ændrer sig udefra (frem/tilbage, delt link).
  useEffect(() => {
    if (pendingQueryRef.current === filters.query) {
      pendingQueryRef.current = null;
      return;
    }
    pendingQueryRef.current = null;
    setQueryInput(filters.query);
  }, [filters.query]);

  // Resultaterne følger det, der står i feltet nu – URL'en må gerne halte 300 ms bagefter.
  const effectiveFilters = useMemo<ToolFilters>(
    () => ({ ...filters, query: queryInput }),
    [filters, queryInput],
  );

  const results = useMemo(
    () => filterAndSortTools(tools, effectiveFilters),
    [effectiveFilters],
  );

  const activeFilterCount = countActiveFilters(effectiveFilters);

  function updateFilters(next: ToolFilters) {
    // Brug det, der står i søgefeltet lige nu – en ventende debounce må ikke tabes.
    navigate({ ...next, query: queryInput }, "push");
  }

  function resetFilters() {
    pendingQueryRef.current = null;
    setQueryInput("");
    navigate(createDefaultFilters(), "push");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={queryInput}
          onChange={setQueryInput}
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
            {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
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

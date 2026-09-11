"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { tools } from "@/lib/mock-data";

export const MAX_COMPARE_TOOLS = 3;

/** Query-parameter der gør en sammenligning delbar via link. */
export const COMPARE_PARAM = "vaerktoej";

const storageKey = "vaerktojsbiblioteket.sammenlign";

const knownSlugs = new Set(tools.map((tool) => tool.slug));

/** Fjerner ukendte og duplikerede slugs og skærer ned til det tilladte antal. */
export function sanitizeCompareSlugs(slugs: readonly string[]): string[] {
  const result: string[] = [];
  for (const slug of slugs) {
    const value = typeof slug === "string" ? slug.trim() : "";
    if (!value || result.includes(value) || !knownSlugs.has(value)) continue;
    result.push(value);
    if (result.length === MAX_COMPARE_TOOLS) break;
  }
  return result;
}

export function parseCompareSlugs(raw: string | null): string[] {
  if (!raw) return [];
  return sanitizeCompareSlugs(raw.split(","));
}

export function buildCompareHref(slugs: readonly string[]): string {
  const valid = sanitizeCompareSlugs(slugs);
  // Slugs indeholder kun [a-z0-9-], så de kan sættes direkte i URL'en.
  return valid.length > 0
    ? `/sammenlign?${COMPARE_PARAM}=${valid.join(",")}`
    : "/sammenlign";
}

interface CompareContextValue {
  selected: string[];
  /** False indtil localStorage er læst – brug den til at undgå hydration-mismatch. */
  hydrated: boolean;
  /** True kun hvis brugeren har et reelt (ikke-tomt) valg fra et tidligere besøg. */
  hasStoredSelection: boolean;
  isSelected: (slug: string) => boolean;
  isFull: boolean;
  toggle: (slug: string) => void;
  setSelection: (slugs: readonly string[]) => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [hasStoredSelection, setHasStoredSelection] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const storedSelection = sanitizeCompareSlugs(
            parsed.filter((item): item is string => typeof item === "string"),
          );
          setSelected(storedSelection);
          // Kun et reelt valg tæller. Det tomme array, som persist-effekten
          // skriver ved hvert besøg, må ikke forveksles med et bevidst fravalg.
          setHasStoredSelection(storedSelection.length > 0);
        }
      }
    } catch {
      // Utilgængelig eller ugyldig storage må ikke vælte siden – vi starter blot tomt.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(selected));
    } catch {
      // Storage kan være slået fra; valget lever så kun i denne fane.
    }
  }, [hydrated, selected]);

  const toggle = useCallback((slug: string) => {
    setSelected((current) => {
      if (current.includes(slug)) {
        return current.filter((item) => item !== slug);
      }
      if (current.length >= MAX_COMPARE_TOOLS || !knownSlugs.has(slug)) {
        return current;
      }
      return [...current, slug];
    });
  }, []);

  const setSelection = useCallback((slugs: readonly string[]) => {
    setSelected(sanitizeCompareSlugs(slugs));
  }, []);

  const value = useMemo<CompareContextValue>(
    () => ({
      selected,
      hydrated,
      hasStoredSelection,
      isSelected: (slug: string) => selected.includes(slug),
      isFull: selected.length >= MAX_COMPARE_TOOLS,
      toggle,
      setSelection,
    }),
    [selected, hydrated, hasStoredSelection, toggle, setSelection],
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare(): CompareContextValue {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare skal bruges inde i en CompareProvider");
  }
  return context;
}

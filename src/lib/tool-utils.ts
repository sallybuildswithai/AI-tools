import type { AITool, ToolFilters } from "./types";
import {
  approvalStatusLabels,
  categoryLabels,
  dataClassificationLabels,
  pricingModelLabels,
  useCaseLabels,
} from "./labels";

/**
 * Query-parameter navne for filtrene. Bruges både når URL'en skrives og læses,
 * så et filtreret bibliotek kan deles og bogmærkes.
 */
const filterParamNames = {
  categories: "kategori",
  useCases: "useCase",
  pricingModels: "pris",
  approvalStatuses: "status",
  dataClassifications: "data",
} as const;

const defaultSort = "name-asc";

const sortValues = [
  "name-asc",
  "name-desc",
  "lastReviewDate-asc",
  "lastReviewDate-desc",
] as const;

/** Minimal aftale, så både URLSearchParams og Next.js' ReadonlyURLSearchParams kan bruges. */
export interface ReadableSearchParams {
  get(name: string): string | null;
}

function parseListParam<T extends string>(
  raw: string | null,
  labels: Record<T, string>,
): T[] {
  if (!raw) return [];

  const values: T[] = [];
  for (const part of raw.split(",")) {
    const value = part.trim();
    if (!value || values.includes(value as T)) continue;
    if (!Object.prototype.hasOwnProperty.call(labels, value)) continue;
    values.push(value as T);
  }
  return values;
}

export function parseFiltersFromParams(
  params: ReadableSearchParams,
): ToolFilters {
  const rawSort = params.get("sort") ?? "";
  const sort = (sortValues as readonly string[]).includes(rawSort)
    ? rawSort
    : defaultSort;
  const [sortBy, sortOrder] = sort.split("-") as [
    ToolFilters["sortBy"],
    ToolFilters["sortOrder"],
  ];

  return {
    query: params.get("q") ?? "",
    categories: parseListParam(
      params.get(filterParamNames.categories),
      categoryLabels,
    ),
    useCases: parseListParam(
      params.get(filterParamNames.useCases),
      useCaseLabels,
    ),
    pricingModels: parseListParam(
      params.get(filterParamNames.pricingModels),
      pricingModelLabels,
    ),
    approvalStatuses: parseListParam(
      params.get(filterParamNames.approvalStatuses),
      approvalStatusLabels,
    ),
    dataClassifications: parseListParam(
      params.get(filterParamNames.dataClassifications),
      dataClassificationLabels,
    ),
    sortBy,
    sortOrder,
  };
}

export function filtersToSearchParams(filters: ToolFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set("q", filters.query);
  }

  for (const [key, name] of Object.entries(filterParamNames)) {
    const values = filters[key as keyof typeof filterParamNames];
    if (values.length > 0) {
      params.set(name, values.join(","));
    }
  }

  const sort = `${filters.sortBy}-${filters.sortOrder}`;
  if (sort !== defaultSort) {
    params.set("sort", sort);
  }

  return params;
}

/** Returnerer "" eller "?…", så den kan sættes direkte efter en sti. */
export function filtersToQueryString(filters: ToolFilters): string {
  const query = filtersToSearchParams(filters).toString();
  return query ? `?${query}` : "";
}

export function countActiveFilters(filters: ToolFilters): number {
  return (
    filters.categories.length +
    filters.useCases.length +
    filters.pricingModels.length +
    filters.approvalStatuses.length +
    filters.dataClassifications.length +
    (filters.query ? 1 : 0)
  );
}

export function createDefaultFilters(
  overrides: Partial<ToolFilters> = {},
): ToolFilters {
  return {
    query: "",
    categories: [],
    useCases: [],
    pricingModels: [],
    approvalStatuses: [],
    dataClassifications: [],
    sortBy: "name",
    sortOrder: "asc",
    ...overrides,
  };
}

export function filterAndSortTools(
  tools: AITool[],
  filters: ToolFilters,
): AITool[] {
  const query = filters.query.trim().toLowerCase();

  const filtered = tools.filter((tool) => {
    const matchesQuery =
      !query ||
      tool.name.toLowerCase().includes(query) ||
      tool.vendor.toLowerCase().includes(query) ||
      tool.shortDescription.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      tool.categories.some((category) => category.toLowerCase().includes(query));

    const matchesCategory =
      filters.categories.length === 0 ||
      filters.categories.some((category) => tool.categories.includes(category));

    const matchesUseCase =
      filters.useCases.length === 0 ||
      filters.useCases.some((useCase) => tool.useCases.includes(useCase));

    const matchesPricing =
      filters.pricingModels.length === 0 ||
      filters.pricingModels.includes(tool.pricingModel);

    const matchesApproval =
      filters.approvalStatuses.length === 0 ||
      filters.approvalStatuses.includes(tool.approvalStatus);

    const matchesClassification =
      filters.dataClassifications.length === 0 ||
      filters.dataClassifications.includes(tool.dataClassification);

    return (
      matchesQuery &&
      matchesCategory &&
      matchesUseCase &&
      matchesPricing &&
      matchesApproval &&
      matchesClassification
    );
  });

  return [...filtered].sort((a, b) => {
    if (filters.sortBy === "lastReviewDate") {
      const aTime = new Date(a.lastReviewDate).getTime();
      const bTime = new Date(b.lastReviewDate).getTime();
      return filters.sortOrder === "asc" ? aTime - bTime : bTime - aTime;
    }

    const comparison = a.name.localeCompare(b.name, "da");
    return filters.sortOrder === "asc" ? comparison : -comparison;
  });
}

export function formatDanishDate(isoDate: string): string {
  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function formatAvailability(value: boolean | "unknown"): string {
  if (value === true) return "Ja";
  if (value === false) return "Nej";
  return "Ikke verificeret";
}

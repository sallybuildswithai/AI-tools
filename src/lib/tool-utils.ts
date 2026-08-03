import type { AITool, ToolFilters } from "./types";

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

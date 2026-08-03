"use client";

import { RotateCcw } from "lucide-react";
import type {
  ApprovalStatus,
  Category,
  DataClassification,
  PricingModel,
  ToolFilters,
  UseCase,
} from "@/lib/types";
import {
  approvalStatusLabels,
  categoryLabels,
  dataClassificationLabels,
  pricingModelLabels,
  useCaseLabels,
} from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  filters: ToolFilters;
  onChange: (filters: ToolFilters) => void;
  onReset: () => void;
  className?: string;
}

function FilterGroup<T extends string>({
  title,
  options,
  labels,
  selected,
  onToggle,
}: {
  title: string;
  options: T[];
  labels: Record<T, string>;
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-foreground">{title}</legend>
      <div className="space-y-2.5">
        {options.map((option) => {
          const id = `${title}-${option}`;
          const checked = selected.includes(option);
          return (
            <div key={option} className="flex items-center gap-2.5">
              <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={() => onToggle(option)}
              />
              <Label htmlFor={id} className="cursor-pointer font-normal">
                {labels[option]}
              </Label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

export function FilterPanel({
  filters,
  onChange,
  onReset,
  className,
}: FilterPanelProps) {
  function toggleValue<T extends string>(
    key:
      | "categories"
      | "useCases"
      | "pricingModels"
      | "approvalStatuses"
      | "dataClassifications",
    value: T,
  ) {
    const current = filters[key] as T[];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  }

  return (
    <aside
      className={cn(
        "rounded-xl border border-border/80 bg-card p-5",
        className,
      )}
      aria-label="Filtre"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-semibold tracking-tight">
          Filtre
        </h2>
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="size-3.5" aria-hidden />
          Nulstil
        </Button>
      </div>

      <div className="mb-5 space-y-2">
        <Label htmlFor="sort-by">Sortering</Label>
        <Select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onValueChange={(value) => {
            if (!value) return;
            const [sortBy, sortOrder] = value.split("-") as [
              ToolFilters["sortBy"],
              ToolFilters["sortOrder"],
            ];
            onChange({ ...filters, sortBy, sortOrder });
          }}
        >
          <SelectTrigger id="sort-by" className="w-full">
            <SelectValue placeholder="Vælg sortering" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Navn (A–Å)</SelectItem>
            <SelectItem value="name-desc">Navn (Å–A)</SelectItem>
            <SelectItem value="lastReviewDate-desc">Seneste review</SelectItem>
            <SelectItem value="lastReviewDate-asc">Ældste review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="mb-5" />

      <div className="space-y-6">
        <FilterGroup
          title="Kategori"
          options={Object.keys(categoryLabels) as Category[]}
          labels={categoryLabels}
          selected={filters.categories}
          onToggle={(value) => toggleValue("categories", value)}
        />
        <FilterGroup
          title="Use case"
          options={Object.keys(useCaseLabels) as UseCase[]}
          labels={useCaseLabels}
          selected={filters.useCases}
          onToggle={(value) => toggleValue("useCases", value)}
        />
        <FilterGroup
          title="Prismodel"
          options={Object.keys(pricingModelLabels) as PricingModel[]}
          labels={pricingModelLabels}
          selected={filters.pricingModels}
          onToggle={(value) => toggleValue("pricingModels", value)}
        />
        <FilterGroup
          title="Godkendelsesstatus"
          options={Object.keys(approvalStatusLabels) as ApprovalStatus[]}
          labels={approvalStatusLabels}
          selected={filters.approvalStatuses}
          onToggle={(value) => toggleValue("approvalStatuses", value)}
        />
        <FilterGroup
          title="Dataklassifikation"
          options={Object.keys(dataClassificationLabels) as DataClassification[]}
          labels={dataClassificationLabels}
          selected={filters.dataClassifications}
          onToggle={(value) => toggleValue("dataClassifications", value)}
        />
      </div>
    </aside>
  );
}

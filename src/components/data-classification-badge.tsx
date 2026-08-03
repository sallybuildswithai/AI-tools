import { Badge } from "@/components/ui/badge";
import type { DataClassification } from "@/lib/types";
import { dataClassificationLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";

const classificationStyles: Record<DataClassification, string> = {
  green:
    "border-emerald-300/80 bg-emerald-100/70 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100",
  yellow:
    "border-amber-300/80 bg-amber-100/70 text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100",
  red: "border-red-300/80 bg-red-100/70 text-red-950 dark:border-red-700 dark:bg-red-950 dark:text-red-100",
};

const classificationDot: Record<DataClassification, string> = {
  green: "bg-emerald-600",
  yellow: "bg-amber-500",
  red: "bg-red-600",
};

interface DataClassificationBadgeProps {
  classification: DataClassification;
  className?: string;
  showLabel?: boolean;
}

export function DataClassificationBadge({
  classification,
  className,
  showLabel = true,
}: DataClassificationBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-md px-2 py-0.5 font-medium",
        classificationStyles[classification],
        className,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", classificationDot[classification])}
        aria-hidden
      />
      {showLabel ? (
        <span>
          Dataklasse: {dataClassificationLabels[classification].toLowerCase()}
        </span>
      ) : (
        <span>{dataClassificationLabels[classification]}</span>
      )}
    </Badge>
  );
}

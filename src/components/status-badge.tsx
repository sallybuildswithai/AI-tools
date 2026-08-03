import { Badge } from "@/components/ui/badge";
import type { ApprovalStatus } from "@/lib/types";
import { approvalStatusLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";

const statusStyles: Record<ApprovalStatus, string> = {
  approved:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
  conditional:
    "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
  not_approved:
    "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
  under_review:
    "border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
};

interface StatusBadgeProps {
  status: ApprovalStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2 py-0.5 font-medium",
        statusStyles[status],
        className,
      )}
    >
      {approvalStatusLabels[status]}
    </Badge>
  );
}

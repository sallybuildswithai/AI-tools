import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ToolCardSkeletonProps {
  className?: string;
}

export function ToolCardSkeleton({ className }: ToolCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border border-border/80 bg-card p-5",
        className,
      )}
      aria-hidden
    >
      <div className="mb-4 space-y-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="mb-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
      <div className="space-y-2 border-t border-border/70 pt-3">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ToolGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-label="Indlæser værktøjer"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ToolCardSkeleton key={index} />
      ))}
    </div>
  );
}

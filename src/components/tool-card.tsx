import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { AITool } from "@/lib/types";
import { categoryLabels, useCaseLabels } from "@/lib/labels";
import { formatDanishDate } from "@/lib/tool-utils";
import { StatusBadge } from "@/components/status-badge";
import { DataClassificationBadge } from "@/components/data-classification-badge";
import { CompareToggle } from "@/components/compare-toggle";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: AITool;
  className?: string;
}

export function ToolCard({ tool, className }: ToolCardProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-xl border border-border/80 bg-card p-5 shadow-none transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-accent/30",
        "focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* Titlen er linket; ::after gør hele kortet klikbart uden at pakke knapper ind i et <a>. */}
          <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            <Link
              href={`/vaerktoj/${tool.slug}`}
              className="rounded outline-none after:absolute after:inset-0 after:rounded-xl after:content-['']"
            >
              {tool.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{tool.vendor}</p>
        </div>
        <span className="rounded-md border border-transparent p-1 text-muted-foreground transition-colors group-hover:border-border group-hover:text-foreground">
          <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </div>

      <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {tool.shortDescription}
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <StatusBadge status={tool.approvalStatus} />
        <DataClassificationBadge
          classification={tool.dataClassification}
          showLabel={false}
        />
      </div>

      <div className="space-y-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
        <p>
          <span className="font-medium text-foreground/80">Kategorier: </span>
          {tool.categories
            .slice(0, 2)
            .map((category) => categoryLabels[category])
            .join(", ")}
          {tool.categories.length > 2 ? ` +${tool.categories.length - 2}` : ""}
        </p>
        <p className="line-clamp-1">
          <span className="font-medium text-foreground/80">Use cases: </span>
          {tool.useCases
            .slice(0, 2)
            .map((useCase) => useCaseLabels[useCase])
            .join(", ")}
        </p>
        <p>
          Seneste review: {formatDanishDate(tool.lastReviewDate)}
        </p>
      </div>

      <div className="mt-4">
        <CompareToggle slug={tool.slug} toolName={tool.name} />
      </div>
    </article>
  );
}

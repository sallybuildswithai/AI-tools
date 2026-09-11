"use client";

import type { MouseEvent } from "react";
import { Check, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_COMPARE_TOOLS, useCompare } from "@/components/compare-provider";
import { cn } from "@/lib/utils";

interface CompareToggleProps {
  slug: string;
  /** Bruges til skærmlæsere, så knappen ikke bare hedder "Sammenlign". */
  toolName: string;
  size?: "sm" | "default";
  fullWidth?: boolean;
  className?: string;
}

export function CompareToggle({
  slug,
  toolName,
  size = "sm",
  fullWidth = false,
  className,
}: CompareToggleProps) {
  const { isSelected, isFull, toggle, hydrated } = useCompare();
  const selected = isSelected(slug);
  const disabled = !hydrated || (!selected && isFull);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    // Kortet ligger under et link-overlay – stop klikket her.
    event.preventDefault();
    event.stopPropagation();
    toggle(slug);
  }

  return (
    <Button
      type="button"
      size={size}
      variant={selected ? "secondary" : "outline"}
      aria-pressed={selected}
      disabled={disabled}
      title={
        !selected && isFull
          ? `Du kan højst sammenligne ${MAX_COMPARE_TOOLS} værktøjer ad gangen`
          : undefined
      }
      onClick={handleClick}
      className={cn("relative z-10", fullWidth && "w-full", className)}
    >
      {selected ? (
        <Check className="size-3.5" aria-hidden />
      ) : (
        <GitCompareArrows className="size-3.5" aria-hidden />
      )}
      {selected ? "Valgt" : "Sammenlign"}
      <span className="sr-only"> – {toolName}</span>
    </Button>
  );
}

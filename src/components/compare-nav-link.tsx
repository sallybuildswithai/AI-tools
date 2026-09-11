"use client";

import Link from "next/link";
import { GitCompareArrows } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { buildCompareHref, useCompare } from "@/components/compare-provider";
import { cn } from "@/lib/utils";

export function CompareNavLink({ className }: { className?: string }) {
  const { selected, hydrated } = useCompare();
  const count = hydrated ? selected.length : 0;

  return (
    <Link
      href={buildCompareHref(selected)}
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), className)}
    >
      <GitCompareArrows className="size-4" aria-hidden />
      Sammenlign
      {count > 0 ? (
        <span
          className="ml-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] leading-4 font-semibold text-primary-foreground"
          aria-hidden
        >
          {count}
        </span>
      ) : null}
      {count > 0 ? (
        <span className="sr-only">, {count} værktøjer valgt</span>
      ) : null}
    </Link>
  );
}

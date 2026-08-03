"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  large?: boolean;
  id?: string;
  "aria-label"?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Søg efter værktøjer…",
  className,
  large = false,
  id,
  "aria-label": ariaLabel = "Søg",
}: SearchBarProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground",
          large ? "size-5" : "size-4",
        )}
        aria-hidden
      />
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          "w-full bg-background pr-10 shadow-none transition-[border-color,box-shadow]",
          large
            ? "h-14 rounded-xl border-border/80 pl-11 text-base md:text-lg"
            : "h-10 pl-9",
        )}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => onChange("")}
          aria-label="Ryd søgning"
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}

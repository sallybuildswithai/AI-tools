"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";

interface HomeSearchProps {
  className?: string;
}

export function HomeSearch({ className }: HomeSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("q", query.trim());
    }
    const qs = params.toString();
    router.push(qs ? `/bibliotek?${qs}` : "/bibliotek");
  }

  return (
    <form onSubmit={handleSubmit} className={className} role="search">
      <label htmlFor="home-search" className="sr-only">
        Søg efter AI-værktøjer
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          id="home-search"
          value={query}
          onChange={setQuery}
          placeholder="Hvad vil du gerne bruge AI til?"
          large
          aria-label="Hvad vil du gerne bruge AI til?"
          className="flex-1"
        />
        <Button type="submit" size="lg" className="h-14 px-6 sm:w-auto">
          Søg i biblioteket
        </Button>
      </div>
    </form>
  );
}

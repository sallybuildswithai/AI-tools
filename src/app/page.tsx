import Link from "next/link";
import {
  MessageSquareText,
  Search,
  Presentation,
  ImageIcon,
  Video,
  Users,
  ChartColumn,
  Code2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { HomeSearch } from "@/components/home-search";
import { ToolCard } from "@/components/tool-card";
import { GovernanceNotice } from "@/components/governance-notice";
import { getFeaturedTools } from "@/lib/mock-data";
import { dataClassificationDescriptions } from "@/lib/labels";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UseCase } from "@/lib/types";

const useCaseButtons: {
  useCase: UseCase;
  label: string;
  icon: typeof MessageSquareText;
}[] = [
  { useCase: "tekst-og-kommunikation", label: "Tekst og kommunikation", icon: MessageSquareText },
  { useCase: "research", label: "Research", icon: Search },
  { useCase: "praesentationer", label: "Præsentationer", icon: Presentation },
  { useCase: "billeder", label: "Billeder", icon: ImageIcon },
  { useCase: "video", label: "Video", icon: Video },
  { useCase: "moeder", label: "Møder", icon: Users },
  { useCase: "dataanalyse", label: "Dataanalyse", icon: ChartColumn },
  { useCase: "kodning", label: "Kodning", icon: Code2 },
];

const classificationCards = [
  {
    key: "green" as const,
    title: "Grøn",
    tone: "border-emerald-200 bg-emerald-50/80 text-emerald-950",
    dot: "bg-emerald-600",
  },
  {
    key: "yellow" as const,
    title: "Gul",
    tone: "border-amber-200 bg-amber-50/80 text-amber-950",
    dot: "bg-amber-500",
  },
  {
    key: "red" as const,
    title: "Rød",
    tone: "border-red-200 bg-red-50/80 text-red-950",
    dot: "bg-red-600",
  },
];

export default function HomePage() {
  const featured = getFeaturedTools();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="bg-grid-fade pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <p className="animate-fade-up font-heading text-sm font-semibold tracking-[0.04em] text-primary uppercase">
            Værktøjsbiblioteket
          </p>
          <h1 className="animate-fade-up-delay-1 mt-4 max-w-3xl font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Find det rette AI-værktøj til opgaven
          </h1>
          <p className="animate-fade-up-delay-2 mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Udforsk capabilities, use cases og governance-krav, så I kan vurdere
            om et værktøj er relevant – og forsvarligt – at bruge i jeres arbejde.
          </p>

          <div className="animate-fade-up-delay-3 mt-10 max-w-3xl">
            <HomeSearch />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/bibliotek"
              className={cn(buttonVariants({ size: "lg" }), "h-11")}
            >
              Gå til biblioteket
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/governance"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}
            >
              <ShieldCheck className="size-4" aria-hidden />
              Læs governance
            </Link>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8"
        aria-labelledby="usecases-heading"
      >
        <div className="max-w-2xl">
          <h2
            id="usecases-heading"
            className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Hurtig adgang via use case
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Vælg den type opgave, du står med, og se relevante værktøjer i biblioteket.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {useCaseButtons.map(({ useCase, label, icon: Icon }) => (
            <Link
              key={useCase}
              href={`/bibliotek?useCase=${useCase}`}
              className="group flex min-h-24 flex-col justify-between rounded-xl border border-border/80 bg-card/80 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon
                className="size-5 text-primary transition-transform duration-200 group-hover:scale-105"
                aria-hidden
              />
              <span className="mt-4 text-sm font-medium text-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section
        className="border-y border-border/70 bg-card/40"
        aria-labelledby="featured-heading"
      >
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2
                id="featured-heading"
                className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                Udvalgte værktøjer
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Et udsnit af værktøjer, der ofte er relevante i hverdagen. Tjek altid
                godkendelse og dataklasse før brug.
              </p>
            </div>
            <Link
              href="/bibliotek"
              className={cn(buttonVariants({ variant: "outline" }), "self-start")}
            >
              Se alle
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8"
        aria-labelledby="classification-heading"
      >
        <div className="max-w-2xl">
          <h2
            id="classification-heading"
            className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Dataklassifikation: grøn, gul og rød
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Brug klassifikationen til at vurdere, hvilke data der må indtastes i et
            værktøj. Beskrivelserne er vejledende eksempelindhold.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {classificationCards.map((item) => (
            <div
              key={item.key}
              className={`rounded-xl border p-5 ${item.tone}`}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${item.dot}`} aria-hidden />
                <h3 className="font-heading text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed opacity-90">
                {dataClassificationDescriptions[item.key]}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <GovernanceNotice />
        </div>
      </section>
    </div>
  );
}

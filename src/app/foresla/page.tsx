import Link from "next/link";
import type { Metadata } from "next";
import { ContributionForm } from "@/components/contribution-form";
import type { ContributionType } from "@/components/contribution-form";
import { GovernanceNotice } from "@/components/governance-notice";
import { getToolBySlug } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Foreslå værktøj",
  description:
    "Foreslå et nyt AI-værktøj til biblioteket eller meld forældet information om et eksisterende værktøj.",
};

interface ContributionPageProps {
  searchParams: Promise<{
    type?: string | string[];
    vaerktoej?: string | string[];
  }>;
}

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function ContributionPage({
  searchParams,
}: ContributionPageProps) {
  const params = await searchParams;
  const slugCandidate = firstParam(params.vaerktoej);
  const prefilledTool = slugCandidate ? getToolBySlug(slugCandidate) : undefined;
  // Et link fra en værktøjsside handler altid om det pågældende værktøj.
  const initialType: ContributionType =
    prefilledTool || firstParam(params.type) === "opdatering"
      ? "opdatering"
      : "nyt-vaerktoj";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Foreslå et værktøj – eller meld en fejl
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Biblioteket bliver kun ved med at være brugbart, hvis indholdet
          holdes ved lige. Mangler der et værktøj, du har brug for? Eller er en
          governance-oplysning blevet forældet? Så sig til her.
        </p>
      </div>

      <div className="mb-8">
        <GovernanceNotice />
      </div>

      <ContributionForm
        initialType={initialType}
        initialToolSlug={prefilledTool?.slug ?? ""}
      />

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        Leder du efter et alternativ i stedet? Kig i{" "}
        <Link
          href="/bibliotek"
          className="underline underline-offset-4 hover:text-foreground"
        >
          biblioteket
        </Link>{" "}
        eller læs{" "}
        <Link
          href="/governance"
          className="underline underline-offset-4 hover:text-foreground"
        >
          governance-retningslinjerne
        </Link>
        .
      </p>
    </div>
  );
}

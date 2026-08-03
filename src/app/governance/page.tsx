import type { Metadata } from "next";
import {
  Shield,
  UserRound,
  Lock,
  Eye,
  Copyright,
  FileText,
  Building2,
  Scale,
  BadgeCheck,
} from "lucide-react";
import { GovernanceNotice } from "@/components/governance-notice";
import { dataClassificationDescriptions } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Governance",
  description:
    "Retningslinjer for dataklassifikation, persondata, human review, ophavsret og godkendelsesproces.",
};

const sections = [
  {
    id: "dataklassifikation",
    title: "Dataklassifikation",
    icon: Shield,
    body: (
      <>
        <p>
          Alle data, der indtastes i AI-værktøjer, skal vurderes efter
          organisationens klassifikation. Brug grøn, gul og rød som et praktisk
          pejlemærke – og eskalér ved tvivl.
        </p>
        <ul className="mt-4 space-y-3">
          {(
            [
              ["Grøn", dataClassificationDescriptions.green],
              ["Gul", dataClassificationDescriptions.yellow],
              ["Rød", dataClassificationDescriptions.red],
            ] as const
          ).map(([label, text]) => (
            <li key={label} className="rounded-lg border border-border/70 bg-muted/30 p-3">
              <p className="font-medium text-foreground">{label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "persondata",
    title: "Persondata",
    icon: UserRound,
    body: (
      <p>
        Personoplysninger må som udgangspunkt ikke indtastes i eksterne
        AI-værktøjer, medmindre der foreligger en dokumenteret vurdering,
        lovligt grundlag og godkendt opsætning. Det gælder også tilsyneladende
        harmløse oplysninger, der kan identificere en person direkte eller
        indirekte.
      </p>
    ),
  },
  {
    id: "fortrolig-information",
    title: "Fortrolig information",
    icon: Lock,
    body: (
      <p>
        Forretningshemmeligheder, uannoncerede strategier, kontraktudkast og
        anden fortrolig information kræver særlig opmærksomhed. Brug kun
        værktøjer, der er godkendt til det relevante niveau, og undgå at
        kopiere hele dokumenter ind uden vurdering.
      </p>
    ),
  },
  {
    id: "human-review",
    title: "Human review",
    icon: Eye,
    body: (
      <p>
        AI-output er et udkast – ikke en færdig beslutning. Kritiske fakta, tal,
        juridiske formuleringer og eksterne budskaber skal gennemgås af en
        menneskelig ansvarlig, før de anvendes eller offentliggøres.
      </p>
    ),
  },
  {
    id: "ophavsret",
    title: "Ophavsret",
    icon: Copyright,
    body: (
      <p>
        Genereret indhold kan rejse spørgsmål om ophavsret, licenser og
        tredjepartsrettigheder. Brug ikke AI-output ukritisk i kommerciel
        kommunikation, og respekter brand guidelines samt eventuelle
        leverandørvilkår.
      </p>
    ),
  },
  {
    id: "dokumentation",
    title: "Dokumentation",
    icon: FileText,
    body: (
      <p>
        Hold styr på, hvilke værktøjer der anvendes til hvilke formål, og notér
        væsentlige beslutninger om data og risici. God dokumentation gør det
        lettere at følge op ved audits, leverandørændringer eller nye
        vurderinger.
      </p>
    ),
  },
  {
    id: "vendor-assessment",
    title: "Vendor assessment",
    icon: Building2,
    body: (
      <p>
        Leverandørvurdering skal baseres på verificerede aftaler, databehandler-
        vilkår og sikkerhedskontroller – ikke på antagelser. Dette MVP indeholder
        ikke verificerede compliance-claims; kontakt relevante funktioner for
        aktuelle vurderinger.
      </p>
    ),
  },
  {
    id: "eu-ai-act",
    title: "EU AI Act",
    icon: Scale,
    body: (
      <p>
        EU AI Act stiller krav afhængigt af risikoniveau og anvendelse.
        Organisationer bør kortlægge, hvordan AI bruges, og afklare roller,
        dokumentation og eventuelle højspændingsanvendelser med juridisk
        bistand. Indholdet her er ikke en juridisk tolkning.
      </p>
    ),
  },
  {
    id: "godkendelsesproces",
    title: "Godkendelsesproces",
    icon: BadgeCheck,
    body: (
      <>
        <p>
          Nye værktøjer bør følge en klar intern proces, før de tages i brug:
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Beskriv formål, brugere og datatyper.</li>
          <li>Indhent vurdering fra IT-sikkerhed og juridisk afdeling.</li>
          <li>Afklar licens, SSO/enterprise og leverandørvilkår.</li>
          <li>Fastlæg tilladt dataklasse og eventuelle begrænsninger.</li>
          <li>Kommunikér status i Værktøjsbiblioteket og opdatér reviewdato.</li>
        </ol>
      </>
    ),
  },
];

export default function GovernancePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Governance
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Retningslinjer for forsvarlig brug af AI i organisationen. Teksten er
          vejledende eksempelindhold til intern enablement – ikke juridisk eller
          sikkerhedsrådgivning.
        </p>
      </div>

      <div className="mb-10">
        <GovernanceNotice variant="warning" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[14rem_1fr]">
        <nav
          className="hidden h-fit rounded-xl border border-border/80 bg-card p-4 lg:sticky lg:top-24 lg:block"
          aria-label="Governance-sektioner"
        >
          <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Indhold
          </p>
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 rounded-xl border border-border/80 bg-card/80 p-6 sm:p-8"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/40 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h2 className="font-heading text-2xl font-semibold tracking-tight">
                    {section.title}
                  </h2>
                </div>
                <div className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {section.body}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

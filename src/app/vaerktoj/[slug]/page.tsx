import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ExternalLink, AlertTriangle } from "lucide-react";
import {
  getAlternativeTools,
  getToolBySlug,
  tools,
} from "@/lib/mock-data";
import {
  categoryLabels,
  pricingModelLabels,
  useCaseLabels,
} from "@/lib/labels";
import { formatDanishDate } from "@/lib/tool-utils";
import { StatusBadge } from "@/components/status-badge";
import { DataClassificationBadge } from "@/components/data-classification-badge";
import { GovernanceNotice } from "@/components/governance-notice";
import { ToolCard } from "@/components/tool-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ToolDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: ToolDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) {
    return { title: "Værktøj ikke fundet" };
  }
  return {
    title: tool.name,
    description: tool.shortDescription,
  };
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-xl font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const alternatives = getAlternativeTools(tool);
  const showWarning =
    tool.dataClassification === "red" || tool.approvalStatus === "not_approved";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-6">
        <Link
          href="/bibliotek"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          ← Tilbage til biblioteket
        </Link>
      </div>

      {showWarning ? (
        <Alert className="mb-6 border-red-300/80 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950/40 dark:text-red-50">
          <AlertTriangle className="size-4" />
          <AlertTitle>Advarsel: begrænset eller ikke godkendt brug</AlertTitle>
          <AlertDescription>
            Dette værktøj er markeret som{" "}
            {tool.approvalStatus === "not_approved"
              ? "ikke godkendt"
              : "rød dataklasse"}{" "}
            i eksempeldata. Brug det ikke til arbejdsformål, før IT-sikkerhed og
            juridisk afdeling har givet en aktuel vurdering.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
        <div className="min-w-0 space-y-10">
          <header className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{tool.vendor}</p>
              <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                {tool.name}
              </h1>
            </div>
            <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
              {tool.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={tool.approvalStatus} />
              <DataClassificationBadge classification={tool.dataClassification} />
            </div>
            <div className="flex flex-wrap gap-2">
              {tool.categories.map((category) => (
                <Badge key={category} variant="secondary" className="rounded-md">
                  {categoryLabels[category]}
                </Badge>
              ))}
              {tool.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-md">
                  {tag}
                </Badge>
              ))}
            </div>
            {tool.websiteUrl ? (
              <a
                href={tool.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Leverandørens website
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            ) : null}
          </header>

          <GovernanceNotice />

          <DetailSection title="Egnet til">
            <div className="flex flex-wrap gap-2">
              {tool.useCases.map((useCase) => (
                <Badge key={useCase} variant="secondary" className="rounded-md">
                  {useCaseLabels[useCase]}
                </Badge>
              ))}
            </div>
          </DetailSection>

          <div className="grid gap-8 md:grid-cols-2">
            <DetailSection title="Styrker">
              <BulletList items={tool.strengths} />
            </DetailSection>
            <DetailSection title="Begrænsninger">
              <BulletList items={tool.limitations} />
            </DetailSection>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <DetailSection title="Tilladt data">
              <BulletList items={tool.allowedData} />
            </DetailSection>
            <DetailSection title="Forbudt data">
              <BulletList items={tool.prohibitedData} />
            </DetailSection>
          </div>

          <DetailSection title="GDPR-note">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {tool.gdprNote}
            </p>
          </DetailSection>

          <DetailSection title="Sikkerhedsnote">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {tool.securityNote}
            </p>
          </DetailSection>

          <DetailSection title="Pris">
            <p className="text-sm font-medium text-foreground">
              {pricingModelLabels[tool.pricingModel]}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {tool.pricingNote}
            </p>
          </DetailSection>

          {alternatives.length > 0 ? (
            <DetailSection title="Alternativer">
              <div className="grid gap-4 sm:grid-cols-2">
                {alternatives.map((alt) => (
                  <ToolCard key={alt.id} tool={alt} />
                ))}
              </div>
            </DetailSection>
          ) : null}
        </div>

        <aside className="h-fit space-y-4 rounded-xl border border-border/80 bg-card p-5 lg:sticky lg:top-24">
          <h2 className="font-heading text-base font-semibold tracking-tight">
            Oversigt
          </h2>
          <Separator />
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Godkendelse</dt>
              <dd className="mt-1">
                <StatusBadge status={tool.approvalStatus} />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Dataklasse</dt>
              <dd className="mt-1">
                <DataClassificationBadge
                  classification={tool.dataClassification}
                  showLabel={false}
                />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Prismodel</dt>
              <dd className="mt-1 font-medium">
                {pricingModelLabels[tool.pricingModel]}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Seneste review</dt>
              <dd className="mt-1 font-medium">
                {formatDanishDate(tool.lastReviewDate)}
              </dd>
            </div>
          </dl>
          <Separator />
          <Link
            href={`/sammenlign`}
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            Sammenlign værktøjer
          </Link>
        </aside>
      </div>
    </div>
  );
}

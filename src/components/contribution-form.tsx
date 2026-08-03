"use client";

import { useState, type FormEvent } from "react";
import { Check, Copy, Mail, Pencil } from "lucide-react";
import { tools } from "@/lib/mock-data";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * MVP'en har ingen backend. Formularen samler i stedet en færdig besked, som
 * brugeren kan sende eller kopiere til den fællespostkasse, I selv vælger.
 */
const contactMailbox = "ai-enablement@example.com";

export type ContributionType = "nyt-vaerktoj" | "opdatering";

const typeLabels: Record<ContributionType, string> = {
  "nyt-vaerktoj": "Foreslå et nyt værktøj",
  opdatering: "Meld forældet eller forkert information",
};

interface ContributionFormProps {
  initialType: ContributionType;
  initialToolSlug: string;
}

interface FormErrors {
  toolName?: string;
  toolSlug?: string;
  purpose?: string;
}

export function ContributionForm({
  initialType,
  initialToolSlug,
}: ContributionFormProps) {
  const [type, setType] = useState<ContributionType>(initialType);
  const [toolSlug, setToolSlug] = useState(initialToolSlug);
  const [toolName, setToolName] = useState("");
  const [vendorOrUrl, setVendorOrUrl] = useState("");
  const [purpose, setPurpose] = useState("");
  const [dataUsage, setDataUsage] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isNewTool = type === "nyt-vaerktoj";

  function buildMessage(): string {
    const selectedTool = tools.find((tool) => tool.slug === toolSlug);
    const lines = [
      `Type: ${typeLabels[type]}`,
      isNewTool
        ? `Værktøj: ${toolName.trim()}`
        : `Værktøj: ${selectedTool?.name ?? toolSlug} (/vaerktoj/${toolSlug})`,
    ];

    if (isNewTool && vendorOrUrl.trim()) {
      lines.push(`Leverandør eller link: ${vendorOrUrl.trim()}`);
    }

    lines.push(
      "",
      isNewTool
        ? "Hvad skal det bruges til:"
        : "Hvad er forældet eller forkert:",
      purpose.trim(),
    );

    if (dataUsage.trim()) {
      lines.push("", "Forventede datatyper:", dataUsage.trim());
    }

    if (contact.trim()) {
      lines.push("", `Indsendt af: ${contact.trim()}`);
    }

    return lines.join("\n");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (isNewTool && !toolName.trim()) {
      nextErrors.toolName = "Skriv navnet på værktøjet.";
    }
    if (!isNewTool && !toolSlug) {
      nextErrors.toolSlug = "Vælg det værktøj, din melding handler om.";
    }
    if (!purpose.trim()) {
      nextErrors.purpose = isNewTool
        ? "Beskriv kort, hvad værktøjet skal bruges til."
        : "Beskriv kort, hvad der er forældet eller forkert.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setMessage(null);
      return;
    }

    setMessage(buildMessage());
  }

  async function copyMessage() {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Udklipsholderen kan være blokeret – teksten kan stadig markeres manuelt.
    }
  }

  if (message) {
    const subject =
      type === "nyt-vaerktoj"
        ? `Forslag til nyt værktøj: ${toolName.trim()}`
        : `Opdatering til værktøjsbiblioteket: ${
            tools.find((tool) => tool.slug === toolSlug)?.name ?? toolSlug
          }`;
    const mailtoHref = `mailto:${contactMailbox}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(message)}`;

    return (
      <div className="space-y-5 rounded-xl border border-border/80 bg-card p-6">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Din besked er klar
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Biblioteket har ingen database i denne version, så indsendelsen
            sendes ikke automatisk. Send beskeden til jeres fællespostkasse –
            eller kopiér teksten ind i det system, I bruger til den slags.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contribution-message">Besked</Label>
          <Textarea
            id="contribution-message"
            readOnly
            value={message}
            rows={12}
            className="font-mono text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={mailtoHref}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <Mail className="size-3.5" aria-hidden />
            Åbn i mailprogram
          </a>
          <Button type="button" variant="outline" size="sm" onClick={copyMessage}>
            {copied ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <Copy className="size-3.5" aria-hidden />
            )}
            {copied ? "Kopieret" : "Kopiér tekst"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMessage(null)}
          >
            <Pencil className="size-3.5" aria-hidden />
            Ret i indsendelsen
          </Button>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Modtageradressen <span className="font-mono">{contactMailbox}</span> er
          en placeholder. Udskift den med jeres egen fællespostkasse, før
          biblioteket tages i brug.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-border/80 bg-card p-6"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="contribution-type">Hvad drejer det sig om?</Label>
        <Select
          value={type}
          onValueChange={(value) => {
            if (!value) return;
            setType(value as ContributionType);
            setErrors({});
          }}
        >
          <SelectTrigger id="contribution-type" className="w-full">
            <SelectValue placeholder="Vælg type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nyt-vaerktoj">
              {typeLabels["nyt-vaerktoj"]}
            </SelectItem>
            <SelectItem value="opdatering">{typeLabels.opdatering}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isNewTool ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="tool-name">Værktøjets navn</Label>
            <Input
              id="tool-name"
              value={toolName}
              onChange={(event) => setToolName(event.target.value)}
              placeholder="F.eks. Notion AI"
              aria-invalid={Boolean(errors.toolName)}
              aria-describedby={errors.toolName ? "tool-name-error" : undefined}
            />
            {errors.toolName ? (
              <p id="tool-name-error" className="text-xs text-destructive">
                {errors.toolName}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tool-vendor">Leverandør eller link (valgfrit)</Label>
            <Input
              id="tool-vendor"
              value={vendorOrUrl}
              onChange={(event) => setVendorOrUrl(event.target.value)}
              placeholder="https://…"
            />
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="tool-slug">Hvilket værktøj?</Label>
          <Select
            value={toolSlug}
            onValueChange={(value) => {
              if (!value) return;
              setToolSlug(String(value));
            }}
          >
            <SelectTrigger
              id="tool-slug"
              className="w-full"
              aria-invalid={Boolean(errors.toolSlug)}
              aria-describedby={errors.toolSlug ? "tool-slug-error" : undefined}
            >
              <SelectValue placeholder="Vælg værktøj" />
            </SelectTrigger>
            <SelectContent>
              {tools.map((tool) => (
                <SelectItem key={tool.slug} value={tool.slug}>
                  {tool.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.toolSlug ? (
            <p id="tool-slug-error" className="text-xs text-destructive">
              {errors.toolSlug}
            </p>
          ) : null}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="contribution-purpose">
          {isNewTool
            ? "Hvad skal værktøjet bruges til?"
            : "Hvad er forældet eller forkert?"}
        </Label>
        <Textarea
          id="contribution-purpose"
          value={purpose}
          onChange={(event) => setPurpose(event.target.value)}
          rows={4}
          placeholder={
            isNewTool
              ? "Beskriv opgaven, du gerne vil løse med værktøjet."
              : "Beskriv hvilken oplysning der ikke passer, og hvad du ved."
          }
          aria-invalid={Boolean(errors.purpose)}
          aria-describedby={errors.purpose ? "purpose-error" : undefined}
        />
        {errors.purpose ? (
          <p id="purpose-error" className="text-xs text-destructive">
            {errors.purpose}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contribution-data">
          Hvilke data forventer du at bruge i værktøjet? (valgfrit)
        </Label>
        <Textarea
          id="contribution-data"
          value={dataUsage}
          onChange={(event) => setDataUsage(event.target.value)}
          rows={3}
          placeholder="F.eks. offentligt materiale, interne udkast, kundedata …"
        />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Skriv kun kategorier – ikke selve indholdet. Undlad personoplysninger
          og fortrolige detaljer i formularen.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contribution-contact">
          Dit navn eller din mail (valgfrit)
        </Label>
        <Input
          id="contribution-contact"
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          placeholder="Så kan vi vende tilbage med et svar"
        />
      </div>

      <Button type="submit">Saml indsendelsen</Button>
    </form>
  );
}

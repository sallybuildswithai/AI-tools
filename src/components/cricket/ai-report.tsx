"use client";

import { useRef, useState } from "react";
import { Loader2, Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BowlerProfile, Delivery } from "@/lib/cricket/types";

const ERROR_MARKER = "[[FEJL]]";

export function AiReport({
  deliveries,
  benchmarkId,
  profile,
}: {
  deliveries: Delivery[];
  benchmarkId: string;
  profile: BowlerProfile;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function generate() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setText("");
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/cricket-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveries, benchmarkId, profile }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? `Serverfejl (${response.status})`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        const markerAt = full.indexOf(ERROR_MARKER);
        if (markerAt >= 0) {
          setText(full.slice(0, markerAt));
          setError(full.slice(markerAt + ERROR_MARKER.length).trim());
        } else {
          setText(full);
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={generate} disabled={loading || deliveries.length < 6}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="size-4" aria-hidden />
          )}
          {text ? "Generér ny rapport" : "Generér AI-coachrapport"}
        </Button>
        {loading && (
          <Button variant="outline" onClick={() => abortRef.current?.abort()}>
            <Square className="size-4" aria-hidden />
            Stop
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          Kun de beregnede nøgletal, zoner og korrelationer sendes til Claude – ikke de
          enkelte bolde.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading && !text && (
        <p className="text-sm text-muted-foreground">Coachen analyserer dataene …</p>
      )}

      {text && (
        <article className="space-y-3 text-sm leading-relaxed" aria-live="polite">
          <Markdown source={text} />
        </article>
      )}
    </div>
  );
}

/** Minimal Markdown: overskrifter, lister, fed og kursiv – nok til coachrapporten. */
function Markdown({ source }: { source: string }) {
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag
        key={blocks.length}
        className={`space-y-1.5 pl-5 ${list.ordered ? "list-decimal" : "list-disc"}`}
      >
        {list.items.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };

  for (const raw of source.split("\n")) {
    const line = raw.trimEnd();
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);

    if (heading) {
      flush();
      blocks.push(
        <h3
          key={blocks.length}
          className="pt-3 font-heading text-lg font-semibold tracking-tight text-foreground first:pt-0"
        >
          {inline(heading[2])}
        </h3>,
      );
    } else if (bullet || numbered) {
      const ordered = Boolean(numbered);
      if (list && list.ordered !== ordered) flush();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]);
    } else if (line.trim() === "") {
      flush();
    } else if (list && /^\s{2,}/.test(raw)) {
      list.items[list.items.length - 1] += ` ${line.trim()}`;
    } else {
      flush();
      blocks.push(
        <p key={blocks.length} className="text-muted-foreground">
          {inline(line)}
        </p>,
      );
    }
  }
  flush();
  return <>{blocks}</>;
}

function inline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|_[^_]+_|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if ((part.startsWith("_") && part.endsWith("_")) || (part.startsWith("*") && part.endsWith("*") && part.length > 2)) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

import Anthropic from "@anthropic-ai/sdk";
import { analyse, buildInsights, compareToBenchmark } from "@/lib/cricket/analysis";
import { benchmarks } from "@/lib/cricket/benchmarks";
import type { BowlerProfile, Delivery } from "@/lib/cricket/types";

const MAX_DELIVERIES = 3000;

const SYSTEM_PROMPT = `Du er en erfaren elite-bowlingcoach i cricket med speciale i fast og swing bowling og i at læse ball-tracking-data (Hawk-Eye-lignende: fart, pitch map, beehive, sving, seam).

Du får en bowlers målte data som JSON: nøgletal, fordeling på længde- og linjezoner (med falske slag og runs pr. bold i hver zone), korrelationer (Pearson r mod falske slag og runs), fartudvikling pr. over og en sammenligning med en valgt professionel referenceprofil.

Skriv en coachingrapport på dansk til spilleren og deres træner:
- Byg hver påstand på tallene, og nævn de konkrete tal.
- Korrelationer er sammenhænge, ikke beviste årsager. Små stikprøver (under ca. 60 bolde, eller zoner under 10 bolde) skal nævnes som usikre.
- Referenceprofilerne er indikative niveauer, ikke officielle Hawk-Eye-tal.
- Prioritér: hellere tre ting, der flytter mest, end ti småting.
- Brug cricket-termer, spillere kender (good length, corridor of uncertainty, seam position, wobble seam, run-up), og forklar dem kort, hvis det hjælper.

Brug præcis denne struktur i Markdown:
## Samlet vurdering
2-3 sætninger.
## Styrker
Punktliste.
## Det skal du arbejde på
Tre nummererede fokusområder. Hvert med: hvad dataene viser, hvorfor det betyder noget mod professionelt niveau, én konkret øvelse og et målbart mål til næste måling.
## Taktisk plan
Hvordan spilleren bør bruge sine styrker i kamp ud fra zonerne (fx hvilken længde/linje der skaber falske slag, og hvad der skal undgås).
## Næste måling
Hvad der skal måles næste gang for at se fremskridt.`;

type RequestBody = {
  deliveries: Delivery[];
  benchmarkId: string;
  profile: BowlerProfile;
};

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ugyldig JSON." }, { status: 400 });
  }

  const { deliveries, benchmarkId, profile } = body;
  if (!Array.isArray(deliveries) || deliveries.length < 6) {
    return Response.json({ error: "Der skal mindst være 6 bolde." }, { status: 400 });
  }
  if (deliveries.length > MAX_DELIVERIES) {
    return Response.json(
      { error: `Maks. ${MAX_DELIVERIES} bolde pr. analyse.` },
      { status: 400 },
    );
  }
  const benchmark = benchmarks.find((b) => b.id === benchmarkId) ?? benchmarks[0];

  // Analysen genberegnes på serveren, så modellen kun ser tal vi selv har udregnet.
  const analysis = analyse(deliveries);
  const payload = {
    spiller: profile,
    referenceprofil: { navn: benchmark.label, beskrivelse: benchmark.description },
    nøgletal: analysis.metrics,
    længdezoner: analysis.lengthZones,
    linjezoner: analysis.lineZones,
    korrelationer: analysis.correlations,
    fartPrOver: analysis.speedByOver,
    sammenligning: compareToBenchmark(analysis.metrics, benchmark),
    regelbaseredeIndsigter: buildInsights(analysis),
  };

  let client: Anthropic;
  try {
    client = new Anthropic();
  } catch (error) {
    return Response.json({ error: describeError(error) }, { status: 503 });
  }
  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium" },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Her er bowlerens data:\n\n${JSON.stringify(payload, roundNumbers, 2)}`,
      },
    ],
  });

  const encoder = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode("\n\n_Modellen afviste at besvare denne forespørgsel._"),
          );
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("\n\n_Rapporten blev afkortet._"));
        }
        controller.close();
      } catch (error) {
        controller.enqueue(encoder.encode(`\n\n[[FEJL]] ${describeError(error)}`));
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body$, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function roundNumbers(_key: string, value: unknown) {
  return typeof value === "number" ? Math.round(value * 1000) / 1000 : value;
}

function describeError(error: unknown) {
  if (error instanceof Anthropic.AuthenticationError) {
    return "AI-coachen mangler en gyldig ANTHROPIC_API_KEY på serveren.";
  }
  if (error instanceof Anthropic.RateLimitError) {
    return "For mange forespørgsler lige nu – prøv igen om lidt.";
  }
  if (error instanceof Anthropic.APIError) {
    return `API-fejl (${error.status ?? "ukendt"}): ${error.message}`;
  }
  if (error instanceof Error && /api key|apiKey|authToken/i.test(error.message)) {
    return "AI-coachen er ikke sat op: tilføj ANTHROPIC_API_KEY i .env.local.";
  }
  return "Uventet fejl under generering af rapporten.";
}

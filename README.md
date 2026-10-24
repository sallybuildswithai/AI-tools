# Værktøjsbiblioteket

Intern MVP til at hjælpe medarbejdere med at finde AI-værktøjer, forstå anvendelser og vurdere governance-krav.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons
- Lokal mock-data (ingen auth eller database)

## Kom i gang

```bash
npm install
npm run dev
```

Åbn [http://localhost:3000](http://localhost:3000).

## Sider

- `/` – Forside med søgning, use cases, udvalgte værktøjer og dataklassifikation
- `/bibliotek` – Værktøjsbibliotek med søgning, filtre og sortering
- `/vaerktoj/[slug]` – Detaljeside for hvert værktøj
- `/governance` – Governance-retningslinjer
- `/sammenlign` – Sammenlign op til tre værktøjer

## Vigtigt

Governance-, GDPR- og sikkerhedsoplysninger i mock-data er **eksempelindhold** til demonstrationsformål og er ikke verificeret juridisk eller sikkerhedsrådgivning.

## AI Cricket Coach (`/cricket-coach`)

Analyserer en bowlers ball-tracking-data (Hawk-Eye-lignende): fart, pitch map, beehive, sving og seam. Siden beregner zoner, korrelationer og fartfald, sammenligner med indikative professionelle referenceprofiler og kan generere en coachingrapport med Claude.

- **Data:** Upload en CSV med kolonnerne `ball, over, speed_kmh, release_height_m, pitch_line_m, pitch_length_m, stumps_line_m, stumps_height_m, swing_deg, seam_deg, outcome, runs` (download en skabelon på siden). `outcome` er en af `dot, runs, boundary, beaten, edge, wicket`. Koordinater er set fra bowlerens ende mod en højrehåndet batsman, positiv linje = offside.
- **AI-rapport:** Kræver `ANTHROPIC_API_KEY` i `.env.local`. Kun beregnede nøgletal sendes til modellen.
- **Benchmarks:** Referenceværdierne i `src/lib/cricket/benchmarks.ts` er indikative, ikke officielle Hawk-Eye-tal. Erstat dem med rigtige data, når I har dem.

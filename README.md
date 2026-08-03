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

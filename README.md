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
- `/foresla` – Foreslå et nyt værktøj eller meld forældet information

## Delbare links

Søgning, filtre og sortering lægger sig i adressen på `/bibliotek`, så en
filtreret liste kan deles og bogmærkes – og browserens frem/tilbage virker:

| Parameter  | Betydning                                             |
| ---------- | ----------------------------------------------------- |
| `q`        | Fritekstsøgning                                       |
| `kategori` | Kommasepareret liste af kategorier                    |
| `useCase`  | Kommasepareret liste af use cases                     |
| `pris`     | Kommasepareret liste af prismodeller                  |
| `status`   | Kommasepareret liste af godkendelsesstatusser         |
| `data`     | Kommasepareret liste af dataklasser                   |
| `sort`     | `name-asc`, `name-desc`, `lastReviewDate-asc/-desc`   |

Eksempel: `/bibliotek?q=referat&kategori=moeder&status=approved`

Valget på `/sammenlign` ligger i `?vaerktoej=<slug>,<slug>`. Værktøjer kan
tilføjes med “Sammenlign” ude på kortene og på detaljesiderne; valget følger
med rundt på sitet via `localStorage`.

## Vigtigt

Formularen på `/foresla` har ingen backend: den samler en færdig besked, som
brugeren selv sender videre. Modtageradressen i
`src/components/contribution-form.tsx` er en placeholder og skal udskiftes med
en rigtig fællespostkasse, før biblioteket tages i brug.

Governance-, GDPR- og sikkerhedsoplysninger i mock-data er **eksempelindhold** til demonstrationsformål og er ikke verificeret juridisk eller sikkerhedsrådgivning.

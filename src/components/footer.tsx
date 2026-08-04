import Link from "next/link";
import { GOVERNANCE_EXAMPLE_DISCLAIMER } from "@/lib/types";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="space-y-3">
          <p className="font-heading text-lg font-semibold tracking-tight">
            Værktøjsbiblioteket
          </p>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Intern platform til at opdage AI-værktøjer, forstå anvendelser og
            vurdere governance-krav inden brug.
          </p>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            {GOVERNANCE_EXAMPLE_DISCLAIMER}
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Navigation</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" href="/">
                Forside
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" href="/bibliotek">
                Bibliotek
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" href="/sammenlign">
                Sammenlign
              </Link>
            </li>
            <li>
              <Link className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" href="/governance">
                Governance
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Support</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>IT-sikkerhed – kontaktoplysninger følger</li>
            <li>Juridisk afdeling – kontaktoplysninger følger</li>
            <li>AI-enablement-team – kontaktoplysninger følger</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Værktøjsbiblioteket — intern MVP</p>
          <p>Alle governance-oplysninger er eksempelindhold.</p>
        </div>
      </div>
    </footer>
  );
}

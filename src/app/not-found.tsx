import Link from "next/link";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Siden blev ikke fundet",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
        Siden blev ikke fundet
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Værktøjet eller siden findes ikke i biblioteket. Gå tilbage til forsiden
        eller browse alle værktøjer.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={cn(buttonVariants())}>
          Forside
        </Link>
        <Link href="/bibliotek" className={cn(buttonVariants({ variant: "outline" }))}>
          Bibliotek
        </Link>
      </div>
    </div>
  );
}

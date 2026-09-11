import type { Metadata } from "next";
import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CompareProvider } from "@/components/compare-provider";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Værktøjsbiblioteket",
    template: "%s · Værktøjsbiblioteket",
  },
  description:
    "Intern platform til at finde AI-værktøjer, forstå anvendelser og vurdere governance-krav.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="da"
      className={`${ibmPlexSans.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="bg-atmosphere flex min-h-full flex-col font-sans">
        {/* Valget til sammenligning følger brugeren på tværs af siderne. */}
        <CompareProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CompareProvider>
      </body>
    </html>
  );
}

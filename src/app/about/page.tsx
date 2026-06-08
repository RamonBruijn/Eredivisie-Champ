import type { Metadata } from "next";
import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata: Metadata = {
  title: "About | Eredivisie Champ",
  description: "Meer informatie over Eredivisie Champ.",
};

export default function AboutPage() {
  return (
    <StaticPageShell
      title="About"
      intro="Eredivisie Champ is een browsergame waarin je een historisch Eredivisie-elftal draft en daarna direct ziet hoe dat team een volledig seizoen doorstaat."
    >
      <section>
        <h2 className="text-2xl font-semibold text-white">Wat is het?</h2>
        <p className="mt-2 text-[var(--muted)]">
          Je kiest een formatie, draft spelers uit klassieke Eredivisie-teams en laat jouw XI vervolgens een volledig seizoen spelen. Alles draait lokaal in de browser, zonder account of backend.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">Waar ligt de focus?</h2>
        <p className="mt-2 text-[var(--muted)]">
          De focus ligt op voetbalnostalgie, snelle speelbaarheid en leuke what-if scenario&apos;s. Historische spelers en teams vormen de basis, maar de ervaring blijft vooral bedoeld als spel.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">Technisch</h2>
        <p className="mt-2 text-[var(--muted)]">
          De app is gebouwd met Next.js en draait volledig client-side voor draft, simulatie en lokale opslag van je laatste run.
        </p>
      </section>
    </StaticPageShell>
  );
}

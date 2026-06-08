import type { Metadata } from "next";
import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata: Metadata = {
  title: "Algemene voorwaarden | Eredivisie Champ",
  description: "Algemene voorwaarden van Eredivisie Champ.",
};

export default function AlgemeneVoorwaardenPage() {
  return (
    <StaticPageShell
      title="Algemene voorwaarden"
      intro="Door Eredivisie Champ te gebruiken, ga je akkoord met deze algemene uitgangspunten voor het gebruik van de app."
    >
      <section>
        <h2 className="text-2xl font-semibold text-white">Gebruik van de app</h2>
        <p className="mt-2 text-[var(--muted)]">
          Eredivisie Champ wordt aangeboden als entertainmentproduct. Je gebruikt de app op eigen risico en verantwoordelijkheid.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">Beschikbaarheid</h2>
        <p className="mt-2 text-[var(--muted)]">
          We doen ons best om de app beschikbaar en correct te houden, maar geven geen garanties over foutloos functioneren, continue beschikbaarheid of uitkomsten van simulaties.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">Inhoud en data</h2>
        <p className="mt-2 text-[var(--muted)]">
          Team- en spelersdata zijn bedoeld voor speldoeleinden. Ondanks zorgvuldigheid kunnen onnauwkeurigheden of interpretaties voorkomen.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">Aansprakelijkheid</h2>
        <p className="mt-2 text-[var(--muted)]">
          Voor zover wettelijk toegestaan is Eredivisie Champ niet aansprakelijk voor directe of indirecte schade die voortvloeit uit het gebruik van de app.
        </p>
      </section>
    </StaticPageShell>
  );
}

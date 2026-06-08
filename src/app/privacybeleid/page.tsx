import type { Metadata } from "next";
import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata: Metadata = {
  title: "Privacybeleid | Eredivisie Champ",
  description: "Privacybeleid van Eredivisie Champ.",
};

export default function PrivacybeleidPage() {
  return (
    <StaticPageShell
      title="Privacybeleid"
      intro="Dit privacybeleid legt op hoofdlijnen uit welke gegevens Eredivisie Champ verwerkt en hoe daarmee wordt omgegaan."
    >
      <section>
        <h2 className="text-2xl font-semibold text-white">Lokale opslag</h2>
        <p className="mt-2 text-[var(--muted)]">
          Eredivisie Champ gebruikt lokale opslag in je browser om instellingen, taalvoorkeur en je meest recente run te bewaren. Deze gegevens blijven op je eigen apparaat staan.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">Geen accounts</h2>
        <p className="mt-2 text-[var(--muted)]">
          De app vraagt geen accountregistratie en verwerkt geen profielgegevens zoals naam, wachtwoord of gebruikersprofiel binnen de game zelf.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">Contactgegevens</h2>
        <p className="mt-2 text-[var(--muted)]">
          Als je contact opneemt per e-mail, worden de gegevens die je zelf meestuurt alleen gebruikt om je bericht te behandelen en eventueel te beantwoorden.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">Wijzigingen</h2>
        <p className="mt-2 text-[var(--muted)]">
          Dit privacybeleid kan worden aangepast wanneer de werking van de app verandert. De meest recente versie staat altijd op deze pagina.
        </p>
      </section>
    </StaticPageShell>
  );
}

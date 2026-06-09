import type { Metadata } from "next";
import { StaticPageShell } from "@/components/StaticPageShell";

export const metadata: Metadata = {
  title: "Contact | Eredivisie Champ",
  description: "Contactinformatie voor Eredivisie Champ.",
};

export default function ContactPage() {
  return (
    <StaticPageShell
      title="Contact"
      intro="Voor vragen, feedback of meldingen over de app kun je contact opnemen via de onderstaande kanalen."
    >
      <section>
        <h2 className="text-2xl font-semibold text-white">Algemeen</h2>
        <p className="mt-2 text-[var(--muted)]">
          Stuur een bericht naar{" "}
          <a className="text-[var(--gold-soft)] hover:text-white" href="mailto:voetbaldraft@gmail.com">
            voetbaldraft@gmail.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">Support</h2>
        <p className="mt-2 text-[var(--muted)]">
          Wil je het project steunen, dan kan dat ook via{" "}
          <a
            className="text-[var(--gold-soft)] hover:text-white"
            href="https://ko-fi.com/joopkarnemelk"
            target="_blank"
            rel="noreferrer"
          >
            Ko-fi
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">Feedback en bugs</h2>
        <p className="mt-2 text-[var(--muted)]">
          Zie je een fout in spelersdata, een UI-probleem of gek gedrag in de app, mail dan liefst met een korte beschrijving van wat je deed en wat er misging.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white">Reactietijd</h2>
        <p className="mt-2 text-[var(--muted)]">
          We proberen berichten zo snel mogelijk te beantwoorden, maar kunnen geen vaste reactietermijn garanderen.
        </p>
      </section>
    </StaticPageShell>
  );
}

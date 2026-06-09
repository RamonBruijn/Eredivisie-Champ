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
          Wil je het project steunen, dan kan dat via de knop hieronder.
        </p>
        <a
          className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(228,197,106,0.35)] bg-[linear-gradient(135deg,rgba(228,197,106,0.18),rgba(255,255,255,0.06))] px-5 py-3 text-sm font-semibold text-[var(--gold-soft)] shadow-[0_12px_32px_rgba(0,0,0,0.22)] transition hover:border-[rgba(228,197,106,0.55)] hover:text-white"
          href="https://ko-fi.com/joopkarnemelk"
          target="_blank"
          rel="noreferrer"
        >
          Support via Ko-fi
        </a>
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

"use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { teams } from "@/data";
import { FORMATIONS } from "@/lib/formations";
import { useI18n } from "@/lib/i18n";
import { saveDraftSetup, saveSelection } from "@/lib/storage";
import type { DraftSetup, FormationId, GameMode, TeamRecord } from "@/types/game";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function getTeamDecade(team: TeamRecord) {
  const startYear = Number.parseInt(team.season.slice(0, 4), 10);
  const decadeStart = Math.floor(startYear / 10) * 10;
  return `${decadeStart}s`;
}

const faqItems = {
  nl: [
    {
      question: "Wat is Voetbaldraft?",
      answer:
        "Voetbaldraft is een gratis browsergame waarin je historische Eredivisie-spelers draft, een elftal samenstelt en daarna een volledig seizoen simuleert.",
    },
    {
      question: "Hoe werkt de draft?",
      answer:
        "Je kiest eerst je modus en formatie, selecteert daarna spelers per positie uit historische teams en laat vervolgens je seizoen simuleren.",
    },
    {
      question: "Kan ik 34-0-0 halen?",
      answer:
        "Ja, maar dat moet zeldzaam blijven. Je hebt een sterke selectie, goede balans tussen linies en ook een beetje geluk nodig.",
    },
    {
      question: "Welke clubs zitten erin?",
      answer:
        "De database groeit door en bevat historische teams van clubs zoals Ajax, PSV, Feyenoord, AZ, FC Twente, NEC, FC Groningen en meer.",
    },
    {
      question: "Is Voetbaldraft officieel verbonden aan de Eredivisie?",
      answer:
        "Voetbaldraft.app is een onafhankelijk fanproject en is niet gelieerd aan, goedgekeurd door of verbonden met voetbalclubs, spelers, de KNVB of Eredivisie CV.",
    },
  ],
  en: [
    {
      question: "What is Voetbaldraft?",
      answer:
        "Voetbaldraft is a free browser game where you draft historical Eredivisie players, build an XI, and simulate a full season.",
    },
    {
      question: "How does the draft work?",
      answer:
        "You pick your mode and formation, select players position by position from historical teams, and then simulate the season.",
    },
    {
      question: "Can I go 34-0-0?",
      answer:
        "Yes, but it should stay rare. You need top players, balance across the pitch, and a bit of luck.",
    },
    {
      question: "Which clubs are included?",
      answer:
        "The database keeps growing and includes historical teams from clubs such as Ajax, PSV, Feyenoord, AZ, FC Twente, NEC, FC Groningen, and more.",
    },
    {
      question: "Is Voetbaldraft officially connected to the Eredivisie?",
      answer:
        "Voetbaldraft.app is an independent fan project and is not affiliated with, endorsed by, or connected to football clubs, players, the KNVB, or Eredivisie CV.",
    },
  ],
} as const;

export function HomePageClient() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const availableDecades = useMemo(
    () => [...new Set(teams.map(getTeamDecade))].sort((a, b) => a.localeCompare(b)),
    [],
  );
  const [mode, setMode] = useState<GameMode>("classic");
  const [formation, setFormation] = useState<FormationId>("4-3-3");
  const [selectedDecades, setSelectedDecades] = useState<string[]>(availableDecades);

  function handleToggleDecade(decade: string) {
    setSelectedDecades((current) => {
      const next = current.includes(decade)
        ? current.filter((entry) => entry !== decade)
        : [...current, decade].sort((a, b) => a.localeCompare(b));

      return next.length > 0 ? next : current;
    });
  }

  function handlePlay() {
    const setup: DraftSetup = {
      mode,
      formation,
      decades: selectedDecades,
    };

    saveDraftSetup(setup);
    saveSelection(Array.from({ length: 11 }, () => null));
    router.push("/game");
  }

  const faq = faqItems[locale];

  return (
    <main className="page-shell">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-start px-4 py-5 sm:px-6 sm:py-8 md:justify-center md:py-16">
        <div className="glass rounded-[2rem] p-4 sm:p-8 md:rounded-[2.5rem] md:p-12">
          <div className="flex items-center justify-center md:justify-between">
            <p className="text-center text-[11px] uppercase tracking-[0.24em] text-[var(--gold-soft)] sm:text-sm sm:tracking-[0.28em] md:text-left">
              {t.home.eyebrow}
            </p>
            <LanguageToggle className="hidden md:inline-flex" />
          </div>

          <div className="mt-4 flex flex-col items-center text-center md:mt-5 md:flex-row md:items-center md:gap-5 md:text-left">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[rgba(228,197,106,0.26)] bg-[rgba(255,255,255,0.03)] p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.22)] sm:h-24 sm:w-24 md:h-20 md:w-20">
              <Image
                src="/voetbaldraft-logo.png"
                alt="VoetbalDraft logo"
                fill
                sizes="(max-width: 767px) 96px, 80px"
                className="object-contain p-1 opacity-90"
                priority
              />
            </div>
            <span className="mt-3 max-w-full text-3xl font-bold uppercase tracking-[0.12em] text-[var(--gold-soft)] sm:text-4xl md:mt-0 md:text-6xl md:tracking-[0.16em]">
              VoetbalDraft
            </span>
          </div>

          <h1 className="mt-3 max-w-3xl text-balance text-center text-[1.9rem] font-bold leading-[1.04] text-white sm:text-4xl md:mt-4 md:text-left md:text-5xl">
            {t.home.title}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[0.95rem] leading-6 text-[var(--muted)] md:mx-0 md:mt-6 md:text-left md:text-lg md:leading-7">
            {locale === "nl"
              ? "Kies je instelling en start het spel met jouw gekozen opstelling en of je de spelersratings kan zien of juist niet."
              : "Choose your setup and start the game with your selected formation and whether you want to see player ratings or not."}
          </p>
          <div className="mt-4 flex justify-center md:hidden">
            <LanguageToggle compact />
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[1.75rem] border border-[var(--line)] bg-[rgba(255,255,255,0.03)] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
                {locale === "nl" ? "Bouw je kampioensteam" : "Build your title team"}
              </p>
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                    {locale === "nl" ? "Modus" : "Mode"}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMode("classic")}
                      className={`rounded-[1.2rem] border px-4 py-4 text-left transition ${
                        mode === "classic"
                          ? "border-[var(--gold)] bg-[rgba(217,185,110,0.12)]"
                          : "border-[var(--line)] bg-[rgba(255,255,255,0.02)]"
                      }`}
                    >
                      <p className="font-semibold text-white">{locale === "nl" ? "Met rating" : t.common.withRating}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {locale === "nl" ? "Je ziet hoe goed spelers zijn" : "You can see how good players are"}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("from-memory")}
                      className={`rounded-[1.2rem] border px-4 py-4 text-left transition ${
                        mode === "from-memory"
                          ? "border-[var(--gold)] bg-[rgba(217,185,110,0.12)]"
                          : "border-[var(--line)] bg-[rgba(255,255,255,0.02)]"
                      }`}
                    >
                      <p className="font-semibold text-white">{locale === "nl" ? "Zonder rating" : "Without ratings"}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {locale === "nl" ? "Op eigen kennis en expertise." : "Based on your own knowledge and expertise."}
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                    {locale === "nl" ? "Formatie" : "Formation"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {FORMATIONS.map((formationOption) => (
                      <button
                        key={formationOption.id}
                        type="button"
                        onClick={() => setFormation(formationOption.id)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          formation === formationOption.id
                            ? "border-[var(--gold)] bg-[rgba(217,185,110,0.12)] text-[var(--gold-soft)]"
                            : "border-[var(--line)] text-[var(--muted)]"
                        }`}
                      >
                        {formationOption.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                      {locale === "nl" ? "Decennia" : "Decades"}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {selectedDecades.length}/{availableDecades.length}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {availableDecades.map((decade) => {
                      const active = selectedDecades.includes(decade);
                      return (
                        <button
                          key={decade}
                          type="button"
                          onClick={() => handleToggleDecade(decade)}
                          className={`rounded-full border px-4 py-2 text-sm transition ${
                            active
                              ? "border-[var(--gold)] bg-[rgba(217,185,110,0.12)] text-[var(--gold-soft)]"
                              : "border-[var(--line)] text-[var(--muted)]"
                          }`}
                        >
                          {decade}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-[rgba(228,197,106,0.18)] bg-[linear-gradient(180deg,rgba(74,54,156,0.18),rgba(17,23,57,0.24))] p-5 md:p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--gold-soft)]">
                {locale === "nl" ? "Klaar voor de draft?" : "Ready to draft?"}
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-white md:text-4xl">
                {locale === "nl" ? "Druk op play en bouw richting de titel." : "Hit play and draft your way to the title."}
              </h2>
              <div className="mt-6 grid gap-3 text-sm text-[var(--muted)]">
                <p>{locale === "nl" ? `Modus: ${mode === "classic" ? "met rating" : "zonder rating"}` : `Mode: ${mode === "classic" ? "with ratings" : "without ratings"}`}</p>
                <p>{locale === "nl" ? `Formatie: ${formation}` : `Formation: ${formation}`}</p>
                <p>{locale === "nl" ? `${selectedDecades.length} decennia actief` : `${selectedDecades.length} decades active`}</p>
              </div>
              <button
                type="button"
                onClick={handlePlay}
                className="mt-8 flex min-h-18 w-full items-center justify-center rounded-[1.6rem] bg-[linear-gradient(180deg,var(--gold-soft),var(--gold))] px-6 py-5 text-center text-2xl font-bold tracking-[0.08em] text-[#171b3a] shadow-[0_20px_48px_rgba(0,0,0,0.24)] transition hover:translate-y-[-1px] hover:brightness-105"
              >
                PLAY
              </button>
            </section>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <section className="rounded-[1.6rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--gold-soft)]">
                {locale === "nl" ? "Hoe werkt Voetbaldraft?" : "How does Voetbaldraft work?"}
              </p>
              <ol className="mt-4 grid gap-3 text-sm text-[var(--muted)] sm:text-[0.95rem]">
                <li>1. {locale === "nl" ? "Kies je modus en formatie." : "Pick your mode and formation."}</li>
                <li>2. {locale === "nl" ? "Draft spelers uit historische Eredivisie-teams." : "Draft players from historical Eredivisie teams."}</li>
                <li>3. {locale === "nl" ? "Bouw je XI positie voor positie." : "Build your XI position by position."}</li>
                <li>4. {locale === "nl" ? "Simuleer het seizoen en probeer 34-0-0 te gaan." : "Simulate the season and try to go 34-0-0."}</li>
              </ol>
            </section>

            <section className="rounded-[1.6rem] border border-[rgba(228,197,106,0.16)] bg-[linear-gradient(180deg,rgba(48,36,105,0.34),rgba(16,22,53,0.32))] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--gold-soft)]">
                {locale === "nl" ? "De 34-0-0 challenge" : "The 34-0-0 challenge"}
              </p>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)] sm:text-[0.95rem]">
                {locale === "nl"
                  ? "In Voetbaldraft is 34-0-0 het perfecte seizoen: 34 wedstrijden, 34 zeges, 0 gelijke spelen en 0 nederlagen. Dat moet uitzonderlijk voelen. De meeste runs eindigen ergens tussen degradatiestress, play-offs, Europees voetbal en kampioen."
                  : "In Voetbaldraft, 34-0-0 is the perfect season: 34 matches, 34 wins, 0 draws and 0 losses. It should feel rare. Most runs land somewhere between relegation stress, play-offs, European football, and winning the title."}
              </p>
            </section>
          </div>

          <section className="mt-8 rounded-[1.75rem] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(14,20,48,0.92),rgba(10,15,36,0.88))] p-5 md:p-6">
            <h2 className="text-2xl font-semibold text-white md:text-3xl">
              {locale === "nl" ? "Speel een historische Eredivisie draftgame" : "Play a historical Eredivisie draft game"}
            </h2>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--muted)] md:text-[1rem]">
              {locale === "nl"
                ? "Voetbaldraft.app is een gratis historische Eredivisie draftgame waarin je spelers draft, een ultieme XI bouwt en daarna een volledig seizoen simuleert. Je kiest zelf je formatie, bepaalt of je met of zonder zichtbare ratings speelt en mixt klassieke clubs en seizoenen tot jouw ideale elftal. Daardoor kun je voetbalnostalgie combineren met een moderne challenge: pak jij de schaal, blijf je ongeslagen of lukt zelfs een perfecte 34-0-0? In de database vind je teams van onder meer Ajax, PSV, Feyenoord, AZ, FC Twente, NEC en FC Groningen, naast nog veel meer bekende namen uit verschillende periodes. Alles werkt direct in de browser, zonder account en zonder betaalmuur. Voetbaldraft draait als onafhankelijk fanproject, bedoeld voor mensen die plezier halen uit Eredivisiegeschiedenis, slimme keuzes maken en net iets te lang nadenken over de perfecte spits voor hun droomteam. De game is niet officieel verbonden aan clubs, spelers, de KNVB of Eredivisie CV."
                : "Voetbaldraft.app is a free historical Eredivisie draft game where you draft players, build an ultimate XI, and then simulate a full season. Pick your formation, decide whether to play with visible ratings or on football knowledge alone, and mix classic clubs and seasons into your ideal side. That turns football nostalgia into a real challenge: can you lift the title, stay unbeaten, or even go a perfect 34-0-0? The database includes teams from Ajax, PSV, Feyenoord, AZ, FC Twente, NEC, FC Groningen, and more. Everything runs directly in the browser, with no account and no paywall. Voetbaldraft is an independent fan project for people who enjoy Eredivisie history, clever squad building, and arguing with themselves about the right striker for a dream team. The game is not officially connected to clubs, players, the KNVB, or Eredivisie CV."}
            </p>
          </section>

          <section className="mt-8 rounded-[1.75rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5 md:p-6">
            <h2 className="text-2xl font-semibold text-white md:text-3xl">FAQ</h2>
            <div className="mt-5 grid gap-3">
              {faq.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-[1.2rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(9,14,35,0.72)] px-4 py-3"
                >
                  <summary className="cursor-pointer list-none pr-6 text-sm font-semibold text-white marker:hidden">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-[rgba(255,255,255,0.08)] pt-5 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
            <Link href="/about" className="transition hover:text-white">
              About
            </Link>
            <Link href="/contact" className="transition hover:text-white">
              Contact
            </Link>
            <Link href="/privacybeleid" className="transition hover:text-white">
              Privacybeleid
            </Link>
            <Link href="/algemene-voorwaarden" className="transition hover:text-white">
              Algemene voorwaarden
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

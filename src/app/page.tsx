"use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { teams } from "@/data";
import { FORMATIONS } from "@/lib/formations";
import { saveDraftSetup, saveSelection } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";
import type { DraftSetup, FormationId, GameMode, TeamRecord } from "@/types/game";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function getTeamDecade(team: TeamRecord) {
  const startYear = Number.parseInt(team.season.slice(0, 4), 10);
  const decadeStart = Math.floor(startYear / 10) * 10;
  return `${decadeStart}s`;
}

export default function HomePage() {
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

  return (
    <main className="page-shell">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 md:py-16">
        <div className="glass rounded-[2rem] p-5 sm:p-8 md:rounded-[2.5rem] md:p-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--gold-soft)]">{t.home.eyebrow}</p>
            <LanguageToggle />
          </div>

          <div className="mt-5 flex items-center gap-4 sm:gap-5">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[rgba(228,197,106,0.26)] bg-[rgba(255,255,255,0.03)] p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.22)] sm:h-20 sm:w-20">
              <Image
                src="/voetbaldraft-logo.png"
                alt="VoetbalDraft logo"
                fill
                sizes="(max-width: 640px) 64px, 80px"
                className="object-contain p-1 opacity-90"
                priority
              />
            </div>
            <span className="text-4xl font-bold uppercase tracking-[0.16em] text-[var(--gold-soft)] sm:text-6xl">
              VoetbalDraft
            </span>
          </div>

          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-bold leading-[1.02] text-white sm:text-4xl md:text-5xl">
            {t.home.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] md:mt-6 md:text-lg">
            {locale === "nl"
              ? "Kies je draftinstellingen en druk op play. Daarna begint direct de echte draftflow."
              : "Choose your draft settings and hit play. Then the real draft starts immediately."}
          </p>

          <div className="mt-8 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
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
                      <p className="font-semibold text-white">{t.common.withRating}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {locale === "nl" ? "Ratings zichtbaar" : "Ratings visible"}
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
                      <p className="font-semibold text-white">{t.common.fromMemory}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {locale === "nl" ? "Alleen uit gevoel" : "Memory only"}
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
                <p>{locale === "nl" ? `Modus: ${mode === "classic" ? "met rating" : "uit het hoofd"}` : `Mode: ${mode === "classic" ? "with ratings" : "from memory"}`}</p>
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

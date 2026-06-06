"use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { ResultCard } from "@/components/ResultCard";
import { useI18n } from "@/lib/i18n";
import { loadResult } from "@/lib/storage";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { LeagueTableEntry, MatchResult, SeasonSummary } from "@/types/game";

export default function ResultPage() {
  const { locale, t } = useI18n();
  const [result, setResult] = useState<SeasonSummary | null>(null);
  const [matchCursor, setMatchCursor] = useState(0);
  const [secondHalfStarted, setSecondHalfStarted] = useState(false);

  useEffect(() => {
    setResult(loadResult());
  }, []);

  useEffect(() => {
    setMatchCursor(0);
    setSecondHalfStarted(false);
  }, [result]);

  useEffect(() => {
    if (!result || result.context.simulationMode !== "auto") return;
    const firstHalfDone = matchCursor >= 17;
    const shouldRun =
      (matchCursor < 17 && !secondHalfStarted) || (secondHalfStarted && matchCursor < result.matches.length);

    if (!shouldRun || (firstHalfDone && !secondHalfStarted)) return;

    const timer = window.setTimeout(() => {
      setMatchCursor((current) => Math.min(current + 1, result.matches.length));
    }, 1765);

    return () => window.clearTimeout(timer);
  }, [matchCursor, result, secondHalfStarted]);

  const currentMatch = result && matchCursor > 0 ? result.matches[matchCursor - 1] : null;
  const currentSnapshot = result && matchCursor > 0 ? result.snapshots[matchCursor - 1] : null;
  const seasonFinished = !!result && matchCursor >= result.matches.length;
  const currentScorers = matchCursor > 0 ? currentSnapshot?.teamScorers ?? [] : [];
  const finalStandings = result?.snapshots[result.snapshots.length - 1]?.standings ?? [];
  const finalScorers = result?.snapshots[result.snapshots.length - 1]?.teamScorers ?? [];
  const liveSummary = useMemo(
    () => (result ? createLiveSummary(result.matches.slice(0, matchCursor)) : null),
    [matchCursor, result],
  );
  const halftimeStandings = result?.snapshots[16]?.standings ?? [];
  const showHalftimeTable = matchCursor === 17 && !seasonFinished;
  const playedMatches = useMemo(
    () => (result ? [...result.matches.slice(0, matchCursor)].reverse() : []),
    [matchCursor, result],
  );

  function handleNextMatch() {
    if (!result) return;
    setMatchCursor((current) => Math.min(current + 1, result.matches.length));
  }

  function handleStartSecondHalf() {
    setSecondHalfStarted(true);
  }

  return (
    <main className="page-shell mx-auto max-w-6xl px-4 py-8 md:px-6">
      <div className="mb-6 flex justify-end">
        <LanguageToggle />
      </div>
      {result ? (
        <>
          {seasonFinished ? (
            <ResultCard result={result} />
          ) : (
            <section className="glass rounded-[2rem] p-6 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">
                    {locale === "nl" ? "Seizoen live" : "Season live"}
                  </p>
                  <h1 className="mt-2 text-4xl font-bold text-white">
                    {liveSummary?.wins ?? 0}-{liveSummary?.draws ?? 0}-{liveSummary?.losses ?? 0}
                  </h1>
                  <p className="mt-2 text-sm text-[var(--gold-soft)]">
                    {result.context.formation} • {matchCursor}/34
                  </p>
                  <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
                    {locale === "nl"
                      ? "De eindkaart blijft verborgen tot je het hele seizoen hebt uitgespeeld."
                      : "The final recap stays hidden until you finish the full season."}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <StatCard
                  label={locale === "nl" ? "Punten" : "Points"}
                  value={liveSummary?.points ?? 0}
                />
                <StatCard
                  label={locale === "nl" ? "Doelpunten voor" : "Goals for"}
                  value={liveSummary?.goalsFor ?? 0}
                />
                <StatCard
                  label={locale === "nl" ? "Doelpunten tegen" : "Goals against"}
                  value={liveSummary?.goalsAgainst ?? 0}
                />
                <StatCard
                  label={locale === "nl" ? "Doelsaldo" : "Goal difference"}
                  value={(liveSummary?.goalsFor ?? 0) - (liveSummary?.goalsAgainst ?? 0)}
                />
              </div>
            </section>
          )}
          <section className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="order-2 space-y-6 xl:order-1">
              <section className="glass rounded-[2rem] p-5 md:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
                      {locale === "nl" ? "Simulatiemodus" : "Simulation mode"}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      {result.context.simulationMode === "auto"
                        ? locale === "nl"
                          ? "Automatisch seizoen"
                          : "Automatic season"
                        : locale === "nl"
                          ? "Handmatig seizoen"
                          : "Manual season"}
                    </h2>
                  </div>
                  <div className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--gold-soft)]">
                    {matchCursor}/34
                  </div>
                </div>

                {result.context.simulationMode === "manual" ? (
                  <button
                    type="button"
                    onClick={handleNextMatch}
                    disabled={matchCursor >= result.matches.length}
                    className="mt-5 rounded-full bg-[var(--gold)] px-5 py-3 font-semibold text-[#171b3a] disabled:opacity-50"
                  >
                    {locale === "nl" ? "Volgende wedstrijd" : "Next match"}
                  </button>
                ) : (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <div className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)]">
                      {matchCursor < 17
                        ? locale === "nl"
                          ? "Eerste seizoenshelft loopt"
                          : "First half running"
                        : secondHalfStarted
                          ? locale === "nl"
                            ? "Tweede seizoenshelft loopt"
                            : "Second half running"
                          : locale === "nl"
                            ? "Klik om helft twee te starten"
                            : "Click to start the second half"}
                    </div>
                    {matchCursor >= 17 && !secondHalfStarted && matchCursor < result.matches.length ? (
                      <button
                        type="button"
                        onClick={handleStartSecondHalf}
                        className="rounded-full bg-[var(--gold)] px-5 py-3 font-semibold text-[#171b3a]"
                      >
                        {locale === "nl" ? "Start tweede seizoenshelft" : "Start second half"}
                      </button>
                    ) : null}
                  </div>
                )}
              </section>

              <section className="glass rounded-[2rem] p-5 md:p-6">
                {currentMatch ? (
                  <>
                    <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
                      {t.result.matchday(currentMatch.matchNumber)}
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-white">
                      {currentMatch.venue === "home"
                        ? locale === "nl"
                          ? `Thuis vs ${currentMatch.opponent.name}`
                          : `Home vs ${currentMatch.opponent.name}`
                        : locale === "nl"
                          ? `Uit bij ${currentMatch.opponent.name}`
                          : `Away at ${currentMatch.opponent.name}`}
                    </h2>
                    <p className="mt-4 text-6xl font-bold text-[var(--gold-soft)]">
                      {currentMatch.goalsFor}-{currentMatch.goalsAgainst}
                    </p>
                    <div className="mt-4 rounded-3xl border border-[var(--line)] p-4">
                      <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">{t.result.scorers}</p>
                      <GoalEvents match={currentMatch} locale={locale} />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
                      {locale === "nl" ? "Seizoensstart" : "Season start"}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      {locale === "nl"
                        ? "Start de simulatie om de eerste wedstrijd te zien."
                        : "Start the simulation to reveal the first match."}
                    </h2>
                  </>
                )}
              </section>
            </div>

            <div className="order-1 space-y-6 xl:order-2">
              <section className="glass rounded-[2rem] p-5 md:hidden">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-white">
                    {locale === "nl" ? "Wedstrijdfeed" : "Match feed"}
                  </h2>
                  <p className="text-sm text-[var(--muted)]">
                    {locale === "nl" ? "Gespeeld" : "Played"} {matchCursor}/34
                  </p>
                </div>
                <div className="mt-4 space-y-3">
                  {playedMatches.length > 0 ? (
                    playedMatches.map((match, index) => (
                      <article
                        key={`mobile-${match.round}-${match.opponent.id}-${match.venue}`}
                        className={`match-feed-card relative overflow-hidden rounded-[1.5rem] border p-4 transition ${
                          index === 0
                            ? "border-[rgba(228,197,106,0.32)] bg-[linear-gradient(180deg,rgba(228,197,106,0.1),rgba(255,255,255,0.04))] shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
                            : "border-[var(--line)] bg-[rgba(255,255,255,0.03)] opacity-95"
                        }`}
                      >
                        <div className="absolute left-5 top-0 h-full w-px bg-[linear-gradient(180deg,rgba(228,197,106,0.26),rgba(255,255,255,0.06))]" />
                        <div className="relative pl-5">
                          <div className="absolute left-[-0.12rem] top-1.5 h-3.5 w-3.5 rounded-full border border-[rgba(245,228,166,0.5)] bg-[var(--gold-soft)] shadow-[0_0_0_4px_rgba(245,228,166,0.12)]" />
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                                {t.result.matchday(match.matchNumber)}
                              </p>
                              <h3 className="mt-1 text-lg font-semibold text-white">
                                {match.venue === "home"
                                  ? locale === "nl"
                                    ? `Thuis vs ${match.opponent.name}`
                                    : `Home vs ${match.opponent.name}`
                                  : locale === "nl"
                                    ? `Uit bij ${match.opponent.name}`
                                    : `Away at ${match.opponent.name}`}
                              </h3>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                match.result === "W"
                                  ? "bg-[rgba(68,201,128,0.18)] text-[#8ff0b5]"
                                  : match.result === "D"
                                    ? "bg-[rgba(245,228,166,0.14)] text-[var(--gold-soft)]"
                                    : "bg-[rgba(217,93,57,0.16)] text-[#ffb09a]"
                              }`}>
                                {match.result}
                              </span>
                              <p className="mt-2 text-3xl font-bold text-white">
                                {match.goalsFor}-{match.goalsAgainst}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <GoalEvents match={match} locale={locale} />
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-4 text-sm text-[var(--muted)]">
                      {locale === "nl"
                        ? "Nog geen gespeelde wedstrijden in de feed."
                        : "No played matches in the feed yet."}
                    </div>
                  )}
                </div>
              </section>

              {showHalftimeTable ? (
                <section className="glass rounded-[2rem] p-5 md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-white">
                      {locale === "nl" ? "Tussenstand na 17" : "Table after 17"}
                    </h2>
                    <p className="text-sm text-[var(--gold-soft)]">
                      {locale === "nl" ? "Halverwege" : "Halfway"}
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    {halftimeStandings.map((entry, index) => (
                      <HalftimeRow key={entry.teamId} entry={entry} index={index} locale={locale} />
                    ))}
                  </div>
                </section>
              ) : null}

              {seasonFinished ? (
                <section className="glass rounded-[2rem] p-5 md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-white">
                      {locale === "nl" ? "Eindstand" : "Final table"}
                    </h2>
                    <p className="text-sm text-[var(--gold-soft)]">
                      {locale === "nl" ? "Na 34" : "After 34"}
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    {finalStandings.map((entry, index) => (
                      <HalftimeRow key={entry.teamId} entry={entry} index={index} locale={locale} />
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="hidden rounded-[2rem] p-5 md:block md:glass md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-white">
                    {locale === "nl" ? "Wedstrijdfeed" : "Match feed"}
                  </h2>
                  <p className="text-sm text-[var(--muted)]">
                    {locale === "nl" ? "Gespeeld" : "Played"} {matchCursor}/34
                  </p>
                </div>
                <div className="mt-4 space-y-3">
                  {playedMatches.length > 0 ? (
                    playedMatches.map((match, index) => (
                      <article
                        key={`${match.round}-${match.opponent.id}-${match.venue}`}
                        className={`match-feed-card relative overflow-hidden rounded-[1.5rem] border p-4 transition ${
                          index === 0
                            ? "border-[rgba(228,197,106,0.32)] bg-[linear-gradient(180deg,rgba(228,197,106,0.1),rgba(255,255,255,0.04))] shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
                            : "border-[var(--line)] bg-[rgba(255,255,255,0.03)] opacity-95"
                        }`}
                      >
                        <div className="absolute left-5 top-0 h-full w-px bg-[linear-gradient(180deg,rgba(228,197,106,0.26),rgba(255,255,255,0.06))]" />
                        <div className="relative pl-5">
                          <div className="absolute left-[-0.12rem] top-1.5 h-3.5 w-3.5 rounded-full border border-[rgba(245,228,166,0.5)] bg-[var(--gold-soft)] shadow-[0_0_0_4px_rgba(245,228,166,0.12)]" />
                          <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                              {t.result.matchday(match.matchNumber)}
                            </p>
                            <h3 className="mt-1 text-lg font-semibold text-white">
                              {match.venue === "home"
                                ? locale === "nl"
                                  ? `Thuis vs ${match.opponent.name}`
                                  : `Home vs ${match.opponent.name}`
                                : locale === "nl"
                                  ? `Uit bij ${match.opponent.name}`
                                  : `Away at ${match.opponent.name}`}
                            </h3>
                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                              {match.venue === "home"
                                ? locale === "nl"
                                  ? "Thuiswedstrijd"
                                  : "Home fixture"
                                : locale === "nl"
                                  ? "Uitwedstrijd"
                                  : "Away fixture"}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              match.result === "W"
                                ? "bg-[rgba(68,201,128,0.18)] text-[#8ff0b5]"
                                : match.result === "D"
                                  ? "bg-[rgba(245,228,166,0.14)] text-[var(--gold-soft)]"
                                  : "bg-[rgba(217,93,57,0.16)] text-[#ffb09a]"
                            }`}>
                              {match.result}
                            </span>
                            <p className="mt-2 text-3xl font-bold text-white">
                              {match.goalsFor}-{match.goalsAgainst}
                            </p>
                          </div>
                        </div>
                          <div className="mt-3">
                            <GoalEvents match={match} locale={locale} />
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-4 text-sm text-[var(--muted)]">
                      {locale === "nl"
                        ? "Nog geen gespeelde wedstrijden in de feed."
                        : "No played matches in the feed yet."}
                    </div>
                  )}
                </div>
              </section>

              <section className="glass rounded-[2rem] p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-white">
                    {seasonFinished
                      ? locale === "nl"
                        ? "Topscorers einde seizoen"
                        : "End-of-season top scorers"
                      : locale === "nl"
                        ? "Topscorers van jouw XI"
                        : "Top scorers from your XI"}
                  </h2>
                </div>
                <div className="mt-4 space-y-2">
                  {(seasonFinished ? finalScorers : currentScorers).length > 0 ? (
                    (seasonFinished ? finalScorers : currentScorers).map((entry, index) => (
                      <div
                        key={entry.playerName}
                        className="grid grid-cols-[2rem_1fr_3rem] items-center gap-2 rounded-2xl bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm"
                      >
                        <span className="text-[var(--muted)]">{index + 1}</span>
                        <span className="text-white">{entry.playerName}</span>
                        <span className="font-semibold text-[var(--gold-soft)]">{entry.goals}</span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-4 text-sm text-[var(--muted)]">
                      {seasonFinished
                        ? locale === "nl"
                          ? "Geen topscorerslijst beschikbaar."
                          : "No season scorers list available."
                        : locale === "nl"
                          ? "Nog geen doelpuntenmakers zichtbaar."
                          : "No scorers on the board yet."}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </section>
        </>
      ) : (
        <section className="glass rounded-[2rem] p-8">
          <h1 className="text-3xl font-semibold text-white">{t.result.noRun}</h1>
          <p className="mt-3 text-[var(--muted)]">
            {t.result.noRunBody}
          </p>
        </section>
      )}

      <div className="mt-6">
        <Link
          href="/game"
          className="rounded-full border border-[rgba(217,185,110,0.45)] px-5 py-3 text-sm text-[var(--gold-soft)] hover:bg-[rgba(217,185,110,0.1)]"
        >
          {t.result.backToBuilder}
        </Link>
      </div>
    </main>
  );
}

function GoalEvents({
  match,
  locale,
}: {
  match: MatchResult;
  locale: "nl" | "en";
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8ff0b5]">
          {locale === "nl" ? "Onze goals" : "Our goals"}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(match.scorers.length ? match.scorers : [locale === "nl" ? "Geen" : "None"]).map((scorer, index) => (
            <span
              key={`for-${match.matchNumber}-${scorer}-${index}`}
              className="rounded-full border border-[rgba(68,201,128,0.32)] bg-[rgba(68,201,128,0.12)] px-3 py-1 text-xs text-[#b8ffd2]"
            >
              {"⚽ "}
              {scorer}
            </span>
          ))}
        </div>
      </div>

      {match.goalsAgainst > 0 ? (
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#ffb09a]">
            {locale === "nl" ? "Tegengoals" : "Goals conceded"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(match.concededScorers.length ? match.concededScorers : [locale === "nl" ? "Onbekend" : "Unknown"]).map((scorer, index) => (
              <span
                key={`against-${match.matchNumber}-${scorer}-${index}`}
                className="rounded-full border border-[rgba(217,93,57,0.32)] bg-[rgba(217,93,57,0.12)] px-3 py-1 text-xs text-[#ffd0c3]"
              >
                {"⚽ "}
                {scorer}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function createLiveSummary(matches: MatchResult[]) {
  const wins = matches.filter((match) => match.result === "W").length;
  const draws = matches.filter((match) => match.result === "D").length;
  const losses = matches.length - wins - draws;
  const goalsFor = matches.reduce((sum, match) => sum + match.goalsFor, 0);
  const goalsAgainst = matches.reduce((sum, match) => sum + match.goalsAgainst, 0);
  const points = wins * 3 + draws;

  return {
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    points,
  };
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-[var(--line)] p-4">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function HalftimeRow({
  entry,
  index,
  locale,
}: {
  entry: LeagueTableEntry;
  index: number;
  locale: "nl" | "en";
}) {
  const isUser = entry.teamId === "user-xi";

  return (
    <div
      className={`grid grid-cols-[2rem_1fr_2.2rem_2.4rem_2.6rem] items-center gap-2 rounded-2xl px-3 py-2 text-sm ${
        isUser ? "bg-[rgba(228,197,106,0.12)]" : "bg-[rgba(255,255,255,0.03)]"
      }`}
    >
      <span className="text-[var(--muted)]">{index + 1}</span>
      <span className={isUser ? "font-semibold text-white" : "text-white"}>
        {isUser ? (locale === "nl" ? "Jouw XI" : "Your XI") : entry.name}
      </span>
      <span className="text-[var(--muted)]">{entry.played}</span>
      <span className="text-[var(--muted)]">{entry.goalDifference}</span>
      <span className="font-semibold text-[var(--gold-soft)]">{entry.points}</span>
    </div>
  );
}

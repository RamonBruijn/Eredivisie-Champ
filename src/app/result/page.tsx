"use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { ResultCard } from "@/components/ResultCard";
import { SecondHalfAdGateModal } from "@/components/SecondHalfAdGateModal";
import { useI18n } from "@/lib/i18n";
import { loadResult, loadSeasonRunCount } from "@/lib/storage";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AutoSimulationSpeed, LeagueTableEntry, MatchResult, SeasonSummary } from "@/types/game";

const AUTO_SIMULATION_DELAYS: Record<AutoSimulationSpeed, number> = {
  slow: 2400,
  normal: 1765,
  fast: 950,
};

export default function ResultPage() {
  const { locale, t } = useI18n();
  const [result, setResult] = useState<SeasonSummary | null>(null);
  const [matchCursor, setMatchCursor] = useState(0);
  const [secondHalfStarted, setSecondHalfStarted] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const [autoSimulationSpeed, setAutoSimulationSpeed] = useState<AutoSimulationSpeed>("normal");
  const [seasonRunCount, setSeasonRunCount] = useState(0);
  const [isSecondHalfAdGateOpen, setIsSecondHalfAdGateOpen] = useState(false);
  const [isSecondHalfGatePending, setIsSecondHalfGatePending] = useState(false);
  const secondHalfAdGateResolverRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setResult(loadResult());
    setSeasonRunCount(loadSeasonRunCount());
  }, []);

  useEffect(() => {
    setMatchCursor(0);
    setSecondHalfStarted(false);
    setAutoPaused(false);
    setAutoSimulationSpeed(result?.context.autoSimulationSpeed ?? "normal");
  }, [result]);

  useEffect(() => {
    if (!result || result.context.simulationMode !== "auto") return;
    const firstHalfDone = matchCursor >= 17;
    const shouldRun =
      (matchCursor < 17 && !secondHalfStarted) || (secondHalfStarted && matchCursor < result.matches.length);

    if (!shouldRun || (firstHalfDone && !secondHalfStarted) || autoPaused) return;

    const timer = window.setTimeout(() => {
      setMatchCursor((current) => Math.min(current + 1, result.matches.length));
    }, AUTO_SIMULATION_DELAYS[autoSimulationSpeed]);

    return () => window.clearTimeout(timer);
  }, [autoPaused, autoSimulationSpeed, matchCursor, result, secondHalfStarted]);

  const currentMatch = result && matchCursor > 0 ? result.matches[matchCursor - 1] : null;
  const upcomingMatch = result && matchCursor < result.matches.length ? result.matches[matchCursor] : null;
  const currentSnapshot = result && matchCursor > 0 ? result.snapshots[matchCursor - 1] : null;
  const seasonFinished = !!result && matchCursor >= result.matches.length;
  const currentScorers = matchCursor > 0 ? currentSnapshot?.teamScorers ?? [] : [];
  const finalStandings = result?.snapshots[result.snapshots.length - 1]?.standings ?? [];
  const finalScorers = result?.snapshots[result.snapshots.length - 1]?.teamScorers ?? [];
  const isChampion = finalStandings[0]?.teamId === "user-xi";
  const finalPlacement = finalStandings.findIndex((entry) => entry.teamId === "user-xi");
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
  const mobileStatusLabel = seasonFinished
    ? locale === "nl"
      ? "Seizoen klaar"
      : "Season complete"
    : result?.context.simulationMode === "manual"
      ? locale === "nl"
        ? "Handmatig"
        : "Manual"
      : matchCursor < 17
        ? locale === "nl"
          ? "Helft 1 loopt"
          : "First half live"
        : secondHalfStarted
          ? locale === "nl"
            ? "Helft 2 loopt"
            : "Second half live"
          : locale === "nl"
            ? "Klaar voor helft 2"
            : "Ready for half two";

  function handleNextMatch() {
    if (!result) return;
    setMatchCursor((current) => Math.min(current + 1, result.matches.length));
  }

  function startSecondHalfSimulation() {
    setSecondHalfStarted(true);
    setAutoPaused(false);
  }

  function shouldShowSecondHalfAdGate() {
    return seasonRunCount >= 2;
  }

  function resolveSecondHalfAdGate() {
    const resolver = secondHalfAdGateResolverRef.current;
    secondHalfAdGateResolverRef.current = null;
    setIsSecondHalfAdGateOpen(false);
    resolver?.();
  }

  function showSecondHalfAdGate() {
    return new Promise<void>((resolve) => {
      secondHalfAdGateResolverRef.current = resolve;
      setIsSecondHalfAdGateOpen(true);
    });
  }

  async function handleStartSecondHalf() {
    if (secondHalfStarted || isSecondHalfGatePending) return;

    setIsSecondHalfGatePending(true);

    try {
      if (shouldShowSecondHalfAdGate()) {
        await showSecondHalfAdGate();
      }
    } catch {
      // If a future ad provider fails, the second half should still continue.
    } finally {
      setIsSecondHalfGatePending(false);
    }

    startSecondHalfSimulation();
  }

  function handleToggleAutoPause() {
    setAutoPaused((current) => !current);
  }

  const autoSpeedButtons: Array<{ value: AutoSimulationSpeed; label: string }> = [
    { value: "slow", label: locale === "nl" ? "Rustig" : "Slow" },
    { value: "normal", label: locale === "nl" ? "Normaal" : "Normal" },
    { value: "fast", label: locale === "nl" ? "Snel" : "Fast" },
  ];

  return (
    <main className="page-shell mx-auto max-w-6xl px-4 py-8 md:px-6">
      <div className="mb-6 flex justify-end">
        <LanguageToggle />
      </div>
      {result ? (
        <>
          {seasonFinished ? (
            <>
              <div className="mb-4 flex justify-center md:mb-5 md:justify-start">
                <Link
                  href="/"
                  className="inline-flex min-h-12 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(180deg,var(--gold-soft),var(--gold))] px-5 py-3 text-sm font-bold text-[#171b3a] shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition hover:translate-y-[-1px] hover:brightness-105"
                >
                  {t.result.playAgain}
                </Link>
              </div>
              <ResultCard result={result} isChampion={isChampion} finalPlacement={finalPlacement >= 0 ? finalPlacement + 1 : undefined} />
            </>
          ) : showHalftimeTable ? (
            <section className="hidden glass rounded-[2rem] p-5 md:block md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">
                    {locale === "nl" ? "Tussenstand" : "Mid-season table"}
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
                    {locale === "nl" ? "Na 17 speelrondes" : "After 17 matchdays"}
                  </h1>
                </div>
                <p className="rounded-full border border-[rgba(228,197,106,0.25)] bg-[rgba(228,197,106,0.08)] px-4 py-2 text-sm text-[var(--gold-soft)]">
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
            <section className="mt-6 grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
              <section id="final-standings" className="glass rounded-[2rem] p-5 md:p-6">
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

              <section id="topscorers" className="glass rounded-[2rem] p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-white">
                    {locale === "nl" ? "Topscorers einde seizoen" : "End-of-season top scorers"}
                  </h2>
                </div>
                <div className="mt-4 space-y-2">
                  {finalScorers.length > 0 ? (
                    finalScorers.map((entry, index) => (
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
                      {locale === "nl"
                        ? "Geen topscorerslijst beschikbaar."
                        : "No season scorers list available."}
                    </div>
                  )}
                </div>
              </section>
            </section>
          ) : null}
          <section className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="order-2 space-y-6 xl:order-1">
              <section className="hidden glass rounded-[2rem] p-5 md:block md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-white">
                    {locale === "nl" ? "Wedstrijdfeed" : "Match feed"}
                  </h2>
                  <div className="flex items-center gap-2">
                    {result.context.simulationMode === "auto" && matchCursor < result.matches.length ? (
                      <button
                        type="button"
                        onClick={handleToggleAutoPause}
                        className="rounded-full border border-[rgba(228,197,106,0.28)] bg-[rgba(228,197,106,0.08)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]"
                      >
                        {autoPaused
                          ? locale === "nl"
                            ? "Play"
                            : "Play"
                          : locale === "nl"
                            ? "Pauze"
                            : "Pause"}
                      </button>
                    ) : null}
                    <p className="text-sm text-[var(--muted)]">
                      {locale === "nl" ? "Gespeeld" : "Played"} {matchCursor}/34
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {playedMatches.length > 0 ? (
                    playedMatches.map((match, index) => (
                      <article
                        key={`desktop-${match.round}-${match.opponent.id}-${match.venue}`}
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

              <section className="hidden glass rounded-[2rem] p-5 md:block md:p-6">
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
                    <div className="flex flex-wrap gap-2">
                      {autoSpeedButtons.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setAutoSimulationSpeed(option.value)}
                          className={`rounded-full border px-4 py-2 text-sm transition ${
                            autoSimulationSpeed === option.value
                              ? "border-[var(--gold)] bg-[rgba(217,185,110,0.14)] text-[var(--gold-soft)]"
                              : "border-[var(--line)] text-[var(--muted)] hover:bg-[rgba(255,255,255,0.03)]"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    {matchCursor >= 17 && !secondHalfStarted && matchCursor < result.matches.length ? (
                      <button
                        type="button"
                        onClick={handleStartSecondHalf}
                        disabled={isSecondHalfGatePending}
                        className="rounded-full bg-[var(--gold)] px-5 py-3 font-semibold text-[#171b3a] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSecondHalfGatePending
                          ? locale === "nl"
                            ? "Advertentie laden..."
                            : "Loading ad..."
                          : locale === "nl"
                            ? "Start tweede seizoenshelft"
                            : "Start second half"}
                      </button>
                    ) : null}
                  </div>
                )}
              </section>

              <section className="hidden glass rounded-[2rem] p-5 md:block md:p-6">
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
                    {upcomingMatch ? (
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                        {locale === "nl"
                          ? `Volgende wedstrijd: ${upcomingMatch.venue === "home" ? "thuis vs" : "uit bij"} ${upcomingMatch.opponent.name}`
                          : `Next match: ${upcomingMatch.venue === "home" ? "home vs" : "away at"} ${upcomingMatch.opponent.name}`}
                      </p>
                    ) : null}
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
              {!seasonFinished ? (
                <section className="glass sticky top-3 z-20 rounded-[1.6rem] p-4 md:hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                        {locale === "nl" ? "Seizoen live" : "Season live"}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold leading-tight text-white">
                        {currentMatch
                          ? currentMatch.venue === "home"
                            ? locale === "nl"
                              ? `Thuis vs ${currentMatch.opponent.name}`
                              : `Home vs ${currentMatch.opponent.name}`
                            : locale === "nl"
                              ? `Uit bij ${currentMatch.opponent.name}`
                              : `Away at ${currentMatch.opponent.name}`
                          : locale === "nl"
                            ? "Klaar voor de aftrap"
                            : "Ready for kickoff"}
                      </h2>
                    </div>
                    <div className="rounded-full border border-[rgba(228,197,106,0.24)] bg-[rgba(228,197,106,0.08)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold-soft)]">
                      {matchCursor}/34
                    </div>
                  </div>

                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-[var(--muted)]">{mobileStatusLabel}</p>
                      <p className="mt-1 text-4xl font-bold leading-none text-white">
                        {currentMatch ? `${currentMatch.goalsFor}-${currentMatch.goalsAgainst}` : "0-0"}
                      </p>
                      {upcomingMatch ? (
                        <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                          {locale === "nl"
                            ? `Volgende: ${upcomingMatch.venue === "home" ? "thuis vs" : "uit bij"} ${upcomingMatch.opponent.name}`
                            : `Next: ${upcomingMatch.venue === "home" ? "home vs" : "away at"} ${upcomingMatch.opponent.name}`}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {result.context.simulationMode === "auto" ? (
                        <div className="flex flex-wrap justify-end gap-2">
                          {autoSpeedButtons.map((option) => (
                            <button
                              key={`mobile-${option.value}`}
                              type="button"
                              onClick={() => setAutoSimulationSpeed(option.value)}
                              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                                autoSimulationSpeed === option.value
                                  ? "border-[var(--gold)] bg-[rgba(217,185,110,0.14)] text-[var(--gold-soft)]"
                                  : "border-[var(--line)] text-[var(--muted)]"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      {result.context.simulationMode === "auto" && matchCursor < result.matches.length ? (
                        <button
                          type="button"
                          onClick={handleToggleAutoPause}
                          className="rounded-full border border-[rgba(228,197,106,0.28)] bg-[rgba(228,197,106,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]"
                        >
                          {autoPaused
                            ? locale === "nl"
                              ? "Play"
                              : "Play"
                            : locale === "nl"
                              ? "Pauze"
                              : "Pause"}
                        </button>
                      ) : null}
                      {result.context.simulationMode === "manual" ? (
                        <button
                          type="button"
                          onClick={handleNextMatch}
                          disabled={matchCursor >= result.matches.length}
                          className="rounded-full bg-[var(--gold)] px-4 py-2.5 text-sm font-semibold text-[#171b3a] disabled:opacity-50"
                        >
                          {locale === "nl" ? "Volgende" : "Next"}
                        </button>
                      ) : matchCursor >= 17 && !secondHalfStarted && matchCursor < result.matches.length ? (
                        <button
                          type="button"
                          onClick={handleStartSecondHalf}
                          disabled={isSecondHalfGatePending}
                          className="rounded-full bg-[var(--gold)] px-4 py-2.5 text-sm font-semibold text-[#171b3a] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSecondHalfGatePending
                            ? locale === "nl"
                              ? "Advertentie laden..."
                              : "Loading ad..."
                            : locale === "nl"
                              ? "Start helft 2"
                              : "Start half 2"}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {liveSummary ? (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      <MiniStat label="Pts" value={liveSummary.points} />
                      <MiniStat label="W-D-L" value={`${liveSummary.wins}-${liveSummary.draws}-${liveSummary.losses}`} />
                      <MiniStat label="GF" value={liveSummary.goalsFor} />
                      <MiniStat label="GA" value={liveSummary.goalsAgainst} />
                    </div>
                  ) : null}
                </section>
              ) : null}

              {showHalftimeTable ? (
                <section className="glass rounded-[2rem] p-4 md:hidden">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                        {locale === "nl" ? "Winterstop" : "Halfway point"}
                      </p>
                      <h2 className="mt-1 text-xl font-semibold text-white">
                        {locale === "nl" ? "Tussenstand na 17" : "Table after 17"}
                      </h2>
                    </div>
                    <p className="rounded-full border border-[rgba(228,197,106,0.22)] bg-[rgba(228,197,106,0.08)] px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-[var(--gold-soft)]">
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

              <section className="glass rounded-[1.8rem] p-4 md:hidden">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-white">
                    {locale === "nl" ? "Wedstrijdfeed" : "Match feed"}
                  </h2>
                  <div className="flex items-center gap-2">
                    {result.context.simulationMode === "auto" && matchCursor < result.matches.length ? (
                      <button
                        type="button"
                        onClick={handleToggleAutoPause}
                        className="rounded-full border border-[rgba(228,197,106,0.28)] bg-[rgba(228,197,106,0.08)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]"
                      >
                        {autoPaused
                          ? locale === "nl"
                            ? "Play"
                            : "Play"
                          : locale === "nl"
                            ? "Pauze"
                            : "Pause"}
                      </button>
                    ) : null}
                    <p className="text-sm text-[var(--muted)]">
                      {locale === "nl" ? "Gespeeld" : "Played"} {matchCursor}/34
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {playedMatches.length > 0 ? (
                    playedMatches.map((match, index) => (
                      <article
                        key={`mobile-${match.round}-${match.opponent.id}-${match.venue}`}
                        className={`match-feed-card relative overflow-hidden rounded-[1.35rem] border p-3.5 transition ${
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
                              <h3 className="mt-1 text-base font-semibold text-white">
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
                              <p className="mt-1.5 text-[1.7rem] font-bold leading-none text-white">
                                {match.goalsFor}-{match.goalsAgainst}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2.5">
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

              <section id="topscorers" className="glass rounded-[2rem] p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-white">
                    {locale === "nl" ? "Topscorers van jouw XI" : "Top scorers from your XI"}
                  </h2>
                </div>
                <div className="mt-4 space-y-2">
                  {currentScorers.length > 0 ? (
                    currentScorers.map((entry, index) => (
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
                      {locale === "nl"
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

      {isSecondHalfAdGateOpen ? (
        <SecondHalfAdGateModal locale={locale} onContinue={resolveSecondHalfAdGate} />
      ) : null}
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

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.035)] px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
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

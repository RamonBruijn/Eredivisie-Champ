"use client";

import { getFormation } from "@/lib/formations";
import { formatPositionLabel, localizedModeLabel, useI18n } from "@/lib/i18n";
import { loadSeasonRunCount, loadSelection } from "@/lib/storage";
import type { PlayerRecord, Position, SeasonSummary, TeamScorerEntry } from "@/types/game";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface ResultCardProps {
  result: SeasonSummary;
  isChampion?: boolean;
  finalPlacement?: number;
}

type BadgeTone = "king" | "invincible" | "champion" | "neutral" | "danger";

export function ResultCard({ result, isChampion = false, finalPlacement }: ResultCardProps) {
  const { locale } = useI18n();
  const [savedSelection, setSavedSelection] = useState<Array<PlayerRecord | null>>([]);
  const [seasonRunCount, setSeasonRunCount] = useState(0);

  useEffect(() => {
    setSavedSelection(loadSelection());
    setSeasonRunCount(loadSeasonRunCount());
  }, []);

  const formation = getFormation(result.context.formation);
  const topScorers = useMemo(() => createTopScorers(result), [result]);
  const badge = getPerformanceBadge({
    locale,
    finalPlacement,
    isChampion,
    wins: result.wins,
    draws: result.draws,
    losses: result.losses,
  });
  const placementLabel = getPlacementLabel(locale, finalPlacement, isChampion);
  const pointsLabel = `${result.points} ${locale === "nl" ? "punten" : "points"}`;
  const ovr = calculateAverageRating(savedSelection);
  const squadRows = formation.slots.map((slot, index) => ({
    slot,
    player: savedSelection[index] ?? null,
  }));
  const bestPlayerRecord = savedSelection.find((player) => player?.name === result.bestPlayer) ?? null;
  const bestPlayerGoals = topScorers.find((entry) => entry.playerName === result.bestPlayer)?.goals;
  const degradationNote =
    finalPlacement === 17 || finalPlacement === 18 ? "Op naar Oss, Helmond en Emmen!" : null;
  const runLabel =
    seasonRunCount > 0
      ? `${locale === "nl" ? "Run" : "Run"} ${seasonRunCount}`
      : locale === "nl"
        ? "Run onbekend"
        : "Run unknown";

  return (
    <section className="px-0">
      <div className="mx-auto max-w-[34rem]">
        <article
          id="result-card-share"
          className="relative overflow-hidden rounded-[2.25rem] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(8,12,31,0.98),rgba(13,18,45,0.97)_32%,rgba(16,22,53,0.97)_100%)] shadow-[0_30px_90px_rgba(0,0,0,0.34)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(122,92,255,0.28),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(228,197,106,0.16),transparent_24%),linear-gradient(180deg,transparent,rgba(6,10,26,0.16))]" />

          <div className="relative px-4 py-4 md:px-6 md:py-6">
            <BrandRow
              locale={locale}
              modeLabel={localizedModeLabel(locale, result.context.mode)}
              ovr={ovr}
            />

            <section className="mt-5 text-center">
              <p className="text-[3.7rem] font-black leading-none tracking-[-0.08em] text-white sm:text-[5rem]">
                {result.wins}-{result.draws}-{result.losses}
              </p>
              <p className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.36em] text-[var(--gold-soft)]">
                {locale === "nl" ? "Winst · Gelijk · Verlies" : "Win · Draw · Loss"}
              </p>
              <p className="mt-3 text-base font-semibold text-white sm:text-lg">
                {pointsLabel} <span className="text-[var(--muted)]">·</span> {placementLabel}
              </p>
              {degradationNote ? (
                <p className="mt-2 text-sm font-bold text-[#ffb380] sm:text-base">{degradationNote}</p>
              ) : null}
            </section>

            <section className="mt-4 flex justify-center">
              <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] ${badgeClassName(badge.tone)}`}>
                {badge.label}
              </span>
            </section>

            {badge.description ? (
              <p className="mt-2 text-center text-xs text-[var(--muted)] sm:text-sm">{badge.description}</p>
            ) : null}

            <section className="mt-5 rounded-[1.45rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.035)] p-3.5 md:p-4.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[var(--muted)]">
                    {locale === "nl" ? "Opstelling" : "Line-up"}
                  </p>
                  <p className="mt-1 text-sm text-white">{result.context.formation}</p>
                </div>
                <span className="rounded-full border border-[rgba(255,255,255,0.1)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  XI
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {squadRows.map(({ slot, player }, index) => (
                  <div
                    key={`${slot}-${index}-${player?.id ?? "empty"}`}
                    className="grid grid-cols-[2.3rem_minmax(0,1fr)_2rem] items-center gap-2 rounded-[0.95rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(8,12,30,0.74)] px-2.5 py-2"
                  >
                    <span className={`inline-flex h-8 w-9 items-center justify-center rounded-[0.8rem] border text-[0.62rem] font-bold tracking-[0.12em] ${positionChipClass(slot)}`}>
                      {formatPositionLabel(slot)}
                    </span>
                    <p className="truncate text-[0.82rem] font-semibold text-white">{formatShortPlayerName(player?.name)}</p>
                    <p className="text-right text-[0.8rem] font-bold text-[var(--gold-soft)]">{player?.rating ?? "—"}</p>
                  </div>
                ))}
              </div>
            </section>

            {topScorers.length > 0 ? (
              <section className="mt-4 rounded-[1.45rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-3.5 md:p-4.5">
                <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[var(--muted)]">
                  {locale === "nl" ? "Topscorers" : "Top scorers"}
                </p>
                <div className="mt-3 space-y-2">
                  {topScorers.map((entry, index) => (
                    <div
                      key={`${entry.playerName}-${index}`}
                      className="grid grid-cols-[1.4rem_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[0.95rem] bg-[rgba(7,11,28,0.68)] px-3 py-2.5"
                    >
                      <span className="text-xs font-semibold text-[var(--muted)]">{index + 1}.</span>
                      <p className="truncate text-[0.85rem] font-semibold text-white">{entry.playerName}</p>
                      <p className="text-[0.8rem] font-bold text-[var(--gold-soft)]">
                        {entry.goals} {locale === "nl" ? "goals" : "goals"}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mt-4 grid gap-2.5">
              <div className="rounded-[1.4rem] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(20,28,68,0.9),rgba(13,17,41,0.9))] px-4 py-3.5">
                <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[var(--muted)]">
                  {locale === "nl" ? "Speler van het seizoen" : "Player of the season"}
                </p>
                <p className="mt-1.5 text-lg font-bold text-white">{result.bestPlayer}</p>
                <p className="mt-1 text-[0.82rem] text-[var(--gold-soft)]">
                  {bestPlayerGoals
                    ? `${bestPlayerGoals} ${locale === "nl" ? "goals" : "goals"}`
                    : bestPlayerRecord?.rating
                      ? `Rating ${bestPlayerRecord.rating}`
                      : `Run rating ${result.runRating}`}
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-[rgba(228,197,106,0.18)] bg-[rgba(228,197,106,0.06)] px-4 py-3.5 text-center">
                <p className="text-[0.72rem] uppercase tracking-[0.26em] text-[var(--gold-soft)]">
                  Verified result
                </p>
                <p className="mt-1.5 text-sm font-semibold text-white sm:text-base">
                  {locale === "nl"
                    ? "Denk jij dat je dit kunt verslaan?"
                    : "Think you can beat this?"}
                </p>
              </div>
            </section>

            <div className="mt-5 border-t border-[rgba(255,255,255,0.08)] pt-3.5 text-center">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">{runLabel}</p>
              <div className="mt-2.5 flex items-center justify-center gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[rgba(228,197,106,0.22)] bg-[rgba(255,255,255,0.04)]">
                  <Image
                    src="/voetbaldraft-logo.png"
                    alt="VoetbalDraft"
                    fill
                    sizes="36px"
                    className="object-contain p-1.5 opacity-90"
                  />
                </div>
                <div className="text-left">
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--muted)]">VoetbalDraft</p>
                  <p className="text-base font-bold text-white sm:text-lg">voetbaldraft.app</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function BrandRow({
  locale,
  modeLabel,
  ovr,
}: {
  locale: "nl" | "en";
  modeLabel: string;
  ovr: number | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[rgba(228,197,106,0.24)] bg-[rgba(255,255,255,0.04)]">
          <Image
            src="/voetbaldraft-logo.png"
            alt="VoetbalDraft"
            fill
            sizes="40px"
            className="object-contain p-1.5 opacity-90"
          />
        </div>
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.2em] text-[var(--muted)]">VoetbalDraft.app</p>
          <p className="text-sm font-semibold text-white">{modeLabel}</p>
        </div>
      </div>
      <p className="text-right text-sm font-semibold text-[var(--gold-soft)]">
        {ovr ? `OVR ${ovr}` : locale === "nl" ? "OVR n.v.t." : "OVR n/a"}
      </p>
    </div>
  );
}

function createTopScorers(result: SeasonSummary): TeamScorerEntry[] {
  const finalSnapshotScorers = result.snapshots[result.snapshots.length - 1]?.teamScorers ?? [];
  if (finalSnapshotScorers.length > 0) {
    return finalSnapshotScorers.slice(0, 3);
  }

  const scorerMap = new Map<string, number>();
  for (const match of result.matches) {
    for (const scorer of match.scorers) {
      scorerMap.set(scorer, (scorerMap.get(scorer) ?? 0) + 1);
    }
  }

  return [...scorerMap.entries()]
    .map(([playerName, goals]) => ({ playerName, goals }))
    .sort((a, b) => b.goals - a.goals || a.playerName.localeCompare(b.playerName))
    .slice(0, 3);
}

function calculateAverageRating(selection: Array<PlayerRecord | null>) {
  const ratedPlayers = selection.filter((player): player is PlayerRecord => !!player);
  if (!ratedPlayers.length) return null;
  return Math.round(ratedPlayers.reduce((sum, player) => sum + player.rating, 0) / ratedPlayers.length);
}

function getPerformanceBadge({
  locale,
  finalPlacement,
  isChampion,
  wins,
  draws,
  losses,
}: {
  locale: "nl" | "en";
  finalPlacement?: number;
  isChampion?: boolean;
  wins: number;
  draws: number;
  losses: number;
}) {
  if (wins === 34 && draws === 0 && losses === 0) {
    return {
      label: locale === "nl" ? "Absolute koning" : "Absolute king",
      description: locale === "nl" ? "Perfect seizoen" : "Perfect season",
      tone: "king" as BadgeTone,
    };
  }

  if ((isChampion || finalPlacement === 1) && losses === 0) {
    return {
      label: locale === "nl" ? "Ongeslagen kampioen" : "Invincible champion",
      description: locale === "nl" ? "Geen nederlaag te bekennen." : "Not a single defeat.",
      tone: "invincible" as BadgeTone,
    };
  }

  if (isChampion || finalPlacement === 1) {
    return {
      label: locale === "nl" ? "Kampioen" : "Champion",
      description: locale === "nl" ? "De schaal is binnen." : "The title is yours.",
      tone: "champion" as BadgeTone,
    };
  }

  if (finalPlacement === 17 || finalPlacement === 18) {
    return {
      label: locale === "nl" ? "Drama" : "Disaster",
      description: locale === "nl" ? "Een screenshot voor de verkeerde redenen." : "Shareable for all the wrong reasons.",
      tone: "danger" as BadgeTone,
    };
  }

  return {
    label: getPlacementLabel(locale, finalPlacement, false),
    description: locale === "nl" ? "Geen kampioensrun, wel een verhaal." : "Not a title run, still a story.",
    tone: "neutral" as BadgeTone,
  };
}

function badgeClassName(tone: BadgeTone) {
  if (tone === "king") {
    return "border-[rgba(228,197,106,0.4)] bg-[rgba(228,197,106,0.14)] text-[var(--gold-soft)]";
  }

  if (tone === "invincible") {
    return "border-[rgba(95,237,171,0.38)] bg-[rgba(95,237,171,0.12)] text-[#8df3c3]";
  }

  if (tone === "champion") {
    return "border-[rgba(122,92,255,0.38)] bg-[rgba(122,92,255,0.14)] text-[#ded6ff]";
  }

  if (tone === "danger") {
    return "border-[rgba(255,123,143,0.32)] bg-[rgba(255,123,143,0.12)] text-[#ffb0be]";
  }

  return "border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.05)] text-white";
}

function getPlacementLabel(locale: "nl" | "en", finalPlacement?: number, isChampion?: boolean) {
  if (isChampion || finalPlacement === 1) {
    return locale === "nl" ? "Kampioen" : "Champion";
  }

  if (!finalPlacement) {
    return locale === "nl" ? "Eindklassering onbekend" : "Final place unknown";
  }

  return locale === "nl"
    ? `${formatDutchOrdinal(finalPlacement)} plaats`
    : `${finalPlacement}${getOrdinalSuffix(finalPlacement)} place`;
}

function formatDutchOrdinal(value: number) {
  if (value === 1) return "1e";
  if (value === 2) return "2e";
  if (value === 3) return "3e";
  return `${value}e`;
}

function getOrdinalSuffix(value: number) {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  const mod10 = value % 10;
  if (mod10 === 1) return "st";
  if (mod10 === 2) return "nd";
  if (mod10 === 3) return "rd";
  return "th";
}

function formatShortPlayerName(name?: string | null) {
  if (!name) {
    return "—";
  }

  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1];
  return last.length <= 14 ? last : last.slice(0, 14);
}

function positionChipClass(position: Position) {
  if (position === "gk") {
    return "border-[rgba(228,197,106,0.24)] bg-[rgba(228,197,106,0.14)] text-[var(--gold-soft)]";
  }

  if (position === "lw" || position === "rw" || position === "st") {
    return "border-[rgba(255,123,143,0.24)] bg-[rgba(255,123,143,0.12)] text-[#ff8da0]";
  }

  if (position === "cm" || position === "lm" || position === "rm") {
    return "border-[rgba(59,227,143,0.24)] bg-[rgba(59,227,143,0.12)] text-[#59efab]";
  }

  return "border-[rgba(104,142,255,0.24)] bg-[rgba(104,142,255,0.13)] text-[#8fb4ff]";
}

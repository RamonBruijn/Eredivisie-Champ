"use client";

import { getFormation, getFormationLayout } from "@/lib/formations";
import { formatPositionLabel, localizedModeLabel, useI18n } from "@/lib/i18n";
import { loadSeasonRunCount, loadSelection } from "@/lib/storage";
import type { PlayerRecord, Position, SeasonSummary, TeamScorerEntry } from "@/types/game";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface ResultCardProps {
  result: SeasonSummary;
  isChampion?: boolean;
  finalPlacement?: number;
}

export function ResultCard({ result, isChampion = false, finalPlacement }: ResultCardProps) {
  const { t, locale } = useI18n();
  const [savedSelection, setSavedSelection] = useState<Array<PlayerRecord | null>>([]);
  const [seasonRunCount, setSeasonRunCount] = useState(0);
  const [shareFeedback, setShareFeedback] = useState<"idle" | "copied" | "shared">("idle");
  const formation = getFormation(result.context.formation);
  const formationLayout = getFormationLayout(result.context.formation);

  useEffect(() => {
    setSavedSelection(loadSelection());
    setSeasonRunCount(loadSeasonRunCount());
  }, []);

  useEffect(() => {
    if (shareFeedback === "idle") return;

    const timer = window.setTimeout(() => setShareFeedback("idle"), 2200);
    return () => window.clearTimeout(timer);
  }, [shareFeedback]);

  const xiRows = useMemo(
    () =>
      formation.slots.map((slot, index) => ({
        slot,
        player: savedSelection[index] ?? null,
        point: formationLayout[index],
      })),
    [formation.slots, formationLayout, savedSelection],
  );

  const topScorers = useMemo(() => createTopScorers(result), [result]);
  const placementLabel = getPlacementLabel(locale, finalPlacement, isChampion);
  const goalDifference = result.goalsFor - result.goalsAgainst;
  const goalDifferenceLabel = goalDifference > 0 ? `+${goalDifference}` : `${goalDifference}`;
  const runLabel =
    seasonRunCount > 0
      ? locale === "nl"
        ? `Run ${seasonRunCount}`
        : `Run ${seasonRunCount}`
      : locale === "nl"
        ? "Run onbekend"
        : "Run unknown";

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "VoetbalDraft.app",
          text: result.shareText,
          url: "https://voetbaldraft.app",
        });
        setShareFeedback("shared");
        return;
      }

      await navigator.clipboard.writeText(result.shareText);
      setShareFeedback("copied");
    } catch {
      try {
        await navigator.clipboard.writeText(result.shareText);
        setShareFeedback("copied");
      } catch {
        setShareFeedback("idle");
      }
    }
  }

  function handleDownloadImage() {
    void navigator.clipboard?.writeText(result.shareText).catch(() => undefined);
    setShareFeedback("copied");
  }

  return (
    <section className="glass overflow-hidden rounded-[2rem] p-4 md:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(122,92,255,0.24),transparent_38%),radial-gradient(circle_at_85%_14%,rgba(228,197,106,0.18),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(7,11,29,0.18),transparent)]" />

      <div className="relative mx-auto max-w-5xl">
        <article className="overflow-hidden rounded-[2rem] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,rgba(11,15,38,0.96),rgba(13,17,40,0.92))] shadow-[0_28px_80px_rgba(0,0,0,0.32)]">
          <div className="border-b border-[rgba(255,255,255,0.08)] px-4 py-4 md:px-6 md:py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <ResultHeader
                locale={locale}
                isChampion={isChampion}
                placementLabel={placementLabel}
                formation={result.context.formation}
                modeLabel={localizedModeLabel(locale, result.context.mode)}
                runLabel={runLabel}
              />
              <ResultBrand />
            </div>
          </div>

          <div className="grid gap-5 px-4 py-5 md:px-6 md:py-6 xl:grid-cols-[1.04fr_0.96fr]">
            <div className="space-y-5">
              <ResultSummary
                locale={locale}
                result={result}
                placementLabel={placementLabel}
                goalDifferenceLabel={goalDifferenceLabel}
              />
              <MiniFormation xiRows={xiRows} locale={locale} />
            </div>

            <div className="space-y-5">
              <TopScorers scorers={topScorers} locale={locale} />
              <RunMeta
                locale={locale}
                formation={result.context.formation}
                modeLabel={localizedModeLabel(locale, result.context.mode)}
                runLabel={runLabel}
                runRating={result.runRating}
                bestPlayer={result.bestPlayer}
                hardestMatch={`${result.hardestMatch.opponent.name} (${result.hardestMatch.goalsFor}-${result.hardestMatch.goalsAgainst})`}
              />
            </div>
          </div>

          <div className="border-t border-[rgba(255,255,255,0.08)] px-4 py-4 md:px-6 md:py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="max-w-3xl text-sm leading-6 text-[var(--muted)]">
                {result.went340
                  ? t.result.perfect
                  : result.wentInvincible
                    ? t.result.invincible
                    : t.result.memorable}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex min-h-12 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(180deg,var(--gold-soft),var(--gold))] px-5 py-3 text-sm font-bold text-[#171b3a] shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition hover:translate-y-[-1px] hover:brightness-105"
                >
                  {t.result.playAgain}
                </Link>
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="inline-flex min-h-12 items-center justify-center rounded-[1.25rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[rgba(255,255,255,0.08)]"
                >
                  {locale === "nl" ? "Download afbeelding" : "Download image"}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex min-h-12 items-center justify-center rounded-[1.25rem] border border-[rgba(228,197,106,0.4)] bg-[rgba(228,197,106,0.08)] px-5 py-3 text-sm font-semibold text-[var(--gold-soft)] transition hover:bg-[rgba(228,197,106,0.14)]"
                >
                  {locale === "nl" ? "Deel resultaat" : "Share result"}
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
              <span>{shareFeedback === "shared" ? (locale === "nl" ? "Gedeeld" : "Shared") : shareFeedback === "copied" ? (locale === "nl" ? "Deeltekst gekopieerd" : "Share text copied") : result.shareText}</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function ResultHeader({
  locale,
  isChampion,
  placementLabel,
  formation,
  modeLabel,
  runLabel,
}: {
  locale: "nl" | "en";
  isChampion: boolean;
  placementLabel: string;
  formation: string;
  modeLabel: string;
  runLabel: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          {locale === "nl" ? "Resultaatkaart" : "Result card"}
        </span>
        <span className="rounded-full border border-[rgba(228,197,106,0.24)] bg-[rgba(228,197,106,0.08)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--gold-soft)]">
          {formation}
        </span>
        <span className="rounded-full border border-[rgba(122,92,255,0.24)] bg-[rgba(122,92,255,0.1)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#d7ceff]">
          {modeLabel}
        </span>
      </div>
      <h1 className="mt-3 text-3xl font-black tracking-[-0.03em] text-white md:text-5xl">
        {placementLabel}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {isChampion
          ? locale === "nl"
            ? "Een screenshotwaardige run. Deze XI pakte daadwerkelijk de schaal."
            : "A screenshot-worthy run. This XI actually lifted the title."
          : locale === "nl"
            ? "De run is klaar. Alles wat ertoe deed staat nu op deze kaart."
            : "The run is done. Everything that mattered now lives on this card."}
      </p>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{runLabel}</p>
    </div>
  );
}

function ResultBrand() {
  return (
    <div className="flex items-center gap-3 self-start rounded-[1.35rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.035)] px-3 py-2">
      <div className="relative h-11 w-11 overflow-hidden rounded-full border border-[rgba(228,197,106,0.26)] bg-[rgba(9,14,36,0.9)]">
        <Image
          src="/voetbaldraft-logo.png"
          alt="VoetbalDraft"
          fill
          sizes="44px"
          className="object-contain p-1.5 opacity-90"
        />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">VoetbalDraft</p>
        <p className="text-sm font-semibold text-white">VoetbalDraft.app</p>
      </div>
    </div>
  );
}

function ResultSummary({
  locale,
  result,
  placementLabel,
  goalDifferenceLabel,
}: {
  locale: "nl" | "en";
  result: SeasonSummary;
  placementLabel: string;
  goalDifferenceLabel: string;
}) {
  return (
    <section className="rounded-[1.7rem] border border-[rgba(255,255,255,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 md:p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
        {locale === "nl" ? "Seizoenssamenvatting" : "Season summary"}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm text-[var(--muted)]">{placementLabel}</p>
          <p className="mt-2 text-4xl font-black tracking-[-0.04em] text-white md:text-5xl">
            {result.wins}-{result.draws}-{result.losses}
          </p>
          <p className="mt-2 text-sm uppercase tracking-[0.16em] text-[var(--gold-soft)]">
            {locale === "nl" ? "34 wedstrijden" : "34 matches"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <RecordPill label="W" value={result.wins} tone="success" />
            <RecordPill label="G" value={result.draws} tone="gold" />
            <RecordPill label="V" value={result.losses} tone="danger" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SummaryStat label={locale === "nl" ? "Punten" : "Points"} value={result.points} tone="gold" />
          <SummaryStat label={locale === "nl" ? "Doelsaldo" : "Goal diff"} value={goalDifferenceLabel} tone="success" />
          <SummaryStat label="GF" value={result.goalsFor} tone="neutral" />
          <SummaryStat label="GA" value={result.goalsAgainst} tone="danger" />
        </div>
      </div>
    </section>
  );
}

function MiniFormation({
  xiRows,
  locale,
}: {
  xiRows: Array<{ slot: Position; player: PlayerRecord | null; point: { x: number; y: number } }>;
  locale: "nl" | "en";
}) {
  return (
    <section className="rounded-[1.7rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(8,12,30,0.84)] p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            {locale === "nl" ? "Mini-opstelling" : "Mini formation"}
          </p>
        </div>
        <span className="rounded-full border border-[rgba(255,255,255,0.1)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          XI
        </span>
      </div>

      <div className="mt-4 rounded-[1.5rem] border border-[rgba(228,197,106,0.14)] bg-[linear-gradient(180deg,rgba(13,18,46,0.98),rgba(10,14,34,0.95))] p-3">
        <div className="relative aspect-[0.84] overflow-hidden rounded-[1.25rem] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(27,36,82,0.75),rgba(15,22,51,0.9))]">
          <PitchLines />
          {xiRows.map(({ slot, player, point }, index) => (
            <div
              key={`${slot}-${index}-${player?.id ?? "empty"}`}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              <span
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full border text-[0.6rem] font-bold tracking-[0.08em] shadow-[0_8px_20px_rgba(0,0,0,0.28)] ${positionChipClass(slot)}`}
              >
                {formatPositionLabel(slot)}
              </span>
              <div className="max-w-[4.8rem] rounded-[0.95rem] border border-[rgba(255,255,255,0.09)] bg-[rgba(8,12,30,0.88)] px-2 py-1 text-center shadow-[0_10px_22px_rgba(0,0,0,0.22)]">
                <p className="truncate text-[0.62rem] font-semibold leading-tight text-white">
                  {formatShortPlayerName(player?.name)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TopScorers({
  scorers,
  locale,
}: {
  scorers: TeamScorerEntry[];
  locale: "nl" | "en";
}) {
  return (
    <section className="rounded-[1.7rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.035)] p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            {locale === "nl" ? "Topscorers" : "Top scorers"}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {locale === "nl" ? "De drie gevaarlijkste afmakers." : "Your three most dangerous finishers."}
          </p>
        </div>
        <span className="rounded-full border border-[rgba(228,197,106,0.24)] bg-[rgba(228,197,106,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
          Top 3
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {scorers.length ? (
          scorers.map((scorer, index) => (
            <div
              key={`${scorer.playerName}-${index}`}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[1.2rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(7,11,28,0.64)] px-3 py-3"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(228,197,106,0.24)] bg-[rgba(228,197,106,0.08)] text-sm font-bold text-[var(--gold-soft)]">
                {index + 1}
              </span>
              <p className="truncate text-base font-semibold text-white">{scorer.playerName}</p>
              <p className="text-right text-xl font-black text-white">{scorer.goals}</p>
            </div>
          ))
        ) : (
          <div className="rounded-[1.2rem] border border-dashed border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.025)] px-4 py-5 text-sm text-[var(--muted)]">
            {locale === "nl" ? "Nog geen topscorersdata beschikbaar." : "No top scorer data available yet."}
          </div>
        )}
      </div>
    </section>
  );
}

function RunMeta({
  locale,
  formation,
  modeLabel,
  runLabel,
  runRating,
  bestPlayer,
  hardestMatch,
}: {
  locale: "nl" | "en";
  formation: string;
  modeLabel: string;
  runLabel: string;
  runRating: number;
  bestPlayer: string;
  hardestMatch: string;
}) {
  const items = [
    { label: locale === "nl" ? "Formatie" : "Formation", value: formation },
    { label: locale === "nl" ? "Spelmodus" : "Mode", value: modeLabel },
    { label: locale === "nl" ? "Run" : "Run", value: runLabel },
    { label: locale === "nl" ? "Run rating" : "Run rating", value: String(runRating) },
    { label: locale === "nl" ? "Beste speler" : "Best player", value: bestPlayer },
    { label: locale === "nl" ? "Moeilijkste duel" : "Hardest match", value: hardestMatch },
  ];

  return (
    <section className="rounded-[1.7rem] border border-[rgba(255,255,255,0.1)] bg-[linear-gradient(180deg,rgba(19,25,63,0.88),rgba(12,16,39,0.9))] p-4 md:p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
        {locale === "nl" ? "Run-info" : "Run info"}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-[1.1rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-3"
          >
            <p className="text-[0.7rem] uppercase tracking-[0.16em] text-[var(--muted)]">{item.label}</p>
            <p className="mt-2 text-sm font-semibold leading-5 text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecordPill({ label, value, tone }: { label: string; value: number; tone: "success" | "gold" | "danger" }) {
  const className =
    tone === "success"
      ? "border-[rgba(59,227,143,0.25)] bg-[rgba(59,227,143,0.1)] text-[#78f0b7]"
      : tone === "gold"
        ? "border-[rgba(228,197,106,0.24)] bg-[rgba(228,197,106,0.08)] text-[var(--gold-soft)]"
        : "border-[rgba(255,123,143,0.22)] bg-[rgba(255,123,143,0.09)] text-[#ff95a8]";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${className}`}>
      <span className="text-[0.7rem] uppercase tracking-[0.16em]">{label}</span>
      <span>{value}</span>
    </span>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "gold" | "success" | "neutral" | "danger";
}) {
  const valueClass =
    tone === "gold"
      ? "text-[var(--gold-soft)]"
      : tone === "success"
        ? "text-[#7bf2bb]"
        : tone === "danger"
          ? "text-[#ff95a8]"
          : "text-white";

  return (
    <div className="rounded-[1.15rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(7,11,28,0.65)] px-3 py-3">
      <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[var(--muted)]">{label}</p>
      <p className={`mt-2 text-2xl font-black ${valueClass}`}>{value}</p>
    </div>
  );
}

function PitchLines() {
  return (
    <>
      <div className="absolute inset-[6%] rounded-[1rem] border border-[rgba(255,255,255,0.12)]" />
      <div className="absolute left-[6%] top-1/2 h-px w-[88%] -translate-y-1/2 bg-[rgba(255,255,255,0.12)]" />
      <div className="absolute left-1/2 top-1/2 h-[20%] w-[20%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(255,255,255,0.12)]" />
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(255,255,255,0.18)]" />
      <div className="absolute left-1/2 top-[6%] h-[15%] w-[46%] -translate-x-1/2 rounded-b-[1rem] border border-t-0 border-[rgba(255,255,255,0.12)]" />
      <div className="absolute left-1/2 top-[6%] h-[7%] w-[22%] -translate-x-1/2 rounded-b-[0.75rem] border border-t-0 border-[rgba(255,255,255,0.12)]" />
      <div className="absolute left-1/2 top-[18.5%] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[rgba(255,255,255,0.18)]" />
      <div className="absolute left-1/2 top-[16.5%] h-[11%] w-[14%] -translate-x-1/2 rounded-full border border-[rgba(255,255,255,0.12)] [clip-path:inset(0_0_50%_0)]" />
      <div className="absolute left-1/2 bottom-[6%] h-[15%] w-[46%] -translate-x-1/2 rounded-t-[1rem] border border-b-0 border-[rgba(255,255,255,0.12)]" />
      <div className="absolute left-1/2 bottom-[6%] h-[7%] w-[22%] -translate-x-1/2 rounded-t-[0.75rem] border border-b-0 border-[rgba(255,255,255,0.12)]" />
      <div className="absolute left-1/2 bottom-[18.5%] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[rgba(255,255,255,0.18)]" />
      <div className="absolute left-1/2 bottom-[16.5%] h-[11%] w-[14%] -translate-x-1/2 rounded-full border border-[rgba(255,255,255,0.12)] [clip-path:inset(50%_0_0_0)]" />
      <div className="absolute left-1/2 top-[4.2%] h-[2.2%] w-[16%] -translate-x-1/2 rounded-b-[0.5rem] border border-t-0 border-[rgba(228,197,106,0.18)]" />
      <div className="absolute left-1/2 bottom-[4.2%] h-[2.2%] w-[16%] -translate-x-1/2 rounded-t-[0.5rem] border border-b-0 border-[rgba(228,197,106,0.18)]" />
    </>
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

function getPlacementLabel(locale: "nl" | "en", finalPlacement?: number, isChampion?: boolean) {
  if (isChampion || finalPlacement === 1) {
    return locale === "nl" ? "Kampioen" : "Champion";
  }

  if (!finalPlacement) {
    return locale === "nl" ? "Eindklassering onbekend" : "Final place unknown";
  }

  return locale === "nl" ? `${formatDutchOrdinal(finalPlacement)} plaats` : `${finalPlacement}${getOrdinalSuffix(finalPlacement)} place`;
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
  return last.length <= 12 ? last : last.slice(0, 12);
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

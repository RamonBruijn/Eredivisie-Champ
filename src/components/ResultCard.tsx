"use client";

import { getFormation } from "@/lib/formations";
import { localizedModeLabel, useI18n } from "@/lib/i18n";
import { loadSelection } from "@/lib/storage";
import type { PlayerRecord, Position, SeasonSummary } from "@/types/game";
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
  const formation = getFormation(result.context.formation);

  useEffect(() => {
    setSavedSelection(loadSelection());
  }, []);

  const xiRows = useMemo(
    () =>
      formation.slots.map((slot, index) => ({
        slot,
        player: savedSelection[index] ?? null,
      })),
    [formation.slots, savedSelection],
  );

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(result.shareText);
    } catch {
      // noop
    }
  }

  return (
    <section className="glass overflow-hidden rounded-[2rem] p-6 md:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(122,92,255,0.22),transparent_58%)]" />
      {isChampion ? (
        <>
          <div className="champion-burst pointer-events-none absolute inset-x-0 top-0 h-52" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-44 overflow-hidden">
            {Array.from({ length: 24 }).map((_, index) => (
              <span
                key={index}
                className="champion-confetti absolute top-[-10%] h-4 w-2 rounded-full"
                style={{
                  left: `${4 + index * 4}%`,
                  animationDelay: `${(index % 6) * 110}ms`,
                  animationDuration: `${2800 + (index % 5) * 240}ms`,
                  background:
                    index % 3 === 0
                      ? "linear-gradient(180deg, rgba(245,228,166,1), rgba(228,197,106,0.66))"
                      : index % 3 === 1
                        ? "linear-gradient(180deg, rgba(122,92,255,0.95), rgba(171,147,255,0.56))"
                        : "linear-gradient(180deg, rgba(255,123,143,0.95), rgba(255,174,142,0.58))",
                }}
              />
            ))}
          </div>
        </>
      ) : null}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          {isChampion ? (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(245,228,166,0.28)] bg-[rgba(245,228,166,0.1)] px-4 py-2 text-sm font-semibold text-[var(--gold-soft)] shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
              <span aria-hidden="true">🏆</span>
              <span>{locale === "nl" ? "Kampioen van Nederland" : "Champions of the Netherlands"}</span>
            </div>
          ) : null}
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">{t.result.finalRecord}</p>
          <h1 className="mt-2 text-4xl font-bold text-white">
            {result.wins}-{result.draws}-{result.losses}
          </h1>
          <p className="mt-2 text-sm text-[var(--gold-soft)]">
            {result.context.formation} • {localizedModeLabel(locale, result.context.mode)}
          </p>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            {result.went340
              ? t.result.perfect
              : result.wentInvincible
                ? t.result.invincible
                : t.result.memorable}
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="inline-flex min-h-14 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(180deg,var(--gold-soft),var(--gold))] px-6 py-4 text-base font-bold text-[#171b3a] shadow-[0_18px_44px_rgba(0,0,0,0.24)] transition hover:translate-y-[-1px] hover:brightness-105"
            >
              {t.result.playAgain}
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="rounded-full border border-[rgba(217,185,110,0.45)] px-4 py-2 text-sm text-[var(--gold-soft)] hover:bg-[rgba(217,185,110,0.1)]"
        >
          {t.result.copyShare}
        </button>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-[1.8rem] border border-[rgba(255,255,255,0.12)] bg-[rgba(11,14,35,0.74)] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.26)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
                {locale === "nl" ? "Jouw XI" : "Your XI"}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {result.context.formation} • {locale === "nl" ? "einde seizoen" : "season recap"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Link
                href="#final-standings"
                className="rounded-full border border-[rgba(228,197,106,0.25)] bg-[rgba(228,197,106,0.08)] px-4 py-2 text-sm font-semibold text-[var(--gold-soft)] transition hover:bg-[rgba(228,197,106,0.14)]"
              >
                {locale === "nl" ? "Naar eindstand" : "View final table"}
              </Link>
              <Link
                href="#topscorers"
                className="rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
              >
                {locale === "nl" ? "Naar topscorers" : "View top scorers"}
              </Link>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            {xiRows.map(({ slot, player }, index) => (
              <div
                key={`${slot}-${index}-${player?.id ?? "empty"}`}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-[1.25rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3 py-3"
              >
                <span className={`inline-flex min-w-12 items-center justify-center rounded-xl px-2.5 py-1 text-xs font-bold tracking-[0.18em] ${positionChipClass(slot)}`}>
                  {slot.toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">{player?.name ?? t.common.empty}</p>
                </div>
                <p className="hidden text-right text-xs uppercase tracking-[0.14em] text-[var(--muted)] sm:block">
                  {player ? `${player.club} ${player.season}` : "—"}
                </p>
                <p className="text-right text-2xl font-bold text-white/95">{player?.rating ?? "—"}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-2">
            <Stat label={locale === "nl" ? "Eindklassering" : "Final place"} value={finalPlacement ?? "—"} tone="gold" />
            <Stat label={locale === "nl" ? "Overwinningen" : "Wins"} value={result.wins} tone="success" />
            <Stat label={locale === "nl" ? "Gelijke spelen" : "Draws"} value={result.draws} tone="gold" />
            <Stat label={locale === "nl" ? "Nederlagen" : "Losses"} value={result.losses} tone="danger" />
            <Stat label={t.result.points} value={result.points} tone="neutral" />
            <Stat label={t.result.goalsFor} value={result.goalsFor} tone="success" />
            <Stat label={t.result.goalsAgainst} value={result.goalsAgainst} tone="danger" />
          </div>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            <Feature title={t.result.bestPlayer} value={result.bestPlayer} />
            <Feature title={t.result.topScorer} value={result.topScorer} />
            <Feature
              title={t.result.hardestMatch}
              value={`${result.hardestMatch.opponent.name} (${result.hardestMatch.goalsFor}-${result.hardestMatch.goalsAgainst})`}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-[var(--line)] p-4">
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">{t.common.shareText}</p>
        <p className="mt-2 text-sm text-white">{result.shareText}</p>
      </div>

    </section>
  );
}

type StatTone = "success" | "gold" | "danger" | "neutral";

function Stat({ label, value, tone }: { label: string; value: string | number; tone: StatTone }) {
  const valueClass =
    tone === "success"
      ? "text-[#3be38f]"
      : tone === "gold"
        ? "text-[var(--gold)]"
        : tone === "danger"
          ? "text-[#ff7b8f]"
          : "text-white";

  return (
    <div className="rounded-[1.6rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(11,14,35,0.78)] p-4 shadow-[0_14px_32px_rgba(0,0,0,0.2)]">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className={`mt-2 text-4xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function Feature({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.45rem] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.035)] p-4">
      <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">{title}</p>
      <p className="mt-2 text-lg font-medium text-white">{value}</p>
    </div>
  );
}

function positionChipClass(position: Position) {
  if (position === "gk") {
    return "bg-[rgba(228,197,106,0.14)] text-[var(--gold-soft)]";
  }

  if (position === "lw" || position === "rw" || position === "st") {
    return "bg-[rgba(255,123,143,0.12)] text-[#ff8da0]";
  }

  if (position === "cm" || position === "lm" || position === "rm") {
    return "bg-[rgba(59,227,143,0.12)] text-[#59efab]";
  }

  return "bg-[rgba(104,142,255,0.13)] text-[#8fb4ff]";
}

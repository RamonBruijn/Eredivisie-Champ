"use client";

import { useI18n } from "@/lib/i18n";
import type { PlayerRecord } from "@/types/game";

interface PlayerCardProps {
  player: PlayerRecord;
  selected?: boolean;
  disabled?: boolean;
  hideRating?: boolean;
  onClick?: () => void;
}

export function PlayerCard({
  player,
  selected = false,
  disabled = false,
  hideRating = false,
  onClick,
}: PlayerCardProps) {
  const { locale } = useI18n();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`glass flex w-full flex-col gap-3 rounded-3xl border p-4 text-left transition ${
        selected
          ? "border-[var(--gold)] bg-[rgba(217,185,110,0.16)]"
          : "border-[var(--line)] hover:border-[rgba(217,185,110,0.5)] hover:bg-[rgba(255,255,255,0.04)]"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">{player.club}</p>
          <h3 className="text-lg font-semibold text-white">{player.name}</h3>
          <p className="text-sm text-[var(--muted)]">{player.season}</p>
        </div>
        <div className="rounded-2xl border border-[rgba(217,185,110,0.4)] px-3 py-2 text-center">
          <span className="block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">OVR</span>
          <span className="text-2xl font-bold text-[var(--gold-soft)]">{hideRating ? "?" : player.rating}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {player.positions.map((position) => (
          <span
            key={position}
            className="rounded-full border border-[var(--line)] px-2 py-1 text-xs uppercase tracking-[0.15em] text-[var(--muted)]"
          >
            {position}
          </span>
        ))}
        {player.legendary ? (
          <span className="rounded-full bg-[rgba(217,185,110,0.18)] px-2 py-1 text-xs uppercase tracking-[0.15em] text-[var(--gold-soft)]">
            {locale === "nl" ? "Legendarisch" : "Legendary"}
          </span>
        ) : null}
      </div>
    </button>
  );
}

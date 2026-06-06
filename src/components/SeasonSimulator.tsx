"use client";

import { useI18n } from "@/lib/i18n";
import { simulateSeason } from "@/lib/simulation";
import { saveResult, saveSelection } from "@/lib/storage";
import { validateSlotAssignments } from "@/lib/validation";
import type { FormationId, GameMode, PlayerRecord, SimulationMode } from "@/types/game";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SeasonSimulatorProps {
  mode: GameMode;
  formation: FormationId;
  slotAssignments: Array<PlayerRecord | null>;
}

export function SeasonSimulator({
  mode,
  formation,
  slotAssignments,
}: SeasonSimulatorProps) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [loadingMode, setLoadingMode] = useState<SimulationMode | null>(null);
  const selectedPlayers = slotAssignments.filter((player): player is PlayerRecord => Boolean(player));
  const validation = validateSlotAssignments(slotAssignments, formation, locale);

  function handleSimulate(simulationMode: SimulationMode) {
    if (!validation.valid) return;
    setLoadingMode(simulationMode);
    saveSelection(slotAssignments);

    window.setTimeout(() => {
      const result = simulateSeason(selectedPlayers, {
        locale,
        mode,
        formation,
        featuredTeamId: selectedPlayers[0]?.teamId ?? "mixed-draft",
        simulationMode,
      });
      saveResult(result);
      router.push("/result");
    }, 250);
  }

  return (
    <section className="glass rounded-[2rem] p-5 md:p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">{t.season.run}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{t.season.title}</h2>
      <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
        {t.season.description}
      </p>
      <p className="mt-2 text-sm text-[var(--gold-soft)]">
        {t.season.challenge(formation)}
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => handleSimulate("auto")}
          disabled={!validation.valid || loadingMode !== null}
          className="rounded-[1.25rem] bg-[var(--gold)] px-5 py-4 text-left font-semibold text-[#171b3a] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="block">
            {locale === "nl" ? "Automatisch" : "Automatic"}
          </span>
          <span className="mt-1 block text-sm font-normal text-[rgba(23,27,58,0.8)]">
            {locale === "nl"
              ? "17 wedstrijden in beeld in ongeveer 30 seconden, daarna klik je door naar helft twee."
              : "17 matches play out in about 30 seconds, then you click into the second half."}
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleSimulate("manual")}
          disabled={!validation.valid || loadingMode !== null}
          className="rounded-[1.25rem] border border-[rgba(228,197,106,0.45)] px-5 py-4 text-left text-[var(--gold-soft)] transition hover:bg-[rgba(228,197,106,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="block font-semibold">
            {locale === "nl" ? "Handmatig" : "Manual"}
          </span>
          <span className="mt-1 block text-sm font-normal text-[var(--muted)]">
            {locale === "nl"
              ? "Wedstrijd voor wedstrijd klikken, met resultaat en doelpuntenmakers per duel."
              : "Click through one match at a time with result and scorers for every fixture."}
          </span>
        </button>
      </div>
      {loadingMode ? (
        <p className="mt-3 text-sm text-[var(--muted)]">{t.season.simulating}</p>
      ) : null}
    </section>
  );
}

"use client";

import { useI18n } from "@/lib/i18n";
import { simulateSeason } from "@/lib/simulation";
import { saveResult, saveSelection } from "@/lib/storage";
import { validateSlotAssignments } from "@/lib/validation";
import type { AutoSimulationSpeed, FormationId, GameMode, PlayerRecord, SimulationMode } from "@/types/game";
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
  const [autoSimulationSpeed, setAutoSimulationSpeed] = useState<AutoSimulationSpeed>("normal");
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
        autoSimulationSpeed,
      });
      saveResult(result);
      router.push("/result");
    }, 250);
  }

  return (
    <section className="glass rounded-[1.75rem] p-4 md:rounded-[2rem] md:p-6">
      <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted)]">{t.season.run}</p>
      <h2 className="mt-2 text-xl font-semibold leading-tight text-white md:text-2xl">{t.season.title}</h2>
      <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
        {t.season.description}
      </p>
      <p className="mt-2 text-sm text-[var(--gold-soft)]">
        {t.season.challenge(formation)}
      </p>
      <div className="mt-5 rounded-[1.35rem] border border-[rgba(228,197,106,0.2)] bg-[rgba(255,255,255,0.02)] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              {locale === "nl" ? "Autosimulatie snelheid" : "Auto simulation speed"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {locale === "nl"
                ? "Kies hoe snel wedstrijden automatisch doorlopen."
                : "Choose how quickly matches play out automatically."}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                value: "slow",
                label: locale === "nl" ? "Rustig" : "Slow",
              },
              {
                value: "normal",
                label: locale === "nl" ? "Normaal" : "Normal",
              },
              {
                value: "fast",
                label: locale === "nl" ? "Snel" : "Fast",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setAutoSimulationSpeed(option.value as AutoSimulationSpeed)}
                disabled={loadingMode !== null}
                className={`rounded-full border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  autoSimulationSpeed === option.value
                    ? "border-[var(--gold)] bg-[rgba(217,185,110,0.14)] text-[var(--gold-soft)]"
                    : "border-[var(--line)] text-[var(--muted)] hover:bg-[rgba(255,255,255,0.03)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => handleSimulate("auto")}
          disabled={!validation.valid || loadingMode !== null}
          className="min-h-24 rounded-[1.35rem] bg-[linear-gradient(180deg,var(--gold-soft),var(--gold))] px-5 py-4 text-left font-semibold text-[#171b3a] shadow-[0_16px_40px_rgba(0,0,0,0.2)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="block">
            {locale === "nl" ? "Automatisch" : "Automatic"}
          </span>
          <span className="mt-1 block text-sm font-normal text-[rgba(23,27,58,0.8)]">
            {locale === "nl"
              ? `17 wedstrijden in beeld op ${autoSimulationSpeed === "slow" ? "rustig" : autoSimulationSpeed === "fast" ? "hoog" : "normaal"} tempo, daarna klik je door naar helft twee.`
              : `17 matches play out at a ${autoSimulationSpeed === "slow" ? "slow" : autoSimulationSpeed === "fast" ? "fast" : "normal"} pace, then you click into the second half.`}
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleSimulate("manual")}
          disabled={!validation.valid || loadingMode !== null}
          className="min-h-24 rounded-[1.35rem] border border-[rgba(228,197,106,0.45)] bg-[rgba(255,255,255,0.02)] px-5 py-4 text-left text-[var(--gold-soft)] transition hover:bg-[rgba(228,197,106,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
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

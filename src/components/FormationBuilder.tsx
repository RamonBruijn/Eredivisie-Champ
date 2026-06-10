"use client";

import { getFormation, getFormationLayout, getFormationSlotNumber } from "@/lib/formations";
import { formatPositionLabel, localizedModeLabel, localizedSlotLabel, useI18n } from "@/lib/i18n";
import { calculateTeamStrength } from "@/lib/ratings";
import { validateSlotAssignments } from "@/lib/validation";
import type { FormationId, GameMode, PlayerRecord } from "@/types/game";

interface FormationBuilderProps {
  mode: GameMode;
  formation: FormationId;
  slotAssignments: Array<PlayerRecord | null>;
  pendingPlayer: PlayerRecord | null;
  onSlotClick: (slotIndex: number) => void;
  onCancelPlacement?: () => void;
  onStartSeason?: () => void;
}

export function FormationBuilder({
  mode,
  formation,
  slotAssignments,
  pendingPlayer,
  onSlotClick,
  onCancelPlacement,
  onStartSeason,
}: FormationBuilderProps) {
  const selectedPlayers = slotAssignments.filter((player): player is PlayerRecord => Boolean(player));
  const { locale, t } = useI18n();
  const validation = validateSlotAssignments(slotAssignments, formation, locale);
  const revealRatings = mode === "classic" || selectedPlayers.length === formationShapeLength(formation);
  const strength = selectedPlayers.length > 0 && revealRatings ? calculateTeamStrength(selectedPlayers) : null;
  const formationShape = getFormation(formation);
  const formationLayout = getFormationLayout(formation);
  const openSlots = formationShape.slots
    .map((slot, index) => ({ slot, index }))
    .filter(({ index }) => !slotAssignments[index]);

  return (
    <section className="glass rounded-[1.55rem] p-3 md:rounded-[2rem] md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">{t.formationBuilder.yourXi}</p>
          <h2 className="text-xl font-semibold text-white md:text-2xl">{selectedPlayers.length} / 11 {t.common.selected}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {formation} • {localizedModeLabel(locale, mode)}
          </p>
        </div>
        {strength ? (
          <div className="rounded-[1.25rem] border border-[rgba(217,185,110,0.4)] px-3 py-2 text-right md:px-4 md:py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{t.formationBuilder.teamStrength}</p>
            <p className="text-2xl font-bold text-[var(--gold-soft)] md:text-3xl">{strength.overall}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-3 rounded-[1.2rem] border border-[var(--line)] px-3 py-2.5">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{t.formationBuilder.draftFlow}</p>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">{t.formationBuilder.pickOnePerRoll}</p>
            <p className="text-xs text-[var(--muted)]">
              {pendingPlayer
                ? locale === "nl"
                  ? `Wijs ${pendingPlayer.name} nu toe aan een vrije passende positie.`
                  : `Assign ${pendingPlayer.name} to any open matching position.`
                : t.formationBuilder.draftDescription}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{t.common.picked}</p>
            <p className="text-xl font-bold text-[var(--gold-soft)]">{selectedPlayers.length}/11</p>
          </div>
        </div>
      </div>

      <div className="mt-2.5 rounded-[1.45rem] border border-[rgba(255,255,255,0.14)] bg-[linear-gradient(180deg,rgba(122,92,255,0.2)_0%,rgba(11,16,38,0.3)_100%)] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] md:mt-4 md:rounded-[2rem] md:p-3">
        <div className="pitch relative mx-auto aspect-[4/5] max-w-[22rem] overflow-hidden rounded-[1.25rem] border border-[rgba(255,255,255,0.22)] bg-[linear-gradient(180deg,#32206f_0%,#1a1d57_46%,#111739_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_22px_60px_rgba(0,0,0,0.35)] md:max-w-[26rem] md:rounded-[1.5rem]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(245,228,166,0.12),transparent_20%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.045),transparent_18%),repeating-linear-gradient(180deg,rgba(255,255,255,0.035)_0_11%,rgba(10,16,38,0.08)_11%_22%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03),transparent_18%,transparent_82%,rgba(255,255,255,0.03))]" />
          <div className="absolute inset-0 rounded-[1.5rem] shadow-[inset_0_0_40px_rgba(0,0,0,0.24)]" />
          <div className="absolute inset-x-[6%] inset-y-[3.5%] rounded-[1.2rem] border border-[rgba(255,255,255,0.24)]" />
          <div className="absolute left-1/2 top-[3.5%] h-[3%] w-[16%] -translate-x-1/2 rounded-b-[0.7rem] border border-t-0 border-[rgba(255,255,255,0.24)]" />
          <div className="absolute left-1/2 bottom-[3.5%] h-[3%] w-[16%] -translate-x-1/2 rounded-t-[0.7rem] border border-b-0 border-[rgba(255,255,255,0.24)]" />
          <div className="absolute inset-x-[18%] top-[3.5%] h-[12.5%] border border-t-0 border-[rgba(255,255,255,0.24)]" />
          <div className="absolute inset-x-[33%] top-[3.5%] h-[5.7%] border border-t-0 border-[rgba(255,255,255,0.24)]" />
          <div className="absolute left-1/2 top-[14.6%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(255,255,255,0.3)]" />
          <div className="absolute left-1/2 top-[16.2%] h-[10%] w-[24%] -translate-x-1/2 rounded-b-full border border-t-0 border-[rgba(255,255,255,0.24)]" />
          <div className="absolute left-1/2 top-1/2 h-px w-[88%] -translate-x-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.24)]" />
          <div className="absolute left-1/2 top-1/2 h-[18%] w-[28%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(255,255,255,0.22)]" />
          <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(255,255,255,0.3)]" />
          <div className="absolute inset-x-[18%] bottom-[3.5%] h-[12.5%] border border-b-0 border-[rgba(255,255,255,0.24)]" />
          <div className="absolute inset-x-[33%] bottom-[3.5%] h-[5.7%] border border-b-0 border-[rgba(255,255,255,0.24)]" />
          <div className="absolute left-1/2 bottom-[14.6%] h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-[rgba(255,255,255,0.3)]" />
          <div className="absolute left-1/2 bottom-[16.2%] h-[10%] w-[24%] -translate-x-1/2 rounded-t-full border border-b-0 border-[rgba(255,255,255,0.24)]" />

          {formationShape.slots.map((slot, index) => {
            const point = formationLayout[index];
            const pickedPlayer = slotAssignments[index];
            const isAssignable =
              !!pendingPlayer && !pickedPlayer && pendingPlayer.positions.includes(slot);
            const isPlacementMode = !!pendingPlayer;
            const isUnavailableWhilePlacing = isPlacementMode && !isAssignable;
            const shirtNumber = getFormationSlotNumber(formation, index);

            return (
              <div
                key={`${slot}-${index}`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              >
                <button
                  type="button"
                  onClick={() => onSlotClick(index)}
                  className={`flex min-w-[4.7rem] flex-col items-center text-center transition ${
                    isAssignable ? "scale-105" : ""
                  } ${isUnavailableWhilePlacing ? "opacity-55" : ""}`}
                >
                  <div
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold shadow-lg transition md:h-12 md:w-12 md:text-sm ${
                      isAssignable
                        ? "border-[var(--gold)] bg-[rgba(245,228,166,0.98)] text-[#261b57] shadow-[0_0_0_6px_rgba(245,228,166,0.12)]"
                        : pickedPlayer
                            ? "border-[rgba(0,0,0,0.55)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(236,230,247,0.94))] text-[#171b3a]"
                            : isPlacementMode
                              ? "border-[rgba(255,255,255,0.16)] bg-[linear-gradient(180deg,rgba(25,34,76,0.88),rgba(13,18,42,0.82))] text-[rgba(255,255,255,0.74)]"
                              : "border-[rgba(255,255,255,0.22)] bg-[linear-gradient(180deg,rgba(31,40,93,0.9),rgba(17,23,57,0.86))] text-[rgba(255,255,255,0.82)]"
                    }`}
                  >
                    <span className="absolute -left-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[rgba(9,13,31,0.92)] px-1.5 py-0.5 text-[8px] font-bold leading-none text-white ring-1 ring-[rgba(255,255,255,0.14)] md:min-w-6 md:text-[9px]">
                      {shirtNumber}
                    </span>
                    {isAssignable ? (
                      <span className="absolute -bottom-1.5 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--gold)] px-1 text-[9px] font-bold leading-none text-[#171b3a] shadow-[0_6px_12px_rgba(0,0,0,0.2)] md:h-5 md:min-w-5 md:text-[10px]">
                        +
                      </span>
                    ) : null}
                    {pickedPlayer ? (
                      <span className="absolute -top-1.5 right-0 rounded-full bg-[var(--gold)] px-1.5 py-0.5 text-[8px] font-bold leading-none text-[#171b3a] md:text-[9px]">
                        {formatPositionLabel(slot)}
                      </span>
                    ) : null}
                    {pickedPlayer ? (revealRatings ? pickedPlayer.rating : "?") : formatPositionLabel(slot)}
                  </div>
                  <p className="mt-1.5 max-w-[4.7rem] text-[9px] font-semibold uppercase tracking-[0.12em] text-[rgba(255,255,255,0.96)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] md:mt-2 md:max-w-[5.8rem] md:text-[10px] md:tracking-[0.14em]">
                    {pickedPlayer ? pickedPlayer.name : localizedSlotLabel(slot, index, shirtNumber)}
                  </p>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {pendingPlayer ? (
        <div className="mt-4 rounded-[1.5rem] border border-[rgba(217,185,110,0.35)] bg-[rgba(217,185,110,0.08)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                {locale === "nl" ? `Zet ${pendingPlayer.name} in je opstelling` : `Place ${pendingPlayer.name} in your XI`}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {locale === "nl"
                  ? "Tik op een oplichtende vrije positie om deze speler vast te zetten."
                  : "Tap any highlighted open slot to lock this player into your formation."}
              </p>
            </div>
            {onCancelPlacement ? (
              <button
                type="button"
                onClick={onCancelPlacement}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.14)] px-4 py-2 text-sm text-[var(--muted)] transition hover:border-[rgba(255,255,255,0.22)] hover:text-white"
              >
                {locale === "nl" ? "Andere speler kiezen" : "Pick another player"}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {selectedPlayers.length === 0 ? (
        <div className="mt-3 rounded-[1.5rem] border border-dashed border-[var(--line)] p-4 text-sm text-[var(--muted)]">
          {t.formationBuilder.startRolling}
        </div>
      ) : null}

      {selectedPlayers.length === formationShape.slots.length && onStartSeason ? (
        <div className="mt-5 rounded-[1.5rem] border border-[rgba(217,185,110,0.3)] bg-[linear-gradient(180deg,rgba(245,228,166,0.12),rgba(217,185,110,0.05))] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            {locale === "nl" ? "Team compleet" : "Team complete"}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white md:text-xl">
            {locale === "nl" ? "Start je seizoen" : "Start your season"}
          </h3>
          <button
            type="button"
            onClick={onStartSeason}
            className="mt-4 inline-flex min-h-14 w-full items-center justify-center rounded-[1.25rem] bg-[linear-gradient(180deg,var(--gold-soft),var(--gold))] px-5 py-4 text-base font-bold text-[#171b3a] shadow-[0_16px_36px_rgba(0,0,0,0.22)]"
          >
            {locale === "nl" ? "Speel seizoen" : "Play season"}
          </button>
        </div>
      ) : null}

      {strength ? (
        <div className="mt-5 grid grid-cols-2 gap-2.5 text-sm md:grid-cols-4 md:gap-3">
          <div className="rounded-[1.2rem] border border-[var(--line)] p-3">
            <p className="text-[var(--muted)]">{t.formationBuilder.attack}</p>
            <p className="mt-1 text-xl font-semibold text-white">{strength.attack}</p>
          </div>
          <div className="rounded-[1.2rem] border border-[var(--line)] p-3">
            <p className="text-[var(--muted)]">{t.formationBuilder.midfield}</p>
            <p className="mt-1 text-xl font-semibold text-white">{strength.midfield}</p>
          </div>
          <div className="rounded-[1.2rem] border border-[var(--line)] p-3">
            <p className="text-[var(--muted)]">{t.formationBuilder.defense}</p>
            <p className="mt-1 text-xl font-semibold text-white">{strength.defense}</p>
          </div>
          <div className="rounded-[1.2rem] border border-[var(--line)] p-3">
            <p className="text-[var(--muted)]">{locale === "nl" ? "Keeper" : "Keeper"}</p>
            <p className="mt-1 text-xl font-semibold text-white">{strength.keeper}</p>
          </div>
        </div>
      ) : mode === "from-memory" && selectedPlayers.length > 0 && selectedPlayers.length < formationShape.slots.length ? (
        <div className="mt-5 rounded-3xl border border-dashed border-[var(--line)] p-4 text-sm text-[var(--muted)]">
          {locale === "nl"
            ? "Ratings en teamsterkte blijven verborgen tot je volledige XI af is."
            : "Ratings and team strength stay hidden until your full XI is complete."}
        </div>
      ) : null}

      {!validation.valid ? (
        <div className="mt-5 rounded-3xl border border-[rgba(217,93,57,0.4)] bg-[rgba(217,93,57,0.08)] p-4 text-sm text-[var(--text)]">
          <p className="font-semibold">{t.formationBuilder.squadCheck}</p>
          <ul className="mt-2 list-disc pl-5 text-[var(--muted)]">
            {validation.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function formationShapeLength(formation: FormationId) {
  return getFormation(formation).slots.length;
}

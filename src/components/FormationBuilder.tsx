"use client";

import { getFormation, getFormationLayout } from "@/lib/formations";
import { localizedModeLabel, localizedSlotLabel, useI18n } from "@/lib/i18n";
import { calculateTeamStrength } from "@/lib/ratings";
import { validateSlotAssignments } from "@/lib/validation";
import type { FormationId, GameMode, PlayerRecord } from "@/types/game";

function formatPositions(positions: string[]) {
  return positions.map((position) => position.toUpperCase()).join(" · ");
}

interface FormationBuilderProps {
  mode: GameMode;
  formation: FormationId;
  slotAssignments: Array<PlayerRecord | null>;
  pendingPlayer: PlayerRecord | null;
  activeSlotIndex: number;
  onSlotClick: (slotIndex: number) => void;
}

export function FormationBuilder({
  mode,
  formation,
  slotAssignments,
  pendingPlayer,
  activeSlotIndex,
  onSlotClick,
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(245,228,166,0.18),transparent_22%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06),transparent_18%),repeating-linear-gradient(180deg,rgba(255,255,255,0.045)_0_10%,rgba(0,0,0,0.1)_10%_20%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),transparent_16%,transparent_84%,rgba(255,255,255,0.04))]" />
          <div className="absolute inset-0 rounded-[1.5rem] shadow-[inset_0_0_40px_rgba(0,0,0,0.26)]" />
          <div className="absolute inset-x-[6%] top-[3.5%] h-[93%] rounded-[1.2rem] border border-[rgba(255,255,255,0.14)]" />
          <div className="absolute left-[2%] top-[2%] h-6 w-6 rounded-tl-[1rem] border-l-2 border-t-2 border-[rgba(255,255,255,0.35)]" />
          <div className="absolute right-[2%] top-[2%] h-6 w-6 rounded-tr-[1rem] border-r-2 border-t-2 border-[rgba(255,255,255,0.35)]" />
          <div className="absolute bottom-[2%] left-[2%] h-6 w-6 rounded-bl-[1rem] border-b-2 border-l-2 border-[rgba(255,255,255,0.35)]" />
          <div className="absolute bottom-[2%] right-[2%] h-6 w-6 rounded-br-[1rem] border-b-2 border-r-2 border-[rgba(255,255,255,0.35)]" />
          <div className="absolute inset-x-[18%] top-[2%] h-[13%] rounded-b-[1.25rem] border-x-2 border-b-2 border-[rgba(255,255,255,0.35)]" />
          <div className="absolute inset-x-[33%] top-[2%] h-[6%] border-x-2 border-b-2 border-[rgba(255,255,255,0.35)]" />
          <div className="absolute left-1/2 top-[22%] h-[22%] w-[34%] -translate-x-1/2 rounded-b-full border-2 border-t-0 border-[rgba(255,255,255,0.28)]" />
          <div className="absolute left-1/2 top-1/2 h-0.5 w-full -translate-x-1/2 bg-[rgba(255,255,255,0.28)]" />
          <div className="absolute left-1/2 top-1/2 h-[22%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[rgba(255,255,255,0.24)]" />
          <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(255,255,255,0.35)]" />
          <div className="absolute inset-x-[18%] bottom-[2%] h-[13%] rounded-t-[1.25rem] border-x-2 border-t-2 border-[rgba(255,255,255,0.35)]" />
          <div className="absolute inset-x-[33%] bottom-[2%] h-[6%] border-x-2 border-t-2 border-[rgba(255,255,255,0.35)]" />
          <div className="absolute left-1/2 bottom-[22%] h-[22%] w-[34%] -translate-x-1/2 rounded-t-full border-2 border-b-0 border-[rgba(255,255,255,0.28)]" />

          {formationShape.slots.map((slot, index) => {
            const point = formationLayout[index];
            const pickedPlayer = slotAssignments[index];
            const isAssignable =
              !!pendingPlayer && !pickedPlayer && pendingPlayer.positions.includes(slot);
            const isActive = index === activeSlotIndex;

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
                    isAssignable || isActive ? "scale-105" : ""
                  }`}
                >
                  <div
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold shadow-lg transition md:h-12 md:w-12 md:text-sm ${
                      isAssignable
                        ? "border-[var(--gold)] bg-[rgba(245,228,166,0.98)] text-[#261b57] shadow-[0_0_0_6px_rgba(245,228,166,0.12)]"
                        : isActive
                          ? "border-[rgba(255,255,255,0.9)] bg-[linear-gradient(180deg,rgba(122,92,255,0.95),rgba(60,44,133,0.9))] text-white shadow-[0_0_0_6px_rgba(122,92,255,0.18)]"
                          : pickedPlayer
                            ? "border-[rgba(0,0,0,0.55)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(236,230,247,0.94))] text-[#171b3a]"
                            : "border-[rgba(255,255,255,0.22)] bg-[linear-gradient(180deg,rgba(31,40,93,0.9),rgba(17,23,57,0.86))] text-[rgba(255,255,255,0.82)]"
                    }`}
                  >
                    {pickedPlayer ? (
                      <span className="absolute -top-1.5 right-0 rounded-full bg-[var(--gold)] px-1.5 py-0.5 text-[8px] font-bold leading-none text-[#171b3a] md:text-[9px]">
                        {slot.toUpperCase()}
                      </span>
                    ) : null}
                    {pickedPlayer ? (revealRatings ? pickedPlayer.rating : "?") : slot.toUpperCase()}
                  </div>
                  <p className={`mt-1.5 max-w-[4.7rem] text-[9px] font-semibold uppercase tracking-[0.12em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] md:mt-2 md:max-w-[5.8rem] md:text-[10px] md:tracking-[0.14em] ${
                    isActive ? "text-[var(--gold-soft)]" : "text-[rgba(255,255,255,0.96)]"
                  }`}>
                    {pickedPlayer ? pickedPlayer.name : localizedSlotLabel(slot, index)}
                  </p>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {pendingPlayer ? (
        <div className="mt-4 rounded-[1.5rem] border border-[rgba(217,185,110,0.35)] bg-[rgba(217,185,110,0.08)] p-4">
            <p className="text-sm font-semibold text-white">
              {locale === "nl" ? `Kies positie voor ${pendingPlayer.name}` : `Choose a position for ${pendingPlayer.name}`}
            </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {openSlots
              .filter(({ slot }) => pendingPlayer.positions.includes(slot))
              .map(({ slot, index: slotIndex }) => (
                <button
                  key={`${slot}-${slotIndex}-assign`}
                  type="button"
                  disabled
                  className="rounded-full border border-[rgba(217,185,110,0.45)] px-3 py-2 text-sm text-[var(--gold-soft)]"
                >
                  {localizedSlotLabel(slot, slotIndex)}
                </button>
              ))}
          </div>
        </div>
      ) : null}

      <div className="mt-3 grid gap-2">
        {selectedPlayers.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] p-4 text-sm text-[var(--muted)]">
            {t.formationBuilder.startRolling}
          </div>
        ) : (
          slotAssignments.map((player, index) =>
            player ? (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-[1.2rem] border border-[var(--line)] bg-[rgba(255,255,255,0.02)] px-3 py-3 text-left hover:border-[rgba(217,185,110,0.45)] md:px-4"
            >
              <div>
                <p className="text-sm font-medium text-white md:text-base">
                  {localizedSlotLabel(formationShape.slots[index], index)} · {player.name}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {player.club} {player.season}
                  <span className="ml-2 text-[11px] uppercase tracking-[0.16em] text-[rgba(255,255,255,0.58)]">
                    {formatPositions(player.positions)}
                  </span>
                </p>
              </div>
              <span className="shrink-0 pl-3 text-sm text-[var(--gold-soft)]">
                {revealRatings ? player.rating : "?"}
              </span>
            </div>
            ) : null,
          )
        )}
      </div>

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

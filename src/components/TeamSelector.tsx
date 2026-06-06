"use client";

import { FormationBuilder } from "@/components/FormationBuilder";
import { LanguageToggle } from "@/components/LanguageToggle";
import { SeasonSimulator } from "@/components/SeasonSimulator";
import { players, teams } from "@/data";
import { getFormation, FORMATIONS } from "@/lib/formations";
import { useI18n } from "@/lib/i18n";
import { loadSelection, saveSelection } from "@/lib/storage";
import type {
  FormationId,
  GameMode,
  PlayerRecord,
  Position,
  TeamRecord,
} from "@/types/game";
import { useEffect, useMemo, useState } from "react";

function randomTeamIdFrom(ids: string[], previousId?: string) {
  const pool = ids.filter((id) => id !== previousId);
  const source = pool.length > 0 ? pool : ids;
  return source[Math.floor(Math.random() * source.length)] ?? ids[0];
}

const positionOrder: Position[] = ["gk", "rb", "cb", "lb", "rm", "cm", "lm", "rw", "st", "lw"];

function getTeamDecade(team: TeamRecord) {
  const startYear = Number.parseInt(team.season.slice(0, 4), 10);
  const decadeStart = Math.floor(startYear / 10) * 10;
  return `${decadeStart}s`;
}

function getPrimaryPositionOrder(player: PlayerRecord) {
  const order = player.positions
    .map((position) => positionOrder.indexOf(position))
    .filter((value) => value >= 0)
    .sort((a, b) => a - b)[0];
  return order ?? 999;
}

function formatPositions(positions: string[]) {
  return positions.map((position) => position.toUpperCase()).join(" · ");
}

export function TeamSelector() {
  const { locale, t } = useI18n();
  const [mode, setMode] = useState<GameMode>("classic");
  const [formation, setFormation] = useState<FormationId>("4-3-3");
  const [slotAssignments, setSlotAssignments] = useState<Array<PlayerRecord | null>>(
    () => Array.from({ length: 11 }, () => null),
  );
  const [rolledTeam, setRolledTeam] = useState<TeamRecord | null>(null);
  const [pendingPlayer, setPendingPlayer] = useState<PlayerRecord | null>(null);
  const [rerollUsed, setRerollUsed] = useState(false);
  const availableDecades = useMemo(
    () => [...new Set(teams.map(getTeamDecade))].sort((a, b) => a.localeCompare(b)),
    [],
  );
  const [selectedDecades, setSelectedDecades] = useState<string[]>(availableDecades);

  const formationShape = useMemo(() => getFormation(formation), [formation]);
  const selectedPlayers = useMemo(
    () => slotAssignments.filter((player): player is PlayerRecord => Boolean(player)),
    [slotAssignments],
  );
  const draftLocked = selectedPlayers.length > 0 || pendingPlayer !== null;
  const selectedPlayerIds = useMemo(() => new Set(selectedPlayers.map((player) => player.id)), [selectedPlayers]);
  const selectedPlayerNames = useMemo(
    () => new Set(selectedPlayers.map((player) => player.name.trim().toLocaleLowerCase())),
    [selectedPlayers],
  );
  const openSlots = useMemo(
    () =>
      formationShape.slots
        .map((slot, index) => ({ slot, index }))
        .filter(({ index }) => !slotAssignments[index]),
    [formationShape.slots, slotAssignments],
  );
  const filteredTeams = useMemo(
    () => teams.filter((team) => selectedDecades.includes(getTeamDecade(team))),
    [selectedDecades],
  );

  const eligibleTeamIds = useMemo(() => {
    return filteredTeams
      .filter((team) =>
        players.some(
          (player) =>
            player.teamId === team.id &&
            !selectedPlayerIds.has(player.id) &&
            !selectedPlayerNames.has(player.name.trim().toLocaleLowerCase()) &&
            openSlots.some(({ slot }) => player.positions.includes(slot)),
        ),
      )
      .map((team) => team.id);
  }, [filteredTeams, openSlots, selectedPlayerIds, selectedPlayerNames]);

  const rolledCandidates = useMemo(() => {
    if (!rolledTeam) return [];
    return players
      .filter(
        (player) =>
          player.teamId === rolledTeam.id &&
          !selectedPlayerIds.has(player.id) &&
          !selectedPlayerNames.has(player.name.trim().toLocaleLowerCase()) &&
          openSlots.some(({ slot }) => player.positions.includes(slot)),
      )
      .sort(
        (a, b) =>
          getPrimaryPositionOrder(a) - getPrimaryPositionOrder(b) ||
          b.rating - a.rating ||
          a.name.localeCompare(b.name),
      );
  }, [openSlots, rolledTeam, selectedPlayerIds, selectedPlayerNames]);

  useEffect(() => {
    const saved = loadSelection();
    if (saved.length > 0) {
      const padded = Array.from({ length: 11 }, (_, index) => saved[index] ?? null);
      setSlotAssignments(padded);
    }
  }, []);

  useEffect(() => {
    saveSelection(slotAssignments);
  }, [slotAssignments]);

  useEffect(() => {
    if (openSlots.length === 0 || eligibleTeamIds.length === 0) {
      setRolledTeam(null);
      return;
    }

    const nextId =
      rolledTeam && eligibleTeamIds.includes(rolledTeam.id)
        ? rolledTeam.id
        : randomTeamIdFrom(eligibleTeamIds);

    setRolledTeam(filteredTeams.find((team) => team.id === nextId) ?? null);
  }, [eligibleTeamIds, filteredTeams, openSlots.length, rolledTeam]);

  function resetDraft(nextFormation = formation, nextMode = mode) {
    setSlotAssignments(Array.from({ length: 11 }, () => null));
    setFormation(nextFormation);
    setMode(nextMode);
    setPendingPlayer(null);
    setRerollUsed(false);
    const nextSlots = getFormation(nextFormation).slots;
    const viableTeams = filteredTeams
      .filter((team) =>
        players.some(
          (player) => player.teamId === team.id && nextSlots.some((slot) => player.positions.includes(slot)),
        ),
      )
      .map((team) => team.id);
    setRolledTeam(filteredTeams.find((team) => team.id === randomTeamIdFrom(viableTeams)) ?? null);
  }

  function handleModeChange(modeOption: GameMode) {
    if (draftLocked && mode !== modeOption) return;
    resetDraft(formation, modeOption);
  }

  function handleFormationChange(formationOption: FormationId) {
    if (draftLocked) return;
    resetDraft(formationOption, mode);
  }

  function handleToggleDecade(decade: string) {
    if (draftLocked) return;

    setSelectedDecades((current) => {
      const next = current.includes(decade)
        ? current.filter((entry) => entry !== decade)
        : [...current, decade].sort((a, b) => a.localeCompare(b));

      return next.length > 0 ? next : current;
    });
  }

  function handleRoll() {
    if (eligibleTeamIds.length === 0 || rerollUsed) return;
    setPendingPlayer(null);
    setRerollUsed(true);
    const nextId = randomTeamIdFrom(eligibleTeamIds, rolledTeam?.id);
    setRolledTeam(teams.find((team) => team.id === nextId) ?? null);
  }

  function handlePick(player: PlayerRecord) {
    setPendingPlayer(player);
  }

  function handleAssignToSlot(slotIndex: number) {
    if (!pendingPlayer) return;
    setSlotAssignments((current) => {
      const next = [...current];
      next[slotIndex] = pendingPlayer;
      return next;
    });
    setPendingPlayer(null);
    setRolledTeam(null);
  }

  const modeCopy: Record<GameMode, { title: string; description: string }> = {
    classic: {
      title: t.common.withRating,
      description: t.teamSelector.withRatingDescription,
    },
    "from-memory": {
      title: t.common.fromMemory,
      description: t.teamSelector.fromMemoryDescription,
    },
  };

  return (
    <div className="space-y-6">
      <section className="glass rounded-[2.5rem] p-6 md:p-8">
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--gold-soft)]">
              {t.teamSelector.eyebrow}
            </p>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-6xl font-bold text-white md:text-8xl">34</span>
              <span className="mb-2 text-4xl font-semibold text-[var(--gold-soft)]">–</span>
              <span className="text-6xl font-bold text-white md:text-8xl">0</span>
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
              {t.teamSelector.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-[var(--muted)] md:text-lg">
              {t.teamSelector.description}
            </p>
          </div>

          <div className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,255,255,0.03)] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">{t.teamSelector.howItWorks}</p>
              <LanguageToggle />
            </div>
            <div className="mt-4 grid gap-3 text-sm text-[var(--muted)]">
              <p><span className="text-[var(--gold-soft)]">01</span> {t.teamSelector.step1}</p>
              <p><span className="text-[var(--gold-soft)]">02</span> {t.teamSelector.step2}</p>
              <p><span className="text-[var(--gold-soft)]">03</span> {t.teamSelector.step3}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className="glass rounded-[2rem] p-5 md:p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">{t.teamSelector.mode}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(Object.keys(modeCopy) as GameMode[]).map((modeOption) => (
                    <button
                      key={modeOption}
                      type="button"
                      onClick={() => handleModeChange(modeOption)}
                      disabled={draftLocked && mode !== modeOption}
                      className={`rounded-[1.5rem] border p-4 text-left transition ${
                        mode === modeOption
                          ? "border-[var(--gold)] bg-[rgba(217,185,110,0.12)]"
                          : "border-[var(--line)] hover:border-[rgba(217,185,110,0.4)]"
                      } ${draftLocked && mode !== modeOption ? "cursor-not-allowed opacity-45" : ""}`}
                    >
                      <p className="font-semibold text-white">{modeCopy[modeOption].title}</p>
                      <p className="mt-2 text-sm text-[var(--muted)]">{modeCopy[modeOption].description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">{t.teamSelector.formation}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {FORMATIONS.map((formationOption) => (
                    <button
                      key={formationOption.id}
                      type="button"
                      onClick={() => handleFormationChange(formationOption.id)}
                      disabled={draftLocked}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        formation === formationOption.id
                          ? "border-[var(--gold)] bg-[rgba(217,185,110,0.12)] text-[var(--gold-soft)]"
                          : "border-[var(--line)] text-[var(--muted)] hover:border-[rgba(217,185,110,0.4)]"
                      } ${draftLocked ? "cursor-not-allowed opacity-45" : ""}`}
                    >
                      {formationOption.label}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-sm text-[var(--muted)]">
                  {draftLocked
                    ? locale === "nl"
                      ? "Formatie staat nu vast. Start een nieuwe draft om die te wijzigen."
                      : "Formation is now locked. Start a new draft to change it."
                    : t.teamSelector.changeResets}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--line)] pt-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">
                  {locale === "nl" ? "Decennia" : "Decades"}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {selectedDecades.length}/{availableDecades.length}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {availableDecades.map((decade) => {
                  const active = selectedDecades.includes(decade);
                  return (
                    <button
                      key={decade}
                      type="button"
                      onClick={() => handleToggleDecade(decade)}
                      disabled={draftLocked}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        active
                          ? "border-[var(--gold)] bg-[rgba(217,185,110,0.12)] text-[var(--gold-soft)]"
                          : "border-[var(--line)] text-[var(--muted)] hover:border-[rgba(217,185,110,0.4)]"
                      } ${draftLocked ? "cursor-not-allowed opacity-45" : ""}`}
                    >
                      {decade}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-sm text-[var(--muted)]">
                {draftLocked
                  ? locale === "nl"
                    ? "Decenniumfilter staat nu vast. Start een nieuwe draft om hem te wijzigen."
                    : "Decade filter is now locked. Start a new draft to change it."
                  : locale === "nl"
                    ? "Standaard doen alle decennia mee. Beperk hier je draftpool."
                    : "All decades are included by default. Narrow your draft pool here."}
              </p>
            </div>
          </section>

          <section className="glass rounded-[2rem] p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-[var(--muted)]">{t.teamSelector.currentRoll}</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">
                  {pendingPlayer
                    ? locale === "nl"
                      ? `Wijs ${pendingPlayer.name} toe`
                      : `Assign ${pendingPlayer.name}`
                    : openSlots.length > 0
                      ? locale === "nl"
                        ? "Kies een speler uit dit team"
                        : "Choose a player from this team"
                      : t.teamSelector.xiComplete}
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {t.teamSelector.turnOf(selectedPlayers.length + 1, 11)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleRoll}
                  disabled={eligibleTeamIds.length <= 1 || rerollUsed}
                  className="rounded-full border border-[rgba(217,185,110,0.45)] px-4 py-2 text-sm text-[var(--gold-soft)] disabled:opacity-40"
                >
                  {rerollUsed
                    ? locale === "nl"
                      ? "Re-roll gebruikt"
                      : "Re-roll used"
                    : t.common.reroll}
                </button>
                <button
                  type="button"
                  onClick={() => resetDraft()}
                  className="rounded-full border border-[rgba(255,123,114,0.4)] bg-[linear-gradient(180deg,rgba(255,123,114,0.18),rgba(255,123,114,0.08))] px-4 py-2 text-sm font-semibold text-[#ffd3cf] shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition hover:border-[rgba(255,123,114,0.6)] hover:bg-[linear-gradient(180deg,rgba(255,123,114,0.24),rgba(255,123,114,0.12))]"
                >
                  {t.common.newDraft}
                </button>
              </div>
            </div>

            {rolledTeam ? (
              <div className="mt-5 rounded-[1.75rem] border border-[var(--line)] bg-[rgba(255,255,255,0.03)] p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">{t.teamSelector.rolledTeam}</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {rolledTeam.club} {rolledTeam.season}
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{rolledTeam.description}</p>
                <p className="mt-4 text-sm text-[var(--gold-soft)]">
                  {locale === "nl"
                    ? rerollUsed
                      ? "Je eenmalige re-roll is verbruikt."
                      : "Je hebt tijdens deze draft nog 1 re-roll over."
                    : rerollUsed
                      ? "Your one-time re-roll has been used."
                      : "You still have 1 re-roll available in this draft."}
                </p>
              </div>
            ) : null}
          </section>

          <section className="glass rounded-[2rem] p-5 md:p-6">
            {pendingPlayer ? (
              <div className="space-y-4">
                <div className="rounded-3xl border border-[rgba(217,185,110,0.35)] bg-[rgba(217,185,110,0.08)] p-4">
                  <p className="text-sm text-[var(--muted)]">
                    {locale === "nl"
                      ? "Gekozen speler"
                      : "Chosen player"}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-white">{pendingPlayer.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {pendingPlayer.club} {pendingPlayer.season}
                    <span className="ml-2 text-[11px] uppercase tracking-[0.16em] text-[rgba(255,255,255,0.58)]">
                      {formatPositions(pendingPlayer.positions)}
                    </span>
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {openSlots
                    .filter(({ slot }) => pendingPlayer.positions.includes(slot))
                    .map(({ slot, index: slotIndex }) => (
                      <button
                        key={`${slot}-${slotIndex}-assign-card`}
                        type="button"
                        onClick={() => handleAssignToSlot(slotIndex)}
                        className="rounded-3xl border border-[var(--line)] px-4 py-4 text-left transition hover:border-[rgba(217,185,110,0.45)]"
                      >
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                          {locale === "nl" ? "Vrije positie" : "Open position"}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {slotIndex + 1}. {slot}
                        </p>
                      </button>
                    ))}
                </div>
                <button
                  type="button"
                  onClick={() => setPendingPlayer(null)}
                  className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)]"
                >
                  {locale === "nl" ? "Andere speler kiezen" : "Pick another player"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {rolledCandidates.length > 0 ? (
                  rolledCandidates.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => handlePick(player)}
                      className="flex w-full items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3 text-left transition hover:border-[rgba(217,185,110,0.45)] hover:bg-[rgba(255,255,255,0.03)]"
                    >
                      <div>
                        <p className="font-semibold text-white">{player.name}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          <span className="text-[11px] uppercase tracking-[0.16em] text-[rgba(255,255,255,0.58)]">
                            {formatPositions(player.positions)}
                          </span>
                          <span className="mx-2">•</span>
                          {player.club} {player.season}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {openSlots
                            .filter(({ slot }) => player.positions.includes(slot))
                            .map(({ slot, index }) => (
                              <span
                                key={`${player.id}-${slot}-${index}`}
                                className="rounded-full border border-[rgba(217,185,110,0.35)] px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-[var(--gold-soft)]"
                              >
                                {slot}
                              </span>
                            ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">OVR</p>
                        <p className="text-2xl font-bold text-[var(--gold-soft)]">
                          {mode === "from-memory" && selectedPlayers.length < formationShape.slots.length
                            ? "?"
                            : player.rating}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-[2rem] border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">
                    {selectedPlayers.length === 11
                      ? t.teamSelector.completeMessage
                      : t.teamSelector.noValidOptions}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <FormationBuilder
            mode={mode}
            formation={formation}
            slotAssignments={slotAssignments}
            pendingPlayer={pendingPlayer}
          />
          <SeasonSimulator mode={mode} formation={formation} slotAssignments={slotAssignments} />
        </div>
      </section>
    </div>
  );
}

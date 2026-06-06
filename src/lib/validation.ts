import configData from "@/data/config.json";
import { assignPlayersToFormation } from "@/lib/formations";
import { getFormation } from "@/lib/formations";
import { getDictionary } from "@/lib/i18n";
import type {
  FormationId,
  GameConfig,
  Locale,
  PlayerRecord,
  Position,
  TeamRecord,
  ValidationResult,
} from "@/types/game";

const config = configData as GameConfig;

export function checkAllowedPosition(position: string): position is Position {
  return config.allowedPositions.includes(position as Position);
}

export function checkPlayerRating(player: PlayerRecord): boolean {
  return player.rating >= 40 && player.rating <= 99;
}

export function checkOnlyCruijffHas99(players: PlayerRecord[]): boolean {
  return players.every((player) =>
    player.rating === 99 ? player.name === config.onlyPlayerAllowedRating99 : true,
  );
}

export function validateSelectedSquad(
  players: PlayerRecord[],
  formationId: FormationId,
  locale: Locale = "nl",
): ValidationResult {
  const t = getDictionary(locale);
  const errors: string[] = [];

  if (players.length !== config.maxSquadSize) {
    errors.push(t.validation.selectExactly(config.maxSquadSize));
  }

  const duplicateName = findDuplicatePlayerName(players);
  if (duplicateName) {
    errors.push(t.validation.noDuplicatePlayerName(duplicateName));
  }

  const countPlayersFor = (positions: Position[]) =>
    players.filter((player) => player.positions.some((position) => positions.includes(position))).length;

  const goalkeepers = countPlayersFor(["gk"]);
  const defenders = countPlayersFor(["rb", "cb", "lb"]);
  const midfielders = countPlayersFor(["cm", "lm", "rm"]);
  const attackers = countPlayersFor(["lw", "rw", "st"]);

  if (goalkeepers !== 1) errors.push(t.validation.exactlyOneGoalkeeper);
  if (defenders < 3) errors.push(t.validation.atLeastDefenders);
  if (midfielders < 2) errors.push(t.validation.atLeastMidfielders);
  if (attackers < 1) errors.push(t.validation.atLeastAttackers);
  if (players.length === config.maxSquadSize && !assignPlayersToFormation(players, formationId)) {
    errors.push(t.validation.cannotArrange(formationId));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateSlotAssignments(
  slotAssignments: Array<PlayerRecord | null>,
  formationId: FormationId,
  locale: Locale = "nl",
): ValidationResult {
  const t = getDictionary(locale);
  const errors: string[] = [];
  const formation = getFormation(formationId);
  const filledPlayers = slotAssignments.filter((player): player is PlayerRecord => Boolean(player));

  if (filledPlayers.length !== config.maxSquadSize) {
    errors.push(t.validation.selectExactly(config.maxSquadSize));
  }

  const duplicateName = findDuplicatePlayerName(filledPlayers);
  if (duplicateName) {
    errors.push(t.validation.noDuplicatePlayerName(duplicateName));
  }

  const seenIds = new Set<string>();
  for (const [index, slot] of formation.slots.entries()) {
    const player = slotAssignments[index];
    if (!player) continue;

    if (seenIds.has(player.id)) {
      errors.push(t.validation.cannotArrange(formationId));
      break;
    }
    seenIds.add(player.id);

    if (!player.positions.includes(slot)) {
      errors.push(t.validation.cannotArrange(formationId));
      break;
    }
  }

  const goalkeepers = slotAssignments.filter((player, index) => player && formation.slots[index] === "gk").length;
  const defenders = formation.slots.filter((slot: Position) => ["rb", "cb", "lb"].includes(slot)).length;
  const midfielders = formation.slots.filter((slot: Position) => ["cm", "lm", "rm"].includes(slot)).length;
  const attackers = formation.slots.filter((slot: Position) => ["lw", "rw", "st"].includes(slot)).length;

  if (goalkeepers !== 1) errors.push(t.validation.exactlyOneGoalkeeper);
  if (defenders < 3) errors.push(t.validation.atLeastDefenders);
  if (midfielders < 2) errors.push(t.validation.atLeastMidfielders);
  if (attackers < 1) errors.push(t.validation.atLeastAttackers);

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateTeamData(teams: TeamRecord[], players: PlayerRecord[]): ValidationResult {
  const t = getDictionary("nl");
  const errors: string[] = [];
  const teamIds = new Set(teams.map((team) => team.id));

  for (const player of players) {
    if (!player.teamId) errors.push(t.validation.missingTeamId(player.name));
    if (!teamIds.has(player.teamId)) errors.push(t.validation.unknownTeamId(player.name, player.teamId));
    if (!checkPlayerRating(player)) errors.push(t.validation.invalidRating(player.name, player.rating));
    if (!player.positions.every(checkAllowedPosition)) {
      errors.push(t.validation.invalidPosition(player.name));
    }
  }

  if (!checkOnlyCruijffHas99(players)) {
    errors.push(t.validation.onlyCruijff99);
  }

  for (const team of teams) {
    const teamPlayers = players.filter((player) => player.teamId === team.id);
    if (teamPlayers.length === 0) errors.push(t.validation.teamWithoutPlayers(`${team.club} ${team.season}`));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function findDuplicatePlayerName(players: PlayerRecord[]) {
  const seenNames = new Set<string>();

  for (const player of players) {
    const normalizedName = player.name.trim().toLocaleLowerCase();
    if (seenNames.has(normalizedName)) {
      return player.name;
    }
    seenNames.add(normalizedName);
  }

  return null;
}

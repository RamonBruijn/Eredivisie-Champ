import type { PlayerRecord, Position, TeamStrength } from "@/types/game";

const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

function groupAverage(players: PlayerRecord[], positions: Position[]) {
  return average(
    players
      .filter((player) => player.positions.some((position) => positions.includes(position)))
      .map((player) => player.rating),
  );
}

export function calculateTeamStrength(selectedPlayers: PlayerRecord[]): TeamStrength {
  const baseOverall = average(selectedPlayers.map((player) => player.rating));
  const attack = groupAverage(selectedPlayers, ["lw", "rw", "st"]);
  const midfield = groupAverage(selectedPlayers, ["cm", "lm", "rm"]);
  const defense = groupAverage(selectedPlayers, ["rb", "cb", "lb"]);
  const keeper = groupAverage(selectedPlayers, ["gk"]);
  const historicalBonus =
    selectedPlayers.filter((player) => player.legendary).length * 0.22 +
    (selectedPlayers.some((player) => player.name === "Johan Cruijff") ? 1.4 : 0);
  const synergyBonus =
    Number(
      (
        selectedPlayers.filter((player) => player.club === "Ajax").length * 0.12 +
        selectedPlayers.filter((player) => player.club === "PSV").length * 0.1 +
        selectedPlayers.filter((player) => player.club === "Feyenoord").length * 0.08
      ).toFixed(1),
    ) || 0;

  const overall = Number(
    (
      baseOverall * 0.58 +
      attack * 0.14 +
      midfield * 0.12 +
      defense * 0.1 +
      keeper * 0.06 +
      historicalBonus +
      synergyBonus
    ).toFixed(1),
  );

  return {
    overall,
    attack: Number(attack.toFixed(1)),
    midfield: Number(midfield.toFixed(1)),
    defense: Number(defense.toFixed(1)),
    keeper: Number(keeper.toFixed(1)),
    historicalBonus: Number(historicalBonus.toFixed(1)),
    synergyBonus,
  };
}

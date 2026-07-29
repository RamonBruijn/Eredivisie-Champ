import type { GamePool, Locale, TeamRecord } from "@/types/game";

export const EREDIVISIE_2026_27_TAG = "eredivisie-2026-27";

export function isEredivisie202627Team(team: TeamRecord) {
  return team.season === "2026/27" && team.tags.includes(EREDIVISIE_2026_27_TAG);
}

export function filterTeamsForGamePool(
  allTeams: TeamRecord[],
  pool: GamePool,
  selectedDecades: string[],
  getTeamDecade: (team: TeamRecord) => string,
) {
  if (pool === "eredivisie-2026-27") {
    return allTeams.filter(isEredivisie202627Team);
  }

  const historicalTeams = allTeams.filter((team) => !isEredivisie202627Team(team));
  if (selectedDecades.length === 0) {
    return historicalTeams;
  }

  return historicalTeams.filter((team) => selectedDecades.includes(getTeamDecade(team)));
}

export function getGamePoolLabel(locale: Locale, pool: GamePool) {
  if (pool === "eredivisie-2026-27") {
    return locale === "nl" ? "Eredivisie 2026/2027" : "Eredivisie 2026/2027";
  }

  return locale === "nl" ? "Historisch" : "Historical";
}

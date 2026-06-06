import configData from "@/data/config.json";
import playersData from "@/data/players.json";
import teamsData from "@/data/teams.json";
import { validateTeamData } from "@/lib/validation";
import type { GameConfig, PlayerRecord, TeamRecord } from "@/types/game";

export const config = configData as GameConfig;
export const teams = teamsData as TeamRecord[];
export const players = playersData as PlayerRecord[];

const validation = validateTeamData(teams, players);

if (!validation.valid) {
  throw new Error(`Invalid game data:\n${validation.errors.join("\n")}`);
}

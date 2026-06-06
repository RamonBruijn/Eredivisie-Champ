export const POSITION_GROUPS = {
  defense: ["rb", "cb", "lb"],
  midfield: ["cm", "lm", "rm"],
  attack: ["lw", "rw", "st"],
} as const;

export type Position =
  | "gk"
  | "rb"
  | "cb"
  | "lb"
  | "cm"
  | "lm"
  | "rm"
  | "lw"
  | "rw"
  | "st";

export type FormationId =
  | "4-3-3"
  | "4-4-2"
  | "4-2-3-1"
  | "4-2-4"
  | "3-5-2"
  | "5-3-2"
  | "4-5-1"
  | "3-4-3";

export type GameMode = "classic" | "from-memory";
export type Locale = "nl" | "en";
export type SimulationMode = "auto" | "manual";

export interface DraftSetup {
  mode: GameMode;
  formation: FormationId;
  decades: string[];
}

export interface TeamRecord {
  id: string;
  club: string;
  season: string;
  teamRating: number;
  description: string;
  tags: string[];
}

export interface PlayerRecord {
  id: string;
  name: string;
  teamId: string;
  club: string;
  season: string;
  positions: Position[];
  rating: number;
  nationality?: string;
  legendary?: boolean;
}

export interface GameConfig {
  maxSquadSize: number;
  seasonMatches: number;
  onlyPlayerAllowedRating99: string;
  allowedPositions: Position[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface FormationDefinition {
  id: FormationId;
  label: string;
  slots: Position[];
}

export interface AssignedSlot {
  slotIndex: number;
  slotPosition: Position;
  player: PlayerRecord | null;
}

export interface RunContext {
  locale: Locale;
  mode: GameMode;
  formation: FormationId;
  featuredTeamId: string;
  simulationMode: SimulationMode;
}

export interface TeamStrength {
  overall: number;
  attack: number;
  midfield: number;
  defense: number;
  keeper: number;
  historicalBonus: number;
  synergyBonus: number;
}

export interface OpponentProfile {
  id: string;
  name: string;
  club: string;
  rating: number;
  defense: number;
  midfield: number;
  attack: number;
  volatility: number;
}

export interface MatchResult {
  matchNumber: number;
  round: number;
  venue: "home" | "away";
  opponent: OpponentProfile;
  goalsFor: number;
  goalsAgainst: number;
  result: "W" | "D" | "L";
  scorers: string[];
  concededScorers: string[];
  momentumDelta: number;
  narrative: string;
}

export interface LeagueTableEntry {
  teamId: string;
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface TeamScorerEntry {
  playerName: string;
  goals: number;
}

export interface MatchSnapshot {
  afterMatch: number;
  standings: LeagueTableEntry[];
  teamScorers: TeamScorerEntry[];
}

export interface SeasonSummary {
  context: RunContext;
  matches: MatchResult[];
  snapshots: MatchSnapshot[];
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  bestPlayer: string;
  topScorer: string;
  hardestMatch: MatchResult;
  runRating: number;
  wentInvincible: boolean;
  went340: boolean;
  shareText: string;
  teamStrength: TeamStrength;
}

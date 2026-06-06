import configData from "@/data/config.json";
import { players, teams } from "@/data";
import {
  calculateTeamStrength as baseCalculateTeamStrength,
} from "@/lib/ratings";
import { getDictionary } from "@/lib/i18n";
import type {
  GameConfig,
  LeagueTableEntry,
  Locale,
  MatchResult,
  MatchSnapshot,
  OpponentProfile,
  PlayerRecord,
  RunContext,
  SeasonSummary,
  TeamScorerEntry,
} from "@/types/game";

const config = configData as GameConfig;

const USER_TEAM_ID = "user-xi";
const USER_TEAM_NAME = "Your XI";

interface LeagueFixture {
  round: number;
  homeTeamId: string;
  awayTeamId: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex]!, next[index]!];
  }
  return next;
}

function randomWeightedItem<T>(items: Array<{ item: T; weight: number }>): T {
  const totalWeight = items.reduce((sum, entry) => sum + entry.weight, 0);
  let cursor = Math.random() * totalWeight;

  for (const entry of items) {
    cursor -= entry.weight;
    if (cursor <= 0) {
      return entry.item;
    }
  }

  return items[items.length - 1]!.item;
}

function createEmptyTableEntry(teamId: string, name: string): LeagueTableEntry {
  return {
    teamId,
    name,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

function sortStandings(entries: LeagueTableEntry[]) {
  return [...entries].sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.name.localeCompare(b.name),
  );
}

function applyResult(entry: LeagueTableEntry, goalsFor: number, goalsAgainst: number) {
  entry.played += 1;
  entry.goalsFor += goalsFor;
  entry.goalsAgainst += goalsAgainst;
  entry.goalDifference = entry.goalsFor - entry.goalsAgainst;

  if (goalsFor > goalsAgainst) {
    entry.wins += 1;
    entry.points += 3;
  } else if (goalsFor === goalsAgainst) {
    entry.draws += 1;
    entry.points += 1;
  } else {
    entry.losses += 1;
  }
}

function simulateFixture(homeRating: number, awayRating: number) {
  const compressedHome = compressRatingEdge(homeRating);
  const compressedAway = compressRatingEdge(awayRating);
  const baseDelta = compressedHome - compressedAway + 2.2;
  const randomSwing = (Math.random() - 0.5) * 10.5;
  const scoreTilt = baseDelta + randomSwing;

  let homeGoals = clamp(Math.round(1.05 + scoreTilt / 14 + Math.random() * 1.45), 0, 4);
  let awayGoals = clamp(Math.round(0.95 - scoreTilt / 15 + Math.random() * 1.35), 0, 4);

  if (Math.abs(scoreTilt) < 2.4 && Math.random() < 0.3) {
    const stickyScore = randomItem([
      { homeGoals: 0, awayGoals: 0 },
      { homeGoals: 1, awayGoals: 1 },
      { homeGoals: 1, awayGoals: 0 },
      { homeGoals: 0, awayGoals: 1 },
    ]);
    homeGoals = stickyScore.homeGoals;
    awayGoals = stickyScore.awayGoals;
  }

  if (scoreTilt > 6 && homeGoals <= awayGoals) homeGoals += 1;
  if (scoreTilt < -4 && awayGoals <= homeGoals) awayGoals += 1;

  return { homeGoals, awayGoals };
}

function createScorerTable(map: Map<string, number>): TeamScorerEntry[] {
  return [...map.entries()]
    .map(([playerName, goals]) => ({ playerName, goals }))
    .sort((a, b) => b.goals - a.goals || a.playerName.localeCompare(b.playerName))
    .slice(0, 8);
}

function cloneStandings(entries: LeagueTableEntry[]) {
  return entries.map((entry) => ({ ...entry }));
}

function cloneScorerTable(entries: TeamScorerEntry[]) {
  return entries.map((entry) => ({ ...entry }));
}

function getScorerWeight(player: PlayerRecord) {
  const hasStrikerRole = player.positions.includes("st");
  const hasWingRole = player.positions.some((position) => ["lw", "rw"].includes(position));
  const hasMidRole = player.positions.some((position) => ["cm", "lm", "rm"].includes(position));
  const hasDefenseRole = player.positions.some((position) => ["rb", "cb", "lb"].includes(position));

  let baseWeight = 0;

  if (hasStrikerRole) baseWeight = 1.55;
  else if (hasWingRole) baseWeight = 1.12;
  else if (hasMidRole) baseWeight = 0.78;
  else if (hasDefenseRole) baseWeight = 0.26;

  const ratingFactor = 0.72 + Math.max(0, player.rating - 64) / 28;
  const starBump = player.rating >= 92 ? 0.08 : 0;

  return Number((baseWeight * ratingFactor + starBump).toFixed(3));
}

function generateUserScorers(selectedPlayers: PlayerRecord[], goalsFor: number) {
  const weightedPool = selectedPlayers
    .map((player) => ({ item: player, weight: getScorerWeight(player) }))
    .filter((entry) => entry.weight > 0);

  return Array.from({ length: goalsFor }, () => randomWeightedItem(weightedPool).name);
}

function generateOpponentScorers(opponentTeamId: string, goalsAgainst: number) {
  const weightedPool = players
    .filter((player) => player.teamId === opponentTeamId)
    .map((player) => ({ item: player, weight: getScorerWeight(player) }))
    .filter((entry) => entry.weight > 0);

  if (weightedPool.length === 0) {
    return [];
  }

  return Array.from({ length: goalsAgainst }, () => randomWeightedItem(weightedPool).name);
}

function average(values: number[]) {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function compressRatingEdge(value: number) {
  if (value <= 84) return value;
  return 84 + (value - 84) * 0.62;
}

function buildOpponentProfile(teamId: string): OpponentProfile {
  const team = teams.find((entry) => entry.id === teamId);
  if (!team) {
    throw new Error(`Unknown opponent team: ${teamId}`);
  }

  const squad = players.filter((player) => player.teamId === teamId);
  const attack = average(
    squad
      .filter((player) => player.positions.some((position) => ["lw", "rw", "st"].includes(position)))
      .map((player) => player.rating),
  );
  const midfield = average(
    squad
      .filter((player) => player.positions.some((position) => ["cm", "lm", "rm"].includes(position)))
      .map((player) => player.rating),
  );
  const defense = average(
    squad
      .filter((player) => player.positions.some((position) => ["rb", "cb", "lb"].includes(position)))
      .map((player) => player.rating),
  );

  return {
    id: team.id,
    club: team.club,
    name: `${team.club} ${team.season}`,
    rating: team.teamRating,
    defense: Number(defense.toFixed(1)),
    midfield: Number(midfield.toFixed(1)),
    attack: Number(attack.toFixed(1)),
    volatility: Number((0.96 + Math.max(0, 96 - team.teamRating) * 0.008).toFixed(2)),
  };
}

function selectSeasonOpponents(): OpponentProfile[] {
  const teamsByClub = new Map<string, typeof teams>();
  for (const team of teams) {
    const existing = teamsByClub.get(team.club) ?? [];
    teamsByClub.set(team.club, [...existing, team]);
  }

  const clubs = shuffle([...teamsByClub.keys()]).slice(0, config.seasonMatches / 2);
  return clubs.map((club) => {
    const clubTeams = teamsByClub.get(club) ?? [];
    const chosenTeam = randomItem(clubTeams);
    return buildOpponentProfile(chosenTeam.id);
  });
}

function createLeagueSchedule(opponents: OpponentProfile[]) {
  const teamIds = [USER_TEAM_ID, ...opponents.map((opponent) => opponent.id)];
  const firstHalf = createRoundRobin(teamIds).flatMap((fixtures, roundIndex) =>
    fixtures.map((fixture) => ({
      round: roundIndex + 1,
      homeTeamId: fixture.homeTeamId,
      awayTeamId: fixture.awayTeamId,
    })),
  );

  const secondHalf = firstHalf.map((fixture) => ({
    round: fixture.round + teamIds.length - 1,
    homeTeamId: fixture.awayTeamId,
    awayTeamId: fixture.homeTeamId,
  }));

  return [...firstHalf, ...secondHalf];
}

function createRoundRobin(teamIds: string[]) {
  const rotating = [...teamIds];
  const rounds: Array<Array<Pick<LeagueFixture, "homeTeamId" | "awayTeamId">>> = [];

  for (let roundIndex = 0; roundIndex < teamIds.length - 1; roundIndex += 1) {
    const fixtures: Array<Pick<LeagueFixture, "homeTeamId" | "awayTeamId">> = [];

    for (let pairIndex = 0; pairIndex < rotating.length / 2; pairIndex += 1) {
      const homeCandidate = rotating[pairIndex]!;
      const awayCandidate = rotating[rotating.length - 1 - pairIndex]!;
      const swapHomeAway = pairIndex === 0 ? roundIndex % 2 === 1 : (roundIndex + pairIndex) % 2 === 1;

      fixtures.push({
        homeTeamId: swapHomeAway ? awayCandidate : homeCandidate,
        awayTeamId: swapHomeAway ? homeCandidate : awayCandidate,
      });
    }

    rounds.push(fixtures);
    rotating.splice(1, 0, rotating.pop()!);
  }

  return rounds;
}

export function simulateMatch(
  selectedPlayers: PlayerRecord[],
  opponent: OpponentProfile,
  venue: "home" | "away",
  round: number,
  momentum: number,
  locale: Locale,
): MatchResult {
  const t = getDictionary(locale);
  const teamStrength = baseCalculateTeamStrength(selectedPlayers);
  const compressedOverall = compressRatingEdge(teamStrength.overall);
  const compressedAttack = compressRatingEdge(teamStrength.attack);
  const compressedMidfield = compressRatingEdge(teamStrength.midfield);
  const compressedDefense = compressRatingEdge(teamStrength.defense);
  const compressedOpponentRating = compressRatingEdge(opponent.rating);
  const compressedOpponentAttack = compressRatingEdge(opponent.attack);
  const compressedOpponentMidfield = compressRatingEdge(opponent.midfield);
  const compressedOpponentDefense = compressRatingEdge(opponent.defense);
  const venueBoost = venue === "home" ? 1.35 : -2.35;
  const strengthDelta =
    compressedOverall -
    compressedOpponentRating +
    (compressedAttack - compressedOpponentDefense) * 0.07 +
    (compressedMidfield - compressedOpponentMidfield) * 0.06 +
    (compressedDefense - compressedOpponentAttack) * 0.05 +
    momentum * 0.6 +
    venueBoost;

  const randomSwing = (Math.random() - 0.5) * 9.8 * opponent.volatility;
  const upsetSwing = venue === "away" && Math.random() < 0.16 ? randomInt(-4, 3) : 0;
  const resultScore = strengthDelta + randomSwing + upsetSwing;

  let goalsFor = clamp(Math.round(1.0 + (compressedAttack - compressedOpponentDefense) / 13 + resultScore / 18), 0, 5);
  let goalsAgainst = clamp(
    Math.round(0.95 + (compressedOpponentAttack - compressedDefense) / 14 - resultScore / 21 + (venue === "away" ? 0.35 : 0)),
    0,
    5,
  );

  if (Math.abs(resultScore) < 2.8 && Math.random() < 0.36) {
    const grind = randomItem([
      { goalsFor: 0, goalsAgainst: 0 },
      { goalsFor: 1, goalsAgainst: 0 },
      { goalsFor: 0, goalsAgainst: 1 },
      { goalsFor: 1, goalsAgainst: 1 },
    ]);
    goalsFor = grind.goalsFor;
    goalsAgainst = grind.goalsAgainst;
  }

  if (resultScore > 7 && goalsFor <= goalsAgainst) goalsFor += 1;
  if (resultScore < -4 && goalsAgainst <= goalsFor) goalsAgainst += 1;

  const result = goalsFor > goalsAgainst ? "W" : goalsFor === goalsAgainst ? "D" : "L";
  const scorers = generateUserScorers(selectedPlayers, goalsFor);
  const concededScorers = generateOpponentScorers(opponent.id, goalsAgainst);
  const momentumDelta = result === "W" ? 0.4 : result === "D" ? -0.05 : -0.55;

  return {
    matchNumber: round,
    round,
    venue,
    opponent,
    goalsFor,
    goalsAgainst,
    result,
    scorers,
    concededScorers,
    momentumDelta,
    narrative: randomItem(
      result === "W"
        ? t.simulation.winNarratives
        : result === "D"
          ? t.simulation.drawNarratives
          : t.simulation.lossNarratives,
    ),
  };
}

export function simulateSeason(selectedPlayers: PlayerRecord[], context: RunContext): SeasonSummary {
  const t = getDictionary(context.locale);
  const opponents = selectSeasonOpponents();
  const schedule = createLeagueSchedule(opponents);
  const matches: MatchResult[] = [];
  const snapshots: MatchSnapshot[] = [];
  const scorerMap = new Map<string, number>();
  const standings = new Map<string, LeagueTableEntry>();
  let momentum = 0;
  const teamStrength = baseCalculateTeamStrength(selectedPlayers);
  const profiles = new Map<string, OpponentProfile>();

  profiles.set(USER_TEAM_ID, {
    id: USER_TEAM_ID,
    club: USER_TEAM_NAME,
    name: USER_TEAM_NAME,
    rating: teamStrength.overall,
    defense: teamStrength.defense,
    midfield: teamStrength.midfield,
    attack: teamStrength.attack,
    volatility: 1.0,
  });

  standings.set(USER_TEAM_ID, createEmptyTableEntry(USER_TEAM_ID, USER_TEAM_NAME));
  for (const opponent of opponents) {
    standings.set(opponent.id, createEmptyTableEntry(opponent.id, opponent.name));
    profiles.set(opponent.id, opponent);
  }

  for (let round = 1; round <= config.seasonMatches; round += 1) {
    const roundFixtures = schedule.filter((fixture) => fixture.round === round);
    let userMatch: MatchResult | null = null;

    for (const fixture of roundFixtures) {
      const involvesUser = fixture.homeTeamId === USER_TEAM_ID || fixture.awayTeamId === USER_TEAM_ID;

      if (involvesUser) {
        const opponentId = fixture.homeTeamId === USER_TEAM_ID ? fixture.awayTeamId : fixture.homeTeamId;
        const opponent = profiles.get(opponentId)!;
        const venue = fixture.homeTeamId === USER_TEAM_ID ? ("home" as const) : ("away" as const);

        const match = simulateMatch(selectedPlayers, opponent, venue, round, momentum, context.locale);
        userMatch = match;
        matches.push(match);
        momentum = clamp(momentum + match.momentumDelta, -1.8, 2.6);

        applyResult(standings.get(USER_TEAM_ID)!, match.goalsFor, match.goalsAgainst);
        applyResult(standings.get(opponent.id)!, match.goalsAgainst, match.goalsFor);

        for (const scorer of match.scorers) {
          scorerMap.set(scorer, (scorerMap.get(scorer) ?? 0) + 1);
        }
      } else {
        const home = profiles.get(fixture.homeTeamId)!;
        const away = profiles.get(fixture.awayTeamId)!;
        const { homeGoals, awayGoals } = simulateFixture(home.rating, away.rating);

        applyResult(standings.get(home.id)!, homeGoals, awayGoals);
        applyResult(standings.get(away.id)!, awayGoals, homeGoals);
      }
    }

    if (!userMatch) {
      throw new Error(`No user fixture found for round ${round}`);
    }

    snapshots.push({
      afterMatch: round,
      standings: cloneStandings(sortStandings([...standings.values()])),
      teamScorers: cloneScorerTable(createScorerTable(scorerMap)),
    });
  }

  const wins = matches.filter((match) => match.result === "W").length;
  const draws = matches.filter((match) => match.result === "D").length;
  const losses = matches.length - wins - draws;
  const goalsFor = matches.reduce((sum, match) => sum + match.goalsFor, 0);
  const goalsAgainst = matches.reduce((sum, match) => sum + match.goalsAgainst, 0);
  const points = wins * 3 + draws;
  const bestPlayer = [...selectedPlayers].sort((a, b) => b.rating - a.rating)[0]?.name ?? t.simulation.unknown;
  const topScorer = createScorerTable(scorerMap)[0]?.playerName ?? bestPlayer;
  const hardestMatch =
    [...matches].sort(
      (a, b) =>
        b.opponent.rating - a.opponent.rating ||
        (b.goalsAgainst - b.goalsFor) - (a.goalsAgainst - a.goalsFor),
    )[0] ?? matches[0];
  const went340 = wins === config.seasonMatches;
  const wentInvincible = losses === 0;
  const runRating = clamp(
    Math.round(points * 0.72 + (goalsFor - goalsAgainst) * 0.38 + teamStrength.overall * 0.22),
    70,
    100,
  );

  return {
    context,
    matches,
    snapshots,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    points,
    bestPlayer,
    topScorer,
    hardestMatch,
    runRating,
    wentInvincible,
    went340,
    shareText: t.simulation.share(context.formation, wins, draws, losses, bestPlayer, topScorer),
    teamStrength,
  };
}

export function calculateTeamStrength(selectedPlayers: PlayerRecord[]) {
  return baseCalculateTeamStrength(selectedPlayers);
}

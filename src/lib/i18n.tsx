"use client";

import type { FormationId, GameMode, Locale, Position } from "@/types/game";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LOCALE_KEY = "eredivisie-champ-locale";

type Dictionary = {
  common: {
    language: string;
    dutch: string;
    english: string;
    withRating: string;
    fromMemory: string;
    newDraft: string;
    reroll: string;
    empty: string;
    currentPick: string;
    picked: string;
    selected: string;
    none: string;
    result: string;
    shareText: string;
  };
  home: {
    eyebrow: string;
    title: string;
    description: string;
    start: string;
    subtitle: string;
    blurb1Title: string;
    blurb1Body: string;
    blurb2Title: string;
    blurb2Body: string;
    blurb3Title: string;
    blurb3Body: string;
  };
  teamSelector: {
    eyebrow: string;
    title: string;
    description: string;
    howItWorks: string;
    withRatingDescription: string;
    fromMemoryDescription: string;
    step1: string;
    step2: string;
    step3: string;
    mode: string;
    formation: string;
    changeResets: string;
    currentRoll: string;
    pickFor: string;
    xiComplete: string;
    turnOf: (current: number, total: number) => string;
    rolledTeam: string;
    completeMessage: string;
    noValidOptions: string;
  };
  formationBuilder: {
    yourXi: string;
    draftFlow: string;
    pickOnePerRoll: string;
    draftDescription: string;
    teamStrength: string;
    attack: string;
    midfield: string;
    defense: string;
    squadCheck: string;
    startRolling: string;
  };
  season: {
    run: string;
    title: string;
    description: string;
    challenge: (formation: FormationId) => string;
    simulating: string;
    simulate: string;
  };
  result: {
    finalRecord: string;
    classic: string;
    fromMemory: string;
    rolled: (team: string) => string;
    perfect: string;
    invincible: string;
    memorable: string;
    copyShare: string;
    points: string;
    goalsFor: string;
    goalsAgainst: string;
    runRating: string;
    bestPlayer: string;
    topScorer: string;
    hardestMatch: string;
    noRun: string;
    noRunBody: string;
    backToBuilder: string;
    playAgain: string;
    matchday: (n: number) => string;
    scorers: string;
  };
  validation: {
    selectExactly: (n: number) => string;
    exactlyOneGoalkeeper: string;
    atLeastDefenders: string;
    atLeastMidfielders: string;
    atLeastAttackers: string;
    cannotArrange: (formation: FormationId) => string;
    noDuplicatePlayerName: (name: string) => string;
    onlyCruijff99: string;
    invalidPosition: (name: string) => string;
    invalidRating: (name: string, rating: number) => string;
    missingTeamId: (name: string) => string;
    unknownTeamId: (name: string, teamId: string) => string;
    teamWithoutPlayers: (label: string) => string;
  };
  simulation: {
    unknown: string;
    winNarratives: string[];
    drawNarratives: string[];
    lossNarratives: string[];
    share: (formation: FormationId, wins: number, draws: number, losses: number, best: string, scorer: string) => string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  nl: {
    common: {
      language: "Taal",
      dutch: "Nederlands",
      english: "English",
      withRating: "Met rating",
      fromMemory: "Uit het hoofd",
      newDraft: "Nieuwe draft",
      reroll: "Roll opnieuw",
      empty: "Leeg",
      currentPick: "Huidige pick",
      picked: "Gekozen",
      selected: "geselecteerd",
      none: "Geen",
      result: "Resultaat",
      shareText: "Deeltekst",
    },
    home: {
      eyebrow: "Eredivisie Champ",
      title: "Bouw een historische XI. Jaag op de onmogelijke 34-0.",
      description: "Kies uit legendarische Eredivisie-teams, draft je droomelftal en simuleer een volledig seizoen volledig in de browser.",
      start: "Start spel",
      subtitle: "Kun jij 34-0 gaan?",
      blurb1Title: "Geen backend in v1",
      blurb1Body: "Alle data leeft in JSON in de repo. Geen database, accounts of API-keys.",
      blurb2Title: "Fun boven steriliteit",
      blurb2Body: "Cruijff, Romario en Litmanen mogen de competitie breken, maar chaos blijft bestaan.",
      blurb3Title: "Alleen lokale saves",
      blurb3Body: "Je laatste run blijft in localStorage, dus deze eerste versie blijft goedkoop en veilig.",
    },
    teamSelector: {
      eyebrow: "Dream Eredivisie Draft · 1965 — nu",
      title: "Roll the dice. Kies er één. Vul je XI.",
      description: "Kies een mode, zet je formatie vast en doorloop 11 rolls. Elke roll geeft je een willekeurig historisch team met opties voor precies de volgende plek in je elftal.",
      howItWorks: "Zo werkt het",
      withRatingDescription: "Je ziet ratings en kiest zo slim mogelijk uit elke roll.",
      fromMemoryDescription: "Geen ratings. Alleen geheugen, vibes en voetbalhersenen.",
      step1: "Kies `met rating` of `uit het hoofd`.",
      step2: "Roll een team voor de huidige formatieplek.",
      step3: "Kies precies 1 speler en vul zo 11 slots.",
      mode: "Modus",
      formation: "Formatie",
      changeResets: "Veranderen van modus of formatie start een nieuwe draft.",
      currentRoll: "Huidige roll",
      pickFor: "Kies voor",
      xiComplete: "XI compleet",
      turnOf: (current, total) => `Beurt ${current} van ${total}`,
      rolledTeam: "Gerold team",
      completeMessage: "Je XI is compleet. Tijd om te simuleren.",
      noValidOptions: "Geen geldige opties gevonden voor deze slot-roll.",
    },
    formationBuilder: {
      yourXi: "Jouw XI",
      draftFlow: "Draftflow",
      pickOnePerRoll: "Kies één speler per roll",
      draftDescription: "Elke roll geeft je een willekeurig historisch team met opties voor de huidige positie.",
      teamStrength: "Teamsterkte",
      attack: "Aanval",
      midfield: "Middenveld",
      defense: "Verdediging",
      squadCheck: "Squadcheck",
      startRolling: "Begin met rollen. Je vult je formatie van links naar rechts, één slot per beurt.",
    },
    season: {
      run: "Seizoensrun",
      title: "Kan deze XI 34-0 gaan?",
      description: "De engine draait volledig client-side met momentum en een beetje Eredivisie-onzin.",
      challenge: (formation) => `Draft klaar? Simuleer je ${formation} en kijk of deze roll-built XI 34-0 kan najagen.`,
      simulating: "Simuleren...",
      simulate: "Simuleer 34 wedstrijden",
    },
    result: {
      finalRecord: "Eindrecord",
      classic: "Met rating",
      fromMemory: "Uit het hoofd",
      rolled: (team) => `Gerold: ${team}`,
      perfect: "Een perfect seizoen. Belachelijk sterk werk.",
      invincible: "Nog steeds ongeslagen. Niet helemaal 34-0, maar de competitie had hier geen zin in.",
      memorable: "Niet foutloos, wel memorabel.",
      copyShare: "Kopieer deeltekst",
      points: "Punten",
      goalsFor: "Doelpunten voor",
      goalsAgainst: "Doelpunten tegen",
      runRating: "Run rating",
      bestPlayer: "Beste speler",
      topScorer: "Topscorer",
      hardestMatch: "Moeilijkste wedstrijd",
      noRun: "Nog geen run gevonden",
      noRunBody: "Bouw eerst je XI en simuleer daarna een seizoen om het resultaatscherm te zien.",
      backToBuilder: "Terug naar draft",
      playAgain: "Nogmaals spelen",
      matchday: (n) => `Speelronde ${n}`,
      scorers: "Doelpuntenmakers",
    },
    validation: {
      selectExactly: (n) => `Selecteer precies ${n} spelers.`,
      exactlyOneGoalkeeper: "Je XI heeft precies 1 keeper nodig.",
      atLeastDefenders: "Je XI heeft minimaal 3 verdedigers nodig.",
      atLeastMidfielders: "Je XI heeft minimaal 2 middenvelders nodig.",
      atLeastAttackers: "Je XI heeft minimaal 1 aanvaller nodig.",
      cannotArrange: (formation) => `Deze XI past niet in ${formation}.`,
      noDuplicatePlayerName: (name) => `${name} mag maar één keer in je XI voorkomen.`,
      onlyCruijff99: "Alleen Johan Cruijff mag rating 99 hebben.",
      invalidPosition: (name) => `${name} heeft een ongeldige positie.`,
      invalidRating: (name, rating) => `${name} heeft een ongeldige rating ${rating}.`,
      missingTeamId: (name) => `${name} mist teamId.`,
      unknownTeamId: (name, teamId) => `${name} verwijst naar onbekende teamId ${teamId}.`,
      teamWithoutPlayers: (label) => `${label} heeft geen spelers.`,
    },
    simulation: {
      unknown: "Onbekend",
      winNarratives: [
        "Een verzorgde prestatie met genoeg vintage flair om de hele competitie nerveus te maken.",
        "Je elftal klikte vroeg en liet daarna niet meer los.",
        "Weer zo'n avond waarop alles precies in elkaar viel.",
      ],
      drawNarratives: [
        "Zo'n lastige uitdag waarop de magie even haperde.",
        "Te veel kansen gemist, precies genoeg drama om de run spannend te houden.",
        "Het voetbal was goed, de afronding opvallend menselijk.",
      ],
      lossNarratives: [
        "Een klassieke Eredivisie-bananenschil. Op papier dominant, op de counter gestraft.",
        "De upset-generator werd wakker en koos geweld.",
        "Zo'n wilde wedstrijd waarin chaos de ratings negeerde.",
      ],
      share: (formation, wins, draws, losses, best, scorer) =>
        `Ik draftte een ${formation} Eredivisie all-time XI en ging ${wins}-${draws}-${losses}. ${best} trok de kar en ${scorer} maakte het af.`,
    },
  },
  en: {
    common: {
      language: "Language",
      dutch: "Nederlands",
      english: "English",
      withRating: "With ratings",
      fromMemory: "From memory",
      newDraft: "New draft",
      reroll: "Roll again",
      empty: "Empty",
      currentPick: "Current pick",
      picked: "Picked",
      selected: "selected",
      none: "None",
      result: "Result",
      shareText: "Share text",
    },
    home: {
      eyebrow: "Eredivisie Champ",
      title: "Build a historic XI. Chase the impossible 34-0.",
      description: "Pick from legendary Eredivisie teams, draft your dream eleven, and simulate a full season entirely in the browser.",
      start: "Start game",
      subtitle: "Can you go 34-0?",
      blurb1Title: "No backend in v1",
      blurb1Body: "All data lives in repo JSON. No database, accounts, or API keys.",
      blurb2Title: "Fun over sterile realism",
      blurb2Body: "Cruijff, Romario and Litmanen can break the league, but chaos still exists.",
      blurb3Title: "Local-only saves",
      blurb3Body: "Your latest run stays in localStorage, so the first version stays cheap and safe.",
    },
    teamSelector: {
      eyebrow: "Dream Eredivisie Draft · 1965 — now",
      title: "Roll the dice. Pick one. Fill your XI.",
      description: "Choose a mode, lock your formation, and go through 11 rolls. Every roll gives you a random historic team with options for exactly the next slot in your lineup.",
      howItWorks: "How it works",
      withRatingDescription: "You can see ratings and make the sharpest pick from every roll.",
      fromMemoryDescription: "No ratings. Just memory, vibes, and football brain.",
      step1: "Choose `with ratings` or `from memory`.",
      step2: "Roll a team for the current formation slot.",
      step3: "Pick exactly 1 player and fill all 11 slots.",
      mode: "Mode",
      formation: "Formation",
      changeResets: "Changing mode or formation starts a new draft.",
      currentRoll: "Current roll",
      pickFor: "Pick for",
      xiComplete: "XI complete",
      turnOf: (current, total) => `Turn ${current} of ${total}`,
      rolledTeam: "Rolled team",
      completeMessage: "Your XI is complete. Time to simulate.",
      noValidOptions: "No valid options found for this slot roll.",
    },
    formationBuilder: {
      yourXi: "Your XI",
      draftFlow: "Draft flow",
      pickOnePerRoll: "Pick one player per roll",
      draftDescription: "Each roll gives you a random historic team with options for the current slot.",
      teamStrength: "Team strength",
      attack: "Attack",
      midfield: "Midfield",
      defense: "Defense",
      squadCheck: "Squad check",
      startRolling: "Start rolling. You will fill your formation from left to right, one slot at a time.",
    },
    season: {
      run: "Season run",
      title: "Can this XI go 34-0?",
      description: "The engine runs fully client-side with momentum and a little Eredivisie nonsense.",
      challenge: (formation) => `Draft complete? Simulate your ${formation} and see if this roll-built XI can chase 34-0.`,
      simulating: "Simulating...",
      simulate: "Simulate 34 matches",
    },
    result: {
      finalRecord: "Final record",
      classic: "With ratings",
      fromMemory: "From memory",
      rolled: (team) => `Rolled: ${team}`,
      perfect: "A perfect season. Ridiculous work.",
      invincible: "Still unbeaten. Not quite 34-0, but the league hated facing you.",
      memorable: "Not flawless, but definitely memorable.",
      copyShare: "Copy share text",
      points: "Points",
      goalsFor: "Goals for",
      goalsAgainst: "Goals against",
      runRating: "Run rating",
      bestPlayer: "Best player",
      topScorer: "Top scorer",
      hardestMatch: "Hardest match",
      noRun: "No run found yet",
      noRunBody: "Build your XI first, then simulate a season to see the result screen.",
      backToBuilder: "Back to draft",
      playAgain: "Play again",
      matchday: (n) => `Matchday ${n}`,
      scorers: "Scorers",
    },
    validation: {
      selectExactly: (n) => `Select exactly ${n} players.`,
      exactlyOneGoalkeeper: "Your XI needs exactly 1 goalkeeper.",
      atLeastDefenders: "Your XI needs at least 3 defenders.",
      atLeastMidfielders: "Your XI needs at least 2 midfielders.",
      atLeastAttackers: "Your XI needs at least 1 attacker.",
      cannotArrange: (formation) => `This XI cannot be arranged into ${formation}.`,
      noDuplicatePlayerName: (name) => `${name} can only appear once in your XI.`,
      onlyCruijff99: "Only Johan Cruijff may have rating 99.",
      invalidPosition: (name) => `${name} has an invalid position.`,
      invalidRating: (name, rating) => `${name} has invalid rating ${rating}.`,
      missingTeamId: (name) => `${name} is missing teamId.`,
      unknownTeamId: (name, teamId) => `${name} references unknown teamId ${teamId}.`,
      teamWithoutPlayers: (label) => `${label} has no players.`,
    },
    simulation: {
      unknown: "Unknown",
      winNarratives: [
        "A polished performance with enough vintage swagger to scare the whole league.",
        "Your side clicked early and never really let go.",
        "Another night where everything clicked a little too well.",
      ],
      drawNarratives: [
        "One of those awkward away days where the magic stuttered.",
        "Too many chances wasted, just enough drama to keep the run honest.",
        "The football was good, the finishing was merely human.",
      ],
      lossNarratives: [
        "A classic Eredivisie banana skin. Dominant on paper, punished in transition.",
        "The upset generator woke up and chose violence.",
        "One wild match where chaos ignored the ratings.",
      ],
      share: (formation, wins, draws, losses, best, scorer) =>
        `I drafted a ${formation} Eredivisie all-time XI and went ${wins}-${draws}-${losses}. ${best} led the way and ${scorer} finished the job.`,
    },
  },
};

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("nl");

  useEffect(() => {
    const saved = window.localStorage.getItem(LOCALE_KEY);
    if (saved === "nl" || saved === "en") {
      setLocaleState(saved);
    }
  }, []);

  function setLocale(locale: Locale) {
    setLocaleState(locale);
    window.localStorage.setItem(LOCALE_KEY, locale);
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: dictionaries[locale],
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function localizedModeLabel(locale: Locale, mode: GameMode) {
  const t = getDictionary(locale);
  return mode === "classic" ? t.result.classic : t.result.fromMemory;
}

export function localizedSlotLabel(position: Position, index: number) {
  return `${index + 1}. ${position}`;
}

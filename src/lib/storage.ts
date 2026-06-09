import type { DraftSetup, PlayerRecord, SeasonSummary } from "@/types/game";

const SELECTION_KEY = "eredivisie-champ-selection";
const RESULT_KEY = "eredivisie-champ-result";
const DRAFT_SETUP_KEY = "eredivisie-champ-draft-setup";
const SEASON_RUN_COUNT_KEY = "eredivisie-champ-season-run-count";
const DRAFT_LOCK_KEY = "eredivisie-champ-draft-locked";

type StoredSelection = Array<PlayerRecord | null>;

function hasWindow() {
  return typeof window !== "undefined";
}

export function saveSelection(players: StoredSelection) {
  if (!hasWindow()) return;
  window.localStorage.setItem(SELECTION_KEY, JSON.stringify(players));
}

export function clearSelection() {
  if (!hasWindow()) return;
  window.localStorage.removeItem(SELECTION_KEY);
}

export function loadSelection(): StoredSelection {
  if (!hasWindow()) return [];
  const raw = window.localStorage.getItem(SELECTION_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as StoredSelection;
  } catch {
    return [];
  }
}

export function saveResult(result: SeasonSummary) {
  if (!hasWindow()) return;
  window.localStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export function loadResult(): SeasonSummary | null {
  if (!hasWindow()) return null;
  const raw = window.localStorage.getItem(RESULT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SeasonSummary;
  } catch {
    return null;
  }
}

export function saveDraftSetup(setup: DraftSetup) {
  if (!hasWindow()) return;
  window.localStorage.setItem(DRAFT_SETUP_KEY, JSON.stringify(setup));
}

export function loadDraftSetup(): DraftSetup | null {
  if (!hasWindow()) return null;
  const raw = window.localStorage.getItem(DRAFT_SETUP_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DraftSetup;
  } catch {
    return null;
  }
}

export function incrementSeasonRunCount() {
  if (!hasWindow()) return 0;

  const nextCount = loadSeasonRunCount() + 1;
  window.localStorage.setItem(SEASON_RUN_COUNT_KEY, String(nextCount));
  return nextCount;
}

export function loadSeasonRunCount() {
  if (!hasWindow()) return 0;

  const raw = window.localStorage.getItem(SEASON_RUN_COUNT_KEY);
  if (!raw) return 0;

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function lockDraft() {
  if (!hasWindow()) return;
  window.localStorage.setItem(DRAFT_LOCK_KEY, "1");
}

export function unlockDraft() {
  if (!hasWindow()) return;
  window.localStorage.removeItem(DRAFT_LOCK_KEY);
}

export function isDraftLocked() {
  if (!hasWindow()) return false;
  return window.localStorage.getItem(DRAFT_LOCK_KEY) === "1";
}

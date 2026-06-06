import type { PlayerRecord, SeasonSummary } from "@/types/game";

const SELECTION_KEY = "eredivisie-champ-selection";
const RESULT_KEY = "eredivisie-champ-result";

type StoredSelection = Array<PlayerRecord | null>;

function hasWindow() {
  return typeof window !== "undefined";
}

export function saveSelection(players: StoredSelection) {
  if (!hasWindow()) return;
  window.localStorage.setItem(SELECTION_KEY, JSON.stringify(players));
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

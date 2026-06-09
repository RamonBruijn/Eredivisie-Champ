import type {
  AssignedSlot,
  FormationDefinition,
  FormationId,
  PlayerRecord,
  Position,
} from "@/types/game";

export interface FormationPoint {
  x: number;
  y: number;
}

export const FORMATIONS: FormationDefinition[] = [
  { id: "4-3-3", label: "4-3-3", slots: ["gk", "rb", "cb", "cb", "lb", "cm", "cm", "cm", "rw", "st", "lw"] },
  { id: "4-4-2", label: "4-4-2", slots: ["gk", "rb", "cb", "cb", "lb", "rm", "cm", "cm", "lm", "st", "st"] },
  { id: "4-2-3-1", label: "4-2-3-1", slots: ["gk", "rb", "cb", "cb", "lb", "cm", "cm", "rw", "cm", "lw", "st"] },
  { id: "4-2-4", label: "4-2-4", slots: ["gk", "rb", "cb", "cb", "lb", "cm", "cm", "rw", "st", "st", "lw"] },
  { id: "3-5-2", label: "3-5-2", slots: ["gk", "cb", "cb", "cb", "rm", "cm", "cm", "cm", "lm", "st", "st"] },
  { id: "5-3-2", label: "5-3-2", slots: ["gk", "rb", "cb", "cb", "cb", "lb", "cm", "cm", "cm", "st", "st"] },
  { id: "4-5-1", label: "4-5-1", slots: ["gk", "rb", "cb", "cb", "lb", "rm", "cm", "cm", "cm", "lm", "st"] },
  { id: "3-4-3", label: "3-4-3", slots: ["gk", "cb", "cb", "cb", "rm", "cm", "cm", "lm", "rw", "st", "lw"] },
];

const positionPriority: Position[] = ["gk", "cb", "cm", "st", "rb", "lb", "rm", "lm", "rw", "lw"];

const FORMATION_LAYOUTS: Record<FormationId, FormationPoint[]> = {
  "4-3-3": [
    { x: 50, y: 90 },
    { x: 85, y: 72 },
    { x: 60, y: 76 },
    { x: 40, y: 76 },
    { x: 15, y: 72 },
    { x: 28, y: 48 },
    { x: 50, y: 54 },
    { x: 72, y: 48 },
    { x: 82, y: 24 },
    { x: 50, y: 18 },
    { x: 18, y: 24 },
  ],
  "4-4-2": [
    { x: 50, y: 90 },
    { x: 85, y: 72 },
    { x: 60, y: 76 },
    { x: 40, y: 76 },
    { x: 15, y: 72 },
    { x: 84, y: 48 },
    { x: 62, y: 52 },
    { x: 38, y: 52 },
    { x: 16, y: 48 },
    { x: 62, y: 22 },
    { x: 38, y: 22 },
  ],
  "4-2-3-1": [
    { x: 50, y: 90 },
    { x: 85, y: 72 },
    { x: 60, y: 76 },
    { x: 40, y: 76 },
    { x: 15, y: 72 },
    { x: 40, y: 58 },
    { x: 60, y: 58 },
    { x: 82, y: 38 },
    { x: 50, y: 40 },
    { x: 18, y: 38 },
    { x: 50, y: 18 },
  ],
  "4-2-4": [
    { x: 50, y: 90 },
    { x: 85, y: 72 },
    { x: 60, y: 76 },
    { x: 40, y: 76 },
    { x: 15, y: 72 },
    { x: 40, y: 56 },
    { x: 60, y: 56 },
    { x: 84, y: 24 },
    { x: 60, y: 18 },
    { x: 40, y: 18 },
    { x: 16, y: 24 },
  ],
  "3-5-2": [
    { x: 50, y: 90 },
    { x: 72, y: 74 },
    { x: 50, y: 78 },
    { x: 28, y: 74 },
    { x: 84, y: 50 },
    { x: 32, y: 52 },
    { x: 50, y: 56 },
    { x: 68, y: 52 },
    { x: 16, y: 50 },
    { x: 62, y: 22 },
    { x: 38, y: 22 },
  ],
  "5-3-2": [
    { x: 50, y: 90 },
    { x: 88, y: 68 },
    { x: 68, y: 74 },
    { x: 50, y: 76 },
    { x: 32, y: 74 },
    { x: 12, y: 68 },
    { x: 30, y: 48 },
    { x: 50, y: 52 },
    { x: 70, y: 48 },
    { x: 62, y: 22 },
    { x: 38, y: 22 },
  ],
  "4-5-1": [
    { x: 50, y: 90 },
    { x: 85, y: 72 },
    { x: 60, y: 76 },
    { x: 40, y: 76 },
    { x: 15, y: 72 },
    { x: 84, y: 48 },
    { x: 32, y: 52 },
    { x: 50, y: 56 },
    { x: 68, y: 52 },
    { x: 16, y: 48 },
    { x: 50, y: 18 },
  ],
  "3-4-3": [
    { x: 50, y: 90 },
    { x: 72, y: 74 },
    { x: 50, y: 78 },
    { x: 28, y: 74 },
    { x: 84, y: 48 },
    { x: 38, y: 52 },
    { x: 62, y: 52 },
    { x: 16, y: 48 },
    { x: 82, y: 24 },
    { x: 50, y: 18 },
    { x: 18, y: 24 },
  ],
};

const FORMATION_SLOT_NUMBERS: Record<FormationId, number[]> = {
  "4-3-3": [1, 2, 3, 4, 5, 6, 8, 10, 7, 9, 11],
  "4-4-2": [1, 2, 3, 4, 5, 7, 6, 8, 11, 9, 10],
  "4-2-3-1": [1, 2, 3, 4, 5, 6, 8, 7, 10, 11, 9],
  "4-2-4": [1, 2, 3, 4, 5, 6, 8, 7, 9, 10, 11],
  "3-5-2": [1, 2, 3, 4, 7, 8, 10, 6, 5, 9, 18],
  "5-3-2": [1, 2, 3, 4, 6, 5, 8, 19, 10, 9, 11],
  "4-5-1": [1, 2, 3, 4, 5, 7, 6, 8, 10, 11, 9],
  "3-4-3": [1, 2, 3, 4, 7, 8, 10, 17, 27, 9, 11],
};

export function getFormation(formationId: FormationId): FormationDefinition {
  return FORMATIONS.find((formation) => formation.id === formationId) ?? FORMATIONS[0];
}

export function getFormationLayout(formationId: FormationId): FormationPoint[] {
  return FORMATION_LAYOUTS[formationId] ?? FORMATION_LAYOUTS["4-3-3"];
}

export function getFormationSlotNumber(formationId: FormationId, slotIndex: number) {
  return FORMATION_SLOT_NUMBERS[formationId]?.[slotIndex] ?? slotIndex + 1;
}

function getPlayerFlexScore(player: PlayerRecord) {
  return player.positions.length;
}

export function assignPlayersToFormation(
  players: PlayerRecord[],
  formationId: FormationId,
): AssignedSlot[] | null {
  const formation = getFormation(formationId);
  const slots: AssignedSlot[] = formation.slots.map((slotPosition, slotIndex) => ({
    slotIndex,
    slotPosition,
    player: null,
  }));

  const sortedSlots = [...slots].sort(
    (a, b) => positionPriority.indexOf(a.slotPosition) - positionPriority.indexOf(b.slotPosition),
  );
  const remainingPlayers = [...players].sort((a, b) => getPlayerFlexScore(a) - getPlayerFlexScore(b));

  for (const slot of sortedSlots) {
    const playerIndex = remainingPlayers.findIndex((player) => player.positions.includes(slot.slotPosition));
    if (playerIndex === -1) {
      return null;
    }
    slot.player = remainingPlayers[playerIndex];
    remainingPlayers.splice(playerIndex, 1);
  }

  return slots;
}

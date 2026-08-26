import type { GameCard } from "../shared/types";

export const CARD_W = 130;
export const CARD_H = 150;
export const GAP = 18;

export const DESIGN_W = 960;
export const DESIGN_H = 720;

export const HAND_GAP = 12;
export const BACK_W = 65;
export const BACK_H = 75;
export const BACK_GAP = 6;

export const OPP_NAME_Y = 12;
export const OPP_HAND_Y = 36;
export const OPP_BOARD_Y = 120;

export const CENTER_Y = 280;
export const CENTER_H = 96;

export const CUR_BOARD_Y = 388;
export const CUR_NAME_Y = 546;
export const CUR_HAND_Y = 570;

export const DECK_W = 90;
export const DECK_H = 100;
export const DECK_X = 48;
export const OPP_DECK_Y = OPP_BOARD_Y + (CARD_H - DECK_H) / 2;
export const CUR_DECK_Y = CUR_BOARD_Y + (CARD_H - DECK_H) / 2;

export const BOARD_TOTAL = 3 * CARD_W + 2 * GAP;
export const HAND_TOTAL = 5 * CARD_W + 4 * HAND_GAP;
export const BACKS_TOTAL = 5 * BACK_W + 4 * BACK_GAP;

export function centerX(width: number): number {
	return (DESIGN_W - width) / 2;
}

export function boardX(slot: number): number {
	return centerX(BOARD_TOTAL) + slot * (CARD_W + GAP);
}

export function handX(slot: number): number {
	return centerX(HAND_TOTAL) + slot * (CARD_W + HAND_GAP);
}

export function backsX(slot: number): number {
	return centerX(BACKS_TOTAL) + slot * (BACK_W + BACK_GAP);
}

function inside(cx: number, cy: number, x: number, y: number): boolean {
	return cx >= x && cx <= x + CARD_W && cy >= y && cy <= y + CARD_H;
}

/** Finds which board slot (owner + index) contains the given logical point. */
export function findTarget(
	currentName: string,
	opponentName: string | null,
	cx: number,
	cy: number,
): { owner: string; slot: number } | null {
	for (let slot = 0; slot < 3; slot++) {
		if (inside(cx, cy, boardX(slot), CUR_BOARD_Y)) {
			return { owner: currentName, slot };
		}
	}
	if (opponentName) {
		for (let pos = 0; pos < 3; pos++) {
			if (inside(cx, cy, boardX(pos), OPP_BOARD_Y)) {
				return { owner: opponentName, slot: 2 - pos };
			}
		}
	}
	return null;
}

export function isPlayable(phase: string, card: GameCard | null): boolean {
	if (phase === "deploy") return card?.type === "bot";
	if (phase === "action") return card?.type === "action";
	return false;
}

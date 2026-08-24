import { cardsOfType } from "../shared/cards";
import type { Card } from "../shared/types";

function shuffle<T>(items: T[]): T[] {
	const arr = [...items];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

export interface DefaultDeck {
	/** The player's designated starter bot. */
	starter: Card;
	/** The remaining 20 cards: 5 bots and 15 non-bot cards. */
	deck: Card[];
}

/**
 * A new player's starting cards: a random starter bot plus a deck of 5 bots and
 * 15 non-bot cards. Returns deep copies so runtime mutations never touch the
 * master card list.
 */
export function createDefaultDeck(): DefaultDeck {
	const bots = shuffle(cardsOfType("bot")).slice(0, 6);
	const actions = shuffle(cardsOfType("action")).slice(0, 15);

	const [starter, ...restBots] = bots.map((c) => structuredClone(c));
	return {
		starter,
		deck: [...restBots, ...actions.map((c) => structuredClone(c))],
	};
}

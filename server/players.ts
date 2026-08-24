import type { Player, ServerState } from "../shared/types";
import { createDefaultDeck } from "./deck";

/** Returns the player with this name, creating them (and a default deck) if needed. */
export function getOrCreatePlayer(state: ServerState, name: string): Player {
	const existing = state.players.find((p) => p.name === name);
	if (existing) return existing;

	const { starter, deck } = createDefaultDeck();
	const player: Player = { name, starter, deck };
	state.players.push(player);
	return player;
}

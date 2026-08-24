import { randomUUID } from "node:crypto";
import type { Card, Game, GamePlayer, GameSummary, ServerState } from "../shared/types";

const clone = <T>(value: T): T => structuredClone(value);

function findPlayer(state: ServerState, name: string) {
	return state.players.find((p) => p.name === name);
}

/** Returns the id of the game the named user is in (as player or observer), if any. */
export function playerInGame(state: ServerState, name: string): string | null {
	for (const game of Object.values(state.games)) {
		if (game.players.some((p) => p.name === name) || game.observers.includes(name)) {
			return game.id;
		}
	}
	return null;
}

function makeGamePlayer(player: { name: string; starter: Card; deck: Card[] }): GamePlayer {
	const starter = clone(player.starter);
	return {
		name: player.name,
		starter,
		deck: player.deck.map(clone),
		board: [null, starter, null],
	};
}

export function createGame(state: ServerState, name: string): Game | null {
	if (playerInGame(state, name)) return null;
	const player = findPlayer(state, name);
	if (!player) return null;

	const game: Game = {
		id: randomUUID(),
		players: [makeGamePlayer(player)],
		observers: [],
		scrapPile: [],
	};
	state.games[game.id] = game;
	return game;
}

export type JoinResult =
	| { game: Game; role: "player" | "observer" }
	| { error: string };

export function joinGame(state: ServerState, gameId: string, name: string): JoinResult {
	const game = state.games[gameId];
	if (!game) return { error: "Game not found" };

	if (game.players.some((p) => p.name === name)) return { game, role: "player" };
	if (game.observers.includes(name)) return { game, role: "observer" };

	const elsewhere = playerInGame(state, name);
	if (elsewhere) return { error: "Already in a game" };

	if (game.players.length < 2) {
		const player = findPlayer(state, name);
		if (!player) return { error: "Not a registered player" };
		game.players.push(makeGamePlayer(player));
		return { game, role: "player" };
	}

	game.observers.push(name);
	return { game, role: "observer" };
}

/** Removes the user from any game they're in, deleting empty games. Returns the game if one was affected. */
export function leaveGame(state: ServerState, name: string): Game | null {
	for (const [id, game] of Object.entries(state.games)) {
		const wasPlayer = game.players.some((p) => p.name === name);
		const wasObserver = game.observers.includes(name);
		if (!wasPlayer && !wasObserver) continue;

		game.players = game.players.filter((p) => p.name !== name);
		game.observers = game.observers.filter((o) => o !== name);

		if (game.players.length === 0 && game.observers.length === 0) {
			delete state.games[id];
		}
		return game;
	}
	return null;
}

export function summarizeGames(state: ServerState): GameSummary[] {
	return Object.values(state.games)
		.map((g) => ({
			id: g.id,
			players: g.players.map((p) => p.name),
			playerCount: g.players.length,
			open: g.players.length < 2,
			observerCount: g.observers.length,
		}))
		.sort((a, b) => a.id.localeCompare(b.id));
}

import { describe, expect, it } from "vitest";
import type { Game, ServerState } from "../shared/types";
import { createGame, joinGame, leaveGame, playerInGame, summarizeGames } from "./games";
import { getOrCreatePlayer } from "./players";

function freshState(names: string[]): ServerState {
	const state: ServerState = { players: [], games: {} };
	for (const n of names) getOrCreatePlayer(state, n);
	return state;
}

function expectGame(game: Game | null): Game {
	if (!game) throw new Error("expected a game");
	return game;
}

describe("games", () => {
	it("creates a game with the creator as the first player and their starter in the middle", () => {
		const state = freshState(["Alice"]);
		const game = expectGame(createGame(state, "Alice"));
		expect(game.players).toHaveLength(1);
		expect(game.players[0].name).toBe("Alice");
		expect(game.players[0].board).toEqual([null, game.players[0].starter, null]);
		expect(game.observers).toEqual([]);
		expect(playerInGame(state, "Alice")).toBe(game.id);
	});

	it("does not let a player in a game create another", () => {
		const state = freshState(["Alice"]);
		const first = expectGame(createGame(state, "Alice"));
		expect(createGame(state, "Alice")).toBeNull();
		expect(Object.keys(state.games)).toHaveLength(1);
		expect(state.games[first.id].players[0].name).toBe("Alice");
	});

	it("lets a second player join as a player", () => {
		const state = freshState(["Alice", "Bob"]);
		const game = expectGame(createGame(state, "Alice"));
		const res = joinGame(state, game.id, "Bob");
		expect(res).not.toHaveProperty("error");
		expect(game.players.map((p) => p.name)).toEqual(["Alice", "Bob"]);
	});

	it("makes a third user an observer when the game is full", () => {
		const state = freshState(["Alice", "Bob", "Carol"]);
		const game = expectGame(createGame(state, "Alice"));
		joinGame(state, game.id, "Bob");
		const res = joinGame(state, game.id, "Carol");
		expect(res).toHaveProperty("game");
		expect((res as { role: string }).role).toBe("observer");
		expect(game.players.map((p) => p.name)).toEqual(["Alice", "Bob"]);
		expect(game.observers).toContain("Carol");
	});

	it("rejects joining another game while already in one", () => {
		const state = freshState(["Alice", "Bob"]);
		const g1 = expectGame(createGame(state, "Alice"));
		const g2 = expectGame(createGame(state, "Bob"));
		const res = joinGame(state, g2.id, "Alice");
		expect(res).toEqual({ error: "Already in a game" });
		expect(g2.players.map((p) => p.name)).toEqual(["Bob"]);
		expect(Object.keys(state.games)).toContain(g1.id);
	});

	it("leaving removes the player and deletes an empty game", () => {
		const state = freshState(["Alice"]);
		const game = expectGame(createGame(state, "Alice"));
		const left = leaveGame(state, "Alice");
		expect(left?.id).toBe(game.id);
		expect(playerInGame(state, "Alice")).toBeNull();
		expect(state.games[game.id]).toBeUndefined();
	});

	it("summarizes games with open/observer state", () => {
		const state = freshState(["Alice", "Bob", "Carol"]);
		const g1 = expectGame(createGame(state, "Alice"));
		joinGame(state, g1.id, "Bob");
		const res = joinGame(state, g1.id, "Carol");
		expect((res as { role: string }).role).toBe("observer");

		const summary = summarizeGames(state).find((s) => s.id === g1.id);
		expect(summary).toMatchObject({
			players: ["Alice", "Bob"],
			playerCount: 2,
			open: false,
			observerCount: 1,
		});
	});
});

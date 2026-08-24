import { io } from "socket.io-client";
import { useGameStore } from "./store";
import type { Game, GameSummary, Player } from "../shared/types";

/** Single shared socket connection for the whole SPA. */
export const socket = io();

export interface Ack {
	ok: boolean;
	error?: string;
}

export interface LoginAck extends Ack {
	player?: Player;
}

export interface GameAck extends Ack {
	game?: Game;
	role?: "player" | "observer";
	removed?: boolean;
}

export function emitLogin(username: string, cb?: (res: LoginAck) => void): void {
	socket.emit("login", { username }, cb);
}

export function requestGames(cb?: (res: { games: GameSummary[] }) => void): void {
	socket.emit("games", cb);
}

export function emitCreateGame(cb?: (res: GameAck) => void): void {
	socket.emit("createGame", cb);
}

export function emitJoinGame(gameId: string, cb?: (res: GameAck) => void): void {
	socket.emit("joinGame", { gameId }, cb);
}

export function emitLeaveGame(cb?: (res: GameAck) => void): void {
	socket.emit("leaveGame", cb);
}

/** Registers global socket listeners and restores a saved session, if any. */
export function initSocket(): void {
	socket.on("players", ({ players }: { players: Player[] }) => {
		useGameStore.getState().setPlayers(players);
	});

	socket.on("games", ({ games }: { games: GameSummary[] }) => {
		useGameStore.getState().setGames(games);
	});

	socket.on(
		"gameUpdate",
		({ game }: { game: Game }) => {
			useGameStore.getState().setActiveGame(game);
			const { username } = useGameStore.getState();
			useGameStore.getState().setMyGameId(game.id);
			if (username) {
				const isPlayer = game.players.some((p) => p.name === username);
				const isObserver = game.observers.includes(username);
				if (!isPlayer && !isObserver) {
					useGameStore.getState().setMyGameId(null);
				}
			}
		},
	);

	const saved = localStorage.getItem("botbash.username");
	if (saved) {
		emitLogin(saved);
	}
}

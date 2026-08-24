import type { Server as SocketServer } from "socket.io";
import type { Game, ServerState } from "../shared/types";
import {
	createGame,
	joinGame,
	leaveGame,
	playerInGame,
	summarizeGames,
} from "./games";
import { getOrCreatePlayer } from "./players";

interface SocketData {
	username?: string;
	gameId?: string;
	role?: "player" | "observer";
}

export function registerSocketHandlers(
	io: SocketServer,
	state: ServerState,
): void {
	function broadcastPlayers(): void {
		io.emit("players", { players: state.players });
	}

	function broadcastGames(): void {
		io.emit("games", { games: summarizeGames(state) });
	}

	function broadcastGame(game: Game): void {
		if (!state.games[game.id]) return;
		io.to(game.id).emit("gameUpdate", { game });
	}

	function loggedInName(socket: { data: SocketData }): string | null {
		return socket.data.username ?? null;
	}

	io.on("connection", (socket) => {
		const data = socket.data as SocketData;

		socket.on(
			"login",
			(payload: unknown, cb?: (res: unknown) => void) => {
				const name = String(
					(payload as { username?: unknown } | undefined)?.username ?? "",
				).trim();
				if (!name) {
					cb?.({ ok: false, error: "username is required" });
					return;
				}

				const player = getOrCreatePlayer(state, name);
				data.username = name;

				cb?.({ ok: true, player });
				broadcastPlayers();

				// Re-establish room membership if this player is already in a game.
				const gameId = playerInGame(state, name);
				if (gameId) {
					data.gameId = gameId;
					data.role = state.games[gameId].players.some((p) => p.name === name)
						? "player"
						: "observer";
					socket.join(gameId);
					broadcastGame(state.games[gameId]);
				}
			},
		);

		socket.on("games", (cb?: (res: unknown) => void) => {
			cb?.({ games: summarizeGames(state) });
		});

		socket.on(
			"createGame",
			(cb?: (res: unknown) => void) => {
				const name = loggedInName(socket);
				if (!name) {
					cb?.({ ok: false, error: "not logged in" });
					return;
				}
				const game = createGame(state, name);
				if (!game) {
					cb?.({ ok: false, error: "already in a game or not registered" });
					return;
				}
				data.gameId = game.id;
				data.role = "player";
				socket.join(game.id);
				cb?.({ ok: true, game });
				broadcastGames();
				broadcastGame(game);
			},
		);

		socket.on(
			"joinGame",
			(payload: unknown, cb?: (res: unknown) => void) => {
				const name = loggedInName(socket);
				if (!name) {
					cb?.({ ok: false, error: "not logged in" });
					return;
				}
				const gameId = String((payload as { gameId?: unknown })?.gameId ?? "");
				const res = joinGame(state, gameId, name);
				if ("error" in res) {
					cb?.({ ok: false, error: res.error });
					return;
				}
				const { game, role } = res;
				if (data.gameId && data.gameId !== game.id) socket.leave(data.gameId);
				data.gameId = game.id;
				data.role = role;
				socket.join(game.id);
				cb?.({ ok: true, game, role });
				broadcastGames();
				broadcastGame(game);
			},
		);

		socket.on("leaveGame", (cb?: (res: unknown) => void) => {
			const name = loggedInName(socket);
			if (!name) {
				cb?.({ ok: false, error: "not logged in" });
				return;
			}
			const game = leaveGame(state, name);
			if (!game) {
				cb?.({ ok: true, removed: false });
				return;
			}
			if (data.gameId === game.id) {
				data.gameId = undefined;
				data.role = undefined;
			}
			socket.leave(game.id);
			cb?.({ ok: true, removed: true, game });
			broadcastGames();
			broadcastGame(game);
		});

		socket.on("disconnect", () => {
			const name = data.username;
			if (name && data.role === "observer" && data.gameId) {
				const gameId = data.gameId;
				leaveGame(state, name);
				broadcastGames();
				if (state.games[gameId]) broadcastGame(state.games[gameId]);
			}
			// Players persist across disconnects; only the binding clears.
			data.username = undefined;
			data.gameId = undefined;
			data.role = undefined;
		});
	});
}

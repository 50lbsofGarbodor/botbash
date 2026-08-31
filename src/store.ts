import { create } from "zustand";
import type { Game, GameEvent, GameSummary, Player } from "../shared/types";

const USERNAME_KEY = "botbash.username";

interface GameStore {
	username: string;
	players: Player[];
	games: GameSummary[];
	myGameId: string | null;
	activeGame: Game | null;
	pendingEvents: GameEvent[] | null;
	setUsername: (name: string) => void;
	setPlayers: (players: Player[]) => void;
	setGames: (games: GameSummary[]) => void;
	setMyGameId: (gameId: string | null) => void;
	setActiveGame: (game: Game | null, events?: GameEvent[] | null) => void;
	clearEvents: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
	username: localStorage.getItem(USERNAME_KEY) ?? "",
	players: [],
	games: [],
	myGameId: null,
	activeGame: null,
	pendingEvents: null,
	setUsername: (username) => {
		localStorage.setItem(USERNAME_KEY, username);
		set({ username });
	},
	setPlayers: (players) => set({ players }),
	setGames: (games) => set({ games }),
	setMyGameId: (myGameId) => set({ myGameId }),
	setActiveGame: (activeGame, pendingEvents = null) =>
		set({ activeGame, pendingEvents }),
	clearEvents: () => set({ pendingEvents: null }),
}));

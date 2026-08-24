import { create } from "zustand";
import type { Game, GameSummary, Player } from "../shared/types";

const USERNAME_KEY = "botbash.username";

interface GameStore {
	username: string;
	players: Player[];
	games: GameSummary[];
	myGameId: string | null;
	activeGame: Game | null;
	setUsername: (name: string) => void;
	setPlayers: (players: Player[]) => void;
	setGames: (games: GameSummary[]) => void;
	setMyGameId: (gameId: string | null) => void;
	setActiveGame: (game: Game | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
	username: localStorage.getItem(USERNAME_KEY) ?? "",
	players: [],
	games: [],
	myGameId: null,
	activeGame: null,
	setUsername: (username) => {
		localStorage.setItem(USERNAME_KEY, username);
		set({ username });
	},
	setPlayers: (players) => set({ players }),
	setGames: (games) => set({ games }),
	setMyGameId: (myGameId) => set({ myGameId }),
	setActiveGame: (activeGame) => set({ activeGame }),
}));

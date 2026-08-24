import type { ServerState } from "../shared/types";

/**
 * The single source of truth for application state. Lives in-memory in the
 * server process and is never persisted.
 */
export const state: ServerState = {
	players: [],
	games: {},
};

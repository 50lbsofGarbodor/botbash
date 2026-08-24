import { describe, expect, it } from "vitest";
import { state } from "./state";

describe("state", () => {
	it("starts empty", () => {
		expect(state.players).toEqual([]);
		expect(state.games).toEqual({});
	});
});

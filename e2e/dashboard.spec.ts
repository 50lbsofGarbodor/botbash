import { expect, test } from "@playwright/test";
import {
	BASE,
	createGame,
	login,
	resetServer,
	uniqueName,
	waitForBoard,
} from "./helpers";

test("Leave works from the dashboard via SPA navigation", async ({ browser }) => {
	await resetServer();
	const aName = uniqueName("Alice");
	const bName = uniqueName("Bob");

	const ctxA = await browser.newContext();
	const alice = await ctxA.newPage();
	await login(alice, aName);
	const gameId = await createGame(alice);

	const ctxB = await browser.newContext();
	const bob = await ctxB.newPage();
	await login(bob, bName);
	await bob.goto(`${BASE}/games/${gameId}`);
	await waitForBoard(bob);

	// SPA navigate back to the dashboard (no reload).
	await bob.getByRole("link", { name: /Back to dashboard/i }).click();
	await bob.waitForURL("**/dashboard");

	await expect(bob.getByRole("button", { name: /^Leave$/ })).toBeVisible();
	await bob.getByRole("button", { name: /^Leave$/ }).click();

	// After leaving, the "you are in game" banner disappears.
	await expect(bob.getByText(/You are in game/i)).toHaveCount(0);

	await ctxA.close();
	await ctxB.close();
});

test("Delete works from the dashboard via SPA navigation", async ({ browser }) => {
	await resetServer();
	const aName = uniqueName("Alice");
	const bName = uniqueName("Bob");

	const ctxA = await browser.newContext();
	const alice = await ctxA.newPage();
	await login(alice, aName);
	const gameId = await createGame(alice);

	const ctxB = await browser.newContext();
	const bob = await ctxB.newPage();
	await login(bob, bName);
	await bob.goto(`${BASE}/games/${gameId}`);
	await waitForBoard(bob);

	await bob.getByRole("link", { name: /Back to dashboard/i }).click();
	await bob.waitForURL("**/dashboard");

	await expect(bob.getByRole("button", { name: /^Delete$/ })).toBeVisible();
	await bob.getByRole("button", { name: /^Delete$/ }).click();

	await expect(bob.getByText(`#${gameId.slice(0, 8)}`)).toHaveCount(0);

	await ctxA.close();
	await ctxB.close();
});

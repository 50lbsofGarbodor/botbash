import { expect, test } from "@playwright/test";
import {
	createGame,
	joinFirstOpenGame,
	login,
	resetServer,
	uniqueName,
	waitForBoard,
} from "./helpers";

test("login, create, join, then the game appears on the dashboard", async ({
	browser,
}) => {
	await resetServer();
	const aliceName = uniqueName("Alice");
	const bobName = uniqueName("Bob");

	const ctxA = await browser.newContext();
	const alice = await ctxA.newPage();
	await login(alice, aliceName);
	const gameId = await createGame(alice);

	const ctxB = await browser.newContext();
	const bob = await ctxB.newPage();
	await login(bob, bobName);
	await joinFirstOpenGame(bob);

	await waitForBoard(alice);
	await waitForBoard(bob);

	await alice.goto("http://localhost:3000/dashboard");
	await expect(alice.getByText(`#${gameId.slice(0, 8)}`)).toBeVisible();

	await ctxA.close();
	await ctxB.close();
});

test("a player can delete the game from the dashboard", async ({ browser }) => {
	await resetServer();
	const aliceName = uniqueName("Alice");
	const bobName = uniqueName("Bob");

	const ctxA = await browser.newContext();
	const alice = await ctxA.newPage();
	await login(alice, aliceName);
	await createGame(alice);

	const ctxB = await browser.newContext();
	const bob = await ctxB.newPage();
	await login(bob, bobName);
	await joinFirstOpenGame(bob);

	await bob.goto("http://localhost:3000/dashboard");
	await expect(bob.getByRole("button", { name: /Delete/i })).toBeVisible();
	await bob.getByRole("button", { name: /Delete/i }).click();
	await expect(bob.getByText(/No games yet/i)).toBeVisible();

	await ctxA.close();
	await ctxB.close();
});

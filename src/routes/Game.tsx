import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useGameStore } from "../store";
import { emitJoinGame } from "../socket";
import type { GameCard } from "../../shared/types";

function BoardSlot({ card }: { card: GameCard | null }) {
	return (
		<div
			style={{
				width: 90,
				height: 120,
				border: "1px solid #888",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			{card ? (
				<>
					<span>{card.name}</span>
					<span>
						{card.hp.current}/{card.hp.max}
					</span>
				</>
			) : (
				<span style={{ color: "#999" }}>empty</span>
			)}
		</div>
	);
}

export default function Game() {
	const { uuid } = useParams<{ uuid: string }>();
	const username = useGameStore((s) => s.username);
	const activeGame = useGameStore((s) => s.activeGame);

	useEffect(() => {
		if (uuid) emitJoinGame(uuid);
	}, [uuid]);

	if (!activeGame || activeGame.id !== uuid) {
		return <p>Joining game…</p>;
	}

	const isPlayer = activeGame.players.some((p) => p.name === username);
	const isObserver = activeGame.observers.includes(username);

	return (
		<div>
			<h1>Game {activeGame.id.slice(0, 8)}</h1>
			{!isPlayer && isObserver && <p>(observing)</p>}

			{activeGame.players.map((player) => (
				<section key={player.name}>
					<h2>
						{player.name}
						{player.name === username ? " (you)" : ""}
					</h2>
					<p>Deck: {player.deck.length} cards</p>
					<div style={{ display: "flex", gap: 8 }}>
						{player.board.map((card, slot) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: board slot position is the stable, meaningful key
							<BoardSlot key={slot} card={card} />
						))}
					</div>
				</section>
			))}

			<p>
				Observers: {activeGame.observers.join(", ") || "none"}
			</p>

			<Link to="/dashboard">Back to dashboard</Link>
		</div>
	);
}

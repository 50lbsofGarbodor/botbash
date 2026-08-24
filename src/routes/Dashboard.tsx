import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGameStore } from "../store";
import { emitCreateGame, emitJoinGame, emitLeaveGame, requestGames } from "../socket";

export default function Dashboard() {
	const username = useGameStore((s) => s.username);
	const players = useGameStore((s) => s.players);
	const games = useGameStore((s) => s.games);
	const myGameId = useGameStore((s) => s.myGameId);
	const navigate = useNavigate();

	useEffect(() => {
		requestGames();
	}, []);

	function onCreate() {
		emitCreateGame((res) => {
			if (res.ok && res.game) {
				navigate(`/games/${res.game.id}`);
			} else {
				alert(res.error ?? "Could not create game");
			}
		});
	}

	function onJoin(gameId: string) {
		emitJoinGame(gameId, (res) => {
			if (res.ok && res.game) {
				navigate(`/games/${res.game.id}`);
			} else {
				alert(res.error ?? "Could not join game");
			}
		});
	}

	function onLeave() {
		emitLeaveGame();
	}

	function onRejoin() {
		if (myGameId) navigate(`/games/${myGameId}`);
	}

	const myGame = games.find((g) => g.id === myGameId);

	return (
		<div>
			<h1>Dashboard</h1>
			<p>
				Logged in as <strong>{username}</strong>
			</p>

			{myGame && (
				<div>
					<p>
						You are in game <strong>{myGame.id.slice(0, 8)}</strong>
					</p>
					<button type="button" onClick={onRejoin}>
						Rejoin
					</button>
					<button type="button" onClick={onLeave}>
						Leave
					</button>
				</div>
			)}

			<h2>Games</h2>
			<button type="button" onClick={onCreate}>
				Create Game
			</button>
			<ul>
				{games.map((g) => (
					<li key={g.id}>
						<Link to={`/games/${g.id}`}>{g.id.slice(0, 8)}</Link> —{" "}
						{g.players.join(", ") || "no players"} ({g.playerCount}/2 players,{" "}
						{g.observerCount} observing)
						{myGameId !== g.id && (
							<button type="button" onClick={() => onJoin(g.id)}>
								{g.open ? "Join" : "Observe"}
							</button>
						)}
					</li>
				))}
			</ul>

			<h2>Players</h2>
			<ul>
				{players.map((p) => (
					<li key={p.name}>
						{p.name} <span>(starter + {p.deck.length} cards)</span>
					</li>
				))}
			</ul>

			<Link to="/">Change user</Link>
		</div>
	);
}

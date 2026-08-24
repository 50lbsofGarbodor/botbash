import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store";
import { emitLogin } from "../socket";

export default function Login() {
	const setUsername = useGameStore((s) => s.setUsername);
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	function listGames(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = name.trim();
		if (!trimmed) return;
		emitLogin(trimmed, (res) => {
			if (res.ok) {
				setUsername(trimmed);
				navigate("/dashboard");
			} else {
				setError(res.error ?? "Login failed");
			}
		});
	}

	return (
		<form onSubmit={listGames}>
			<label>
				Username
				<input value={name} onChange={(e) => setName(e.target.value)} />
			</label>
			<button type="submit">List Games</button>
			{error && <p>{error}</p>}
		</form>
	);
}

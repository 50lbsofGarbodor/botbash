import { Route, Routes } from "react-router-dom";
import Login from "./routes/Login";
import Dashboard from "./routes/Dashboard";
import Game from "./routes/Game";

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Login />} />
			<Route path="/dashboard" element={<Dashboard />} />
			<Route path="/games/:uuid" element={<Game />} />
		</Routes>
	);
}

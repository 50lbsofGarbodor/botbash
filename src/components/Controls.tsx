import { Group, Rect, Text } from "react-konva";
import type { Palette } from "../theme";

/** A small Konva push button used for in-board controls (Pass / Scrap Hand). */
export function GameButton({
	x,
	y,
	width,
	height,
	label,
	highlight,
	onClick,
	palette,
}: {
	x: number;
	y: number;
	width: number;
	height: number;
	label: string;
	highlight?: boolean;
	onClick?: () => void;
	palette: Palette;
}) {
	const fill = highlight ? palette.ember : palette.panelDeep;
	const stroke = highlight ? palette.ember : palette.muted;
	const text = highlight ? palette.void : palette.glow;

	return (
		<Group x={x} y={y} onClick={onClick} onTap={onClick}>
			<Rect
				width={width}
				height={height}
				cornerRadius={6}
				fill={fill}
				stroke={stroke}
				strokeWidth={1}
			/>
			<Text
				width={width}
				height={height}
				align="center"
				verticalAlign="middle"
				text={label}
				fontSize={12}
				fontFamily="Orbitron, sans-serif"
				letterSpacing={1}
				fill={text}
				listening={false}
			/>
		</Group>
	);
}

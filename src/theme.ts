export interface Palette {
	void: string;
	panel: string;
	panelDeep: string;
	neonPink: string;
	neonCyan: string;
	neonPurple: string;
	rust: string;
	rustDeep: string;
	ember: string;
	glow: string;
	muted: string;
}

const VARS: Record<keyof Palette, string> = {
	void: "--void",
	panel: "--panel",
	panelDeep: "--panel-deep",
	neonPink: "--neon-pink",
	neonCyan: "--neon-cyan",
	neonPurple: "--neon-purple",
	rust: "--rust",
	rustDeep: "--rust-deep",
	ember: "--ember",
	glow: "--glow",
	muted: "--muted",
};

/**
 * Reads the theme palette from the CSS variables defined in index.css.
 * Konva shapes can't use Tailwind classes, so this is the bridge between the
 * Tailwind `@theme` tokens and canvas rendering.
 */
export function getPalette(): Palette {
	const styles = getComputedStyle(document.documentElement);
	const result = {} as Palette;
	for (const key of Object.keys(VARS) as (keyof Palette)[]) {
		result[key] = styles.getPropertyValue(VARS[key]).trim();
	}
	return result;
}

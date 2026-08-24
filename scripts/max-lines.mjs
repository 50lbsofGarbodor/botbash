#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const LIMIT = Number(process.argv[2]) || 300;
const ROOT = process.cwd();
const DIRS = ["src", "server", "shared"];
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);

/**
 * Counts the lines that contain code, ignoring blank lines and comments
 * (both `//` line comments and `/* ... *\/` blocks, including multi-line ones).
 */
function countCodeLines(source) {
	let count = 0;
	let inBlock = false;

	for (const raw of source.split("\n")) {
		const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
		let hasCode = false;
		let i = 0;

		while (i < line.length) {
			const c = line[i];
			const next = line[i + 1];

			if (inBlock) {
				if (c === "*" && next === "/") {
					inBlock = false;
					i += 2;
				} else {
					i += 1;
				}
				continue;
			}

			if (c === "/" && next === "/") break;
			if (c === "/" && next === "*") {
				inBlock = true;
				i += 2;
				continue;
			}
			if (c === " " || c === "\t") {
				i += 1;
				continue;
			}

			hasCode = true;
			i += 1;
		}

		if (hasCode) count += 1;
	}

	return count;
}

function collectFiles(dir) {
	const out = [];
	for (const entry of readdirSync(join(ROOT, dir))) {
		const full = join(ROOT, dir, entry);
		if (statSync(full).isDirectory()) {
			out.push(...collectFiles(join(dir, entry)));
		} else if (EXTS.has(extname(entry))) {
			out.push(full);
		}
	}
	return out;
}

const files = DIRS.flatMap(collectFiles);
const violations = [];

for (const file of files) {
	const lines = countCodeLines(readFileSync(file, "utf8"));
	if (lines > LIMIT) {
		violations.push({ file: file.slice(ROOT.length + 1), lines });
	}
}

if (violations.length > 0) {
	for (const v of violations) {
		console.error(`FAIL ${v.file}: ${v.lines} code lines (limit ${LIMIT})`);
	}
	console.error(`\n${violations.length} file(s) exceed ${LIMIT} lines of code.`);
	process.exit(1);
}

console.log(`OK: ${files.length} file(s) at or under ${LIMIT} code lines.`);

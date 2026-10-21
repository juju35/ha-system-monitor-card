// Bundles src/system-monitor-card.js into the single HACS file dist/system-monitor-card.js,
// inlining the Home Assistant logo so the card needs no extra resource.
// Usage: node scripts/build.mjs  (dist/ is not committed: CI and the release workflow build it)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}package.json`, "utf8"));
const img = readFileSync(`${root}images/home-assistant.svg`).toString("base64");

const out = readFileSync(`${root}src/system-monitor-card.js`, "utf8")
  .replace("__VERSION__", pkg.version)
  .replace("__IMG_LOGO__", `data:image/svg+xml;base64,${img}`);

const target = `${root}dist/system-monitor-card.js`;
mkdirSync(`${root}dist`, { recursive: true });
writeFileSync(target, out);
console.log(`Built dist/system-monitor-card.js (${(out.length / 1024).toFixed(1)} KB)`);

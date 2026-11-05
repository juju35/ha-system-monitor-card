// The README screenshots rendered by scripts/screenshots.mjs: one entry per PNG in screenshots/.
// Every screenshot is rendered in both themes from one setup, so a light/dark pair shows exactly the
// same state and only the theme changes. `light` / `dark` are the file names (two older pairs use the
// bare name for the dark one, kept so the README links do not move).
const pairs = [
  { light: "card", dark: "card-dark", type: "system-monitor-card", width: 460, config: {}, procsOk: true },
  { light: "mini-card", dark: "mini-card-dark", type: "system-monitor-mini-card", width: 380, config: {} },
  { light: "mini-card-zoom", dark: "mini-card-zoom-dark", type: "system-monitor-mini-card", width: 460, config: {}, procsOk: true, zoom: true },
];

export const shots = pairs.flatMap(({ light, dark, ...setup }) => [
  { file: light, theme: "light", ...setup },
  { file: dark, theme: "dark", ...setup },
]);

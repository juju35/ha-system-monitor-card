// Renders the cards with mock System Monitor data and saves the README screenshots.
// Usage: npm run build && npm run screenshots
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { states, entities, devices, updateAvailable, hacsUpdates } from "./mock-states.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const cardJs = readFileSync(`${root}dist/system-monitor-card.js`, "utf8");

const THEMES = {
  light: {
    "--primary-background-color": "#e8eaed",
    "--secondary-background-color": "#ececec",
    "--card-background-color": "#ffffff",
    "--primary-text-color": "#212121",
    "--secondary-text-color": "#727272",
    "--divider-color": "rgba(0,0,0,.12)",
  },
  dark: {
    "--primary-background-color": "#111111",
    "--secondary-background-color": "#282828",
    "--card-background-color": "#1c1c1c",
    "--primary-text-color": "#e1e1e1",
    "--secondary-text-color": "#9b9b9b",
    "--divider-color": "rgba(225,225,225,.12)",
  },
};

// Minimal stand-in for Home Assistant's <ha-card>.
const HA_CARD = `customElements.define("ha-card", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML =
      "<style>:host{display:block;background:var(--card-background-color);border-radius:12px;" +
      "border:1px solid var(--divider-color);color:var(--primary-text-color);overflow:hidden}</style><slot></slot>";
  }
});`;

const page_html = (theme, width) => `<!doctype html><html><head><meta charset="utf-8">
<style>
  :root { ${Object.entries(THEMES[theme]).map(([k, v]) => `${k}:${v};`).join("")} }
  body { margin: 0; padding: 16px; background: var(--primary-background-color); color: var(--primary-text-color);
         font-family: Roboto, "Segoe UI", Helvetica, Arial, sans-serif; width: ${width}px; }
</style></head><body><div id="root"></div></body></html>`;

const shots = [
  { file: "card", type: "system-monitor-card", theme: "light", width: 460, config: {} },
  { file: "card-dark", type: "system-monitor-card", theme: "dark", width: 460, config: { language: "fr" }, update: true },
  { file: "card-hacs", type: "system-monitor-card", theme: "light", width: 460, config: { show_system: false, show_network: false, show_storage: false, show_processes: false }, hacs: true, open: true },
  { file: "mini-card", type: "system-monitor-mini-card", theme: "light", width: 380, config: {} },
  { file: "mini-card-dark", type: "system-monitor-mini-card", theme: "dark", width: 380, config: { language: "fr" }, update: true },
];

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1000, height: 2000 } });
// Logos are loaded dynamically by the card. Offline, serve each integration's own brand/icon.png from its
// repository (what Home Assistant's brands proxy does for custom integrations); other logos fall back to icons.
const brandRepos = Object.fromEntries(
  Object.values(states)
    .filter((s) => s.attributes.entity_picture && s.attributes.release_url)
    .map((s) => [/\/_\/([^/]+)\//.exec(s.attributes.entity_picture)[1], /github\.com\/([^/]+\/[^/]+)/.exec(s.attributes.release_url)[1]])
);
await page.route(/brands\.home-assistant\.io|github\.com\/[^/]+\.png|avatars\.githubusercontent/, async (route) => {
  const domain = /\/_\/([^/]+)\/icon\.png/.exec(route.request().url())?.[1];
  if (!domain || !brandRepos[domain]) return route.abort();
  try {
    const res = await route.fetch({ url: `https://raw.githubusercontent.com/${brandRepos[domain]}/HEAD/custom_components/${domain}/brand/icon.png` });
    if (res.ok()) return route.fulfill({ response: res });
  } catch (e) {
    /* offline */
  }
  return route.abort();
});
for (const s of shots) {
  await page.setContent(page_html(s.theme, s.width));
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: cardJs });
  await page.evaluate(
    ({ type, config, states, entities, devices, open }) => {
      const el = document.createElement(type);
      el.setConfig({ type: `custom:${type}`, ...config });
      el.hass = {
        states, entities, devices, config: { version: "2026.10.2" }, language: "en", locale: { language: "en" },
        user: { is_admin: true }, callWS: async () => { throw new Error("offline"); },
      };
      document.getElementById("root").appendChild(el);
      if (open) el.shadowRoot.querySelector('[data-action="hacs"]').click();
    },
    {
      type: s.type,
      config: s.config,
      states: { ...states, ...(s.update ? updateAvailable : {}), ...(s.update || s.hacs ? hacsUpdates : {}) },
      entities,
      devices,
      open: s.open,
    }
  );
  await page.waitForTimeout(800);
  const box = await page.locator("#root").boundingBox();
  await page.screenshot({
    path: `${root}screenshots/${s.file}.png`,
    clip: { x: 0, y: 0, width: s.width + 32, height: Math.ceil(box.height) + 32 },
    animations: "disabled",
  });
  console.log(`screenshots/${s.file}.png`);
}
await browser.close();

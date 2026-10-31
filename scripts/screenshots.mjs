// Renders the cards with mock System Monitor data and saves the README screenshots.
// Usage: npm run build && npm run screenshots
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { states, entities, devices, updateAvailable, hacsUpdates, procsRunning } from "./mock-states.mjs";

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
  { file: "card", type: "system-monitor-card", theme: "light", width: 460, config: {}, procsOk: true },
  { file: "card-dark", type: "system-monitor-card", theme: "dark", width: 460, config: {}, update: true },
  { file: "card-hacs", type: "system-monitor-card", theme: "light", width: 460, config: { show_system: false, show_network: false, show_storage: false, show_processes: false }, hacs: true, open: true },
  { file: "card-hacs-dark", type: "system-monitor-card", theme: "dark", width: 460, config: { show_system: false, show_network: false, show_storage: false, show_processes: false }, hacs: true, open: true },
  { file: "card-hacs-search", type: "system-monitor-card", theme: "dark", width: 460, config: { show_system: false, show_network: false, show_storage: false, show_processes: false }, hacs: true, open: true, search: "juju" },
  { file: "card-hacs-search-light", type: "system-monitor-card", theme: "light", width: 460, config: { show_system: false, show_network: false, show_storage: false, show_processes: false }, hacs: true, open: true, search: "juju" },
  { file: "card-install", type: "system-monitor-card", theme: "dark", width: 460, config: { show_system: false, show_network: false, show_storage: false, show_processes: false }, hacs: true, open: true, install: true },
  { file: "card-install-light", type: "system-monitor-card", theme: "light", width: 460, config: { show_system: false, show_network: false, show_storage: false, show_processes: false }, hacs: true, open: true, install: true },
  { file: "card-watchdog", type: "system-monitor-card", theme: "light", width: 460, config: { show_system: false, show_network: false, show_storage: false, show_processes: false, show_hacs: false }, open: true, action: "wd" },
  { file: "card-watchdog-dark", type: "system-monitor-card", theme: "dark", width: 460, config: { show_system: false, show_network: false, show_storage: false, show_processes: false, show_hacs: false }, open: true, action: "wd" },
  { file: "mini-card", type: "system-monitor-mini-card", theme: "light", width: 380, config: {} },
  { file: "mini-card-dark", type: "system-monitor-mini-card", theme: "dark", width: 380, config: {}, update: true },
  { file: "mini-card-zoom", type: "system-monitor-mini-card", theme: "light", width: 460, config: {}, procsOk: true, zoom: true },
  { file: "mini-card-zoom-dark", type: "system-monitor-mini-card", theme: "dark", width: 460, config: {}, update: true, zoom: true },
  { file: "status-card", type: "system-monitor-status-card", theme: "light", width: 380, config: {}, procsOk: true },
  { file: "status-card-dark", type: "system-monitor-status-card", theme: "dark", width: 380, config: {}, update: true },
  { file: "status-card-zoom", type: "system-monitor-status-card", theme: "light", width: 460, config: {}, procsOk: true, zoom: true },
  { file: "status-card-zoom-dark", type: "system-monitor-status-card", theme: "dark", width: 460, config: {}, update: true, zoom: true },
];

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
// Logos are loaded dynamically by the card. Offline, serve each integration's own brand/icon.png from its
// repository (what Home Assistant's brands proxy does for custom integrations); other logos fall back to icons.
const brandRepos = Object.fromEntries(
  Object.values(states)
    .filter((s) => s.attributes.entity_picture && s.attributes.release_url)
    .map((s) => [/\/_\/([^/]+)\//.exec(s.attributes.entity_picture)[1], /github\.com\/([^/]+\/[^/]+)/.exec(s.attributes.release_url)[1]])
);
const routeLogos = (page) =>
  page.route(/brands\.home-assistant\.io|github\.com\/[^/]+\.png|avatars\.githubusercontent/, async (route) => {
    const domain = /\/_\/([^/]+)\/icon\.png/.exec(route.request().url())?.[1];
    if (!domain || !brandRepos[domain]) return route.abort();
    try {
      const res = await route.fetch({ url: `https://raw.githubusercontent.com/${brandRepos[domain]}/HEAD/custom_components/${domain}/brand/icon.png` });
      if (res.ok()) return route.fulfill({ response: res });
    } catch (_e) {
      /* offline */
    }
    return route.abort();
  });
// The HACS check in progress: the refresh status sensor reads "running", a few repositories still to go.
const hacsRunning = {
  "sensor.hacs_refresh_status": {
    ...states["sensor.hacs_refresh_status"],
    state: "running",
    attributes: { ...states["sensor.hacs_refresh_status"].attributes, done: 3, total: 6 },
  },
};
// The Integration Watchdog check in progress: its button goes unavailable while it runs.
const wdChecking = {
  "button.integration_watchdog_check_now": { ...states["button.integration_watchdog_check_now"], state: "unavailable" },
};

// Mounts shot `s` on a fresh page (the card's script declares classes and custom elements once per page), settles
// it and clears the focus ring; returns the page ready to capture.
async function openCard(s) {
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1000, height: 2000 } });
  page.on("pageerror", (err) => console.error(`${s.file}: ${err.message}`));
  await routeLogos(page);
  await page.setContent(page_html(s.theme, s.width));
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: cardJs });
  await page.evaluate(
    ({ type, config, states, entities, devices, open, action, search, install, installing, zoom }) => {
      const el = document.createElement(type);
      el.setConfig({ type: `custom:${type}`, ...config });
      el.hass = {
        states, entities, devices, config: { version: "2026.10.2" }, language: "en", locale: { language: "en" },
        user: { is_admin: true }, services: { hacs_refresh: { check_updates: {}, check_repository: {} } }, callWS: async () => { throw new Error("offline"); },
      };
      document.getElementById("root").appendChild(el);
      // A mouse click (detail 1): a keyboard one would focus the new button and draw its focus ring.
      if (zoom) el.shadowRoot.querySelector(".zoom").dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));
      if (open) el.shadowRoot.querySelector(`.section-title[data-action="${action}"]`).click();
      if (install) el.shadowRoot.querySelector('[data-action="hacs-install-all"]').click();
      if (search) {
        const field = el.shadowRoot.querySelector("[data-search]");
        field.value = search;
        field.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      }
      // "Install all" mid-run: the state _runInstall holds between two update.install calls.
      if (installing) {
        el._installing = { done: 1, total: 2 };
        el._update();
      }
    },
    {
      type: s.type,
      config: s.config,
      states: {
        ...states,
        ...(s.update ? updateAvailable : {}),
        ...(s.update || s.hacs ? hacsUpdates : {}),
        ...(s.procsOk ? procsRunning : {}),
        ...(s.running ? hacsRunning : {}),
        ...(s.wdBusy ? wdChecking : {}),
      },
      entities,
      devices,
      open: s.open,
      action: s.action || "hacs",
      search: s.search,
      install: s.install,
      installing: s.installing,
      zoom: s.zoom,
    }
  );
  await page.waitForTimeout(800);
  // No focus ring in the captures: the install popup focuses its button, which draws the :focus-visible outline.
  await page.evaluate(() => {
    let el = document.activeElement;
    while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
    el?.blur?.();
  });
  return page;
}

for (const s of shots) {
  const page = await openCard(s);
  const box = await page.locator("#root").boundingBox();
  await page.screenshot({
    path: `${root}screenshots/${s.file}.png`,
    clip: { x: 0, y: 0, width: s.width + 32, height: Math.ceil(box.height) + 32 },
    animations: "disabled",
  });
  console.log(`screenshots/${s.file}.png`);
  await page.close();
}

// Animated states, recorded as looping GIFs — needs ffmpeg on PATH. Every animation is paused and
// stepped frame by frame, so the GIFs are identical whatever the machine's speed.
// Every animation is recorded in both themes: each light GIF gets a `-dark` twin with the exact same setup.
const SECTIONS_OFF = { show_system: false, show_network: false, show_storage: false, show_processes: false };
const lightGifs = [
  // The HACS section mid-check: its status sensor is "running".
  { file: "hacs-checking", type: "system-monitor-card", theme: "light", width: 460, config: SECTIONS_OFF, hacs: true, open: true, running: true },
  // "Install all" mid-run: the chip spins with the progress of the installs.
  { file: "hacs-installing", type: "system-monitor-card", theme: "light", width: 460, config: SECTIONS_OFF, hacs: true, open: true, installing: true },
  // The Integration Watchdog "check now" button mid-check: unavailable while it runs, so it spins.
  { file: "wd-checking", type: "system-monitor-card", theme: "light", width: 460, config: { ...SECTIONS_OFF, show_hacs: false }, open: true, action: "wd", wdBusy: true },
];
const gifs = [...lightGifs, ...lightGifs.map((g) => ({ ...g, file: `${g.file}-dark`, theme: "dark" }))];
const FPS = 20;
const SECONDS = 2;
for (const gif of gifs) {
  const page = await openCard(gif);
  const box = await page.locator("#root").boundingBox();
  const clip = { x: 0, y: 0, width: gif.width + 32, height: Math.ceil(box.height) + 32 };
  const dir = mkdtempSync(join(tmpdir(), "sm-frames-"));
  const frames = Math.round(FPS * SECONDS);
  for (let i = 0; i < frames; i++) {
    await page.evaluate((t) => {
      for (const a of document.getAnimations()) {
        a.pause();
        a.currentTime = t;
      }
    }, (i * 1000) / FPS);
    await page.screenshot({ path: join(dir, `f${String(i).padStart(3, "0")}.png`), clip });
  }
  await page.close();
  const out = `${root}screenshots/${gif.file}.gif`;
  // Halve the retina capture and build a per-clip palette: the colours stay clean and the file stays small.
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-framerate", String(FPS), "-i", join(dir, "f%03d.png"),
    "-vf", `scale=${clip.width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`,
    "-loop", "0", out,
  ]);
  rmSync(dir, { recursive: true });
  console.log(`screenshots/${gif.file}.gif`);
}
await browser.close();

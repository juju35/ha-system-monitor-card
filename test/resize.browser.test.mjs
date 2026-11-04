// Fitting on resize, in Chromium: in Home Assistant the card sits in hui-card, an element without display (inline),
// and a ResizeObserver on an inline host never fires again after observe(). The cards must still re-fit their header
// and section titles when they are resized, without a new hass. Skipped when Chromium is missing locally (run
// `npx playwright install chromium`); the Validate workflow installs it, so this test always runs in CI.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { devices, entities, hacsUpdates, states, updateAvailable } from "../scripts/mock-states.mjs";

let chromium;
let browser;
try {
  ({ chromium } = await import("playwright"));
  browser = await chromium.launch();
} catch (e) {
  if (process.env.CI) throw e;
  browser = null;
}
const skip = browser ? false : "Chromium is not installed (npx playwright install chromium)";
const cardJs = readFileSync(new URL("../src/system-monitor-card.js", import.meta.url), "utf8");
const STUBS = `customElements.define("ha-card", class extends HTMLElement { constructor() { super();
  this.attachShadow({ mode: "open" }).innerHTML = "<style>:host{display:block;overflow:hidden}</style><slot></slot>"; } });
customElements.define("hui-card", class extends HTMLElement {});`;

let page;
before(async () => {
  if (!browser) return;
  page = await browser.newPage();
  await page.route(/^https?:/, (r) => r.abort());
  await page.setContent(`<body style="margin:0;padding:16px;font-family:Arial"></body>`);
  await page.addScriptTag({ content: STUBS });
  await page.addScriptTag({ content: cardJs });
});
after(async () => browser?.close());

/**
 * Renders the card at `from` px in a block div > hui-card (inline, as in HA), resizes the div to `to` px and returns
 * the card's state then, the number of _fit calls the resize caused, and the state of a fresh render at `to` px.
 */
const resize = (tag, lang, from, to, zoomed = false) =>
  page.evaluate(
    async ({ tag, lang, from, to, zoomed, states, entities, devices }) => {
      const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
      const settle = async () => {
        for (let i = 0; i < 4; i++) await raf();
      };
      const hass = { states, entities, devices, config: { version: "2026.10.2", unit_system: { temperature: "°C" } },
        language: lang, locale: { language: lang }, themes: {}, user: { is_admin: true }, services: {},
        callWS: async () => { throw new Error("offline"); } };
      const mount = async (width) => {
        const box = document.createElement("div");
        box.style.width = `${width}px`;
        const hui = document.createElement("hui-card");
        const el = document.createElement(tag);
        el.setConfig({ type: `custom:${tag}` });
        el.hass = hass;
        if (zoomed) el._zoomed = true;
        hui.appendChild(el);
        box.appendChild(hui);
        document.body.appendChild(box);
        if (zoomed) el.hass = { ...hass };
        await settle();
        return { box, el };
      };
      const snap = (el) => {
        const root = el.shadowRoot;
        const shown = (sel) => [...root.querySelectorAll(sel)].map((e) => getComputedStyle(e).display !== "none");
        return {
          classes: [...root.querySelectorAll(".header, .section-title")].map((e) => e.className),
          logo: shown(".header .logo"),
          labels: shown(".btn > span"),
        };
      };
      const { box, el } = await mount(from);
      let fits = 0;
      const fit = el._fit;
      el._fit = function () {
        fits++;
        return fit.call(this);
      };
      box.style.width = `${to}px`;
      await settle();
      const resized = snap(el);
      box.remove();
      const fresh = await mount(to);
      const expected = snap(fresh.el);
      fresh.box.remove();
      return { resized, expected, fits, display: getComputedStyle(el).display };
    },
    { tag, lang, from, to, zoomed, states: { ...states, ...updateAvailable, ...hacsUpdates }, entities, devices },
  );

test("status card in an inline hui-card: widening 130 -> 500 px brings back the logo, the pill and the HACS label", { skip }, async () => {
  const r = await resize("system-monitor-status-card", "en", 130, 500);
  assert.ok(r.fits > 0, "the resize runs _fit");
  assert.deepEqual(r.resized, r.expected);
  assert.equal(r.resized.classes[0], "header", "no tight / tighter / bare class left at 500 px");
  assert.ok(r.resized.logo.every(Boolean) && r.resized.labels.every(Boolean), "logo and button labels shown");
});

test("every card in an inline hui-card re-fits on resize, wider and narrower, as a fresh render at that width", { skip }, async () => {
  const cases = [];
  for (const tag of ["system-monitor-card", "system-monitor-mini-card", "system-monitor-status-card"])
    for (const lang of ["en", "pl", "lv", "uk", "el"])
      for (const [from, to] of [[130, 500], [178, 364], [364, 178], [500, 156]]) cases.push([tag, lang, from, to]);
  for (const [tag, lang, from, to] of cases) {
    const r = await resize(tag, lang, from, to);
    assert.ok(r.fits > 0, `${tag} ${lang} ${from}->${to}: the resize runs _fit`);
    assert.deepEqual(r.resized, r.expected, `${tag} ${lang} ${from}->${to}`);
  }
  for (const tag of ["system-monitor-mini-card", "system-monitor-status-card"]) {
    const r = await resize(tag, "en", 500, 178, true);
    assert.deepEqual(r.resized, r.expected, `${tag} zoomed 500->178`);
  }
});

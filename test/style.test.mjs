import assert from "node:assert/strict";
import { test } from "node:test";
import { devices, entities, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const lib = load();
const hassWith = (overrides = {}) => ({ states: { ...states }, entities, devices, language: "en", ...overrides });

const card = (Cls, hass, config = {}) => {
  const c = new Cls();
  c._hass = hass;
  c._config = config;
  return c;
};

/** Every card, as rendered (the mini and status cards both folded and zoomed to the full card). */
const renders = () => {
  const hass = hassWith();
  const zoomed = (Cls) => {
    const c = card(Cls, hass);
    c._zoomed = true;
    return c._render();
  };
  return {
    full: card(lib.SystemMonitorCard, hass)._render(),
    mini: card(lib.SystemMonitorMiniCard, hass)._render(),
    "mini zoomed": zoomed(lib.SystemMonitorMiniCard),
    status: card(lib.SystemMonitorStatusCard, hass)._render(),
    "status zoomed": zoomed(lib.SystemMonitorStatusCard),
  };
};

const styleOf = (html) => [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");

/** The declarations of the rules whose selector list contains this selector, outside any @media or @container block. */
const rulesFor = (css, selector) => {
  const flat = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@(?:media|container)[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  return [...flat.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((m) => m[1].split(",").some((s) => s.trim() === selector))
    .map((m) => m[2])
    .join(";");
};

for (const [name, html] of Object.entries(renders())) {
  test(`${name}: animations stop under prefers-reduced-motion`, () => {
    const css = styleOf(html);
    const spin = css.search(/\.spin\s*\{[^}]*animation:\s*sm-spin/);
    if (spin < 0) return; // No spinner on this card.
    const media = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{((?:[^{}]*\{[^{}]*\})*)[^{}]*\}/);
    assert.ok(media, "no @media (prefers-reduced-motion: reduce) block");
    assert.match(media[1], /\.spin\s*\{[^}]*animation:\s*none/);
    // Same specificity as .spin: the media rule must come after it, or the spinner keeps turning.
    assert.ok(media.index > spin, "the reduced-motion rule comes before .spin and is overridden");
  });

  // Every render replaces the whole shadow DOM: a CSS transition never plays (no old value to start from).
  test(`${name}: no dead CSS transitions on re-rendered elements`, () => {
    const css = styleOf(html);
    for (const sel of [".bar > div", ".ring .value", ".section-title .chevron"])
      assert.doesNotMatch(rulesFor(css, sel), /transition/, `${sel} has a transition that never plays`);
  });
}

test("full card: the disk gauge uses the disk icon, not the database one", () => {
  const hass = hassWith();
  const html = card(lib.SystemMonitorCard, hass)._system(lib.discover(hass));
  const gauge = html.split('<div class="gauge').find((g) => /Disk \//.test(g));
  assert.ok(gauge, "no disk gauge");
  assert.ok(gauge.includes(lib.ICONS.disk), "disk gauge without the disk icon");
  assert.ok(!gauge.includes(lib.ICONS.database), "disk gauge with the database icon");
});

test("mini card: the disk bar uses the disk icon, not the database one", () => {
  const html = card(lib.SystemMonitorMiniCard, hassWith())._render();
  assert.ok(html.includes(lib.ICONS.disk), "no disk icon in the mini card");
  assert.ok(!html.includes(lib.ICONS.database), "database icon in the mini card (no database row there)");
});

test("full card: the gauge detail (3.02 / 7.81 GiB) is not faded below the secondary text colour", () => {
  const css = styleOf(card(lib.SystemMonitorCard, hassWith())._render());
  assert.doesNotMatch(rulesFor(css, ".gauge .lbl2"), /opacity/);
});

// Narrow cards (300 px): the status tiles' labels and values wrap instead of being cut with an ellipsis.
test("status tiles: labels and values wrap on two lines, never cut with an ellipsis", () => {
  for (const [name, html] of Object.entries(renders())) {
    const css = styleOf(html);
    if (!/class="stats"/.test(html)) continue;
    for (const sel of [".stat .k span", ".stat .v"]) {
      const rules = rulesFor(css, sel);
      assert.doesNotMatch(rules, /text-overflow:\s*ellipsis|white-space:\s*nowrap/, `${name}: ${sel} is cut on one line`);
      assert.match(rules, /-webkit-line-clamp:\s*2/, `${name}: ${sel} is not clamped to two lines`);
    }
    // A tile is at least as wide as its longest word: it wraps to a new row rather than cutting a word.
    assert.match(rulesFor(css, ".stats"), /flex-wrap:\s*wrap/, `${name}: tiles don't wrap`);
    assert.match(rulesFor(css, ".stat"), /min-width:\s*min-content/, `${name}: a tile can cut a word`);
  }
});

test("labels still cut on the narrowest cards keep their full text in title", () => {
  const html = card(lib.SystemMonitorCard, hassWith())._render();
  for (const m of html.matchAll(/<div class="(?:lbl|k)"( title="[^"]*")?>([^<]*)<\/div>/g))
    assert.equal(m[1], ` title="${m[2]}"`, `"${m[2]}" without a title`);
});

// Narrow cards (260 px, Integrationen): the section name gives way, never the chevron or the check button.
test("section titles: the name is cut with an ellipsis (full text in title), the chevron and buttons keep their size", () => {
  for (const [name, html] of Object.entries(renders())) {
    if (!/class="section-title/.test(html)) continue;
    const css = styleOf(html);
    assert.match(rulesFor(css, ".section-title > *"), /flex:\s*none/, `${name}: the header items can shrink`);
    const label = rulesFor(css, ".section-title > .label");
    for (const re of [/min-width:\s*0/, /text-overflow:\s*ellipsis/, /white-space:\s*nowrap/, /overflow:\s*hidden/, /flex:\s*0 1 auto/])
      assert.match(label, re, `${name}: section name without ${re}`);
    // The check button may drop its text (kept in title and aria-label) once the name is cut, as the status header does.
    assert.match(rulesFor(css, ".section-title.tight .btn-check > span"), /display:\s*none/, `${name}: no icon-only check button`);
    for (const head of html.matchAll(/<div class="section-title[^"]*"[^>]*>([\s\S]*?)<\/div>/g)) {
      const m = head[1].match(/<span class="label"( title="[^"]*")?>([^<]*)<\/span>/);
      assert.ok(m, `${name}: section title without a .label name: ${head[1].trim().slice(0, 80)}`);
      assert.equal(m[1], ` title="${m[2]}"`, `${name}: "${m[2]}" without a title`);
    }
    for (const b of html.matchAll(/<span class="btn btn-check"[^>]*>/g)) {
      const t = b[0].match(/ title="([^"]+)"/)?.[1];
      assert.ok(t && b[0].includes(`aria-label="${t}"`), `${name}: check button without title and aria-label`);
    }
  }
});

test("mini card: the metric labels share one column wide enough for the longest one", () => {
  const css = styleOf(card(lib.SystemMonitorMiniCard, hassWith())._render());
  assert.match(rulesFor(css, ".content"), /grid-template-columns:\s*18px minmax\(64px, max-content\)/);
  assert.match(rulesFor(css, ".metric"), /grid-template-columns:\s*subgrid/);
});

test("buttons: a hover state, and a disabled state set apart from the enabled one", () => {
  const css = styleOf(card(lib.SystemMonitorStatusCard, hassWith())._render());
  // currentColor, not --primary-color: this rule outranks .header .btn.warn, whose Install button is orange.
  assert.match(css, /\.btn:not\(:disabled\):not\(\[aria-disabled="true"\]\):hover\s*\{[^}]*background:\s*color-mix\(in srgb, currentColor/);
  assert.match(rulesFor(css, '.btn[aria-disabled="true"]'), /opacity:\s*\.5/);
});

// Each render recreates the spinner: without a phase taken from the clock, it restarts at 0° on every
// progress of a HACS check (done 1 -> 2) and jumps back.
test("spinner: a re-render keeps its phase, taken from the clock", () => {
  // A non-admin user: no pending installs, the button checks for updates.
  const hass = hassWith({
    user: { is_admin: false },
    states: {
      ...states,
      "sensor.hacs_refresh_status": { entity_id: "sensor.hacs_refresh_status", state: "running", attributes: { done: 1, total: 6 } },
    },
  });
  let spins = [];
  const c = card(lib.SystemMonitorStatusCard, hass);
  c.shadowRoot = {
    activeElement: null,
    set innerHTML(html) {
      spins = (html.match(/class="icon spin"/g) || []).map(() => ({ style: {} }));
    },
    querySelector: () => null,
    querySelectorAll: (sel) => (sel === ".spin" ? spins : []),
  };
  const before = Date.now();
  c._update();
  const after = Date.now();
  assert.ok(spins.length > 0, "no spinner while HACS Refresh is running");
  for (const el of spins) {
    const m = /^-(\d+)ms$/.exec(el.style.animationDelay || "");
    assert.ok(m, `animation-delay not set: ${el.style.animationDelay}`);
    const phase = Number(m[1]);
    const lo = before % 1000;
    const hi = after % 1000;
    assert.ok(lo <= hi ? phase >= lo && phase <= hi : phase >= lo || phase <= hi, `phase ${phase} not from the clock`);
  }
});

test("spinner: a render without querySelectorAll (no DOM yet) does not throw", () => {
  const c = card(lib.SystemMonitorCard, hassWith());
  assert.doesNotThrow(() => c._update());
});

test("spinner: with the Web Animations API, every spinner is anchored to the start of the timeline", () => {
  const hass = hassWith({
    user: { is_admin: false },
    states: {
      ...states,
      "sensor.hacs_refresh_status": { entity_id: "sensor.hacs_refresh_status", state: "running", attributes: { done: 2, total: 6 } },
    },
  });
  let anims = [];
  const c = card(lib.SystemMonitorCard, hass);
  c.shadowRoot = {
    activeElement: null,
    set innerHTML(html) {
      anims = (html.match(/class="icon spin"/g) || []).map(() => ({ startTime: 1234 }));
    },
    querySelector: () => null,
    querySelectorAll: (sel) => (sel === ".spin" ? anims.map((a) => ({ style: {}, getAnimations: () => [a] })) : []),
  };
  c._update();
  assert.ok(anims.length > 0, "no spinner while HACS Refresh is running");
  for (const a of anims) assert.equal(a.startTime, 0);
});

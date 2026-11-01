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

/** The declarations of the rules whose selector list contains this selector, outside any @media block. */
const rulesFor = (css, selector) => {
  const flat = css.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
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

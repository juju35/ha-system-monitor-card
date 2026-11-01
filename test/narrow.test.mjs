// Narrow cards (the minimum width of getGridOptions, 4 to 6 columns of a Sections view, the zoomed mini card), status
// text contrast and focus rings: the CSS rules that keep them right. There are no browser tests in this repository;
// the layouts were measured in Chromium (see the pull request "Review pass 9 fixes").
import assert from "node:assert/strict";
import { test } from "node:test";
import { devices, entities, hacsUpdates, states, updateAvailable } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const lib = load();
const hassWith = (extra = {}) => ({ states: { ...states, ...extra }, entities, devices, language: "en", config: { version: "2026.10.2" } });
const card = (Cls, hass, config = {}) => {
  const c = new Cls();
  c._hass = hass;
  c._config = config;
  return c;
};
const styleOf = (html) => [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");
/** Declarations of the top-level rules (outside @media / @container) whose selector list contains this selector. */
const rulesFor = (css, selector) => {
  const flat = strip(css).replace(/@(?:media|container)[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  return [...flat.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((m) => m[1].split(",").some((s) => s.trim() === selector))
    .map((m) => m[2])
    .join(";");
};
/** Inner CSS of the @container blocks of this container name. */
const containerBlocks = (css, name) =>
  [...strip(css).matchAll(/@container\s+([\w-]+)\s*\(max-width:\s*(\d+)px\)\s*\{((?:[^{}]*\{[^{}]*\})*)[^{}]*\}/g)]
    .filter((m) => m[1] === name)
    .map((m) => ({ max: Number(m[2]), body: m[3] }));

const renders = () => {
  const hass = hassWith({ ...updateAvailable, ...hacsUpdates });
  const zoomed = (Cls) => {
    const c = card(Cls, hass);
    c._zoomed = true;
    return c._render();
  };
  return {
    full: card(lib.SystemMonitorCard, hass)._render(),
    "mini zoomed": zoomed(lib.SystemMonitorMiniCard),
    status: card(lib.SystemMonitorStatusCard, hass)._render(),
    "status zoomed": zoomed(lib.SystemMonitorStatusCard),
  };
};

for (const [name, html] of Object.entries(renders())) {
  test(`${name}: the header title keeps a few letters, the pill gives way, the buttons keep their size`, () => {
    const css = styleOf(html);
    assert.match(rulesFor(css, ".titles"), /min-width:\s*0/);
    assert.match(rulesFor(css, ".title-row > .name"), /min-width:\s*min\(\d+ch, 100%\)/);
    assert.match(rulesFor(css, ".name"), /text-overflow:\s*ellipsis/);
    const chip = rulesFor(css, ".title-row > .chip");
    assert.match(chip, /flex:\s*0 1 auto/);
    assert.match(chip, /min-width:\s*0/);
    assert.match(chip, /max-width:\s*50%/);
    assert.match(rulesFor(css, ".title-row > .chip > .chip-text"), /text-overflow:\s*ellipsis/);
    assert.match(rulesFor(css, ".header"), /container:\s*sm-header \/ inline-size/);
    const narrow = containerBlocks(css, "sm-header");
    assert.ok(narrow.some((b) => /\.title-row > \.chip > \.chip-text\s*\{[^}]*display:\s*none/.test(b.body)), "the pill never drops to its dot");
    assert.match(rulesFor(css, ".zoom"), /flex:\s*none/);
  });

  test(`${name}: the header pill keeps its text in title and aria-label`, () => {
    const pill = html.match(/<div class="title-row">[\s\S]*?(<span class="chip[^>]*>)<span class="dot"><\/span><span class="chip-text">/);
    assert.ok(pill, "no .chip-text in the header pill");
    assert.match(pill[1], /title="Update 2026\.10\.3"/);
    assert.match(pill[1], /aria-label="Update 2026\.10\.3"/);
  });
}

test("header pill: every status (update, unknown, up to date, running) has its text in title and aria-label", () => {
  const sm = (hass) => lib.discover(hass);
  for (const [extra, text] of [
    [updateAvailable, "Update 2026.10.3"],
    [{ "update.home_assistant_core_update": { entity_id: "update.home_assistant_core_update", state: "unavailable", attributes: {} } }, "Unknown"],
    [{}, "Up to date"],
  ]) {
    const hass = hassWith(extra);
    const head = card(lib.SystemMonitorCard, hass)._header(sm(hass));
    assert.match(head, new RegExp(`title="${text}" aria-label="${text}"><span class="dot"></span><span class="chip-text">`), text);
  }
});

test("status card: a narrow header shows the pill's dot, never the title cut letter by letter on two lines", () => {
  const css = styleOf(card(lib.SystemMonitorStatusCard, hassWith(updateAvailable))._render());
  assert.doesNotMatch(strip(css), /\.tighter \.name\s*\{[^}]*(line-clamp|overflow-wrap:\s*anywhere|white-space:\s*normal)/);
  assert.match(rulesFor(css, ".header.tighter .title-row > .chip > .chip-text"), /display:\s*none/);
  assert.match(rulesFor(css, ".header .btn"), /flex:\s*none/);
});

test("storage: on a narrow card the used / total size goes under the bar, the mount point keeps the line", () => {
  const css = styleOf(card(lib.SystemMonitorCard, hassWith())._render());
  assert.match(rulesFor(css, ".content"), /container:\s*sm-content \/ inline-size/);
  const narrow = containerBlocks(css, "sm-content");
  assert.ok(narrow.length, "no @container sm-content block");
  const body = narrow.map((b) => b.body).join("");
  assert.match(body, /\.vol \.detail\s*\{[^}]*grid-column:\s*1 \/ -1[^}]*grid-row:\s*3/);
  assert.match(body, /\.vol \.row\s*\{[^}]*grid-column:\s*1 \/ -1/);
  // Wide enough for "/media" and the longest detail ("iskorišćeno od", "użyte z") side by side above it.
  assert.ok(narrow.every((b) => b.max >= 300));
});

test("HACS and Integration Watchdog lists: on a narrow card the status pills show their dot, the name comes first", () => {
  const hass = hassWith(hacsUpdates);
  const c = card(lib.SystemMonitorCard, hass);
  c._hacsOpen = true;
  c._hacsQuery = "";
  c._wdOpen = true;
  const html = c._render();
  const css = styleOf(html);
  assert.match(rulesFor(css, ".exts"), /container:\s*sm-list \/ inline-size/);
  assert.ok(containerBlocks(css, "sm-list").some((b) => /\.ext \.chip > \.chip-text\s*\{[^}]*display:\s*none/.test(b.body)));
  const rows = [...html.matchAll(/<div class="ext clickable"[\s\S]*?<\/div>\s*(<span class="chip[^>]*>)<span class="dot"><\/span><span class="chip-text">([^<]*)</g)];
  assert.ok(rows.length >= 8, `${rows.length} pills with a .chip-text`); // 6 HACS extensions, 2 integrations
  for (const [, pill, text] of rows) assert.ok(pill.includes(`title="${text}"`) && pill.includes(`aria-label="${text}"`), pill);
});

// WCAG 2 contrast of text in a status colour on its tinted background, with Home Assistant's default colours.
const hex = (h) => [1, 3, 5].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, p) => a.map((x, i) => x * p + b[i] * (1 - p));
const lum = (c) => {
  const [r, g, b] = c.map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const THEMES = { light: { text: "#212121", card: "#ffffff", bg2: "#ececec" }, dark: { text: "#e1e1e1", card: "#1c1c1c", bg2: "#282828" } };
const COLORS = { blue: "#18bcf2", primary: "#03a9f4", ok: "#43a047", warn: "#ffa600", crit: "#db4437", muted: "#727272" };

test("status text (tiles, pills, buttons) reads at 4.5:1 or more in light and dark themes", () => {
  const mini = card(lib.SystemMonitorMiniCard, hassWith(updateAvailable))._render();
  const css = strip([...Object.values(renders()), mini].map(styleOf).join("\n"));
  // No text in a raw status colour: always mixed with the text colour. Icons keep the status colour.
  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g))
    if (!selector.split(",").every((x) => /\.icon\s*$/.test(x.trim())))
      assert.doesNotMatch(body, /(?:^|[;\s])color:\s*var\(--(?:c|sm-ok|sm-warn|sm-crit|sm-blue|primary-color)\b/, selector.trim());
  const pcts = [...css.matchAll(/(?:^|[;{\s])color:\s*color-mix\(in srgb, var\(--[\w-]+(?:, [^)]*\))?\)? (\d+)%, var\(--primary-text-color\)\)/gm)].map((m) => Number(m[1]));
  assert.ok(pcts.length >= 5, `${pcts.length} mixed text colours`);
  for (const p of new Set(pcts))
    for (const [theme, t] of Object.entries(THEMES))
      for (const [name, c] of Object.entries(COLORS)) {
        const fg = mix(hex(c), hex(t.text), p / 100);
        // Tile (12 % of the colour over the secondary background) and pill or button (15 % over the card).
        for (const bg of [mix(hex(c), hex(t.bg2), 0.12), mix(hex(c), hex(t.card), 0.15)])
          assert.ok(ratio(fg, bg) >= 4.5, `${theme} ${name} at ${p}%: ${ratio(fg, bg).toFixed(2)}:1`);
      }
});

test("focus rings use the theme's primary colour, like the other cards", () => {
  const css = strip(styleOf(renders().full));
  assert.match(css, /--sm-focus:\s*var\(--primary-color, #03a9f4\)/);
  const outlines = [...css.matchAll(/outline:\s*2px solid ([^;}]+)/g)].map((m) => m[1].trim());
  assert.ok(outlines.length >= 3);
  for (const o of outlines) assert.equal(o, "var(--sm-focus)");
});

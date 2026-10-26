import assert from "node:assert/strict";
import { test } from "node:test";
import { devices, entities, states, updateAvailable } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const lib = load();
const hassWith = (overrides = {}) => ({ states: { ...states }, entities, devices, language: "en", ...overrides });

test("discovery is cached per registry, not per states object", () => {
  const hass = hassWith();
  const sm = lib.discover(hass);
  assert.ok(sm.found);
  assert.equal(sm.scalars.processor_use, "sensor.system_monitor_processor_use");
  // A new states object (any state change) with the same registries: same result object.
  const next = { ...hass, states: { ...hass.states, "sensor.other": { state: "1", attributes: {} } } };
  assert.equal(lib.discover(next), sm);
  assert.equal(lib.discoverRefresh(next), lib.discoverRefresh(hass));
  assert.equal(lib.discoverWatchdog(next), lib.discoverWatchdog(hass));
  // New entity registry: discovered again.
  const reg = { ...hass, entities: { ...entities } };
  assert.notEqual(lib.discover(reg), sm);
  assert.equal(JSON.stringify(lib.discover(reg)), JSON.stringify(sm));
});

test("an entity of the registry that gets its state later is picked up", () => {
  const id = "sensor.system_monitor_processor_use";
  const without = { ...states };
  delete without[id];
  const reg = { ...entities };
  const first = lib.discover({ states: without, entities: reg, devices });
  assert.equal(first.scalars.processor_use, undefined);
  const later = lib.discover({ states: { ...states }, entities: reg, devices });
  assert.equal(later.scalars.processor_use, id);
});

test("HACS extensions follow their states while their registry entries are cached", () => {
  const hass = hassWith();
  const before = lib.discoverHacs(hass);
  assert.equal(before.filter((x) => x.update).length, 0);
  const id = "update.parcel_update";
  const s = hass.states[id];
  const updated = { ...hass, states: { ...hass.states, [id]: { ...s, state: "on", attributes: { ...s.attributes, latest_version: "0.2.0" } } } };
  const after = lib.discoverHacs(updated);
  // Objects from the sandbox: compared as JSON.
  assert.equal(JSON.stringify(after.filter((x) => x.update).map((x) => [x.id, x.name, x.latest])), JSON.stringify([[id, "Parcel", "0.2.0"]]));
});

test("the render signature ignores untracked states and catches tracked ones", () => {
  const hass = hassWith();
  const sig = lib.renderSignature(hass);
  const untracked = { ...hass, states: { ...hass.states, "light.kitchen": { state: "on", attributes: {} } } };
  assert.ok(lib.sameSignature(sig, lib.renderSignature(untracked)));
  const id = "sensor.system_monitor_processor_use";
  const tracked = { ...hass, states: { ...hass.states, [id]: { ...hass.states[id], state: "99" } } };
  assert.ok(!lib.sameSignature(sig, lib.renderSignature(tracked)));
  for (const id of ["sensor.hacs_refresh_status", "sensor.integration_watchdog_unavailable_integrations", "update.parcel_update"])
    assert.ok(lib.trackedIds(hass).includes(id), id);
  assert.ok(!lib.sameSignature(sig, lib.renderSignature({ ...hass, language: "fr" })));
});

test("the render signature changes every minute, for relative times", (t) => {
  const hass = hassWith();
  let now = 1_800_000_000_000; // a whole minute
  t.mock.method(Date, "now", () => now);
  const sig = lib.renderSignature(hass);
  now += 59_000;
  assert.ok(lib.sameSignature(sig, lib.renderSignature(hass)));
  now += 1_000;
  assert.ok(!lib.sameSignature(sig, lib.renderSignature(hass)));
});

test("set hass renders only when a tracked state changed", () => {
  const card = new lib.SystemMonitorCard();
  let renders = 0;
  card._update = () => renders++;
  card._fetchBrandsToken = () => {};
  const hass = hassWith();
  card.hass = hass;
  assert.equal(renders, 1);
  card.hass = { ...hass, states: { ...hass.states, "light.kitchen": { state: "on", attributes: {} } } };
  assert.equal(renders, 1);
  const id = "sensor.integration_watchdog_last_check";
  card.hass = { ...hass, states: { ...hass.states, [id]: { ...hass.states[id], state: new Date().toISOString() } } };
  assert.equal(renders, 2);
});

test("focusSelector finds the same button again from its data attributes", () => {
  assert.equal(lib.focusSelector({ dataset: { action: "hacs-check" } }), '[data-action="hacs-check"]');
  assert.equal(
    lib.focusSelector({ dataset: { action: "hacs-check-ext", target: 'update.a"b' } }),
    '[data-action="hacs-check-ext"][data-target="update.a\\"b"]'
  );
  assert.equal(lib.focusSelector({ dataset: { entity: "sensor.x" } }), null);
  assert.equal(lib.focusSelector(null), null);
});

test("Core and OS update entities are found from their states, with or without a registry entry", () => {
  const sm = lib.discover(hassWith({ entities: { ...entities } }));
  assert.equal(sm.core_update, "update.home_assistant_core_update");
  assert.equal(sm.os_update, "update.home_assistant_operating_system_update");
});

test("fmtBytes divides by 1024 and says so with binary prefixes", () => {
  assert.equal(lib.fmtBytes(512), "512 B");
  assert.equal(lib.fmtBytes(1536), "1.5 KiB");
  assert.equal(lib.fmtBytes(20 * 1024 ** 3), "20 GiB");
  assert.equal(lib.fmtBytes(null), "—");
});

test("focusSelector finds an entity row again, but not a plain clickable span", () => {
  const row = { dataset: { entity: "update.parcel_update" }, getAttribute: (n) => (n === "role" ? "button" : null) };
  assert.equal(lib.focusSelector(row), '[role="button"][data-entity="update.parcel_update"]');
  const span = { dataset: { entity: "sensor.x" }, getAttribute: () => null };
  assert.equal(lib.focusSelector(span), null);
});

const statusCard = (hass, config = {}) => {
  const card = new lib.SystemMonitorStatusCard();
  card._hass = hass;
  card._config = config;
  return card;
};

test("the status card shows its status row only when a tile is not good", () => {
  const hass = hassWith();
  const card = statusCard(hass);
  const sm = lib.discover(hass);
  const tiles = card._stats(sm);
  assert.ok(tiles.length > 0);
  const bad = tiles.some((x) => x.cls === "warn" || x.cls === "crit");
  assert.equal(card._statusRow(sm) !== "", bad);
  // Every tile good: no row.
  card._stats = () => tiles.map((x) => ({ ...x, cls: "good" }));
  assert.equal(card._statusRow(sm), "");
  card._stats = () => [{ ...tiles[0], cls: "warn" }];
  assert.match(card._statusRow(sm), /class="stats"/);
});

test("the status card's check button follows the full card's rule: every user may check, only admins install", () => {
  const hass = hassWith({ user: { is_admin: false } });
  const id = "update.parcel_update";
  const s = hass.states[id];
  const card = statusCard(hass);
  assert.match(card._button(), /data-action="hacs-check"/);
  hass.states = { ...hass.states, [id]: { ...s, state: "on", attributes: { ...s.attributes, latest_version: "9.9.9" } } };
  assert.match(card._button(), /data-action="hacs-check"/);
  hass.user = { is_admin: true };
  assert.match(card._button(), /data-action="hacs-install-all"/);
});

test("restoring the focus after a re-render does not scroll the page to the card", () => {
  const card = new lib.SystemMonitorCard();
  card._config = {};
  card._hass = hassWith();
  const calls = [];
  const active = { dataset: { entity: "sensor.system_monitor_processor_use" }, getAttribute: (n) => (n === "role" ? "button" : null) };
  card.shadowRoot = {
    activeElement: active,
    innerHTML: "",
    querySelector: () => ({ focus: (opts) => calls.push(opts) }),
  };
  card._render = () => "<ha-card>v1</ha-card>";
  card._update();
  card._render = () => "<ha-card>v2</ha-card>";
  card._update();
  assert.ok(calls.length > 0);
  for (const opts of calls) assert.equal(opts?.preventScroll, true);
});

test("restoring the focus of the search field does not scroll the page either", () => {
  const card = new lib.SystemMonitorCard();
  card._config = {};
  card._hass = hassWith();
  const calls = [];
  const active = { dataset: { search: "hacs" }, selectionStart: 2, selectionEnd: 2 };
  card.shadowRoot = {
    activeElement: active,
    innerHTML: "",
    querySelector: () => ({ focus: (opts) => calls.push(opts), setSelectionRange() {} }),
  };
  card._render = () => "<ha-card>v1</ha-card>";
  card._update();
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.preventScroll, true);
});

// ── Zoom (status and mini cards) ─────────────────────────────────────────────

/** A connected zoomable card with a recording document listener and a shadow root that keeps its HTML. */
const zoomCard = (cls, config = {}) => {
  const listeners = [];
  lib.document.addEventListener = (type, fn, capture) => listeners.push({ type, fn, capture });
  lib.document.removeEventListener = (type, fn) => {
    const i = listeners.findIndex((l) => l.type === type && l.fn === fn);
    if (i >= 0) listeners.splice(i, 1);
  };
  const card = new cls();
  card._fetchBrandsToken = () => {};
  const focused = [];
  card.shadowRoot.querySelector = (sel) => (sel === ".zoom" ? { focus: () => focused.push(sel) } : null);
  card.setConfig(config);
  card.hass = hassWith();
  card.connectedCallback();
  return { card, listeners, focused };
};
const click = (path, detail = 1) => ({ detail, composedPath: () => path, stopPropagation() {} });
const outside = (card, listeners, path = [{ localName: "div" }]) => {
  for (const l of listeners.filter((x) => x.type === "click")) l.fn(click(path));
  return card;
};

for (const [name, cls, compactSize, compactPart] of [
  ["status", lib.SystemMonitorStatusCard, 2, null],
  ["mini", lib.SystemMonitorMiniCard, 3, 'class="metric'],
]) {
  test(`the ${name} card's zoom button shows the full card, then the compact view again`, () => {
    const { card } = zoomCard(cls);
    assert.match(card._html, /class="zoom" data-action="zoom"[^>]*title="Show the full card"/);
    // The zoom button is the header's last element.
    assert.match(card._html, /<button class="zoom"[^>]*>[\s\S]*?<\/button>\s*<\/div>/);
    assert.doesNotMatch(card._html, /class="gauges"/);
    if (compactPart) assert.ok(card._html.includes(compactPart));
    let stopped = false;
    card._zoomClick({ detail: 1, stopPropagation: () => (stopped = true) });
    assert.ok(stopped);
    assert.ok(card._zoomed);
    // Everything the full card shows, with the same config and the collapse button.
    for (const part of ['class="gauges"', 'class="net"', 'class="vol', 'class="hacs"', 'class="stats"'])
      assert.ok(card._html.includes(part), part);
    if (compactPart) assert.ok(!card._html.includes(compactPart));
    assert.match(card._html, /title="Back to the compact view"/);
    assert.equal(card.getCardSize(), 7);
    assert.equal(card.getGridOptions().columns, 12);
    card._zoomClick(click([]));
    assert.ok(!card._zoomed);
    assert.doesNotMatch(card._html, /class="gauges"/);
    assert.equal(card.getCardSize(), compactSize);
    assert.equal(card.getGridOptions().columns, 6);
  });

  test(`the ${name} card's zoom button keeps the keyboard focus, not the mouse one`, () => {
    const { card, focused } = zoomCard(cls);
    card._zoomClick(click([], 1));
    assert.equal(focused.length, 0);
    card._zoomClick(click([], 0));
    assert.equal(focused.length, 1);
  });

  test(`a click outside the zoomed ${name} card brings it back, a click inside or in a dialog does not`, () => {
    const { card, listeners } = zoomCard(cls);
    assert.ok(listeners.some((l) => l.type === "click" && l.capture === true));
    card._zoomClick(click([]));
    outside(card, listeners, [{ localName: "button" }, card]);
    assert.ok(card._zoomed, "inside the card");
    for (const localName of ["ha-more-info-dialog", "ha-dialog", "dialog"]) {
      outside(card, listeners, [{ localName: "div" }, { localName }]);
      assert.ok(card._zoomed, localName);
    }
    outside(card, listeners);
    assert.ok(!card._zoomed);
    card.disconnectedCallback();
    assert.equal(listeners.filter((l) => l.type === "click").length, 0);
  });

  test(`the zoomed ${name} card does not fold back while the install confirmation is open`, () => {
    const { card, listeners } = zoomCard(cls);
    card._zoomClick(click([]));
    card._openDialog({ body: "", ok: "Install", onOk() {} });
    assert.match(card._html, /class="backdrop"/);
    // A click outside closes the confirmation only; the next one folds the card back.
    outside(card, listeners);
    assert.ok(card._zoomed);
    assert.equal(card._dialog, null);
    outside(card, listeners);
    assert.ok(!card._zoomed);
  });

  test(`zoom: false removes the ${name} card's zoom button`, () => {
    const { card } = zoomCard(cls, { zoom: false });
    assert.doesNotMatch(card._html, /data-action="zoom"/);
  });
}

/** An editor with a recording ha-form stub, so its schema and its config-changed events can be read. */
const editorFor = (cls, config = {}) => {
  const editor = new cls();
  const form = { listeners: {}, addEventListener: (type, fn) => (form.listeners[type] = fn) };
  const events = [];
  editor.appendChild = () => {};
  editor.dispatchEvent = (ev) => events.push(ev);
  const create = lib.document.createElement;
  lib.document.createElement = (tag) => (tag === "ha-form" ? form : create(tag));
  try {
    editor.setConfig(config);
    editor.hass = hassWith();
  } finally {
    lib.document.createElement = create;
  }
  return { editor, form, events };
};
const toggles = (schema) => schema.flatMap((s) => s.schema || [s]).filter((s) => s.selector?.boolean).map((s) => s.name);

for (const [name, card, editorCls, tag] of [
  ["status", lib.SystemMonitorStatusCard, lib.SystemMonitorStatusCardEditor, "system-monitor-status-card-editor"],
  ["mini", lib.SystemMonitorMiniCard, lib.SystemMonitorMiniCardEditor, "system-monitor-mini-card-editor"],
]) {
  test(`the ${name} card's visual editor lists a zoom toggle, on by default and kept out of the YAML`, () => {
    const create = lib.document.createElement;
    lib.document.createElement = (t) => ({ tag: t });
    try {
      assert.equal(card.getConfigElement().tag, tag);
    } finally {
      lib.document.createElement = create;
    }
    const { editor, form, events } = editorFor(editorCls);
    assert.ok(toggles(form.schema).includes("zoom"));
    assert.equal(form.data.zoom, true);
    assert.equal(form.computeLabel({ name: "zoom" }), "Zoom button");
    assert.equal(form.computeHelper({ name: "zoom" }), "Switches the card to the full card and back");
    const change = (value) => form.listeners["value-changed"]({ detail: { value }, stopPropagation() {} });
    change({ ...form.data, zoom: false });
    assert.equal(editor._config.zoom, false);
    change({ ...form.data, zoom: true });
    assert.ok(!("zoom" in editor._config));
    assert.equal(events.length, 2);
  });
}

test("the status pill sits in the header row, the status card's one without the new version", () => {
  const hass = hassWith({ states: { ...states, ...updateAvailable } });
  const sm = lib.discover(hass);
  const full = new lib.SystemMonitorCard();
  full._hass = hass;
  full._config = {};
  // On the title's line, right of the title, above the subtitle.
  const head = full._header(sm);
  assert.match(head, /<div class="title-row"><div class="name">[^<]*<\/div><span class="chip clickable warn"[^>]*title="Update 2026.10.3"><span class="dot"><\/span>Update 2026.10.3<\/span>/);
  assert.doesNotMatch(head, /class="chips"/);
  const status = statusCard(hass);
  assert.match(status._header(sm), /title="Update 2026.10.3"><span class="dot"><\/span>Update<\/span>/);
  status._zoomed = true;
  assert.match(status._header(sm), /<\/span>Update 2026.10.3<\/span>/);
});

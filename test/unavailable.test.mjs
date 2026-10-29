import assert from "node:assert/strict";
import { test } from "node:test";
import { devices, entities, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const lib = load();
const hassWith = (overrides = {}) => ({ states: { ...states }, entities, devices, language: "en", ...overrides });

const CORE = "update.home_assistant_core_update";
const WD = "sensor.integration_watchdog_unavailable_integrations";
const hacsIds = Object.values(entities)
  .filter((e) => e.platform === "hacs" && e.entity_id.startsWith("update."))
  .map((e) => e.entity_id);

/** The hass with these entities in this state, without attributes (as Home Assistant reports an unavailable entity). */
const withStates = (hass, ids, state = "unavailable") => {
  const next = { ...hass.states };
  for (const id of ids) next[id] = { entity_id: id, state, attributes: {} };
  return { ...hass, states: next };
};

const card = (Cls, hass, config = {}) => {
  const c = new Cls();
  c._hass = hass;
  c._config = config;
  return c;
};

for (const state of ["unavailable", "unknown"]) {
  test(`HACS ${state}: the tile is neutral, not "Up to date" in green`, () => {
    const hass = withStates(hassWith(), hacsIds, state);
    const tile = card(lib.SystemMonitorCard, hass)._hacsStat();
    assert.equal(tile.cls, "muted");
    assert.doesNotMatch(tile.html, /Up to date/);
  });

  test(`Integration Watchdog ${state}: the tile is neutral, not "Available" in green`, () => {
    const hass = withStates(hassWith(), [WD], state);
    const tile = card(lib.SystemMonitorCard, hass)._wdStat();
    assert.equal(tile.cls, "muted");
    assert.doesNotMatch(tile.html, /Available/);
  });

  test(`Core update ${state}: the header chip does not claim "Up to date"`, () => {
    const hass = withStates(hassWith(), [CORE], state);
    const header = card(lib.SystemMonitorCard, hass)._header(lib.discover(hass));
    assert.doesNotMatch(header, /chip good/);
    assert.doesNotMatch(header, /Up to date/);
    assert.match(header, /chip clickable muted/);
  });
}

test("HACS unavailable: each extension row shows a neutral chip, not \"Up to date\"", () => {
  const hass = withStates(hassWith(), hacsIds);
  const c = card(lib.SystemMonitorCard, hass);
  c._hacsOpen = true;
  c._hacsQuery = "";
  const html = c._hacs();
  assert.doesNotMatch(html, /chip good/);
  assert.match(html, /chip muted/);
});

test("Core update unavailable: the mini card's footer is neutral", () => {
  const hass = withStates(hassWith(), [CORE]);
  const html = card(lib.SystemMonitorMiniCard, hass)._compactRender();
  assert.doesNotMatch(html, /class="clickable good"/);
  assert.match(html, /class="clickable muted"/);
});

test("the status card shows its row when a source is unavailable", () => {
  const hass = withStates(hassWith(), [...hacsIds, WD]);
  const c = card(lib.SystemMonitorStatusCard, hass);
  const sm = lib.discover(hass);
  // Make the processes good, so that only the unavailable sources are not.
  c._stopped = () => [];
  assert.ok(!c._stats(sm).some((x) => x.cls === "good" && /HACS|Integrations/.test(x.html)));
  assert.match(c._statusRow(sm), /class="stats"/);
});

test("one HACS entity unavailable among up-to-date ones: the tile stays good, that row is neutral", () => {
  const base = hassWith();
  const upToDate = hacsIds.filter((id) => base.states[id].state === "off");
  const hass = withStates(base, [upToDate[0]]);
  const c = card(lib.SystemMonitorCard, hass);
  assert.equal(c._hacsStat().cls, "good");
  c._hacsOpen = true;
  c._hacsQuery = "";
  assert.match(c._hacs(), /chip muted/);
});

test("HACS unavailable except one with an update: the tile counts that update", () => {
  const base = hassWith();
  const hass = withStates(base, hacsIds.slice(1));
  const id = hacsIds[0];
  hass.states[id] = { ...base.states[id], state: "on", attributes: { ...base.states[id].attributes, latest_version: "9.9.9" } };
  const tile = card(lib.SystemMonitorCard, hass)._hacsStat();
  assert.equal(tile.cls, "warn");
  assert.match(tile.html, /1 update/);
});

test("OS update unavailable with Core up to date: the header chip is neutral, a pending Core update still wins", () => {
  const hass = hassWith();
  const os = lib.discover(hass).os_update;
  if (!os) return;
  const h = withStates(hass, [os]);
  assert.match(card(lib.SystemMonitorCard, h)._header(lib.discover(h)), /chip clickable muted/);
  h.states[CORE] = { ...hass.states[CORE], state: "on", attributes: { ...hass.states[CORE].attributes, latest_version: "2099.1.0" } };
  assert.match(card(lib.SystemMonitorCard, h)._header(lib.discover(h)), /chip clickable warn/);
});

test("Integration Watchdog unavailable: its section, unfolded from the tile, does not claim every integration is available", () => {
  const hass = withStates(hassWith(), [WD]);
  const c = card(lib.SystemMonitorCard, hass);
  c._wdOpen = true;
  const html = c._watchdog();
  assert.doesNotMatch(html, /Every integration is available/);
  assert.match(html, /Unknown/);
  // Available again with an empty list: the usual sentence.
  const ok = { ...hass, states: { ...hass.states, [WD]: { entity_id: WD, state: "0", attributes: { integrations: [] } } } };
  c._hass = ok;
  assert.match(c._watchdog(), /Every integration is available/);
});

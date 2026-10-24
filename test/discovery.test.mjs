import assert from "node:assert/strict";
import { test } from "node:test";
import { devices, entities, states } from "../scripts/mock-states.mjs";
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

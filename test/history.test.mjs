// 24 h rate curves (sparklines) behind the network rates, from the recorder statistics.
import assert from "node:assert/strict";
import { test } from "node:test";
import { devices, entities, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const lib = load();
const tick = () => new Promise((r) => setTimeout(r, 0));
const hassWith = (calls) => ({
  states,
  entities,
  devices,
  language: "en",
  config: { version: "2026.10.2" },
  callWS: async (msg) => {
    calls.push(msg);
    return Object.fromEntries(msg.statistic_ids.map((id) => [id, [{ mean: 10 }, { mean: 40 }, { mean: 20 }]]));
  },
});
const card = (Cls, hass, config = {}) => {
  const el = new Cls();
  el._hass = hass;
  el._config = config;
  el._update = () => {
    el.html = el._render();
  };
  return el;
};

test("rate tiles: 24 h sparkline from the recorder statistics, refreshed every 5 minutes, off with show_history: false", async () => {
  const calls = [];
  const el = card(lib.SystemMonitorCard, hassWith(calls));
  el._update();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].type, "recorder/statistics_during_period");
  assert.equal(calls[0].period, "5minute");
  assert.deepEqual([...calls[0].types], ["mean"]);
  assert.ok(calls[0].statistic_ids.length >= 2);
  assert.ok(calls[0].statistic_ids.every((id) => /network_throughput_(in|out)_/.test(id)), calls[0].statistic_ids.join());
  assert.ok(Math.abs(Date.now() - 864e5 - Date.parse(calls[0].start_time)) < 5000);
  assert.doesNotMatch(el.html, /class="spark"/);
  await tick();
  assert.match(el.html, /<div class="tile clickable down"[^>]*><svg class="spark"/);
  assert.match(el.html, /<div class="tile clickable up"[^>]*><svg class="spark"/);
  el._update();
  assert.equal(calls.length, 1, "no new query within 5 minutes");
  el._histAt -= 5 * 60000 + 1;
  el._update();
  assert.equal(calls.length, 2);

  const offCalls = [];
  const off = card(lib.SystemMonitorCard, hassWith(offCalls), { show_history: false });
  off._update();
  await tick();
  assert.doesNotMatch(off.html, /class="spark"/);
  assert.equal(offCalls.length, 0);
});

test("rate tiles: no curve and a retry after a minute when the recorder has no statistics", async () => {
  const hass = hassWith([]);
  let n = 0;
  hass.callWS = async () => {
    n++;
    throw new Error("no statistics");
  };
  const el = card(lib.SystemMonitorCard, hass);
  el._update();
  await tick();
  assert.equal(n, 1);
  assert.doesNotMatch(el._render(), /class="spark"/);
  el._histAt -= 60000 + 1;
  el._update();
  assert.equal(n, 2);
});

test("mini card: the footer rates draw the same 24 h curves", async () => {
  const calls = [];
  const el = card(lib.SystemMonitorMiniCard, hassWith(calls));
  el._update();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].statistic_ids.length, 2);
  await tick();
  assert.match(el.html, /<span class="clickable down"[^>]*><svg class="spark"/);
  assert.match(el.html, /<span class="clickable up"[^>]*><svg class="spark"/);
  el._update();
  assert.equal(calls.length, 1, "no new query within 5 minutes");
  el._config = { show_history: false };
  assert.doesNotMatch(el._render(), /class="spark"/);
});

test("editors: show_history among the toggles of both cards", () => {
  assert.ok(lib.SystemMonitorCardEditor.toggles.includes("show_history"));
  assert.ok(lib.SystemMonitorMiniCardEditor.toggles.includes("show_history"));
  for (const [code, s] of Object.entries(lib.STRINGS)) assert.ok(s.show_history, code);
  assert.doesNotMatch(lib.STRINGS.sr.show_history, /[A-Za-z]/);
});

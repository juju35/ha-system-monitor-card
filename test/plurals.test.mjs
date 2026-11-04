import assert from "node:assert/strict";
import { test } from "node:test";
import { devices, entities, states } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const lib = load();
const LANGS = Object.keys(lib.STRINGS);
const WD = "sensor.integration_watchdog_unavailable_integrations";
// Languages with more than two plural forms (Serbian, Polish, Russian, Ukrainian, Slovak, Czech, Slovenian: 1, 2-4,
// 5+; Romanian "de" from 20; Latvian): their counts other than 1 are turned into "label: {n}"
// (or "label ({n})"), which reads right for every number.
const ROTATED = ["sr", "sr-Latn", "pl", "ro", "ru", "uk", "sk", "cs", "sl", "lv"];
const rotated = (s, n) => s.endsWith(`: ${n}`) || s.includes(`(${n})`);

/** n HACS extensions with an update, n integrations unavailable (one reload each), n processes stopped. */
const hassWith = (n, language) => {
  const st = { ...states };
  const ent = Object.fromEntries(Object.entries(entities).filter(([, e]) => e.platform !== "hacs"));
  const dev = { ...devices };
  for (let i = 0; i < n; i++) {
    const id = `update.ext_${i}_update`;
    st[id] = { entity_id: id, state: "on", attributes: { installed_version: "1.0.0", latest_version: "1.1.0" } };
    ent[id] = { entity_id: id, platform: "hacs", device_id: `ext_${i}` };
    dev[`ext_${i}`] = { id: `ext_${i}`, name: `Extension ${i}`, model: "plugin" };
  }
  const integrations = Array.from({ length: n }, (_, i) => ({ domain: `d${i}`, title: `D${i}`, entry_id: `e${i}`, since: null, reloads: n, gave_up: false }));
  st[WD] = { ...st[WD], state: String(n), attributes: { ...st[WD].attributes, integrations } };
  return { states: st, entities: ent, devices: dev, language, locale: { language } };
};

const card = (hass) => {
  const c = new lib.SystemMonitorCard();
  c._hass = hass;
  c._config = {};
  c._stopped = () => Array.from({ length: hass.__n }, (_, i) => `p${i}`);
  return c;
};

/** Every count the card writes, for n: tile values and titles, Watchdog reloads, install confirmation. */
const counts = (n, language) => {
  const hass = { ...hassWith(n, language), __n: n };
  const c = card(hass);
  const sm = lib.discover(hass);
  const tile = (x) => ({ value: x.html.match(/<div class="v">([^<]*)</)[1], title: x.html.match(/title="([^"]*)"/)[1] });
  const out = {};
  for (const [name, x] of [["hacs", c._hacsStat()], ["procs", c._procsStat(sm)], ["wd", c._wdStat()]]) {
    const { value, title } = tile(x);
    out[`${name} value`] = value;
    out[`${name} title`] = title;
  }
  c._wdOpen = true;
  out.reloads = c._watchdog().match(/class="ext-ver">([^<]*)</)[1];
  let confirm = "";
  c._openDialog = (d) => {
    confirm = d.body.match(/<div class="hint">([^<]*)</)[1];
  };
  c._installAll();
  out.confirm = confirm;
  return out;
};

for (const language of LANGS) {
  test(`${language}: 1 is singular everywhere`, () => {
    const one = counts(1, language);
    const many = counts(2, language);
    for (const [k, v] of Object.entries(one)) assert.match(v, /1/, `${k}: "${v}"`);
    // The confirmation used to have no singular: "Install 1 HACS updates?".
    assert.notEqual(one.confirm, many.confirm.replace("2", "1"), `"${one.confirm}" is the plural form`);
  });
}

for (const language of ROTATED)
  for (const n of [2, 5, 21, 22])
    test(`${language}: counts of ${n} use the "label: {n}" form`, () => {
      for (const [k, v] of Object.entries(counts(n, language))) assert.ok(rotated(v, n), `${k}: "${v}"`);
    });

test("sr-Latn: the integrations tile agrees with Integracije (feminine)", () => {
  assert.equal(counts(1, "sr-Latn")["wd value"], "1 nedostupna");
  assert.equal(counts(1, "sr")["wd value"], "1 недоступна");
  assert.equal(counts(2, "sr-Latn")["wd value"], "Nedostupne: 2");
  assert.equal(counts(2, "sr")["wd value"], "Недоступне: 2");
});

test("English counts (reference)", () => {
  assert.deepEqual(counts(1, "en"), {
    "hacs value": "1 update",
    "hacs title": "1 HACS update",
    "procs value": "1 stopped",
    "procs title": "1 process stopped",
    "wd value": "1 unavailable",
    "wd title": "1 integration unavailable",
    reloads: "1 reload",
    confirm: "Install 1 HACS update?",
  });
  assert.equal(counts(5, "en").confirm, "Install 5 HACS updates?");
});

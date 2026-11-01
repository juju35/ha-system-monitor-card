import assert from "node:assert/strict";
import { test } from "node:test";
import { load } from "./load.mjs";

const { STRINGS } = load();
const placeholders = (s) => (String(s).match(/\{\w+\}/g) || []).sort();

test("I18N parity: every language has exactly the English keys and placeholders", () => {
  const ref = Object.keys(STRINGS.en).sort();
  for (const l of ["fr", "de", "es", "sr", "sr-Latn"]) {
    assert.ok(STRINGS[l], `missing language ${l}`);
    assert.deepEqual(Object.keys(STRINGS[l]).sort(), ref, `keys of ${l}`);
    for (const k of ref) assert.deepEqual(placeholders(STRINGS[l][k]), placeholders(STRINGS.en[k]), `placeholders of ${l}.${k}`);
  }
});

// Key paths of a dictionary, with array lengths, so nested objects and lists are compared too.
const shape = (v, p = "") =>
  Array.isArray(v)
    ? [`${p}[${v.length}]`, ...v.flatMap((x, i) => shape(x, `${p}[${i}]`))]
    : v && typeof v === "object"
      ? Object.keys(v).flatMap((k) => shape(v[k], p ? `${p}.${k}` : k))
      : [p];

test("I18N parity: sr and sr-Latn have exactly the English key paths, arrays of the same length", () => {
  const ref = shape(STRINGS.en).sort();
  for (const l of ["sr", "sr-Latn"]) {
    assert.ok(STRINGS[l], `missing language ${l}`);
    assert.deepEqual(shape(STRINGS[l]).sort(), ref, `key paths of ${l}`);
  }
});

test("the language resolves to the full code, then the part before the dash, then English", () => {
  const { lang } = load();
  assert.equal(lang({ language: "fr-FR" }, {}), "fr");
  assert.equal(lang({ language: "sr-Latn" }, {}), "sr-Latn");
  assert.equal(lang({ locale: { language: "sr-Latn" } }, {}), "sr-Latn");
  assert.equal(lang({ language: "sr" }, {}), "sr");
  assert.equal(lang({ language: "pt-BR" }, {}), "en");
  assert.equal(lang({ language: "sr" }, { language: "sr-Latn" }), "sr-Latn");
});

test("the language resolves to de and es, with an English fallback", () => {
  const { lang } = load();
  assert.equal(lang({ language: "de" }, {}), "de");
  assert.equal(lang({ locale: { language: "es-ES" } }, {}), "es");
  assert.equal(lang({ language: "fr" }, { language: "de" }), "de");
  assert.equal(lang({ language: "xx" }, {}), "en");
});

test("the editor offers every language", () => {
  const { SystemMonitorMiniCardEditor } = load();
  const editor = new SystemMonitorMiniCardEditor();
  editor._config = {};
  const field = editor._schema().find((f) => f.name === "language");
  const values = field.selector.select.options.map((o) => o.value);
  for (const l of ["en", "fr", "de", "es", "sr", "sr-Latn"]) assert.ok(values.includes(l), `editor option ${l}`);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { shots } from "../scripts/screenshot-shots.mjs";

const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const withoutTheme = ({ file, theme, ...setup }) => setup;

// The README's "| Light | Dark |" screenshot rows: [light file, dark file].
const pairs = [...readme.matchAll(/\| !\[[^\]]*\]\(screenshots\/([\w-]+)\.png\) \| !\[[^\]]*\]\(screenshots\/([\w-]+)\.png\) \|/g)].map((m) => [
  m[1],
  m[2],
]);

test("the README pairs every light screenshot with a dark twin", () => {
  assert.ok(pairs.length >= 9, `found ${pairs.length} pairs`);
  const byFile = Object.fromEntries(shots.map((s) => [s.file, s]));
  for (const [light, dark] of pairs) {
    assert.equal(byFile[light]?.theme, "light", `${light} is rendered in the light theme`);
    assert.equal(byFile[dark]?.theme, "dark", `${dark} is rendered in the dark theme`);
  }
  // Every rendered PNG is shown in a pair (none rendered for nothing).
  assert.deepEqual(pairs.flat().sort(), shots.map((s) => s.file).sort());
});

test("each light/dark pair renders exactly the same state: only the theme changes", () => {
  const byFile = Object.fromEntries(shots.map((s) => [s.file, s]));
  for (const [light, dark] of pairs) {
    assert.deepEqual(withoutTheme(byFile[dark]), withoutTheme(byFile[light]), `${light} / ${dark}`);
  }
});

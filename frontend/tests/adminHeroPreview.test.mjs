import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("admin hero preview mirrors the compact project mark, headline and category layout", () => {
  const canvas = readFileSync("components/admin/cases/CaseBlockCanvasCard.vue", "utf8");

  assert.match(canvas, /class="preview-hero-project"/);
  assert.match(canvas, /class="preview-hero-mark"/);
  assert.match(canvas, /class="preview-hero-category"/);
  assert.match(canvas, /\.preview-hero-category\s*\{[^}]*position:\s*absolute;[^}]*right:\s*0;[^}]*text-align:\s*right;/s);
  assert.doesNotMatch(canvas, /preview-hero-(?:identity|logo-stage|meta)/);
});

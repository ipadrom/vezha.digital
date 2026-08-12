import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("admin hero preview right-aligns category and year beneath the logo", () => {
  const canvas = readFileSync("components/admin/cases/CaseBlockCanvasCard.vue", "utf8");

  assert.match(
    canvas,
    /\.preview-hero-meta\s*\{[^}]*width:\s*fit-content;[^}]*justify-self:\s*end;[^}]*justify-content:\s*flex-end;[^}]*text-align:\s*right;/s,
  );
  assert.doesNotMatch(
    canvas,
    /\.preview-hero-meta\s*\{[^}]*justify-content:\s*flex-start;/s,
  );
});

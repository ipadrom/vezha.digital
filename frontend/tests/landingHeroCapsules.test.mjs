import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const landingPage = readFileSync(
  new URL("../pages/index.vue", import.meta.url),
  "utf8",
);

const sharedRule = landingPage.match(
  /\.vz-stack-item span:not\(\[data-dot\], \[data-halo\]\),\s*\.vz-hero__stats span\s*\{([^}]*)\}/,
)?.[1] ?? "";

const heroStatsRule = [...landingPage.matchAll(
  /\.vz-hero__stats\s*\{([^}]*)\}/g,
)]
  .map((match) => match[1] ?? "")
  .find((rule) => rule.includes("display: grid")) ?? "";

test("shares compact capsule styling between stack and hero", () => {
  assert.ok(sharedRule, "shared compact capsule rule is missing");

  for (const declaration of [
    "padding: 7px 13px;",
    "border: 1px solid var(--chipbd);",
    "border-radius: 999px;",
    "color: var(--chipink);",
    'font-family: "JetBrains Mono", monospace;',
    "font-size: 12px;",
    "letter-spacing: 0.03em;",
    "text-transform: none;",
  ]) {
    assert.ok(
      sharedRule.includes(declaration),
      `shared compact capsule rule is missing: ${declaration}`,
    );
  }
});

test("keeps hero capsules at their intrinsic width", () => {
  assert.ok(
    heroStatsRule.includes("justify-items: start;"),
    "hero capsule grid should not stretch items across their columns",
  );
});

test("keeps mobile hero capsule labels on one line", () => {
  assert.ok(
    sharedRule.includes("white-space: nowrap;"),
    "compact capsule labels should not wrap",
  );
  assert.ok(
    landingPage.includes("grid-template-columns: repeat(2, max-content);"),
    "mobile hero capsule columns should use their content width",
  );
});

import assert from "node:assert/strict";
import test from "node:test";

import { getCaseFallbacks } from "../utils/caseFallbacks.ts";

for (const locale of ["ru", "en"] as const) {
  test(`WELLNESS APP is localized and anonymized for ${locale}`, () => {
    const wellness = getCaseFallbacks(locale).find((item) => item.slug === "wellness-app");
    assert.ok(wellness);
    assert.equal(wellness.name, "WELLNESS APP");
    assert.equal(wellness.sort_order, 0);
    assert.equal(wellness.metrics.length, 4);
    assert.ok(wellness.metrics.every((metric) => metric.is_demo));
    assert.notEqual(wellness.name, "Training");
    assert.doesNotMatch(JSON.stringify(wellness), /artas|recipes-tab/i);
  });
}

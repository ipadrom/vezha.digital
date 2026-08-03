import assert from "node:assert/strict";
import test from "node:test";

import {
  caseMenuVariants,
  getCaseMenuVariant,
  normalizeCaseMenuVariant,
  normalizeCaseMenuView,
} from "../utils/caseMenuVariants.ts";

test("invalid menu query values resolve to the recommended desktop variant", () => {
  assert.equal(normalizeCaseMenuVariant("99"), "1");
  assert.equal(normalizeCaseMenuVariant(undefined), "1");
  assert.equal(normalizeCaseMenuView("tablet"), "desktop");
});

test("valid menu query values preserve the requested state", () => {
  assert.equal(normalizeCaseMenuVariant("4"), "4");
  assert.equal(normalizeCaseMenuView("mobile"), "mobile");
});

test("the selected variant resolves to one complete composition", () => {
  assert.deepEqual(caseMenuVariants.map((item) => item.id), ["1", "2", "3", "4", "5"]);
  assert.deepEqual(getCaseMenuVariant("3"), {
    id: "3",
    name: "Один селектор",
    note: "Список появляется только по запросу.",
  });
});

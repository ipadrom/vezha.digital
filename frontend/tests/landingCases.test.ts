import assert from "node:assert/strict";
import test from "node:test";

import { getMetricGridClass, getNextProject, mergeFeaturedProjects, moveCaseIndex, selectFeaturedProjects } from "../utils/landingCases.ts";
import type { IProjects } from "../utils/interfaces/IProjects.ts";

const project = (slug: string | null, sort_order: number, is_featured = true): IProjects => ({
  id: String(sort_order), slug, sort_order, is_featured,
  type: "Web", name: slug || "No slug", metrics: [],
});

test("featured cases are deterministic and capped", () => {
  const result = selectFeaturedProjects([
    project("third", 3), project("first", 1), project(null, 0), project("hidden", 2, false), project("second", 2),
  ], 2);
  assert.deepEqual(result.map((item) => item.slug), ["first", "second"]);
});

test("case navigation wraps in both directions", () => {
  assert.equal(moveCaseIndex(0, -1, 3), 2);
  assert.equal(moveCaseIndex(2, 1, 3), 0);
});

test("next project wraps and metric layouts stay explicit", () => {
  const projects = [project("one", 1), project("two", 2)];
  assert.equal(getNextProject(projects, "two")?.slug, "one");
  assert.equal(getMetricGridClass(1), "is-single");
  assert.equal(getMetricGridClass(2), "is-pair");
  assert.equal(getMetricGridClass(4), "is-grid");
});

test("required fallback case is merged beside API cases without duplicates", () => {
  const api = [project("api-case", 1), project("wellness-app", 5)];
  const fallback = [project("wellness-app", 0), project("fallback-only", 2)];
  assert.deepEqual(
    mergeFeaturedProjects(api, fallback, ["wellness-app"]).map((item) => item.slug),
    ["api-case", "wellness-app"],
  );
  assert.equal(mergeFeaturedProjects([], fallback, ["wellness-app"]).length, 2);
});

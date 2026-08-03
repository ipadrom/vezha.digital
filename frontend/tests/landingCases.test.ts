import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("mobile case flow places the visual before metrics without changing desktop markup order", () => {
  const component = readFileSync("components/landing/LandingCases.vue", "utf8");
  const css = readFileSync("assets/css/landing-cases.css", "utf8");

  assert.match(component, /class="vz-cases__story-copy"/);
  assert.match(css, /\.vz-cases__story\s*\{\s*display:\s*contents;/);
  assert.match(css, /\.vz-cases__story-copy\s*\{[^}]*order:\s*1;/s);
  assert.match(css, /\.vz-cases__active\s*>\s*\.case-visual\s*\{[^}]*order:\s*2;/s);
  assert.match(css, /\.vz-cases__story\s*>\s*\.case-metrics\s*\{[^}]*order:\s*3;/s);
});

test("landing case metrics stay unframed", () => {
  const css = readFileSync("assets/css/landing-cases.css", "utf8");

  assert.match(css, /\.vz-cases\s+\.case-metrics\s*\{[^}]*border:\s*0;/s);
  assert.match(css, /\.vz-cases\s+\.case-metric\s*\{[^}]*border:\s*0;/s);
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const componentPath = new URL("../components/cases/CaseMenuVariantsPreview.vue", import.meta.url);
const cssPath = new URL("../assets/css/case-menu-variants.css", import.meta.url);

test("variant 1 provides clickable capsule navigation on desktop and mobile", async () => {
  const [component, css] = await Promise.all([
    readFile(componentPath, "utf8"),
    readFile(cssPath, "utf8"),
  ]);

  assert.match(component, /@click="activeProjectId = project\.id"/);
  assert.match(css, /\.menu-rail button[\s\S]*border-radius:\s*999px/);
  assert.match(css, /\.case-menu-preview--mobile \.menu-rail[\s\S]*overflow-x:\s*auto/);
});

test("only variant 1 renders its active project in the shared demo content", async () => {
  const component = await readFile(componentPath, "utf8");

  assert.match(component, /const displayedProject = computed\(\(\) => props\.variant === "1" \? activeProject\.value : projects\[0\]\);/);
  assert.doesNotMatch(component, /\{\{ activeProject\.(?:id|name|description|kind|sector|monogram) \}\}/);
  assert.match(component, /\{\{ displayedProject\.name \}\}/);
});

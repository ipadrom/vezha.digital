import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync("components/case-builder/CaseClientIntro.vue", "utf8");
const inspector = readFileSync("components/admin/cases/CaseBlockInspector.vue", "utf8");

test("copies the client email on click with the landing mail icon and copied state", () => {
  assert.match(component, /<button v-if="email" class="case-client__button case-client__button--email" type="button"[^>]*@click="copyValue\('email', email\)"/);
  assert.match(component, /<rect x="3" y="5" width="18" height="14" rx="2" \/><path d="m3 7 9 6 9-6" \/>/);
  assert.match(component, /t\('landing\.contacts\.copied'\)/);
  assert.doesNotMatch(component, /mailto:/);
});

test("stretches a lone client button across the column", () => {
  assert.match(component, /const buttonCount = computed\(\(\) => \[email\.value, contactUrl\.value, safeLink\(props\.content\.project_url\)\]\.filter\(Boolean\)\.length\)/);
  assert.match(component, /'case-client__actions--single': buttonCount === 1/);
  assert.match(component, /\.case-client__actions--single \.case-client__button \{ width: 100%;/);
});

test("lets editors change the client email in the block inspector", () => {
  assert.match(inspector, /\{ key: 'contact_email', label: 'Почта \(копируется по нажатию\)' \}/);
});

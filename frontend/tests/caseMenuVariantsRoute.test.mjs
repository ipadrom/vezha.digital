import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.CASE_VARIANTS_BASE_URL || "http://127.0.0.1:3004";

test("case menu variants route renders a single selected preview", async () => {
  const response = await fetch(`${baseUrl}/case-menu-variants?variant=3&view=mobile`);
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /ВАРИАНТЫ МЕНЮ КЕЙСОВ/);
  assert.match(html, /Один селектор/);
  assert.match(html, /case-menu-preview--mobile/);
});

/** 收录证据的行为回归：缺失不造通过、旧记录失效、资料与实测不可混淆。 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { catalog } from "../src/catalog.ts";
import { reviewFor, reviewCard, reviewDetail } from "../src/review-records.ts";
import { cardMarkup } from "../src/card.ts";
import { validateReviews } from "./review-validation.mjs";
const records = JSON.parse(
  readFileSync(new URL("../data/reviews.json", import.meta.url), "utf8"),
);
const item = catalog.find((row) => row.id === "dyt-ashare-cli");
test("documentary evidence stays distinct from independent installation testing", () => {
  validateReviews(records, catalog);
  const html = reviewDetail(item);
  assert.match(html, /资料核对/);
  assert.match(html, /未包含本站独立安装实测/);
  assert.doesNotMatch(html, /class="review-method">安装实测/);
  assert.ok(html.includes(`href="${reviewFor(item).evidence}"`));
  const missing = catalog.find((row) => row.id === "wrangler");
  assert.equal(reviewFor(missing), null);
  assert.match(reviewCard(missing), /范围待补充/);
  assert.match(reviewDetail(missing), /查看已有收录依据/);
  assert.doesNotMatch(cardMarkup(missing, 0, "stars"), /实测通过|核验通过/);
});
test("changing identity, purpose or installation invalidates the bound record", () => {
  for (const key of [
    "repo",
    "docs",
    "install",
    "name",
    "vendor",
    "maintainerType",
    "description",
  ]) {
    const changed = { ...item, [key]: item[key] + "-changed" };
    assert.equal(reviewFor(changed), null);
    assert.throws(() =>
      validateReviews(
        records,
        catalog.map((row) => (row.id === item.id ? changed : row)),
      ),
    );
  }
});
test("execution claims require environment, version and explicit evidence contracts", () => {
  for (const mutate of [
    (rows) => rows.push(rows[0]),
    (rows) => (rows[0].checks[0].method = "execution"),
    (rows) => (rows[0].checks[1].method = "execution"),
    (rows) => (rows[0].reviewedAt = "2026-02-30T00:00:00Z"),
    (rows) => (rows[0].reviewedAt = "2099-01-01T00:00:00Z"),
    (rows) => (rows[0].evidence = "https://evil.test/pull/2"),
    (rows) => (rows[0].checks[0].reference = "javascript:alert(1)"),
  ]) {
    const rows = structuredClone(records);
    mutate(rows);
    assert.throws(() => validateReviews(rows, catalog));
  }
  const tested = structuredClone(records);
  Object.assign(tested[0].checks[1], {
    method: "execution",
    environment: "macOS / isolated fixture",
    version: "0.1.0",
  });
  assert.doesNotThrow(() => validateReviews(tested, catalog));
  assert.match(reviewDetail(item, tested), /class="review-method">安装实测/);
  tested[0].checks[1].note = "<img src=x onerror=alert(1)>";
  assert.doesNotMatch(reviewDetail(item, tested), /<img src=x/);
  assert.match(reviewDetail(item, tested), /&lt;img/);
});

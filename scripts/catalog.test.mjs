/** 行为回归：组合筛选、不可变排序与空搜索。 */
import test from "node:test";
import assert from "node:assert/strict";
import { queryEntries, catalog, stats } from "../src/catalog.ts";
import { formatStars } from "../src/tool-metrics.ts";
test("cloud provider search composes with category and vendor", () => {
  assert.deepEqual(
    queryEntries("API", "cloud", "腾讯云", "stars").map((x) => x.id),
    ["tccli"],
  );
  assert.equal(queryEntries("API", "terminal", "腾讯云", "stars").length, 0);
});
test("ranking uses snapshot stars descending without changing source", () => {
  const before = JSON.stringify(catalog);
  const result = queryEntries("", "", "", "stars");
  result.forEach((entry, i) => {
    if (i)
      assert(
        (stats(result[i - 1])?.stars ?? -1) >= (stats(entry)?.stars ?? -1),
      );
  });
  assert.equal(JSON.stringify(catalog), before);
});
test("search supports case folding, command names and no matches", () => {
  assert.equal(queryEntries("  WRANGLER ", "", "", "stars")[0].id, "wrangler");
  assert.equal(queryEntries("nonexistent-cli-xyz", "", "", "stars").length, 0);
});
test("source filters compose and partition catalog without implying quality", () => {
  const official = queryEntries("", "", "", "stars", "vendor");
  const community = queryEntries("", "", "", "stars", "community");
  assert(official.length && community.length);
  assert(official.every((item) => item.maintainerType === "vendor"));
  assert(community.every((item) => item.maintainerType === "community"));
  assert.equal(official.length + community.length, catalog.length);
  assert.equal(
    queryEntries("wrangler", "cloud", "Cloudflare", "stars", "vendor")[0].id,
    "wrangler",
  );
  assert.equal(
    queryEntries("wrangler", "", "", "stars", "community").length,
    0,
  );
  assert.equal(
    queryEntries("ripgrep", "", "", "stars", "community")[0].id,
    "rg",
  );
});
test("non-GitHub tools have no fabricated stars and remain discoverable", () => {
  const entry = queryEntries("MiMo Code", "", "", "stars")[0];
  assert.equal(stats(entry), null);
  const result = queryEntries("", "", "", "stars");
  const firstUnranked = result.findIndex((item) => stats(item) === null);
  assert(result.slice(firstUnranked).every((item) => stats(item) === null));
});

test("star labels never collapse two different counts into one tie", () => {
  // 紧凑格式会把这两个值都舍成 255.4K，在榜单头部制造假并列。
  assert.equal(formatStars(255446), "255,446");
  assert.equal(formatStars(255431), "255,431");
  assert.notEqual(formatStars(255446), formatStars(255431));
  assert.equal(formatStars(4636), "4,636");
  assert.equal(formatStars(0), "0");
  assert.equal(formatStars(2_500_000), "2.5M");
});

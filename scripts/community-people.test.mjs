/** 推荐官评语与维护者快照的回归：评语必须来自真实 Issue，快照不得编造。 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  validateContributors,
  validateRecommendations,
  validateRecommendationTranslations,
} from "./community-people-validation.mjs";
import {
  validateContributorSchema,
  validateRecommendationSchema,
} from "./validation.mjs";
import { recommendationPicks, prefersReducedMotion } from "../src/community.ts";
import { contributorProfile } from "../src/contributors.ts";
import { catalog } from "../src/catalog.ts";
const read = (path) =>
  JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const records = read("data/community.json");
const picks = read("data/recommendations.json");
const english = read("data/recommendations.en.json");
const snapshot = read("data/contributors.json");

test("recommendation quotes bind to real issues and consenting curators", () => {
  validateRecommendationSchema(picks);
  validateRecommendations(picks, records, catalog);
  validateRecommendationTranslations(english, picks);
  for (const pick of picks) {
    const record = records.find((row) => row.id === pick.id);
    assert(record, `${pick.id} 缺少收录记录`);
    assert.equal(record.recommendedBy, pick.curator);
    assert.equal(record.evidence, pick.evidence);
    assert(
      pick.evidence.includes("github.com/webkubor/supercli/issues/"),
      "评语出处必须指向本站 Issue",
    );
  }
});

test("recommendation quotes reject forged curators and sources", () => {
  const forged = structuredClone(picks);
  forged[0].curator = "someone-else";
  assert.throws(() => validateRecommendations(forged, records, catalog));
  const moved = structuredClone(picks);
  moved[0].evidence = "https://github.com/webkubor/supercli/issues/999";
  assert.throws(() => validateRecommendations(moved, records, catalog));
  const outsider = structuredClone(picks);
  outsider[0].evidence = "https://evil.test/issues/1";
  assert.throws(() => validateRecommendations(outsider, records, catalog));
  const unknown = structuredClone(picks);
  unknown[0].id = "not-in-catalog";
  assert.throws(() => validateRecommendations(unknown, records, catalog));
  assert.throws(() => validateRecommendationTranslations({}, picks));
  assert.throws(() =>
    validateRecommendationTranslations({ ...english, [picks[0].id]: "中文夹带" }, picks),
  );
});

test("contributor snapshot covers every credited user without inventing counts", () => {
  validateContributorSchema(snapshot);
  validateContributors(snapshot, records);
  const missing = structuredClone(snapshot);
  delete missing.users.webkubor;
  assert.throws(() => validateContributors(missing, records));
  const invented = structuredClone(snapshot);
  invented.users.webkubor.followers = -1;
  assert.throws(() => validateContributors(invented, records));
});

test("maintainer follower counts come from the snapshot, missing ones stay null", () => {
  const profile = contributorProfile("webkubor");
  assert(profile, "webkubor 应该有快照");
  assert.equal(profile.login, "webkubor");
  assert(profile.followers >= 0);
  assert.equal(contributorProfile("nobody-here"), null);
  const empty = { ...snapshot, users: { ...snapshot.users, webkubor: null } };
  assert.equal(contributorProfile("webkubor", empty), null);
});

test("every credited maintainer and recommender has a GitHub profile row", () => {
  const credited = [
    ...new Set(
      records
        .flatMap((row) => [row.curatedBy, row.recommendedBy])
        .filter((name) => typeof name === "string")
        .map((name) => name.toLowerCase()),
    ),
  ].sort();
  assert.deepEqual(Object.keys(snapshot.users).sort(), credited);
  for (const login of credited)
    assert(snapshot.users[login], `${login} 应该有用户资料`);
});

test("recommendation picks are sorted by inclusion date and cover real tools", () => {
  const rows = recommendationPicks(records, picks);
  assert.equal(rows.length, picks.length);
  for (const row of rows) {
    assert(catalog.some((item) => item.id === row.pick.id));
    assert.equal(row.record.recommendedBy, row.pick.curator);
  }
  const dates = rows.map((row) => Date.parse(row.record.addedAt));
  assert.deepEqual(dates, [...dates].sort((a, b) => b - a));
});

test("reduced motion preference is read from the environment, not assumed", () => {
  // 无 window 环境（构建脚本）不应抛错。
  assert.equal(typeof prefersReducedMotion(), "boolean");
  const original = globalThis.window;
  globalThis.window = {
    matchMedia: (query) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
    }),
  };
  try {
    assert.equal(prefersReducedMotion(), true);
    globalThis.window = {
      matchMedia: (query) => ({
        matches: false,
        media: query,
      }),
    };
    assert.equal(prefersReducedMotion(), false);
  } finally {
    if (original === undefined) delete globalThis.window;
    else globalThis.window = original;
  }
});

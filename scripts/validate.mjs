/** 投稿与快照的构建门禁：结构、重复、图标、数据覆盖与时间。 */
import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
import { validateGuides } from "./guide-validation.ts";
import { validateCatalog, validateMetrics } from "./validation.mjs";
import { validateReviews } from "./review-validation.mjs";
import { validateCommunity } from "./community-validation.mjs";
import {
  validateContributors,
  validateRecommendations,
  validateRecommendationTranslations,
} from "./community-people-validation.mjs";
import { validateUsage } from "./usage-validation.mjs";
const read = (path) => JSON.parse(readFileSync(path, "utf8"));
const catalog = read("data/catalog.json");
const snapshot = read("data/metrics.json");
const community = read("data/community.json");
const recommendations = read("data/recommendations.json");
validateCatalog(catalog);
validateGuides(read("data/guides.json"));
validateReviews(read("data/reviews.json"), catalog);
validateCommunity(community, catalog);
validateRecommendations(recommendations, community, catalog);
validateRecommendationTranslations(
  read("data/recommendations.en.json"),
  recommendations,
);
validateContributors(read("data/contributors.json"), community);
validateMetrics(snapshot, catalog);
validateUsage(read("data/usage.json"), catalog);
for (const item of catalog)
  assert(existsSync(`public/icons/${item.icon}`), `缺少 ${item.icon} 图标`);
console.log(
  `Validated ${catalog.length} CLI entries, icons and repository snapshots.`,
);

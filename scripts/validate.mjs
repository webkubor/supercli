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
// 头像本地化：每个署名者的头像文件必须真实存在，缺图直接拦构建。
for (const [login, profile] of Object.entries(read("data/contributors.json").users)) {
  assert(profile, `缺少 ${login} 的 GitHub 用户快照，请重跑 pnpm sync:people`);
  assert(
    existsSync(`public/avatars/${profile.avatar}`),
    `缺少 ${login} 头像（${profile.avatar}），请重跑 pnpm sync:people`,
  );
}
console.log(
  `Validated ${catalog.length} CLI entries, icons and repository snapshots.`,
);

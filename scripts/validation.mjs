/** 构建与同步共用数据契约；目录校验不读取旧指标或要求图标已存在。 */
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import Ajv from "ajv";
const schema = (name) =>
  JSON.parse(
    readFileSync(
      new URL(`../data/${name}.schema.json`, import.meta.url),
      "utf8",
    ),
  );
const ajv = new Ajv({ allErrors: true });
ajv.addFormat("timestamp", (value) => Number.isFinite(Date.parse(value)));
const catalogSchema = ajv.compile(schema("catalog"));
const metricsSchema = ajv.compile(schema("metrics"));
const recommendationsSchema = ajv.compile(schema("recommendations"));
const contributorsSchema = ajv.compile(schema("contributors"));
export function validateCatalog(catalog) {
  assert(catalogSchema(catalog), JSON.stringify(catalogSchema.errors));
  for (const field of ["id", "repo"]) {
    const values = catalog
      .filter((item) => item[field] !== null)
      .map((item) => item[field].toLowerCase());
    assert.equal(new Set(values).size, values.length, `重复 ${field}`);
  }
}
/** 推荐语结构由 schema 把关，语义关系（署名与出处）由社区门禁把关。 */
export function validateRecommendationSchema(picks) {
  assert(
    recommendationsSchema(picks),
    JSON.stringify(recommendationsSchema.errors),
  );
}
/** GitHub 用户快照结构由 schema 把关，覆盖与数值语义由社区门禁把关。 */
export function validateContributorSchema(snapshot) {
  assert(
    contributorsSchema(snapshot),
    JSON.stringify(contributorsSchema.errors),
  );
}
export function validateMetrics(snapshot, catalog) {
  assert(metricsSchema(snapshot), JSON.stringify(metricsSchema.errors));
  assert.deepEqual(
    Object.keys(snapshot.repositories).sort(),
    catalog.map((item) => item.id).sort(),
    "指标覆盖与目录不符",
  );
  for (const item of catalog) {
    const metric = snapshot.repositories[item.id];
    if (!item.repo) assert.equal(metric, null, `${item.id} 不应伪造指标`);
    else {
      assert(metric, `缺少 ${item.id} 指标，请运行 pnpm sync`);
      assert.equal(
        metric.repo.toLowerCase(),
        item.repo.toLowerCase(),
        `${item.id} 指标仓库来源不符，请运行 pnpm sync`,
      );
    }
  }
}

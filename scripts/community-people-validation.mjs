/** 推荐语与用户快照：评语必须来自真实 Issue，署名与快照必须可核验。 */
import assert from "node:assert/strict";

/** 推荐语只能挂在同意公开署名的推荐者名下，出处必须是本站 Issue。 */
export function validateRecommendations(picks, community, catalog) {
  assert(Array.isArray(picks), "推荐语必须是数组");
  const ids = new Set(catalog.map((row) => row.id));
  const seen = new Set();
  for (const pick of picks) {
    assert(pick && typeof pick === "object", "无效推荐语记录");
    assert.deepEqual(
      Object.keys(pick).sort(),
      ["curator", "evidence", "id", "quote"].sort(),
      "推荐语字段不符",
    );
    assert(ids.has(pick.id), `推荐语指向未知工具：${pick.id}`);
    assert(!seen.has(pick.id), `工具重复推荐：${pick.id}`);
    seen.add(pick.id);
    assert(
      typeof pick.quote === "string" && pick.quote.trim().length >= 8,
      "推荐语正文过短",
    );
    assert(
      typeof pick.evidence === "string" &&
        /^https:\/\/github\.com\/webkubor\/supercli\/issues\/[1-9]\d*$/.test(
          pick.evidence,
        ),
      "推荐语出处必须是本站 Issue",
    );
    const record = community.find((row) => row.id === pick.id);
    assert(record, `${pick.id} 缺少收录记录`);
    // 只有本人同意公开署名的推荐者才配出现在推荐位。
    assert(
      record.recommendedBy === pick.curator,
      `${pick.id} 推荐者与收录署名不符`,
    );
    assert(
      record.evidence === pick.evidence,
      `${pick.id} 推荐语出处与收录依据不符`,
    );
  }
}

/** GitHub 用户快照：覆盖全部署名者，取不到就是 null，不允许填 0 冒充。 */
export function validateContributors(snapshot, community) {
  assert(snapshot && typeof snapshot === "object", "用户快照必须是对象");
  assert(
    typeof snapshot.fetchedAt === "string" &&
      Number.isFinite(Date.parse(snapshot.fetchedAt)),
    "用户快照时间无效",
  );
  assert(
    typeof snapshot.source === "string" && snapshot.source.length > 0,
    "用户快照来源无效",
  );
  assert(
    snapshot.users &&
      typeof snapshot.users === "object" &&
      !Array.isArray(snapshot.users),
    "用户快照必须为对象",
  );
  const expected = [
    ...new Set(
      community
        .flatMap((row) => [row.curatedBy, row.recommendedBy])
        .filter((name) => typeof name === "string")
        .map((name) => name.toLowerCase()),
    ),
  ].sort();
  assert.deepEqual(
    Object.keys(snapshot.users).sort(),
    expected,
    "用户快照须覆盖全部署名者",
  );
  for (const [name, profile] of Object.entries(snapshot.users)) {
    if (profile === null) continue;
    assert(profile && typeof profile === "object", `${name} 用户资料无效`);
    assert(profile.login.toLowerCase() === name, `${name} 用户名不匹配`);
    for (const field of ["followers", "following", "publicRepos"]) {
      assert(
        Number.isSafeInteger(profile[field]) && profile[field] >= 0,
        `${name} ${field} 无效`,
      );
    }
  }
}

/** 英文推荐语：每个中文推荐语都要有对应译文，不允许留空或夹带中文。 */
export function validateRecommendationTranslations(english, picks) {
  assert(english && typeof english === "object", "英文推荐语必须是对象");
  assert.deepEqual(
    Object.keys(english).sort(),
    picks.map((pick) => pick.id).sort(),
    "英文推荐语覆盖与中文推荐语不符",
  );
  for (const [id, text] of Object.entries(english)) {
    assert(
      typeof text === "string" && text.trim().length >= 8,
      `${id} 英文推荐语过短`,
    );
    assert(!/[\u3400-\u9fff]/.test(text), `${id} 英文推荐语夹带中文`);
  }
}

/** 社区发现与署名：仅展示有收录依据的记录，历史维护和用户推荐分别统计。 */
import { msg, t, locale, countLabel } from "./i18n";
import rawRecords from "../data/community.json";
import { catalog, type Entry } from "./catalog";
import { description } from "./descriptions";
import { escapeHtml as escape } from "./escape";
import { iconMarkup } from "./tool-icon";
/** 收录出处和署名角色，历史维护不等于用户推荐。 */
export interface CommunityRecord {
  readonly id: string;
  readonly addedAt: string;
  readonly curatedBy: string;
  readonly recommendedBy: string | null;
  readonly evidence: string;
}
const records: readonly CommunityRecord[] = rawRecords;
const date = (value: string) =>
  new Date(value).toLocaleDateString(locale, { timeZone: "Asia/Taipei" });
export const avatarUrl = (name: string, size = 64) =>
  `https://github.com/${encodeURIComponent(name)}.png?size=${size}`;
export const profile = (name: string) =>
  `<a class="curator-chip" href="https://github.com/${encodeURIComponent(name)}" target="_blank" rel="noopener noreferrer"><img class="curator-avatar" src="${avatarUrl(name, 48)}" alt="${escape(name)}" width="18" height="18" loading="lazy" /><span>@${escape(name)}</span></a>`;
/** 收录时间不等于上游更新时间；推荐署名仅来自明确同意展示的投稿者。 */
export function attributionMarkup(
  item: Pick<Entry, "id">,
  entries: readonly CommunityRecord[] = records,
): string {
  const row = entries.find((record) => record.id === item.id);
  if (!row) return "";
  return msg`<div class="attribution"><span>收录于 <time datetime="${escape(row.addedAt)}">${date(row.addedAt)}</time></span><span class="attribution-person">收录维护 ${profile(row.curatedBy)}</span>${row.recommendedBy ? msg`<span class="attribution-person">推荐者 ${profile(row.recommendedBy)}</span>` : ""}<a class="attribution-evidence" href="${escape(row.evidence)}" target="_blank" rel="noopener noreferrer">查看收录记录</a></div>`;
}
/** 最近收录按真实入库时间排列，同批条目按名称稳定展示。 */
export function recentEntries(
  limit = 6,
  entries: readonly CommunityRecord[] = records,
) {
  return entries
    .toSorted(
      (a, b) =>
        Date.parse(b.addedAt) - Date.parse(a.addedAt) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, limit);
}
/** 根据可追溯收录记录汇总维护和推荐，禁止把维护操作计算为社区推荐。 */
export function contributorCounts(
  field: "curatedBy" | "recommendedBy",
  entries: readonly CommunityRecord[] = records,
) {
  const names = entries
    .map((row) => row[field])
    .filter((name): name is string => Boolean(name))
    .map((name) => name.toLowerCase());
  return [...new Set(names)]
    .map((name) => ({
      name,
      count: names.filter((value) => value === name).length,
    }))
    .toSorted((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
/** 渲染首页社区模块，详情按钮沿用已有可分享的详情流程。 */
export function setupCommunity(): void {
  document.querySelector("#recent-tools")!.innerHTML = recentEntries()
    .map((row) => {
      const item = catalog.find((entry) => entry.id === row.id)!;
      // 六张卡片都写“维护者收录”等于没有信息；改为该工具的用途，推荐者仍单独标注。
      const note = row.recommendedBy
        ? msg`由 @${escape(row.recommendedBy)} 推荐`
        : description(item);
      return `<button class="recent-tool" data-detail="${escape(item.id)}">${iconMarkup(item)}<span><strong>${escape(t(item.name))}</strong><small>${escape(note)}</small></span><time datetime="${escape(row.addedAt)}">${date(row.addedAt)}</time></button>`;
    })
    .join("");
  const creditList = (
    field: "curatedBy" | "recommendedBy",
    entries: readonly CommunityRecord[] = records,
  ) =>
    contributorCounts(field, entries)
      .map((row) => {
        const safeName = escape(row.name);
        const url = `https://github.com/${encodeURIComponent(row.name)}`;
        const role =
          field === "curatedBy"
            ? (locale === "zh-CN" ? "核心收录人" : "Core Curator")
            : (locale === "zh-CN" ? "社区推荐者" : "Recommender");
        return `<li class="contributor-card">
          <a class="contributor-link" href="${url}" target="_blank" rel="noopener noreferrer">
            <div class="contributor-avatar-wrap">
              <img class="contributor-avatar" src="${avatarUrl(row.name, 96)}" alt="${safeName}" width="48" height="48" loading="lazy" />
            </div>
            <div class="contributor-details">
              <div class="contributor-head">
                <strong class="contributor-handle">@${safeName}</strong>
                <span class="contributor-role-tag">${role}</span>
              </div>
              <div class="contributor-meta">
                <span class="contributor-stats-count">${countLabel(row.count, "tools")}</span>
                <span class="contributor-ext-icon">GitHub <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg></span>
              </div>
            </div>
          </a>
        </li>`;
      })
      .join("");
  document.querySelector("#maintainer-credits")!.innerHTML =
    creditList("curatedBy");
  const contributions = creditList("recommendedBy");
  document.querySelector("#recommender-credits")!.innerHTML = contributions;
  document.querySelector<HTMLElement>("#community-empty")!.hidden =
    Boolean(contributions);
}

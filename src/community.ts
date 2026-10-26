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
              <span class="contributor-pulse-dot" title="活跃维护中" aria-label="活跃维护中"></span>
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

export interface RecommenderPick {
  readonly toolId: string;
  readonly curator: string;
  readonly quoteZh: string;
  readonly quoteEn: string;
}

export const RECOMMENDER_PICKS: readonly RecommenderPick[] = [
  {
    toolId: "wrangler",
    curator: "webkubor",
    quoteZh: "Cloudflare 全栈与 Serverless 的本命 CLI，本地毫秒级模拟，边缘一键发布，现代 Web 必配。",
    quoteEn: "The holy grail for Cloudflare Workers & Serverless. Instant local dev, seamless edge deploys.",
  },
  {
    toolId: "rg",
    curator: "webkubor",
    quoteZh: "速度快到不可思议的代码检索，几十万行大仓库毫秒命中，任何一台新电脑装机后敲的第一条命令。",
    quoteEn: "Blazing fast regex search across millions of lines of code. The very first tool on any new machine.",
  },
  {
    toolId: "lazygit",
    curator: "renjiegod",
    quoteZh: "把复杂的 Git 分支与变基变成顺滑直觉的键盘流，交互极其优雅，大幅降低 rebase 冲突的心智负担。",
    quoteEn: "Turn complex Git operations into fluid muscle memory. The best terminal UI for Git ever made.",
  },
  {
    toolId: "mise",
    curator: "renjiegod",
    quoteZh: "比 asdf 快数十倍的多语言环境管理器，一秒切换 Node/Python/Go，彻底告别本地环境漂移噩梦。",
    quoteEn: "10x faster than asdf. Seamlessly manages Node, Python, and Go runtimes without configuration headaches.",
  },
  {
    toolId: "zoxide",
    curator: "webkubor",
    quoteZh: "懂你习惯的智能 cd 命令，敲两三个字母瞬间直达多层嵌套目录，终端目录跳转效率提升 3 倍。",
    quoteEn: "Smarter cd with memory. Jump to nested directories in two keystrokes, speeding up navigation by 300%.",
  },
  {
    toolId: "gh",
    curator: "renjiegod",
    quoteZh: "GitHub 官方命令行神器，开 PR、看 CI 流水线、审代码无需离开终端，极客工作流闭环必备。",
    quoteEn: "Official GitHub CLI. Open PRs, check CI runs, and review code without leaving your terminal.",
  },
  {
    toolId: "crawl4ai",
    curator: "webkubor",
    quoteZh: "大模型时代不可或缺的开源抓取利器，专为 LLM 提取干净 Markdown，AI Agent 必备数据源。",
    quoteEn: "Next-gen LLM-friendly crawler. Extracts clean Markdown for AI agents at unmatched speed.",
  },
  {
    toolId: "aider",
    curator: "renjiegod",
    quoteZh: "终端里的 AI 结对编程天花板，能直接修改本地多文件工程并自动生成 git commit，生产力杠杆。",
    quoteEn: "The pinnacle of in-terminal AI pair programming. Edits complex code across files and auto-commits.",
  },
];

export function setupRecommenderMarquee(
  onSelectTool?: (entry: Entry) => void,
): void {
  const container = document.querySelector<HTMLElement>("#recommender-marquee");
  if (!container) return;

  const cardsHtml = RECOMMENDER_PICKS.map((pick) => {
    const item = catalog.find((entry) => entry.id === pick.toolId);
    if (!item) return "";
    const quote = locale === "zh-CN" ? pick.quoteZh : pick.quoteEn;
    const safeName = escape(pick.curator);
    const toolName = escape(t(item.name));
    return `<button class="recommender-bubble" data-detail="${escape(item.id)}" type="button" aria-label="查看 ${toolName} 详情">
      <div class="bubble-header">
        <div class="bubble-curator">
          <div class="bubble-avatar-wrap">
            <img class="bubble-avatar" src="${avatarUrl(pick.curator, 80)}" alt="${safeName}" width="34" height="34" loading="lazy" />
            <span class="bubble-pulse-dot"></span>
          </div>
          <div class="bubble-curator-info">
            <div class="bubble-curator-row">
              <strong class="bubble-curator-name">@${safeName}</strong>
              <span class="bubble-badge">${locale === "zh-CN" ? "推荐官" : "Curator"}</span>
            </div>
            <span class="bubble-target">推荐了 <strong>${toolName}</strong></span>
          </div>
        </div>
        <span class="bubble-tool-tag">${escape(item.category)}</span>
      </div>
      <p class="bubble-quote">“${escape(quote)}”</p>
    </button>`;
  }).join("");

  container.innerHTML = `<div class="marquee-group">${cardsHtml}</div><div class="marquee-group" aria-hidden="true">${cardsHtml}</div>`;

  if (onSelectTool) {
    container.addEventListener("click", (e) => {
      const button = (e.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-detail]",
      );
      if (!button) return;
      const id = button.dataset.detail;
      const found = catalog.find((entry) => entry.id === id);
      if (found) onSelectTool(found);
    });
  }
}

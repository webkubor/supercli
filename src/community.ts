/** 社区发现与署名：仅展示有收录依据的记录，历史维护和用户推荐分别统计。 */
import { msg, t, locale, countLabel } from "./i18n";
import rawRecords from "../data/community.json";
import rawRecommendations from "../data/recommendations.json";
import rawEnglishRecommendations from "../data/recommendations.en.json";
import { catalog, type Entry } from "./catalog";
import { contributorProfile, contributors } from "./contributors";
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
/** 推荐官评语：正文取自投稿 Issue 原文，出处可点回原帖。 */
export interface Recommendation {
  readonly id: string;
  readonly curator: string;
  readonly quote: string;
  readonly evidence: string;
}
const records: readonly CommunityRecord[] = rawRecords;
const recommendations: readonly Recommendation[] = rawRecommendations;
const englishRecommendations: Readonly<Record<string, string>> =
  rawEnglishRecommendations;
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
/** 推荐官评语按投稿时间倒序，只用带署名的投稿，附工具与原帖链接。 */
export function recommendationPicks(
  entries: readonly CommunityRecord[] = records,
  picks: readonly Recommendation[] = recommendations,
) {
  return picks
    .map((pick) => {
      const record = entries.find((row) => row.id === pick.id);
      const item = catalog.find((entry) => entry.id === pick.id);
      if (!record || !item) return null;
      return { pick, record, item };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .toSorted(
      (a, b) =>
        Date.parse(b.record.addedAt) - Date.parse(a.record.addedAt) ||
        a.pick.id.localeCompare(b.pick.id),
    );
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
  setupCuratorReel();
  setupMaintainerConsole();
}

/** 系统减弱动效偏好；抽成纯函数便于测试，浏览器环境按需读取。 */
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * 推荐官评语轮播：消息气泡式卡片，横向位移，悬停或聚焦暂停。
 * 只呈现带署名的真实投稿评语，每一张都能点回原帖核验。
 */
export function setupCuratorReel(): void {
  const track = document.querySelector<HTMLElement>("#curator-reel");
  if (!track) return;
  const rows = recommendationPicks();
  const empty = document.querySelector<HTMLElement>("#community-empty");
  if (!rows.length) {
    track.closest<HTMLElement>(".curator-reel")?.remove();
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;
  const slides = rows
    .map(({ pick, item }) => {
      const quote =
        locale === "zh-CN"
          ? pick.quote
          : (englishRecommendations[pick.id] ?? pick.quote);
      const safeName = escape(pick.curator);
      const toolName = escape(t(item.name));
      return `<li class="curator-slide">
        <article class="curator-bubble">
          <header class="curator-bubble-head">
            <img class="curator-bubble-avatar" src="${avatarUrl(pick.curator, 96)}" alt="${safeName}" width="44" height="44" loading="lazy" />
            <div class="curator-bubble-identity">
              <a class="curator-bubble-handle" href="https://github.com/${encodeURIComponent(pick.curator)}" target="_blank" rel="noopener noreferrer">@${safeName}</a>
              <span class="curator-bubble-role">${locale === "zh-CN" ? "推荐官" : "Curator"}</span>
            </div>
          </header>
          <p class="curator-bubble-quote">${escape(quote)}</p>
          <footer class="curator-bubble-foot">
            <button class="curator-bubble-tool" data-detail="${escape(item.id)}" type="button">${toolName}</button>
            <a class="curator-bubble-source" href="${escape(pick.evidence)}" target="_blank" rel="noopener noreferrer">${locale === "zh-CN" ? "查看原帖" : "View original post"}<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg></a>
          </footer>
        </article>
      </li>`;
    })
    .join("");
  track.innerHTML = slides;
  const rail = track.parentElement!;
  const slidesNode = [...track.children] as HTMLElement[];
  // 位移按固定步长算：offsetLeft 受祖先 transform 影响会自相矛盾，
  // 用「一张气泡的宽度 + 间距」推位移，与实际排版必然一致。
  const step = () => {
    const slide = slidesNode[1] ?? slidesNode[0];
    if (!slide) return 0;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    return slide.getBoundingClientRect().width + gap;
  };
  let index = 0;
  const update = () => {
    slidesNode.forEach((slide, position) => {
      const active = position === index;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });
    const status = document.querySelector<HTMLElement>("#curator-reel-status");
    if (status)
      status.textContent = `${String(index + 1)} / ${String(slidesNode.length)}`;
  };
  // 跳到指定气泡：位移立即生效，不依赖动画帧，定时器在后台标签页也能推进。
  const goTo = (target: number) => {
    index =
      ((target % slidesNode.length) + slidesNode.length) % slidesNode.length;
    track.style.transform = `translateX(-${String(index * step())}px)`;
    update();
  };
  // 悬停、聚焦、页面隐藏都暂停，避免读者读一半就被带走。
  let timer = 0;
  const reducedMotion = prefersReducedMotion();
  const play = () => {
    // 减弱动效下不做自动轮播，只留手动浏览。
    if (timer || reducedMotion) return;
    timer = window.setInterval(() => goTo(index + 1), 6000);
  };
  const pause = () => {
    if (!timer) return;
    window.clearInterval(timer);
    timer = 0;
  };
  document.querySelector("#curator-reel-prev")?.addEventListener("click", () => {
    pause();
    goTo(index - 1);
  });
  document.querySelector("#curator-reel-next")?.addEventListener("click", () => {
    pause();
    goTo(index + 1);
  });
  rail.addEventListener("mouseenter", pause);
  rail.addEventListener("mouseleave", play);
  rail.addEventListener("focusin", pause);
  rail.addEventListener("focusout", play);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
    else play();
  });
  // 状态始终要显示，减弱动效时也不例外。
  update();
  play();
}

/**
 * 维护者终端：极客风格的命令行面板，展示 GitHub 关注数与收录条目数。
 * 关注数来自 GitHub 用户 API 快照，没有快照就显示未取到，不填 0。
 */
export function setupMaintainerConsole(): void {
  const host = document.querySelector<HTMLElement>("#maintainer-console-list");
  if (!host) return;
  const rows = contributorCounts("curatedBy");
  if (!rows.length) return;
  host.innerHTML = rows
    .map((row) => {
      const safeName = escape(row.name);
      const url = `https://github.com/${encodeURIComponent(row.name)}`;
      const stats = contributorProfile(row.name);
      const followers = stats
        ? locale === "zh-CN"
          ? `${String(stats.followers)} 关注`
          : `${String(stats.followers)} followers`
        : locale === "zh-CN"
          ? "关注数未取到"
          : "followers unavailable";
      return `<li class="maintainer-row">
        <span class="maintainer-prompt" aria-hidden="true">$</span>
        <a class="maintainer-handle" href="${url}" target="_blank" rel="noopener noreferrer">
          <img class="maintainer-avatar" src="${avatarUrl(row.name, 96)}" alt="${safeName}" width="24" height="24" loading="lazy" />
          <span class="maintainer-name">@${safeName}</span>
        </a>
        <span class="maintainer-stats">
          <span class="maintainer-stat maintainer-stat-followers">${escape(followers)}</span>
          <span class="maintainer-stat">${escape(countLabel(row.count, "tools"))}</span>
        </span>
      </li>`;
    })
    .join("");
  // 关注数是 GitHub 用户 API 快照，不是实时值，标明来源与抓取时间。
  const foot = document.querySelector<HTMLElement>("#maintainer-console-foot");
  if (foot) {
    const time = new Date(contributors.fetchedAt).toLocaleDateString(locale, {
      timeZone: "Asia/Taipei",
    });
    foot.textContent =
      locale === "zh-CN"
        ? `# 关注数取自 GitHub 用户 API 快照（${time}），非实时值`
        : `# Follower counts from a GitHub user API snapshot (${time}), not live`;
  }
  // 推荐者名单：与维护者同一套终端读法，署名只算明确同意公开的投稿。
  const recommenders = document.querySelector<HTMLElement>(
    "#recommender-console-list",
  );
  if (recommenders) {
    const picks = contributorCounts("recommendedBy");
    recommenders.innerHTML = picks
      .map((row) => {
        const safeName = escape(row.name);
        const url = `https://github.com/${encodeURIComponent(row.name)}`;
        return `<li class="maintainer-row">
        <span class="maintainer-prompt" aria-hidden="true">$</span>
        <a class="maintainer-handle" href="${url}" target="_blank" rel="noopener noreferrer">
          <img class="maintainer-avatar" src="${avatarUrl(row.name, 96)}" alt="${safeName}" width="24" height="24" loading="lazy" />
          <span class="maintainer-name">@${safeName}</span>
        </a>
        <span class="maintainer-stats">
          <span class="maintainer-stat maintainer-stat-followers">${escape(countLabel(row.count, "tools"))}</span>
        </span>
      </li>`;
      })
      .join("");
  }
}

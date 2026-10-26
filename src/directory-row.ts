/** 目录行标记：运行时渲染与构建期预渲染共用同一份实现。
 *  这是消除「两处各写一套卡片」结构性缺陷的核心约束——
 *  scripts/localized-pages.ts 的 staticCatalog 与 src/main.ts 都走这里。
 */
import { description } from "./descriptions";
import { t, msg, toolPath } from "./i18n";
import { stats, categories, type Entry } from "./catalog";
import { sourceBadge, reviewCard } from "./review-records";
import { cardMetrics } from "./tool-metrics";
import { escapeHtml as escape } from "./escape";
import { cardIconMarkup } from "./tool-icon";

const number = (value: number): string =>
  Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

/**
 * 运行时渲染：在静态骨架上叠加交互层（指标、核验入口、复制、名次）。
 * 名次随当前排序变化，未接入指标的工具不编造数字。
 */
export function cardMarkup(item: Entry, index: number, sort: string): string {
  const metric = stats(item);
  const destination = item.repo ? `https://github.com/${item.repo}` : item.docs;
  const rank =
    (sort === "stars" || sort === "updated") && !metric
      ? "—"
      : String(index + 1).padStart(2, "0");
  const iconAlt = msg`${item.vendor} 工具图标`;
  return msg`<article class="card">
  <span class="rank">${rank}</span>
  <span class="card-icon">${cardIconMarkup(item, iconAlt)}</span>
  <div class="card-main">
    <h3><a href="${escape(toolPath(item.id))}" class="card-title" data-detail="${escape(item.id)}">${escape(t(item.name))}<i data-lucide="arrow-up-right"></i></a></h3>
    <p class="card-identity"><span class="vendor-name">${escape(t(item.vendor))}</span>${sourceBadge(item)}</p>
    <p class="description">${escape(description(item))}</p>
    ${reviewCard(item)}
  </div>
  <div class="card-side">
    <dl class="tool-metrics">${cardMetrics(item)}</dl>
    <div class="card-actions">
      <a class="card-stars" href="${escape(destination)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(t(item.name))} 的原始项目来源"><i data-lucide="star"></i>${metric ? number(metric.stars) : t("未计分")}</a>
      <button class="copy" data-copy="${escape(item.id)}" aria-label="复制 ${escape(t(item.name))} 安装命令"><i data-lucide="copy"></i><span>${item.install ? t("安装") : t("详情")}</span></button>
    </div>
  </div>
</article>`;
}

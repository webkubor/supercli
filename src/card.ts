/** 目录卡片：身份来源、具体用途、本站核验入口与公开指标分层展示。 */
import { description } from "./descriptions";
import { msg, t, toolPath } from "./i18n";
import { stats, usage, categories, type Entry } from "./catalog";
import { cardMetrics } from "./tool-metrics";
import { sourceBadge, reviewCard } from "./review-records";
import { escapeHtml as escape } from "./escape";
import { cardIconMarkup } from "./tool-icon";
const number = (n: number) =>
  Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
/** 名次随当前排序变化，未接入指标的工具不编造数字。 */
export function cardMarkup(item: Entry, index: number, sort: string): string {
  const metric = stats(item);
  const destination = item.repo ? `https://github.com/${item.repo}` : item.docs;
  const rank =
    ((sort === "stars" || sort === "updated") && !metric) ||
    (sort === "downloads" && !usage(item))
      ? "—"
      : String(index + 1).padStart(2, "0");
  const iconAlt = msg`${item.vendor} 工具图标`;
  return msg`<article class="card"><div class="card-top"><span class="rank">${rank}</span>${cardIconMarkup(item, iconAlt)}<span class="tag">${escape(categories[item.category as keyof typeof categories])}</span></div><a href="${escape(toolPath(item.id))}" class="card-title" data-detail="${escape(item.id)}">${escape(t(item.name))}<i data-lucide="arrow-up-right"></i></a><div class="card-identity"><span class="vendor-name">${escape(t(item.vendor))}</span>${sourceBadge(item)}</div><p class="description">${escape(description(item))}</p>${reviewCard(item)}${cardMetrics(item)}<div class="card-bottom"><a href="${escape(destination)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(t(item.name))} 的原始项目来源"><i data-lucide="star"></i>${metric ? number(metric.stars) : t("未计分")}<span>${metric ? "Stars" : t("项目文档")}</span></a><button class="copy" data-copy="${escape(item.id)}" aria-label="复制 ${escape(t(item.name))} 安装命令"><i data-lucide="copy"></i>${item.install ? t("安装") : t("详情")}</button></div></article>`;
}

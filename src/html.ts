/** HTML 输出边界：所有外部文本及属性值转义，详情模板可独立回归。 */
import { description } from "./descriptions";
import { msg, t, locale } from "./i18n";
import { sourceBadge, reviewDetail } from "./review-records";
import { attributionMarkup } from "./community";
import { scorecardMarkup } from "./scorecard";
import { detailMetrics } from "./tool-metrics";
import { categories, type Entry, type Metric } from "./catalog";
import { detailIconMarkup } from "./tool-icon";
import { commandMarkup } from "./command-markup";
import { escapeHtml } from "./escape";
export { escapeHtml } from "./escape";
const escape = escapeHtml;
const number = (value: number): string =>
  Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
/** 生成弹窗内容，指标字符串同投稿字段一样视为不可信文本。 */
export function detailMarkup(item: Entry, data: Metric | null): string {
  const iconAlt = msg`${item.vendor} 工具图标`;
  const category = t(categories[item.category as keyof typeof categories]);
  const maintained =
    item.maintainerType === "vendor" ? t("厂商官方") : t("社区项目");
  const install = item.install;
  return `<div class="detail-head"><div class="detail-icon-wrap">${detailIconMarkup(item, iconAlt)}</div><div class="detail-identity"><p class="eyebrow">${escape(t(item.vendor))} / ${escape(category)}</p><h2 id="detail-title">${escape(t(item.name))}</h2><div class="detail-tags"><span class="detail-tag">${escape(maintained)}</span><span class="detail-tag">${escape(category)}</span>${data ? `<span class="detail-tag detail-tag-metric">${escape(number(data.stars))} GitHub Stars</span>` : ""}</div></div></div>
${attributionMarkup(item)}<p class="detail-desc">${escape(description(item))}</p><div class="detail-stats">${sourceBadge(item)}<span>${data ? number(data.stars) + " Stars" : t("未计分")}</span><span>${escape(data?.language ?? t("无可比 GitHub 指标"))}</span><span>${data ? (data.archived ? t("仓库已归档") : t("仓库未归档")) : t("官方来源收录")}</span></div>${detailMetrics(item)}
<h3 class="detail-section-title">${t("安装命令")}</h3><p class="install-note">${t("复制后请先阅读官方文档，按你的系统与运行环境安装。")}</p><div class="terminal-window detail-terminal"><div class="terminal-bar" aria-hidden="true"><span class="terminal-dots"><i></i><i></i><i></i></span><span class="terminal-title">${t("终端")}</span></div><div class="terminal-body"><code class="terminal-line">${install ? `<span class="terminal-prompt">$</span>${commandMarkup(install)}<span class="terminal-caret" aria-hidden="true"></span>` : `<span class="terminal-prompt">$</span>${escape(t("请按官方文档安装；本站不提供未经核实的命令。"))}`}</code>${install ? msg`<button class="button detail-copy" data-copy="${escape(item.id)}">${t("复制")}</button>` : ""}</div></div>
<div class="detail-links"><a class="button primary" href="${escape(item.docs)}" target="_blank" rel="noopener noreferrer">${t("官方文档")}<i data-lucide="arrow-up-right"></i></a>${item.repo ? msg`<a class="button" href="https://github.com/${escape(item.repo)}" target="_blank" rel="noopener noreferrer">源码仓库</a>` : ""}<a class="button" href="/tools/${escape(item.id)}/">${t("工具独立页")} ↗</a></div>${reviewDetail(item)}${scorecardMarkup(item)}<p class="detail-meta">${t("仓库最近推送：")}${data ? new Date(data.pushedAt).toLocaleDateString(locale) : t("不适用")} · ${t("许可证：")}${escape(data?.license ?? t("见官方文档"))}<br>${t("图标来源：官方组织、维护者或标注出处的品牌资产，详见仓库 docs/ICONS.md。")}</p><a class="feedback" href="https://github.com/webkubor/supercli/issues/new?template=correction.yml&title=${escape(encodeURIComponent(msg`修正 ${item.name} 信息`))}" target="_blank" rel="noopener noreferrer">${t("信息有误？提交修正")}</a>`;
}

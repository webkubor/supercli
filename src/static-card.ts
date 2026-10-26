/** 构建期静态行：与运行时行共用同一套类结构契约（article.card）。
 *  此模块不得引入 src/i18n.ts——它在模块求值期读取 location，
 *  会把语言冻结进构建脚本进程。文案与标签由调用方翻译后传入。
 */
import { escapeHtml as escape } from "./escape";
import { cardIconMarkup, type IconSubject } from "./tool-icon";

/** 静态渲染主体：结构与运行时 Entry 一致，maintainerType 由数据契约保证。 */
export type StaticSubject = IconSubject & { readonly maintainerType: string };

/**
 * 无脚本环境（爬虫、静态 HTML）可读的静态行。
 * 只放标题、来源与描述——名次、指标、复制属于运行时层，静态层不编造。
 */
export function staticCardMarkup(
  item: StaticSubject,
  href: string,
  rank: string,
  texts: {
    readonly name: string;
    readonly vendor: string;
    readonly description: string;
    readonly maintainerLabel: string;
  },
): string {
  const icon = item.maintainerType;
  return `<article class="card">
  <span class="rank">${escape(rank)}</span>
  <span class="card-icon">${cardIconMarkup(item, `${texts.vendor} tool icon`)}</span>
  <div class="card-main">
    <h3><a class="card-title" href="${escape(href)}">${escape(texts.name)}</a></h3>
    <p class="card-identity"><span class="vendor-name">${escape(texts.vendor)}</span><span class="source-badge" data-kind="${escape(icon)}" title="维护来源，不代表质量评级"><i data-lucide="${icon === "vendor" ? "building-2" : "users"}" aria-hidden="true"></i>${escape(texts.maintainerLabel)}</span></p>
    <p class="description">${escape(texts.description)}</p>
  </div>
</article>`;
}

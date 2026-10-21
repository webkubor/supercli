/** 工具独立页：从目录与核验真源输出双语静态正文，路由 /tools/* 和 /en/tools/*。 */
import categories from "../data/categories.json" with { type: "json" };
import english from "../data/catalog.en.json" with { type: "json" };
import { escapeHtml as escape } from "../src/escape.ts";
import { reviewFor, type ReviewSubject } from "../src/review-data.ts";
import { translate, type Language } from "../src/translations.ts";
import { guides, guideText } from "./guide-content.ts";
const descriptions: Readonly<Record<string, string>> = english;
const categoryNames: Readonly<Record<string, string>> = categories;
const copy = (language: Language, zh: string, en: string): string =>
  language === "en" ? en : zh;
const path = (value: string, language: Language): string =>
  `${language === "en" ? "/en" : ""}${value}`;
function evidence(item: ReviewSubject, language: Language): string {
  const review = reviewFor(item);
  if (!review)
    return `<p>${copy(language, "专项核验范围待补充；收录不表示通过安全认证或独立安装实测。", "Review scope is pending. Inclusion is not security certification or proof of independent installation testing.")}</p>`;
  return `<p>${copy(language, "核验记录日期", "Review record date")}: <time datetime="${escape(review.reviewedAt)}">${escape(review.reviewedAt.slice(0, 10))}</time> · <a href="${escape(review.evidence)}">${copy(language, "查看核验依据", "Review evidence")}</a></p><ul>${review.checks.map((check) => `<li><a href="${escape(check.reference)}">${escape(translate(check.note, language))}</a> (${escape(check.method)})</li>`).join("")}</ul><p>${copy(language, "文档核对与独立安装实测是不同的核验方式，以上记录仅代表注明的范围。", "Documentation checks and independent installation tests are different review methods; this record covers only the scope stated above.")}</p>`;
}
function relatedGuides(item: ReviewSubject, language: Language): string {
  const related = guides.filter((guide) =>
    guide.tools.some((tool) => tool.id === item.id),
  );
  if (!related.length) return "";
  return `<section class="guide-related"><h2>${copy(language, "在真实任务中如何选择", "Choose for your workflow")}</h2><div>${related.map((guide) => `<a class="button" href="${path(`/guides/${guide.slug}/`, language)}">${escape(guideText(guide.title, language))} →</a>`).join("")}</div></section>`;
}
/** 不依赖脚本、弹窗或本机安装状态的完整工具正文。 */
export function toolMarkup(item: ReviewSubject, language: Language): string {
  const category = escape(translate(categoryNames[item.category], language));
  const directory = path("/#directory", language);
  const share = new URL("https://twitter.com/intent/tweet");
  share.searchParams.set(
    "text",
    `${translate(item.name, language)} — SuperCLI`,
  );
  share.searchParams.set(
    "url",
    `https://supercli.site${path(`/tools/${item.id}/`, language)}`,
  );
  return `<nav class="guide-breadcrumb" aria-label="${copy(language, "当前位置", "Breadcrumb")}"><a href="${directory}">SuperCLI</a><span>/</span><span>${escape(translate(item.name, language))}</span></nav>
  <header class="guide-intro"><p class="eyebrow">${escape(translate(item.vendor, language))} / ${category}</p><h1>${escape(translate(item.name, language))}</h1><p class="intro">${escape(language === "en" ? descriptions[item.id] : item.description)}</p></header>
  <section class="guide-section guide-tool"><div class="guide-tool-heading"><img src="/icons/${escape(item.icon)}" alt="" width="40" height="40"><h2>${copy(language, "用途与来源", "Purpose and sources")}</h2></div><dl><div><dt>${copy(language, "分类", "Category")}</dt><dd>${category}</dd></div><div><dt>${copy(language, "维护来源", "Maintenance source")}</dt><dd>${copy(language, item.maintainerType === "vendor" ? "厂商官方" : "社区项目", item.maintainerType === "vendor" ? "Vendor maintained" : "Community maintained")}</dd></div></dl><div class="guide-actions"><a class="button primary" href="${escape(item.docs)}">${copy(language, "官方文档", "Official docs")} ↗</a>${item.repo ? `<a class="button" href="https://github.com/${escape(item.repo)}">${copy(language, "源码仓库", "Source repository")} ↗</a>` : ""}</div></section>
  <section class="guide-checklist tool-install"><h2>${copy(language, "安装方式", "Installation")}</h2>${item.install ? `<pre><code>${escape(item.install)}</code></pre>` : `<p>${copy(language, "本站未提供经确认的一行安装命令，请按官方文档安装。", "No confirmed one-line installation command is listed. Follow the official documentation.")}</p>`}<p>${copy(language, "安装前请阅读上方官方文档，确认系统、运行环境、账号与费用前提。目录收录不代表已在你的环境中验证安装。", "Read the official documentation above and check system, runtime, account, and cost requirements before installing. Catalog inclusion does not mean installation has been verified in your environment.")}</p></section>
  <section class="guide-checklist tool-evidence"><h2>${copy(language, "收录与核验范围", "Inclusion and review scope")}</h2>${evidence(item, language)}<a class="text-button" href="${path("/standards", language)}">${copy(language, "了解收录与核验标准", "Read our inclusion standards")} →</a></section>${relatedGuides(item, language)}
  <div class="guide-actions"><a class="button" href="${path(`/?tool=${encodeURIComponent(item.id)}#directory`, language)}">${copy(language, "查看交互详情与指标", "Open interactive details and metrics")} →</a><a class="button" href="${escape(share.href)}" target="_blank" rel="noopener noreferrer">${copy(language, "分享到 X", "Share on X")}</a><a class="button" href="${directory}">${copy(language, "探索全部工具", "Explore all tools")}</a></div>`;
}

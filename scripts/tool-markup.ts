/** 工具独立页：从目录与核验真源输出双语静态正文，路由 /tools/* 和 /en/tools/*。 */
import categories from "../data/categories.json" with { type: "json" };
import english from "../data/catalog.en.json" with { type: "json" };
import community from "../data/community.json" with { type: "json" };
import metrics from "../data/metrics.json" with { type: "json" };
import type { CommunityRecord } from "../src/community.ts";
import { escapeHtml as escape } from "../src/escape.ts";
import { reviewFor, type ReviewSubject } from "../src/review-data.ts";
import { guideIconMarkup } from "../src/tool-icon.ts";
import { ambientGridMarkup } from "../src/ambient.ts";
import { commandMarkup } from "../src/command-markup.ts";
import { translate, type Language } from "../src/translations.ts";
import { guides, guideText } from "./guide-content.ts";
const descriptions: Readonly<Record<string, string>> = english;
const categoryNames: Readonly<Record<string, string>> = categories;
const repositories: Readonly<
  Record<string, { readonly stars: number; readonly repo: string } | null>
> = metrics.repositories;
/** 星数用紧凑写法，与目录卡片和分享卡一致。 */
const compact = (value: number): string =>
  Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
const copy = (language: Language, zh: string, en: string): string =>
  language === "en" ? en : zh;
const path = (value: string, language: Language): string =>
  `${language === "en" ? "/en" : ""}${value}`;
/** 原始收录出处只表示目录维护，不替代专项核验或上游版本日期。 */
export function inclusionMarkup(
  item: Pick<ReviewSubject, "id">,
  language: Language,
  records: readonly CommunityRecord[] = community,
): string {
  const record = records.find((row) => row.id === item.id);
  if (!record) return "";
  const avatarUrl = (name: string, size = 48) =>
    `https://github.com/${encodeURIComponent(name)}.png?size=${size}`;
  const profile = (name: string): string =>
    `<a class="curator-chip" href="https://github.com/${encodeURIComponent(name)}"><img class="curator-avatar" src="${avatarUrl(name, 48)}" alt="${escape(name)}" width="18" height="18" loading="lazy" /><span>@${escape(name)}</span></a>`;
  const date = new Date(record.addedAt).toLocaleDateString(
    language === "en" ? "en-US" : "zh-CN",
    { timeZone: "Asia/Taipei" },
  );
  return `<div class="attribution"><span>${copy(language, "收录于", "Added on")} <time datetime="${escape(record.addedAt)}">${escape(date)}</time></span><span>${copy(language, "收录维护", "Curated by")} ${profile(record.curatedBy)}</span>${record.recommendedBy ? `<span>${copy(language, "推荐者", "Recommended by")} ${profile(record.recommendedBy)}</span>` : ""}<a href="${escape(record.evidence)}">${copy(language, "查看收录记录", "View inclusion record")}</a></div><p>${copy(language, "收录日期是加入本站目录的时间，不是工具版本发布日期；收录记录不代表独立安装实测。", "The added date records entry into this directory, not an upstream release. Inclusion records are not independent installation tests.")}</p>`;
}
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
/** 终端窗口：窗口栏、提示符、命令与复制按钮，和首页预览同一套终端语言。 */
function terminalMarkup(item: ReviewSubject, language: Language): string {
  if (!item.install)
    return `<p class="terminal-empty">${copy(language, "本站未提供经确认的一行安装命令，请按官方文档安装。", "No confirmed one-line installation command is listed. Follow the official documentation.")}</p>`;
  const label = escape(
    copy(
      language,
      `复制 ${translate(item.name, language)} 的安装命令`,
      `Copy the install command for ${translate(item.name, language)}`,
    ),
  );
  return `<div class="terminal-window"><div class="terminal-bar" aria-hidden="true"><span class="terminal-dots"><i></i><i></i><i></i></span><span class="terminal-title">${copy(language, "终端", "Terminal")}</span></div><div class="terminal-body"><code class="terminal-line"><span class="terminal-prompt">$</span>${commandMarkup(item.install)}<span class="terminal-caret" aria-hidden="true"></span></code><button class="copy terminal-copy" data-copy-command="${escape(item.install)}" aria-label="${label}"><span class="terminal-copy-icon" aria-hidden="true"><i data-lucide="copy"></i><svg class="terminal-copy-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span class="terminal-copy-label">${copy(language, "复制", "Copy")}</span></button></div></div>`;
}
/** 页面可见 FAQ 与 FAQPage 结构化数据共用同一组问答，不各写一份。 */
export function faqs(
  item: Pick<ReviewSubject, "id" | "name" | "install">,
  language: Language,
) {
  const metric = repositories[item.id];
  const name = translate(item.name, language);
  const install = item.install
    ? copy(
        language,
        `官方安装命令：${item.install}。执行前请在官方文档确认系统、运行环境、账号与费用前提。`,
        `Official command: ${item.install}. Check system, runtime, account, and cost requirements in the official documentation before running it.`,
      )
    : copy(
        language,
        "本站未确认一行安装命令，请以官方文档的安装说明为准。",
        "No confirmed one-line install command; follow the official documentation.",
      );
  const ranking = metric
    ? copy(
        language,
        `按 GitHub 仓库 ${metric.repo} 的 Stars（${Intl.NumberFormat("zh-CN").format(metric.stars)}）排序，指标快照时间 ${metrics.fetchedAt.slice(0, 10)}。Stars 代表仓库关注度，不代表安装量或使用人数。`,
        `Ranked by GitHub stars for ${metric.repo} (${Intl.NumberFormat("en-US").format(metric.stars)}); metrics snapshot taken ${metrics.fetchedAt.slice(0, 10)}. Stars measure repository attention, not installs or usage.`,
      )
    : copy(
        language,
        `${name} 暂无可比 GitHub 仓库指标，不参与 Stars 排名；本站不为无法核验的工具编造数据。`,
        `${name} has no comparable GitHub metrics and is not ranked by stars; we do not invent numbers.`,
      );
  return [
    {
      question: copy(language, `怎么安装 ${name}？`, `How do I install ${name}?`),
      answer: install,
    },
    {
      question: copy(
        language,
        `${name} 的排名依据是什么？`,
        `How is ${name} ranked?`,
      ),
      answer: ranking,
    },
    {
      question: copy(
        language,
        "收录进 SuperCLI 代表官方背书吗？",
        "Does inclusion mean vendor endorsement?",
      ),
      answer: copy(
        language,
        "不代表。SuperCLI 是独立社区目录，收录只表示来源可追溯、核验范围公开，与工具厂商不存在背书关系；商标与图标归各权利人。",
        "No. SuperCLI is an independent community directory; inclusion means traceable sources and a public review scope, not vendor endorsement. Trademarks and icons belong to their owners.",
      ),
    },
  ];
}
function faqMarkup(item: ReviewSubject, language: Language): string {
  const entries = faqs(item, language);
  return `<section class="guide-checklist tool-faq"><h2>${copy(language, "常见问题", "FAQ")}</h2>${entries
    .map(
      (entry) =>
        `<h3>${escape(entry.question)}</h3><p>${escape(entry.answer)}</p>`,
    )
    .join("")}</section>`;
}
/** 不依赖脚本、弹窗或本机安装状态的完整工具正文。 */
export function toolMarkup(item: ReviewSubject, language: Language): string {
  const category = escape(translate(categoryNames[item.category], language));
  const metric = repositories[item.id];
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
  <div class="tool-layout">
    <aside class="tool-aside">
      <div class="tool-aside-head">${ambientGridMarkup(language)}<div class="tool-aside-icon">${guideIconMarkup(item)}</div><p class="eyebrow">${escape(translate(item.vendor, language))} / ${category}</p><h1>${escape(translate(item.name, language))}</h1><p class="intro">${escape(language === "en" ? descriptions[item.id] : item.description)}</p><div class="guide-tags"><span class="guide-tag">${copy(language, item.maintainerType === "vendor" ? "厂商官方" : "社区项目", item.maintainerType === "vendor" ? "Vendor maintained" : "Community maintained")}</span><span class="guide-tag">${escape(category)}</span>${metric ? `<span class="guide-tag guide-tag-metric">${escape(compact(metric.stars))} GitHub Stars</span>` : ""}</div></div>
      <dl class="tool-facts"><div><dt>${copy(language, "分类", "Category")}</dt><dd>${category}</dd></div><div><dt>${copy(language, "维护来源", "Maintenance source")}</dt><dd>${copy(language, item.maintainerType === "vendor" ? "厂商官方" : "社区项目", item.maintainerType === "vendor" ? "Vendor maintained" : "Community maintained")}</dd></div>${metric ? `<div><dt>${copy(language, "GitHub Stars", "GitHub stars")}</dt><dd>${escape(compact(metric.stars))} · ${copy(language, `快照 ${metrics.fetchedAt.slice(0, 10)}`, `snapshot ${metrics.fetchedAt.slice(0, 10)}`)}</dd></div>` : ""}</dl>
      <div class="tool-aside-actions"><a class="button primary" href="${escape(item.docs)}">${copy(language, "官方文档", "Official docs")} ↗</a>${item.repo ? `<a class="button" href="https://github.com/${escape(item.repo)}">${copy(language, "源码仓库", "Source repository")} ↗</a>` : ""}</div>
      <a class="tool-aside-back" href="${directory}">← ${copy(language, "回到 CLI 目录", "Back to the directory")}</a>
    </aside>
    <div class="tool-main">
  <section class="guide-section tool-install"><h2>${copy(language, "安装方式", "Installation")}</h2>${terminalMarkup(item, language)}<p class="tool-install-note">${copy(language, "安装前请阅读上方官方文档，确认系统、运行环境、账号与费用前提。目录收录不代表已在你的环境中验证安装。", "Read the official documentation above and check system, runtime, account, and cost requirements before installing. Catalog inclusion does not mean installation has been verified in your environment.")}</p></section>${faqMarkup(item, language)}
  <section class="guide-checklist tool-evidence"><h2>${copy(language, "收录与核验范围", "Inclusion and review scope")}</h2>${inclusionMarkup(item, language)}${evidence(item, language)}<a class="text-button" href="${path("/standards", language)}">${copy(language, "了解收录与核验标准", "Read our inclusion standards")} →</a></section>${relatedGuides(item, language)}
  <div class="guide-actions"><a class="button" href="${path(`/?tool=${encodeURIComponent(item.id)}#directory`, language)}">${copy(language, "查看交互详情与指标", "Open interactive details and metrics")} →</a><a class="button" href="${escape(share.href)}" target="_blank" rel="noopener noreferrer">${copy(language, "分享到 X", "Share on X")}</a><a class="button" href="${directory}">${copy(language, "探索全部工具", "Explore all tools")}</a></div>
    </div>
  </div>`;
}

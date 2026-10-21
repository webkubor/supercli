/** 场景页静态正文：按任务比较工具，所有编辑字段及目录字段均转义。 */
import catalog from "../data/catalog.json" with { type: "json" };
import { escapeHtml as escape } from "../src/escape.ts";
import { guideIconMarkup } from "../src/tool-icon.ts";
import type { Language } from "../src/translations.ts";
import {
  guides,
  guideText,
  type Guide,
  type GuideTool,
} from "./guide-content.ts";
const copy = (language: Language, zh: string, en: string): string =>
  language === "en" ? en : zh;
const path = (value: string, language: Language): string =>
  `${language === "en" ? "/en" : ""}${value}`;
function toolRow(tool: GuideTool, language: Language): string {
  const item = catalog.find((item) => item.id === tool.id);
  if (!item) throw new Error(`Guide references unknown tool: ${tool.id}`);
  return `<tr><td>${escape(guideText(tool.task, language))}</td><td><a href="${path(`/tools/${item.id}/`, language)}">${escape(item.name)}</a></td><td>${escape(guideText(tool.fit, language))}</td></tr>`;
}
function toolDetail(tool: GuideTool, language: Language): string {
  const item = catalog.find((item) => item.id === tool.id)!;
  return `<article class="guide-tool" id="${escape(item.id)}"><div class="guide-tool-heading">${guideIconMarkup(item)}<h3>${escape(item.name)}</h3><a class="text-button" href="${path(`/tools/${item.id}/`, language)}">${copy(language, "工具详情 →", "Tool details →")}</a></div><dl><div><dt>${copy(language, "适合什么任务", "When it fits")}</dt><dd>${escape(guideText(tool.fit, language))}</dd></div><div><dt>${copy(language, "开始前需要什么", "Before you start")}</dt><dd>${escape(guideText(tool.requirements, language))}</dd></div><div><dt>${copy(language, "限制与取舍", "Limits and tradeoffs")}</dt><dd>${escape(guideText(tool.caveat, language))}</dd></div></dl><div class="guide-sources"><strong>${copy(language, "官方依据", "Official sources")}</strong>${tool.sources.map((url, index) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(new URL(url).hostname)}${tool.sources.length > 1 ? ` · ${index + 1}` : ""} ↗</a>`).join("")}</div></article>`;
}
function related(guide: Guide, language: Language): string {
  return `<section class="guide-related"><h2>${copy(language, "继续按场景探索", "Explore another workflow")}</h2><div>${guides
    .filter((item) => item.slug !== guide.slug)
    .map(
      (item) =>
        `<a class="button" href="${path(`/guides/${item.slug}/`, language)}">${escape(guideText(item.title, language))} →</a>`,
    )
    .join("")}</div></section>`;
}
/** 输出可在禁用 JavaScript 时阅读与导航的完整指南。 */
export function guideMarkup(guide: Guide, language: Language): string {
  const title = escape(guideText(guide.title, language));
  return `<nav class="guide-breadcrumb" aria-label="${copy(language, "当前位置", "Breadcrumb")}"><a href="${path("/", language)}">SuperCLI</a><span>/</span><a href="${path("/#use-cases", language)}">${copy(language, "场景指南", "Workflow guides")}</a></nav>
  <header class="guide-intro"><p class="eyebrow">${copy(language, "从任务出发 · 按场景选 CLI", "Start with the task · Choose a CLI")}</p><h1>${title}</h1><p class="intro">${escape(guideText(guide.summary, language))}</p><p class="guide-date">${copy(language, "官方资料核对", "Official sources checked")} <time datetime="${escape(guide.reviewedAt)}">${escape(guide.reviewedAt)}</time> · ${copy(language, "SuperCLI 编辑建议", "SuperCLI editorial guidance")}</p></header>
  <section class="guide-answer" aria-labelledby="short-answer"><p class="eyebrow" id="short-answer">${copy(language, "先给结论", "The short answer")}</p><p>${escape(guideText(guide.answer, language))}</p></section>
  <section class="guide-section" aria-labelledby="comparison"><h2 id="comparison">${copy(language, "按你要完成的任务选择", "Choose by the task")}</h2><div class="guide-table-wrap" role="region" aria-label="${copy(language, "工具适用任务对比，可横向滚动", "Tool comparison, scroll horizontally")}" tabindex="0"><table class="guide-table"><thead><tr><th scope="col">${copy(language, "你想做什么", "Your task")}</th><th scope="col">${copy(language, "先看哪个工具", "Start here")}</th><th scope="col">${copy(language, "为什么适合", "Why it fits")}</th></tr></thead><tbody>${guide.tools.map((tool) => toolRow(tool, language)).join("")}</tbody></table></div><p class="guide-note">${copy(language, "按任务匹配，不按热度排优劣；以下为官方资料核对，不代表本站已完成独立安装实测。", "Matched by task, not ranked by popularity. These notes are based on official sources, not independent installation tests by SuperCLI.")}</p></section>
  <section class="guide-section" aria-labelledby="tradeoffs"><h2 id="tradeoffs">${copy(language, "装之前，先看清前提与限制", "Check prerequisites and limits")}</h2>${guide.tools.map((tool) => toolDetail(tool, language)).join("")}</section>
  <section class="guide-checklist"><h2>${copy(language, "从一个小任务开始", "Start with one small task")}</h2><ol>${guide.steps.map((step) => `<li>${escape(guideText(step, language))}</li>`).join("")}</ol><p>${escape(guideText(guide.boundary, language))}</p></section>
  <div class="guide-actions"><a class="button primary" href="${path(`/?category=${encodeURIComponent(guide.category)}#directory`, language)}">${copy(language, "浏览这一分类的全部工具", "Browse all tools in this category")} →</a><a class="button" href="${path("/standards", language)}">${copy(language, "了解收录与核验标准", "Read our inclusion standards")}</a></div>${related(guide, language)}`;
}

/** 结构化数据与可见正文引用同一份标题、日期和官方来源。 */
export function guideStructuredData(
  guide: Guide,
  language: Language,
  origin: string,
) {
  return {
    "@type": "Article",
    headline: guideText(guide.title, language),
    dateModified: guide.reviewedAt,
    author: { "@type": "Organization", name: "SuperCLI", url: origin },
    citation: [...new Set(guide.tools.flatMap((tool) => tool.sources))],
    about: guide.tools.map((tool) => ({
      "@type": "SoftwareApplication",
      name: catalog.find((item) => item.id === tool.id)!.name,
      url: origin + path(`/tools/${tool.id}/`, language),
    })),
  };
}

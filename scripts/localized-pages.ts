/** 双语静态页面与搜索元信息；构建和开发共用，不依赖爬虫执行 JavaScript。 */
import { guides, guideFor, guideText } from "./guide-content.ts";
import { guideMarkup, guideStructuredData } from "./guide-markup.ts";
import catalog from "../data/catalog.json" with { type: "json" };
import { toolMarkup, faqs } from "./tool-markup.ts";
import metrics from "../data/metrics.json" with { type: "json" };
import english from "../data/catalog.en.json" with { type: "json" };
import { translate, type Language } from "../src/translations.ts";
import { escapeHtml as escape } from "../src/escape.ts";
import { staticCardMarkup } from "../src/static-card.ts";
import categories from "../data/categories.json" with { type: "json" };
const origin = "https://supercli.site";
const descriptions: Readonly<Record<string, string>> = english;
const repositories: Readonly<
  Record<string, { readonly stars: number } | null>
> = metrics.repositories;
const rankedCatalog = catalog.toSorted((a, b) => {
  const left = repositories[a.id];
  const right = repositories[b.id];
  if (!left || !right)
    return Number(!!right) - Number(!!left) || a.name.localeCompare(b.name);
  return right.stars - left.stars || a.name.localeCompare(b.name);
});
/** 所有可被搜索和分享的页面，语言版本互相对应。 */
export const pagePaths = [
  "/",
  "/standards",
  "/brand",
  ...guides.map((guide) => `/guides/${guide.slug}/`),
  ...catalog.map((item) => `/tools/${item.id}/`),
];
/** 添加语言前缀。 */
export function localizedPath(path: string, language: Language): string {
  const clean = path.replace(/^(\/(?:brand|standards))\.html(?=[?#]|$)/, "$1");
  return language === "en" ? `/en${clean}` : clean;
}
/** 将发布路径映射到静态入口。 */
export function pageSource(path: string): string | null {
  if (path === "/") return "index.html";
  if (guideFor(path)) return "guides.html";
  if (path === "/standards" || path === "/standards.html")
    return "standards.html";
  if (path === "/brand.html" || path === "/brand") return "brand.html";
  return catalog.some((item) => path === `/tools/${item.id}/`)
    ? "guides.html"
    : null;
}
function toolDescription(
  item: (typeof catalog)[number],
  language: Language,
): string {
  return language === "en" ? descriptions[item.id] : item.description;
}
function staticCatalog(language: Language, path: string): string {
  // 静态行与运行时行共用 directory-row 的单一实现，
  // 不再各自手写一份卡片标记。
  const rows = rankedCatalog.filter(
    (item) => path === "/" || path === `/tools/${item.id}/`,
  );
  return rows
    .map((item, index) =>
      staticCardMarkup(item, localizedPath(`/tools/${item.id}/`, language), String(index + 1).padStart(2, "0"), {
        name: translate(item.name, language),
        vendor: translate(item.vendor, language),
        description: toolDescription(item, language),
        maintainerLabel: translate(
          item.maintainerType === "vendor" ? "厂商官方" : "社区项目",
          language,
        ),
      }),
    )
    .join("");
}
function socialMetadata(
  title: string,
  description: string,
  url: string,
  language: Language,
  image: string,
  imageAlt: string,
): string {
  return [
    ["property", "og:type", "website"],
    ["property", "og:site_name", "SuperCLI"],
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["property", "og:url", url],
    ["property", "og:locale", language === "en" ? "en_US" : "zh_CN"],
    ["property", "og:locale:alternate", language === "en" ? "zh_CN" : "en_US"],
    ["property", "og:image", image],
    ["property", "og:image:width", "1200"],
    ["property", "og:image:height", "630"],
    ["property", "og:image:alt", imageAlt],
    ["name", "twitter:card", "summary_large_image"],
    ["name", "twitter:title", title],
    ["name", "twitter:description", description],
    ["name", "twitter:image", image],
    ["name", "twitter:image:alt", imageAlt],
  ]
    .map(
      ([attribute, key, value]) =>
        `<meta ${attribute}="${key}" content="${escape(value)}">`,
    )
    .join("\n");
}
function structuredData(
  title: string,
  description: string,
  url: string,
  path: string,
  language: Language,
  item: (typeof catalog)[number] | undefined,
) {
  const base = {
    "@context": "https://schema.org",
    name: title,
    description,
    url,
    inLanguage: language === "en" ? "en" : "zh-CN",
  };
  const guide = guideFor(path);
  if (guide)
    return { ...base, ...guideStructuredData(guide, language, origin) };
  if (item)
    return {
      ...base,
      "@type": "WebPage",
      mainEntity: {
        "@type": "SoftwareApplication",
        name: translate(item.name, language),
        description,
        url: item.docs,
        applicationCategory: "DeveloperApplication",
      },
    };
  if (path !== "/") return { ...base, "@type": "WebPage" };
  return {
    ...base,
    "@type": "CollectionPage",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: catalog.length,
      itemListElement: rankedCatalog.map((row, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: translate(row.name, language),
        url: origin + localizedPath(`/tools/${row.id}/`, language),
      })),
    },
  };
}
function metadata(html: string, path: string, language: Language): string {
  const item = catalog.find((row) => path === `/tools/${row.id}/`);
  const title = item
    ? `${translate(item.name, language)} — SuperCLI`
    : (html.match(/<title>(.*?)<\/title>/s)?.[1] ?? "SuperCLI");
  const description = item
    ? toolDescription(item, language)
    : (html.match(/name="description"\s+content="([^"]*)"/s)?.[1] ?? "");
  const url = origin + localizedPath(path, language);
  // 工具页用本工具的独立分享卡，其余页面按语言用站点通用卡；社交平台不支持 SVG。
  const image = item
    ? `${origin}/og/tools/${item.id}.png`
    : `${origin}/${language === "en" ? "social-card.png" : "social-card-zh.png"}`;
  const imageAlt = item
    ? language === "en"
      ? `${translate(item.name, "en")}: install command and GitHub stars snapshot on SuperCLI`
      : `${translate(item.name, "zh")} 的安装命令与 GitHub Stars 快照 — SuperCLI`
    : language === "en"
      ? "SuperCLI — Your next favorite command-line tool"
      : "SuperCLI — 下一条命令，更多可能";
  const meta = socialMetadata(title, description, url, language, image, imageAlt);
  const alternates = (["zh", "en"] as const)
    .map(
      (lang) =>
        `<link rel="alternate" hreflang="${lang === "zh" ? "zh-CN" : "en"}" href="${origin}${localizedPath(path, lang)}">`,
    )
    .join("\n");
  const schema = structuredData(title, description, url, path, language, item);
  // 结构化答案与页面可见 FAQ 同源，见 tool-markup.ts 的 faqs()。
  const faqSchema = item
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        url,
        inLanguage: language === "en" ? "en" : "zh-CN",
        mainEntity: faqs(item, language).map((entry) => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: { "@type": "Answer", text: entry.answer },
        })),
      }
    : null;
  const clean = html
    .replace(/<meta\s+(?:property|name)="(?:og:|twitter:)[^"]*"[^>]*>/gs, "")
    .replace(/<link\s+rel="canonical"[^>]*>/g, "")
    .replace(/<title>.*?<\/title>/s, "")
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/s, "");
  return clean.replace(
    "</head>",
    `<title>${title}</title><meta name="description" content="${escape(description)}">${meta}<link rel="alternate" type="application/json" href="${origin}/catalog.json"><link rel="canonical" href="${url}">${alternates}<link rel="alternate" hreflang="x-default" href="${origin}${path}"><script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>${faqSchema ? `<script type="application/ld+json">${JSON.stringify(faqSchema).replaceAll("<", "\\u003c")}</script>` : ""}</head>`,
  );
}
/** 从同一模板生成双语 HTML、预渲染目录和可分享的工具页。 */
export function localizedPage(
  template: string,
  path: string,
  language: Language,
): string {
  path = path.replace(/^(\/(?:brand|standards))\.html$/, "$1");
  let html = translate(template, language).replace(
    'lang="zh-CN"',
    `lang="${language === "en" ? "en" : "zh-CN"}"`,
  );
  html = html.replace(/href="(\/[^"\s]*)"/g, (full, href: string) => {
    // 语言切换链接稍后独立写入，静态资产保持根路径。
    const [base] = href.split(/[?#]/);
    return pageSource(base) && !base.startsWith("/en/")
      ? `href="${localizedPath(href, language)}"`
      : full;
  });
  html = html.replace(
    /href="[^"]*" data-language="(zh|en)"/g,
    (_, target: Language) =>
      `href="${localizedPath(path, target)}" data-language="${target}"${target === language ? ' aria-current="true"' : ""}`,
  );
  html = html.replace(
    '<div id="catalog" class="catalog"></div>',
    `<div id="catalog" class="catalog">${staticCatalog(language, path)}</div>`,
  );
  const item = catalog.find((row) => path === `/tools/${row.id}/`);
  if (item) {
    html = html
      .replace("<!-- guide-content -->", toolMarkup(item, language))
      .replace(
        'href="#guide-main">跳到场景指南',
        'href="#guide-main">跳到工具详情',
      )
      .replace(
        'href="#guide-main">Skip to workflow guide',
        'href="#guide-main">Skip to tool details',
      );
  }
  const guide = guideFor(path);
  if (guide) {
    html = html
      .replace("<!-- guide-content -->", guideMarkup(guide, language))
      .replace(
        /<title>.*?<\/title>/s,
        `<title>${escape(guideText(guide.title, language))} — SuperCLI</title>`,
      )
      .replace(
        /name="description"\s+content="[^"]*"/,
        `name="description" content="${escape(guideText(guide.summary, language))}"`,
      );
  }
  return metadata(html, path, language);
}
/** 站点地图仅包含真实静态页面，不包含筛选参数。 */
export function sitemap(): string {
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pagePaths.flatMap((path) => (["zh", "en"] as const).map((lang) => `<url><loc>${origin}${localizedPath(path, lang)}</loc></url>`)).join("")}</urlset>\n`;
}

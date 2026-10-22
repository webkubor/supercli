/** 搜索与 AI 检索的公开目录索引；只导出可核验的公开字段，不包含本机状态。 */
import { guides } from "./guide-content.ts";
import catalog from "../data/catalog.json" with { type: "json" };
import english from "../data/catalog.en.json" with { type: "json" };
import metrics from "../data/metrics.json" with { type: "json" };
import usage from "../data/usage.json" with { type: "json" };
import reviews from "../data/reviews.json" with { type: "json" };
import community from "../data/community.json" with { type: "json" };
import { translate } from "../src/translations.ts";
const origin = "https://supercli.site";
const descriptions: Readonly<Record<string, string>> = english;
function toolRecord(item: (typeof catalog)[number]) {
  const review = reviews.find((record) => record.id === item.id);
  const inclusion = community.find((record) => record.id === item.id);
  return {
    id: item.id,
    name: item.name,
    vendor: item.vendor,
    category: item.category,
    maintainerType: item.maintainerType,
    description: { zh: item.description, en: descriptions[item.id] },
    url: {
      zh: `${origin}/tools/${item.id}/`,
      en: `${origin}/en/tools/${item.id}/`,
    },
    docs: item.docs,
    inclusion: inclusion
      ? {
          addedAt: inclusion.addedAt,
          curatedBy: inclusion.curatedBy,
          recommendedBy: inclusion.recommendedBy,
          evidence: inclusion.evidence,
        }
      : null,
    repository: item.repo ? `https://github.com/${item.repo}` : null,
    review: review
      ? {
          reviewedAt: review.reviewedAt,
          evidence: review.evidence,
          checks: review.checks.map((check) => ({
            kind: check.kind,
            method: check.method,
            reference: check.reference,
            note: { zh: check.note, en: translate(check.note, "en") },
            environment: check.environment,
            version: check.version,
          })),
        }
      : null,
  };
}
/** 可引用数据快照：说明时间、原始来源以及核验范围，缺失数据保持 null。 */
export function discoveryIndex(): string {
  return (
    JSON.stringify(
      {
        version: 1,
        name: "SuperCLI",
        url: origin,
        languages: ["zh-CN", "en"],
        snapshots: { github: metrics.fetchedAt, npm: usage.fetchedAt },
        methodology: {
          zh: `${origin}/standards`,
          en: `${origin}/en/standards`,
        },
        limitations: [
          "Stars measure repository attention, not CLI quality or users; tools in a monorepo share metrics.",
          "npm downloads include repeat installs and CI; they are not CLI executions or unique users.",
          "Repository pushes are not release dates. Missing metrics are unknown, not zero.",
          "Inclusion is not a security certification or proof of independent installation testing.",
          "Inclusion dates record entry into this directory, not upstream releases. Curation is distinct from a recommendation.",
        ],
        guides: guides.map((guide) => ({
          title: guide.title,
          url: {
            zh: origin + `/guides/${guide.slug}/`,
            en: origin + `/en/guides/${guide.slug}/`,
          },
          reviewedAt: guide.reviewedAt,
          tools: guide.tools.map((tool) => tool.id),
          sources: [...new Set(guide.tools.flatMap((tool) => tool.sources))],
        })),
        tools: catalog.map(toolRecord),
      },
      null,
      2,
    ) + "\n"
  );
}
/** llms.txt 是补充发现入口，不替代真实页面、站点地图或爬虫访问规则。 */
export function llmsIndex(): string {
  return `# SuperCLI\n\n> A community-maintained directory of command-line tools with Chinese and English pages.\n\n## Start here\n\n- [English directory](${origin}/en/): Browse tools by purpose, vendor, and maintenance source.\n- [中文目录](${origin}/): 按用途、厂商与维护来源发现 CLI。\n- [Inclusion and review standards](${origin}/en/standards): Evidence, review scope, and limitations.\n- [Machine-readable catalog](${origin}/catalog.json): Bilingual descriptions, original sources, direct tool URLs, review scope, and snapshot timestamps.\n- [Sitemap](${origin}/sitemap.xml): All localized pages.\n- [Repository](https://github.com/webkubor/supercli): Public source data and contribution workflow.\n\n## Citation and interpretation\n\nCite the specific tool page and check upstream documentation before recommending installation. Inclusion is not a security certification. Source reviews are distinct from independent installation tests. Stars reflect repository attention, not quality. npm downloads are not executions or users. Repository pushes are not release dates. Missing data is unknown, not zero.\n\n## Workflow guides\n\n${guides.map((guide) => `- [${guide.title.en}](${origin}/en/guides/${guide.slug}/): ${guide.summary.en}`).join("\n")}\n\n## Tools\n\n${catalog.map((item) => `- [${translate(item.name, "en")}](${origin}/en/tools/${item.id}/): ${descriptions[item.id]}`).join("\n")}\n`;
}

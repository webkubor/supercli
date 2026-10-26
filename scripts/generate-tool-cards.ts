/** 生成每个工具的独立分享卡 PNG（public/og/tools/），需本机 rsvg-convert。 */
import categories from "../data/categories.json" with { type: "json" };
import catalog from "../data/catalog.json" with { type: "json" };
import metrics from "../data/metrics.json" with { type: "json" };
import { readFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { translate } from "../src/translations.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(root, "public/og/tools");
const repositories: Readonly<
  Record<string, { readonly stars: number } | null>
> = metrics.repositories;

const compact = (value: number) =>
  Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
/** 以字符数估算宽度并压字号，中英页面共用一张纯拉丁字符卡，避免 CJK 字体依赖。
 *  等宽字体实测宽度系数约 0.62，按 0.63 估算留出余量。 */
const fit = (text: string, perChar: number, max: number, size: number): number =>
  Math.max(17, Math.min(size, Math.floor(max / (text.length * perChar))));

/** 导出 SVG 源供本地布局审计复用；产物 PNG 由下方主流程写入。 */
export function cardSvg(item: (typeof catalog)[number]): string {
  const name = translate(item.name, "en");
  const vendor = translate(item.vendor, "en");
  const category = translate(
    (categories as Record<string, string>)[item.category],
    "en",
  );
  const maintained = item.maintainerType === "vendor";
  const subtitle = `${vendor} · ${category} · ${maintained ? "Vendor maintained" : "Community project"}`;
  const metric = repositories[item.id];
  const snapshot = metrics.fetchedAt.slice(0, 10);
  const nameSize = fit(name, 0.58, 880, 84);
  const install = item.install ? `$ ${item.install}` : "";
  const installSize = install ? fit(install, 0.63, 824, 30) : 27;
  const pillWidth = install
    ? Math.ceil(install.length * 0.63 * installSize) + 56
    : 0;
  const iconPath = resolve(root, "public/icons", item.icon);
  if (!existsSync(iconPath))
    throw new Error(`missing icon asset for ${item.id}: ${iconPath}`);
  const icon = readFileSync(iconPath).toString("base64");
  const command = item.install;
  const installArea = command
    ? `<rect x="250" y="352" width="${pillWidth}" height="64" rx="14" fill="#19191d"/><text x="278" y="393" font-family="Menlo, Consolas, DejaVu Sans Mono, monospace" font-size="${installSize}" fill="#f7f7f8"><tspan fill="#7f7f8a">$</tspan> ${escapeXml(command)}</text>`
    : `<text x="250" y="390" font-family="Helvetica Neue, Arial, sans-serif" font-size="27" fill="#5f5f6e">Install: follow the official documentation</text>`;
  const stars = metric
    ? (() => {
        const label = `${compact(metric.stars)} GitHub stars`;
        return `<path transform="translate(70 522) scale(1.1)" d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17l-6.1 3.6 1.4-6.8L2.2 9.1l6.9-.8z" fill="#002fa7"/><text x="108" y="545" font-family="Helvetica Neue, Arial, sans-serif" font-size="28" font-weight="700" fill="#002fa7">${escapeXml(label)}</text><text x="${Math.ceil(108 + label.length * 0.58 * 28 + 14)}" y="545" font-family="Helvetica Neue, Arial, sans-serif" font-size="26" fill="#5f5f6e">· snapshot ${snapshot}</text>`;
      })()
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#f7f7f8"/><g transform="translate(70 65) scale(.96875)"><rect width="64" height="64" rx="14" fill="#002fa7"/><path d="M47 13H26L13 26v6l24 11H17v8h22l12-12v-7L27 21h20z" fill="#fff"/><path d="M43 48h9" stroke="#fff" stroke-width="3"/></g><text x="153" y="110" font-family="Helvetica Neue, Arial, sans-serif" font-size="44" font-weight="700" fill="#19191d">SuperCLI</text><clipPath id="icon"><rect x="70" y="168" width="140" height="140" rx="28"/></clipPath><image x="70" y="168" width="140" height="140" clip-path="url(#icon)" href="data:image/png;base64,${icon}"/><text x="250" y="262" font-family="Helvetica Neue, Arial, sans-serif" font-size="${nameSize}" font-weight="700" fill="#19191d">${escapeXml(name)}</text><text x="250" y="316" font-family="Helvetica Neue, Arial, sans-serif" font-size="27" fill="#5f5f6e">${escapeXml(subtitle)}</text>${installArea}<path d="M70 480h1060" stroke="#e3e3e8"/>${stars}<text x="1130" y="545" text-anchor="end" font-family="Helvetica Neue, Arial, sans-serif" font-size="26" fill="#5f5f6e">supercli.site/tools/${escapeXml(item.id)}/</text></svg>`;
}

mkdirSync(target, { recursive: true });
const expected = new Set(catalog.map((item) => `${item.id}.png`));
const stale = readdirSync(target).filter((file) => !expected.has(file));
if (stale.length)
  throw new Error(`unexpected files in public/og/tools: ${stale.join(", ")}`);
for (const item of catalog) {
  const file = resolve(target, `${item.id}.png`);
  const temp = `${file}.tmp`;
  execFileSync("rsvg-convert", ["-w", "1200", "-h", "630", "-o", temp], {
    input: cardSvg(item),
  });
  const header = readFileSync(temp).subarray(0, 8);
  if (!header.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    throw new Error(`not a PNG for ${item.id}`);
  execFileSync("mv", [temp, file]);
}
console.log(`Generated ${catalog.length} tool share cards in public/og/tools/.`);

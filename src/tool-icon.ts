/** 工具图标渲染：品牌几何优先，个人维护者头像改用字母块。 */
import { escapeHtml as escape } from "./escape.ts";

/** 图标渲染只依赖工具的标识与名称，便于静态页脚本复用。 */
export interface IconSubject {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly vendor: string;
}

/**
 * 这些图标来自 GitHub owner 头像（见 scripts/sync.mjs 的 owner.avatar_url），
 * 内容是人物或动物照片，不是品牌标识。工具目录展示人脸会与厂商 logo 混淆，
 * 改为中性字母块。厂商自有 logo 不在此列，仍保留原品牌几何。
 */
const PORTRAIT_ICONS: ReadonlySet<string> = new Set([
  "agent-reach.png",
  "apktool.png",
  "bat.png",
  "crawl4ai.png",
  "fzf.png",
  "git-filter-repo.png",
  "lazygit.png",
  "mise.png",
  "ripgrep.png",
  "summarize.png",
  "terminal-notifier.png",
]);

/** 是否为头像类图标。 */
export function isPortraitIcon(icon: string): boolean {
  return PORTRAIT_ICONS.has(icon);
}

/** 字母块取名称首字母；中文名取首个汉字，英文名取首字母大写。 */
function initial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "·";
  const first = [...trimmed][0];
  return /[a-z]/i.test(first) ? first.toUpperCase() : first;
}

/**
 * 渲染工具图标。头像类改用带首字母的色块，
 * 其余保留原图标文件，宽度与 alt 语义保持一致。
 */
export function iconMarkup(item: IconSubject): string {
  if (isPortraitIcon(item.icon)) {
    return `<span class="icon-initial" aria-hidden="true">${escape(initial(item.name))}</span>`;
  }
  return `<img src="/icons/${escape(item.icon)}" alt="" width="32" height="32">`;
}

/**
 * 目录卡片图标：品牌 logo 保留 alt 文字以供读屏识别，
 * 头像色块为纯装饰，名称已由卡片标题提供。
 */
export function cardIconMarkup(item: IconSubject, alt: string): string {
  if (isPortraitIcon(item.icon)) {
    return `<span class="icon-initial card-initial" aria-hidden="true">${escape(initial(item.name))}</span>`;
  }
  return `<img class="vendor-icon" src="/icons/${escape(item.icon)}" alt="${escape(alt)}" width="44" height="44" loading="lazy">`;
}

/**
 * 工具预览图标：品牌 logo 用图，头像色块保持与预览同尺寸。
 */
export function stageIconMarkup(item: IconSubject): string {
  if (isPortraitIcon(item.icon)) {
    return `<span class="icon-initial stage-initial" aria-hidden="true">${escape(initial(item.name))}</span>`;
  }
  return `<img src="/icons/${escape(item.icon)}" alt="" width="36" height="36">`;
}

/**
 * 详情与静态页图标：带 alt 文字供读屏识别；
 * 头像色块为纯装饰，工具名已在同屏标题给出。
 */
export function detailIconMarkup(item: IconSubject, alt: string): string {
  if (isPortraitIcon(item.icon)) {
    return `<span class="icon-initial detail-initial" aria-hidden="true">${escape(initial(item.name))}</span>`;
  }
  return `<img class="detail-icon" src="/icons/${escape(item.icon)}" alt="${escape(alt)}">`;
}

/**
 * 指南页图标：静态页面无脚本，字母块同样直接输出。
 */
export function guideIconMarkup(item: IconSubject): string {
  if (isPortraitIcon(item.icon)) {
    return `<span class="icon-initial guide-initial" aria-hidden="true">${escape(initial(item.name))}</span>`;
  }
  return `<img src="/icons/${escape(item.icon)}" alt="" width="40" height="40">`;
}

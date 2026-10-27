/**
 * 首屏命令台：在真实目录上做即时检索，并把命中的工具与安装命令直接摆出来。
 * 路由：/、/en/
 * 数据来源：data/catalog.json 与 data/metrics.json，与目录使用同一套查询逻辑。
 */
import { t, msg } from "./i18n";
import { formatStars } from "./tool-metrics";
import { queryEntries, catalog, stats, type Entry } from "./catalog";
import { escapeHtml as escape } from "./escape";
import { consoleIconMarkup } from "./tool-icon";
import { commandMarkup } from "./command-markup";
import { createIcons, Copy } from "lucide";

/** 命令台用到的图标集合；重渲染后需重新转换。 */
const LUCIDE = { Copy };

/** 空输入时展示的推荐工具：取自目录内已有收录条目，不虚构工具。 */
const FEATURED: readonly string[] = ["wrangler", "gh", "rg"];

/** 命令台一次最多展示的结果数，避免长列表把首屏撑破。 */
const MAX_RESULTS = 6;

/** 复制按钮沿用终端窗口的图标翻转结构，与目录和工具页共用同一套反馈。 */
function copyButtonMarkup(item: Entry): string {
  const label = escape(msg`复制 ${item.name} 安装命令`);
  return `<button type="button" class="console-hit-copy" data-copy="${escape(item.id)}" aria-label="${label}"><span class="terminal-copy-icon" aria-hidden="true"><i data-lucide="copy"></i><svg class="terminal-copy-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span><span class="terminal-copy-label">${escape(t("复制"))}</span></button>`;
}

/** 单条命中结果：图标、名称、厂商、Stars 与安装命令。 */
function resultMarkup(item: Entry): string {
  const metric = stats(item);
  const command = item.install
    ? commandMarkup(item.install)
    : escape(t("请查看官方文档"));
  return `<div class="console-hit">
    <span class="console-hit-icon">${consoleIconMarkup(item)}</span>
    <span class="console-hit-body">
      <a class="console-hit-name" href="/tools/${escape(item.id)}/" data-detail="${escape(item.id)}">${escape(t(item.name))}</a>
      <span class="console-hit-meta">${escape(t(item.vendor))} · ${metric ? `${escape(formatStars(metric.stars))} Stars` : escape(t("未计分"))}</span>
      <code class="console-hit-command"><span class="console-prompt">$</span>${command}</code>
    </span>
    ${copyButtonMarkup(item)}
  </div>`;
}

/**
 * 装配首屏命令台：输入即检索，命中结果可一键复制安装命令或进入工具详情。
 * 空查询展示推荐条目，不展示“在线人数”之类没有数据来源的假指标。
 */
export function setupConsole(): void {
  const input = document.querySelector<HTMLInputElement>("#console-input");
  const results = document.querySelector<HTMLElement>("#console-results");
  const count = document.querySelector<HTMLElement>("#console-count");
  if (!input || !results || !count) return;

  /** 按当前输入取条目：空输入给推荐项，有输入走目录同一套全文检索。 */
  function matches(query: string): Entry[] {
    if (!query) {
      return FEATURED.map((id) =>
        catalog.find((item) => item.id === id),
      ).filter((item): item is Entry => Boolean(item));
    }
    return queryEntries(query, "", "", "stars").slice(0, MAX_RESULTS);
  }

  /** 渲染命中列表；命中总数与提示同步到计数位，空结果给出明确空态。 */
  function render(): void {
    const query = input!.value.trim();
    const items = matches(query);
    if (query) {
      const total = queryEntries(query, "", "", "stars").length;
      count!.textContent = msg`${String(total)} 个匹配`;
    } else {
      count!.textContent = msg`${String(items.length)} 个推荐`;
    }
    if (!items.length) {
      results!.innerHTML = `<p class="console-empty">${escape(t("没有匹配的工具，试试工具名或厂商。"))}</p>`;
      return;
    }
    results!.innerHTML = items.map(resultMarkup).join("");
    // 重渲染后必须重新转换 lucide 占位符，否则 <i data-lucide> 停在未转换状态，
    // 复制图标与工具图标会整体消失（0.7.1 实际事故）。
    createIcons({ icons: LUCIDE });
  }

  input.addEventListener("input", render);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && input.value) {
      event.preventDefault();
      input.value = "";
      render();
    }
    if (event.key === "Enter") {
      const first = results.querySelector<HTMLAnchorElement>("[data-detail]");
      first?.click();
    }
  });

  document.querySelector("#console-all")?.addEventListener("click", () => {
    document.querySelector("#directory")?.scrollIntoView({ block: "start" });
  });

  render();
}

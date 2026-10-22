/** 目录页面交互：搜索、筛选、排序、详情、安装命令复制；路由：/。 */
import { setupSharing, updateSharing } from "./sharing";
import { setupLanguage, countLabel } from "./i18n";
import { setupTheme } from "./theme";
import { msg, t, locale } from "./i18n";
import {
  createIcons,
  GitFork,
  Plus,
  ArrowDownRight,
  GitPullRequest,
  Search,
  Info,
  ArrowUpRight,
  Copy,
  Star,
  X,
  SearchX,
  Cloud,
  Sparkles,
  Terminal,
  Link,
  Building2,
  Users,
  FileText,
  ChevronDown,
} from "lucide";
const icons = {
  GitFork,
  Plus,
  ArrowDownRight,
  GitPullRequest,
  Search,
  Info,
  ArrowUpRight,
  Copy,
  Star,
  X,
  SearchX,
  Cloud,
  Sparkles,
  Terminal,
  Link,
  Building2,
  Users,
  FileText,
  ChevronDown,
};
import {
  catalog,
  categories,
  maintainerLabels,
  metrics,
  stats,
  queryEntries,
  type Entry,
} from "./catalog";
import { escapeHtml as escape, detailMarkup } from "./html";
import { showCopySuccess, setupDialogDismiss } from "./interaction-feedback";
import { setupCommunity } from "./community";
import { setupFilterPicker } from "./filter-picker";
import { cardMarkup } from "./card";
import "./style.css";
import { setupDiscovery, setupDetailLinks } from "./discovery";
const root = document.querySelector<HTMLElement>("#catalog")!;
const search = document.querySelector<HTMLInputElement>("#search")!;
const vendor = document.querySelector<HTMLSelectElement>("#vendor")!;
const sort = document.querySelector<HTMLSelectElement>("#sort")!;
const detail = document.querySelector<HTMLDialogElement>("#detail")!;
let category = "";
let maintainerType = "";
let toastTimer: ReturnType<typeof setTimeout>;
/** 目录分页：首屏只渲染一屏能看完的数量，避免手机上滚过上百张卡片。 */
const PAGE_SIZE = 12;
let visibleCount = PAGE_SIZE;
/** 入场动画只在首屏播一次，翻页和筛选重渲染不重播。 */
let hasEntered = false;
/** 翻页时从哪一张开始算「新增」，用于只给新卡片播入场。 */
let animateFrom = -1;
const iconify = () => createIcons({ icons });
function render(resetPage = true): void {
  if (resetPage) visibleCount = PAGE_SIZE;
  if (!hasEntered) {
    hasEntered = true;
    root.classList.add("is-enter");
    setTimeout(() => root.classList.remove("is-enter"), 600);
  }
  const items = queryEntries(
    search.value,
    category,
    vendor.value,
    sort.value,
    maintainerType,
  );
  const shown = items.slice(0, visibleCount);
  const from = animateFrom;
  animateFrom = -1;
  root.innerHTML = shown
    .map((item, index) => {
      // 只给本次新增的卡片排队入场，已有卡片原地不动。
      const delay = from >= 0 && index >= from ? (index - from) * 45 : null;
      const markup = cardMarkup(item, index, sort.value);
      if (delay === null) return markup;
      return markup.replace(
        'class="card"',
        `class="card card-new" style="animation-delay:${delay}ms"`,
      );
    })
    .join("");
  const more = document.querySelector<HTMLElement>("#catalog-more")!;
  const remaining = items.length - shown.length;
  more.hidden = remaining <= 0;
  more.innerHTML =
    remaining > 0
      ? msg`<button class="button load-more" id="load-more">再看 ${String(Math.min(remaining, PAGE_SIZE))} 个<span class="load-more-count">还有 ${String(remaining)} 个</span></button>`
      : "";
  document.querySelector("#result-count")!.textContent = countLabel(
    items.length,
    "results",
  );
  const summaries: Record<string, string> = {
    stars: t("按 GitHub Stars 排序 · 多工具仓库共享数据"),
    downloads: t("按 npm 近 30 天下载量排序 · 未接入数据的工具在后"),
    updated: t("按仓库最近推送排序 · 不代表版本发布时间"),
    name: t("按名称 A–Z 排序 · 序号不代表热度"),
  };
  document.querySelector("#ranking-summary")!.textContent =
    summaries[sort.value];
  document.querySelector<HTMLElement>("#empty")!.hidden = items.length > 0;
  document
    .querySelectorAll<HTMLButtonElement>("[data-category]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.category === category),
      ),
    );
  document
    .querySelectorAll<HTMLButtonElement>("[data-source]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.source === maintainerType),
      ),
    );
  renderActiveFilters();
  const params = new URLSearchParams();
  const tool = new URLSearchParams(location.search).get("tool");
  if (tool) params.set("tool", tool);
  if (search.value) params.set("q", search.value);
  if (category) params.set("category", category);
  if (vendor.value) params.set("vendor", vendor.value);
  if (maintainerType) params.set("source", maintainerType);
  if (sort.value !== "stars") params.set("sort", sort.value);
  history.replaceState(
    null,
    "",
    `${location.pathname}${params.size ? `?${params}` : ""}${location.hash}`,
  );
  updateSharing();
  iconify();
}
function renderActiveFilters(): void {
  const filters = [
    ["search", search.value && msg`搜索：${search.value}`],
    ["category", categories[category as keyof typeof categories]],
    ["vendor", t(vendor.value)],
    [
      "source",
      maintainerLabels[maintainerType as keyof typeof maintainerLabels],
    ],
  ].filter(([, value]) => value);
  const host = document.querySelector<HTMLElement>("#active-filters")!;
  host.hidden = !filters.length;
  host.innerHTML =
    filters
      .map(
        ([key, value]) =>
          msg`<button class="filter-chip" data-clear="${key}" aria-label="移除${escape(String(value))}">${escape(String(value))}<i data-lucide="x"></i></button>`,
      )
      .join("") +
    t('<button class="clear-all" data-clear="all">清除全部</button>');
}
function clearFilter(key: string): void {
  if (key === "search" || key === "all") search.value = "";
  if (key === "category" || key === "all") category = "";
  if (key === "vendor" || key === "all") vendor.value = "";
  if (key === "source" || key === "all") maintainerType = "";
  vendor.dispatchEvent(new Event("change"));
  search.focus();
}
function notify(message: string): void {
  const toast = document.querySelector<HTMLElement>("#toast")!;
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
}
async function copyCommand(item: Entry): Promise<void> {
  if (!item.install) {
    showDetail(item);
    return;
  }
  try {
    await navigator.clipboard.writeText(item.install);
    showCopySuccess(item.id);
    notify(msg`已复制：${item.install}`);
  } catch {
    showDetail(item);
    notify(t("无法访问剪贴板，请在详情中手动复制安装命令。"));
  }
}
function showDetail(item: Entry): void {
  const data = stats(item);
  document.querySelector("#detail-content")!.innerHTML = detailMarkup(
    item,
    data,
  );
  const url = new URL(location.href);
  url.searchParams.set("tool", item.id);
  history.replaceState(null, "", url);
  if (!detail.open) detail.showModal();
  updateSharing();
  iconify();
}
function initFilters(): void {
  document.querySelector("#category-total")!.textContent = String(
    Object.keys(categories).length,
  ).padStart(2, "0");
  document.querySelector("#total")!.textContent = String(
    catalog.length,
  ).padStart(2, "0");
  const time = new Date(metrics.fetchedAt);
  document.querySelector("#updated")!.textContent =
    msg`数据快照 ${time.toLocaleString(locale, { timeZone: "Asia/Taipei", hour12: false })} UTC+8`;
  vendor.innerHTML += [...new Set(catalog.map((item) => item.vendor))]
    .toSorted()
    .map(
      (name) => `<option value="${escape(name)}">${escape(t(name))}</option>`,
    )
    .join("");
  document.querySelector("#categories")!.innerHTML = [
    ["", t("全部工具")],
    ...Object.entries(categories),
  ]
    .map(
      ([id, label]) =>
        `<button data-category="${escape(id)}" aria-pressed="${id === ""}">${escape(label)}<span>${catalog.filter((item) => !id || item.category === id).length}</span></button>`,
    )
    .join("");
  const params = new URLSearchParams(location.search);
  search.value = params.get("q") ?? "";
  category = params.get("category") ?? "";
  maintainerType = ["vendor", "community"].includes(params.get("source") ?? "")
    ? params.get("source")!
    : "";
  if (!Object.hasOwn(categories, category)) category = "";
  vendor.value = params.get("vendor") ?? "";
  if (!vendor.value) vendor.value = "";
  sort.value = ["stars", "updated", "downloads", "name"].includes(
    params.get("sort") ?? "",
  )
    ? params.get("sort")!
    : "stars";
}
function setupEvents(): void {
  [search, vendor, sort].forEach((element) =>
    element.addEventListener(element === search ? "input" : "change", () =>
      render(),
    ),
  );
  document.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).closest("#load-more")) {
      animateFrom = visibleCount;
      visibleCount += PAGE_SIZE;
      render(false);
      return;
    }
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      "button, a[data-detail]",
    );
    if (!target) return;
    if (target.matches("a[data-detail]")) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
    }
    if (target.dataset.clear) clearFilter(target.dataset.clear);
    if (target.dataset.source !== undefined) {
      maintainerType = target.dataset.source;
      render();
    }
    if (target.dataset.category !== undefined) {
      category = target.dataset.category;
      render();
      if (target.classList.contains("use-case"))
        document
          .querySelector("#directory")!
          .scrollIntoView({ block: "start" });
    }
    const item = catalog.find(
      (entry) =>
        entry.id ===
        (target.dataset.detail ?? target.dataset.copy ?? target.dataset.review),
    );
    if (item && (target.dataset.detail || target.dataset.review)) {
      showDetail(item);
      if (target.dataset.review) {
        const record =
          document.querySelector<HTMLDetailsElement>("#review-record")!;
        record.open = true;
        record.querySelector<HTMLElement>("summary")!.focus();
        record.scrollIntoView({ block: "nearest", behavior: "instant" });
      }
    }
    if (item && target.dataset.copy) void copyCommand(item);
    if (target.classList.contains("close")) target.closest("dialog")?.close();
  });
  document
    .querySelector("#method-open")!
    .addEventListener("click", () =>
      document.querySelector<HTMLDialogElement>("#method")!.showModal(),
    );
  document.querySelector("#reset")!.addEventListener("click", () => {
    clearFilter("all");
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "/" &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(
        (event.target as HTMLElement).tagName,
      ) &&
      !document.querySelector("dialog[open]")
    ) {
      event.preventDefault();
      search.focus();
    }
  });
}
initFilters();
setupEvents();
setupFilterPicker(vendor, true);
setupFilterPicker(sort, false);
render();

setupDiscovery(showDetail, copyCommand);
setupCommunity();
setupDetailLinks(showDetail, notify);
setupDialogDismiss();
iconify();

setupTheme();
setupLanguage();

setupSharing();

/** 详情直达与分享链接：沿用 query 参数流程，保留关闭时清理状态。 */
import { sharePageUrl } from "./sharing";
import { t } from "./i18n";
import { catalog, type Entry } from "./catalog";

export function setupDetailLinks(
  open: (item: Entry) => void,
  notify: (message: string) => void,
): void {
  const detail = document.querySelector<HTMLDialogElement>("#detail")!;
  const initial =
    new URLSearchParams(location.search).get("tool") ??
    location.pathname.match(/\/tools\/([^/]+)\//)?.[1];
  const item = catalog.find((entry) => entry.id === initial);
  if (item) open(item);
  else if (initial) {
    const url = new URL(location.href);
    url.searchParams.delete("tool");
    history.replaceState(null, "", url);
    notify(t("这个工具尚未收录，可在目录中搜索或提交。"));
  }
  detail.addEventListener("close", () => {
    const url = new URL(location.href);
    url.searchParams.delete("tool");
    history.replaceState(null, "", url);
  });
  document
    .querySelector("#detail-share")!
    .addEventListener("click", async () => {
      try {
        const current = new URL(location.href);
        const id =
          current.searchParams.get("tool") ??
          current.pathname.match(/\/tools\/([^/]+)\//)?.[1];
        await navigator.clipboard.writeText(sharePageUrl(current, id).href);
        notify(t("已复制工具详情链接"));
      } catch {
        notify(t("无法访问剪贴板，请复制浏览器地址栏中的链接。"));
      }
    });
}

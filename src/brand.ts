/** 公开品牌规范的可操作演示，不加载目录指标或外部服务。 */
import { setupLanguage } from "./i18n";
import { t, msg } from "./i18n";
import { createIcons, Search } from "lucide";
import "./style.css";
import "./styles/brand.css";
import "./styles/brand-responsive.css";
import { setupTheme } from "./theme";
createIcons({ icons: { Search } });
let timer: ReturnType<typeof setTimeout>;
document.querySelector("#demo-toast")!.addEventListener("click", () => {
  const toast = document.querySelector<HTMLElement>("#toast")!;
  toast.textContent = t("这是反馈样式演示，未操作剪贴板。");
  toast.classList.add("visible");
  clearTimeout(timer);
  timer = setTimeout(() => toast.classList.remove("visible"), 2600);
});
document
  .querySelector<HTMLInputElement>("#demo-search")!
  .addEventListener("input", (event) => {
    const value = (event.target as HTMLInputElement).value;
    document.querySelector("#demo-result")!.textContent = value
      ? msg`关键词“${value}”已输入。实际结果请在目录中搜索。`
      : t("在目录中，筛选结果会同步到网址，方便分享。");
  });
document.querySelector("#motion-replay")!.addEventListener("click", (event) => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const tile = event.currentTarget as HTMLElement;
  const duration = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--slow"),
  );
  tile.getAnimations().forEach((animation) => animation.cancel());
  tile.animate(
    [
      { opacity: 0, transform: "translateY(12px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
  );
});

setupTheme();
setupLanguage();

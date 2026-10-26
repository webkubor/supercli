/** 页面流动反馈：顶部阅读进度条与滚动后的毛玻璃页头。
 *  进度只用 transform 缩放，不触发布局重排。 */

/** 滚动超过一屏后才显示进度条，避免短页出现无意义的横线。 */
export function setupScrollProgress(): void {
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  const header = document.querySelector<HTMLElement>(".header");
  let frame = 0;
  const update = () => {
    frame = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    bar.style.transform = `scaleX(${ratio})`;
    bar.classList.toggle("is-active", window.scrollY > 80);
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(update);
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  update();
}

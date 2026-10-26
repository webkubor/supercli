/** 操作反馈：复制状态、原生弹窗遮罩关闭及滚动锁定，保留 Escape 与焦点恢复。 */
import { t } from "./i18n";
const resets = new WeakMap<
  HTMLButtonElement,
  { timer: ReturnType<typeof setTimeout>; html: string; label: string | null }
>();
/** 切换预览对象时先恢复复制标签，避免旧计时器覆盖新工具名称。 */
export function resetCopyFeedback(button: HTMLButtonElement): void {
  const previous = resets.get(button);
  if (!previous) return;
  clearTimeout(previous.timer);
  button.innerHTML = previous.html;
  button.classList.remove("copy-success");
  if (previous.label === null) button.removeAttribute("aria-label");
  else button.setAttribute("aria-label", previous.label);
  resets.delete(button);
}
/** 在对应工具按钮上确认复制成功；连续点击复用同一份原始标签。 */
export function showCopySuccess(id: string): void {
  const buttons = [
    ...document.querySelectorAll<HTMLButtonElement>("[data-copy]"),
  ].filter((button) => button.dataset.copy === id);
  for (const button of buttons) {
    const previous = resets.get(button);
    if (previous) clearTimeout(previous.timer);
    const html = previous?.html ?? button.innerHTML;
    const label = previous ? previous.label : button.getAttribute("aria-label");
    // 保留图标结构，只切换图标与文字，不整体覆盖 innerHTML。
    const icon = button.querySelector<HTMLElement>(".terminal-copy-icon");
    const text = button.querySelector<HTMLElement>(".terminal-copy-label");
    if (icon && text) {
      icon.dataset.state = "success";
      text.textContent = t("已复制");
    } else {
      button.textContent = t("已复制");
    }
    button.classList.add("copy-success");
    button.setAttribute("aria-label", t("安装命令已复制"));
    const timer = setTimeout(() => resetCopyFeedback(button), 1800);
    resets.set(button, { timer, html, label });
  }
}
/** 只有按下和点击都发生在面板外时关闭，拖选正文到外部不误关。 */
export function setupDialogDismiss(): void {
  document.querySelectorAll<HTMLDialogElement>("dialog").forEach((dialog) => {
    let startedOutside = false;
    const outside = (event: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      );
    };
    dialog.addEventListener("pointerdown", (event) => {
      startedOutside = event.target === dialog && outside(event);
    });
    dialog.addEventListener("click", (event) => {
      if (startedOutside && event.target === dialog && outside(event))
        dialog.close();
      startedOutside = false;
    });
    dialog.addEventListener("close", () => {
      startedOutside = false;
    });
  });
}

/** 静态内容页的安装命令复制：按钮就地反馈，失败时保留命令供手动选择。 */
import { t } from "./i18n";
/** 复制成功后按钮短暂切换为成功态，结束后恢复原文与可访问名。 */
export function setupCommandCopy(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    "[data-copy-command]",
  );
  for (const button of buttons) {
    const command = button.dataset.copyCommand;
    if (!command) continue;
    const label = button.querySelector(".terminal-copy-label");
    const original = label?.textContent ?? button.textContent ?? "";
    const originalLabel = button.getAttribute("aria-label");
    let timer: ReturnType<typeof setTimeout> | undefined;
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(command);
        if (label) label.textContent = t("已复制");
        button.classList.add("copy-success");
        button.setAttribute("aria-label", t("安装命令已复制"));
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (label) label.textContent = original;
          button.classList.remove("copy-success");
          if (originalLabel) button.setAttribute("aria-label", originalLabel);
        }, 1800);
      } catch {
        // 剪贴板不可用时把命令选中文本，用户可手动复制，不需要刷新重试。
        const code = button
          .closest(".terminal-body")
          ?.querySelector(".terminal-line");
        if (code) {
          const range = document.createRange();
          range.selectNodeContents(code);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        button.classList.add("copy-failed");
        clearTimeout(timer);
        timer = setTimeout(
          () => button.classList.remove("copy-failed"),
          1800,
        );
      }
    });
  }
}

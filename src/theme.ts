/**
 * 主题切换：默认跟随系统，手动选择后写入 localStorage 并覆盖系统偏好。
 * 首屏防闪烁由各页面 <head> 的内联脚本负责，这里只管交互与持久化。
 */
type Theme = "light" | "dark";
const STORAGE_KEY = "supercli-theme";
const root = document.documentElement;

function stored(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function system(): Theme {
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** 当前实际生效的主题，用于按钮状态与无障碍标签。 */
export function currentTheme(): Theme {
  const explicit = root.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return system();
}

function apply(theme: Theme | null): void {
  if (theme) root.dataset.theme = theme;
  else delete root.dataset.theme;
  const active = currentTheme();
  for (const button of document.querySelectorAll<HTMLElement>(".theme-toggle")) {
    button.setAttribute("aria-pressed", String(active === "dark"));
    button.setAttribute(
      "aria-label",
      active === "dark" ? "切换到浅色模式" : "切换到深色模式",
    );
    button.setAttribute("title", active === "dark" ? "浅色" : "深色");
  }
}

const MOON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
const SUN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;

function mount(): void {
  const header = document.querySelector<HTMLElement>("header.header");
  if (!header || header.querySelector(".theme-toggle")) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  button.innerHTML = `${MOON}${SUN}`;
  button.addEventListener("click", () => {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* 隐私模式下无法持久化，本次会话内仍然生效。 */
    }
    apply(next);
  });
  header.append(button);
  apply(stored());
}

export function setupTheme(): void {
  mount();
  apply(stored());
  // 未手动选择时跟随系统变化。
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!stored()) apply(null);
  });
}

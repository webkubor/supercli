/**
 * 主题切换：默认跟随系统，手动选择后写入 localStorage 并覆盖系统偏好。
 * 首屏防闪烁由各页面 <head> 的内联脚本负责，这里只管交互与持久化。
 */
type Theme = "light" | "dark";
export type Accent = "green" | "pink";

const STORAGE_KEY = "supercli-theme";
const ACCENT_STORAGE_KEY = "supercli-accent";
const root = document.documentElement;

function stored(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function storedAccent(): Accent {
  try {
    const value = localStorage.getItem(ACCENT_STORAGE_KEY);
    return value === "pink" ? "pink" : "green";
  } catch {
    return "green";
  }
}

export function currentAccent(): Accent {
  const explicit = root.dataset.accent;
  if (explicit === "pink") return "pink";
  return "green";
}

export function applyAccent(accent: Accent): void {
  root.dataset.accent = accent;
  try {
    localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  } catch {
    /* 隐私模式下会话内生效 */
  }
  for (const button of document.querySelectorAll<HTMLElement>(".accent-toggle")) {
    const isPink = accent === "pink";
    button.setAttribute("aria-label", isPink ? "切换为极客绿" : "切换为赛博粉");
    button.setAttribute("title", isPink ? "当前赛博粉 (点击切极客绿)" : "当前极客绿 (点击切赛博粉)");
    button.dataset.currentAccent = accent;
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
const PALETTE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`;

function mount(): void {
  const header = document.querySelector<HTMLElement>("header.header");
  if (!header) return;

  // 极客配色切换胶囊（绿/粉）
  if (!header.querySelector(".accent-toggle")) {
    const accentButton = document.createElement("button");
    accentButton.type = "button";
    accentButton.className = "accent-toggle";
    accentButton.innerHTML = `<span class="accent-pip"></span>${PALETTE_ICON}`;
    accentButton.addEventListener("click", () => {
      const next: Accent = currentAccent() === "green" ? "pink" : "green";
      applyAccent(next);
    });
    header.append(accentButton);
  }

  // 明暗主题切换
  if (!header.querySelector(".theme-toggle")) {
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
  }

  apply(stored());
  applyAccent(storedAccent());
}

export function setupTheme(): void {
  mount();
  apply(stored());
  applyAccent(storedAccent());
  // 未手动选择时跟随系统变化。
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!stored()) apply(null);
  });
}

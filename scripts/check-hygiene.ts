/**
 * 收尾卫生门禁：拦住「实现与验收之间」最容易漏的生产事故。
 *
 * 三道检查全部机器可判，零依赖，进 build 链后无法绕过：
 *  1. 冲突标记：rebase/merge 解得不彻底会把 <<<<<<< 推上生产（0.7.0 实际事故）。
 *  2. 深色资产规则：删除/重构主题 CSS 时容易连带删掉深色适配
 *     （wordmark-dark 切换等，0.7.0 实际事故——深色 logo 隐形）。
 *     这类 :root[data-theme=dark] 规则没有「引用方」，靠引用扫描查不出来，
 *     所以改成断言「规则必须存在于构建产物中」。
 *  3. 终端/页面令牌在产物中仍各自成对：contrast.config.json 删了令牌名时
 *     contrast-guard 会静默跳过（假绿），这里从产物侧再数一遍兜底。
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";

const TEXT_EXT = /\.(md|css|ts|mjs|json|html|txt)$/;

/** 1) 全仓文本文件不得残留冲突标记。node_modules/dist/.git/log 除外。 */
function checkConflictMarkers(root: string): void {
  const skip = new Set(["node_modules", "dist", ".git", "log", ".local"]);
  const hits: string[] = [];
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(name.name) || name.name.startsWith(".")) continue;
      const full = join(dir, name.name);
      if (name.isDirectory()) {
        walk(full);
        continue;
      }
      if (!TEXT_EXT.test(name.name)) continue;
      const text = readFileSync(full, "utf8");
      if (/^(<{7}|={7}|>{7}) /m.test(text)) hits.push(full);
    }
  };
  walk(root);
  assert.deepEqual(
    hits,
    [],
    `以下文件残留冲突标记，解完冲突再提交：\n${hits.join("\n")}`,
  );
}

/** 2) 构建产物 CSS 必须包含深色资产适配关键规则。 */
function checkDarkAssets(distDir: string): void {
  const assets = join(distDir, "assets");
  let css = "";
  for (const name of readdirSync(assets))
    if (name.endsWith(".css")) css += readFileSync(join(assets, name), "utf8");
  // 压缩器会去掉属性引号（data-theme=dark），断言一律按无引号形态写。
  const required = [
    // 深色字标切换：删掉它深色下 logo 近乎隐形。
    /supercli-wordmark-dark\.svg/,
    // 暗底厂商图标衬底：纯黑 logo 在深底会融化。
    /:root\[data-theme=dark\][^{]*vendor-icon/,
    // 主题钮日/月切换。
    /\.theme-toggle svg:last-child/,
  ];
  const missing = required.filter((re) => !re.test(css)).map(String);
  assert.deepEqual(
    missing,
    [],
    `构建产物缺少深色适配规则（重构主题 CSS 时被删？）：${missing.join(", ")}。检查 src/styles/tokens-dark.css。`,
  );
}

/** 3) 双主题令牌成对出现在产物中，防止门禁配置漂移成假绿。 */
function checkThemeTokens(distDir: string): void {
  const assets = join(distDir, "assets");
  let css = "";
  for (const name of readdirSync(assets))
    if (name.endsWith(".css")) css += readFileSync(join(assets, name), "utf8");
  const tokens = ["--ink", "--accent", "--terminal-text", "--grid-dot"];
  const missing = tokens.filter(
    (token) => !css.includes(token) || css.split(token).length < 3,
  );
  assert.deepEqual(
    missing,
    [],
    `令牌 ${missing.join(", ")} 在产物中不足两处（浅/深各一），主题文件可能被删或改坏。`,
  );
}

const root = new URL("..", import.meta.url).pathname;
checkConflictMarkers(root);
checkDarkAssets(join(root, "dist"));
checkThemeTokens(join(root, "dist"));
console.log("Hygiene gates passed: no conflict markers, dark assets intact.");

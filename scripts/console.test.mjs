/** 首页命令台回归：重渲染后图标必须仍在，复制反馈必须到位。
 *  0.7.1 实际事故：console.ts 重渲染结果后没调 createIcons，
 *  <i data-lucide> 停在未转换状态，复制图标与工具图标整体消失。
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { setupConsole } from "../src/console.ts";

const consoleSource = readFileSync(
  new URL("../src/console.ts", import.meta.url),
  "utf8",
);

test("console re-renders icons after replacing result markup", () => {
  // 结果重渲染后必须重新转换 lucide 占位符，否则图标消失。
  assert.match(
    consoleSource,
    /results[!.a-zA-Z]*\.innerHTML\s*=\s*items/,
    "console 应通过 innerHTML 重渲染结果",
  );
  assert.match(
    consoleSource,
    /createIcons\(/,
    "console 重渲染后必须调用 createIcons 转换 <i data-lucide> 占位符",
  );
  // 转换必须发生在重渲染之后，而不是只在初始化时。
  const render = consoleSource.slice(
    consoleSource.indexOf("function render()"),
    consoleSource.indexOf("function render()") + 1200,
  );
  const innerAt = render.indexOf("innerHTML");
  const iconAt = render.indexOf("createIcons(");
  assert(innerAt >= 0 && iconAt >= 0, "render 内应有重渲染与图标转换");
  assert(iconAt > innerAt, "createIcons 必须在 innerHTML 重渲染之后调用");
});

test("console keeps the shared copy feedback contract", () => {
  // 复制反馈沿用 interaction-feedback 的 copy-success 类名，
  // CSS 若写成别的名字（如 .is-copied）图标就不会翻转。
  assert.match(
    consoleSource,
    /data-copy="\$\{escape\(item\.id\)\}"/,
    "命令台复制按钮应使用共享的 data-copy 属性",
  );
  assert.doesNotMatch(
    consoleSource,
    /is-copied/,
    "不要自造状态类名：共享反馈用 copy-success",
  );
});

test("console module keeps the DOM contract the homepage relies on", () => {
  for (const id of ["#console-input", "#console-results", "#console-count"])
    assert.match(consoleSource, new RegExp(id.replace("#", "\\#")));
  assert.equal(typeof setupConsole, "function");
});

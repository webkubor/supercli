/** 命令分词高亮：只按空白切分，保留原始字符，不改写命令本身。
 *  每个词带 --i 序号，供 CSS 做逐词点亮的错峰延迟。
 *  首页（客户端）与工具页（构建时）共用同一套实现。 */
import { escapeHtml as escape } from "./escape.ts";

/** 命令词的配色类别。 */
export type CommandTokenKind = "command" | "flag" | "value";

/** 切分命令并标注每段的类别；空白原样保留。 */
export function commandTokens(command: string): readonly {
  readonly text: string;
  readonly kind: CommandTokenKind | null;
}[] {
  return command.split(/(\s+)/).map((token) => {
    if (!token.trim()) return { text: token, kind: null };
    const kind: CommandTokenKind = token.startsWith("-")
      ? "flag"
      : token.includes("/") || token.includes("://")
        ? "value"
        : "command";
    return { text: token, kind };
  });
}

/** 渲染分色后的命令；词序与原文完全一致。 */
export function commandMarkup(command: string): string {
  let index = 0;
  return commandTokens(command)
    .map(({ text, kind }) => {
      if (!kind) return escape(text);
      const step = index++;
      return `<span class="term-${kind}" style="--i:${step}">${escape(text)}</span>`;
    })
    .join("");
}

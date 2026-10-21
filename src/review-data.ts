/** 核验记录与目录字段绑定：构建和浏览器共用，不依赖页面语言或 DOM。 */
import rawReviews from "../data/reviews.json" with { type: "json" };
import type { Entry } from "./catalog.ts";
/** 目录原始条目与浏览器条目共用的核验主体；来源类型由数据契约验证。 */
export type ReviewSubject = Omit<Entry, "maintainerType"> & {
  readonly maintainerType: string;
};
/** 人工核验记录；JSON 结构与执行环境约束由构建门禁验证。 */
export interface ReviewRecord {
  readonly id: string;
  readonly name: string;
  readonly vendor: string;
  readonly maintainerType: string;
  readonly description: string;
  readonly repo: string | null;
  readonly docs: string;
  readonly install: string | null;
  readonly reviewedAt: string;
  readonly reviewer: string;
  readonly evidence: string;
  readonly checks: readonly {
    readonly kind: string;
    readonly method: string;
    readonly reference: string;
    readonly note: string;
    readonly environment: string | null;
    readonly version: string | null;
  }[];
}
/** 经数据门禁校验的核验记录真源。 */
export const reviewRecords: readonly ReviewRecord[] = rawReviews;
/** 当前快照字段必须匹配核验时的目录内容，旧记录不能继续冒充有效。 */
export function reviewFor(
  item: ReviewSubject,
  candidates: readonly ReviewRecord[] = reviewRecords,
): ReviewRecord | null {
  return (
    candidates.find(
      (row) =>
        row.id === item.id &&
        row.repo === item.repo &&
        row.docs === item.docs &&
        row.install === item.install &&
        row.name === item.name &&
        row.vendor === item.vendor &&
        row.maintainerType === item.maintainerType &&
        row.description === item.description,
    ) ?? null
  );
}

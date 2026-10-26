/**
 * GitHub 用户快照：维护者与推荐者的公开资料（关注数、公开仓库数）。
 * 来源绑定 GitHub REST API，缺失取不到就是 null，绝不拿 0 冒充查询结果。
 */
import snapshot from "../data/contributors.json";

export interface ContributorSnapshot {
  readonly fetchedAt: string;
  readonly source: string;
  readonly users: Readonly<Record<string, ContributorProfile | null>>;
}

/** 单个 GitHub 用户的公开计数；null 表示该次抓取没有拿到可比数据。 */
export interface ContributorProfile {
  readonly login: string;
  readonly followers: number;
  readonly following: number;
  readonly publicRepos: number;
}

/** 经构建门禁校验的 GitHub 用户快照。 */
export const contributors: ContributorSnapshot = snapshot;

/** 快照里的用户资料；没有快照或该用户为空时返回 null。 */
export function contributorProfile(
  name: string,
  profiles: ContributorSnapshot = contributors,
): ContributorProfile | null {
  return profiles.users[name.toLowerCase()] ?? null;
}

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
  /** 本站静态目录里的头像文件名，格式随用户上传而定。 */
  readonly avatar: string;
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

/**
 * 署名者头像走本站静态目录，不走 GitHub 直链——直链对国内访客不可靠，
 * 整页碎图比没有头像更糟。文件由 sync-contributors 落盘、构建门禁校验。
 */
export function avatarPath(
  name: string,
  profiles: ContributorSnapshot = contributors,
): string {
  const profile = contributorProfile(name, profiles);
  return profile ? `/avatars/${profile.avatar}` : "";
}

/**
 * 手动刷新 GitHub 用户快照（关注数、公开仓库数）。
 * 抓取失败不写入：该用户记为 null，页面显示「暂无数据」，绝不用 0 冒充查询结果。
 */
import { readFile, writeFile, rename, access, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execute = promisify(execFile);
const community = JSON.parse(
  await readFile("data/community.json", "utf8"),
);
/** 出现在收录记录里的所有署名者：维护者与推荐者一起抓。 */
const logins = [
  ...new Set(
    community
      .flatMap((row) => [row.curatedBy, row.recommendedBy])
      .filter((name) => typeof name === "string")
      .map((name) => name.toLowerCase()),
  ),
].sort();
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "SuperCLI-directory",
};
if (process.env.GITHUB_TOKEN)
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
async function user(login) {
  if (process.argv.includes("--gh")) {
    const { stdout } = await execute("gh", ["api", `users/${login}`], {
      timeout: 30000,
    });
    return JSON.parse(stdout);
  }
  const response = await fetch(`https://api.github.com/users/${login}`, {
    headers,
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`${login}: GitHub ${response.status}`);
  return response.json();
}
async function withRetry(action, label) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await action();
    } catch (error) {
      if (attempt === 3) throw new Error(`${label}: ${error.message}`);
    }
  }
}
const users = {};
for (const login of logins) {
  try {
    const data = await withRetry(() => user(login), login);
    users[login] = {
      login: data.login,
      followers: data.followers,
      following: data.following,
      publicRepos: data.public_repos,
    };
    console.log(`${login}: ${data.followers} followers`);
  } catch (error) {
    console.warn(`${login}: 抓取失败，记为 null（${error.message}）`);
    users[login] = null;
  }
}
const snapshot = {
  fetchedAt: new Date().toISOString(),
  source: "GitHub REST API /users/{login}",
  users,
};
const temporary = `data/.contributors-${randomUUID()}.tmp`;
try {
  await writeFile(temporary, JSON.stringify(snapshot, null, 2) + "\n", {
    flag: "wx",
  });
  await rename(temporary, "data/contributors.json");
} finally {
  await unlink(temporary).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
}
await access("data/contributors.json");
console.log(`Wrote ${Object.keys(users).length} GitHub user profiles.`);

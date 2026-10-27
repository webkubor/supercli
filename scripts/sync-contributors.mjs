/**
 * 手动刷新 GitHub 用户快照（关注数、公开仓库数）与署名者头像。
 * 数据抓取失败记为 null，页面显示「未取到」，绝不用 0 冒充查询结果；
 * 头像下载到本站静态目录——GitHub 头像直链对国内访客不可靠，
 * 直链挂了整页都是碎图。
 */
import { readFile, writeFile, rename, access, unlink, mkdir, lstat } from "node:fs/promises";
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
/** 头像格式随用户上传而定（PNG/JPEG/WebP/GIF），按魔数判定真实扩展名。 */
const MAGIC = [
  ["png", "89504e470d0a1a0a"],
  ["jpg", "ffd8ff"],
  ["webp", "52494646"],
  ["gif", "47494638"],
];
const EXTENSIONS = MAGIC.map(([ext]) => ext);
function imageExtension(buffer) {
  const hex = buffer.subarray(0, 12).toString("hex");
  for (const [ext, magic] of MAGIC) if (hex.startsWith(magic)) return ext;
  throw new Error("响应不是受支持的图片格式");
}
/** 联网前拒绝符号链接：头像目录与目标文件都不允许被劫持写入。 */
async function validateAvatarPaths() {
  const dir = "public/avatars";
  try {
    const info = await lstat(dir);
    if (info.isSymbolicLink())
      throw new Error(`头像目录禁止符号链接: ${dir}`);
    if (!info.isDirectory()) throw new Error(`头像目录不是目录: ${dir}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await mkdir(dir, { recursive: true });
  }
  for (const login of logins)
    for (const ext of EXTENSIONS) {
      const path = `public/avatars/${login}.${ext}`;
      try {
        const info = await lstat(path);
        if (info.isSymbolicLink())
          throw new Error(`头像路径禁止符号链接: ${path}`);
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
}
await validateAvatarPaths();
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
/** 已存在的头像直接复用文件名；下载必须校验魔数再排他写入。 */
async function downloadAvatar(login, avatarUrl) {
  for (const ext of EXTENSIONS) {
    try {
      await access(`public/avatars/${login}.${ext}`);
      return `${login}.${ext}`;
    } catch {
      /* 未命中继续找。 */
    }
  }
  const response = await withRetry(
    () => fetch(`${avatarUrl}&s=96`, { signal: AbortSignal.timeout(20000) }),
    `Avatar ${login}`,
  );
  if (!response.ok) throw new Error(`Avatar ${login}: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const ext = imageExtension(buffer);
  const path = `public/avatars/${login}.${ext}`;
  await writeFile(path, buffer, { flag: "wx" });
  return `${login}.${ext}`;
}
const users = {};
for (const login of logins) {
  try {
    const data = await withRetry(() => user(login), login);
    const avatar = await downloadAvatar(login, data.avatar_url);
    users[login] = {
      login: data.login,
      followers: data.followers,
      following: data.following,
      publicRepos: data.public_repos,
      avatar,
    };
    console.log(`${login}: ${data.followers} followers · ${avatar}`);
  } catch (error) {
    // 任一字段抓取失败记 null：构建门禁会拦下缺失头像，提示重跑同步。
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

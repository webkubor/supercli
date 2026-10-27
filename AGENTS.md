# SuperCLI 开发与审核

这是社区维护的 CLI 发现与排行静态站，使用 Vite + TypeScript，部署到 Cloudflare Pages。

## 本地命令

- Node 24+，pnpm 12.4。
- `pnpm install --frozen-lockfile` 安装依赖。
- `pnpm dev` 启动本地预览；`pnpm build` 执行类型、数据、测试检查并构建。
- `pnpm test` 跑行为及安全回归；`pnpm typecheck` 检查类型。
- `node scripts/sync.mjs --gh --icons` 手动刷新 GitHub 指标，需本机已登录 gh。
- `node scripts/sync-contributors.mjs --gh` 手动刷新 GitHub 用户快照（关注数等）与署名者头像（落到 public/avatars/）。

## 真源与边界

- `data/catalog.json`：收录条目的唯一真源；`data/categories.json`：分类。
- `data/metrics.json`：带 repo 来源绑定的 GitHub 快照；没有可比仓库的工具为 null，不能编造 Stars。
- `data/contributors.json`：带来源绑定的 GitHub 用户快照；取不到就是 null，不能用 0 冒充关注数。署名者头像本地化到 `public/avatars/`，不走 GitHub 直链；缺头像文件会拦构建。
- `data/recommendations.json`：推荐官评语，逐条绑定工具、推荐者与原帖 Issue；署名须与 `data/community.json` 的 `recommendedBy` 一致，无真实投稿原文就不写评语。
- 数据契约为 `data/*.schema.json`，验证入口 `scripts/validation.mjs`；同步必须先验证输入再联网或写盘。
- HTML 文本和属性须转义；图标写入须保留路径、符号链接和排他写入保护。
- 厂商图标来源见 `docs/ICONS.md`，保留原品牌几何，不用通用图标冒充厂商。
- `.local/`、凭据、个人安装路径与运行日志不提交。

## 审核与发布

owner 发起的本仓改动，完成本地质量门禁和必要的浏览器验收后直接合入 main，无需创建 PR 或等待 PR 审核。社区外部投稿仍由维护者本地核验、人工批准、手动合并。不要添加自动审核、自动批准、自动合并或定时任务。

只发布已验证 main。main 合并后自动构建、部署并验证线上版本；保留人工触发入口，具体运行与验收要求见 `docs/REVIEW.md`、`docs/DEPLOYMENT.md`。完成发布后必须验证真实页面和关键交互。

<!-- agent-eyes:begin -->
## 运行时视野（vite-plugin-agent-eyes 自动维护，勿手改此块）

本项目 dev 期把**真实**请求/响应、报错、控制台、交互轨迹写到 `log/`。
**排查前端/接口/登录/样式问题前先读它，不要从源码或类型定义反推。**

```bash
ls log/                        # 有哪些端口在跑
cat log/<port>/api-calls.log   # 真实请求体 + 响应体
cat log/<port>/errors.log      # 报错（聚合去重，最新在最上）
```

| 想知道 | 读哪个 |
|---|---|
| 接口返回什么字段、值是什么 | `<port>/api-calls.log` ← **字段真源，类型定义和注释都不是** |
| 哪里报错了 | `<port>/errors.log` |
| 用户点了什么才出错 | `<port>/interaction.log` |
| 登录/cookie/CORS/302 | `<port>/proxy-<host>.log` |
| 当前登录的是谁 | `<port>/auth-state.json`（脱敏画像，无 token） |
| 页面长什么样 | `<port>/snapshots/`（PNG + DOM 快照） |
| 提交被门禁拦了 | `log/guard-report.json` |

注意：大响应体在日志里会被截断，整份 JSON 解析会失败，按单个 item 的花括号配平解析。
日志每次 dev 启动清空，看到的就是本次。改完 vite 配置要重启 dev 再验。
完整说明见 `log/README.md` 与 `node_modules/vite-plugin-agent-eyes/AGENT_GUIDE.md`。
<!-- agent-eyes:end -->

# 社区投稿与收录维护

## 数据与角色

- `data/catalog.json`：工具信息。
- `data/community.json`：每个工具一条收录记录，id 对应目录；构建检查覆盖完整性。
- `data/recommendations.json`：推荐官评语，每条绑定工具、推荐者与原帖 Issue；只收录明确同意公开署名的投稿。
- `data/contributors.json`：GitHub 用户快照（关注数等），供维护者终端面板展示。
- `addedAt`：工具实际进入本站目录的 ISO 时间，不随上游更新或文字修正改变。
- `curatedBy`：核验并维护该条目的 GitHub 用户名。
- `recommendedBy`：明确同意公开署名的推荐者用户名；无推荐者或未同意则为 null。
- `evidence`：本仓 Issue、PR 或完整 SHA 的 commit 链接。推荐者必须有 Issue/PR 依据。

历史 90 个条目按首次提交 3c4e05a 的时间恢复，curatedBy=webkubor、recommendedBy=null。最近收录按 addedAt 倒序，同批按 id 稳定排列；维护者和推荐者分别统计。修正旧条目不能刷新收录时间或抢占原推荐者署名。

## 推荐官评语

评语正文照抄投稿 Issue 里的「为什么推荐？」原文，不做润色、不代写。`data/recommendations.json` 的每条记录必须满足：

- `id` 指向目录内的工具；
- `curator` 与 `data/community.json` 里该工具的 `recommendedBy` 完全一致；
- `evidence` 是该工具的收录依据，且必须是本站 Issue 链接。

这三条由构建门禁（`scripts/community-people-validation.mjs`）机器校验：署名对不上、出处不是本站 Issue、工具不在目录内，都会让 `pnpm build` 失败。英文版评语放在 `data/recommendations.en.json`，同样要求逐条覆盖且不夹带中文。

没有推荐语的工具就不出现在评语轮播里——不写通用评语、不复用他人评价。

## 维护者关注数

`data/contributors.json` 是 GitHub 用户 API（`/users/{login}`）的抓取快照，记录 followers、following、publicRepos。刷新命令：`node scripts/sync-contributors.mjs --gh`（需本机已登录 gh）。

- 快照必须覆盖 `data/community.json` 里出现的全部署名者（维护者与推荐者），缺一个就构建失败。
- 抓取失败的单个用户记为 `null`，页面显示「关注数未取到」，不用 0 冒充查询结果。
- 关注数不是实时值，面板脚注标明来源与抓取日期。

## 人工操作顺序

1. 表单默认“待核验”。核对来源、重复条目、用途；如需补充，移除待核验并添加“需补充信息”，清楚列出缺失内容。
2. 用户补充后恢复待核验。拒绝或重复建议给出原因、关联记录并关闭；不标为已收录。
3. 对通过的建议整理目录、来源、图标和安装说明；记录实际 Issue/PR 链接。查表单署名选择，未经明确同意不填 recommendedBy。
4. 在隔离分支维护数据并本地 `pnpm build`、浏览器验收。PR 经人工审核后手动合并，main 工作流自动构建并部署。
5. 验证线上详情、推荐者署名及出处，才移除其他待办状态、添加“已收录”；在原投稿回复 `https://supercli.site/?tool=<id>`，再关闭。合并但未上线不得提前标已收录。

Issue 回复、PR 审核和状态处理仍由维护者执行。本站不实现自动审批、自动回复、自动合并或定时审核。所有用户可在 GitHub 原投稿订阅通知。

## 登录边界

首期由 GitHub Issue / PR 承载登录、作者身份与通知。不申请本站 OAuth，不保存访问令牌、不读取私有仓库。以后引入站内投稿或个人收藏时，另行设计最小权限 OAuth、会话与隐私流程。

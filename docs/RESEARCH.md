# 参考项目与取舍

核对日期：2026-10-20。参考结构和工作流，未复制第三方目录内容或代码。

| 项目 | 借鉴 | SuperCLI 的取舍 |
| --- | --- | --- |
| [awesome-cli-apps](https://github.com/agarrharr/awesome-cli-apps) | 按用途分类、简短用途描述、PR 维护 | 首版保留七个可浏览分类，提供搜索与厂商筛选 |
| [cli-apps](https://github.com/toolleeo/cli-apps) | 结构化记录，目录数据与展示分开 | JSON 单一真源，字段校验、重复校验，视图由同一份数据生成 |
| [modern-unix](https://github.com/ibraheemdev/modern-unix) | 说明工具解决什么问题 | 每条描述讲实际用途，详情提供命令、文档和上游源码 |
| [awesome-dsh-plugins](https://github.com/kejixiaoliang/awesome-dsh-plugins) | 用户既有社区项目，搜索、分类、安装命令与 PR 收录 | 保留熟悉的贡献方式；本地审核时同步指标并构建预览，确认后手动发布 |

## 排名数据

GitHub REST `GET /repos/{owner}/{repo}`。默认按 stargazers_count 降序、名称打破平局；最近更新按 pushed_at。界面显示数据快照时间。不以 Stars 冒充用户数、下载量或质量评分。

Wrangler 对应 cloudflare/workers-sdk，Vercel 对应 vercel/vercel，数字是整个仓库的数据，不是单一 CLI 的使用量。首版不计算无法可靠验证的增长趋势。

## 图标

通过官方仓库的 owner.avatar_url 获取官方组织或维护者头像，缓存为 public/icons/*.png。云厂商条目使用 Cloudflare、TencentCloud、aliyun、aws、Azure 等官方组织来源。每个映射见 docs/ICONS.md。头像不代表赞助、背书或官方合作；商标归各权利人所有。

## 收录范围

以本机已装工具为起点，允许通过官方文档核验的非 GitHub CLI；此类工具标记未计分。GitLab CLI 使用现行官方 GitLab 来源，不使用旧 GitHub 镜像。cf 的官方仓库为 cloudflare/cf、npm 包名 cf。

## 本机来源盘点

以 `cs cli scan --json`、`cs cli discover --json`、`brew leaves` 与可执行文件查找交叉核验；用户级工具优先，不把每个运行时依赖或配套子命令重复当成独立产品。私有安装路径、账号、凭据与内部脚本原文不进入公开仓库。

原始扫描与尚未识别的个人脚本存于 git 忽略的 `.local/`，用于后续本地人工审核。`locallyInstalled` 为建站时的安装存在性快照，不表示每个功能已运行测试，也不表示访客机器已安装。

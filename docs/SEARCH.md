# 双语、SEO 与 GEO

本站提供独立中文 `/` 与英文 `/en/`，标准和品牌页也有对应语言版本。语言 URL 保留筛选、排序和当前工具；不按浏览器语言强制重定向。

## 当前实现

- `data/catalog.json` 保持收录事实真源；`data/catalog.en.json` 按稳定 ID 提供英文说明。新增工具必须同时补齐英文说明，测试检查完整性。
- `data/ui.en.json` 翻译界面静态片段；模板插值不进入翻译过程，继续保留外部信息的 HTML 转义。核验记录保持原文绑定，展示翻译不改变核验结论。
- 构建输出双语目录、标准、品牌与独立工具页；正文、标题、摘要、canonical、双向 hreflang、JSON-LD 均在静态 HTML 中。目录运行后仍保留真正的工具链接，支持爬取与新标签页打开。
- 每个工具有 `/tools/<id>/` 和 `/en/tools/<id>/`，X 分享及详情复制使用这些链接。筛选 URL 的 canonical 指向对应语言主页面。
- X 分享打开可编辑的发布页，由用户确认发送。Open Graph / Twitter 元信息使用 1200×630 PNG，来自仓库已有品牌 SVG。
- `/sitemap.xml` 自动生成全部双语页面；`/catalog.json` 提供双语用途、原始来源、核验范围和数据快照时间；`/llms.txt` 提供补充检索入口。机器索引不导出本机安装状态。
- `pnpm build` 校验全部静态路径、语言标记、canonical、分享元信息、JSON-LD、图片与脚本资产。
- 三个中英文场景指南覆盖 AI 编程、云端部署、终端效率，按任务比较 9 个目录工具，说明使用前提与限制，并附官方资料和核对日期。首页场景入口、指南之间及指南到工具详情均使用真实链接。
- 指南内容真源为 `data/guides.json`，契约为 `data/guides.schema.json`；构建拒绝缺失翻译、重复路径、未知工具及非官方 HTTPS 来源。指南正文直接输出到静态 HTML，Article 结构化数据引用同一份正文标题、日期和出处。

## 场景内容入口

| 场景 | 中文 | English |
| --- | --- | --- |
| AI 编程 | [/guides/ai-coding/](https://supercli.site/guides/ai-coding/) | [/en/guides/ai-coding/](https://supercli.site/en/guides/ai-coding/) |
| 云端部署 | [/guides/cloud-deployment/](https://supercli.site/guides/cloud-deployment/) | [/en/guides/cloud-deployment/](https://supercli.site/en/guides/cloud-deployment/) |
| 终端效率 | [/guides/terminal-productivity/](https://supercli.site/guides/terminal-productivity/) | [/en/guides/terminal-productivity/](https://supercli.site/en/guides/terminal-productivity/) |

2026-10-21 核对首版官方资料。指南属于编辑选型建议，未将文档核对写成独立安装实测，也未修改 `data/reviews.json` 的既有记录。新增六个语言页面后，构建站点地图包含 194 个网址，公开目录 JSON 与 llms.txt 同步列出指南。下方 GSC 188 页为首次提交时的读取记录，新版本被 Google 重新读取和收录的情况须另行确认。

## 后续优先级与验收

1. owner 发起的改动验收后直接合入 main；社区外部投稿经人工审核后合并。部署后验证线上双语页面、工具分享页、PNG、站点地图、robots.txt 与机器索引均可访问，且 Cloudflare 未拦截爬虫。本地构建成功不代表已上线。
2. Google Search Console 域名验证与站点地图提交已完成，结果见下方记录。后续抽查中英文首页和工具页的抓取、canonical 与索引状态；站点地图读取成功不等于网页已被索引。
3. 使用真实任务意图补充内容：按工具逐条核对平台、依赖、账号及费用前提，公开出处与核验时间，再制作有依据的比较和场景页面。避免批量生成无来源页面。
4. 记录上线基线，观察 Search Console 的曝光、点击、查询、国家和语言页面分布。GEO 使用固定问题集抽查答案是否引用本站、引用哪个工具页、内容是否准确；区分“可抓取”和“已被引用”。

## Search Console 提交记录

2026-10-21（Asia/Taipei）完成以下操作：

- 资源：`sc-domain:supercli.site`，覆盖整个域名；Google 界面确认“已完成所有权验证”。
- 验证方式：域名提供商 DNS TXT。在 Cloudflare 新增独立的 Google 验证记录，已从权威 DNS 与 Google 公共 DNS 回读；保持该记录以维持验证状态，验证值不写入仓库。
- 已提交：`https://supercli.site/sitemap.xml`。Google 界面确认“已成功提交站点地图”，列表显示状态“成功”、已发现网页 **188**、已发现视频 **0**；提交与上次读取日期均为 2026-10-21。
- `robots.txt` 已声明该站点地图，线上 XML 返回 200，包含 188 个双语网址。
- 当前索引与效果报告提示“正在处理数据，请过 1 天左右再来查看”；尚未确认网页索引数量、搜索曝光或 AI 引用效果。

回读入口：[Search Console 站点地图](https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Asupercli.site)。后续内容更新由构建自动刷新同一站点地图地址，无需因每次新增工具而重复添加资源。

## 首轮网址检查与索引基线

2026-10-21（Asia/Taipei），通过 GSC 网址检查和“测试实际网址”抽查：

| 页面 | Google 索引报告 | 实际网址测试 | 收录推进方式 |
| --- | --- | --- | --- |
| `https://supercli.site/` | 已发现，尚未编入索引 | 可编入索引 | 索引请求已被接受，进入优先抓取队列 |
| `https://supercli.site/en/` | 已发现，尚未编入索引 | 可编入索引 | 索引请求已被接受，进入优先抓取队列 |
| `https://supercli.site/tools/wrangler/` | 已发现，尚未编入索引 | 可编入索引 | 通过已成功读取的站点地图发现 |
| `https://supercli.site/en/tools/wrangler/` | 已发现，尚未编入索引 | 可编入索引 | 通过已成功读取的站点地图发现 |

四页线上均返回 200，没有 `noindex` 或 `X-Robots-Tag` 限制；canonical 指向各自页面，hreflang 正确互指中英文版本。Google 检查工具智能手机版实际测试均显示允许抓取、网页抓取成功、允许编入索引，识别到的用户声明 canonical 与被检页面一致。

这些结果说明抽查页可以被 Google 抓取和编入索引，不表示已经收录。Google 最终选择的 canonical 要等索引后才能确认。检查时索引报告尚无历史抓取时间，四个样本都来自已提交站点地图；全站索引数量、曝光和点击报告仍在处理，不能记作 0，也不能将四个样本外推为全站已完成索引检查。首页请求已成功提交，不重复提交同一网址。

Google 的 AI Overviews / AI Mode 沿用 SEO 基础要求，不要求专用 AI 文件或特殊结构化标记；`llms.txt` 仅是补充发现入口，不作为排名或 AI 引用承诺。结构化数据应与可见正文一致。

参考：[Google 多语言版本规范](https://developers.google.com/search/docs/specialty/international/localized-versions)、[Google AI 功能与站点规范](https://developers.google.com/search/docs/appearance/ai-features)。

## 2026-10-21 第二轮：工具页静态正文

- 发现的问题：工具 URL 复用首页模板，仅静态展示简短介绍与官方文档，脚本加载后显示整个目录并自动弹出工具详情。
- 调整：91 个工具的中英文独立页改用现有内容页外壳，输出用途、维护来源、目录安装命令或明确的缺失说明、官方文档与源码链接、绑定当前目录字段的核验范围和原始依据。全部正文无需 JavaScript 即可读取；不新增虚构工具事实或安装实测结论。
- 相关工具返回对应场景指南，形成工具与指南的双向链接；保留交互详情和指标入口及 X 分享。双语 URL、canonical、hreflang、站点地图地址与总计 194 个网址保持一致。
- 本轮 GSC 回读：站点地图仍显示“成功”、发现 188 页；效果与索引报告仍提示处理数据。线上地图中的 194 个网址不等于 GSC 已重新读取或实际收录数量。不重复提交首页索引请求。
- 验证要求：全量静态页面、双语正文、命令缺失、核验字段变化失效、HTML 转义及分享链接回归；浏览器抽查桌面与移动端、语言切换和交互详情入口。部署版本与线上实页须在本轮交付时另行核对。
- 推广文案：[X 草稿](promotion/2026-10-21-x-draft.md)，仅保存，未发布。

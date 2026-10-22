# supercli UI 审核 · 以 CS 系统为基准

> 审核对象：`~/dev/agent-infra/supercli`（v0.6.0）
> 基准：`~/dev/CortexOS` 的两套面向人的 UI —— `cmd/templates/task-watch.html`（调度看板，深色）与 `templates/weekly-report.html`（周报，浅色）
> 方法：读全量设计令牌 + 实算对比度，不靠印象
> 日期：2026-10-22

---

## 0. 先说结论

**supercli 与 CS 系统的设计语言高度同源，且在可访问性、主题完整性上已经超过基准。**

基础字号（14px）、行高（1.6）、圆角（8px）、无阴影分层、等宽数字、单一强调色——这几条是两套系统的共同底盘，supercli 全部对齐。

真正的差距只有 **3 处**，其中 1 处是硬伤（字体栈）。反过来，**基准本身有 6 处问题**，包括一个 WCAG 不达标的对比度。

---

## 1. 从 CS 系统提取的 6 条设计原则

| # | 原则 | 代码依据 |
|---|---|---|
| 1 | **数据优先**：先给数字摘要，再给明细 | 看板顶部 `.sum` 四个数字卡（22px 数字 + 11px 标签）在表格之前 |
| 2 | **判据单一真源**：前端不重写后端逻辑 | 注释明写「判据复用 `liveState()`，与 `cs task ls` 同一份判据，不在前端重写」 |
| 3 | **状态语义固定色相**：不跟主题族走 | `--ok/--warn/--bad/--idle` 独立于主题 |
| 4 | **紧凑**：14px/1.6，表头 11px，行内边距 10px | `body{font:14px/1.6}`、`th{font-size:11px}`、`td{padding:10px 12px}` |
| 5 | **无装饰**：不靠阴影、渐变、大圆角分层 | 全靠 1px 边框 + 底色差 |
| 6 | **窄栏单列**：长文限制行宽 | 周报 `max-width:680px` |

---

## 2. 逐项对照

### 2.1 已对齐（supercli 符合基准）

| 项 | CS 系统 | supercli | 判定 |
|---|---|---|---|
| 基础字号 | 14px | 14px | ✅ 完全一致 |
| 基础行高 | 1.6 | 1.6 | ✅ 完全一致 |
| 圆角 | 8px | `--radius: 8px` | ✅ 完全一致 |
| 深色页面底 | `#0f1115` | `#0b0d12` | ✅ 同一族，几乎撞色 |
| 深色分隔线 | `#262b36` | `#252a34` | ✅ 几乎一致 |
| 单一强调色 | 周报只有一支蓝 | 只有 Klein Blue | ✅ 一致 |
| 等宽数字 | `code` 独立底色 | `tabular-nums` | ✅ 一致 |
| 无阴影分层 | 深色下无阴影 | v0.6 深色下已去掉 | ✅ 一致 |
| 语义色不跟主题 | ok/warn/bad/idle 固定 | `--success` 固定 | ✅ 方向一致 |

### 2.2 差距（按优先级）

#### 🔴 P1 · 字体栈缺系统 UI 字体与 Windows 中文回退

```css
/* supercli 现状 */
font-family: "Helvetica Neue", Arial, "PingFang SC", sans-serif;

/* CS 看板 */
font: 14px/1.6 -apple-system, "PingFang SC", "Helvetica Neue", sans-serif;

/* CS 周报（更完整） */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
             'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
```

三个具体问题：

1. **缺 `-apple-system` / `system-ui`**：macOS 上拉丁字母会先命中 Helvetica Neue，而不是系统 UI 字体（SF Pro）。和 iOS/Android 原生界面放在一起会显得「不是同一个系统出来的」。
2. **`Arial` 排在 `"PingFang SC"` 之前**：中英混排时数字与拉丁走 Arial、汉字走 PingFang，两者基线和高度的视觉重量不匹配。
3. **缺 Windows 中文回退**：没有 `Microsoft YaHei`。Windows 上若未装 PingFang 会掉到 `sans-serif` 默认（可能是宋体），整个中文界面会垮掉。

**改法**：直接采用 CS 周报那条完整栈。

#### 🟡 P2 · 分类标签比基准更弱

| | CS 状态标签 | supercli 分类标签 |
|---|---|---|
| 字号 | 11px | **10px** |
| 字重 | 600 | 400（继承） |
| 形状 | pill（99px 圆角） | 4px 圆角 |
| 底色 | 同色系 16% alpha | 中性 `--surface` |
| 文字色 | 同色系 | 中性 `--muted` |

对比度 `#62626c / #f7f7f8` 实算 **5.63:1**，达标。但 **10px 是这套 UI 里最小的字**，在 1x 屏上接近可读下限。

需要注意：supercli 的分类标签是**中性语义**（表示用途分类，不表示状态），所以不该照搬 CS 的同色底——那会让 7 个分类变成 7 种颜色，违背「标签不表示质量」的原则。**只建议把字号提到 11px、字重到 500**，与基准对齐。

#### 🟢 P3 · 语义状态色不完整

CS 有 `good / warning / error / neutral` 四组 + 各自 surface（共 8 个令牌）。supercli 只有一支 `--success: #a4d7b1`，没有 warning / error。

**但这不算硬伤**：supercli 是静态目录，没有表单校验、没有失败重试，当前确实用不到 warning/error。真要做，等出现真实错误态再加，不要提前造令牌。

### 2.3 supercli 强于基准的地方

| 项 | CS 系统 | supercli |
|---|---|---|
| 深色 / 浅色 | 看板只有深色、周报只有浅色，两套互不相通 | 同一套令牌，深浅双主题 + 跟随系统 |
| 动效 | 完全没有 | 3 档时长 + 统一曲线 + `prefers-reduced-motion` 全量降级 |
| 尺度体系 | 硬编码数值散落 | 间距 4 的倍数、圆角 3 档、时长 3 档，全部令牌化 |
| 触控命中区 | 未定义 | 44px 下限（「加载更多」实测 44px） |
| 对比度 | 无配置 | `contrast.config.json`，54 组（含深色 27 组） |
| 分层手法 | 仅边框 | 边框 + 玻璃 backdrop（看板无） |

---

## 3. 基准自身的问题（用它的标准之前要先校准）

既然拿 CS 系统当尺子，尺子本身也得准。审核中发现 6 处：

### 3.1 🔴 周报 footer 对比度不达标

```css
.footer { color: #999; }   /* on #fff = 2.85:1 */
```

WCAG AA 要求正文 4.5:1。**2.85:1 是明确不达标**，老人或低亮度屏上几乎看不清。建议改 `#6b6b73`（5.28:1，与 supercli 的 `--faint` 同值）。

### 3.2 🔴 看板表格窄屏溢出

固定列宽合计 `120 + 70 + 86 + 130 + 70 = 476px`，加上任务列，**没有 `overflow-x` 容器**。375px 宽的手机上必然横向溢出，且 `body{padding:28px}` 会再吃掉 56px。

建议：包一层 `.table-scroll{overflow-x:auto}`，并给 `table{min-width:560px}`。

### 3.3 🟡 中文表头套了英文排版规则

```css
th { text-transform: uppercase; letter-spacing: .04em; }
```

表头全是中文（实况 / 优先级 / 阶段 / 属主 / 心跳 / 任务）。`uppercase` 对汉字无效，是死代码；`letter-spacing` 加在汉字上会让词内字距松散，中文排版里通常要避免。

建议：删掉 `text-transform`，`letter-spacing` 改 `0`。

### 3.4 🟡 表格语义不完整

`<th>` 没有 `scope="col"`，表格没有 `<caption>`。屏幕阅读器无法把单元格关联到表头。

### 3.5 🟡 死样式

`a{color:var(--idle)}` 但整份标记里没有任何 `<a>`。周报的 `.section li strong{color:#111}` 与 body `#333` 差异过小（12.63 vs 12.63 量级），强调效果基本看不出来。

### 3.6 🟡 两套 UI 的字体栈不一致 + 人名硬编码

看板与周报用了两条不同的字体栈（前者 `-apple-system` 打头，后者更完整）。同属一个系统，应统一。

周报 footer 写死「此邮件由栖洲的 AI 助手小楠自动发送」——**人名硬编码在模板里**，换人或换场景就要改模板。应做成占位符。

---

## 4. 可执行清单

### supercli

| 优先级 | 改动 | 文件 |
|---|---|---|
| P1 | 字体栈换成 `-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif` | `src/styles/base.css:28` |
| P2 | 分类标签 10px → 11px，字重 → 500 | `src/styles/directory.css:171` |
| — | 语义 warning/error 暂不加（当前无错误态） | — |

### CS 系统（顺带）

| 优先级 | 改动 | 文件 |
|---|---|---|
| P1 | footer `#999` → `#6b6b73` | `templates/weekly-report.html:71` |
| P1 | 表格包 `overflow-x:auto`，`table{min-width:560px}` | `cmd/templates/task-watch.html:22` |
| P2 | 删 `th{text-transform:uppercase}`，`letter-spacing` 归零 | `cmd/templates/task-watch.html:25` |
| P2 | 补 `th scope="col"` 与 `<caption>` | 同上 |
| P3 | 统一两条字体栈 | 两个模板 |
| P3 | footer 人名改占位符 | `templates/weekly-report.html:111` |

---

## 5. 说明

- **本次未做视觉截图比对**：ego-lite 浏览器窗口处于最小化状态，`page.screenshot()` 报 `Cannot capture a screenshot while the window is minimized`，CDP 的 `Browser.setWindowBounds` 也拿不到窗口句柄（`Browser window not found`）。本报告的全部结论来自**设计令牌实算 + 模板结构分析**，不依赖截图。
- 待窗口还原后可补做视觉比对，重点看：深色下两套系统的层次感是否真的同源、supercli 的 hero 留白在 1280 宽下是否偏松。
- 对比度按 WCAG 2.1 相对亮度公式实算，阈值取 AA 正文 4.5:1。

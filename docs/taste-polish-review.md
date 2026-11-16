# React / Solid Taste 精修与 Unslop 检查

## 结果与范围

本轮是组件工作台精修，不是营销页改版。修改共享 CSS、两端 Demo 外壳与回归测试；
不修改组件 API、七套主题适配层、主题生成算法、持久化或浮层作用域机制。

Taste 最后一次自动门禁结果为 **`GATE: OPEN 38 (rounds used up)`，不是 PASS**。
脚本的落地页约束与组件工作台不完全相容，详细结果见下文。没有修改检查器、
隐藏页面内容、重置轮次或添加批量豁免。

## 方向与历史依据

软件 / 开发者工具：检索组件 → 操作样本 → 比较风格 → 复制框架原生代码。
性格是准确、可操作、有材料差异；真实组件是视觉主体，目录与配置不抢样本。
文案沿用技术说明语气，以组件、状态、主题和代码为固定术语，不新增宣传性承诺。

已读取 Delta 中的品牌动效、Demo 精修、Endfield 和 Solid 实现线程。室内变体历史
无法加载，以已提交的 [鹤坡记录](hepo-review.md)、
[室内记录](hepo-interior-review.md) 和 [Endfield 记录](endfield-review.md) 补充依据。

| 风格      | 本轮保留的设计意图                                         |
| --------- | ---------------------------------------------------------- |
| Clean     | 紫黄真实品牌、同源低彩度表面、圆润操作                     |
| Endfield  | 工程灰、信号黄、矩形控件、炭灰工具区；不加假遥测或游戏资产 |
| 鹤坡      | 石白、黛青、浅木色，宋体标题与黑体控件并置                 |
| 鹤坡·室内 | 暖石白、红木、浅香槟；深色不退回低明度黄褐填面             |
| Minimal   | 小圆角与绿色强调                                           |
| Soft      | 原有柔紫、圆润轮廓与轻阴影                                 |
| Brutalist | 等宽文字、直角操作、硬边界与硬阴影                         |

用户明确要求保留各主题意境，因此没有采用 Taste 的随机调色、字体替换、禁紫、
全屏 hero、滚动 moment 或统一按钮形状。没有新图片、字体下载、外部服务或假数据。

## Unslop 九层复查

按 `unslop/references/signs.md` 和九层清单执行实图与代码自查，判定为轻度精修。
方法署名：Unslop by Damir Sokolovsky（[@heydamir](https://x.com/heydamir)），CC BY 4.0。
这不是一个名为 `unslop check` 的 CLI，也不是独立代理评分；用户未授权委派。

| 层次 | 问题与处理                                                                                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------- |
| 间距 | 两端桌面采用 192px 目录、240px 设置栏、32px 栏间距和相等外边缘；压缩介绍留白，Solid 页头 88 → 72px                          |
| 色彩 | Switch 关闭底色改为主题中性表面，开启仍用主色；目录选中文字使用主题正文色，修正 Brutalist 浅色上的亮色文字                  |
| 图标 | 不引入新图标集；移除 Solid 当前目录项上误指外链的箭头                                                                       |
| 文案 | 两端改用“主题设置”；移除 Solid 预览下重复自证的“不是静态设计稿”等说明                                                       |
| 字体 | 代码区使用正文墨色、至少 12px；Tabs 使用 500 字重；保留宋体/黑体、窄体展示字和等宽字体的职责                                |
| 布局 | 保留目录、预览、用法和配置顺序；窄屏重排而非整体缩小；Solid 的预览框和设置框改读主题圆角                                    |
| 细节 | ToggleButton 悬停不再覆盖选中底色；配置分段有可见选中底板；React 跳转链接位于 sticky 页头之上                               |
| 视觉 | 查看两端七主题对照与代表性全尺寸桌面、手机、深色图；没有新增光晕、渐变文字、照片、纹样或玻璃                                |
| 动效 | 继续使用既有主题节奏与 reduced-motion；用原生 `:active` 表达短暂按压，避免 Kobalte 的持久 `data-pressed` 使选中按钮一直缩小 |

Tabs 的原生悬停反馈与选中填色也保持匹配。共享状态样式修在 React 的 canonical CSS
源文件，Solid 直接打包这些源文件；删除 Solid 中重复的 ToggleButton 状态覆盖。
React 的 `base.css`、`styles.css` 使用生成命令同步，不手改生成内容。

原有 GPU、玻璃、传统纹样等仍是 opt-in 功能，本轮未删除或默认打开。
共享 Surface/Card 和其他未点名组件没有被顺带重设计。

## 验证

| 实际执行                                                                                               | 结果                                          |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `pnpm check`                                                                                           | lint、格式、React / Solid / Demo 类型检查通过 |
| `pnpm exec lightning run tests/styles.test.ts packages/react/src/display.test.tsx tests/solid.test.ts` | 18 项通过                                     |
| 新增 `tests/taste-polish.e2e.test.ts`，Chromium                                                        | 8 项通过                                      |
| 同一专项，`UI_KITS_TEST_WEBKIT=1`                                                                      | 8 项通过                                      |
| 既有 `demo`、`solid`、`theme-motion`、`hepo`、`hepo-interior`、`endfield` 浏览器测试                   | 91 项通过                                     |
| `git diff --check`                                                                                     | 通过                                          |

专项覆盖两框架、七主题、ToggleButton 明暗选中/悬停对比度至少 4.5:1、
选中后不持续缩小、Space 切换、Switch 轨道点击、主题控件几何、目录对比度，
以及 1440 / 1024 / 820 / 768 / 390 / 320 / 720px 的等边缘、无页面横向溢出和代码字号。
WebKit 沿 Safari 默认键盘策略，用 Option-Tab 到达链接；Chromium 使用 Tab。
两端都检查了跳转链接实际获得焦点且不被页头遮挡。

既有测试还覆盖主题持久化、深链接、复制、嵌套 Modal → Select、焦点恢复、
reduced-motion，以及完整目录的代表性视口遍历。目录遍历不等于逐像素验收所有变体。

720×450 是 1440×900 在 200% 下的 CSS 宽度等效重排，不是原生浏览器缩放。
未运行生产构建、全量单元/端到端测试、Firefox、真实设备或跨操作系统字体验收。

## Taste 自动检查：未通过项与适用边界

React 第 2 轮：`GATE: FAIL 55 (round 2 of 3)`。
Solid 第 3 轮：`GATE: OPEN 38 (rounds used up)`。**OPEN 仅表示轮次用完，不表示通过。**
Solid 的 38 条记录包含一条低对比的 `/` 分隔符，随后已将其颜色改为继承可读文字色；
其余记录未因这一小修被重新计数。没有豁免文件。

以下列出两次记录的全部 FAIL ID 与数量，而非宣称它们均为误报：

| FAIL ID           | React | Solid | 解释 / 处理边界                                                                              |
| ----------------- | ----: | ----: | -------------------------------------------------------------------------------------------- |
| `hero-fill`       |     1 |     1 | 工作台首屏直接展示组件，不改为一屏营销 hero                                                  |
| `flush`           |     6 |     2 | 栏、面板和代码相邻边缘被当作全屏章节边界                                                     |
| `nav`             |     2 |     1 | 品牌本身采用两行名称；不是导航意外折行                                                       |
| `no-visual`       |     1 |     1 | 实际组件或代码被当成缺图的营销特性章节                                                       |
| `card-visual`     |     2 |     0 | 变体与色板本身就是展示对象，不补无关插图                                                     |
| `button-styles`   |     2 |     2 | 工作台需要同屏比较多种按钮变体                                                               |
| `cta`             |     1 |     2 | 不给组件标题、实现说明和设置栏添加营销 CTA                                                   |
| `copy-headline`   |     1 |     1 | `Button` 是当前组件名称，不是销售类别                                                        |
| `text-contrast`   |     0 |     1 | Solid `/` 分隔符已改为继承可读文字色                                                         |
| `heading-scale`   |     2 |     0 | 目录组、设置栏和主内容的标题密度不同                                                         |
| `off-grid`        |     1 |     0 | 原生 details 的展开标记占位，不移除可用标记                                                  |
| `section-gaps`    |     2 |     0 | 工具内容与脚注、设置栏的间距不按营销章节计算                                                 |
| `visual-caption`  |     1 |     0 | opt-in 效果功能说明，不是图片说明文字                                                        |
| `field-label`     |     3 |     2 | 搜索有可访问名称；成组颜色输入共用可见标签并各有名称，不宣称完成独立读屏验收                 |
| `focus-ring`      |     3 |     1 | OTP、搜索和 React 色值输入把焦点环放在父 control 的 `:focus-within` 上，不能仅按输入自身判断 |
| `focus-visible`   |     1 |     1 | 搜索焦点反馈同样由父容器负责；保留这条工具记录，不当作完整无障碍通过证书                     |
| `moment-none`     |     1 |     1 | 不为工具页面新增装饰性滚动段落                                                               |
| `hero-screen`     |     2 |     2 | 目录和组件页标题不是全屏 hero                                                                |
| `section-height`  |     2 |     2 | 内容驱动高度，脚注不扩为一屏                                                                 |
| `section-air`     |     4 |     5 | 保留工作台实用密度、面板分隔和代码标题横线                                                   |
| `one-section`     |     2 |     2 | 多栏工具布局，不改成一次只显示一个章节                                                       |
| `one-heading`     |     4 |     1 | 目录、预览、代码和设置可同屏有标题                                                           |
| `container-edges` |     6 |     8 | 脚本按主内容窄栏推算整页边缘；专项另测 header/workbench/footer 的真实等边缘                  |
| `split-pair`      |     1 |     0 | 既有 opt-in 效果工作区不改成营销页的固定分栏线                                               |
| `cut-text`        |     2 |     1 | 保留可聚焦、可横向滚动与完整复制的源代码块，不强制源码折行                                   |
| `text-only`       |     1 |     0 | 设置栏无需补照片或绘图                                                                       |
| `container`       |     1 |     1 | 项目使用自己的工作台容器，不为满足命名添加 `.wrap`                                           |

Solid 的独立 layout 检查完整运行五个指定视口，均无页面横向溢出，
每个视口只报缺少 `.wrap`。React 的独立 layout 在第一个视口后报
`Runtime.evaluate: Inspected target navigated or closed`，未完成五视口检查；
不把后续独立 E2E 的七宽度结果冒称为该脚本通过。

Solid `perf.mjs` 的桌面/手机各报开发态解析 JS 约 1177 KiB 超预算，
无坏请求和布局位移；这不是生产包体积。React 的该轮开发服务失效，
perf 获取的是错误页，结果无效，不采信其中的速度或体积数据；
清理该服务时还收到 `EPERM`。未为此修改构建配置。

对 Solid 门禁捕获的真实 DOM 另运行 `copy-lint.mjs --kind software`：
0 FAIL / 0 WARN；没有保留的 copy-lint WARN。门禁快捷模式未覆盖的完整
滚动、表单发送与全量 hover/performance 检查，不宣称已验证。

## 复现与截图

```sh
UI_KITS_SCREENSHOT_DIR=.oil-ui/taste-polish/shots \
  pnpm exec lightning run --config lightning.e2e.config.ts tests/taste-polish.e2e.test.ts

UI_KITS_TEST_WEBKIT=1 \
  pnpm exec lightning run --config lightning.e2e.config.ts tests/taste-polish.e2e.test.ts

pnpm exec lightning run --config lightning.e2e.config.ts \
  tests/demo.e2e.test.ts tests/solid.e2e.test.ts tests/theme-motion.e2e.test.ts \
  tests/hepo.e2e.test.ts tests/hepo-interior.e2e.test.ts tests/endfield.e2e.test.ts
```

本地过程与实图在 `.oil-ui/taste-polish/`，不被正式页面引用。
截图名为 `{react|solid}-{theme}-{1440|390}.png` 和
`{react|solid}-{theme}-toggle-{light|dark}.png`；基线为 `before-react.png`、
`before-solid.png`。Taste 原始日志在 `logs/`，门禁状态在 `.taste-skill/`，
都不作为线上资产或产品代码提交。

# Solid 组件库与 demo 验收

## 交付范围

- `packages/solid`：SolidJS 原生组件，复杂交互由 Kobalte 管理，不在内部挂载 React。
- `apps/solid-demo`：独立 Nasti Solid SPA，49 个实际可操作的组件 / 组件族条目。
- `packages/shared/theme.ts`：React / Solid 共用 HCT 算法，构建时内联，不增加运行时 workspace 依赖。
- `packages/shared/styles.mjs`：两个框架从相同 CSS 源文件生成入口，避免并行构建读取另一包的半成品。
- 七套风格、显式明暗与系统明暗、主题本地保存、搜索与深链接、代码 / CSS 复制、移动端目录、嵌套作用域和可选描摹纹样。

Solid 属性遵循 `class`、`for`、响应式 props 与 Kobalte 命名，不承诺兼容 React Aria API。组件范围与差异以 `packages/solid/README.md` 为准。

## 实际发现并修复的问题

1. **系统 select 回归**：按钮尺寸、明暗与手机目录最初用了原生 select，无法随当前设计语言表达。现全部使用库内 Select；只有表单提交所需、位于 `aria-hidden` 区域的隐藏 select 被保留。源码与浏览器均有防回归检查。
2. **鼠标点击开关轨道无效**：把 Kobalte Root 当作原生 label 包裹 Control，Control 自身切换后，label 默认行为又触发一次 input，最终看起来没有切换。Root、Control、Label 现按 Kobalte 原生结构分离；Switch、Checkbox、Radio 使用同一规则，不靠阻止事件冒泡掩盖问题。
3. **禁用 fieldset 仍能操作装饰控件**：隐藏 input 虽然被浏览器禁用，div Control 仍可能改变内部状态。增加响应式 disabled 作用域，保留首个 legend 的原生例外。
4. **Nasti 子路径预打包复制焦点栈**：Dialog 和 Select 使用不同副本的焦点栈时，父 Dialog 会将新开的 Select 立即关掉。SPA 配置把 Kobalte 公开 ESM 子路径解析到同一组文件。
5. **WebKit 嵌套浮层被 aria-hide**：body portal 的新 wrapper 可能被父模态框异步隐藏，视觉上有菜单、辅助技术却不可见。内层浮层挂载到真实 Dialog.Content，不创建自定义空宿主，不修改 Kobalte 的私有状态或强行移除 `aria-hidden`。外层内容面板滚动、外壳允许菜单溢出，避免裁切。

## 验证

测试运行器与断言统一使用 Lightning；Playwright 只驱动浏览器。

- `pnpm check`：Oxlint、Oxfmt、整个 workspace 的 TypeScript 检查。
- `pnpm test`：108 项，包含既有 React SSR / API 回归与新增共享样式、主题实现、无原生菜单回归检查。
- `pnpm test:package`：React / Solid 两项真实 tarball 消费验证。Solid 独立安装后检查 CSS 子路径、Bundler / NodeNext 类型解析，再分别编译浏览器与服务端，并用真实 Node 运行 SSR。
- `pnpm build`：React / Solid 组件包以及两个 demo 的生产构建。
- `pnpm exec lightning run --config lightning.e2e.config.ts tests/solid.e2e.test.ts`：Chromium 38 项。
- `UI_KITS_TEST_WEBKIT=1 pnpm exec lightning run --config lightning.e2e.config.ts tests/solid.e2e.test.ts`：WebKit 38 项。

每个浏览器的目录矩阵包含 **7 风格 × 2 明暗 × 2 尺寸 × 49 条目 = 1,372 个渲染场景**。尺寸为 1440px 桌面和 390px 手机，逐项检查真实渲染、运行时错误与横向溢出。每个主题使用独立页面，避免把 WebKit 对高频合成 History API 写入的限流误判为产品问题。

交互断言覆盖：

- 原生按钮语义、加载时禁用、响应式尺寸 / 状态、切主题不丢失示例状态。
- 开关轨道、thumb、文字 label 的鼠标点击；Checkbox 方框与文字；受控和非受控状态；禁用 fieldset。
- 配置下拉与手机目录打开主题化 listbox，而不是操作系统菜单。
- 表单必填验证、FormData、NumberField 边界、OTP 过滤粘贴。
- Radio / Tabs / Accordion 的键盘状态，Select 禁用选项与 ComboBox 筛选。
- Modal 焦点陷阱与恢复、嵌套 Select、局部主题、打开期间的祖先主题变更与嵌套浅色重置。
- 系统主题变化、持久化 / 恢复默认、存储受限回退、搜索、浏览器返回、复制反馈与 Toast 关闭。

## Unslop 检查

按 Unslop 的 signs 与九层检查清单，对真实页面截图作轻量检查，沿用已有品牌，不另造一套视觉方向。

### 五行方向

- **产品**：供开发者查阅和操作原生 Solid 组件的多风格工作台。
- **性格**：克制、有据可查、偏工程。
- **世界**：组件样本册与设计规范，而不是营销落地页。
- **重点**：真实组件的交互预览、所选风格的有效色板；色彩留给这些内容。
- **签名**：`--zx-*` 色板与可操作样本并置，同一份语义随设计语言变化。

### 审查记录

| 层次 | 结论与处理                                                                                                  |
| ---- | ----------------------------------------------------------------------------------------------------------- |
| 间距 | 页面主间距遵循 4px 网格；目录统一 36px 行高。目录独立滚动，避免长导航拉出主内容下方的大段空白。             |
| 色彩 | 保留 Clean 品牌色及其他风格的原生配色；没有色相渐变、彩色光晕、背景光团或渐变文字。                         |
| 图标 | 控件 glyph 统一 20px viewBox、1.5 stroke、继承文字颜色；没有 emoji 分类图标。                               |
| 文案 | 标题是实际组件名；明确本地演示，不伪称已提交或远程保存；没有虚构用户量或宣传指标。                          |
| 排版 | 沿用主题字体栈，界面 400 / 500 为主，代码与元数据用等宽；小字不加负字距。                                   |
| 布局 | 桌面为目录 / 预览与代码 / 主题三栏；手机使用真实自定义目录选择器，主题面板下移，不把桌面整体缩小。          |
| 细节 | 控件的 hover、focus、disabled、checked / pressed 状态由同一适配规则表达；修复了原生 select 与开关事件问题。 |
| 视觉 | 主视觉就是可操作组件，没有装饰性 3D 物件、假数据图表或无关图片，不需要生成图片。                            |
| 动效 | 只保留状态反馈与短距离浮层进入；无无意义循环装饰。Spinner / Skeleton 仅用于加载示例，尊重减少动态效果设置。 |

### 最终截图

截图来自生产构建预览与真实 Chromium，不是静态原型：

- [Solid 桌面](screenshots/solid-desktop.png)
- [Solid 深色](screenshots/solid-dark.png)
- [Solid 手机](screenshots/solid-mobile.png)

### 边界

- 目录矩阵是渲染 / 溢出验证，不等于每个组件在每种风格上完成全部交互与人工视觉验收；交互断言集中验证共享行为。
- 尚未迁移的日期 / 颜色选择器、部分分组组件、I18nProvider 与 GPU / 液态玻璃增强没有列为可用。
- 类型检查沿用 `skipLibCheck: true`；Kobalte 0.13.14 在 TS 7 下的上游声明问题已在组件 README 记录。
- 没有做 Firefox、真实手机硬件、屏幕阅读器人工验收，也没有为本次改动重跑整个既有 React 浏览器矩阵。既有 React 单元、tarball、生产构建均有回归验证。
- 包保持私有，未发布 npm，未合并或推送共享分支。

Unslop 方法来自 Damir Sokolovsky（[@heydamir](https://x.com/heydamir)），CC BY 4.0。

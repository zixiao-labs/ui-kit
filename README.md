# Zixiao Laboratories UI Kits

`@zixiao-labs` 的多风格 React 组件库。**一套组件 API，共享语义与交互，多种视觉表达。**

Clean 是当前优先完善的风格，不是整个项目唯一的风格。Minimal、Soft、Brutalist 保留在同一个主题机制中；后续风格继续复用组件行为，不复制组件实现。

## 开始开发

需要 Node.js >=22.12.0 和 pnpm 12.16.1。

```sh
pnpm install
pnpm dev
```

演示应用沿用 **Nasti + TanStack React Start**，不额外引入 Vite。框架与编译依赖放在应用包内；Lightning 测试运行器和 Oxc 工具放在 workspace 根目录。

## Workspace 包清单

| 路径             | 包名                             | 职责                                   |
| ---------------- | -------------------------------- | -------------------------------------- |
| 根目录           | `@zixiao-labs/ui-kits-workspace` | 私有 workspace，统一工具与测试入口     |
| `packages/react` | `@zixiao-labs/ui-kits-react`     | React 组件、类型、共享行为和各风格 CSS |
| `apps/demo`      | `@zixiao-labs/ui-kits-demo`      | 多风格组件工作台，Nasti 开发与 SSR     |

这些包目前均为 `private`，**还不能从 npm 安装**。内部依赖使用 `workspace:*`，组件包通过源码 exports 交给 Nasti 编译。发布构建、版本管理与 CI 尚未接入，不把源码入口当作可发布产物。

包名前缀与文档、页面品牌一致：**Zixiao Laboratories UI Kits**。npm scope 保留 `@zixiao-labs`，不申请新 scope。

## 使用组件

在 workspace 内使用：

```tsx
import { Button } from '@zixiao-labs/ui-kits-react'
import '@zixiao-labs/ui-kits-react/styles.css'

export function Example() {
  return (
    <div data-zx-style="clean" data-zx-color-mode="light">
      <Button variant="solid" size="md">
        创建项目
      </Button>
      <Button variant="tonal">保存草稿</Button>
    </div>
  )
}
```

### 风格与主题

| `data-zx-style` | 定位                                                                    | 当前状态                                 |
| --------------- | ----------------------------------------------------------------------- | ---------------------------------------- |
| `clean`         | 克制的 Material-inspired 风格，语义色彩、tonal surfaces、全圆角操作按钮 | 第一套重点完善的风格；也是根作用域默认值 |
| `minimal`       | 简洁直观，小圆角与绿色强调                                              | 保留的基础风格                           |
| `soft`          | 柔和紫色、圆润轮廓与轻阴影                                              | 保留的基础风格                           |
| `brutalist`     | 高对比边界、直角与硬阴影                                                | 保留的基础风格                           |

四套风格均提供显式 `light` / `dark` 配色。把 `data-zx-style` 和 `data-zx-color-mode` 放在同一个作用域元素上。不同作用域可并存；嵌套的 `data-zx-style` 会重置为该风格的浅色默认值，深色需显式指定。

**设计语言不是全局前提。** Clean 借鉴 Material，其他风格以及后续设计语言不需要采用 Material 的颜色、排版、形状或动效规则，也不需要定义任何 `--md-*` 变量。

样式分为两层：

- `base.css`：设计语言无关的 `--zx-*` 默认值、作用域重置和共享组件规则。组件只读取这个中性契约，不读取任何设计语言的专属 tokens。
- `themes/*.css`：各风格的独立适配层。只有 `themes/clean.css` 定义和映射 `--md-sys-*`；Minimal、Soft、Brutalist 直接实现 `--zx-*`。

`styles.css` 是包含全部现有风格的便捷入口，默认选择 Clean。它不是必须使用的全局设计系统。由于当前 Nasti 开发模式不展开相对 CSS `@import`，基础入口与完整入口均生成为扁平 CSS：

- `foundation.css`：中性 token 默认值与 Button。
- `display.css`、`forms.css`、`navigation.css`、`pickers.css`：共享组件样式。
- `base.css`：以上源文件生成的无设计语言依赖入口。
- `styles.css`：`base.css` 与各独立主题适配层的完整入口。

修改源样式后运行 `pnpm --filter @zixiao-labs/ui-kits-react styles:generate`。测试会检查两个入口与源文件同步，不直接编辑生成文件。

只需要某种风格时，先加载基础层，再加载所选适配层：

```tsx
import { Button } from '@zixiao-labs/ui-kits-react'
import '@zixiao-labs/ui-kits-react/base.css'
import '@zixiao-labs/ui-kits-react/themes/soft.css'

export function SoftExample() {
  return (
    <div data-zx-style="soft">
      <Button>保存草稿</Button>
    </div>
  )
}
```

此用法不会加载 Clean 或任何 Material tokens。演示站外壳显式选用 Clean，不代表组件库强制使用它。

### 品牌色与动态主题

Clean 默认采用公司品牌主色 **`#8B5CF6`** 和辅助色 **`#FCD34D`**。色彩保留原值，实心色上的文字按 WCAG 对比度选择黑或白；链接、选中标签文字使用独立的 `--zx-accent-ink` 深浅色阶，不直接把浅亮品牌色当正文。

可选的 `theme` 入口使用 Material Color Utilities 的 HCT 色阶生成低彩度表面、文字、边界与明暗主题，输出仍然只有设计语言无关的 `--zx-*`。不会把 Material tokens 注入其他风格，也不修改全局 DOM：

```tsx
import { createTheme, themeToCSS } from '@zixiao-labs/ui-kits-react/theme'

const theme = { primary: '#8b5cf6', secondary: '#fcd34d', radius: 12 }

<div data-zx-style="clean" data-zx-color-mode="light" style={createTheme(theme)}>
  <Button>创建项目</Button>
</div>

// 深色用 createTheme(theme, true)。
// 导出后放在基础样式和风格适配层之后，并在作用域上添加 data-zx-theme="custom"。
const css = themeToCSS(theme)
```

颜色须为六位十六进制值，圆角范围为 0–32px。自定义主题的圆角会覆盖所选风格的默认形状；未自定义时四种风格保留各自默认值。主题作用域里的浮层继续读取触发器的有效 tokens，不依赖弹层所在的 DOM 位置。

Demo 参考 HeroUI docs 组织为目录、交互预览、用法代码与主题调节栏。支持种子色、辅助色、圆角、配色预设，以及全站共享的浅色 / 深色 / 跟随系统设置；页面、所有预览与浮层保持一致，默认跟随系统并实时响应系统主题变化。支持复制明暗 CSS 和本地保存；刷新可恢复（包括旧版的明暗偏好），恢复默认主题会回到跟随系统。浏览器禁止存储或剪贴板时有明确提示，输入非法颜色不会破坏当前主题。

### 动效

共享层的动效参考 HeroUI 的生命周期实现，所有风格复用同一套行为：

- Modal / AlertDialog、Drawer、Sheet：遮罩淡入淡出，内容按位置进入和退出；退出期间不可点击。
- Popover、Dropdown、选择器与日期/颜色浮层、Tooltip：从锚点方向短距离位移与淡入淡出。
- Disclosure / Accordion：使用 RAC 的实测高度变量展开、收起，支持中途反向操作；这是有意保留的布局过渡。
- Tabs：使用 RAC `SelectionIndicator` 处理变宽、纵向、RTL 的选中指示移动；内容短淡入。
- Checkbox、Radio、Switch、Slider、ToggleButton、日历选中和各类操作控件：选中、按压及颜色反馈。
- Skeleton：仅加载占位使用扫光；ProgressCircle 补齐数值变化过渡。
- Toast：支持原生 View Transition 的浏览器使用队列进入、退出与重排动画；不支持时保留进入反馈和正常关闭，不延迟 DOM 移除。

`--zx-motion-duration-short / medium / long / exit` 与 `--zx-motion-easing` 控制节奏。`prefers-reduced-motion: reduce` 关闭这些过渡和动画，不改变交互结果与焦点管理。

新增设计语言时，在自己的 CSS 中为 `[data-zx-style="你的风格"]` 实现 `--zx-*`，需要明暗配色时再增加同作用域的 `data-zx-color-mode` 规则：

| 共享角色                                                                                         | 控制内容             |
| ------------------------------------------------------------------------------------------------ | -------------------- |
| `--zx-surface`、`--zx-text`、`--zx-accent`、`--zx-on-accent`、`--zx-tonal`、`--zx-on-tonal` 等   | 背景、文字与操作配色 |
| `--zx-font`、`--zx-label-size`、`--zx-label-weight`、`--zx-label-line-height`                    | 字体与标签排版       |
| `--zx-radius`、`--zx-border-width`、`--zx-shadow`                                                | 形状、边界与层次     |
| `--zx-button-height`、`--zx-button-height-sm`、`--zx-button-height-lg`、`--zx-button-padding` 等 | 各尺寸档位与留白     |
| `--zx-motion-duration-short`、`--zx-motion-easing`、`--zx-button-active-transform`               | 过渡与按压反馈       |

每个作用域都从中性默认值开始，避免继承父作用域的语言特征。适配层可以直接赋值，也可映射自己的 token 命名；不需要修改 Button 或增加 `if (style)`。

Clean 是受 Material 3 启发的 Web 实现，不是 Google 官方组件，也没有引入维护模式的 `@material/web`。默认 CSS 提供静态品牌配色，可选 `theme` 入口支持动态种子色；尚未提供高对比等级或 Compose Expressive 同等能力。这些限制不约束其他设计语言。

### 组件目录

以 [HeroUI 3.2.7 All Components](https://www.heroui.com/docs/components) 的条目作为规模基准，**不复制或兼容 HeroUI 的 API**：

| 分类       | 组件                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 按钮       | Button、ButtonGroup、CloseButton、ToggleButton、ToggleButtonGroup                                                                                                                    |
| 集合       | Dropdown、ListBox、TagGroup                                                                                                                                                          |
| 颜色       | ColorArea、ColorField、ColorPicker、ColorSlider、ColorSwatch、ColorSwatchPicker                                                                                                      |
| 控件       | Slider、Switch                                                                                                                                                                       |
| 数据       | Badge、Chip、Table                                                                                                                                                                   |
| 日期时间   | Calendar、DateField、DatePicker、DateRangePicker、RangeCalendar、TimeField                                                                                                           |
| 反馈       | Alert、Meter、ProgressBar、ProgressCircle、Skeleton、Spinner                                                                                                                         |
| 表单       | Checkbox、CheckboxGroup、Description、ErrorMessage、FieldError、Fieldset、Form、Input、InputGroup、InputOTP、Label、NumberField、RadioGroup、Radio、SearchField、TextField、TextArea |
| 布局       | Card、Separator、Surface、Toolbar                                                                                                                                                    |
| 媒体       | Avatar、AvatarGroup                                                                                                                                                                  |
| 导航       | Accordion、Breadcrumbs、Disclosure、DisclosureGroup、Link、Pagination、Tabs                                                                                                          |
| 浮层       | AlertDialog、Drawer、Modal、Popover、Toast、Tooltip、Sheet                                                                                                                           |
| 选择器     | Autocomplete、ComboBox、Select                                                                                                                                                       |
| 排版与工具 | Kbd、Typography、ScrollShadow                                                                                                                                                        |

Demo 的目录支持检索、组件深链接（`/?component=DatePicker`）、手机选择器、深色样本和可复制 TSX。每个条目包含实际可操作用法；Button 保留四主题调参台。新组件首先针对 Clean 打磨，其他适配层能读取中性合同，但不代表已逐个完成其他风格的视觉验收。

复杂交互复用 `react-aria-components`，支持受控与非受控状态、键盘导航和辅助技术语义。表单/选择类遵循 React Aria 的 `isDisabled`、`isRequired`、`isInvalid` 命名；原 `Button` 继续保留原生 `disabled` 和 `onClick`。日期值使用 `@internationalized/date`，颜色值使用 React Aria Color。具体 Props 类型由入口导出，可结合 Demo 查看完整组合。

图标统一使用 `@gravity-ui/icons`，直接渲染 SVG 并继承文字颜色：

```tsx
import { Plus } from '@gravity-ui/icons'
import { Button, TextField } from '@zixiao-labs/ui-kits-react'

<Button><Plus aria-hidden="true" />创建项目</Button>
<Button variant="outline" aria-label="添加成员"><Plus aria-hidden="true" /></Button>
<TextField label="项目名称" defaultValue="北岸设计" />
```

图标按钮必须提供可访问名称；不要给 Gravity 图标的所有 path 强加 `fill: none` 或额外 stroke。浮层使用 React Aria 自身的 body portal 生命周期，将原作用域的有效主题、中性 token 与 color-scheme 直接应用到真实浮层表面。不会创建可能被父模态框误设为 inert 的空 portal 容器。

这是源码 workspace，不是已发布的完整产品系统。组件条目覆盖不等于 HeroUI 的全部子组件、所有变体与高级能力：没有虚拟化、跨行单元格编辑、远程搜索服务、文件上传服务或完整多历法/多语言验收。Demo 数据为前端交互内容，不连接业务后端，也不会宣称已保存到远程服务。

`InputOTP` 的未受控值不做运行时长度迁移；切换 `length` 时请同步受控 `value`，或通过新的 `key` 重新挂载。普通输入、粘贴、退格与表单使用不受此限制。

### Button API

保留原生 button 属性及 React 19 `ref`，默认 `type="button"`。

| 属性       | 值                                      | 默认    |
| ---------- | --------------------------------------- | ------- |
| `variant`  | `solid` / `tonal` / `outline` / `ghost` | `solid` |
| `size`     | `sm` / `md` / `lg`                      | `md`    |
| `loading`  | `boolean`                               | `false` |
| `disabled` | 原生属性                                | `false` |

工作台中的 Filled / Tonal / Outlined / Text 分别对应上述四个 variant，这些是展示文案，不是对其他设计语言的命名要求。尺寸和排版由适配层决定：Clean 的 `sm / md / lg` 高度为 44 / 48 / 56px；其他三套风格保留原有的 44 / 44 / 52px，不强制跟随 Material 尺度。加载时保留文字与可访问名称、设置 `aria-busy` 并禁用重复交互。提供 hover、active、focus-visible、disabled、loading，尊重 `prefers-reduced-motion`。

## 常用命令

```sh
pnpm dev          # 启动组件工作台
pnpm build        # 构建演示应用
pnpm preview      # 预览生产构建结果
pnpm lint         # Oxlint
pnpm fmt          # Oxfmt
pnpm fmt:check    # 格式检查
pnpm typecheck    # 生成路由类型并检查 workspace
pnpm check        # lint + 格式 + 类型检查
pnpm test         # Lightning：组件 SSR/API 测试
pnpm test:watch   # Lightning：监视组件测试
pnpm test:e2e     # Lightning：自动启动 Nasti 开发服务并运行浏览器回归
```

### 测试与截图

**测试运行器、生命周期和断言统一使用自研的 `@lightning-js/lightning`**。配置分别在 `lightning.config.ts` 与 `lightning.e2e.config.ts`；不使用 Vitest、Jest 或 `@playwright/test`。

浏览器回归使用 `playwright` 作为驱动，负责真实 Chromium、键盘输入、SSR、明暗主题、嵌套作用域、复制与响应式验证。Playwright 不负责发现测试或执行断言。测试自动启动并关闭独立 Nasti 开发服务，不依赖预先构建的 `dist`。

```sh
pnpm exec playwright install chromium
pnpm test:e2e

# 可选：同时保留桌面、手机、深色及 200% 缩放的 Playwright 截图
UI_KITS_SCREENSHOT_DIR=test-results/screenshots pnpm test:e2e
```

OTP 的跨浏览器裁切回归可单独运行：先执行 `pnpm exec playwright install webkit`，再执行 `UI_KITS_TEST_WEBKIT=1 pnpm exec lightning run --config lightning.e2e.config.ts tests/input-otp.e2e.test.ts`。默认回归仍只要求 Chromium。

开发服务验证不等于生产构建验证；部署前仍需单独执行 `pnpm build` 和生产预览检查。

## 扩展原则

- 优先完善 Clean；只列已经实现且可操作的组件，不用不可用的导航制造完整感。
- 风格不改变行为；无法由 tokens 表达的结构差异再考虑 skin，不在组件里堆积 `if (style)`。
- Dialog、Select 等复杂交互使用 React Aria 无样式无障碍 primitives，不自行重造焦点管理。扩展时保留受控状态、原生表单语义与主题隔离。
- 出现真实复用和发布需求后再拆独立 tokens/primitives 包，引入库构建、产物验证和版本发布流程。

## Nasti 注意事项

保持 TanStack runtime/compiler 固定版本配套。`@tanstack/start-plugin-core@1.171.55` 是当前 Nasti 集成所需的编译协议依赖，不单独升级，也不额外添加 `tanstackRouter()`。

Demo 的 `nasti.config.ts` 为 Adobe 的公开 ESM 入口设置了解析桥接：Nasti 2.9.0 默认按子路径分别预打包，会重复实例化 React Aria 的 collection/focus 等 context，导致集合 hydration 报错。桥接通过实际安装路径解析，限于 Demo，不修改上游依赖或组件 API；不能用 Start 不支持的 `bundledDev` 替代。升级 Nasti 后应重跑集合、嵌套弹层与焦点恢复回归，再评估是否删除此桥接。

构建输出位于 `apps/demo/dist/client/` 和 `apps/demo/dist/server/server.mjs`。部署时仅公开 `dist/client/`，不要把整个 `dist/` 作为静态目录。服务端导出 `{ fetch(request) }`，需根据部署平台适配。

更多限制见 [Nasti native integration guide](https://github.com/zixiao-labs/Nasti/blob/v2.9.0/playground/tanstack-react/README.md)。

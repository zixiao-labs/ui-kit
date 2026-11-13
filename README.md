# Zixiao Laboratories UI Kits

`@zixiao-labs` 的多风格 React 组件库。**一套组件 API，共享语义与交互，多种视觉表达。**

Clean、Endfield 和鹤坡复用同一套完整组件实现。Minimal、Soft、Brutalist 保留在同一个主题机制中；后续风格继续复用组件行为，不复制组件实现。

## 开始开发

需要 Node.js 22.18+（22.x）、24.11+（24.x）或 >=26，以及 pnpm 12.18.0；Node 版本要求与 tsdown 0.23 配套。

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

这些包目前均为 `private`，**还不能从 npm 安装**。内部依赖使用 `workspace:*`，组件包通过源码 exports 交给 Nasti 编译。组件包已接入 tsdown 构建和 tarball 验证；版本管理、npm 发布与 CI 尚未接入。

包名前缀与文档、页面品牌一致：**Zixiao Laboratories UI Kits**。npm scope 保留 `@zixiao-labs`，不申请新 scope。

### 组件包构建与导出

```sh
pnpm build:lib       # 生成 CSS，再用 tsdown 构建组件包
pnpm test:package    # pack → 独立安装 → 类型与 Node SSR 验证

# 只打包，不发布；prepack 会自动重新构建
mkdir -p test-results
pnpm --filter @zixiao-labs/ui-kits-react pack --out ../../test-results/ui-kits-react.tgz
```

构建产物位于 `packages/react/dist/`，只提供 ESM，不提供 CommonJS 构建：

| 公开入口                                                      | 产物                                 |
| ------------------------------------------------------------- | ------------------------------------ |
| `@zixiao-labs/ui-kits-react`                                  | `index.js`、`index.d.ts`             |
| `@zixiao-labs/ui-kits-react/theme`                            | `theme.js`、`theme.d.ts`             |
| `@zixiao-labs/ui-kits-react/patterns`                         | 可选传统底纹组件与类型               |
| `@zixiao-labs/ui-kits-react/liquid-glass`                     | 可选 Liquid Glass React 适配器与类型 |
| `@zixiao-labs/ui-kits-react/styles.css`                       | 全部风格的扁平 CSS                   |
| `@zixiao-labs/ui-kits-react/base.css`                         | 不含风格适配层的扁平 CSS             |
| `@zixiao-labs/ui-kits-react/css/*.css`                        | 按组件族选择的源样式                 |
| `@zixiao-labs/ui-kits-react/patterns.css`、`liquid-glass.css` | 独立可选功能样式                     |
| `@zixiao-labs/ui-kits-react/themes/*.css`                     | 各独立风格适配层                     |

React、React DOM 和其他运行时依赖保持 external，不复制进组件 JS；GPU 阴影仍保留为动态加载的独立 chunk。CSS 按文件保留，不自动注入 JS，`sideEffects` 标记确保应用打包时不会误删样式。包内只包含 `dist`、包元数据和 README，不依赖源码或 workspace 配置；JS source map 内嵌源码便于调试。

本地 `exports` 继续指向 `src`，Demo 开发、HMR 和源码测试不要求预先构建。`publishConfig.exports` 指向 `dist`，**必须使用 pnpm 的 `pack` / `publish` 才会替换导出表**；不要用不支持此覆盖的 `npm pack` / `npm publish`。当前保持 `private: true`，打包验证不会执行发布。

`test:package` 会临时安装 tarball 及消费端依赖（优先本地缓存，缺失时需要 registry），检查所有运行时导出和 CSS、Bundler / NodeNext 两种 TypeScript 解析、真实 Node ESM SSR，以及 GPU chunk 的延迟加载结构；临时目录在结束后清理。

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
| `endfield`      | Endfield-inspired 工程风格，灰白 / 炭灰表面、信号黄操作、矩形控件       | 74 个目录条目的明暗配色与响应式覆盖      |
| `hepo`          | 鹤坡新中式，石白 / 墨瓦表面、黛青操作、浅木色辅助面、宋体标题           | 独立明暗适配层，复用完整组件行为         |
| `hepo-interior` | 鹤坡·室内，暖石白 / 暖炭灰表面、红木操作、香槟色辅助面、宋体标题        | 独立明暗适配层，保留原版鹤坡             |
| `minimal`       | 简洁直观，小圆角与绿色强调                                              | 保留的基础风格                           |
| `soft`          | 柔和紫色、圆润轮廓与轻阴影                                              | 保留的基础风格                           |
| `brutalist`     | 高对比边界、直角与硬阴影                                                | 保留的基础风格                           |

各风格均提供显式 `light` / `dark` 配色。把 `data-zx-style` 和 `data-zx-color-mode` 放在同一个作用域元素上。不同作用域可并存；嵌套的 `data-zx-style` 会重置为该风格的浅色默认值，深色需显式指定。

Endfield 使用独立的 `themes/endfield.css`，不依赖 Clean 或 Material tokens。浅色背景上的细进度线、单选标记与焦点使用炭灰，信号黄保留给主要操作与选中状态；不是所有文本和边框都染成黄色。形状与状态通过中性 tokens 表达，不使用跨越嵌套边界的后代选择器。

鹤坡使用独立的 `themes/hepo.css`：浅色以石白、黛青和浅木色分层，深色另配墨瓦底与浅水青操作色，不把金黄压成暗黄褐色。字体分为 `--zx-font`（黑体正文与控件）和 `--zx-font-display`（宋体标题与浮层标题）；其他风格的标题默认仍跟随正文字体。字体栈优先 Noto / 思源，其后使用系统苹方、微软雅黑、宋体等回退，不附带字体文件或发起外部字体请求；需要跨设备一致时，由应用自行加载有授权的字体。详见 [鹤坡验收](docs/hepo-review.md)。

室内变体通过 `data-zx-style="hepo-interior"` 与 `themes/hepo-interior.css` 单独接入，不需要同时加载原版鹤坡。取室内暖石白墙面、红木框架和浅香槟色的关系，沿用宋体标题、黑体控件与小圆角；深色使用暖炭灰底和明亮的木色、香槟色填面，默认、悬停、按压均避开低明度黄褐色。全局选择、局部预览、嵌套浮层、保存和 CSS 导出仍使用同一机制。详见 [室内变体验收](docs/hepo-interior-review.md)。

### 全局切换与局部混用

Demo 的「全局风格」控制页面和跟随全局的预览；「预览风格」（Button 配置中为「设计风格」）可单独覆盖，选择跨组件导航和刷新保留。切换全局风格恢复目标风格的原生配色与形状；自定义配色只覆盖全局及同风格预览，不会污染另一风格的局部预览。明暗仍由全站的浅色 / 深色 / 跟随系统设置控制。

展开「风格混用实验」可独立选择内层风格和明暗，操作开关、Modal 及其中的 Select，验证 body portal 下的主题隔离。实际项目不需要额外 Provider：

```tsx
import { Button, Card, Modal, Switch } from '@zixiao-labs/ui-kits-react'
import '@zixiao-labs/ui-kits-react/styles.css'

;<div data-zx-style="clean" data-zx-color-mode="light">
  <Button>外层操作</Button>
  <Card data-zx-style="endfield" data-zx-color-mode="dark">
    <Switch>保留本地草稿</Switch>
    <Modal trigger={<Button>查看设置</Button>} title="局部设置">
      浮层及其内部控件保持 Endfield 深色
    </Modal>
  </Card>
</div>
```

并列作用域、反向嵌套（Endfield 包含 Clean）也使用同一规则。作用域可以小到单个组件：`<Button data-zx-style="endfield">确认</Button>`。所有交互行为保持不变；发布 Toast 时仍需把 `ToastProvider` 放在对应作用域内。

**设计语言不是全局前提。** Clean 借鉴 Material，其他风格以及后续设计语言不需要采用 Material 的颜色、排版、形状或动效规则，也不需要定义任何 `--md-*` 变量。

样式分为两层：

- `base.css`：设计语言无关的 `--zx-*` 默认值、作用域重置和共享组件规则。组件只读取这个中性契约，不读取任何设计语言的专属 tokens。
- `themes/*.css`：各风格的独立适配层。只有 `themes/clean.css` 定义和映射 `--md-sys-*`；其他风格直接实现 `--zx-*`。

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

辅助色本身（`--zx-secondary`）与辅助色容器（`--zx-tonal`）分开：容器采用浅色 HCT tone 90 / 深色 tone 80，均配 tone 10 文字，避免黄色、金色在深色模式下压成棕褐色。Clean 原生深色配色与 `createTheme` 的品牌配色遵循同一规则；Demo 底部色板展示有效的辅助色，而不是容器色。

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

颜色须为六位十六进制值，圆角范围为 0–32px。自定义主题的圆角会覆盖所选风格的默认容器形状；未自定义时各风格保留各自默认值。主题作用域里的浮层继续读取触发器的有效 tokens，不依赖弹层所在的 DOM 位置。

Demo 参考 HeroUI docs 组织为目录、交互预览、用法代码与主题调节栏。支持种子色、辅助色、圆角、配色预设，以及全站共享的浅色 / 深色 / 跟随系统设置；页面、所有预览与浮层保持一致，默认跟随系统并实时响应系统主题变化。支持复制明暗 CSS 和本地保存；刷新可恢复（包括旧版的明暗偏好），恢复默认主题会回到跟随系统。浏览器禁止存储或剪贴板时有明确提示，输入非法颜色不会破坏当前主题。

「鹤坡」风格同时改变原生配色、字体和形状；「鹤坡配色」预设仅以黛青 `#3F5662`、木色 `#C4A787` 生成自定义明暗色阶，保留当前风格的字体。两者入口不同，原生主题导出为适配层 import，自定义配色导出为 HCT tokens。

「鹤坡·室内配色」同样只覆盖颜色，以红木 `#82503D` 和香槟色 `#D8BD88` 为种子；要一并切换字体、形状和原生明暗表面，请选择「鹤坡·室内」风格，而不是配色预设。

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

### 可选材质与光影

`Card`、`Surface` 提供 `effects={{ shadow: 'gpu', tilt: true, backlight: true, glass: true }}`，`Button` 支持其中的阴影、背光和玻璃。每项均独立 opt-in，可与原有 `variant` 组合；默认组件不改变外观，也不申请 GPU。

GPU 阴影按需使用 vgpu，缺少 WebGPU 或 device 丢失时退回 CSS 阴影；倾斜在触屏、粗指针与减少动态效果模式下关闭；背光只在当前深色主题作用域点亮；玻璃只折射背景，不扭曲文字，并保留原生按钮语义。工作台三个组件页的「材质与光影」可实际切换、操作和复制代码。完整 API、成本、浏览器降级与 Unslop 自检见 [可选效果验收](docs/effects-review.md)。

背景纹路是独立的 opt-in 功能，不随鹤坡或任何主题自动启用：

```tsx
import { Button } from '@zixiao-labs/ui-kits-react'
import { PatternBackground } from '@zixiao-labs/ui-kits-react/patterns'
import '@zixiao-labs/ui-kits-react/base.css'
import '@zixiao-labs/ui-kits-react/themes/hepo.css'
import '@zixiao-labs/ui-kits-react/patterns.css'

;<PatternBackground pattern="yunlei" data-zx-style="hepo" style={{ padding: 32 }}>
  <Button>查看档案</Button>
</PatternBackground>
```

`hui` 是回纹（连续折线），`yunlei` 是云雷纹（方圆回旋），`lei` 是雷纹（丁形勾连）。它们是依据参考图制作的几何化底纹，不作为文物图样的复原或年代判断；不传 `pattern` 时不生成 SVG。可通过 `--zx-pattern-color`、`--zx-pattern-opacity` 调整颜色与强度，默认透明度 0.12；装饰层不参与点击，在强制颜色模式下隐藏。

液态玻璃保留内置轻量实现，并新增独立的 `/liquid-glass` 增强入口 `LiquidGlassSurface`（同时导入 `/liquid-glass.css`）。使用该入口才需安装 optional peer `liquid-glass-react@^1.1.1`；工作台可在「玻璃实现」中对比两者。增强材质在客户端挂载后加载，SSR / 加载失败保留实色表面；不将整个容器当作按钮，不启用第三方鼠标弹性。Safari / Firefox 的折射支持有限。

### 按需加载与包体积

只导入使用的组件、基础层和所选主题；动态配色、纹路与第三方玻璃入口分开引入。需要更细粒度的 CSS 时可使用 `/css/foundation.css` 等组件族入口。**JS Tree-shaking 不会自动删除完整 CSS 中的未使用样式；动态 GPU chunk 不等于从总产物移除。**

完整示例、边界与验证方法见 [Tree-shaking 指引](docs/tree-shaking.md)，包含 **Nasti 2.10.1（兼容 2.9 的基本配置）、Vite 8（及 Vite 5–7 的配置差异）**、可选依赖与 SSR、CSS 按需加载，以及 tarball 消费构建回归。

新增设计语言时，在自己的 CSS 中为 `[data-zx-style="你的风格"]` 实现 `--zx-*`，需要明暗配色时再增加同作用域的 `data-zx-color-mode` 规则：

| 共享角色                                                                                           | 控制内容             |
| -------------------------------------------------------------------------------------------------- | -------------------- |
| `--zx-surface`、`--zx-text`、`--zx-accent`、`--zx-on-accent`、`--zx-tonal`、`--zx-on-tonal` 等     | 背景、文字与操作配色 |
| `--zx-font`、`--zx-font-display`、`--zx-label-size`、`--zx-label-weight`、`--zx-label-line-height` | 正文、标题与标签排版 |
| `--zx-radius`、`--zx-border-width`、`--zx-shadow`                                                  | 形状、边界与层次     |
| `--zx-button-height`、`--zx-button-height-sm`、`--zx-button-height-lg`、`--zx-button-padding` 等   | 各尺寸档位与留白     |
| `--zx-motion-duration-short`、`--zx-motion-easing`、`--zx-button-active-transform`                 | 过渡与按压反馈       |
| `--zx-selection-border`、`--zx-selection-shadow`、`--zx-indicator`                                 | 选中轮廓与细线可读性 |
| `--zx-switch-radius`、`--zx-slider-thumb-radius`、`--zx-button-hover-transform`                    | 控件几何与悬停反馈   |

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

Demo 的目录支持检索、组件深链接（`/?component=DatePicker`）、手机选择器、深色样本和可复制 TSX。每个条目包含实际可操作用法；全部条目均可切换各风格。Endfield 与鹤坡的验证覆盖完整目录的桌面 / 手机与浅色 / 深色组合，并抽查字体、交互和浮层。Minimal、Soft、Brutalist 能读取中性合同，但不代表已逐个完成这些风格的视觉验收。设计依据与 Unslop 审查见 [Endfield 验收](docs/endfield-review.md) 与 [鹤坡验收](docs/hepo-review.md)。

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

工作台中的 Filled / Tonal / Outlined / Text 分别对应上述四个 variant，这些是展示文案，不是对其他设计语言的命名要求。尺寸和排版由适配层决定：Clean 与 Endfield 的 `sm / md / lg` 高度为 44 / 48 / 56px；其他三套风格保留原有的 44 / 44 / 52px，不强制跟随 Material 尺度。加载时保留文字与可访问名称、设置 `aria-busy` 并禁用重复交互。提供 hover、active、focus-visible、disabled、loading，尊重 `prefers-reduced-motion`。

## 常用命令

```sh
pnpm dev          # 启动组件工作台
pnpm build        # 按依赖顺序构建组件包与演示应用
pnpm build:lib    # 只构建组件包（tsdown + CSS）
pnpm preview      # 预览生产构建结果
pnpm lint         # Oxlint
pnpm fmt          # Oxfmt
pnpm fmt:check    # 格式检查
pnpm typecheck    # 生成路由类型并检查 workspace
pnpm check        # lint + 格式 + 类型检查
pnpm test         # Lightning：组件 SSR/API 测试
pnpm test:watch   # Lightning：监视组件测试
pnpm test:package # Lightning：tarball 安装、公开导出、类型与 Node SSR
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

- 通过独立适配层扩展 Clean、Endfield 等风格；只列已经实现且可操作的组件，不用不可用的导航制造完整感。
- 风格不改变行为；无法由 tokens 表达的结构差异再考虑 skin，不在组件里堆积 `if (style)`。
- Dialog、Select 等复杂交互使用 React Aria 无样式无障碍 primitives，不自行重造焦点管理。扩展时保留受控状态、原生表单语义与主题隔离。
- 组件库构建与产物验证统一使用 tsdown 和 tarball 消费测试；出现真实复用需求后再拆独立 tokens/primitives 包，版本发布流程单独接入。

## Nasti 注意事项

保持 TanStack runtime/compiler 固定版本配套。`@tanstack/start-plugin-core@1.171.55` 是当前 Nasti 集成所需的编译协议依赖，不单独升级，也不额外添加 `tanstackRouter()`。

Demo 的 `nasti.config.ts` 为 Adobe 的公开 ESM 入口设置了解析桥接：Nasti 2.9.0 默认按子路径分别预打包，会重复实例化 React Aria 的 collection/focus 等 context，导致集合 hydration 报错。桥接通过实际安装路径解析，限于 Demo，不修改上游依赖或组件 API；不能用 Start 不支持的 `bundledDev` 替代。升级 Nasti 后应重跑集合、嵌套弹层与焦点恢复回归，再评估是否删除此桥接。

构建输出位于 `apps/demo/dist/client/` 和 `apps/demo/dist/server/server.mjs`。部署时仅公开 `dist/client/`，不要把整个 `dist/` 作为静态目录。服务端导出 `{ fetch(request) }`，需根据部署平台适配。

更多限制见 [Nasti native integration guide](https://github.com/zixiao-labs/Nasti/blob/v2.9.0/playground/tanstack-react/README.md)。

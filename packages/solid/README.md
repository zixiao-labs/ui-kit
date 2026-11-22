# Zixiao Laboratories UI Kits · Solid

SolidJS 原生组件，不在内部挂载 React。基础样式、七套设计风格与参考图描摹纹样复用现有资产；复杂交互基于 Kobalte。

## 本地开发

```sh
pnpm install
pnpm dev:solid
pnpm build:solid
pnpm preview:solid
```

包仍为 `private: true`，尚未发布 npm。`apps/solid-demo` 是独立的 Nasti Solid SPA，不改变原有 React demo。`pnpm dev` 仍启动 React 版本。

## 使用

```tsx
import { createSignal } from 'solid-js'
import { Button, Modal, TextField } from '@zixiao-labs/ui-kits-solid'
import '@zixiao-labs/ui-kits-solid/styles.css'

export function Example() {
  const [name, setName] = createSignal('鹤坡设计系统')
  return (
    <div data-zx-style="hepo" data-zx-color-mode="light">
      <TextField label="项目名称" value={name()} onChange={setName} />
      <Modal trigger="预览项目" title="项目预览">
        <p>{name()}</p>
        <Button variant="outline">查看详情</Button>
      </Modal>
    </div>
  )
}
```

### 不是 React API 的机械复制

| 场景                               | Solid API                                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| DOM 属性                           | `class`、`for`，不使用 `className`、`htmlFor`                                                 |
| 状态                               | `createSignal`；不要解构 props 或提前读取响应式属性                                           |
| 原生 Input / TextArea              | `value`、`onInput(event)`；Solid 原生输入不使用 React 的 `defaultValue`                       |
| TextField / SearchField / InputOTP | `value` / `defaultValue`、`onChange(string)`                                                  |
| Checkbox / Switch                  | `checked` / `defaultChecked`、`onChange(boolean)`、`disabled`                                 |
| ToggleButton                       | `pressed` / `defaultPressed`、`onChange(boolean)`                                             |
| NumberField                        | `rawValue` / `onRawValueChange(number)`；`value` / `onChange(string)`用于格式化文本           |
| Select / ComboBox                  | `options: { id, label, disabled? }[]`、`value` / `defaultValue` 为 ID、`onChange(id \| null)` |
| Tabs                               | `items: { id, label, content, disabled? }[]`、`value` / `defaultValue`、`onChange(string)`    |
| Accordion                          | `items: { id, title, content, disabled? }[]`、`value` / `defaultValue` 为 ID 数组             |
| 浮层                               | `open` / `defaultOpen`、`onOpenChange`；`trigger` 是文字或非交互 JSX 内容，不传嵌套 Button    |
| Toast                              | 将 `ToastProvider` 放在主题作用域内，子组件调用 `useToast()`；消息保留至用户关闭              |
| FieldError                         | 独立的条件反馈，显式传入 `invalid`；不是 React Aria 上下文插槽                                |

`Input`、`TextArea`、`Label` 为原生低层组件，自行关联 `id`、`for`、`aria-describedby`。`TextField` 为高层组件，自动关联标签和反馈；`multiline` 使用同一上下文的多行输入。`required` 等原生约束负责提交时验证；`validationState="invalid"` 与 `errorMessage` 用于应用提供的验证状态。

`Slider` 当前为单值原生 range，不提供多滑块或纵向模式。`Table` / `TableHeader` / `TableBody` / `Row` / `Column` / `Cell` 保留原生表格语义，不提供 React Aria 数据网格的排序、选择或编辑行为。`Toolbar` 是相关操作组，不宣称实现完整工具栏方向键导航。

### 当前组件范围

- 按钮：Button、ButtonGroup、CloseButton、ToggleButton、ToggleButtonGroup / ToggleButtonGroupItem
- 展示：Surface、Card、Badge、Chip、Avatar、AvatarGroup、Table 及其语义子组件、Typography、Kbd
- 表单：Input、TextArea、TextField、SearchField、NumberField、InputOTP、InputGroup、Label、Description、ErrorMessage、FieldError、Form、Fieldset、Checkbox、RadioGroup / Radio、Switch、Slider
- 反馈：Alert、ProgressBar、ProgressCircle、Meter、Spinner、Skeleton、ToastProvider / useToast
- 导航：Tabs、Accordion、Disclosure、Breadcrumbs、Pagination、Link
- 浮层：Modal、Drawer、Sheet、Popover、Tooltip、Dropdown
- 集合：Select、ComboBox、ListBox、TagGroup
- 工具：Separator、Toolbar、ScrollShadow；可选 PatternBackground、主题生成函数

Demo 有 **49 个可操作目录条目**，部分条目组合展示同一组件族。目录数量不等于导出数量，也不代表与 React 的 74 条目录完全对齐。

**尚未移植**：CheckboxGroup、DisclosureGroup、AlertDialog、Autocomplete、日期 / 时间选择器、颜色选择器、I18nProvider，以及 GPU 阴影、倾斜、背光与第三方液态玻璃增强入口。不会用空壳或静态预览冒充这些能力。

## 样式、主题与纹样

```tsx
import '@zixiao-labs/ui-kits-solid/base.css'
import '@zixiao-labs/ui-kits-solid/themes/endfield.css'
```

`clean`、`endfield`、`hepo`、`hepo-interior`、`minimal`、`soft`、`brutalist` 均支持显式 `light` / `dark`。嵌套风格作用域重置为本风格的浅色默认值；深色需要显式声明。浮层读取触发器的有效 `--zx-*`，并在打开期间跟随祖先属性变化，不依赖其 body portal 的 DOM 位置。

CSS 源文件仍以 `packages/react/src/*.css` 与 `themes/*.css` 为准，这些文件没有 React 依赖。Solid 的 `styles:generate` 将它们复制到忽略的 `styles/`，并追加 Kobalte 状态适配。安装、开发、打包前会自动生成，不手改生成目录。源样式变动后运行：

使用 `/css/*.css` 按组件族加载时，另加 `/css/solid.css` 以接入 Kobalte 的 `data-checked` / `data-pressed` 状态规则；`base.css` 与 `styles.css` 已包含该适配。

```sh
pnpm --filter @zixiao-labs/ui-kits-react styles:generate
pnpm --filter @zixiao-labs/ui-kits-solid styles:generate
```

动态配色不是组件根入口的依赖：

```tsx
import { createTheme, themeToCSS } from '@zixiao-labs/ui-kits-solid/theme'

const options = { primary: '#3f5662', secondary: '#c4a787', radius: 8 }
const tokens = createTheme(options, true)
const css = themeToCSS(options)
// <div data-zx-style="hepo" data-zx-color-mode="dark" style={tokens}>...</div>
// 使用导出的 CSS 时，在作用域增加 data-zx-theme="custom"
```

React 和 Solid 共享 `packages/shared/theme.ts`，不维护两套颜色算法。

同一入口还导出 `themePresets` 和 `zixiaoDarkColors`。预设包括青岛蓬仙 `#47B79C` + `#8F1D22`、霓衣云君 `#F3A694` + `#2E59A7`、丹炉飞龙 `#E94829` + `#5AA4AE`：

```tsx
import { createTheme, themePresets, zixiaoDarkColors } from '@zixiao-labs/ui-kits-solid/theme'

const tokens = createTheme(
  {
    ...themePresets.qingdaoPengxian,
    fontFamily: '"Noto Sans SC", sans-serif',
    displayFontFamily: '"Noto Serif SC", serif',
  },
  true,
)
// <div data-zx-style="clean" data-zx-color-mode="dark" style={tokens}>...</div>

// 紫霄深色优化显式开启，浅色仍为原品牌配色。
createTheme({ ...themePresets.zixiao, darkColors: zixiaoDarkColors }, true)
```

字体栈与 React 使用相同的校验规则，字体文件由应用加载。仅提供正文字体时标题跟随它；不提供字体时保留当前风格。配色预设不等于组件风格，不会自动切换 `data-zx-style`。

Tailwind CSS v4 的可选构建时桥接也使用同一份源文件。在已配置 Tailwind 编译的 CSS 中：

```css
@import 'tailwindcss';
@import '@zixiao-labs/ui-kits-solid/tailwind.css';
@import '@zixiao-labs/ui-kits-solid/base.css' layer(components);
@import '@zixiao-labs/ui-kits-solid/themes/clean.css' layer(components);
```

在 JSX 中使用 `class="bg-zx-surface text-zx-text font-zx rounded-zx"` 等语义工具类。`@theme inline` 保证嵌套作用域、动态配色和字体实时生效，无需重新编译。组件 CSS 应保持在 `components` layer，不重复导入未分层的样式；桥接不依赖 React，不含重置、字体下载或 Tailwind v3 插件。

```tsx
import { PatternBackground } from '@zixiao-labs/ui-kits-solid/patterns'
import '@zixiao-labs/ui-kits-solid/patterns.css'

export const Example = () => (
  <PatternBackground pattern="yunlei" style={{ padding: '32px' }}>
    项目档案
  </PatternBackground>
)
```

纹样路径复用最新参考图描摹数据；不传 `pattern` 不生成装饰 SVG，装饰层不拦截交互。

## 构建与消费

组件包用 tsdown 输出 **ESM + 保留 JSX + `.d.ts`**。消费者必须用 Solid 编译器处理组件的 `.jsx`，分别生成 DOM 或 SSR 指令；不能直接用 Node 导入未编译的 JSX。包没有 React、React DOM 或 `react-aria-components` 依赖。

本地 exports 指向源码，pnpm pack 的 `publishConfig.exports` 指向 dist，根入口与纹样入口提供 `solid` 条件。样式保持独立，`sideEffects: ["**/*.css"]` 防止样式被误删。动态配色与纹样从独立子路径导入。

类型验证沿用 workspace 的 `strict: true`、`skipLibCheck: true`。Kobalte 0.13.14 的上游命名空间声明在 TypeScript 7 下关闭 `skipLibCheck` 会触发 TS2693；本次没有修改 node_modules 或放宽消费端 TSX 的类型检查，不宣称支持 `skipLibCheck: false`。

```sh
pnpm test:package
# 同时验证 React 和 Solid：
# pack → 独立安装 → Bundler / NodeNext 类型检查
# Solid 额外用 Nasti 分别编译浏览器和服务端，再用真实 Node 运行 SSR

pnpm exec lightning run --config lightning.e2e.config.ts tests/solid.e2e.test.ts
```

Solid SPA 的 Nasti 配置沿用 React demo 的解决思路：将 Kobalte 子路径解析到同一组公开 ESM 文件，避免独立预打包复制焦点作用域栈。否则在 Dialog 中打开 Select 时，父级焦点陷阱会将它立刻关闭。该桥接仅限 demo；SSR 消费使用 Solid 编译器及 Kobalte 的 `solid` 导出，不复用 SPA 的浏览器别名。

外层 Modal 使用 body portal；其内部的 Select、ComboBox、Popover、Tooltip、Dropdown 挂载到真实的 Dialog.Content。这样不会让父模态框在 WebKit 中把新插入的空 portal wrapper 异步设为 `aria-hidden`。滚动保留在内部内容区，外层允许浮层溢出，不裁切菜单；焦点、关闭与恢复仍由 Kobalte 管理。

所有 demo 配置选择器（尺寸、明暗、手机目录）都使用库内 Select，不回退到系统菜单。Switch / Checkbox / Radio 使用独立的 Kobalte Control 与 Label，避免在原生外层 label 中点击 Control 时发生二次切换。Fieldset 的禁用状态也传播到自定义 Control，不能只禁用隐藏 input。

WebKit 回归可用 `UI_KITS_TEST_WEBKIT=1 pnpm exec lightning run --config lightning.e2e.config.ts tests/solid.e2e.test.ts` 运行，需先安装 `pnpm exec playwright install webkit`。

验收与 Unslop 检查见 [`docs/solid-review.md`](../../docs/solid-review.md)。

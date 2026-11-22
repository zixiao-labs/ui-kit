# Zixiao Laboratories UI Kits · React

一套组件 API，共享语义与交互，多种视觉表达。基于 React 19 和 React Aria，支持作用域内独立的风格与明暗配色。

公开 npm 包的发布配置已就绪；是否可安装以 npm registry 中实际发布的版本为准。许可证为 MIT，版权署名 Zixiao Laboratories。Solid 版本暂不发布。

发布后安装：

```sh
pnpm add @zixiao-labs/ui-kits-react react@^19 react-dom@^19
```

## 使用

```tsx
import { Button } from '@zixiao-labs/ui-kits-react'
import '@zixiao-labs/ui-kits-react/styles.css'

export function Example() {
  return (
    <div data-zx-style="clean" data-zx-color-mode="light">
      <Button variant="solid">创建项目</Button>
    </div>
  )
}
```

仅加载一种风格时，改为导入基础层与对应适配层：

```tsx
import '@zixiao-labs/ui-kits-react/base.css'
import '@zixiao-labs/ui-kits-react/themes/endfield.css'
```

随后在组件作用域设置 `data-zx-style="endfield"`，按需设置 `data-zx-color-mode="dark"`。可用风格包括 `clean`、`endfield`、`hepo`、`hepo-interior`、`minimal`、`soft`、`brutalist`。

动态品牌主题从独立入口加载：

```tsx
import { createTheme, themeToCSS } from '@zixiao-labs/ui-kits-react/theme'
```

### 配色、字体与 Tailwind CSS

`themePresets` 提供紫霄、松林、海岸、朱砂、鹤坡、鹤坡·室内，以及青岛蓬仙（`#47B79C` + `#8F1D22`）、霓衣云君（`#F3A694` + `#2E59A7`）、丹炉飞龙（朱砂 `#E94829` + 天水碧 `#5AA4AE`）。配色预设不改变组件的风格。

```tsx
import { createTheme, themePresets, zixiaoDarkColors } from '@zixiao-labs/ui-kits-react/theme'

const options = {
  ...themePresets.qingdaoPengxian,
  fontFamily: '"Noto Sans SC", sans-serif',
  displayFontFamily: '"Noto Serif SC", serif',
}
const tokens = createTheme(options, true)
// <div data-zx-style="clean" data-zx-color-mode="dark" style={tokens}>...</div>

// 可选的紫霄深色优化；浅色保持原品牌色，默认不启用。
createTheme({ ...themePresets.zixiao, darkColors: zixiaoDarkColors }, true)
// 深色填色 #422256 + #D7A547
```

正文字体会用于控件；只传 `fontFamily` 时标题跟随正文，均省略时保留风格默认值。字体栈限 512 字符，不接受 CSS 声明、`url()` 或 `var()`；字体文件需由应用自行加载。`themeToCSS(options)` 同时输出明暗 token 和字体，静态使用需加 `data-zx-theme="custom"`。

Tailwind v4 用户可在**经过 Tailwind 编译**的应用 CSS 中导入可选桥接：

```css
@import 'tailwindcss';
@import '@zixiao-labs/ui-kits-react/tailwind.css';
@import '@zixiao-labs/ui-kits-react/base.css' layer(components);
@import '@zixiao-labs/ui-kits-react/themes/clean.css' layer(components);
```

使用 `bg-zx-surface text-zx-text font-zx rounded-zx`、`bg-zx-accent text-zx-on-accent` 等工具类，读取当前作用域的有效 token。用 `font-zx-display` 访问标题字体。预设、自定义和明暗模式都无需重新编译；组件 CSS 放在 `components` layer，让 utilities 可以覆盖组件样式，不要重复导入未分层的 CSS。桥接不加载预设或自动切换明暗，也不提供 v3 插件；普通组件使用者无需 Tailwind 依赖。

## 可选底纹与玻璃

```tsx
import { PatternBackground } from '@zixiao-labs/ui-kits-react/patterns'
import '@zixiao-labs/ui-kits-react/patterns.css'

;<PatternBackground pattern="hui" style={{ padding: 32 }}>
  <Button>查看档案</Button>
</PatternBackground>
```

`hui` / `yunlei` / `lei` 分别为从参考图片实际矢量描摹的回纹、云雷纹、雷纹；云雷纹保留完整纹带，回纹和雷纹连续平铺。不传 `pattern` 则不生成 SVG。用 `--zx-pattern-color` 和 `--zx-pattern-opacity` 调整颜色与强度（默认 0.12）。装饰不截获输入，不自动应用于主题。

第三方液态玻璃需由应用安装 `liquid-glass-react@^1.1.1`（optional peer），与普通组件分离：

```tsx
import { LiquidGlassSurface } from '@zixiao-labs/ui-kits-react/liquid-glass'
import '@zixiao-labs/ui-kits-react/liquid-glass.css'

;<LiquidGlassSurface cornerRadius={16} displacementScale={32}>
  <Button>查看档案</Button>
</LiquidGlassSurface>
```

适配器只在客户端挂载后动态加载该库，SSR / 首次 hydration / 加载失败保留实色表面与原生操作。只折射背景，内容不随载入或尺寸更新重新挂载；关闭弹性、鼠标跟踪与彩色像差。Safari / Firefox 的边缘折射有限，不承诺与 Chromium 等效。

## Tree-shaking

- 用 ESM 命名导入；不要把整个组件命名空间做成动态注册表。
- `/theme`、`/patterns`、`/liquid-glass` 独立于根入口；不用时不导入，普通项目无需安装第三方玻璃库。
- 只加载 `base.css` + 一种主题，避免同时加载全量 `styles.css`。
- 普通 Button 可进一步只加载 `/css/foundation.css` + 主题；启用 effects 再加载 `/css/effects.css`，组件过渡需要 `/css/motion.css`。其他组件族源样式也从 `/css/*.css` 导出，复杂组合建议使用基础全量层。
- CSS 显式导入是副作用，不会因组件未使用自动裁剪；保留包的 `sideEffects: ["**/*.css"]`。
- 内置 effects 仍由组件共享实现引用，省略 props 不保证打包器移除 GPU 后端的动态 chunk；动态分包节省首屏下载，不保证减小所有输出的总和。
- Nasti 2.9–2.10 / Vite 8 在 `build.rolldownOptions` 配置 `treeshake: true`；Vite 5–7 对应 `build.rollupOptions`。保持生产压缩开启，不以开发预打包大小判断结果。

workspace 的 `docs/tree-shaking.md` 包含完整 Nasti / Vite 配置、延迟加载示例与生产验证步骤。

## 构建约定

- 只提供 ESM；组件和 `theme` 入口均附带 TypeScript 声明与 JS source map。
- 需要 React / React DOM 19；运行时依赖保持 external，CSS 需显式导入。
- GPU 阴影按需动态加载，默认使用组件不会申请 GPU。
- workspace 导出指向源码，`pnpm pack` 通过 `publishConfig.exports` 切换到 `dist`；不要使用 `npm pack` 或在源码目录直接 `npm publish`。CI 用 npm OIDC 发布已转换并通过消费验证的 `.tgz`。
- `pnpm build` 生成最新 CSS 并执行 tsdown，`prepack` 自动运行构建。
- 在 workspace 根目录执行 `pnpm test:package`，验证真实 tarball 的安装、导出、类型与 Node SSR。
- 维护者的 CI、首次建包、Trusted Publisher 绑定和版本标签步骤见仓库 `docs/publishing.md`。

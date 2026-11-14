# Zixiao Laboratories UI Kits · React

一套组件 API，共享语义与交互，多种视觉表达。基于 React 19 和 React Aria，支持作用域内独立的风格与明暗配色。

当前仍为私有 workspace 包，尚未发布 npm；可用 `pnpm pack` 生成本地安装包验证。

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
- workspace 导出指向源码，`pnpm pack` / `publish` 通过 `publishConfig.exports` 切换到 `dist`；不要使用 `npm pack` / `publish`。
- `pnpm build` 生成最新 CSS 并执行 tsdown，`prepack` 自动运行构建。
- 在 workspace 根目录执行 `pnpm test:package`，验证真实 tarball 的安装、导出、类型与 Node SSR。

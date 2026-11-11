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

## 构建约定

- 只提供 ESM；组件和 `theme` 入口均附带 TypeScript 声明与 JS source map。
- 需要 React / React DOM 19；运行时依赖保持 external，CSS 需显式导入。
- GPU 阴影按需动态加载，默认使用组件不会申请 GPU。
- workspace 导出指向源码，`pnpm pack` / `publish` 通过 `publishConfig.exports` 切换到 `dist`；不要使用 `npm pack` / `publish`。
- `pnpm build` 生成最新 CSS 并执行 tsdown，`prepack` 自动运行构建。
- 在 workspace 根目录执行 `pnpm test:package`，验证真实 tarball 的安装、导出、类型与 Node SSR。

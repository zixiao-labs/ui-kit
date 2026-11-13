# 按需加载与 Tree-shaking

组件包只输出 ESM，`sideEffects: ["**/*.css"]` 表示 JS 可按未使用的导出裁剪，CSS 的显式导入必须保留。**Tree-shaking、动态分包、压缩不是同一件事**：前者删除未使用代码，动态导入推迟下载，压缩减少保留代码的字节数。

## 1. 用命名导入，不建立运行时全量注册表

```tsx
import { Button } from '@zixiao-labs/ui-kits-react'
```

静态命名导入即可，不需要 Babel 的按需导入插件。避免 `import * as Kits` 后根据字符串读取 `Kits[name]`、遍历整个命名空间或向全局注册全部组件，这会让打包器无法判断哪些导出不用。单纯的静态 `Kits.Button` 不一定阻止优化，关键是不要动态枚举。

主题生成、传统纹路和第三方玻璃实现有各自的独立入口，**没有从主入口重新导出**：

| 功能                     | JS 入口                   | 额外 CSS            | 不使用时                                |
| ------------------------ | ------------------------- | ------------------- | --------------------------------------- |
| HCT 动态配色             | `/theme`                  | 无                  | 不导入即可排除 Material Color Utilities |
| 回纹 / 云雷纹 / 雷纹     | `/patterns`               | `/patterns.css`     | 不导入即可排除纹路组件、SVG 路径与样式  |
| Liquid Glass React 增强  | `/liquid-glass`           | `/liquid-glass.css` | 不导入即可排除适配器和第三方库          |
| 内置轻量玻璃、倾斜与背光 | 主组件的 `effects`        | 基础 CSS 中包含     | 默认不启用；不是独立 JS 模块边界        |
| GPU 阴影                 | 主组件的 `effects.shadow` | 基础 CSS 中包含     | 后端动态分包；默认不执行、不申请 GPU    |

**不要把 `effects={{ glass: false }}` 或省略 `effects` 误称为编译时裁剪。** 当前 Button / Card / Surface 的共享实现仍引用 effects 模块和 GPU 的动态 import，构建中可能保留后端 chunk；运行时默认不加载并不代表整个输出目录不含它。不要手工删除 chunk。若产品要求彻底移除这条后端路径，需要另外设计无 effects 的构建入口，当前未提供。

`liquid-glass-react` 是 optional peer，普通组件消费者无需安装。只有使用增强入口的应用才安装：

```sh
pnpm add liquid-glass-react@^1.1.1
```

workspace Demo 通过组件包的开发依赖验证 1.1.1。该库在渲染时读取 `navigator`，适配器只在客户端挂载后动态加载；SSR、首次 hydration 与加载失败时保留实色表面和可操作内容。

## 2. CSS 不会随 JS 导出自动裁剪

### 推荐：基础层 + 一种风格

```tsx
import { Button } from '@zixiao-labs/ui-kits-react'
import '@zixiao-labs/ui-kits-react/base.css'
import '@zixiao-labs/ui-kits-react/themes/hepo.css'
```

这会排除其他主题，但 `base.css` 仍包含所有共享组件样式。不要再同时导入 `styles.css`；它是完整的便利入口，不是按需入口。

### 更小：只用普通 Button

```tsx
import { Button } from '@zixiao-labs/ui-kits-react'
import '@zixiao-labs/ui-kits-react/css/foundation.css'
import '@zixiao-labs/ui-kits-react/themes/hepo.css'

export function Save() {
  return (
    <div data-zx-style="hepo">
      <Button>保存草稿</Button>
    </div>
  )
}
```

`foundation.css` 包含中性 tokens、主题作用域重置与 Button。使用材质效果再加 `/css/effects.css`，使用组件过渡再加 `/css/motion.css`。其他源样式按实际组件族选择 `/css/display.css`、`forms.css`、`navigation.css`、`pickers.css`；复杂日期、浮层和组合表单有跨族依赖，不熟悉依赖时优先使用 `base.css`。这些入口都是平铺文件，不依赖 CSS `@import` 展开。

不要把组件包或消费应用设成无条件 `sideEffects: false`，也不要全局配置 `moduleSideEffects: false`：可能误删 CSS、polyfill 和第三方初始化。不要靠简单文本扫描裁剪 React Aria 的 `data-*` 状态选择器；如果使用 CSS 清理器，需要保留组件状态与 portal 选择器。

## 3. Nasti 2.10.1 配置（基本配置兼容 2.9）

当前 Demo 使用 Nasti 2.10.1 + TanStack React Start，不需要安装 Vite 或 Rollup 插件。Nasti 的构建底层选项是 **`build.rolldownOptions`**：

```ts
import { defineConfig, tanstackStart } from '@nasti-toolchain/nasti'

export default defineConfig({
  framework: 'react',
  plugins: [tanstackStart()],
  build: {
    minify: true,
    rolldownOptions: {
      treeshake: true,
    },
  },
})
```

这是配置片段，合并到现有配置，不要替换 Demo 现有的 `resolve.alias`：它们解决 React Aria 在开发预打包中的重复 context。Demo 已显式使用上述构建选项。手动 vendor 分包只改变下载和缓存边界，不会让未使用组件消失；不要用 `output.codeSplitting: false` 内联所有动态导入。

上述压缩和 Tree-shaking 配置也适用于 Nasti 2.9。**2.10 的手动分包改为 `output.codeSplitting: { groups: [...] }`，从旧配置迁移时不要继续使用 `advancedChunks`**；本例无需手动分包，保留默认自动分包即可。

运行消费应用的 `pnpm build`，检查 `apps/demo/dist/client` 的客户端文件；不要把 `dist/server` 加入浏览器体积。`optimizeDeps` 和开发服务器请求数不能证明生产 Tree-shaking 生效。Demo 为了展示目录会使用全部组件和多种风格，本来就不是最小消费应用。

参考：[Nasti 官方 README 的生产构建章节](https://github.com/zixiao-labs/Nasti)。本例同时对照了实际安装的 2.10.1 README。

## 4. Vite 配置

Vite 是消费项目的另一种选择，**不是此 workspace 的新依赖**。Vite 8 使用 Rolldown：

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    minify: true,
    cssCodeSplit: true,
    rolldownOptions: {
      treeshake: true,
    },
  },
})
```

Vite 5–7 使用 Rollup，应把这里的 `rolldownOptions` 改为 `rollupOptions`；不要把两套选项复制到同一个版本。生产构建默认就支持 Tree-shaking，显式写出主要是便于审查；不要通过修改开发预打包选项来代替生产构建检查。

`cssCodeSplit: true` 保留异步功能的 CSS 分包。若做 Vite library mode，需要显式设定它（library mode 默认关闭 CSS 分包）。配置不会自动把一个已导入的 `styles.css` 拆成按组件使用量裁剪的 CSS。

参考：[Vite 8 构建选项](https://vite.dev/config/build-options)、[Vite 8 迁移说明](https://vite.dev/guide/migration)。

## 5. 只在需要时下载增强材质

增强入口本身已经在挂载后动态导入第三方库。只有条件成立时才渲染它：

```tsx
import { Card } from '@zixiao-labs/ui-kits-react'
import { LiquidGlassSurface } from '@zixiao-labs/ui-kits-react/liquid-glass'
import '@zixiao-labs/ui-kits-react/base.css'
import '@zixiao-labs/ui-kits-react/themes/hepo.css'
import '@zixiao-labs/ui-kits-react/liquid-glass.css'

export function Project({ enhanced }: { enhanced: boolean }) {
  const content = <p>北岸设计 · 周五评审</p>
  return enhanced ? <LiquidGlassSurface>{content}</LiquidGlassSurface> : <Card>{content}</Card>
}
```

这是“可能用到，延迟下载”，不是“构建时删除”。如果项目完全不使用增强功能，连这条 import 和对应 CSS 都不写，才可从整个产物排除它。需要连适配器和 CSS 也延迟时，可把上例放到独立模块，再在客户端按路由或功能开关 `import('./enhanced-project')`；在支持 SSR 的框架中使用该框架的客户端加载边界。

## 6. 如何验证，不只看主 chunk

```sh
pnpm build:lib
pnpm test:package
```

tarball 回归会真正 pack、安装、检查 JS / 类型 / CSS / Node SSR，并对已打包的 ESM 执行 Rolldown 消费构建：

- 只导出 Button；
- 导入但不使用 `/theme`、`/patterns`、`/liquid-glass`；
- 显式使用纹路。

前两份产物的原始字节和 gzip 必须一致；所有 JS chunk 均不得引用 Liquid Glass React、纹路或 Material Color Utilities。第三份保留纹路。这是独立入口隔离验证，运行时依赖保持 external，**不是完整应用的体积数据**。GPU chunk 仍可能存在，见上面的边界说明。

消费项目应另外执行自己的 `nasti build` 或 `vite build`，比较相同锁文件与压缩配置下的最小页面和增强页面；统计所有客户端 JS / CSS 的原始、gzip / Brotli，以及浏览器首次进入与打开功能后的 Network 请求。动态分包可能减小首屏而不减小总输出，两个数字都应记录。未在本仓库引入 Vite fixture，Vite 配置根据官方文档核实，但不是此处的实际运行验证。

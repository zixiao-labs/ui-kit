# React 接入：安装、作用域与品牌配色

`@zixiao-labs/ui-kits-react` 是 React 19 / React DOM 19 的 ESM 组件包。根入口导出组件和类型，CSS 必须显式加载。业务交互、布局和应用级主题偏好由应用决定；不用安装 Tailwind 或 Material 组件库。各风格的材质与适用场景见[七种风格](styles.md)，表单等实际组合见[组件用法](components.md)。

## 安装并加载一种风格

在已有 React 19 应用中执行 `pnpm add @zixiao-labs/ui-kits-react`。若尚未安装对应的 peer，则执行：

```sh
pnpm add @zixiao-labs/ui-kits-react react@^19 react-dom@^19
```

在应用允许加载全局 CSS 的入口先导入 `base.css` 再导入适配层。下面是鹤坡·室内（Hepo Interior）浅色；换成鹤坡（Hepo）时，同时把文件和 `data-zx-style` 改成 `hepo`：

```tsx
import { Button } from '@zixiao-labs/ui-kits-react'
import '@zixiao-labs/ui-kits-react/base.css'
import '@zixiao-labs/ui-kits-react/themes/hepo-interior.css'

export function ExhibitPage({ onBrowse }: { onBrowse: () => void }) {
  return (
    <main
      data-zx-style="hepo-interior"
      data-zx-color-mode="light"
      style={{ background: 'var(--zx-surface)', color: 'var(--zx-text)' }}
    >
      <h1 style={{ fontFamily: 'var(--zx-font-display)' }}>木作展陈</h1>
      <p style={{ fontFamily: 'var(--zx-font)' }}>按器物用途浏览馆藏。</p>
      <Button variant="solid" onClick={onBrowse}>
        浏览馆藏
      </Button>
    </main>
  )
}
```

主题属性给作用域提供 token，不会替应用的 `main`、`body` 等元素填色或更换字体。外壳用 `--zx-surface` / `--zx-text`，区域分层用 `--zx-surface-subtle` / `--zx-surface-raised`，着色操作读 `--zx-accent` / `--zx-on-accent`，选中或次要填面读 `--zx-tonal` / `--zx-on-tonal`。`Typography` 是 `<p>`；页面标题仍用 `h1`–`h6`。

## 同一页面切换或嵌套多种风格

允许切换任意风格时只导入 `styles.css`。只让少数风格共存时，也可以导入 `base.css` 和所需的多个适配层。不要同时使用这两套导入方式：

```tsx
import { Button, Card, Modal } from '@zixiao-labs/ui-kits-react'
import '@zixiao-labs/ui-kits-react/styles.css'

export function Workspace() {
  return (
    <main data-zx-style="clean" data-zx-color-mode="light">
      <Card data-zx-style="hepo" data-zx-color-mode="dark">
        <Modal title="馆藏档案" trigger={<Button variant="tonal">打开档案</Button>}>
          {({ close }) => <Button onClick={close}>返回工作台</Button>}
        </Modal>
      </Card>
    </main>
  )
}
```

`data-zx-style` 重置这一层的 token；内层不填 `data-zx-color-mode` 时默认浅色，不自动沿用外层深色。要跟随系统，由应用读取 `prefers-color-scheme` 后传入 `light` 或 `dark`，不是传 `system`。SSR 与客户端首渲应使用相同的初始偏好。包里的 Modal、Select 等浮层保留触发器所在的主题作用域，不需要额外主题 Provider。

## 原生风格、明暗与配色预设不是同一件事

- `data-zx-style` 选择原生造型、字体和状态，包括原生明暗配色。
- `data-zx-color-mode` 选择该作用域的明暗模式。
- `themePresets` 提供品牌主辅色种子。`themePresets.hepoInterior` 不是 `data-zx-style="hepo-interior"` 的替代；它不会安装鹤坡·室内的字体或形状。

### 运行时：用 `createTheme` 生成当前模式的 token

从 `/theme` 导入。下面保留 Clean 适配层并覆盖品牌配色和容器圆角：

```tsx
import { Button } from '@zixiao-labs/ui-kits-react'
import { createTheme, themePresets } from '@zixiao-labs/ui-kits-react/theme'
import '@zixiao-labs/ui-kits-react/base.css'
import '@zixiao-labs/ui-kits-react/themes/clean.css'

const theme = { ...themePresets.qingdaoPengxian, radius: 12 }

export function BrandedWorkspace({ dark }: { dark: boolean }) {
  return (
    <section
      data-zx-style="clean"
      data-zx-color-mode={dark ? 'dark' : 'light'}
      style={createTheme(theme, dark)}
    >
      <Button>新建项目</Button>
    </section>
  )
}
```

`primary`、`secondary` 及可选的 `darkColors` 使用六位十六进制值。`radius` 范围 0–32px（默认 12），生成的圆角 token 会覆盖部分原生形状；想完整保留原生样式时不要调用生成器。`fontFamily` 和 `displayFontFamily` 控制正文字体和展示字体；只传前者时两者相同，均不传则沿用适配层。包不自带字体文件。`darkColors` 仅在深色选择另一组种子；例如紫霄配色可显式用 `zixiaoDarkColors`。

### 静态：用 `themeToCSS` 生成两个模式的作用域

也可在构建时生成 CSS，而不是每次渲染调用 `createTheme`：

```ts
import { themePresets, themeToCSS } from '@zixiao-labs/ui-kits-react/theme'

const brandCss = themeToCSS({ ...themePresets.zixiao, radius: 12 })
```

将返回的 `brandCss` 写入应用样式，排在基础层和适配层之后。在目标元素加 `data-zx-theme="custom"`，同时保留 `data-zx-style` 与所选 `data-zx-color-mode`。不要为同一作用域再加一份内联 `createTheme`。

## Tailwind CSS v4 桥接（可选）

在经过 Tailwind v4 编译的应用 CSS 中加载：

```css
@import 'tailwindcss';
@import '@zixiao-labs/ui-kits-react/tailwind.css';
@import '@zixiao-labs/ui-kits-react/base.css' layer(components);
@import '@zixiao-labs/ui-kits-react/themes/hepo.css' layer(components);
```

`bg-zx-surface text-zx-text font-zx` 用于页面外壳；`bg-zx-accent text-zx-on-accent` 用于成对填色，`font-zx-display` 用于标题。桥接读取当前作用域，不加载主题，也不替代明暗属性。不需要 Tailwind 时直接用 CSS 变量。

## 排查常见接入问题

- 组件没样式：检查 CSS 是否进了应用产物；单独导入 `themes/hepo.css` 只有 token，没有组件规则。
- TypeScript 对 CSS 副作用导入报 `TS2882`：加载应用框架的 CSS 类型；没有框架声明时，在应用的 `.d.ts` 文件中声明 `declare module '*.css'`。这只补类型，CSS 仍需由打包器处理。
- 填色正确但页面底色没有变化：应用外壳没有读取 `--zx-surface`；检查该规则是否在主题作用域之内。
- 只有内层区域突然变浅：在内层 `data-zx-style` 旁显式设置 `data-zx-color-mode="dark"`。
- 使用了鹤坡配色却没有宋体或小圆角：选了配色种子而不是原生风格；确认 `data-zx-style` 和 CSS 导入。
- 宋体在设备间不同：默认是字体回退栈。应用若要求统一字形，需要加载有授权的字体，并保留合适的中文回退。

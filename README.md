# Zixiao UI

`@zixiao-labs` 多风格 React 组件库的起始骨架。先跑通 **workspace → 组件 → 风格 → demo page**，再逐步扩展组件数量。

## 本地开发

需要 Node.js >=22.12.0 和 pnpm 12.16.1。

```sh
pnpm install
pnpm dev
```

demo 保留原仓库的 **Nasti + React Start**，没有额外引入 Vite。安装工具和框架依赖放在应用包内，以符合 Nasti 的 workspace 解析方式。

## 目录与边界

```text
apps/
  demo/                  @zixiao-labs/demo：演示页面，Nasti 开发/SSR 构建
packages/
  react/                 @zixiao-labs/react：组件行为、类型和主题 CSS
tests/                   demo 的浏览器回归测试
.oxlintrc.json            workspace 共享 Oxlint 配置
.oxfmtrc.json             workspace 共享 Oxfmt 配置
tsconfig.base.json       workspace 共享 TypeScript 配置
```

- 内部依赖统一使用 `workspace:*`，不从 npm 拉取同名包。
- 所有包暂时为 `private`。组件包通过源码 exports 交给 Nasti 编译，**目前不是 npm 发布产物**。
- React 是组件包的 peer dependency；开发时使用 React 19。
- 暂不引入 Turbo、独立 primitives/tokens 包或额外的库打包器。出现真实的复用和发布需求时再拆分。

## 多风格的第一条规则

**同一个组件 API；行为不随风格变化；外观由局部 CSS tokens 控制。**

```tsx
import { Button } from '@zixiao-labs/react'
import '@zixiao-labs/react/styles.css'

export function Example() {
  return (
    <div data-zx-style="soft" data-zx-color-mode="dark">
      <Button variant="solid" size="md" onClick={() => console.log('clicked')}>
        开始创造
      </Button>
    </div>
  )
}
```

当前包含 `minimal`、`soft`、`brutalist` 三个风格样例，以及每个风格的 light/dark 配色。它们是验证主题机制的起点，不代表最终品牌规范。

把 `data-zx-style` 和 `data-zx-color-mode` 放在同一个作用域元素上。不同作用域可在同一页面并存；嵌套的 `data-zx-style` 会重置为浅色默认值，需要深色时显式指定 `data-zx-color-mode="dark"`。

`Button` 保留原生 button 属性（包括 React 19 的 `ref`），默认 `type="button"`，支持：

| 属性       | 值                            | 默认    |
| ---------- | ----------------------------- | ------- |
| `variant`  | `solid` / `outline` / `ghost` | `solid` |
| `size`     | `sm` / `md` / `lg`            | `md`    |
| `loading`  | `boolean`                     | `false` |
| `disabled` | 原生属性                      | `false` |

加载时保留按钮文字与可访问名称，设置 `aria-busy` 并禁用重复交互。组件提供 hover、active、focus-visible、disabled 和 loading 状态，并尊重减少动态效果的系统偏好。

## 常用命令

```sh
pnpm dev          # 启动 demo
pnpm build        # 按 workspace 依赖顺序构建，目前构建 demo
pnpm preview      # 预览构建结果
pnpm lint         # Oxlint：TypeScript / React Hooks / 基础无障碍检查
pnpm lint:fix     # Oxlint 自动修复
pnpm fmt          # Oxfmt：格式化 JS/TS/JSON/CSS/Markdown/YAML
pnpm fmt:check    # 只检查格式，不写文件
pnpm typecheck    # 为 demo 生成路由类型，再检查各包类型
pnpm check        # lint + 格式 + 类型检查
```

Oxlint 与 Oxfmt 只安装在根目录，全 workspace 共用一套配置。不同时维护 ESLint/Prettier；自动生成的路由、构建输出、lockfile（格式化）和 agent skills 不纳入检查。Oxlint 不代替 TypeScript 类型检查；当前未开启额外的 type-aware lint。

### 浏览器验证

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

测试先运行真实生产构建，然后通过 Nasti preview 检查 SSR hydration、风格与明暗切换、组件状态、键盘交互和移动端布局。

## 下一步

1. 补充 Button 的 API 边界与组件级测试，再扩展 Input、Checkbox 等基础组件。
2. 遇到 token 无法覆盖的结构差异时，增加独立 skin 组件；不要让一个组件内部长出大量 `if (style)`。
3. 添加 Dialog、Select 等复杂控件前，评估成熟的无样式无障碍 primitives，不自行重造焦点管理。
4. 准备发布时增加 JS + `.d.ts` + CSS 构建产物、包产物验证、版本管理和发布 CI，再移除组件包的 `private`。不需要申请新的 scope，包名继续使用 `@zixiao-labs/*`。

## Nasti 注意事项

保持 TanStack runtime/compiler 固定版本配套。尤其 `@tanstack/start-plugin-core@1.171.55` 是 Nasti 检查的私有编译协议，不要单独升级，也不要再添加一个 `tanstackRouter()`。

构建输出在 `apps/demo/dist/client/` 和 `apps/demo/dist/server/server.mjs`。部署时仅公开 `dist/client/`；不要把整个 `dist/` 作为静态目录。服务端导出 `{ fetch(request) }`，需根据部署平台适配。

更多限制见 [Nasti native integration guide](https://github.com/zixiao-labs/Nasti/blob/v2.9.0/playground/tanstack-react/README.md)。

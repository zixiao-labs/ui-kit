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

`styles.css` 是包含全部现有风格的便捷入口，默认选择 Clean。它不是必须使用的全局设计系统。由于当前 Nasti 开发模式不展开相对 CSS `@import`，该入口由基础层和适配层自动拼接为扁平 CSS；修改源样式后运行 `pnpm --filter @zixiao-labs/ui-kits-react styles:generate`。测试会检查入口与源文件同步，不手工维护两份样式。

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

新增设计语言时，在自己的 CSS 中为 `[data-zx-style="你的风格"]` 实现 `--zx-*`，需要明暗配色时再增加同作用域的 `data-zx-color-mode` 规则：

| 共享角色                                                                                         | 控制内容             |
| ------------------------------------------------------------------------------------------------ | -------------------- |
| `--zx-surface`、`--zx-text`、`--zx-accent`、`--zx-on-accent`、`--zx-tonal`、`--zx-on-tonal` 等   | 背景、文字与操作配色 |
| `--zx-font`、`--zx-label-size`、`--zx-label-weight`、`--zx-label-line-height`                    | 字体与标签排版       |
| `--zx-radius`、`--zx-border-width`、`--zx-shadow`                                                | 形状、边界与层次     |
| `--zx-button-height`、`--zx-button-height-sm`、`--zx-button-height-lg`、`--zx-button-padding` 等 | 各尺寸档位与留白     |
| `--zx-motion-duration-short`、`--zx-motion-easing`、`--zx-button-active-transform`               | 过渡与按压反馈       |

每个作用域都从中性默认值开始，避免继承父作用域的语言特征。适配层可以直接赋值，也可映射自己的 token 命名；不需要修改 Button 或增加 `if (style)`。

Clean 是受 Material 3 启发的 Web 实现，不是 Google 官方组件，也没有引入维护模式的 `@material/web`。它目前使用静态明暗配色，尚未实现动态种子色、高对比等级或完整 Material 3 组件集。这些限制不约束其他设计语言。

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

开发服务验证不等于生产构建验证；部署前仍需单独执行 `pnpm build` 和生产预览检查。

## 扩展原则

- 先完善 Clean 的基础组件，再扩展 Input、Checkbox 等。只列已经实现的组件，不用不可用的导航制造完整感。
- 风格不改变行为；无法由 tokens 表达的结构差异再考虑 skin，不在组件里堆积 `if (style)`。
- Dialog、Select 等复杂交互优先评估成熟的无样式无障碍 primitives，不自行重造焦点管理。
- 出现真实复用和发布需求后再拆独立 tokens/primitives 包，引入库构建、产物验证和版本发布流程。

## Nasti 注意事项

保持 TanStack runtime/compiler 固定版本配套。`@tanstack/start-plugin-core@1.171.55` 是当前 Nasti 集成所需的编译协议依赖，不单独升级，也不额外添加 `tanstackRouter()`。

构建输出位于 `apps/demo/dist/client/` 和 `apps/demo/dist/server/server.mjs`。部署时仅公开 `dist/client/`，不要把整个 `dist/` 作为静态目录。服务端导出 `{ fetch(request) }`，需根据部署平台适配。

更多限制见 [Nasti native integration guide](https://github.com/zixiao-labs/Nasti/blob/v2.9.0/playground/tanstack-react/README.md)。

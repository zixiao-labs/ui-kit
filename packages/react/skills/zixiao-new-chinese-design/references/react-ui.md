# React 接入与验收

## 怎样使用这份 Skill

点名 `zixiao-new-chinese-design`，并提供真实任务、内容和边界。下列两种写法分别对应实现与只读评审：

> 用 `zixiao-new-chinese-design` 给馆藏工作台做一页器物列表。保留现有筛选、路由和表格，首屏主动作是按年代筛选。采用鹤坡，资料只有真实馆藏字段，没有照片。桌面和手机都要能操作，不补营销 hero。

> 用 `zixiao-new-chinese-design` 只评审鹤坡·室内的预约页，不改代码。先检查窄屏是否能选时段、提交和恢复错误，再看暖石白、红木与香槟色是否各有职责。指出与任务冲突的 Taste 建议。

实现时给出一句方向、首屏主角和主动作，确认用原生 `hepo` / `hepo-interior` 还是保留既有风格；然后复用真实组件，最后按桌面、窄屏和明暗分别走主流程。评审时用同一顺序给发现和依据，不擅自改实现或让另一套指南决定视觉。

## 用已经存在的风格

React 包共享组件语义与行为。先复用项目的组件和 CSS 导入，再选择风格；不要为了新中式重写按钮、表单、下拉和对话框。只用一种风格时，用 `base.css` 加该主题；应用已有 `styles.css` 时，只设置作用域，不重复导入基础层和适配层。

```tsx
import { Button } from '@zixiao-labs/ui-kits-react'
import '@zixiao-labs/ui-kits-react/base.css'
import '@zixiao-labs/ui-kits-react/themes/hepo.css'

export function ArchiveHeader({ onBrowse }: { onBrowse: () => void }) {
  return (
    <header
      data-zx-style="hepo"
      data-zx-color-mode="light"
      style={{
        background: 'var(--zx-surface)',
        color: 'var(--zx-text)',
        fontFamily: 'var(--zx-font)',
      }}
    >
      <h2 style={{ fontFamily: 'var(--zx-font-display)' }}>馆藏器物档案</h2>
      <Button variant="solid" onClick={onBrowse}>
        浏览档案
      </Button>
    </header>
  )
}
```

`hepo-interior` 对应 `themes/hepo-interior.css`，不依赖 `hepo.css`。把风格和明暗设在同一个元素；独立嵌套风格未声明明暗时默认浅色。原生鹤坡的控件圆角 4px、细部 2px、大容器 8px，悬停不抬升，按压下沉 1px。实测 Modal / Select 这类浮层是否维持触发器作用域的配色、字体以及关闭后焦点。

页面布局使用 `--zx-surface`、`--zx-surface-subtle`、`--zx-text` 等有效 token；填色与匹配的前景色一起用，如 `--zx-accent` / `--zx-on-accent`。`Typography` 的 `variant="headline"` 或 `title` 是样式，仍渲染 `<p>`；语义标题用 `h1`–`h6` 并读 `--zx-font-display`。字体栈不是附带字体，跨设备一致时由应用加载有授权的 CJK 字体并检查字形及回退。

## 配色、纹样与增强

- `@zixiao-labs/ui-kits-react/theme` 的 `themePresets.hepo` 和 `themePresets.hepoInterior` 是配色种子，不是 `data-zx-style` 的值，也不会自动得到原生鹤坡的字体和形状。仅在需要品牌配色时用 `createTheme(options, dark)` 给作用域生成 token，留意它也会输出圆角 token。`themeToCSS(options)` 输出静态明暗规则，默认绑定 `data-zx-theme="custom"`；不要把两种途径叠加在同一作用域。
- 若已有 Tailwind v4，可从包的 `tailwind.css` 读 `bg-zx-surface`、`text-zx-text`、`font-zx-display` 等工具类；它不会加载主题。没用 Tailwind 就读 CSS 变量，不为接入另装一套系统。
- 底纹从 `/patterns` 导入 `PatternBackground` 并导入 `/patterns.css`。只挑 `hui`（回纹）、`yunlei`（云雷纹）、`lei`（雷纹）中的一种用于有限范围，`--zx-pattern-color` / `--zx-pattern-opacity` 可调。默认透明度 0.12 不保证文字对比合格；拿不准就把纹样放到内容之外，或不使用。
- `/liquid-glass` 与 `/liquid-glass.css` 是有可选 peer 依赖的独立增强；组件 GPU 阴影也是按需启用。不是鹤坡的前置条件。若任务需要效果，先验实色回退、键盘操作和减少动效；不为演示临时打开全局效果。

## 可选审稿脚本

脚本只读取 UTF-8 JSON，不安装、不联网、不改文件。先运行随包的[工作台示例](../assets/workspace-plan.json)，再复制一份到消费项目，用实际设计决定填写；不要为了通过而删去已经采用的 Taste 手法。假设 pnpm 已链接到 `.agents/skills`，从消费项目根目录执行：

```sh
SKILL=.agents/skills/zixiao-new-chinese-design
node "$SKILL/scripts/check-plan.mjs" "$SKILL/assets/workspace-plan.json"
```

没有自动链接时，令 `SKILL=node_modules/@zixiao-labs/ui-kits-react/skills/zixiao-new-chinese-design`，或改用宿主的实际 Skill 路径。

首次使用时复制示例（保留已有设计卡），填好以下字段再运行审稿：

```sh
if [ ! -e ./design-plan.json ]; then
  cp "$SKILL/assets/workspace-plan.json" ./design-plan.json
fi
# 按当前任务修改 design-plan.json 后：
node "$SKILL/scripts/check-plan.mjs" ./design-plan.json
```

- `page`：`workspace`（工作台 / 目录 / 表单）、`editorial`（文章 / 图录）或 `landing`（介绍 / 营销页）。
- `style`：`hepo`、`hepo-interior` 或 `existing`（保留已有产品风格）。
- `direction` / `subject` / `action`：分别写一句设计依据、首屏实际主角和真实主动作。
- `taste`：实际借用的 Taste 手法；没借用填 `[]`。通用项是 `clear-copy`、`real-content`、`aligned-grid` 和 `browser-qa`。文章、图录和落地页可以再选 `story-moment`，落地页还可选 `hero`；这两项都由内容驱动，不是必选。

退出码 `0` 表示设计卡符合默认规则，`1` 表示读取失败或有规则冲突。脚本不分析源码或截图，不衡量材质、文案、对比度和完成度。如果用户明确要求了脚本默认规则之外的视觉方案，以用户决定为准，并在交付时写清取舍。

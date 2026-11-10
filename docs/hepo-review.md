# 鹤坡主题与 Unslop 验收

## 设计方向

- **产品：** 开发者切换、操作和复制多风格 React 组件的工作台。
- **性格：** 沉静、端正、温润。
- **环境：** 用户提供的上海道教学院 / 鹤坡观建筑与空间参考；取石白墙面、黛瓦、青色衣料和浅木作的关系，不复制标识、建筑照片或宗教纹样。
- **重点：** 黛青 / 浅水青的主要操作，以及浅木色的辅助按钮和选中项。
- **识别细节：** 宋体展示标题与黑体控件并置，以小圆角、细边界呼应木框和石阶，不靠书法、水墨背景或金色装饰制造“中式”。

保留原工作台的信息结构、品牌、组件 API 和真实交互。新增独立风格，而不是把整个项目改为鹤坡，也不只是给 Clean 换一组种子色。

## 主题、配色、字体

### 原生风格

`data-zx-style="hepo"` 对应独立的 `themes/hepo.css`。适配层只在作用域本身声明中性 `--zx-*` tokens，不包含后代覆盖、外部资源或 Material 专属变量，可与其他风格并列、双向嵌套。

| 角色              | 浅色           | 深色             |
| ----------------- | -------------- | ---------------- |
| 基底              | 石白 `#F8F7F3` | 墨瓦 `#192227`   |
| 次级表面          | `#EEEDE7`      | `#253137`        |
| 浮起表面          | `#FFFFFF`      | `#202B30`        |
| 主操作            | 黛青 `#3F5662` | 浅水青 `#B8CCCF` |
| 主操作悬停        | `#304650`      | `#D0DFE0`        |
| 辅助色            | 木色 `#C4A787` | 浅木色 `#D8C3AA` |
| 辅助容器 / 选中项 | `#E8DFD1`      | `#D8C3AA`        |

深色不是把浅色所有颜色一律压暗。辅助面保持明亮，搭配深色文字，避开用户指出的 `#8B7500`、`#9C7A00`、`#7A6A00` 以及同类低明度黄褐填色。控件采用 4px 圆角，细部 2px，大容器 8px；不新增阴影。

### 配色预设

「鹤坡配色」与「鹤坡」风格是两个入口。配色预设以 `#3F5662` / `#C4A787` 为种子，复用已有 HCT 自定义主题算法，不改变当前风格的字体。原生风格的深色主操作则另配浅水青。

沿用此前已修正的辅助容器规则：浅色 tone 90、深色 tone 80，均配 tone 10 文字。未改写紫霄、朱砂等既有预设，也未把深色容器退回低 tone 金色。

### 字体分工

- `--zx-font`：Noto Sans SC → PingFang SC → Microsoft YaHei → system-ui → sans-serif。正文、标签、表单和操作控件保持黑体。
- `--zx-font-display`：Noto Serif SC → Source Han Serif SC → Songti SC → STSong → serif。用于 Typography headline / title、浮层标题，以及 Demo 的页面标题与 Button 展示标题。
- 其他风格的 `--zx-font-display` 默认等于其 `--zx-font`，不把宋体泄漏到嵌套的 Clean 或 Endfield 控件。
- 字体名是回退栈，不是已打包资产。本轮不下载字体、不添加远程字体请求；最终字形随设备已安装字体而异。要求跨设备完全一致时，应用需自行加载有授权的字体。

单独接入：

```tsx
import { Button, Typography } from '@zixiao-labs/ui-kits-react'
import '@zixiao-labs/ui-kits-react/base.css'
import '@zixiao-labs/ui-kits-react/themes/hepo.css'

export function HepoExample() {
  return (
    <section data-zx-style="hepo" data-zx-color-mode="dark">
      <Typography variant="headline">项目评审</Typography>
      <Button>保存决定</Button>
      <Button variant="tonal">保留草稿</Button>
    </section>
  )
}
```

## Unslop 收尾检查

方法来自 Unslop，作者 Damir Sokolovsky（[@heydamir](https://x.com/heydamir)），CC BY 4.0。本轮按 `references/signs.md` 和九轮检查清单，结合实际浏览器截图进行局部自查；不是运行一个名为 `unslop check` 的 CLI，也不是独立代理评审。按当前仅在明确要求时委派的设置，没有调用子代理。

| 检查 | 结果与处理                                                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 间距 | 保留既有 4px 间距节奏、44px 主要操作触控高度和目录密度。截图发现第五个配色预设单独掉行，改为按最小列宽自适应，桌面五项同排，并增加布局断言。     |
| 色彩 | 石白 / 墨瓦表面安静承载内容；青色用于操作，木色用于辅助层级。检查正文、弱化文字、按钮、选中项、边界与焦点，不使用低明度黄褐辅助面。              |
| 图标 | 沿用 Gravity SVG 与文字颜色，没有新图标集、emoji 或装饰性图标。                                                                                  |
| 文案 | 明确描述石白黛青、宋体与木色，不添加“禅意”“高级”等宣传话术；将写死“五种风格”的说明改为“各风格”。                                                 |
| 字体 | 中文标题使用宋体，正文与控件保留黑体；实际查看中文排版与深色手机截图，不只检查字体字符串。标题和控件各司其职，没有书法体、渐变字或增加超粗标题。 |
| 布局 | 保留目录 → 当前组件 → 预览 → 代码 → 主题定制的顺序。检查 1440px 桌面、390px 手机和 720px 等效重排；窄屏不整体缩小 UI。                           |
| 细节 | 小圆角与细边界一致；下拉选中项保持浅木色。检查浅色外层 / 深色鹤坡内层及反向嵌套、Modal 内 Select 的字体与颜色，以及关闭后的焦点返回。            |
| 视觉 | 真实组件本身就是展示内容，不添加山水画、纹理、光晕、玻璃、花纹或无关配图。组件目录需要展示多个变体，保留有用途的样本栅格。                       |
| 动效 | 不新增循环装饰或入场动画；悬停只变色、不上浮，按压保留 1px 反馈；继续复用共享浮层与选择反馈及 reduced-motion 处理。                              |

保留公司真实的紫黄品牌预设，不因“去 AI 感”而删掉。检查范围是新增鹤坡和受影响的共享字体合同，不把它扩展成无关页面重设计。

## 验证证据

### 自动检查

- `pnpm check`：lint、格式检查、workspace 类型检查通过。
- `pnpm exec lightning run tests/styles.test.ts packages/react/src/theme.test.ts`：**13 项通过**。包括独立 CSS exports、中性合同、生成入口同步、字体作用域以及辅助色明度回归。
- `pnpm exec lightning run --config lightning.e2e.config.ts tests/hepo.e2e.test.ts tests/theme-motion.e2e.test.ts tests/endfield.e2e.test.ts`：**30 项通过**。
- `git diff --check`：无空白错误。

鹤坡的 8 项浏览器测试包含：

- 自动遍历 74 个目录条目 × 桌面 / 手机 × 浅色 / 深色，检查有效主题、字体 token、圆角、代码片段和页面横向溢出。这不等同于逐个组件的完整视觉与交互验收。
- 宋体标题与黑体控件分工，双向嵌套及 body portal 的字体、颜色和明暗隔离。
- 原生适配层导出、自定义配色导出、刷新恢复，以及另一风格局部预览不被全局配色污染。
- 文字对比度至少 4.5:1；控件边界、焦点和小型指示至少 3:1，均对三个表面层级检查。当前原生配色最低文字对比为浅色 **4.89:1** / 深色 **7.06:1**，最低控件对比为 **3.24:1** / **4.67:1**。
- 深色 tonal 按钮在默认、真实鼠标悬停和按压时，填色相对黑色的对比度保持至少 10:1，用明度下限防止整类暗黄褐色回归；下拉选中项另检查实际背景与辅助容器一致。
- 原有紫霄、朱砂等配色的明暗辅助面和色板回归，以及 Endfield 字体、主题混用和交互动效回归。

### 实图自查

通过 `UI_KITS_SCREENSHOT_DIR` 设置输出目录，运行鹤坡 E2E 可复现截图。实际查看了 `hepo-light.png`、`hepo-dark.png`、`hepo-type-light.png`、`hepo-type-dark.png`、`hepo-mobile.png`、`hepo-mobile-theme.png`、`hepo-mobile-type-dark.png`、`hepo-reflow.png` 和 `hepo-portal.png`。

代表画面为 Button、中文 Typography、Tabs、嵌套 Modal / Select。桌面 1440×1000、手机 390×844；720×450 用作桌面 200% 的 CSS 宽度等效重排检查，不声称验证了浏览器原生缩放或操作系统文字缩放。手机使用实际视口截图分段查看，不以压缩后的整页长图代替可读性检查。

未跑生产构建、全量测试、Firefox / WebKit，未在 Windows、Android 等实际设备上验证字体回退；未对 74 个条目逐一进行人工视觉验收。

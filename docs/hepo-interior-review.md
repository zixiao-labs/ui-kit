# 鹤坡·室内变体

## 方向与范围

- **产品：** 开发者切换、操作和复制组件的多风格工作台。
- **性格：** 温润、端正、安静。
- **环境：** 用户给出的鹤坡室内参考：暖白石墙、红木门窗与梁架、浅香槟色帷幔和灯光。不复制照片、建筑标识、宗教图案或小红书水印。
- **重点：** 红木色主操作、浅香槟色辅助按钮与选中项；表面只保留轻微暖色倾向，不铺成褐色背景。
- **识别细节：** 保留鹤坡的宋体标题、黑体正文和控件、小圆角与细边界；从室外的黛青 / 浅木色切换到室内的红木 / 香槟色。

首屏继续采用「组件目录 → 当前组件 → 可操作预览 → 用法代码 → 主题定制」的结构，主角是当前组件，主动作是操作组件、查看和复制代码。只新增主题，不另造页面、交互机制或组件实现。

### 为什么单独注册风格

`hepo-interior` 是 `hepo` 的独立同族风格。复用现有 `data-zx-style` 机制即可支持全局、局部、双向嵌套、body portal、持久化和代码导出，不增加第二套「变体」属性和组合状态。原版 `hepo` 的配色和选择保持不变。

## 原生配色

| 角色              | 浅色             | 深色             |
| ----------------- | ---------------- | ---------------- |
| 基底              | 暖石白 `#F7F4EE` | 暖炭灰 `#242321` |
| 次级表面          | `#ECE7DD`        | `#33312D`        |
| 浮起表面          | `#FFFDF8`        | `#2B2926`        |
| 主操作            | 红木 `#82503D`   | 浅木色 `#E6B993` |
| 主操作悬停        | `#6E402F`        | `#F1CDB0`        |
| 主操作文字        | `#FFFFFF`        | `#3D291B`        |
| 辅助色            | 香槟色 `#D8BD88` | `#DDC79D`        |
| 辅助容器 / 选中项 | `#EEE3CC`        | `#E7D7B9`        |
| 辅助容器文字      | `#352D20`        | `#352D20`        |

原线程排除的是低明度黄褐色这一整类，而不只是 `#8B7500`、`#9C7A00`、`#7A6A00` 三个值。深色模式的主操作和辅助填面使用明亮木色、香槟色配深字；默认、真实悬停和按压状态均检查填面对黑色的对比度至少 10:1，防止暗金褐色回归。深色背景近中性暖灰，不以金色种子把整页染褐。

原生风格与「鹤坡·室内配色」预设分开。预设只以 `#82503D` / `#D8BD88` 运行已有 HCT 算法，不改变当前风格的字体和结构；原生模式另配深色表面与操作色。

## 接入

```tsx
import { Button, Typography } from '@zixiao-labs/ui-kits-react'
import '@zixiao-labs/ui-kits-react/base.css'
import '@zixiao-labs/ui-kits-react/themes/hepo-interior.css'

export function InteriorExample() {
  return (
    <section data-zx-style="hepo-interior" data-zx-color-mode="dark">
      <Typography variant="headline">项目评审</Typography>
      <Button>保存决定</Button>
      <Button variant="tonal">保留草稿</Button>
    </section>
  )
}
```

无需加载 `themes/hepo.css`、Clean 或 Material tokens。适配层只在作用域本身声明中性 tokens，不用后代选择器覆盖组件。字体使用与原版相同的 Noto / 思源、系统宋体和黑体回退栈，不下载或附带字体文件。

## Unslop 检查

方法来自 Unslop，作者 Damir Sokolovsky（[@heydamir](https://x.com/heydamir)），CC BY 4.0。只检查新增变体及受影响区域，不把续作扩成全站改版。

| 检查 | 处理                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------ |
| 间距 | 沿用工作台间距、触控高度；六个配色预设统一排成三列两行，避免长名称挤压、掉出孤项或手机横向溢出。 |
| 色彩 | 暖灰表面承载内容；红木只作主要操作，浅香槟色用于辅助与选择，不加金色边框、渐变或光晕。           |
| 图标 | 不新增图标集、emoji 或宗教装饰；沿用现有 Gravity SVG。                                           |
| 文案 | 使用「鹤坡·室内」和实际材质描述，不添加宣传词或新功能。                                          |
| 字体 | 宋体标题与黑体控件分工不变；不使用书法体、渐变字或新增超粗标题。                                 |
| 布局 | 保留目录、预览、用法与定制的层级；不靠缩小整页适配手机。                                         |
| 细节 | 4px 控件 / 2px 细部 / 8px 大容器，保持细边界；浮层继续读取触发器的有效主题。                     |
| 视觉 | 真实组件是视觉主体；不添加木纹背景、山水画、灯笼、照片或金色装饰。                               |
| 动效 | 不新增装饰动效；悬停变色、按压 1px，复用共享浮层、选择反馈与 reduced-motion 处理。               |

本轮按当前「仅明确要求时委派」设置执行自查，不调用独立评审代理，不提供独立评分。

## 验证记录

### 自动检查

- `pnpm check`：lint、格式检查与 workspace 类型检查通过。
- `pnpm exec lightning run tests/styles.test.ts packages/react/src/theme.test.ts`：**14 项通过**，包括独立主题导出、生成入口同步、作用域与字体合同，以及 HCT 辅助色明度回归。
- `UI_KITS_SCREENSHOT_DIR=.oil-ui/hepo-interior/shots pnpm exec lightning run --config lightning.e2e.config.ts tests/hepo-interior.e2e.test.ts tests/hepo.e2e.test.ts tests/input-contrast.e2e.test.ts tests/theme-motion.e2e.test.ts`：**31 项通过**。
- `git diff --check`：无空白错误。

室内变体的 8 项浏览器测试覆盖：

- 74 个目录条目 × 1440px 桌面 / 390px 手机 × 浅色 / 深色，检查有效主题、字体 token、圆角、代码片段和页面横向溢出。不等同于对 74 个组件逐一完成人工视觉和完整交互验收。
- 与原版鹤坡、Clean 的双向嵌套，Modal / Select 的 body portal 主题隔离与关闭后焦点返回。
- 原生适配层 CSS 导出、颜色预设 CSS 导出、刷新恢复、另一风格预览不被全局自定义色污染、重新选择风格恢复原生配色。
- 所有表面层级上的文字至少 4.5:1、控件边界和焦点至少 3:1。当前最低文字对比度为浅色 **4.94:1** / 深色 **6.58:1**，最低控件边界对比为 **3.56:1** / **4.33:1**。
- 深色主操作和辅助按钮在默认、真实悬停、按压时，填面对黑色的对比度至少 10:1，同时检查按钮文字可读性；下拉选中项保持香槟色辅助容器。
- 手机真实输入编辑，以及六个配色预设的三列两行布局。

输入框对比度回归另遍历所有风格及配色预设（含室内版）的明暗组合，检查真实合成背景上的输入文字、占位文字、前后缀与步进按钮。原版鹤坡、既有预设、主题存储失败提示及共享浮层动效的相关回归通过。

### 实图自查

证据保留在本地任务目录 `.oil-ui/hepo-interior/shots/`，不被正式页面引用。已实际查看：

- `baseline-hepo-light.png`：修改前原版鹤坡基线。
- `hepo-interior-light.png`、`hepo-interior-dark.png`：桌面明暗首屏。
- `hepo-interior-type-light.png`、`hepo-interior-type-dark.png`：中文宋体标题、黑体正文。
- `hepo-interior-mobile.png`、`hepo-interior-mobile-theme.png`：手机预览与配色面板。
- `hepo-interior-mobile-input-dark.png`：深色手机输入框与占位文字。
- `hepo-interior-reflow.png`：窄宽重排的 Tabs 与控制区域。
- `hepo-interior-portal.png`：原版鹤坡深色外层、室内浅色 Modal 和嵌套 Select。

浅色有暖白墙面与木框的关系，深色仍读作暖炭灰而非黄褐底；未发现新增变体导致的文字重叠、主题串色或配色预设孤项。未增加装饰材质和循环动效。

桌面为 1440×1000、手机为 390×844；720×450 用于桌面 200% 的 CSS 宽度等效重排检查，不声称验证了浏览器原生缩放或操作系统文字缩放。未跑生产构建、全量测试、Firefox / WebKit 或跨操作系统实际设备字体测试。字体仍依赖应用加载或本机回退。

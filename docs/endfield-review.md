# Endfield 风格、主题切换与混用验收

## 交付范围

- 新增独立的 `packages/react/src/themes/endfield.css`，完整入口自动包含它；也可使用 `base.css` + `themes/endfield.css` 按需加载。
- 全部 74 个目录条目可预览 Endfield；共享语义、Props、键盘行为、表单和浮层生命周期，不复制组件实现。
- Demo 的全局风格、局部预览风格、原生 / 自定义配色分开管理。选择会本地保存，旧版只有明暗与配色的设置仍可恢复。
- 新增可操作的嵌套风格示例，支持独立明暗、Modal 及其中的 Select。外层、内层与 body portal 之间不互相污染。
- 原生主题导出对应的基础 / 风格 CSS 入口，自定义主题导出明暗两组中性 tokens。不把 Endfield 原生配色误导出成 HCT 近似值。

「全组件覆盖」指当前组件目录与中性主题合同的覆盖，不表示新实现了目录以外的组件、高级变体或业务能力。

## 设计契约与来源

- **Family：** Endfield
- **Depth：** moderate / 中等。组件工作台属于产品工具，完整组件覆盖不等于增加装饰密度。
- **官方证据：** [Endfield 官网](https://endfield.hypergryph.com/) 的浅色侧栏、白 / 炭灰 / 信号黄配色、矩形控件、方向切角和停靠操作区。来源采用 `ark-ui` 的 `source-ledger.md` 与 Endfield recipe，不将其中的历史研究日期当作本次实时抓取记录。
- **本次实现：** 原创 CSS、现有 Gravity 图标和系统字体回退。未复制官方 logo、字体文件、角色图、CDN 资源、生产 CSS / JS 或无许可的第三方实现。
- **布局与状态：** 桌面使用浅色目录、分区横线、炭灰预览工具区；手机将目录重排为检索与原生选择器，预览和配置按阅读顺序排列。
- **颜色约束：** 中性表面为主；黄色用于操作和选中标记。浅色背景上的细线进度、单选点与焦点使用炭灰，日历选中项有清晰边界，不用低对比黄色细线勉强表达状态。
- **深度例外：** 共享组件覆盖达到 complex 的广度，但外壳、场景层和动效保持 moderate；不添加假遥测、游戏仪表或额外循环来凑深度。

## Unslop 方向

1. **产品：** 供开发者操作、比较和复制 React 组件的多风格工作台
2. **性格：** 准确、工程化、可检验
3. **环境：** 组件实验台；灰白材料、炭灰工具区和少量信号黄
4. **重点：** 当前组件的真实交互预览，以及同屏不同作用域的真实控件
5. **识别细节：** 用一处方向切角标记 Endfield 预览，不把它铺到每个组件上

## Unslop 审查结果

使用项目的 `unslop` 方法，先看真实的桌面 / 手机基线截图，再按 `references/signs.md` 审查新增界面。结论为轻量打磨，不做新的视觉方向重构，不改动其他风格本身的品牌表达。

| 层次 | 发现与处理                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------- |
| 间距 | 保留工作台的 4px 空间节奏；主题控制、预览、代码和混用示例有明确分组                                     |
| 色彩 | 移除 Demo 外壳对 `--md-*` 的依赖，使用共享语义 tokens；黄色不作为长正文背景                             |
| 图标 | 继续使用 Gravity；没有 emoji、额外图标集或装饰性图标                                                    |
| 文案 | 原生主题不再声称是 HCT 自动生成；全局风格、预览覆盖和嵌套明暗均有可见标签                               |
| 排版 | 400–600 字重，正文和标签保留可读尺寸；技术元数据使用等宽字体，没有新增全大写宣传标签                    |
| 布局 | 保留目录 → 当前组件 → 预览 → 用法的任务顺序；手机是重新排列，不是缩小桌面                               |
| 细节 | 混用示例中过宽的黄色按钮收窄为内容宽度；开关 / 滑块几何可按主题变化，Spinner / Radio 保留必要的圆形语义 |
| 视觉 | 以可操作控件本身为视觉内容；没有插画占位、光晕、渐变字、玻璃卡片或虚构遥测                              |
| 动效 | 复用共享的真实状态动效和 reduced-motion 规则；Endfield 按钮悬停不浮起，不增加环境循环                   |

浅色日历选中边界和深色预览工具区的键盘焦点也做了补强。颜色选择组件的色域渐变、加载状态动画，以及 RAC 的折叠高度 / Tab 指示尺寸过渡具有实际交互意义，不当作装饰删除。

本轮是主执行者的实图与代码自查，未使用子代理或外部审美评分。

方法署名：Unslop by Damir Sokolovsky（[@heydamir](https://x.com/heydamir)），CC BY 4.0。

## 实际验证

- `pnpm check`：Oxlint、Oxfmt、workspace 类型检查通过
- `pnpm test`：92 项组件 / SSR / 样式 / 主题检查通过
- `pnpm test:e2e`：45 项 Chromium 浏览器检查通过
- Endfield 目录遍历：74 项 × 桌面 / 手机 × 浅色 / 深色，均检查主题、形状、代码标记与页面横向溢出
- 交互：五种风格切换不重置输入；局部预览不继承其他风格的自定义 tokens；双向嵌套、实时作用域变化、Modal → Select、关闭后的焦点恢复、存储迁移和主题导出
- 对比度：Endfield 正文、辅助文字、实心 / tonal / secondary 文本至少 4.5:1；焦点、控件边界与细指示至少 3:1
- `pnpm build`：客户端和 SSR 构建通过
- `pnpm preview`：真实生产预览冒烟通过，覆盖 hydration 后切换 Endfield、日历选中边界、保存的深色模式、手机重排，以及禁用 JavaScript 时的 SSR 内容和 CSS
- `git diff --check`：通过

完整 E2E 曾因终端设置的 60 秒上限中断；随后以充足运行时限重新执行完整 `pnpm test:e2e`，45 项全部完成。未将中断的运行报告为完整通过。

### Ark 启发式检查

运行安装的 `ark-ui/scripts/audit-ark-ui.mjs`：

- 单独检查 token 适配层会提示缺少 focus、responsive、reduced-motion；这些职责在共享基础层和 Demo 外壳，并非适配层缺失功能。
- 把 `base.css`、Endfield 适配层与 Demo CSS 合并作为完整交付样式输入后：**0 errors，1 warning**。
- 剩余 warning 是脚本只识别 `--ark-ink / paper / signal` 命名。本项目对应角色已由 `--zx-text / surface / accent` 提供，故不添加第二套重复 token 命名来消除提示。
- 脚本的静态通过项不替代浏览器验证；页面元数据、实际组件状态和交互以 Chromium / SSR 检查为准。

### 尚未验证与后续项

- 未运行 Firefox、WebKit、人工屏幕阅读器或真实设备验收。
- 200% 重排使用 720×450 CSS 视口模拟，不宣称测试了浏览器原生缩放。
- 未逐像素验收全部 74 个条目的每个变体；完整目录自动遍历结合代表性屏幕截图检查。
- 构建仍有大于 500 kB 的单 JS chunk 提示：客户端约 1.28 MB，gzip 约 369 kB。按组件示例拆包是独立性能后续项，本轮不改构建体系。

## 实图证据

同一轮浏览器截图，1440×1000 桌面、390×844 手机与 720×450 重排；不是像素回归基准。

- [Endfield 桌面](screenshots/endfield-desktop.png)
- [Endfield 深色](screenshots/endfield-dark.png)
- [Endfield 手机](screenshots/endfield-mobile.png)
- [表单](screenshots/endfield-textfield.png) / [日历](screenshots/endfield-calendar.png) / [Tabs](screenshots/endfield-tabs.png) / [Table](screenshots/endfield-table.png)
- [Clean 外层 + Endfield 内层](screenshots/endfield-mixed.png)
- [嵌套 Modal → Select](screenshots/endfield-nested-portal.png)
- [200% 等效重排](screenshots/endfield-reflow.png)

复现截图：

```sh
UI_KITS_SCREENSHOT_DIR=docs/screenshots pnpm exec lightning run \
  --config lightning.e2e.config.ts tests/endfield.e2e.test.ts \
  -t 'captures Endfield'
```

# React v0.2.0 — 配色预设、字体与 Tailwind

本次版本基于 `react-v0.1.1` 之后的仓库历史，发布目标仅为 **`@zixiao-labs/ui-kits-react@0.2.0`**。新增公开主题能力，采用 minor 版本；Solid、shared、两个 demo 与根 workspace 继续保持私有，不同步升版或发布。

## 新增

- 从 `/theme` 导出 `themePresets`：紫霄、松林、海岸、朱砂、鹤坡、鹤坡·室内、青岛蓬仙、霓衣云君、丹炉飞龙，共九套配色。配色与组件风格独立，可复用现有明暗主题算法。
- `ThemeOptions` 新增 `darkColors`，并导出 `ThemeColors` 与 `zixiaoDarkColors`。紫霄深色填色 `#422256` / `#D7A547` 需要显式启用；浅色和默认行为不变。
- `ThemeOptions` 新增 `fontFamily` 与 `displayFontFamily`，由 `createTheme` 和 `themeToCSS` 输出正文及标题字体 token；只设置正文字体时标题跟随正文。新增 `isFontFamily` 供消费应用校验字体栈，拒绝 CSS 声明、URL、函数与超长输入。
- 新增可选 `/tailwind.css`，提供 Tailwind CSS v4 的 `@theme inline` 映射。`bg-zx-surface`、`text-zx-text`、`font-zx`、`font-zx-display`、`rounded-zx` 等工具类读取当前作用域的主题 token，不覆盖应用的默认调色板。

## 兼容与接入

- 现有组件、CSS 入口与未传新选项时的主题行为保持不变，不需要迁移已有调用。
- 字体文件仍由消费应用加载并确认授权；组件包不会下载或托管字体。
- Tailwind 桥接必须经过消费应用的 Tailwind v4 编译，不是可直接用于浏览器的普通样式表，也不提供 v3 插件。普通组件使用者无需安装 Tailwind。
- 要让 Tailwind utilities 覆盖组件样式，应将组件 CSS 放入 `components` layer；不要同时重复导入未分层的同一份 CSS。

```sh
pnpm add @zixiao-labs/ui-kits-react@0.2.0 react@^19 react-dom@^19
```

完整示例见 [React 包说明](https://github.com/zixiao-labs/ui-kit/blob/react-v0.2.0/packages/react/README.md)。

## 仓库与开发体验

- React Demo 增加配色、深色优化和字体调节，支持保存恢复、CSS 导出与嵌套主题隔离。
- 增补主题对比度、字体输入校验、真实 Tailwind 编译、tarball 公开入口和浏览器回归测试。
- 修正 Hepo 与 Hepo Interior 截图测试中固定为六套配色的旧断言：数量跟随共享预设，继续验证三列网格与实际行数。
- 普通 CI 不再执行 `npm publish --dry-run`，避免已发布版本导致重复版本检查失败；继续验证实际 tarball，最终版本冲突与 OIDC 授权由发布 job 检查。
- 增加仓库级 Merge Skill，供 Delta Merge 按钮使用；普通合并不自动触发 npm 发布。

功能改动主要来自 `a673365`，普通 CI 修正来自 `28f568f`。仓库中新增的设计类 agent skills 不属于 npm 包运行时或组件功能。

## 发布验证要求

发布前须按 [发布流程](https://github.com/zixiao-labs/ui-kit/blob/react-v0.2.0/docs/publishing.md) 完成完整 CI，合入 `main` 后推送 `react-v0.2.0`，由 `Publish React` 使用同次 CI 验证的归档经 npm Trusted Publishing 发布。本文是版本说明，不代表发布、Environment 审批或 CI 已完成；实际结果以 GitHub Actions 和 npm registry 为准。

[比较自上一版本的更改](https://github.com/zixiao-labs/ui-kit/compare/react-v0.1.1...react-v0.2.0)

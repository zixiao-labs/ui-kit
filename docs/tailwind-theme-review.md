# Tailwind、配色预设与字体定制

## 接入规则

- 组件风格与配色预设分开：七套 `data-zx-style` 风格不变，新增三套配色，不将每一种配色复制成另一套组件 CSS。
- React、Solid 和 React Demo 共用 `themePresets` 与 HCT 生成算法。主辅填色保留输入值，正文、链接、边界与容器使用各自的语义色阶。
- 紫霄深色优化显式启用：`darkColors: zixiaoDarkColors` 只在深色使用 `#422256` / `#D7A547`。Demo 在其他配色下不应用这组值；浅色和未开启时保持兼容。
- 自定义字体是两个可选字体栈，不是字体托管服务。正文用于控件，标题可独立设置；省略选项保留原生字体。Demo 中只设置字体不会重新生成原生配色或覆盖原生形状。
- 字体名列表经过共享校验，禁止将 CSS 声明、URL 或函数混入导出内容。字体加载与授权由应用负责。

## Tailwind v4

可选的 `/tailwind.css` 仅包含 `@theme inline` 映射，由消费应用的 Tailwind 编译器处理。它不进入普通 `base.css` 或 `styles.css`，也不带来 Tailwind 运行时依赖、Preflight 或外部字体下载。

映射使用 `zx` 命名空间，不覆盖应用已有的 `font-sans`、通用 `rounded-*` 或默认调色板。生成的 utilities 直接读取元素的有效 `--zx-*`，不把主题编译成固定颜色。明暗切换由 `data-zx-color-mode` 控制，不另加跨越嵌套边界的 dark 后代选择器。

接入示例把组件 CSS 放进 `components` layer，保证 Tailwind utilities 可覆盖组件样式。普通 CSS 导出和 Tailwind 导出都复用当前风格及主题；定制规则使用显式 `data-zx-theme="custom"` 标记，避免污染未选择定制的嵌套作用域。

## 调节面板

保留现有的配色圆点、取色器、十六进制输入和圆角滑块。九套配色沿用同一网格；字体收在可展开区域，避免让不需要字体的用户面对额外表单。新增控件有可见标签、输入附近的错误提示与键盘焦点；原有保存失败、剪贴板失败提示继续有效。

字体、紫霄优化偏好与配色一起保存。旧版存储缺少新字段时采用兼容默认值；非法字体不会进入活动主题。新风格作用域和独立预览保留自己的原生字体，浮层继续复制触发器的有效 tokens。

UI UX Pro Max 的本机新增文件可读取，但未列入当前会话的可调用技能目录。本轮读取了其说明，并运行本地 UX 查询：采用文字对比至少 4.5:1、非仅颜色表达选中状态和可见标签等建议，不改变项目现有视觉语言。

## 验证

- `pnpm check`：lint、格式和 workspace 类型检查。
- `pnpm test`：116 项单元测试，包含新增预设原值、明暗文字对比、优化开关的算法边界、字体校验和真实 Tailwind 编译。
- `pnpm build`：React、Solid 组件包和两个 Demo 的生产构建。
- `pnpm test:package`：两个真实 tarball 的独立安装、公开 CSS 子路径、Bundler / NodeNext 类型检查、浏览器编译及 Node SSR。
- 定向浏览器回归 16 项通过，涵盖预设、保存恢复、导出、字体、主题同步、嵌套浮层和 HMR；另有真实 Tailwind imports 的浏览器验证，检查 utility 覆盖优先级、局部主题和字体。
- Chromium 实图自查覆盖桌面与 1024 / 768 / 390 / 320px；未出现横向溢出。

本轮不声称完成全量 E2E、所有组件的视觉遍历、Firefox / WebKit 验证或实际远程字体下载验证。构建工具的类型生成弃用、Solid JSX 配置覆盖及 Demo 大 chunk 提示不在本轮主题功能范围内。

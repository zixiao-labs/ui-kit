# 组件动效、动态配色与 Demo 验收

## 方向

- **产品**：供开发者检索、操作和复制 React 组件的多风格工作台
- **性格**：准确、轻快、可调节
- **环境**：组件文档与色彩实验台；实际控件是主角，不使用装饰插画
- **重点**：当前组件的可操作预览、由种子色生成的 HCT 色调表面
- **识别细节**：紫色字标配黄色小角标；品牌色为 `#8B5CF6` / `#FCD34D`

参照 HeroUI 的 `apps/docs` 文档结构和主题调节流程，以及组件样式中的进入、退出、折叠和选中指示生命周期；保留本项目的 Nasti / TanStack Start、Lightning 和现有组件 API。不修改参考仓库。

按用户补充的 [mdui 动态配色方案](https://www.mdui.org/zh-cn/docs/2/styles/dynamic-color.md)，从主色生成低彩度背景、容器、边界与文字。辅助色有独立色阶，不把黄色误用成警告语义色。默认品牌填充保留原值，文字使用对比度安全的配对颜色。

## Unslop 自查

依据项目安装的 `unslop` skill 逐项检查，进行了间距、颜色、图标、文案、排版、布局、细节、视觉与动效九个层次的自检：

- 保留产品名称、现有四种风格和组件目录，不用模板化落地页替代工作台。
- 导航、分组、配置和代码面板采用一致的空间节奏；手机端控件触摸区域不少于 44px。
- 品牌色集中在实际控件、选中状态与主题取色器；表面使用低彩度同源色阶。保留色调表面是用户明确要求，不将其强行改回纯灰。
- 统一使用现有 Gravity 图标，不引入 emoji、发光、彩色阴影、渐变文字或浮动装饰。
- 删除泛化的宣传式预览文案，改为当前主题的具体特征。
- 组件预览是真实可操作界面；不是图片、静态按钮或不可用的占位卡。
- 仅 Skeleton / Spinner / 不定进度等加载状态循环；普通页面没有装饰性循环动画。
- 大部分动画只使用 transform / opacity / color；折叠面板的高度和 RAC 选中指示的尺寸过渡属于有意的局部布局例外。
- 退出浮层不可点击，减少动态效果时直接呈现最终状态。Toast 不支持原生 View Transition 时保留正常交互和进入反馈，清空队列直接完成。

本轮是主执行者的代码与实图自查，**没有独立子代理评审，也未给视觉评分**。用户未要求代理协作。

`unslop` 方法来源：Damir Sokolovsky（[@heydamir](https://x.com/heydamir)），CC BY 4.0。

## 检查范围

- `pnpm check`：Oxlint、Oxfmt、workspace 类型检查
- `pnpm test`：90 项组件 / SSR / 样式 / 动态色彩检查
- `pnpm test:e2e`：31 项 Chromium 浏览器检查，包括 74 个目录条目和手机重排
- 动态主题：准确品牌值、明暗对比度、极端种子色、非法输入隔离、刷新恢复、存储失败、复制 CSS
- 动效：实测动画事件和展开高度，覆盖 Modal、Drawer、Sheet、Popover、Select、Tooltip、Tabs、Checkbox、Toast 与减少动态效果
- 焦点：进入弹层、嵌套选择、逐层 Escape、真实 portal 卸载和触发器恢复

未运行生产构建、生产预览、WebKit / Firefox、屏幕阅读器人工验收或性能基准；截图来自 Nasti 开发服务。200% 截图使用 720×450 CSS 视口与 2 倍像素密度模拟 1440×900 桌面重排，不宣称验证了浏览器原生缩放。

## 最终截图

截图仅记录当前实际页面，不是视觉回归的像素基准。复现交互检查使用 `pnpm test:e2e`；现有 `UI_KITS_SCREENSHOT_DIR` 选项可额外保存自动化回归截图。

- [桌面 / 默认品牌](screenshots/desktop.png)
- [桌面 / 深色](screenshots/dark.png)
- [桌面 / 自定义松林配色](screenshots/custom-theme.png)
- [手机 / Tabs](screenshots/mobile.png)
- [200% 等效重排](screenshots/reflow-200.png)
- [Modal 动效中间帧](screenshots/modal-motion.png)

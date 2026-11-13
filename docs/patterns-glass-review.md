# 底纹与玻璃增强验收

## 范围与设计方向

- **产品：** 给开发者比较、操作和复制多风格组件的工作台。
- **性格：** 克制、精确、带建筑材料感；延续既有品牌与字体。
- **材质来源：** 用户提供的回纹、云雷纹、雷纹参考；传统线条关系转成轻量 SVG 底纹，不复原文物或复制截图里的纸张、水印与装饰。
- **视觉主角：** 一个真实可操作的组件预览；底纹和玻璃是明确选择后才出现的产品样本，不扩散到导航、配置或代码区。
- **一致性细节：** 三种纹路使用同一笔宽、留白与低透明度，颜色来自当前作用域；不把三种名字当作同一图形的别名。

这是既有界面的局部功能扩展，不重新设计页面和组件目录。背景默认为无纹路，玻璃默认为关闭；未操作的组件展示不受影响。

## API 与接入

### 背景纹路

从 `/patterns` 导入 `PatternBackground`，同时显式导入 `/patterns.css`：

| `pattern` | 名称   | 图形特征                     |
| --------- | ------ | ---------------------------- |
| 不传      | 无纹路 | 不生成 SVG                   |
| `hui`     | 回纹   | 连续折线与方形回折           |
| `yunlei`  | 云雷纹 | 勾连线中同时出现圆转与方折   |
| `lei`     | 雷纹   | 横向重复、互相勾连的丁形关系 |

图形是用于背景的几何化表达，不作为器物年代或传统名称考证依据。SVG `pattern` 在同一行重复，行高为 72px，默认透明度 0.12，可由 `--zx-pattern-color`、`--zx-pattern-opacity` 覆盖。不同实例有独立的 SSR-stable ID；装饰对辅助技术隐藏、不参与指针输入，在 forced colors 下隐藏。

### Liquid Glass React

保留 `effects.glass` 的现有内置实现；新增 `/liquid-glass` 的 `LiquidGlassSurface` 与独立 CSS。`cornerRadius` 默认 16px，`displacementScale` 默认 32。`liquid-glass-react@^1.1.1` 为 optional peer，仅使用该入口的消费项目需要安装。

- 挂载后才动态加载上游库，避免其渲染时的 `navigator` 访问破坏 SSR。
- SSR、首次 hydration 和加载失败保留完整实色表面与内容；加载成功后只替换装饰，不重新挂载内容。
- 装饰层 `pointer-events: none`，操作继续使用内部原生 Button。加载与尺寸更新不会抢走已有内容的焦点。
- 关闭上游的鼠标弹性、内部鼠标跟踪和色散；不依赖 Tailwind，全套适配样式限定在本组件内。
- 用 ResizeObserver 监听容器尺寸，只重新挂载装饰来刷新上游尺寸依赖。限制并裁切装饰层，避免上一次尺寸的 SVG 在窄屏重排期间撑宽页面；不裁切内容层或焦点环。
- 不支持 backdrop filter 时恢复实色；forced colors 使用系统表面、文字和边界。Safari / Firefox 的边缘折射有上游限制，不承诺 Chromium 同等效果。

工作台在「材质与光影」中提供背景选择；勾选「液态玻璃」后可选择「内置轻量折射」或「Liquid Glass React」。Button 使用紧贴按钮的外层材质，Card / Surface 使用内容表面。复制 TSX 包含选中功能所需的独立 imports；「恢复无效果」同时关闭纹路和增强实现。

## 包体积与构建边界

两个功能都没有从根入口重新导出，样式也不进入自动生成的 `base.css` / `styles.css`。新增 `/css/*.css` 公开组件族样式，普通 Button 可以只加载 `foundation.css` 和所选主题。

已对 pack 后的包运行真实 Rolldown 裁剪检查（运行时依赖 external，包含生成的 JS chunks；不是完整应用体积）：

| 消费场景                                        |  原始 JS |    gzip |
| ----------------------------------------------- | -------: | ------: |
| 仅 Button                                       | 11,099 B | 3,906 B |
| Button + 导入但不使用纹路 / 动态主题 / 增强玻璃 | 11,099 B | 3,906 B |
| Button + 实际使用纹路                           | 12,193 B | 4,356 B |

未使用的可选入口没有增加字节，未使用时产物不包含纹路、Liquid Glass React 或 Material Color Utilities。此检查保留当前已有的 GPU 动态 chunk，不声称省略 `effects` props 就可完全删除后端。

完整 **Nasti 2.10.1（含 2.9 基本配置兼容说明）/ Vite 8 / Vite 5–7** 配置、CSS 按需导入、动态分包与 Tree-shaking 的区别、生产体积检查步骤见 [Tree-shaking 指引](tree-shaking.md)。

## Unslop 自检

按 `signs` 清单和 spacing → color → icons → copy → type → layout → details → visuals → motion 逐项检查；此轮是局部 polish，不重塑品牌。

| 维度 | 结果                                                                         |
| ---- | ---------------------------------------------------------------------------- |
| 间距 | 复用既有 8 / 12 / 16 / 24 / 32 / 48px 节奏，配置项保持一致行高               |
| 色彩 | 纹路使用作用域的中性 muted 色、0.12 透明度；无新增彩虹、渐变文字或彩色光晕   |
| 图标 | 沿用 Gravity SVG，无 Emoji 图标和装饰徽章                                    |
| 文案 | 三个名称附具体线条特征；明确两种玻璃实现及兼容边界，不作性能或历史真实性夸大 |
| 字体 | 延续正文与显示字体；样本标题 24px / 32px、500 字重，辅助文字 12px / 20px     |
| 布局 | 一个预览主角；手机纵向重排，不缩小整页；检查 390px 和 720px 重排             |
| 细节 | 装饰不截获操作，仍用库内 Select；重点修复第三方 SVG 的窄屏溢出               |
| 视觉 | 纹路和玻璃是用户明确要求的可选功能，不作为全站装饰；未启用时保留原界面       |
| 动效 | 不新增入场、循环、弹性或悬浮动画；既有组件交互与减少动态效果规则保留         |

主代理查看了真实 Chromium 的纹路与玻璃浅色 / 深色、手机和 200% 等效重排画面。没有派独立子代理评审：按本线程设置，只有用户明确要求委派时才使用子代理。不伪造评分。

检查清单来源：Unslop by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0。

## 验证记录

以下最终验证均基于实际安装的 Nasti 2.10.1，保留工作区并行进行的依赖升级：

- `pnpm check`：lint、格式、workspace 类型检查通过。
- `pnpm test`：12 个文件，104 项通过。
- `pnpm test:package`：真实 tarball 安装、公开入口、Bundler / NodeNext 类型解析、Node SSR 与 ESM 裁剪检查通过。
- `UI_KITS_SCREENSHOT_DIR=test-results/patterns pnpm exec lightning run --config lightning.e2e.config.ts tests/effects.e2e.test.ts`：9 项通过，覆盖默认不加载上游库、三种纹路、强制颜色、手机重排、原生按钮、尺寸变化后焦点保持及增强模块加载失败。
- `pnpm build`：组件包与 Nasti client + SSR 构建通过；保留大 chunk 提醒，不通过关掉提醒伪装减包结果。
- 生产产物冒烟：用临时 Node HTTP 适配器托管实际 `dist/client` 与 `dist/server/server.mjs`，Chromium 验证 SSR、hydration、初始不请求上游玻璃 chunk、选择后仅请求一次、原生操作计数与 390px 无横向溢出。没有把该临时适配器当作部署平台支持承诺。
- `git diff --check`：通过。

## 证据与限制

截图由现有 Lightning + Playwright 回归保存在本地 `test-results/patterns/`，不作为运行时资产：

- `patterns-hui-light.png`、`patterns-yunlei-light.png`、`patterns-lei-light.png`
- `patterns-lei-dark.png`、`patterns-mobile.png`、`patterns-200-reflow.png`
- `patterns-liquid-glass-desktop.png`、`patterns-liquid-glass-dark.png`、`patterns-liquid-glass-mobile.png`
- `production-stage.png`、`production-stage-mobile.png`：实际生产产物的局部画面

720px 视口模拟 1440px 桌面的 200% CSS 重排，不冒充浏览器原生缩放测试。未执行 Vite 消费应用、Safari / Firefox 实机、屏幕阅读器人工验收或跨硬件性能测试。全目录 Demo 的生产主 chunk 仍触发 >500kB 提醒；它有意使用全量组件，不能作为最小消费应用的体积指标。

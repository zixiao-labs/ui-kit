# 参考纹样矢量描摹

## 修正内容

首版把云雷纹简化成了一个圆角块和一个方块交替，并在手写 `M/H/V` 路径中产生分叉；回纹和雷纹的勾连关系也不准确。此轮不再按名称自行画近似形，而是从用户提供的原图提取真实墨线轮廓。

- **回纹：** 提取内部回折单元，保留上下折返、旋入和接续关系。
- **云雷纹：** 保留参考图中高低、宽窄不同的完整回旋纹带；原有起止端保留，不为了平铺添加横线或分叉。
- **雷纹：** 提取内部丁形勾连单元，而非把单个 T 形贴到一条横线上。

只更改纹样路径及相关回归，不修改玻璃、主题颜色、默认透明度、交互或打包配置。

## 来源与裁剪

输入是本机工作区的 `ref/Screenshot_20261113_202955_com.xingin.xhs.jpg`，1216×2688。原文件保留在 `ref`，未复制进运行时资产或上传给服务。

SHA-256：

```text
14e6fae439e4b86de5cec569237ec60b8b3082284fd0fb311a56c399debfa3d8
```

裁剪坐标以原图左上角为原点，单位为像素：

| 纹样   |   x |    y |  宽 |  高 | 重复方式                                 |
| ------ | --: | ---: | --: | --: | ---------------------------------------- |
| 回纹   | 432 | 1894 | 120 | 104 | 图内相邻单元对应位置的切面一致，连续平铺 |
| 云雷纹 | 190 | 1552 | 948 | 196 | 保留完整不规则纹带及自然端点             |
| 雷纹   | 538 | 1258 | 219 | 188 | 图内相邻单元对应位置的切面一致，连续平铺 |

裁剪只包含黑框内的纹样，排除了黑框、文字、金色辅助线和手机界面。

## 本地转换

使用 ImageMagick 清理位图，再由 [Potrace 2.1.8](https://github.com/tooolbox/node-potrace) 自动拟合矢量轮廓。不是把原图嵌入 SVG，也不是把手写路径冒充自动描摹：

1. 裁剪 → 灰度 → 65% 阈值分离墨线与纸张。
2. 对墨线作 `Close Disk:1`，清理细小印刷孔洞，保留回旋内部的留白；剥离图片元数据。
3. 回纹、雷纹将清理后的周期并排复制三份后统一描摹，只显示中间周期，避免描摹器在被截断的边缘生成圆帽、造成拼接断缝。
4. Potrace 使用 `threshold: 128`、`turdSize: 8`、`alphaMax: 1`、`optTolerance: 0.5`。云雷纹直接描摹完整纹带，不人为凑成单一周期。
5. 渲染使用 `fill="currentColor"`、`fill-rule="evenodd"`，保留轮廓内孔；不再对已经描出的墨线外轮廓加 stroke，避免双重描边和意外连接。

工具仅用于制作素材，安装在忽略的工作目录，不进入 workspace 依赖或消费包。已有 ImageMagick 的环境可以复现：

```sh
npm install --prefix .oil-ui/pattern-trace/tools --no-save --package-lock=false \
  --ignore-scripts --no-audit --no-fund potrace@2.1.8

NODE_PATH="$PWD/.oil-ui/pattern-trace/tools/node_modules" \
  node packages/react/scripts/trace-patterns.mjs \
  ref/Screenshot_20261113_202955_com.xingin.xhs.jpg

pnpm exec oxfmt --write packages/react/src/optional/pattern-traces.ts
```

生成内容：

- `packages/react/assets/patterns/{hui,yunlei,lei}.svg`：可单独打开、检查或交给设计工具的矢量文件。
- `packages/react/src/optional/pattern-traces.ts`：供组件读取的同一组路径，不需要 SVG loader、外部资源请求或浏览器端描摹。
- `packages/react/tests/fixtures/patterns/*.png`：从原始图片独立得到的去噪墨线掩模，不是 SVG 截图，供回归比对。

日常构建不运行描摹工具，也不需要原始 JPEG、ImageMagick 或 Potrace。不要为了让测试通过而把参考掩模更新为错误矢量的截图。

## 验收

新增浏览器回归按原始裁剪尺寸渲染三个相邻周期，计算 **墨线的交并比（IoU）**，而不是把大片白背景也算入正确率：

| 纹样   | 矢量 vs 去噪参考墨线 IoU |
| ------ | -----------------------: |
| 回纹   |                   94.55% |
| 云雷纹 |                   96.32% |
| 雷纹   |                   93.98% |

每个形状要求 >93%；误差主要来自轮廓拟合和浏览器抗锯齿。回纹与雷纹还逐行比较两个平铺接缝两侧的墨线，防止中断或新增竖边。独立 SVG 有显式裁剪，测试验证改变宽高比后不会在两侧留白中露出邻接周期。组件 SSR 测试检查真实路径、等比缩放、填充规则和不重复描边。

```sh
pnpm check
pnpm exec lightning run packages/react/src/optional/patterns.test.tsx
UI_KITS_SCREENSHOT_DIR=test-results/pattern-trace pnpm exec lightning run \
  --config lightning.e2e.config.ts tests/patterns.e2e.test.ts tests/effects.e2e.test.ts
pnpm test:package
```

上述检查通过：4 项 SSR/API、3 项参考图形回归、9 项材质与光影回归，以及包级隔离检查。截图位于 `test-results/pattern-trace/`，其中 `comparison.png` 并排展示原图裁剪与实际 SVG。

Unslop 为本轮主代理自检：查看放大描摹条带和实际工作台的浅色、深色、手机与重排画面；只修正错误纹样，不重做品牌、排版、导航和动效。纹样继续默认关闭、低透明度、不截获操作。原始 Unslop 清单署名见 `patterns-glass-review.md`。

实际使用精确纹样的可选入口比错误简化版更大；pack 消费测试仍确认不使用纹样的产物没有增大。新体积记录在 `patterns-glass-review.md`。本轮未重跑整站生产构建或 Safari / Firefox 实机检查。

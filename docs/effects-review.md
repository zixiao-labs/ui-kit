# 可选材质与光影

## 设计方向与范围

- 产品：面向开发者的多风格 React 组件工作台，不改变已有组件的默认表现。
- 性格：克制、可验证、略带暖意。
- 材质来源：夜间建筑的檐线、墙脚照明；指针控制的卡片反光；只折射背景的玻璃边缘。
- 视觉主角：一个可操作的预览对象。导航、配置、标题与代码面板不使用这些效果。
- 一致性细节：明暗、形状、排版继续来自当前 `--zx-*` 主题合同，不建立另一套皮肤。

参考：

- [vgpu holographic-card](https://vgpu.sh/examples/holographic-card)：参考指针倾斜与反光，不复制示例的文字、三角图形或全息画面。
- [vgpu triangle-led-front](https://vgpu.sh/examples/triangle-led-front)：参考光从物体边缘溢出、照亮承托面的关系，不移植整套光线模拟。
- 用户给出的夜景照片：参考下半部分的暖色檐线、墙脚照明，不使用照片或水印作为交付资产。
- [liquid-glass-react](https://github.com/rdev/liquid-glass-react)：参考背景层与清晰内容分离、SVG 位移折射的实现思路。没有直接包裹该组件，避免引入其定位、尺寸、鼠标弹性与 div 点击语义。

## API

`effects` 与原有 `variant` 正交，可以单独启用或组合。不传 `effects` 或传空对象时全部关闭；`tilt`、`backlight`、`glass` 分别接受 `false`，阴影只在 `shadow: 'gpu'` 时启用。

| 组件              | 可选效果                                                        |
| ----------------- | --------------------------------------------------------------- |
| `Card`、`Surface` | `shadow: 'gpu'`、`tilt: true`、`backlight: true`、`glass: true` |
| `Button`          | `shadow: 'gpu'`、`backlight: true`、`glass: true`               |

```tsx
import { Button, Card } from '@zixiao-labs/ui-kits-react'
import '@zixiao-labs/ui-kits-react/styles.css'

;<div data-zx-style="hepo" data-zx-color-mode="dark">
  <Card effects={{ shadow: 'gpu', tilt: true, backlight: true }}>
    <h3>北岸设计</h3>
    <p>品牌识别与数字体验</p>
    <Button variant="outline" effects={{ glass: true }}>
      添加素材
    </Button>
  </Card>
</div>
```

倾斜用于较大的内容表面，不用于小操作目标、输入框、表格、加载反馈或焦点管理复杂的浮层。玻璃按钮保留原生 `button`、`ref`、表单属性、焦点、禁用与加载语义；玻璃效果会改用当前表面文字色，以免透明按钮沿用实心强调色上的文字。

工作台的 Button、Card、Surface 页均有「材质与光影」，初始全部关闭，可独立切换并复制当前 TSX。配置入口统一使用组件库 `Select`。切换页面或刷新会恢复无效果，不把装饰意外扩散到全局。

## 实现、成本与降级

### GPU 阴影

- 使用 vgpu 0.6.0 的 WebGPU fragment effect，解析圆角矩形的距离场，组合接触阴影与宽投影；内部保持透明。
- 后端通过动态导入加载。未启用时不请求 adapter、不创建 canvas、不运行 GPU 帧。
- 所有已挂载实例共享一个低功耗 device；最后一个实例退出后释放，初始化尚未完成时退出也会释放后续取得的 device。
- 管线预编译后按需绘制，没有常驻 `frameLoop`；尺寸、圆角、阴影强度或 DPR 改变才重新提交。DPR 上限为 2。隐藏页、离开视口时不绘制。
- 无 WebGPU、初始化/编译失败或 device 丢失时保留 CSS 阴影；禁用和加载按钮不显示投影与背光。
- 这是可选的渲染方式，不声称比浏览器 CSS 阴影更快。没有做跨硬件性能排名。
- Nasti 的开发依赖优化可能预加载 vgpu 的依赖模块；这不表示默认组件申请了 GPU。回归检查分别验证后端没有执行、adapter 没有被申请。

WGSL 是源文件；生成的元数据不手工编辑，浏览器不运行 WGSL parser：

```sh
pnpm --filter @zixiao-labs/ui-kits-react shaders:generate
pnpm --filter @zixiao-labs/ui-kits-react styles:generate
pnpm --filter @zixiao-labs/ui-kits-react exec vgpu check src/shadow.wgsl
```

`pnpm-workspace.yaml` 显式禁止 Node GPU 适配器与 `webgpu` 的安装脚本。本次只使用浏览器 WebGPU，不需要原生 Node 渲染环境；要使用 `vgpu/node` 时须另行审批这些脚本。

### 倾斜

- 鼠标位置对应最大 ±5° 转动与单色反光，按 rAF 合并输入，不因移动更新 React 状态。
- 离开、取消、窗口失焦、键盘进入、关闭效果时复位。
- 触屏、粗指针、无 hover、减少动态效果模式保持静态；不捕获触摸、不阻止滚动、不增加卡片 Tab 停靠点。

### 背光

- 上方细檐线、下方较宽漫反射，不循环呼吸、不做彩虹边框。
- 只在当前作用域为深色时点亮。新建 `data-zx-style` 边界会重置为浅色，内外互不污染。
- 可在具体主题作用域覆盖 `--zx-effect-backlight-color`；`--zx-effect-backlight-opacity` 的浅色默认值为 0，深色为 0.85。

### 玻璃

- 只对独立背景层应用 SVG 位移与 backdrop blur；文字、图标、按钮内容从不参与扭曲。
- 位移图根据实际尺寸和圆角生成，最大边 192px，中心中性、边缘折射；主题圆角或尺寸变化时更新，不随倾斜反复重建。
- 支持所有现有主题的均匀圆角矩形，不是任意异形、四角不同半径的路径渲染器。
- 不支持 backdrop filter 时退回实色表面；Safari、Firefox 的 SVG 背景折射可能不完整，应视为磨砂/透光降级，不承诺 Chromium 同等效果。
- 透明材质的可读性仍取决于应用放在其后的真实内容。默认带主题色底，消费者降低 `--zx-effect-glass-tint` 时应自行检查最差背景对比度。
- 强制颜色模式隐藏装饰层，恢复系统表面与边界。

## 同轮修复

### 系统下拉框回归

页面/样本主题、嵌套风格/明暗、效果样本明暗、移动组件目录均改为库内 `Select`。主题浮层、键盘导航和焦点复用同一机制。

React Aria 仍可能生成隐藏的原生 select 用于表单与自动填充，这不是可见的系统菜单。静态检查禁止 Demo 源码写原始 `<select>`；浏览器回归操作实际的按钮与 listbox，不通过隐藏 select 绕过界面。

### ProgressCircle 周期衔接

原本 SVG 自带 `rotate(-90deg)`，但共用的 `zx-spin` 只定义 `to: rotate(360deg)`，因此每轮实际旋转 450°，下一轮会跳回 90°。改为专用的 `-90deg → 270deg` 完整一圈，不影响其他 Spinner。回归在 999ms/1001ms 读取实际变换，验证跨周期仅前进 0.72°。

## Unslop 自检

按 `unslop` 的 signs、spacing、color、icons、copy、type、layout、details、visuals、motion 顺序检查。

- 保留已有品牌、字体与页面顺序；局部补充，不重做全站。
- 新增区域只保留一个预览主角，配置与代码不发光；建筑线稿服务于玻璃背景观察，不引入外部图片或水印。
- 暖背光与玻璃是用户明确要求的 opt-in 展示，不按普通装饰泛化删除；没有彩虹、渐变文字、Emoji 标签、呼吸灯或自动悬浮。
- 4px 间距基准、统一控件高度与三层文字角色；手机标题说明可换行，避免尾部孤字挤压标题。
- 倾斜只跟随主动输入，没有空闲循环；所有新增装饰对辅助技术隐藏、不截获点击。
- 实际查看桌面、手机、200% CSS 缩放截图；交互与视觉分别验证。
- 未使用子代理作独立评审：本线程按用户设置只在明确要求代理时委派，本轮为主代理自检。

检查清单来源：Unslop by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0；此处为针对本项目的审查记录。

截图保存在本地 `.oil-ui/surface-effects/shots/`，不作为运行时资产引用。

## 验证记录

- `pnpm check`：lint、格式、workspace 类型检查通过。
- Lightning 定向 SSR/API、样式、着色器元数据与原生 select 防回归检查：6 个文件、28 项通过。
- Chromium 浏览器回归：`effects`、`select-progress`、`theme-motion`、`catalogue`、`demo`，分批完成 45 项通过。包含真实 GPU 合成像素、空闲提交计数、反复启停、device 丢失、异步初始化取消、默认无 GPU 请求、键盘/触屏/减少动效、嵌套主题、手机目录、复制和禁用/加载行为。
- GPU 测试在 macOS 上显式启用 Chromium Metal，避免该机器默认 headless 后端提前丢失 device；其他平台保留默认 ANGLE 后端。该证据不等于所有 GPU/驱动的性能或兼容性验收。
- `vgpu check src/shadow.wgsl`：无诊断，原生 WGSL validation 通过。
- 已查看真实桌面/手机与 200% CSS 缩放证据，以及深色库内下拉菜单；Unslop 为主代理自检。
- 未执行生产构建、完整测试集合、Node 原生 GPU 渲染或 Safari/Firefox 实机测试。

# React v0.2.1 — 新中式设计 Skill 与消费文档

`@zixiao-labs/ui-kits-react@0.2.1` 在 npm 包内添了文档和可选 Agent Skill，不改变组件 API、原生风格样式、运行时依赖或 React 19 的 peer 要求。

## 随包新增

- [新中式设计 Skill `zixiao-new-chinese-design`](https://github.com/zixiao-labs/ui-kit/blob/react-v0.2.1/packages/react/skills/zixiao-new-chinese-design/SKILL.md)：从鹤坡和鹤坡·室内的材质、配色与宋黑分工出发；借鉴 Oil UI 的设计流程和 UI/UX Pro Max 的可用性检查，不用 Taste 的通用模板替产品决定视觉。
- [可选审稿脚本](https://github.com/zixiao-labs/ui-kit/blob/react-v0.2.1/packages/react/skills/zixiao-new-chinese-design/references/react-ui.md#可选审稿脚本)：离线检查设计卡，可标出工作台误用营销 hero、随机抽配色等问题。不自动执行，不代替浏览器验收。
- [React 接入](https://github.com/zixiao-labs/ui-kit/blob/react-v0.2.1/packages/react/docs/usage.md)、[组件用法](https://github.com/zixiao-labs/ui-kit/blob/react-v0.2.1/packages/react/docs/components.md)与[七种风格目录](https://github.com/zixiao-labs/ui-kit/blob/react-v0.2.1/packages/react/docs/styles.md)：覆盖主题作用域、明暗混用、配色预设、表单与浮层、传统纹样。

## 安装与兼容

```sh
pnpm add @zixiao-labs/ui-kits-react@0.2.1
```

已有 React 19 / React DOM 19 的应用不需要迁移。pnpm 12.11+ 能发现依赖自带的 Skill；需按 [启用说明](https://github.com/zixiao-labs/ui-kit/blob/react-v0.2.1/packages/react/README.md#agent-skill新中式设计指南)授权才会链接。不启用 Skill 不影响组件使用。

仓库新增 [Context7 配置](https://github.com/zixiao-labs/ui-kit/blob/react-v0.2.1/context7.json)，独立于 npm 安装和发布。在线索引需另行确认和刷新，离线文档随包版本固定。

[比较自上一版本的更改](https://github.com/zixiao-labs/ui-kit/compare/react-v0.2.0...react-v0.2.1)

# React 组件用法：操作、表单、浮层与可选材质

所有示例使用 `@zixiao-labs/ui-kits-react` 的公开入口。先按 [React 接入](usage.md) 在应用入口加载 CSS、设置主题作用域；组件示例不再重复加载 `styles.css`。这些用法在七种原生风格下相同。

## Button：用原生按钮语义表达动作

`Button` 使用原生 `onClick`、`type` 和 `disabled`。用 `solid` 表达主要动作，`tonal` 表达相关辅助动作，`outline` 或 `ghost` 表达更低权重。导航用链接，不要用无链接语义的按钮模拟。表单内提交按钮显式写 `type="submit"`；纯图标按钮需要可访问名称。

```tsx
import { Button } from '@zixiao-labs/ui-kits-react'

export function DraftActions({
  onSave,
  onCancel,
  saving,
}: {
  onSave: () => void
  onCancel: () => void
  saving: boolean
}) {
  return (
    <div>
      <Button type="button" variant="solid" disabled={saving} onClick={onSave}>
        {saving ? '正在保存…' : '保存草稿'}
      </Button>
      <Button type="button" variant="ghost" disabled={saving} onClick={onCancel}>
        取消
      </Button>
    </div>
  )
}
```

## TextField 与 Select：可见标签、实际选项和表单数据

`TextField` 默认自带输入控件；`onChange` 接收字符串，不是 DOM event。`Select` 用 `{ id, label }` 提供选项，`onChange` 接收选中 ID 或 `null`。用 `defaultValue` 交给组件管理初始值，或用 `value` / `onChange` 明确控制，不把两种方式混用。为控件提供可见 `label`，用 `description` 补充格式，用 `isInvalid` 和 `errorMessage` 表示字段错误。

```tsx
import { useState } from 'react'
import { Button, Select, TextField } from '@zixiao-labs/ui-kits-react'

const materials = [
  { id: 'wood', label: '木' },
  { id: 'stone', label: '石' },
]

export function ArchiveFilters({
  onSearch,
}: {
  onSearch: (filters: { query: string; material: string | null }) => void
}) {
  const [query, setQuery] = useState('')
  const [material, setMaterial] = useState<string | null>(null)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSearch({ query: query.trim(), material })
      }}
    >
      <TextField label="器物名称" value={query} onChange={setQuery} />
      <Select label="材质" items={materials} value={material} onChange={setMaterial} />
      <Button type="submit">筛选档案</Button>
    </form>
  )
}
```

示例把查询交给应用，没有伪造数据或成功状态。筛选后应在实际结果区提供结果、加载、空结果和失败反馈，不只改变按钮颜色。

## Modal：复用已有主题和键盘行为

`Modal` 的 `trigger` 可直接传库的 `Button`；用 `title` 给对话框命名。函数子元素拿到 `close()`，适合明确的结束动作。不要为了改外观把 Modal 重写成普通 `div`；在实际页面测试键盘进入、Escape 退出，以及退出后返回触发器。

```tsx
import { Button, Modal } from '@zixiao-labs/ui-kits-react'

export function ArchiveNote({ note }: { note: string }) {
  return (
    <div data-zx-style="hepo" data-zx-color-mode="dark">
      <Modal title="档案说明" trigger={<Button variant="outline">查看说明</Button>}>
        {({ close }) => (
          <>
            <p>{note}</p>
            <Button onClick={close}>关闭说明</Button>
          </>
        )}
      </Modal>
    </div>
  )
}
```

如果使用 `ToastProvider` / `useToast`，将 Provider 放在对应作用域内，让发布者成为其子组件；不要依赖全局队列跨越独立主题。字段错误通常应保留在字段旁，不只放在短暂通知里。

## PatternBackground：局部使用回纹、云雷纹或雷纹

从 `/patterns` 导入组件、从 `/patterns.css` 导入样式；不使用时不导入。`hui` 和 `lei` 连续平铺，`yunlei` 保留完整纹带。颜色和透明度读取 `--zx-pattern-color` / `--zx-pattern-opacity`。选一种、用在有限范围；正文、表单和数据优先放在实色面上。

```tsx
import { PatternBackground } from '@zixiao-labs/ui-kits-react/patterns'
import '@zixiao-labs/ui-kits-react/patterns.css'

export function ArchiveBorder() {
  return <PatternBackground pattern="yunlei" aria-hidden="true" style={{ minHeight: 48 }} />
}
```

不要给包住正文或可操作控件的容器加 `aria-hidden`。示例只把没有语义内容的纹样区域标成装饰。

## 玻璃与 GPU 阴影不是主题依赖

- `LiquidGlassSurface` 从 `/liquid-glass` 导入，并加载 `/liquid-glass.css`；实际使用玻璃适配器时安装其可选 peer `liquid-glass-react@^1.1.1`。服务端和加载失败时保留实色表面，折射因浏览器而异。
- `Surface` / `Card` 的 `effects` 可选用 `shadow: 'gpu'`、`tilt`、`backlight` 或 `glass`；`Button` 的 `effects` 不支持 `tilt`。内置 `glass` 与外部 `LiquidGlassSurface` 是不同功能。它们都不是七种主题的前置条件。
- 默认不在新中式页面添加这些效果。确实需要时，在无 GPU、减少动效和触屏环境验证阅读及主任务仍然可用。

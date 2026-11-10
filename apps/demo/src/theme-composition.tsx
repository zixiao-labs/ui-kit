import { useState } from 'react'
import { Button, Card, Modal, Select, Switch, TextField } from '@zixiao-labs/ui-kits-react'
import { useTheme } from './theme'
import { isStyleName, styleOptions, type StyleName } from './style-options'

/** An ordinary, non-persistent form demonstrates real nested and body-portal isolation. */
export function ThemeComposition() {
  const { sampleStyle, dark, previewStyle } = useTheme()
  const [innerStyle, setInnerStyle] = useState<StyleName>('endfield')
  const [innerMode, setInnerMode] = useState<'light' | 'dark'>('dark')
  return (
    <details className="theme-composition" id="theme-composition">
      <summary>风格混用实验</summary>
      <div className="composition-controls">
        <Select
          className="style-select"
          label="嵌套风格"
          value={innerStyle}
          onChange={(value) => {
            if (isStyleName(value)) setInnerStyle(value)
          }}
          items={styleOptions.map(({ id, name }) => ({ id, label: name }))}
        />
        <Select
          className="style-select"
          label="嵌套明暗"
          value={innerMode}
          onChange={(value) => {
            if (value === 'light' || value === 'dark') setInnerMode(value)
          }}
          items={[
            { id: 'light', label: '浅色' },
            { id: 'dark', label: '深色' },
          ]}
        />
      </div>
      <div
        className="composition-outer"
        data-zx-style={sampleStyle.id}
        data-zx-color-mode={dark ? 'dark' : 'light'}
        style={previewStyle}
      >
        <div className="composition-caption">
          <span>外层 / {sampleStyle.name}</span>
          <span>{dark ? '深色' : '浅色'}</span>
        </div>
        <TextField label="工作区名称" defaultValue="组件风格实验" />
        <Card
          className="composition-inner"
          data-zx-style={innerStyle}
          data-zx-color-mode={innerMode}
          variant="outline"
        >
          <div className="composition-caption">
            <span>嵌套 / {styleOptions.find((item) => item.id === innerStyle)!.name}</span>
            <span>{innerMode === 'dark' ? '深色' : '浅色'}</span>
          </div>
          <Switch defaultSelected>保留本地草稿</Switch>
          <Modal trigger={<Button>打开嵌套浮层</Button>} title="局部主题设置">
            {({ close }) => (
              <div className="example-stack">
                <Select
                  label="评审方式"
                  defaultSelectedKey="async"
                  items={[
                    { id: 'async', label: '异步评审' },
                    { id: 'live', label: '同步评审' },
                  ]}
                />
                <Button onClick={close}>完成预览</Button>
              </div>
            )}
          </Modal>
        </Card>
        <Button variant="outline">外层操作</Button>
      </div>
      <p className="foundation-note">
        新风格作用域重置为浅色，深色需显式指定。浮层读取触发器的有效主题，不随 portal 的 DOM
        位置改变。
      </p>
      <pre tabIndex={0} aria-label="风格混用代码">
        <code>{`<div data-zx-style="${sampleStyle.id}" data-zx-color-mode="${dark ? 'dark' : 'light'}">
  <TextField label="工作区名称" />
  <Card data-zx-style="${innerStyle}" data-zx-color-mode="${innerMode}">
    <Switch>保留本地草稿</Switch>
    <Modal trigger={<Button>打开嵌套浮层</Button>} title="局部主题设置">
      {/* 浮层及内部选择器保持此作用域的主题 */}
    </Modal>
  </Card>
</div>`}</code>
      </pre>
    </details>
  )
}

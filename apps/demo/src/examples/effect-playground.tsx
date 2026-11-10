import { useState } from 'react'
import { Copy, Plus } from '@gravity-ui/icons'
import { Button, Card, Select, Surface } from '@zixiao-labs/ui-kits-react'
import type { SurfaceEffects } from '@zixiao-labs/ui-kits-react'
import { useTheme } from '../theme'

const options = [
  { id: 'shadow', label: 'GPU 阴影', detail: '柔和投影 · 不支持时保留 CSS 阴影' },
  { id: 'tilt', label: '指针倾斜', detail: '轻微转动与反光 · 仅精细指针' },
  { id: 'backlight', label: '深色背光', detail: '暖色檐线与底部漫反射 · 仅深色点亮' },
  { id: 'glass', label: '液态玻璃', detail: '边缘折射 · 中央文字保持清晰' },
] as const

export function EffectPlayground({ component }: { component: 'Button' | 'Card' | 'Surface' }) {
  const { previewStyle, dark, sampleStyle, settings } = useTheme()
  const [effects, setEffects] = useState<SurfaceEffects>({})
  const [mode, setMode] = useState('auto')
  const [count, setCount] = useState(0)
  const [disabled, setDisabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copyResult, setCopyResult] = useState<{ code: string; message: string } | null>(null)
  const isDark = mode === 'auto' ? dark : mode === 'dark'
  const entries = Object.entries(effects).filter(
    ([key, value]) => value && (component !== 'Button' || key !== 'tilt'),
  )
  const selected = Object.fromEntries(entries) as SurfaceEffects
  const props = entries.length
    ? ` effects={{ ${entries.map(([key, value]) => `${key}: ${typeof value === 'string' ? `'${value}'` : value}`).join(', ')} }}`
    : ''
  const custom = settings.customized && previewStyle
  const example = `import { ${component}${component === 'Button' ? '' : ', Button'} } from '@zixiao-labs/ui-kits-react'
import '@zixiao-labs/ui-kits-react/styles.css'${custom ? "\nimport { createTheme } from '@zixiao-labs/ui-kits-react/theme'" : ''}

<div data-zx-style="${sampleStyle.id}" data-zx-color-mode="${isDark ? 'dark' : 'light'}"${custom ? `\n  style={createTheme(${JSON.stringify({ primary: settings.primary, secondary: settings.secondary, radius: settings.radius })}, ${isDark})}` : ''}>
  <${component}${component === 'Button' ? ' variant="outline"' : ''}${props}${component === 'Button' ? `${disabled ? ' disabled' : ''}${loading ? ' loading' : ''}` : ''}>
    ${component === 'Button' ? '添加素材' : '<h3>北岸设计</h3>\n    <p>品牌识别与数字体验 · 周五评审</p>\n    <Button variant="tonal">添加素材</Button>'}
  </${component}>
</div>`

  function toggle(id: (typeof options)[number]['id'], checked: boolean) {
    setEffects((value) => ({
      ...value,
      [id]: id === 'shadow' ? (checked ? 'gpu' : undefined) : checked,
    }))
    setCopyResult(null)
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(example)
      setCopyResult({ code: example, message: '已复制效果代码' })
    } catch {
      setCopyResult({ code: example, message: '无法访问剪贴板，请选中代码手动复制' })
    }
  }
  const action = (
    <Button
      variant={component === 'Button' ? 'outline' : 'tonal'}
      effects={component === 'Button' ? selected : undefined}
      disabled={disabled}
      loading={loading}
      onClick={() => setCount((value) => value + 1)}
      data-testid={component === 'Button' ? 'effect-sample' : undefined}
    >
      <Plus aria-hidden="true" />
      添加素材
    </Button>
  )
  const Container = component === 'Surface' ? Surface : Card
  return (
    <section className="effects-lab" aria-label={`${component} 可选效果`}>
      <div className="section-heading">
        <h2>材质与光影</h2>
        <span className="section-caption">独立启用，不改变默认样式</span>
      </div>
      <div className="effects-workbench">
        <fieldset className="effects-options">
          <legend className="zx-sr-only">启用效果</legend>
          {options
            .filter((option) => component !== 'Button' || option.id !== 'tilt')
            .map((option) => (
              <label key={option.id}>
                <input
                  type="checkbox"
                  checked={Boolean(effects[option.id])}
                  onChange={(event) => toggle(option.id, event.target.checked)}
                />
                <span>
                  {option.label}
                  <small>{option.detail}</small>
                </span>
              </label>
            ))}
          <Select
            className="effects-mode style-select"
            label="效果样本明暗"
            value={mode}
            onChange={(value) => {
              if (value) setMode(value)
            }}
            items={[
              { id: 'auto', label: '跟随页面' },
              { id: 'light', label: '浅色' },
              { id: 'dark', label: '深色' },
            ]}
          />
          {component === 'Button' && (
            <div className="effects-button-states">
              <label>
                <input
                  type="checkbox"
                  checked={disabled}
                  onChange={(event) => setDisabled(event.target.checked)}
                />
                禁用按钮
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={loading}
                  onChange={(event) => setLoading(event.target.checked)}
                />
                加载中
              </label>
            </div>
          )}
          <button
            type="button"
            className="copy-button"
            onClick={() => {
              setEffects({})
              setDisabled(false)
              setLoading(false)
              setCopyResult(null)
            }}
          >
            恢复无效果
          </button>
        </fieldset>
        <div
          className="effects-stage"
          data-zx-style={sampleStyle.id}
          data-zx-color-mode={isDark ? 'dark' : 'light'}
          style={previewStyle}
        >
          <svg className="effects-drawing" viewBox="0 0 600 360" fill="none" aria-hidden="true">
            <path d="M0 280H600M40 280V160L160 96L280 160V280M72 280V180H248V280M300 280V120L420 56L560 120V280M328 280V140H532V280M160 96V52M420 56V20" />
            <path d="M92 280V208H132V280M184 280V208H224V280M352 280V176H396V280M452 280V176H504V280" />
          </svg>
          {component === 'Button' ? (
            action
          ) : (
            <Container effects={selected} className="effects-sample" data-testid="effect-sample">
              <span className="effects-project-type">项目档案 · 北岸</span>
              <h3>北岸设计</h3>
              <p>
                品牌识别与数字体验
                <br />
                下一轮评审 · 周五 14:30
              </p>
              {action}
            </Container>
          )}
          <output className="effects-result" aria-live="polite">
            已添加 {count} 份素材
          </output>
        </div>
      </div>
      <div className="code-panel">
        <div className="code-heading">
          <span>当前效果 / TSX</span>
          <button type="button" className="copy-button" onClick={copy}>
            <Copy aria-hidden="true" />
            复制效果代码
          </button>
        </div>
        <pre tabIndex={0} aria-label="当前效果代码">
          <code>{example}</code>
        </pre>
        {copyResult?.code === example && (
          <output className="copy-feedback">{copyResult.message}</output>
        )}
      </div>
    </section>
  )
}

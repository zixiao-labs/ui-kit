import { useTheme } from './theme'
import { isStyleName, styleOptions } from './style-options'

export function GlobalStyleSelect() {
  const { settings, selectStyle } = useTheme()
  return (
    <label className="style-select">
      <span>全局风格</span>
      <select
        aria-label="全局风格"
        value={settings.style}
        onChange={(event) => {
          if (isStyleName(event.target.value)) selectStyle(event.target.value)
        }}
      >
        {styleOptions.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  )
}

/** One preview selection is shared across the entire component catalogue. */
export function StyleSelect({ label = '预览风格' }: { label?: string }) {
  const { settings, update } = useTheme()
  return (
    <label className="style-select">
      <span>{label}</span>
      <select
        aria-label={label}
        value={settings.preview}
        onChange={(event) => {
          const value = event.target.value
          if (value === 'inherit' || isStyleName(value)) update({ preview: value })
        }}
      >
        <option value="inherit">跟随全局</option>
        {styleOptions.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  )
}

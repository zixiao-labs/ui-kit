import { Select } from '@zixiao-labs/ui-kits-react'
import { useTheme } from './theme'
import { isStyleName, styleOptions } from './style-options'

const items = styleOptions.map(({ id, name }) => ({ id, label: name }))
const previewItems = [{ id: 'inherit', label: '跟随全局' }, ...items]

export function GlobalStyleSelect() {
  const { settings, selectStyle } = useTheme()
  return (
    <Select
      className="style-select"
      label="全局风格"
      items={items}
      value={settings.style}
      onChange={(value) => {
        if (isStyleName(value)) selectStyle(value)
      }}
    />
  )
}

/** One preview selection is shared across the entire component catalogue. */
export function StyleSelect({
  label = '预览风格',
  className,
}: {
  label?: string
  className?: string
}) {
  const { settings, update } = useTheme()
  return (
    <Select
      className={['style-select', className].filter(Boolean).join(' ')}
      label={label}
      items={previewItems}
      value={settings.preview}
      onChange={(value) => {
        if (value === 'inherit' || isStyleName(value)) update({ preview: value })
      }}
    />
  )
}

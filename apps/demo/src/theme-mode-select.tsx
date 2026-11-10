import { Display, Moon, Sun } from '@gravity-ui/icons'
import { Select } from '@zixiao-labs/ui-kits-react'
import { useTheme } from './theme'

const modeLabels = { system: '跟随系统', light: '浅色', dark: '深色' } as const

export function ThemeModeSelect({ label, compact = false }: { label: string; compact?: boolean }) {
  const { settings, update } = useTheme()
  const Icon = { system: Display, light: Sun, dark: Moon }[settings.mode]
  return (
    <div
      className={`theme-mode-control ${compact ? 'icon-button' : 'mode-toggle'}`}
      title={`${label}：${modeLabels[settings.mode]}`}
    >
      <Icon aria-hidden="true" />
      <Select
        className="theme-mode-picker"
        label={label}
        value={settings.mode}
        onChange={(value) => {
          if (value === 'system' || value === 'light' || value === 'dark') update({ mode: value })
        }}
        items={Object.entries(modeLabels).map(([id, name]) => ({ id, label: name }))}
      />
    </div>
  )
}

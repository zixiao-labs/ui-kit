import { Display, Moon, Sun } from '@gravity-ui/icons'
import { useTheme } from './theme'
import type { ThemeMode } from './theme'

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
      {!compact && <span aria-hidden="true">{modeLabels[settings.mode]}</span>}
      <select
        aria-label={label}
        value={settings.mode}
        onChange={(event) => update({ mode: event.target.value as ThemeMode })}
      >
        {Object.entries(modeLabels).map(([mode, name]) => (
          <option key={mode} value={mode}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}

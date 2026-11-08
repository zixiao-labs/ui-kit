export const styleOptions = [
  {
    id: 'clean',
    name: 'Clean',
    description: '圆角轮廓，紫霄品牌色',
    primary: '#8b5cf6',
    secondary: '#fcd34d',
    radius: 12,
  },
  {
    id: 'endfield',
    name: 'Endfield',
    description: '矩形控件，信号黄操作标记',
    primary: '#fffa00',
    secondary: '#191919',
    radius: 0,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: '小圆角，绿色强调',
    primary: '#25563f',
    secondary: '#e3ede5',
    radius: 6,
  },
  {
    id: 'soft',
    name: 'Soft',
    description: '柔和紫色，轻量阴影',
    primary: '#71509a',
    secondary: '#f0e8f8',
    radius: 16,
  },
  {
    id: 'brutalist',
    name: 'Brutalist',
    description: '直角边界，高对比配色',
    primary: '#e5f36a',
    secondary: '#24251c',
    radius: 0,
  },
] as const

export type StyleName = (typeof styleOptions)[number]['id']

export function isStyleName(value: unknown): value is StyleName {
  return styleOptions.some((item) => item.id === value)
}

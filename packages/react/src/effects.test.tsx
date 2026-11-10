import { expect, test } from '@lightning-js/lightning'
import { renderToStaticMarkup } from 'react-dom/server'
import { Button, Card, Surface } from './index'

test('effects are entirely opt-in, including an empty or false configuration', () => {
  for (const element of [
    <Button key="button">保存</Button>,
    <Card key="card">项目</Card>,
    <Surface key="surface">内容</Surface>,
    <Card key="empty" effects={{}}>
      项目
    </Card>,
    <Button key="false" effects={{ glass: false, backlight: false }}>
      保存
    </Button>,
  ]) {
    const html = renderToStaticMarkup(element)
    expect(html).not.toContain('data-zx-effects')
    expect(html).not.toContain('zx-effect-')
    expect(html).not.toContain(' effects=')
    expect(html).not.toContain('<canvas')
  }
})

test('composes effects without replacing variants, native semantics or consumer content', () => {
  const html = renderToStaticMarkup(
    <Card
      variant="tonal"
      effects={{ shadow: 'gpu', tilt: true, backlight: true, glass: true }}
      id="project"
    >
      <Button type="submit" name="intent" value="save" effects={{ glass: true }} loading>
        保存素材
      </Button>
    </Card>,
  )
  for (const attribute of [
    'data-variant="tonal"',
    'data-zx-shadow="true"',
    'data-zx-tilt="true"',
    'data-zx-backlight="true"',
    'data-zx-glass="true"',
    'id="project"',
    'type="submit"',
    'name="intent"',
    'value="save"',
    'aria-busy="true"',
    'disabled=""',
  ])
    expect(html).toContain(attribute)
  expect(html).toContain('保存素材')
  expect(html).toContain('feDisplacementMap')
  expect(html).not.toContain('tabindex')
  expect(html).not.toContain('role="button"')
  expect(html).not.toContain(' effects=')
})

test('glass instances have unique SSR-stable filter references', () => {
  const html = renderToStaticMarkup(
    <>
      <Card effects={{ glass: true }} />
      <Button effects={{ glass: true }}>添加</Button>
    </>,
  )
  const ids = [...html.matchAll(/<filter id="([^"]+)"/g)].map((match) => match[1])
  expect(ids.length).toBe(2)
  expect(new Set(ids).size).toBe(2)
  for (const id of ids) expect(html).toContain(`url(&quot;#${id}&quot;)`)
})

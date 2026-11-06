import { describe, expect, test } from '@lightning-js/lightning'
import { renderToStaticMarkup } from 'react-dom/server'
import { Button } from './button'

describe('Button public contract', () => {
  test('defaults to a non-submitting medium filled button', () => {
    const html = renderToStaticMarkup(<Button>创建项目</Button>)
    expect(html).toContain('type="button"')
    expect(html).toContain('data-variant="solid"')
    expect(html).toContain('data-size="md"')
    expect(html).not.toContain('disabled=""')
  })

  test('forwards native attributes and combines classes', () => {
    const html = renderToStaticMarkup(
      <Button type="submit" name="intent" value="save" className="custom" aria-label="保存项目">
        保存
      </Button>,
    )
    expect(html).toContain('type="submit"')
    expect(html).toContain('name="intent"')
    expect(html).toContain('value="save"')
    expect(html).toContain('class="zx-button custom"')
    expect(html).toContain('aria-label="保存项目"')
  })

  test.each(['solid', 'tonal', 'outline', 'ghost'] as const)('renders variant %s', (variant) => {
    const html = renderToStaticMarkup(<Button variant={variant}>创建项目</Button>)
    expect(html).toContain(`data-variant="${variant}"`)
  })

  test('loading retains the label, marks busy and prevents interaction', () => {
    const html = renderToStaticMarkup(<Button loading>保存草稿</Button>)
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('disabled=""')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('保存草稿')
  })

  test('respects disabled and explicit aria-busy independently', () => {
    const html = renderToStaticMarkup(
      <Button disabled aria-busy="true">
        保存草稿
      </Button>,
    )
    expect(html).toContain('disabled=""')
    expect(html).toContain('aria-busy="true"')
    expect(html).not.toContain('zx-button__spinner')
  })
})

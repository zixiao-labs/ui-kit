import { expect, test } from '@lightning-js/lightning'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  Alert,
  Avatar,
  Badge,
  ButtonGroup,
  Card,
  CloseButton,
  Kbd,
  Meter,
  ProgressBar,
  ProgressCircle,
  ScrollShadow,
  Skeleton,
  Spinner,
  ToggleButton,
} from './display'

test('display components preserve meaningful semantics and forwarded attributes', () => {
  const html = renderToStaticMarkup(
    <ButtonGroup aria-label="操作">
      <CloseButton disabled aria-label="关闭通知" />
      <Badge tone="error">需修改</Badge>
      <Card variant="tonal" data-testid="card">
        北岸设计
      </Card>
      <Kbd>Esc</Kbd>
    </ButtonGroup>,
  )
  expect(html).toContain('<fieldset')
  expect(html).toContain('aria-label="关闭通知"')
  expect(html).toContain('disabled=""')
  expect(html).toContain('data-tone="error"')
  expect(html).toContain('data-testid="card"')
  expect(html).toContain('<kbd')
})

test('alerts distinguish urgent errors from status information', () => {
  expect(
    renderToStaticMarkup(
      <Alert tone="error" title="无法保存">
        请重试
      </Alert>,
    ),
  ).toContain('role="alert"')
  expect(renderToStaticMarkup(<Alert title="已归档" />)).toContain('role="status"')
})

test('progress and meter expose their values and accessible names', () => {
  const progress = renderToStaticMarkup(<ProgressBar label="上传" value={60} />)
  expect(progress).toContain('role="progressbar"')
  expect(progress).toContain('aria-valuenow="60"')
  expect(progress).toContain('scaleX(0.6)')
  const circle = renderToStaticMarkup(<ProgressCircle label="文件" value={72} />)
  expect(circle).toContain('stroke-dasharray="72 100"')
  const meter = renderToStaticMarkup(<Meter label="用量" value={4} maxValue={8} />)
  expect(meter).toContain('role="meter"')
  expect(meter).toContain('aria-valuemax="8"')
})

test('loading and fallback visuals remain understandable without images', () => {
  expect(renderToStaticMarkup(<Spinner label="正在上传" />)).toContain('正在上传')
  expect(renderToStaticMarkup(<Skeleton />)).toContain('aria-hidden="true"')
  const avatar = renderToStaticMarkup(<Avatar name="Alex Chen" />)
  expect(avatar).toContain('aria-label="Alex Chen"')
  expect(avatar).toContain('AC')
  expect(renderToStaticMarkup(<ScrollShadow>内容</ScrollShadow>)).toContain('tabindex="0"')
})

test('toggle state is accessible and disabled is not merely visual', () => {
  const html = renderToStaticMarkup(
    <ToggleButton defaultSelected isDisabled>
      关注
    </ToggleButton>,
  )
  expect(html).toContain('aria-pressed="true"')
  expect(html).toContain('disabled=""')
})

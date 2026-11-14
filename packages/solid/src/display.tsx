import { createSignal, Show, splitProps } from 'solid-js'
import type { ComponentProps, JSX } from 'solid-js'
import { ToggleButton as KToggle } from '@kobalte/core/toggle-button'
import { ToggleGroup as KToggleGroup } from '@kobalte/core/toggle-group'
import { Button } from './button'
import type { ButtonProps } from './button'
import { Icon } from './icons'
import { cx } from './utils'

export function ButtonGroup(props: JSX.FieldsetHTMLAttributes<HTMLFieldSetElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return <fieldset {...rest} class={cx('zx-button-group', local.class)} />
}
export function AvatarGroup(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div {...rest} class={cx('zx-avatar-group', local.class)} />
}
export function Kbd(props: JSX.HTMLAttributes<HTMLElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return <kbd {...rest} class={cx('zx-kbd', local.class)} />
}
export function Table(props: JSX.HTMLAttributes<HTMLTableElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return <table {...rest} class={cx('zx-table', local.class)} />
}
export function TableHeader(props: JSX.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />
}
export function TableBody(props: JSX.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />
}
export function Column(props: JSX.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th scope="col" {...props} />
}
export function Row(props: JSX.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} />
}
export function Cell(props: JSX.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} />
}

export function CloseButton(props: ButtonProps) {
  const [local, rest] = splitProps(props, ['children'])
  return (
    <Button variant="ghost" aria-label="关闭" {...rest}>
      {local.children ?? <Icon name="close" />}
    </Button>
  )
}

export type ToggleButtonProps = ComponentProps<typeof KToggle<'button'>>
export function ToggleButton(props: ToggleButtonProps) {
  const [local, rest] = splitProps(props, ['class'])
  return <KToggle {...rest} class={cx('zx-toggle-button', local.class)} />
}

export type ToggleButtonGroupProps = ComponentProps<typeof KToggleGroup<'div'>>
export function ToggleButtonGroup(props: ToggleButtonGroupProps) {
  const [local, rest] = splitProps(props, ['class'])
  return <KToggleGroup {...rest} class={cx('zx-button-group', local.class)} />
}
export function ToggleButtonGroupItem(props: ComponentProps<typeof KToggleGroup.Item<'button'>>) {
  const [local, rest] = splitProps(props, ['class'])
  return <KToggleGroup.Item {...rest} class={cx('zx-toggle-button', local.class)} />
}

export interface SurfaceProps extends JSX.HTMLAttributes<HTMLDivElement> {
  variant?: 'flat' | 'tonal' | 'outline'
}
export function Surface(props: SurfaceProps) {
  const [local, rest] = splitProps(props, ['variant', 'class'])
  return (
    <div {...rest} class={cx('zx-surface', local.class)} data-variant={local.variant ?? 'flat'} />
  )
}
export function Card(props: SurfaceProps) {
  const [local, rest] = splitProps(props, ['class', 'variant'])
  return (
    <Surface {...rest} variant={local.variant ?? 'outline'} class={cx('zx-card', local.class)} />
  )
}
export function Separator(props: JSX.HTMLAttributes<HTMLHRElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return <hr {...rest} class={cx('zx-separator', local.class)} />
}
export function Toolbar(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class'])
  // An action group, not a form fieldset; no unimplemented toolbar roving focus.
  // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
  return <div role="group" {...rest} class={cx('zx-toolbar', local.class)} />
}
export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'accent' | 'error'
}
export function Badge(props: BadgeProps) {
  const [local, rest] = splitProps(props, ['class', 'tone'])
  return <span {...rest} class={cx('zx-badge', local.class)} data-tone={local.tone ?? 'neutral'} />
}
export interface ChipProps extends BadgeProps {
  onRemove?: () => void
  removeLabel?: string
}
export function Chip(props: ChipProps) {
  const [local, rest] = splitProps(props, ['class', 'children', 'onRemove', 'removeLabel'])
  return (
    <Badge {...rest} class={cx('zx-chip', local.class)}>
      {local.children}
      <Show when={local.onRemove}>
        <button
          type="button"
          class="zx-chip-remove"
          aria-label={
            local.removeLabel ??
            `移除 ${typeof local.children === 'string' ? local.children : '标签'}`
          }
          onClick={() => local.onRemove?.()}
        >
          <Icon name="close" />
        </button>
      </Show>
    </Badge>
  )
}
export interface AvatarProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
}
// The fallback is text; a native img cannot contain it.
/* oxlint-disable jsx-a11y/prefer-tag-over-role */
export function Avatar(props: AvatarProps) {
  const [local, rest] = splitProps(props, ['name', 'src', 'size', 'class'])
  const [failed, setFailed] = createSignal<string>()
  const initials = () =>
    local.name
      .trim()
      .split(/\s+/)
      .map((part) => Array.from(part)[0])
      .slice(0, 2)
      .join('') || '?'
  return (
    <span
      {...rest}
      class={cx('zx-avatar', local.class)}
      data-size={local.size ?? 'md'}
      role="img"
      aria-label={local.name}
    >
      <Show
        when={local.src && local.src !== failed()}
        fallback={<span aria-hidden="true">{initials()}</span>}
      >
        <img src={local.src} alt="" onError={() => setFailed(local.src)} />
      </Show>
    </span>
  )
}
/* oxlint-enable jsx-a11y/prefer-tag-over-role */
export interface AlertProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: JSX.Element
  tone?: BadgeProps['tone']
}
export function Alert(props: AlertProps) {
  const [local, rest] = splitProps(props, ['title', 'tone', 'class', 'children'])
  return (
    <div
      role={local.tone === 'error' ? 'alert' : 'status'}
      {...rest}
      class={cx('zx-alert', local.class)}
      data-tone={local.tone ?? 'neutral'}
    >
      <Show when={local.title}>
        <strong>{local.title}</strong>
      </Show>
      <Show when={local.children}>
        <div>{local.children}</div>
      </Show>
    </div>
  )
}

export interface ProgressProps extends JSX.HTMLAttributes<HTMLDivElement> {
  value?: number
  minValue?: number
  maxValue?: number
  isIndeterminate?: boolean
  label: string
}
function Progress(props: ProgressProps & { circle?: boolean; meter?: boolean }) {
  const [local, rest] = splitProps(props, [
    'value',
    'minValue',
    'maxValue',
    'isIndeterminate',
    'label',
    'circle',
    'meter',
    'class',
  ])
  const min = () => local.minValue ?? 0
  const max = () => Math.max(min() + 1, local.maxValue ?? 100)
  const value = () => Math.max(min(), Math.min(max(), local.value ?? 0))
  const percentage = () => ((value() - min()) / (max() - min())) * 100
  return (
    <div
      {...rest}
      class={cx(local.circle ? 'zx-progress-circle' : 'zx-progress', local.class)}
      role={local.meter ? 'meter' : 'progressbar'}
      aria-label={local.label}
      aria-valuemin={min()}
      aria-valuemax={max()}
      aria-valuenow={local.isIndeterminate ? undefined : value()}
    >
      <Show
        when={local.circle}
        fallback={
          <>
            <div class="zx-progress-heading">
              <span>{local.label}</span>
              <Show when={!local.isIndeterminate}>
                <span>{Math.round(percentage())}%</span>
              </Show>
            </div>
            <div class="zx-progress-track" data-indeterminate={local.isIndeterminate || undefined}>
              <div
                class="zx-progress-fill"
                style={{
                  transform: `scaleX(${local.isIndeterminate ? 0.35 : percentage() / 100})`,
                }}
              />
            </div>
          </>
        }
      >
        <svg
          viewBox="0 0 48 48"
          aria-hidden="true"
          data-indeterminate={local.isIndeterminate || undefined}
        >
          <circle class="zx-circle-track" cx="24" cy="24" r="20" />
          <circle
            class="zx-circle-fill"
            cx="24"
            cy="24"
            r="20"
            pathLength="100"
            stroke-dasharray={`${local.isIndeterminate ? 25 : percentage()} 100`}
          />
        </svg>
        <span>{local.label}</span>
        <Show when={!local.isIndeterminate}>
          <span>{Math.round(percentage())}%</span>
        </Show>
      </Show>
    </div>
  )
}
export function ProgressBar(props: ProgressProps) {
  return <Progress {...props} />
}
export function ProgressCircle(props: ProgressProps) {
  return <Progress {...props} circle />
}
export function Meter(props: Omit<ProgressProps, 'isIndeterminate'>) {
  return <Progress {...props} meter />
}
export function Spinner(props: JSX.OutputHTMLAttributes<HTMLOutputElement> & { label?: string }) {
  const [local, rest] = splitProps(props, ['class', 'label'])
  return (
    <output {...rest} class={cx('zx-spinner', local.class)}>
      <span class="zx-sr-only">{local.label ?? '正在加载'}</span>
    </output>
  )
}
export function Skeleton(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div {...rest} aria-hidden="true" class={cx('zx-skeleton', local.class)} />
}
export function Typography(
  props: JSX.HTMLAttributes<HTMLParagraphElement> & {
    variant?: 'headline' | 'title' | 'body' | 'label'
  },
) {
  const [local, rest] = splitProps(props, ['class', 'variant'])
  return (
    <p {...rest} class={cx('zx-typography', local.class)} data-variant={local.variant ?? 'body'} />
  )
}
// Focus is needed for native arrow-key scrolling.
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex */
export function ScrollShadow(props: JSX.HTMLAttributes<HTMLElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <section
      aria-label="可滚动内容"
      tabIndex={0}
      {...rest}
      class={cx('zx-scroll-shadow', local.class)}
    />
  )
}
/* oxlint-enable jsx-a11y/no-noninteractive-tabindex */

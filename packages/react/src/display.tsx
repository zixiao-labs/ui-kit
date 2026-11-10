import { useId, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import * as Aria from 'react-aria-components'
import { Xmark } from '@gravity-ui/icons'
import { Button } from './button'
import type { ButtonProps } from './button'
import { EffectLayers, useSurfaceEffects } from './effects'
import type { SurfaceEffects } from './effects'

function cx(base: string, extra?: string) {
  return [base, extra].filter(Boolean).join(' ')
}

export function ButtonGroup({ className, ...props }: ComponentProps<'fieldset'>) {
  return <fieldset {...props} className={cx('zx-button-group', className)} />
}

export function CloseButton({ 'aria-label': label = '关闭', children, ...props }: ButtonProps) {
  return (
    <Button variant="ghost" {...props} aria-label={label}>
      {children ?? <Xmark aria-hidden="true" />}
    </Button>
  )
}

export function ToggleButton({ className, ...props }: Aria.ToggleButtonProps) {
  return (
    <Aria.ToggleButton
      {...props}
      className={Aria.composeRenderProps(className, (extra) => cx('zx-toggle-button', extra))}
    />
  )
}

export function ToggleButtonGroup({ className, ...props }: Aria.ToggleButtonGroupProps) {
  return (
    <Aria.ToggleButtonGroup
      {...props}
      className={Aria.composeRenderProps(className, (extra) => cx('zx-button-group', extra))}
    />
  )
}

export interface SurfaceProps extends ComponentProps<'div'> {
  variant?: 'flat' | 'tonal' | 'outline'
  effects?: SurfaceEffects
}

export function Surface({
  variant = 'flat',
  className,
  effects,
  children,
  ref,
  ...props
}: SurfaceProps) {
  const effectProps = useSurfaceEffects(effects, ref)
  return (
    <div {...props} {...effectProps} className={cx('zx-surface', className)} data-variant={variant}>
      <EffectLayers effects={effects} />
      {children}
    </div>
  )
}

export function Card({ variant = 'outline', className, ...props }: SurfaceProps) {
  return <Surface {...props} variant={variant} className={cx('zx-card', className)} />
}

export function Separator({ className, ...props }: Aria.SeparatorProps) {
  return <Aria.Separator {...props} className={cx('zx-separator', className)} />
}

export function Toolbar({ className, ...props }: Aria.ToolbarProps) {
  return (
    <Aria.Toolbar
      {...props}
      className={Aria.composeRenderProps(className, (extra) => cx('zx-toolbar', extra))}
    />
  )
}

export interface BadgeProps extends ComponentProps<'span'> {
  tone?: 'neutral' | 'accent' | 'error'
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return <span {...props} className={cx('zx-badge', className)} data-tone={tone} />
}

export interface ChipProps extends BadgeProps {
  onRemove?: () => void
  removeLabel?: string
}

export function Chip({ onRemove, removeLabel, children, className, ...props }: ChipProps) {
  return (
    <Badge {...props} className={cx('zx-chip', className)}>
      {children}
      {onRemove && (
        <button
          type="button"
          className="zx-chip-remove"
          onClick={onRemove}
          aria-label={removeLabel ?? `移除 ${typeof children === 'string' ? children : '标签'}`}
        >
          <Xmark aria-hidden="true" />
        </button>
      )}
    </Badge>
  )
}

export interface AvatarProps extends ComponentProps<'span'> {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
}

// An avatar may render text initials; a native img cannot hold the fallback.
/* oxlint-disable jsx-a11y/prefer-tag-over-role */
export function Avatar({ name, src, size = 'md', className, ...props }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>()
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => Array.from(part)[0])
    .slice(0, 2)
    .join('')
  return (
    <span
      {...props}
      className={cx('zx-avatar', className)}
      data-size={size}
      role="img"
      aria-label={name}
    >
      {src && failedSrc !== src ? (
        <img src={src} alt="" onError={() => setFailedSrc(src)} />
      ) : (
        <span aria-hidden="true">{initials || '?'}</span>
      )}
    </span>
  )
}
/* oxlint-enable jsx-a11y/prefer-tag-over-role */

export function AvatarGroup({ className, ...props }: ComponentProps<'div'>) {
  // This is a named collection of images, not a form fieldset.
  // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
  return <div role="group" {...props} className={cx('zx-avatar-group', className)} />
}

export function Alert({
  tone = 'neutral',
  title,
  children,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'title'> & { tone?: BadgeProps['tone']; title?: ReactNode }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      {...props}
      className={cx('zx-alert', className)}
      data-tone={tone}
    >
      {title && <strong>{title}</strong>}
      {children && <div>{children}</div>}
    </div>
  )
}

export interface ProgressProps extends Omit<Aria.ProgressBarProps, 'children'> {
  label?: string
}

export function ProgressBar({ label, className, ...props }: ProgressProps) {
  return (
    <Aria.ProgressBar
      {...props}
      className={Aria.composeRenderProps(className, (extra) => cx('zx-progress', extra))}
    >
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          <div className="zx-progress-heading">
            {label && <Aria.Label>{label}</Aria.Label>}
            {!isIndeterminate && <span>{valueText}</span>}
          </div>
          <div className="zx-progress-track" data-indeterminate={isIndeterminate || undefined}>
            <div
              className="zx-progress-fill"
              style={{ transform: `scaleX(${(percentage ?? 35) / 100})` }}
            />
          </div>
        </>
      )}
    </Aria.ProgressBar>
  )
}

export function ProgressCircle({ label, className, ...props }: ProgressProps) {
  return (
    <Aria.ProgressBar
      {...props}
      className={Aria.composeRenderProps(className, (extra) => cx('zx-progress-circle', extra))}
    >
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          <svg
            viewBox="0 0 48 48"
            aria-hidden="true"
            data-indeterminate={isIndeterminate || undefined}
          >
            <circle className="zx-circle-track" cx="24" cy="24" r="20" />
            <circle
              className="zx-circle-fill"
              cx="24"
              cy="24"
              r="20"
              pathLength="100"
              strokeDasharray={`${percentage ?? 25} 100`}
            />
          </svg>
          {label && <Aria.Label>{label}</Aria.Label>}
          {!isIndeterminate && <span>{valueText}</span>}
        </>
      )}
    </Aria.ProgressBar>
  )
}

export function Meter({
  label,
  className,
  ...props
}: Omit<Aria.MeterProps, 'children'> & { label?: string }) {
  return (
    <Aria.Meter
      {...props}
      className={Aria.composeRenderProps(className, (extra) => cx('zx-progress', extra))}
    >
      {({ percentage, valueText }) => (
        <>
          <div className="zx-progress-heading">
            {label && <Aria.Label>{label}</Aria.Label>}
            <span>{valueText}</span>
          </div>
          <div className="zx-progress-track">
            <div
              className="zx-progress-fill"
              style={{ transform: `scaleX(${percentage / 100})` }}
            />
          </div>
        </>
      )}
    </Aria.Meter>
  )
}

export function Spinner({
  label = '正在加载',
  className,
  ...props
}: ComponentProps<'output'> & { label?: string }) {
  return (
    <output {...props} className={cx('zx-spinner', className)}>
      <span className="zx-sr-only">{label}</span>
    </output>
  )
}

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return <div aria-hidden="true" {...props} className={cx('zx-skeleton', className)} />
}

export function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return <kbd {...props} className={cx('zx-kbd', className)} />
}

export function Typography({
  variant = 'body',
  className,
  ...props
}: ComponentProps<'p'> & { variant?: 'headline' | 'title' | 'body' | 'label' }) {
  return <p {...props} className={cx('zx-typography', className)} data-variant={variant} />
}

// Keyboard users must focus this scroll region to operate it with arrow keys.
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex */
export function ScrollShadow({ className, ...props }: ComponentProps<'section'>) {
  const id = useId()
  return (
    <section
      aria-label="可滚动内容"
      tabIndex={0}
      id={id}
      {...props}
      className={cx('zx-scroll-shadow', className)}
    />
  )
}
/* oxlint-enable jsx-a11y/no-noninteractive-tabindex */

export function Table({ className, ...props }: Aria.TableProps) {
  return (
    <Aria.Table
      {...props}
      className={Aria.composeRenderProps(className, (extra) => cx('zx-table', extra))}
    />
  )
}

export function TableHeader<T extends object>(props: Aria.TableHeaderProps<T>) {
  return <Aria.TableHeader {...props} />
}

export function TableBody<T extends object>(props: Aria.TableBodyProps<T>) {
  return <Aria.TableBody {...props} />
}

export function Column(props: Aria.ColumnProps) {
  return <Aria.Column {...props} />
}

export function Row<T extends object>(props: Aria.RowProps<T>) {
  return <Aria.Row {...props} />
}

export function Cell(props: Aria.CellProps) {
  return <Aria.Cell {...props} />
}

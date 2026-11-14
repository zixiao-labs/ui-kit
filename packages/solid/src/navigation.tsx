import { createContext, createSignal, For, Show, splitProps, useContext } from 'solid-js'
import type { ComponentProps, JSX } from 'solid-js'
import { Dialog as KDialog } from '@kobalte/core/dialog'
import { Popover as KPopover } from '@kobalte/core/popover'
import { Tooltip as KTooltip } from '@kobalte/core/tooltip'
import { Tabs as KTabs } from '@kobalte/core/tabs'
import { Accordion as KAccordion } from '@kobalte/core/accordion'
import { Collapsible as KCollapsible } from '@kobalte/core/collapsible'
import { DropdownMenu as KMenu } from '@kobalte/core/dropdown-menu'
import { Icon } from './icons'
import { FloatingPortalMount, portalTheme } from './portal-theme'
import { cx } from './utils'

export interface TabItem {
  id: string
  label: JSX.Element
  content: JSX.Element
  disabled?: boolean
}
export type TabsProps = Omit<ComponentProps<typeof KTabs<'div'>>, 'children'> & {
  items: TabItem[]
  label: string
  variant?: 'line' | 'tonal'
}
export function Tabs(props: TabsProps) {
  const [local, rest] = splitProps(props, ['items', 'label', 'variant', 'class'])
  return (
    <KTabs
      {...rest}
      class={cx('zx-tabs zx-solid', local.class)}
      data-variant={local.variant ?? 'line'}
    >
      <KTabs.List class="zx-tabs__list" aria-label={local.label}>
        <For each={local.items}>
          {(item) => (
            <KTabs.Trigger class="zx-tabs__tab" value={item.id} disabled={item.disabled}>
              {item.label}
            </KTabs.Trigger>
          )}
        </For>
      </KTabs.List>
      <For each={local.items}>
        {(item) => (
          <KTabs.Content class="zx-tabs__panel" value={item.id}>
            {item.content}
          </KTabs.Content>
        )}
      </For>
    </KTabs>
  )
}
export interface AccordionItem {
  id: string
  title: JSX.Element
  content: JSX.Element
  disabled?: boolean
}
export type AccordionProps = Omit<ComponentProps<typeof KAccordion<'div'>>, 'children'> & {
  items: AccordionItem[]
}
export function Accordion(props: AccordionProps) {
  const [local, rest] = splitProps(props, ['items', 'class'])
  return (
    <KAccordion collapsible {...rest} class={cx('zx-accordion zx-solid', local.class)}>
      <For each={local.items}>
        {(item) => (
          <KAccordion.Item class="zx-disclosure" value={item.id} disabled={item.disabled}>
            <KAccordion.Header class="zx-disclosure__heading">
              <KAccordion.Trigger class="zx-disclosure__trigger">
                {item.title}
                <Icon name="chevron" class="zx-disclosure__chevron" />
              </KAccordion.Trigger>
            </KAccordion.Header>
            <KAccordion.Content class="zx-disclosure__panel">
              <div class="zx-disclosure__body">{item.content}</div>
            </KAccordion.Content>
          </KAccordion.Item>
        )}
      </For>
    </KAccordion>
  )
}
export type DisclosureProps = Omit<ComponentProps<typeof KCollapsible<'div'>>, 'title'> & {
  title: JSX.Element
}
export function Disclosure(props: DisclosureProps) {
  const [local, rest] = splitProps(props, ['title', 'class', 'children'])
  return (
    <KCollapsible {...rest} class={cx('zx-disclosure zx-solid', local.class)}>
      <KCollapsible.Trigger as="button" class="zx-disclosure__trigger">
        {local.title}
        <Icon name="chevron" class="zx-disclosure__chevron" />
      </KCollapsible.Trigger>
      <KCollapsible.Content class="zx-disclosure__panel">
        <div class="zx-disclosure__body">{local.children}</div>
      </KCollapsible.Content>
    </KCollapsible>
  )
}
export function Link(props: JSX.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <a {...rest} class={cx('zx-link', local.class)}>
      {local.children}
    </a>
  )
}
export interface BreadcrumbItem {
  id: string
  label: string
  href?: string
}
export function Breadcrumbs(props: { items: BreadcrumbItem[]; label?: string }) {
  return (
    <nav aria-label={props.label ?? '面包屑'}>
      <ol class="zx-breadcrumbs">
        <For each={props.items}>
          {(item, index) => (
            <li class="zx-breadcrumbs__item">
              <Show when={index() > 0}>
                <span class="zx-breadcrumbs__separator" aria-hidden="true">
                  /
                </span>
              </Show>
              <Show
                when={item.href && index() < props.items.length - 1}
                fallback={
                  <span aria-current={index() === props.items.length - 1 ? 'page' : undefined}>
                    {item.label}
                  </span>
                }
              >
                <Link href={item.href}>{item.label}</Link>
              </Show>
            </li>
          )}
        </For>
      </ol>
    </nav>
  )
}
export interface PaginationProps {
  page: number
  total: number
  onChange: (page: number) => void
  label?: string
}
export function Pagination(props: PaginationProps) {
  const total = () => (Number.isFinite(props.total) ? Math.max(1, Math.floor(props.total)) : 1)
  const page = () =>
    Number.isFinite(props.page) ? Math.max(1, Math.min(total(), Math.floor(props.page))) : 1
  const pages = () =>
    [
      ...new Set(
        [1, page() - 1, page(), page() + 1, total()].filter((n) => n >= 1 && n <= total()),
      ),
    ].sort((a, b) => a - b)
  return (
    <nav class="zx-pagination zx-solid" aria-label={props.label ?? '分页'}>
      <button
        class="zx-pagination__button"
        type="button"
        aria-label="上一页"
        disabled={page() <= 1}
        onClick={() => props.onChange(page() - 1)}
      >
        ‹
      </button>
      <For each={pages()}>
        {(n, index) => (
          <>
            <Show when={index() > 0 && n - pages()[index() - 1] > 1}>
              <span class="zx-pagination__ellipsis" aria-hidden="true">
                …
              </span>
            </Show>
            <button
              class="zx-pagination__button"
              type="button"
              aria-label={`第 ${n} 页`}
              aria-current={page() === n ? 'page' : undefined}
              onClick={() => props.onChange(n)}
            >
              {n}
            </button>
          </>
        )}
      </For>
      <button
        class="zx-pagination__button"
        type="button"
        aria-label="下一页"
        disabled={page() >= total()}
        onClick={() => props.onChange(page() + 1)}
      >
        ›
      </button>
    </nav>
  )
}

export interface ModalProps extends ComponentProps<typeof KDialog> {
  trigger?: JSX.Element
  title: string
  description?: string
  class?: string
  surface?: 'modal' | 'drawer' | 'sheet'
}
export function Modal(props: ModalProps) {
  const [local, rest] = splitProps(props, [
    'trigger',
    'title',
    'description',
    'class',
    'surface',
    'children',
  ])
  const theme = portalTheme()
  const [content, setContent] = createSignal<HTMLElement>()
  return (
    <span ref={theme.ref} style={{ display: 'contents' }}>
      <KDialog {...rest}>
        <Show when={local.trigger}>
          <KDialog.Trigger class="zx-button" data-variant="outline" data-size="md">
            {local.trigger}
          </KDialog.Trigger>
        </Show>
        <KDialog.Portal>
          <KDialog.Overlay class="zx-solid-dialog-overlay" {...theme.attributes()} />
          <div class="zx-solid-dialog-positioner" data-surface={local.surface ?? 'modal'}>
            <KDialog.Content
              ref={setContent}
              class={cx('zx-modal zx-solid', local.class)}
              data-surface={local.surface ?? 'modal'}
              {...theme.attributes()}
            >
              <FloatingPortalMount.Provider value={content}>
                <div class="zx-dialog">
                  <div class="zx-dialog__header">
                    <KDialog.Title class="zx-dialog__title">{local.title}</KDialog.Title>
                    <KDialog.CloseButton class="zx-overlay-close" aria-label="关闭">
                      <Icon name="close" />
                    </KDialog.CloseButton>
                  </div>
                  <Show when={local.description}>
                    <KDialog.Description class="zx-dialog__description">
                      {local.description}
                    </KDialog.Description>
                  </Show>
                  <div class="zx-dialog__body">{local.children}</div>
                </div>
              </FloatingPortalMount.Provider>
            </KDialog.Content>
          </div>
        </KDialog.Portal>
      </KDialog>
    </span>
  )
}
export function Drawer(props: ModalProps) {
  return <Modal {...props} surface="drawer" />
}
export function Sheet(props: ModalProps) {
  return <Modal {...props} surface="sheet" />
}

export type PopoverProps = ComponentProps<typeof KPopover> & {
  trigger: JSX.Element
  title?: string
  description?: string
  class?: string
}
export function Popover(props: PopoverProps) {
  const [local, rest] = splitProps(props, ['trigger', 'title', 'description', 'class', 'children'])
  const theme = portalTheme()
  return (
    <span ref={theme.ref} style={{ display: 'contents' }}>
      <KPopover {...rest}>
        <KPopover.Trigger class="zx-button" data-variant="outline" data-size="md">
          {local.trigger}
        </KPopover.Trigger>
        <KPopover.Portal mount={theme.mount()}>
          <KPopover.Content
            class={cx('zx-popover zx-dialog zx-dialog--popover zx-solid', local.class)}
            {...theme.attributes()}
          >
            <Show when={local.title}>
              <KPopover.Title class="zx-dialog__title">{local.title}</KPopover.Title>
            </Show>
            <Show when={local.description}>
              <KPopover.Description class="zx-dialog__description">
                {local.description}
              </KPopover.Description>
            </Show>
            {local.children}
          </KPopover.Content>
        </KPopover.Portal>
      </KPopover>
    </span>
  )
}
export type TooltipProps = ComponentProps<typeof KTooltip> & {
  trigger: JSX.Element
  content: string
}
export function Tooltip(props: TooltipProps) {
  const [local, rest] = splitProps(props, ['trigger', 'content'])
  const theme = portalTheme()
  return (
    <span ref={theme.ref} style={{ display: 'contents' }}>
      <KTooltip {...rest}>
        <KTooltip.Trigger class="zx-button" data-variant="ghost" data-size="md">
          {local.trigger}
        </KTooltip.Trigger>
        <KTooltip.Portal mount={theme.mount()}>
          <KTooltip.Content class="zx-tooltip" {...theme.attributes()}>
            {local.content}
          </KTooltip.Content>
        </KTooltip.Portal>
      </KTooltip>
    </span>
  )
}
export interface DropdownItem {
  id: string
  label: string
  disabled?: boolean
  onSelect?: () => void
}
export type DropdownProps = ComponentProps<typeof KMenu> & {
  trigger: JSX.Element
  items: DropdownItem[]
  label?: string
}
export function Dropdown(props: DropdownProps) {
  const [local, rest] = splitProps(props, ['trigger', 'items', 'label'])
  const theme = portalTheme()
  return (
    <span ref={theme.ref} style={{ display: 'contents' }}>
      <KMenu {...rest}>
        <KMenu.Trigger class="zx-button" data-variant="outline" data-size="md">
          {local.trigger}
          <Icon name="chevron" />
        </KMenu.Trigger>
        <KMenu.Portal mount={theme.mount()}>
          <KMenu.Content
            class="zx-popover zx-menu zx-solid"
            aria-label={local.label ?? '操作'}
            {...theme.attributes()}
          >
            <For each={local.items}>
              {(item) => (
                <KMenu.Item class="zx-menu__item" disabled={item.disabled} onSelect={item.onSelect}>
                  {item.label}
                </KMenu.Item>
              )}
            </For>
          </KMenu.Content>
        </KMenu.Portal>
      </KMenu>
    </span>
  )
}

export interface ToastMessage {
  title: string
  description?: string
}
interface ToastEntry extends ToastMessage {
  id: number
}
const ToastContext = createContext<(message: ToastMessage) => void>()
export function ToastProvider(props: { children: JSX.Element; label?: string }) {
  const [messages, setMessages] = createSignal<ToastEntry[]>([])
  let sequence = 0
  const dismiss = (id: number) => {
    setMessages((current) => current.filter((item) => item.id !== id))
  }
  const publish = (message: ToastMessage) => {
    const id = ++sequence
    setMessages((current) => [...current, { ...message, id }])
    // Notifications remain available until dismissed: no reading-time assumptions.
  }
  return (
    <ToastContext.Provider value={publish}>
      {props.children}
      <section
        class="zx-toast-region zx-solid"
        aria-label={props.label ?? '通知'}
        aria-live="polite"
        aria-relevant="additions"
      >
        <For each={messages()}>
          {(message) => (
            <div class="zx-toast">
              <div class="zx-toast__content">
                <span class="zx-toast__title">{message.title}</span>
                <Show when={message.description}>
                  <span class="zx-toast__description">{message.description}</span>
                </Show>
              </div>
              <button
                class="zx-overlay-close"
                type="button"
                aria-label={`关闭 ${message.title}`}
                onClick={() => dismiss(message.id)}
              >
                <Icon name="close" />
              </button>
            </div>
          )}
        </For>
      </section>
    </ToastContext.Provider>
  )
}
export function useToast() {
  const publish = useContext(ToastContext)
  if (!publish) throw new Error('useToast must be used inside ToastProvider.')
  return publish
}

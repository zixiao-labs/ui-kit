import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import {
  Breadcrumb as AriaBreadcrumb,
  Breadcrumbs as AriaBreadcrumbs,
  Button as AriaButton,
  Dialog,
  DialogTrigger,
  Disclosure as AriaDisclosure,
  DisclosureGroup as AriaDisclosureGroup,
  DisclosurePanel,
  Heading,
  Label,
  Link as AriaLink,
  ListBox as AriaListBox,
  ListBoxItem,
  Menu,
  MenuItem,
  MenuTrigger,
  Modal as AriaModal,
  ModalOverlay,
  Popover as AriaPopover,
  Pressable,
  SelectionIndicator,
  Tab,
  TabList,
  TabPanel,
  Tabs as AriaTabs,
  Tag,
  TagGroup as AriaTagGroup,
  TagList,
  Text,
  Tooltip as AriaTooltip,
  TooltipTrigger,
  UNSTABLE_Toast as AriaToast,
  UNSTABLE_ToastContent as ToastContent,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastRegion as ToastRegion,
  type DisclosureGroupProps as AriaDisclosureGroupProps,
  type DisclosureProps as AriaDisclosureProps,
  type Key,
  type LinkProps as AriaLinkProps,
  type ListBoxProps as AriaListBoxProps,
  type Placement,
  type QueuedToast,
  type StyleOrFunction,
  type TabsProps as AriaTabsProps,
  type TagGroupProps as AriaTagGroupProps,
  type ToastOptions,
  type ToastRegionProps,
} from 'react-aria-components'
import { Check, ChevronDown, ChevronLeft, ChevronRight, Xmark } from '@gravity-ui/icons'

const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ')

interface ThemeSnapshot {
  attributes: {
    'data-zx-style'?: string
    'data-zx-color-mode'?: string
  }
  style: CSSProperties
}

const ThemeContext = createContext<ThemeSnapshot | null>(null)

/**
 * Capture the trigger's effective theme for real RAC portal surfaces. No portal
 * containers are created: RAC owns body insertion, removal, inertness and focus.
 * Wrap each high-level control so nested scopes retain their nearest attributes,
 * style resets and custom neutral tokens, including live ancestor updates.
 *
 * The legacy render callback receives undefined, leaving RAC's native body
 * target unchanged. Use ThemePopover rather than an unthemed RAC Popover.
 * Surfaces wait for the first measurement; triggers still render during SSR.
 */
export function ThemeScope({
  children,
}: {
  children: ReactNode | ((portalContainer: HTMLElement | undefined) => ReactNode)
}) {
  const scope = useRef<HTMLDivElement>(null)
  const [theme, setTheme] = useState<ThemeSnapshot | null>(null)
  useEffect(() => {
    const source = scope.current
    if (!source) return
    const window = source.ownerDocument.defaultView
    if (!window) return
    const sync = () => {
      const attributes: ThemeSnapshot['attributes'] = {}
      for (const attribute of ['data-zx-style'] as const) {
        const value = source.closest(`[${attribute}]`)?.getAttribute(attribute)
        if (value !== null && value !== undefined) attributes[attribute] = value
      }
      const computed = window.getComputedStyle(source)
      // A nested style resets to light even inside a dark parent. Copy the
      // effective scheme, not an unrelated ancestor's explicit mode attribute.
      if (computed.colorScheme === 'light' || computed.colorScheme === 'dark') {
        attributes['data-zx-color-mode'] = computed.colorScheme
      }
      const tokens: Record<string, string> = {}
      // Resolved neutral values preserve nested resets without depending on a
      // design language's private variables at the body-level portal destination.
      for (const property of Array.from(computed)) {
        if (property.startsWith('--zx-')) tokens[property] = computed.getPropertyValue(property)
      }
      setTheme({
        attributes,
        style: { ...tokens, colorScheme: computed.colorScheme } as CSSProperties,
      })
    }
    sync()
    const observer = new window.MutationObserver(sync)
    for (let ancestor: Element | null = source; ancestor; ancestor = ancestor.parentElement) {
      observer.observe(ancestor, { attributes: true })
    }
    return () => observer.disconnect()
  }, [])
  return (
    <div className="zx-theme-scope" style={{ display: 'contents' }} ref={scope}>
      <ThemeContext.Provider value={theme}>
        {typeof children === 'function' ? children(undefined) : children}
      </ThemeContext.Provider>
    </div>
  )
}

/** Compatibility shim: themed surfaces always use RAC's native body target. */
export function useThemePortalContainer() {
  return undefined
}

function themedStyle<T>(theme: ThemeSnapshot, style?: StyleOrFunction<T>): StyleOrFunction<T> {
  return (values) => ({
    ...theme.style,
    ...values.defaultStyle,
    ...(typeof style === 'function' ? style(values) : style),
  })
}

/** RAC Popover with the nearest ThemeScope applied directly to its portal root. */
export function ThemePopover(props: ComponentProps<typeof AriaPopover>) {
  const theme = useContext(ThemeContext)
  // Select/ComboBox discover items by walking this subtree during SSR too.
  // Keep that collection-only bootstrap separate from the live instance: reusing
  // it would switch isOpen from controlled false to the caller's uncontrolled state.
  if (!theme) return <AriaPopover key="awaiting-theme" {...props} isOpen={false} />
  return <AriaPopover {...props} {...theme.attributes} style={themedStyle(theme, props.style)} />
}

function ThemeModalOverlay(props: ComponentProps<typeof ModalOverlay>) {
  const theme = useContext(ThemeContext)
  if (!theme) return null
  return <ModalOverlay {...props} {...theme.attributes} style={themedStyle(theme, props.style)} />
}

function ThemeTooltip(props: ComponentProps<typeof AriaTooltip>) {
  const theme = useContext(ThemeContext)
  if (!theme) return null
  return <AriaTooltip {...props} {...theme.attributes} style={themedStyle(theme, props.style)} />
}

function ThemeToastRegion(props: ToastRegionProps<ToastMessage>) {
  const theme = useContext(ThemeContext)
  if (!theme) return null
  return <ToastRegion {...props} {...theme.attributes} style={themedStyle(theme, props.style)} />
}

export interface NavigationItem {
  id: Key
  label: string
  icon?: ReactNode
  disabled?: boolean
}

function ItemLabel({ icon, label }: Pick<NavigationItem, 'icon' | 'label'>) {
  return (
    <>
      {icon && (
        <span className="zx-navigation-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="zx-navigation-label">{label}</span>
    </>
  )
}

export interface DisclosureProps extends Omit<AriaDisclosureProps, 'children' | 'className'> {
  title: ReactNode
  children: ReactNode
  className?: string
}

function OverlayTrigger({ children }: { children: ReactElement }) {
  // Pressable adapts ref-forwarding native buttons without changing Button's API.
  return <Pressable>{children as ComponentProps<typeof Pressable>['children']}</Pressable>
}

export function Disclosure({ title, children, className, ...props }: DisclosureProps) {
  return (
    <AriaDisclosure {...props} className={classes('zx-disclosure', className)}>
      <Heading className="zx-disclosure__heading">
        <AriaButton slot="trigger" className="zx-disclosure__trigger">
          <span>{title}</span>
          <ChevronDown className="zx-disclosure__chevron" aria-hidden="true" />
        </AriaButton>
      </Heading>
      <DisclosurePanel className="zx-disclosure__panel">
        <div className="zx-disclosure__body">{children}</div>
      </DisclosurePanel>
    </AriaDisclosure>
  )
}

export interface AccordionItem {
  id: Key
  title: ReactNode
  content: ReactNode
  disabled?: boolean
}

export interface AccordionProps extends Omit<AriaDisclosureGroupProps, 'children' | 'className'> {
  items: readonly AccordionItem[]
  className?: string
}

export function Accordion({ items, className, ...props }: AccordionProps) {
  return (
    <AriaDisclosureGroup {...props} className={classes('zx-accordion', className)}>
      {items.map((item) => (
        <Disclosure key={item.id} id={item.id} title={item.title} isDisabled={item.disabled}>
          {item.content}
        </Disclosure>
      ))}
    </AriaDisclosureGroup>
  )
}

/** Item-based synonym for Accordion; accepts RAC's controlled expandedKeys API. */
export function DisclosureGroup(props: AccordionProps) {
  return <Accordion {...props} />
}

export interface TabItem extends NavigationItem {
  content: ReactNode
}

export interface TabsProps extends Omit<AriaTabsProps, 'children' | 'className'> {
  items: readonly TabItem[]
  label: string
  variant?: 'underline' | 'tonal'
  className?: string
}

export function Tabs({ items, label, variant = 'underline', className, ...props }: TabsProps) {
  return (
    <AriaTabs {...props} className={classes('zx-tabs', className)} data-variant={variant}>
      <TabList aria-label={label} className="zx-tabs__list" items={items}>
        {(item) => (
          <Tab id={item.id} isDisabled={item.disabled} className="zx-tabs__tab">
            <SelectionIndicator className="zx-tabs__indicator" />
            <ItemLabel {...item} />
          </Tab>
        )}
      </TabList>
      {items.map((item) => (
        <TabPanel key={item.id} id={item.id} className="zx-tabs__panel">
          {item.content}
        </TabPanel>
      ))}
    </AriaTabs>
  )
}

export interface LinkProps extends Omit<AriaLinkProps, 'className'> {
  className?: string
}

export function Link({ className, ...props }: LinkProps) {
  return <AriaLink {...props} className={classes('zx-link', className)} />
}

export interface BreadcrumbItem extends NavigationItem {
  href?: string
}

export interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[]
  label?: string
  onAction?: (key: Key) => void
  className?: string
}

export function Breadcrumbs({
  items,
  label = '面包屑导航',
  onAction,
  className,
}: BreadcrumbsProps) {
  return (
    <AriaBreadcrumbs
      aria-label={label}
      className={classes('zx-breadcrumbs', className)}
      onAction={onAction}
    >
      {items.map((item, index) => (
        <AriaBreadcrumb key={item.id} id={item.id} className="zx-breadcrumbs__item">
          <Link href={item.href} isDisabled={item.disabled}>
            <ItemLabel {...item} />
          </Link>
          {index < items.length - 1 && (
            <ChevronRight aria-hidden="true" className="zx-breadcrumbs__separator" />
          )}
        </AriaBreadcrumb>
      ))}
    </AriaBreadcrumbs>
  )
}

export interface PaginationProps {
  totalPages: number
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  disabled?: boolean
  label?: string
  className?: string
}

export function Pagination({
  totalPages,
  page,
  defaultPage = 1,
  onPageChange,
  disabled,
  label = '分页导航',
  className,
}: PaginationProps) {
  const [localPage, setLocalPage] = useState(defaultPage)
  const count = Number.isFinite(totalPages) ? Math.max(1, Math.floor(totalPages)) : 1
  const requested = page ?? localPage
  const current = Number.isFinite(requested)
    ? Math.max(1, Math.min(count, Math.floor(requested)))
    : 1
  const start = Math.max(2, Math.min(current - 1, count - 3))
  const pages = [
    ...new Set([
      1,
      ...Array.from({ length: Math.min(3, Math.max(0, count - 2)) }, (_, i) => start + i),
      count,
    ]),
  ]
  const change = (next: number) => {
    if (next === current || disabled) return
    if (page === undefined) setLocalPage(next)
    onPageChange?.(next)
  }
  return (
    <nav aria-label={label} className={classes('zx-pagination', className)}>
      <AriaButton
        className="zx-pagination__button"
        aria-label="上一页"
        isDisabled={disabled || current === 1}
        onPress={() => change(current - 1)}
      >
        <ChevronLeft aria-hidden="true" />
      </AriaButton>
      {pages.map((number, index) => (
        <span key={number} className="zx-pagination__part">
          {index > 0 && number - pages[index - 1] > 1 && (
            <span className="zx-pagination__ellipsis" aria-hidden="true">
              …
            </span>
          )}
          <AriaButton
            className="zx-pagination__button"
            aria-label={`第 ${number} 页`}
            aria-current={number === current ? 'page' : undefined}
            isDisabled={disabled}
            onPress={() => change(number)}
          >
            {number}
          </AriaButton>
        </span>
      ))}
      <AriaButton
        className="zx-pagination__button"
        aria-label="下一页"
        isDisabled={disabled || current === count}
        onPress={() => change(current + 1)}
      >
        <ChevronRight aria-hidden="true" />
      </AriaButton>
    </nav>
  )
}

interface OpenStateProps {
  isOpen?: boolean
  defaultOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export interface DropdownProps extends OpenStateProps {
  trigger: ReactElement
  items: readonly NavigationItem[]
  label: string
  onAction?: (key: Key) => void
  placement?: Placement
}

export function Dropdown({
  trigger,
  items,
  label,
  onAction,
  placement = 'bottom start',
  ...state
}: DropdownProps) {
  return (
    <ThemeScope>
      <MenuTrigger {...state}>
        <OverlayTrigger>{trigger}</OverlayTrigger>
        <ThemePopover className="zx-popover zx-dropdown" placement={placement}>
          <Menu aria-label={label} className="zx-menu" items={items} onAction={onAction}>
            {(item) => (
              <MenuItem
                id={item.id}
                textValue={item.label}
                isDisabled={item.disabled}
                className="zx-menu__item"
              >
                <ItemLabel {...item} />
              </MenuItem>
            )}
          </Menu>
        </ThemePopover>
      </MenuTrigger>
    </ThemeScope>
  )
}

export interface ListBoxProps extends Omit<
  AriaListBoxProps<NavigationItem>,
  'items' | 'children' | 'className' | 'aria-label'
> {
  items: readonly NavigationItem[]
  label: string
  className?: string
}

export function ListBox({
  items,
  label,
  className,
  selectionMode = 'single',
  ...props
}: ListBoxProps) {
  return (
    <AriaListBox
      {...props}
      aria-label={label}
      selectionMode={selectionMode}
      className={classes('zx-listbox', className)}
      items={items}
      renderEmptyState={props.renderEmptyState ?? (() => '暂无选项')}
    >
      {(item) => (
        <ListBoxItem
          id={item.id}
          textValue={item.label}
          isDisabled={item.disabled}
          className="zx-listbox__item"
        >
          {({ isSelected }) => (
            <>
              <ItemLabel {...item} />
              <span className="zx-listbox__check" aria-hidden="true">
                {isSelected && <Check />}
              </span>
            </>
          )}
        </ListBoxItem>
      )}
    </AriaListBox>
  )
}

export interface TagGroupProps extends Omit<
  AriaTagGroupProps,
  'children' | 'className' | 'aria-label'
> {
  items: readonly NavigationItem[]
  label: string
  emptyMessage?: string
  className?: string
}

export function TagGroup({
  items,
  label,
  emptyMessage = '暂无标签',
  className,
  onRemove,
  ...props
}: TagGroupProps) {
  return (
    <AriaTagGroup {...props} onRemove={onRemove} className={classes('zx-tag-group', className)}>
      <Label className="zx-tag-group__label">{label}</Label>
      <TagList
        className="zx-tag-group__list"
        items={items}
        renderEmptyState={() => <span className="zx-tag-group__empty">{emptyMessage}</span>}
      >
        {(item) => (
          <Tag id={item.id} textValue={item.label} isDisabled={item.disabled} className="zx-tag">
            <ItemLabel {...item} />
            {onRemove && (
              <AriaButton slot="remove" className="zx-tag__remove" aria-label={`移除${item.label}`}>
                <Xmark aria-hidden="true" />
              </AriaButton>
            )}
          </Tag>
        )}
      </TagList>
    </AriaTagGroup>
  )
}

export interface OverlayControls {
  close: () => void
}

export interface ModalProps extends OpenStateProps {
  /** A native Button, RAC Button, or other ref-forwarding pressable element. */
  trigger: ReactElement
  title: ReactNode
  children: ReactNode | ((controls: OverlayControls) => ReactNode)
  description?: string
  closeLabel?: string
  isDismissable?: boolean
  className?: string
}

interface DialogSurfaceProps extends ModalProps {
  surface?: 'modal' | 'drawer' | 'sheet'
  role?: 'dialog' | 'alertdialog'
  hideClose?: boolean
  isKeyboardDismissDisabled?: boolean
}

function DialogSurface({
  trigger,
  title,
  children,
  description,
  closeLabel = '关闭',
  isDismissable = true,
  className,
  surface = 'modal',
  role = 'dialog',
  hideClose = false,
  isKeyboardDismissDisabled,
  ...state
}: DialogSurfaceProps) {
  return (
    <ThemeScope>
      <DialogTrigger {...state}>
        <OverlayTrigger>{trigger}</OverlayTrigger>
        <ThemeModalOverlay
          className="zx-modal-overlay"
          data-surface={surface}
          isDismissable={isDismissable}
          isKeyboardDismissDisabled={isKeyboardDismissDisabled}
        >
          <AriaModal className={classes('zx-modal', className)} data-surface={surface}>
            <Dialog role={role} className="zx-dialog">
              {({ close }) => (
                <>
                  <header className="zx-dialog__header">
                    <Heading slot="title" className="zx-dialog__title">
                      {title}
                    </Heading>
                    {!hideClose && (
                      <AriaButton
                        className="zx-overlay-close"
                        aria-label={closeLabel}
                        onPress={close}
                      >
                        <Xmark aria-hidden="true" />
                      </AriaButton>
                    )}
                  </header>
                  {description && (
                    <Text slot="description" className="zx-dialog__description">
                      {description}
                    </Text>
                  )}
                  <div className="zx-dialog__body">
                    {typeof children === 'function' ? children({ close }) : children}
                  </div>
                </>
              )}
            </Dialog>
          </AriaModal>
        </ThemeModalOverlay>
      </DialogTrigger>
    </ThemeScope>
  )
}

export function Modal(props: ModalProps) {
  return <DialogSurface {...props} />
}

/** A modal side panel; focus containment, Escape and restoration are RAC-owned. */
export function Drawer(props: ModalProps) {
  return <DialogSurface {...props} surface="drawer" />
}

/** A modal bottom sheet; not a non-modal or drag-to-dismiss surface. */
export function Sheet(props: ModalProps) {
  return <DialogSurface {...props} surface="sheet" />
}

export interface AlertDialogProps extends Omit<
  ModalProps,
  'children' | 'isDismissable' | 'closeLabel'
> {
  children: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  /**
   * Called only by the confirm action, never Escape/cancel/outside press.
   * The dialog closes after fulfillment. Rejections leave it open and announce
   * an error; pending confirmation prevents cancellation and duplicate submits.
   */
  onConfirm: () => void | Promise<void>
}

export function AlertDialog({
  children,
  confirmLabel = '确认',
  cancelLabel = '取消',
  destructive = false,
  onConfirm,
  ...props
}: AlertDialogProps) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <DialogSurface
      {...props}
      role="alertdialog"
      isDismissable={false}
      hideClose
      isKeyboardDismissDisabled={pending}
    >
      {({ close }) => (
        <>
          {children}
          {error && (
            <p className="zx-dialog__error" role="alert">
              {error}
            </p>
          )}
          <footer className="zx-dialog__actions">
            {/* Initial focus belongs on the least destructive alertdialog action. */}
            {/* oxlint-disable jsx-a11y/no-autofocus */}
            <AriaButton
              autoFocus
              className="zx-overlay-action"
              isDisabled={pending}
              onPress={() => {
                setError(null)
                close()
              }}
            >
              {cancelLabel}
            </AriaButton>
            {/* oxlint-enable jsx-a11y/no-autofocus */}
            <AriaButton
              className="zx-overlay-action"
              data-variant={destructive ? 'danger' : 'solid'}
              isDisabled={pending}
              aria-busy={pending || undefined}
              onPress={async () => {
                setPending(true)
                setError(null)
                try {
                  await onConfirm()
                  close()
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : '操作未完成，请重试。')
                } finally {
                  setPending(false)
                }
              }}
            >
              {pending ? '处理中…' : confirmLabel}
            </AriaButton>
          </footer>
        </>
      )}
    </DialogSurface>
  )
}

export interface PopoverProps extends Omit<ModalProps, 'isDismissable'> {
  placement?: Placement
}

export function Popover({
  trigger,
  title,
  children,
  description,
  closeLabel = '关闭',
  className,
  placement = 'bottom start',
  ...state
}: PopoverProps) {
  return (
    <ThemeScope>
      <DialogTrigger {...state}>
        <OverlayTrigger>{trigger}</OverlayTrigger>
        <ThemePopover placement={placement} className={classes('zx-popover', className)}>
          <Dialog className="zx-dialog zx-dialog--popover">
            {({ close }) => (
              <>
                <header className="zx-dialog__header">
                  <Heading slot="title" className="zx-dialog__title">
                    {title}
                  </Heading>
                  <AriaButton className="zx-overlay-close" aria-label={closeLabel} onPress={close}>
                    <Xmark aria-hidden="true" />
                  </AriaButton>
                </header>
                {description && (
                  <Text slot="description" className="zx-dialog__description">
                    {description}
                  </Text>
                )}
                <div className="zx-dialog__body">
                  {typeof children === 'function' ? children({ close }) : children}
                </div>
              </>
            )}
          </Dialog>
        </ThemePopover>
      </DialogTrigger>
    </ThemeScope>
  )
}

export interface TooltipProps extends OpenStateProps {
  trigger: ReactElement
  children: ReactNode
  placement?: Placement
  delay?: number
  isDisabled?: boolean
}

/** Supplementary, non-interactive text only; use Popover for interactive content. */
export function Tooltip({
  trigger,
  children,
  placement = 'top',
  delay = 400,
  ...state
}: TooltipProps) {
  return (
    <ThemeScope>
      <TooltipTrigger {...state} delay={delay}>
        <OverlayTrigger>{trigger}</OverlayTrigger>
        <ThemeTooltip className="zx-tooltip" placement={placement}>
          {children}
        </ThemeTooltip>
      </TooltipTrigger>
    </ThemeScope>
  )
}

export interface ToastMessage {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

const ToastContext = createContext<ToastQueue<ToastMessage> | null>(null)

/** RAC toast renderer. Usually mounted by ToastProvider, not directly. */
export function Toast({ toast }: { toast: QueuedToast<ToastMessage> }) {
  return (
    <AriaToast
      toast={toast}
      className="zx-toast"
      style={{ viewTransitionName: `zx-toast-${toast.key}`, viewTransitionClass: 'zx-toast' }}
    >
      <ToastContent className="zx-toast__content">
        <Text slot="title" className="zx-toast__title">
          {toast.content.title}
        </Text>
        {toast.content.description && (
          <Text slot="description" className="zx-toast__description">
            {toast.content.description}
          </Text>
        )}
      </ToastContent>
      {toast.content.actionLabel && (
        <AriaButton className="zx-toast__action" onPress={toast.content.onAction}>
          {toast.content.actionLabel}
        </AriaButton>
      )}
      <AriaButton slot="close" className="zx-overlay-close" aria-label="关闭通知">
        <Xmark aria-hidden="true" />
      </AriaButton>
    </AriaToast>
  )
}

/** Put a provider inside each independent theme scope that can publish toasts. */
export function ToastProvider({
  children,
  label = '通知',
}: {
  children: ReactNode
  label?: string
}) {
  // Never share a global queue across SSR requests or independent theme scopes.
  const [queue] = useState(
    () =>
      new ToastQueue<ToastMessage>({
        maxVisibleToasts: 3,
        wrapUpdate: (update, action) => {
          // RAC's installed toast API does not expose exit states. Its queue supports
          // native view transitions instead: no delayed removal or extra focus tree.
          // Clear also runs during React teardown; keep it synchronous.
          if (
            action !== 'clear' &&
            typeof document !== 'undefined' &&
            document.startViewTransition &&
            CSS.supports('view-transition-class', 'zx-toast') &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ) {
            document.startViewTransition({ update: () => flushSync(update), types: ['zx-toast'] })
          } else {
            update()
          }
        },
      }),
  )
  useEffect(() => () => queue.clear(), [queue])
  return (
    <ThemeScope>
      <ToastContext.Provider value={queue}>
        {children}
        <ThemeToastRegion queue={queue} aria-label={label} className="zx-toast-region">
          {({ toast }) => <Toast toast={toast} />}
        </ThemeToastRegion>
      </ToastContext.Provider>
    </ThemeScope>
  )
}

export function useToast() {
  const queue = useContext(ToastContext)
  if (!queue) throw new Error('useToast must be used inside ToastProvider.')
  return {
    /** Persistent by default. Timed informational messages should allow >= 5000ms. */
    add: (message: ToastMessage, options?: ToastOptions) => queue.add(message, options),
    close: (key: string) => queue.close(key),
    clear: () => queue.clear(),
  }
}

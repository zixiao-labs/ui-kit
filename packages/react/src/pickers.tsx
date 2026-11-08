import { useContext, useId, type ReactNode } from 'react'
import {
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Magnifier,
  Xmark,
} from '@gravity-ui/icons'
import * as Aria from 'react-aria-components'
import { ThemePopover, ThemeScope } from './navigation'
import { useFieldsetDisabled } from './fieldset-context'

export {
  CalendarDate,
  CalendarDateTime,
  Time,
  ZonedDateTime,
  getLocalTimeZone,
  parseDate,
  parseDateTime,
  parseTime,
  parseZonedDateTime,
  today,
} from '@internationalized/date'
export { parseColor } from 'react-aria-components'
export type { DateValue, TimeValue, Color, ColorChannel, ColorSpace } from 'react-aria-components'

type FieldChrome = {
  label?: ReactNode
  description?: ReactNode
  errorMessage?: ReactNode
  disabled?: boolean
  className?: string
}

type Localized = { locale?: string }
const cx = (...names: (string | undefined)[]) => names.filter(Boolean).join(' ')

function FieldLabel({ children }: { children?: ReactNode }) {
  return children ? <Aria.Label className="zx-picker-label">{children}</Aria.Label> : null
}

function FieldHelp({
  description,
  errorMessage,
}: Pick<FieldChrome, 'description' | 'errorMessage'>) {
  return (
    <>
      {description && (
        <Aria.Text slot="description" className="zx-picker-help">
          {description}
        </Aria.Text>
      )}
      <Aria.FieldError className="zx-picker-error">{errorMessage}</Aria.FieldError>
    </>
  )
}

function CalendarContent() {
  return (
    <>
      <header className="zx-calendar-header">
        <Aria.Button slot="previous" className="zx-picker-icon-button" aria-label="上个月">
          <ChevronLeft aria-hidden="true" />
        </Aria.Button>
        <Aria.Heading className="zx-calendar-heading" />
        <Aria.Button slot="next" className="zx-picker-icon-button" aria-label="下个月">
          <ChevronRight aria-hidden="true" />
        </Aria.Button>
      </header>
      <Aria.CalendarGrid className="zx-calendar-grid" weekdayStyle="short">
        <Aria.CalendarGridHeader>
          {(day) => (
            <Aria.CalendarHeaderCell className="zx-calendar-weekday">{day}</Aria.CalendarHeaderCell>
          )}
        </Aria.CalendarGridHeader>
        <Aria.CalendarGridBody>
          {(date) => <Aria.CalendarCell className="zx-calendar-cell" date={date} />}
        </Aria.CalendarGridBody>
      </Aria.CalendarGrid>
      <Aria.Text slot="errorMessage" className="zx-picker-error" />
    </>
  )
}

export interface CalendarProps<T extends Aria.DateValue = Aria.DateValue>
  extends Omit<Aria.CalendarProps<T>, 'children' | 'className' | 'visibleDuration'>, Localized {
  label?: string
  disabled?: boolean
  className?: string
}

export function Calendar<T extends Aria.DateValue>({
  label,
  disabled,
  isDisabled,
  locale = 'zh-CN',
  className,
  ...props
}: CalendarProps<T>) {
  const fieldsetDisabled = useFieldsetDisabled(isDisabled ?? disabled)
  return (
    <Aria.I18nProvider locale={locale}>
      <Aria.Calendar
        {...props}
        aria-label={props['aria-label'] ?? label ?? '日历'}
        isDisabled={fieldsetDisabled}
        className={cx('zx-calendar', className)}
      >
        <CalendarContent />
      </Aria.Calendar>
    </Aria.I18nProvider>
  )
}

export interface RangeCalendarProps<T extends Aria.DateValue = Aria.DateValue>
  extends
    Omit<Aria.RangeCalendarProps<T>, 'children' | 'className' | 'visibleDuration'>,
    Localized {
  label?: string
  disabled?: boolean
  className?: string
}

export function RangeCalendar<T extends Aria.DateValue>({
  label,
  disabled,
  isDisabled,
  locale = 'zh-CN',
  className,
  ...props
}: RangeCalendarProps<T>) {
  const fieldsetDisabled = useFieldsetDisabled(isDisabled ?? disabled)
  return (
    <Aria.I18nProvider locale={locale}>
      <Aria.RangeCalendar
        {...props}
        aria-label={props['aria-label'] ?? label ?? '日期范围'}
        isDisabled={fieldsetDisabled}
        className={cx('zx-calendar zx-range-calendar', className)}
      >
        <CalendarContent />
      </Aria.RangeCalendar>
    </Aria.I18nProvider>
  )
}

function SegmentedInput({ slot }: { slot?: string }) {
  return (
    <Aria.DateInput slot={slot} className="zx-date-input">
      {(segment) => <Aria.DateSegment segment={segment} className="zx-date-segment" />}
    </Aria.DateInput>
  )
}

export interface DateFieldProps<T extends Aria.DateValue = Aria.DateValue>
  extends Omit<Aria.DateFieldProps<T>, 'children' | 'className'>, FieldChrome, Localized {}

export function DateField<T extends Aria.DateValue>({
  label,
  description,
  errorMessage,
  disabled,
  isDisabled,
  locale = 'zh-CN',
  className,
  ...props
}: DateFieldProps<T>) {
  const fieldsetDisabled = useFieldsetDisabled(isDisabled ?? disabled)
  return (
    <Aria.I18nProvider locale={locale}>
      <Aria.DateField
        {...props}
        isDisabled={fieldsetDisabled}
        className={cx('zx-picker-field', className)}
      >
        <FieldLabel>{label}</FieldLabel>
        <SegmentedInput />
        <FieldHelp description={description} errorMessage={errorMessage} />
      </Aria.DateField>
    </Aria.I18nProvider>
  )
}

export interface TimeFieldProps<T extends Aria.TimeValue = Aria.TimeValue>
  extends Omit<Aria.TimeFieldProps<T>, 'children' | 'className'>, FieldChrome, Localized {}

export function TimeField<T extends Aria.TimeValue>({
  label,
  description,
  errorMessage,
  disabled,
  isDisabled,
  locale = 'zh-CN',
  className,
  ...props
}: TimeFieldProps<T>) {
  const fieldsetDisabled = useFieldsetDisabled(isDisabled ?? disabled)
  return (
    <Aria.I18nProvider locale={locale}>
      <Aria.TimeField
        {...props}
        isDisabled={fieldsetDisabled}
        className={cx('zx-picker-field', className)}
      >
        <FieldLabel>{label}</FieldLabel>
        <SegmentedInput />
        <FieldHelp description={description} errorMessage={errorMessage} />
      </Aria.TimeField>
    </Aria.I18nProvider>
  )
}

export interface DatePickerProps<T extends Aria.DateValue = Aria.DateValue>
  extends Omit<Aria.DatePickerProps<T>, 'children' | 'className'>, FieldChrome, Localized {}

export function DatePicker<T extends Aria.DateValue>({
  label,
  description,
  errorMessage,
  disabled,
  isDisabled,
  locale = 'zh-CN',
  className,
  ...props
}: DatePickerProps<T>) {
  const fieldsetDisabled = useFieldsetDisabled(isDisabled ?? disabled)
  return (
    <Aria.I18nProvider locale={locale}>
      <ThemeScope>
        {(portalContainer) => (
          <Aria.DatePicker
            {...props}
            isDisabled={fieldsetDisabled}
            className={cx('zx-picker-field', className)}
          >
            <FieldLabel>{label}</FieldLabel>
            <Aria.Group className="zx-picker-control">
              <SegmentedInput />
              <Aria.Button className="zx-picker-icon-button" aria-label="打开日历">
                <CalendarIcon aria-hidden="true" />
              </Aria.Button>
            </Aria.Group>
            <FieldHelp description={description} errorMessage={errorMessage} />
            <ThemePopover UNSTABLE_portalContainer={portalContainer} className="zx-picker-popover">
              <Aria.Dialog className="zx-picker-dialog" aria-label="选择日期">
                <Calendar locale={locale} />
              </Aria.Dialog>
            </ThemePopover>
          </Aria.DatePicker>
        )}
      </ThemeScope>
    </Aria.I18nProvider>
  )
}

export interface DateRangePickerProps<T extends Aria.DateValue = Aria.DateValue>
  extends Omit<Aria.DateRangePickerProps<T>, 'children' | 'className'>, FieldChrome, Localized {}

export function DateRangePicker<T extends Aria.DateValue>({
  label,
  description,
  errorMessage,
  disabled,
  isDisabled,
  locale = 'zh-CN',
  className,
  ...props
}: DateRangePickerProps<T>) {
  const fieldsetDisabled = useFieldsetDisabled(isDisabled ?? disabled)
  return (
    <Aria.I18nProvider locale={locale}>
      <ThemeScope>
        {(portalContainer) => (
          <Aria.DateRangePicker
            {...props}
            isDisabled={fieldsetDisabled}
            className={cx('zx-picker-field', className)}
          >
            <FieldLabel>{label}</FieldLabel>
            <Aria.Group className="zx-picker-control zx-date-range-control">
              <SegmentedInput slot="start" />
              <span className="zx-picker-range-separator" aria-hidden="true">
                至
              </span>
              <SegmentedInput slot="end" />
              <Aria.Button className="zx-picker-icon-button" aria-label="打开日期范围日历">
                <CalendarIcon aria-hidden="true" />
              </Aria.Button>
            </Aria.Group>
            <FieldHelp description={description} errorMessage={errorMessage} />
            <ThemePopover UNSTABLE_portalContainer={portalContainer} className="zx-picker-popover">
              <Aria.Dialog className="zx-picker-dialog" aria-label="选择日期范围">
                <RangeCalendar locale={locale} />
              </Aria.Dialog>
            </ThemePopover>
          </Aria.DateRangePicker>
        )}
      </ThemeScope>
    </Aria.I18nProvider>
  )
}

export interface PickerItem {
  id: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

type ItemValue = {
  items: readonly PickerItem[]
  value?: string | null
  defaultValue?: string | null
  onChange?: (value: string | null) => void
}

function OptionContent({ item, isSelected }: { item: PickerItem; isSelected: boolean }) {
  return (
    <>
      {item.icon && (
        <span className="zx-picker-option-icon" aria-hidden="true">
          {item.icon}
        </span>
      )}
      <Aria.Text slot="label" className="zx-picker-option-label">
        {item.label}
      </Aria.Text>
      {isSelected && <Check className="zx-picker-option-check" aria-hidden="true" />}
    </>
  )
}

export interface SelectProps
  extends
    Omit<
      Aria.SelectProps<PickerItem>,
      'children' | 'className' | 'value' | 'defaultValue' | 'onChange'
    >,
    FieldChrome,
    ItemValue {}

export function Select({
  label,
  description,
  errorMessage,
  items,
  value,
  defaultValue,
  onChange,
  disabled,
  isDisabled,
  className,
  placeholder = '请选择',
  ...props
}: SelectProps) {
  const fieldsetDisabled = useFieldsetDisabled(isDisabled ?? disabled)
  return (
    <ThemeScope>
      {(portalContainer) => (
        <Aria.Select
          {...props}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange ? (key) => onChange(key == null ? null : String(key)) : undefined}
          isDisabled={fieldsetDisabled}
          placeholder={placeholder}
          className={cx('zx-picker-field', className)}
        >
          <FieldLabel>{label}</FieldLabel>
          <Aria.Button className="zx-picker-control zx-select-trigger">
            <Aria.SelectValue className="zx-select-value">
              {({ selectedText, isPlaceholder }) => (isPlaceholder ? placeholder : selectedText)}
            </Aria.SelectValue>
            <ChevronDown aria-hidden="true" />
          </Aria.Button>
          <FieldHelp description={description} errorMessage={errorMessage} />
          <ThemePopover
            UNSTABLE_portalContainer={portalContainer}
            className="zx-picker-popover zx-options-popover"
          >
            <Aria.ListBox items={items} className="zx-picker-options">
              {(item) => (
                <Aria.ListBoxItem
                  id={item.id}
                  textValue={item.label}
                  isDisabled={item.disabled}
                  className="zx-picker-option"
                >
                  {({ isSelected }) => <OptionContent item={item} isSelected={isSelected} />}
                </Aria.ListBoxItem>
              )}
            </Aria.ListBox>
          </ThemePopover>
        </Aria.Select>
      )}
    </ThemeScope>
  )
}

export interface ComboBoxProps
  extends
    Omit<
      Aria.ComboBoxProps<PickerItem>,
      'children' | 'className' | 'items' | 'defaultItems' | 'value' | 'defaultValue' | 'onChange'
    >,
    FieldChrome,
    ItemValue {
  placeholder?: string
  emptyMessage?: string
}

export function ComboBox({
  label,
  description,
  errorMessage,
  items,
  value,
  defaultValue,
  onChange,
  disabled,
  isDisabled,
  className,
  placeholder = '搜索并选择',
  emptyMessage = '没有匹配的结果',
  ...props
}: ComboBoxProps) {
  const fieldsetDisabled = useFieldsetDisabled(isDisabled ?? disabled)
  return (
    <ThemeScope>
      {(portalContainer) => (
        <Aria.ComboBox
          {...props}
          defaultItems={items}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange ? (key) => onChange(key == null ? null : String(key)) : undefined}
          isDisabled={fieldsetDisabled}
          allowsEmptyCollection
          className={cx('zx-picker-field', className)}
        >
          <FieldLabel>{label}</FieldLabel>
          <Aria.Group className="zx-picker-control">
            <Aria.Input className="zx-picker-input" placeholder={placeholder} />
            <Aria.Button className="zx-picker-icon-button" aria-label="显示选项">
              <ChevronDown aria-hidden="true" />
            </Aria.Button>
          </Aria.Group>
          <FieldHelp description={description} errorMessage={errorMessage} />
          <ThemePopover
            UNSTABLE_portalContainer={portalContainer}
            className="zx-picker-popover zx-options-popover"
          >
            <Aria.ListBox
              className="zx-picker-options"
              renderEmptyState={() => <span className="zx-picker-empty">{emptyMessage}</span>}
            >
              {(item: PickerItem) => (
                <Aria.ListBoxItem
                  id={item.id}
                  textValue={item.label}
                  isDisabled={item.disabled}
                  className="zx-picker-option"
                >
                  {({ isSelected }) => <OptionContent item={item} isSelected={isSelected} />}
                </Aria.ListBoxItem>
              )}
            </Aria.ListBox>
          </ThemePopover>
        </Aria.ComboBox>
      )}
    </ThemeScope>
  )
}

export interface AutocompleteProps
  extends Omit<Aria.AutocompleteProps<PickerItem>, 'children'>, ItemValue {
  label: string
  description?: ReactNode
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

/** Inline searchable suggestions. For a collapsible input, use ComboBox. */
export function Autocomplete({
  label,
  description,
  items,
  value,
  defaultValue,
  onChange,
  disabled,
  className,
  placeholder = '搜索',
  emptyMessage = '没有匹配的结果',
  filter,
  ...props
}: AutocompleteProps) {
  const fieldsetDisabled = useFieldsetDisabled(disabled)
  const { contains } = Aria.useFilter({ sensitivity: 'base' })
  return (
    <div className={cx('zx-autocomplete', className)} data-disabled={fieldsetDisabled || undefined}>
      <Aria.Autocomplete {...props} filter={filter ?? contains}>
        <Aria.SearchField isDisabled={fieldsetDisabled} className="zx-picker-field">
          <FieldLabel>{label}</FieldLabel>
          <Aria.Group className="zx-picker-control">
            <Magnifier className="zx-picker-search-icon" aria-hidden="true" />
            <Aria.Input placeholder={placeholder} className="zx-picker-input" />
            <Aria.Button className="zx-picker-icon-button" aria-label="清空搜索">
              <Xmark aria-hidden="true" />
            </Aria.Button>
          </Aria.Group>
          {description && (
            <Aria.Text slot="description" className="zx-picker-help">
              {description}
            </Aria.Text>
          )}
        </Aria.SearchField>
        <Aria.ListBox
          aria-label={`${label}结果`}
          items={items}
          selectionMode="single"
          selectedKeys={value === undefined ? undefined : value === null ? [] : [value]}
          defaultSelectedKeys={defaultValue == null ? undefined : [defaultValue]}
          onSelectionChange={
            onChange
              ? (keys) => {
                  if (keys !== 'all') onChange(keys.size ? String([...keys][0]) : null)
                }
              : undefined
          }
          disabledKeys={fieldsetDisabled ? items.map((item) => item.id) : undefined}
          className="zx-picker-options zx-autocomplete-options"
          renderEmptyState={() => <span className="zx-picker-empty">{emptyMessage}</span>}
        >
          {(item) => (
            <Aria.ListBoxItem
              id={item.id}
              textValue={item.label}
              isDisabled={item.disabled}
              className="zx-picker-option"
            >
              {({ isSelected }) => <OptionContent item={item} isSelected={isSelected} />}
            </Aria.ListBoxItem>
          )}
        </Aria.ListBox>
      </Aria.Autocomplete>
    </div>
  )
}

export interface ColorAreaProps
  extends Omit<Aria.ColorAreaProps, 'children' | 'className'>, Localized {
  label?: string
  disabled?: boolean
  className?: string
}

export function ColorArea({
  label = '颜色区域',
  disabled,
  isDisabled,
  className,
  locale = 'zh-CN',
  colorSpace = 'hsb',
  xChannel,
  yChannel,
  ...props
}: ColorAreaProps) {
  const fieldsetDisabled = useFieldsetDisabled(isDisabled ?? disabled)
  return (
    <Aria.I18nProvider locale={locale}>
      <Aria.ColorArea
        {...props}
        aria-label={props['aria-label'] ?? label}
        colorSpace={colorSpace}
        xChannel={xChannel ?? (colorSpace === 'rgb' ? 'red' : 'saturation')}
        yChannel={
          yChannel ??
          (colorSpace === 'rgb' ? 'green' : colorSpace === 'hsl' ? 'lightness' : 'brightness')
        }
        isDisabled={fieldsetDisabled}
        className={cx('zx-color-area', className)}
      >
        <Aria.ColorThumb className="zx-color-thumb" />
      </Aria.ColorArea>
    </Aria.I18nProvider>
  )
}

export interface ColorFieldProps
  extends Omit<Aria.ColorFieldProps, 'children' | 'className'>, FieldChrome, Localized {}

export function ColorField({
  label = '颜色值',
  description,
  errorMessage,
  disabled,
  isDisabled,
  className,
  locale = 'zh-CN',
  ...props
}: ColorFieldProps) {
  const fieldsetDisabled = useFieldsetDisabled(isDisabled ?? disabled)
  return (
    <Aria.I18nProvider locale={locale}>
      <Aria.ColorField
        {...props}
        isDisabled={fieldsetDisabled}
        className={cx('zx-picker-field', className)}
      >
        <FieldLabel>{label}</FieldLabel>
        <Aria.Input className="zx-picker-input zx-color-field-input" />
        <FieldHelp description={description} errorMessage={errorMessage} />
      </Aria.ColorField>
    </Aria.I18nProvider>
  )
}

export interface ColorSliderProps
  extends Omit<Aria.ColorSliderProps, 'children' | 'className' | 'channel'>, Localized {
  label?: ReactNode
  channel?: Aria.ColorChannel
  disabled?: boolean
  className?: string
}

export function ColorSlider({
  label,
  disabled,
  isDisabled,
  className,
  locale = 'zh-CN',
  channel = 'hue',
  colorSpace,
  defaultValue,
  ...props
}: ColorSliderProps) {
  const fieldsetDisabled = useFieldsetDisabled(isDisabled ?? disabled)
  const picker = useContext(Aria.ColorPickerStateContext)
  const space =
    colorSpace ??
    (channel === 'lightness' ? 'hsl' : ['red', 'green', 'blue'].includes(channel) ? 'rgb' : 'hsb')
  return (
    <Aria.I18nProvider locale={locale}>
      <Aria.ColorSlider
        {...props}
        defaultValue={defaultValue ?? (picker ? undefined : '#ff0000')}
        channel={channel}
        colorSpace={space}
        isDisabled={fieldsetDisabled}
        className={cx('zx-color-slider', className)}
      >
        <Aria.Label className="zx-picker-label">{label}</Aria.Label>
        <Aria.SliderOutput className="zx-picker-help" />
        <Aria.SliderTrack className="zx-color-track">
          <Aria.ColorThumb className="zx-color-thumb" />
        </Aria.SliderTrack>
      </Aria.ColorSlider>
    </Aria.I18nProvider>
  )
}

export interface ColorSwatchProps
  extends Omit<Aria.ColorSwatchProps, 'className' | 'children'>, Localized {
  label?: string
  className?: string
}

export function ColorSwatch({ label, className, locale = 'zh-CN', ...props }: ColorSwatchProps) {
  return (
    <Aria.I18nProvider locale={locale}>
      <Aria.ColorSwatch
        {...props}
        aria-label={props['aria-label'] ?? label}
        className={cx('zx-color-swatch', className)}
      />
    </Aria.I18nProvider>
  )
}

export interface ColorSwatchItem {
  color: string
  label: string
  disabled?: boolean
}

export interface ColorSwatchPickerProps
  extends Omit<Aria.ColorSwatchPickerProps, 'children' | 'className'>, Localized {
  label?: string
  items: readonly ColorSwatchItem[]
  disabled?: boolean
  className?: string
}

export function ColorSwatchPicker({
  label = '预设颜色',
  items,
  disabled,
  className,
  locale = 'zh-CN',
  ...props
}: ColorSwatchPickerProps) {
  const fieldsetDisabled = useFieldsetDisabled(disabled)
  return (
    <Aria.I18nProvider locale={locale}>
      <Aria.ColorSwatchPicker
        {...props}
        aria-label={props['aria-label'] ?? label}
        className={cx('zx-color-swatches', className)}
      >
        {items.map((item) => (
          <Aria.ColorSwatchPickerItem
            key={item.color}
            color={item.color}
            aria-label={item.label}
            isDisabled={fieldsetDisabled || item.disabled}
            className="zx-color-swatch-option"
          >
            <Aria.ColorSwatch className="zx-color-swatch" />
          </Aria.ColorSwatchPickerItem>
        ))}
      </Aria.ColorSwatchPicker>
    </Aria.I18nProvider>
  )
}

export interface ColorPickerProps extends Omit<Aria.ColorPickerProps, 'children'>, Localized {
  label: string
  disabled?: boolean
  className?: string
  swatches?: readonly ColorSwatchItem[]
}

export function ColorPicker({
  label,
  disabled,
  className,
  swatches,
  locale = 'zh-CN',
  ...props
}: ColorPickerProps) {
  const fieldsetDisabled = useFieldsetDisabled(disabled)
  const labelId = useId()
  return (
    <Aria.I18nProvider locale={locale}>
      <ThemeScope>
        {(portalContainer) => (
          <Aria.ColorPicker {...props}>
            {({ color }) => (
              <div
                className={cx('zx-picker-field', className)}
                data-disabled={fieldsetDisabled || undefined}
              >
                <span id={labelId} className="zx-picker-label">
                  {label}
                </span>
                <Aria.DialogTrigger>
                  <Aria.Button
                    isDisabled={fieldsetDisabled}
                    aria-labelledby={labelId}
                    aria-haspopup="dialog"
                    className="zx-picker-control zx-color-picker-trigger"
                  >
                    <ColorSwatch locale={locale} />
                    <span>{color.toString('hexa')}</span>
                    <ChevronDown aria-hidden="true" />
                  </Aria.Button>
                  <ThemePopover
                    UNSTABLE_portalContainer={portalContainer}
                    className="zx-picker-popover"
                  >
                    <Aria.Dialog
                      aria-label={label}
                      className="zx-picker-dialog zx-color-picker-panel"
                    >
                      <ColorArea label={`${label}颜色区域`} locale={locale} disabled={disabled} />
                      <ColorSlider label="色相" locale={locale} disabled={disabled} />
                      <ColorSlider
                        label="不透明度"
                        channel="alpha"
                        locale={locale}
                        disabled={disabled}
                      />
                      <ColorField label="颜色值" locale={locale} disabled={disabled} />
                      {swatches && (
                        <ColorSwatchPicker
                          label="预设颜色"
                          items={swatches}
                          locale={locale}
                          disabled={disabled}
                        />
                      )}
                      <Aria.Button slot="close" className="zx-color-picker-done">
                        完成
                      </Aria.Button>
                    </Aria.Dialog>
                  </ThemePopover>
                </Aria.DialogTrigger>
              </div>
            )}
          </Aria.ColorPicker>
        )}
      </ThemeScope>
    </Aria.I18nProvider>
  )
}

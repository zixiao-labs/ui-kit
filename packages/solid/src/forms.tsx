import { createUniqueId, For, Show, splitProps } from 'solid-js'
import type { ComponentProps, JSX } from 'solid-js'
import { TextField as KText } from '@kobalte/core/text-field'
import { NumberField as KNumber } from '@kobalte/core/number-field'
import { Checkbox as KCheckbox } from '@kobalte/core/checkbox'
import { Switch as KSwitch } from '@kobalte/core/switch'
import { RadioGroup as KRadio } from '@kobalte/core/radio-group'
import { Icon } from './icons'
import { FieldsetDisabledContext, fieldsetDisabled } from './fieldset-context'
import { controllable, cx } from './utils'

export interface FieldContent {
  label?: JSX.Element
  description?: JSX.Element
  errorMessage?: JSX.Element
}
export interface ControlAppearance {
  variant?: 'outline' | 'tonal'
  size?: 'md' | 'lg'
}
export type InputProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'size'> &
  ControlAppearance & { htmlSize?: number }
export function Input(props: InputProps) {
  const [local, rest] = splitProps(props, ['variant', 'size', 'htmlSize', 'class'])
  return (
    <input
      {...rest}
      size={local.htmlSize}
      class={cx('zx-input', local.class)}
      data-variant={local.variant ?? 'outline'}
      data-size={local.size ?? 'md'}
    />
  )
}
export type TextAreaProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement> & ControlAppearance
export function TextArea(props: TextAreaProps) {
  const [local, rest] = splitProps(props, ['variant', 'size', 'class', 'rows'])
  return (
    <textarea
      {...rest}
      rows={local.rows ?? 4}
      class={cx('zx-input zx-textarea', local.class)}
      data-variant={local.variant ?? 'outline'}
      data-size={local.size ?? 'md'}
    />
  )
}
export function Label(props: JSX.LabelHTMLAttributes<HTMLLabelElement>) {
  const [local, rest] = splitProps(props, ['class'])
  // Solid uses `for`, and this primitive forwards the caller's association.
  // oxlint-disable-next-line jsx-a11y/label-has-associated-control
  return <label {...rest} class={cx('zx-label', local.class)} />
}
export function Description(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return <p {...rest} class={cx('zx-description', local.class)} />
}
export function ErrorMessage(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return <p {...rest} class={cx('zx-error-message', local.class)} />
}
export function FieldError(
  props: JSX.HTMLAttributes<HTMLParagraphElement> & { invalid?: boolean },
) {
  const [local, rest] = splitProps(props, ['invalid'])
  return (
    <Show when={local.invalid}>
      <ErrorMessage {...rest} />
    </Show>
  )
}
export type InputGroupProps = JSX.HTMLAttributes<HTMLDivElement> &
  ControlAppearance & { startContent?: JSX.Element; endContent?: JSX.Element }
export function InputGroup(props: InputGroupProps) {
  const [local, rest] = splitProps(props, [
    'class',
    'variant',
    'size',
    'children',
    'startContent',
    'endContent',
  ])
  return (
    <div
      {...rest}
      class={cx('zx-input-group', local.class)}
      data-variant={local.variant ?? 'outline'}
      data-size={local.size ?? 'md'}
    >
      <Show when={local.startContent}>
        <span class="zx-input-group__adornment">{local.startContent}</span>
      </Show>
      {local.children}
      <Show when={local.endContent}>
        <span class="zx-input-group__adornment">{local.endContent}</span>
      </Show>
    </div>
  )
}

export type TextFieldProps = Omit<ComponentProps<typeof KText<'div'>>, 'children'> &
  FieldContent &
  ControlAppearance & {
    placeholder?: string
    type?: JSX.InputHTMLAttributes<HTMLInputElement>['type']
    inputProps?: Omit<InputProps, 'value' | 'onChange' | 'onInput'>
    multiline?: boolean
  }
export function TextField(props: TextFieldProps) {
  const disabled = fieldsetDisabled(() => props.disabled)
  const [local, rest] = splitProps(props, [
    'label',
    'description',
    'errorMessage',
    'variant',
    'size',
    'placeholder',
    'type',
    'inputProps',
    'class',
    'multiline',
  ])
  return (
    <KText {...rest} disabled={disabled()} class={cx('zx-field', local.class)}>
      <Show when={local.label}>
        <KText.Label class="zx-label">{local.label}</KText.Label>
      </Show>
      <Show
        when={local.multiline}
        fallback={
          <KText.Input
            {...local.inputProps}
            type={local.type ?? 'text'}
            class="zx-input"
            data-variant={local.variant ?? 'outline'}
            data-size={local.size ?? 'md'}
            placeholder={local.placeholder}
          />
        }
      >
        <KText.TextArea
          class="zx-input zx-textarea"
          data-variant={local.variant ?? 'outline'}
          data-size={local.size ?? 'md'}
          placeholder={local.placeholder}
          rows={4}
        />
      </Show>
      <Show when={local.description}>
        <KText.Description class="zx-description">{local.description}</KText.Description>
      </Show>
      <KText.ErrorMessage class="zx-error-message">{local.errorMessage}</KText.ErrorMessage>
    </KText>
  )
}
export type SearchFieldProps = Omit<TextFieldProps, 'type' | 'multiline'> & { onClear?: () => void }
export function SearchField(props: SearchFieldProps) {
  const disabled = fieldsetDisabled(() => props.disabled)
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'onChange',
    'onClear',
    'label',
    'description',
    'errorMessage',
    'variant',
    'size',
    'placeholder',
    'inputProps',
    'class',
  ])
  const [value, setValue] = controllable(
    () => local.value,
    local.defaultValue ?? '',
    () => local.onChange,
  )
  return (
    <KText
      {...rest}
      disabled={disabled()}
      value={value()}
      onChange={setValue}
      class={cx('zx-field zx-search-field', local.class)}
      data-empty={!value() || undefined}
    >
      <Show when={local.label}>
        <KText.Label class="zx-label">{local.label}</KText.Label>
      </Show>
      <InputGroup variant={local.variant} size={local.size} startContent={<Icon name="search" />}>
        <KText.Input
          {...local.inputProps}
          type="search"
          class="zx-input"
          placeholder={local.placeholder}
        />
        <button
          class="zx-field-button zx-search-field__clear"
          type="button"
          aria-label="清除搜索"
          disabled={rest.disabled || rest.readOnly || !value()}
          onClick={() => {
            setValue('')
            local.onClear?.()
          }}
        >
          <Icon name="close" />
        </button>
      </InputGroup>
      <Show when={local.description}>
        <KText.Description class="zx-description">{local.description}</KText.Description>
      </Show>
      <KText.ErrorMessage class="zx-error-message">{local.errorMessage}</KText.ErrorMessage>
    </KText>
  )
}
export type NumberFieldProps = Omit<ComponentProps<typeof KNumber<'div'>>, 'children'> &
  FieldContent &
  ControlAppearance
export function NumberField(props: NumberFieldProps) {
  const disabled = fieldsetDisabled(() => props.disabled)
  const [local, rest] = splitProps(props, [
    'label',
    'description',
    'errorMessage',
    'variant',
    'size',
    'class',
  ])
  return (
    <KNumber {...rest} disabled={disabled()} class={cx('zx-field zx-number-field', local.class)}>
      <Show when={local.label}>
        <KNumber.Label class="zx-label">{local.label}</KNumber.Label>
      </Show>
      <InputGroup variant={local.variant} size={local.size}>
        <KNumber.DecrementTrigger class="zx-field-button" aria-label="减少">
          <Icon name="minus" />
        </KNumber.DecrementTrigger>
        <KNumber.Input class="zx-input" />
        <KNumber.IncrementTrigger class="zx-field-button" aria-label="增加">
          <Icon name="plus" />
        </KNumber.IncrementTrigger>
      </InputGroup>
      <KNumber.HiddenInput />
      <Show when={local.description}>
        <KNumber.Description class="zx-description">{local.description}</KNumber.Description>
      </Show>
      <KNumber.ErrorMessage class="zx-error-message">{local.errorMessage}</KNumber.ErrorMessage>
    </KNumber>
  )
}
export type CheckboxProps = Omit<ComponentProps<typeof KCheckbox<'div'>>, 'children'> & {
  children?: JSX.Element
}
export function Checkbox(props: CheckboxProps) {
  const disabled = fieldsetDisabled(() => props.disabled)
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <KCheckbox {...rest} disabled={disabled()} class={cx('zx-choice zx-checkbox', local.class)}>
      <KCheckbox.Input />
      <KCheckbox.Control class="zx-checkbox__box">
        <Icon name={rest.indeterminate ? 'minus' : 'check'} />
      </KCheckbox.Control>
      <KCheckbox.Label class="zx-choice__label">{local.children}</KCheckbox.Label>
    </KCheckbox>
  )
}
export type SwitchProps = Omit<ComponentProps<typeof KSwitch<'div'>>, 'children'> & {
  children?: JSX.Element
}
export function Switch(props: SwitchProps) {
  const disabled = fieldsetDisabled(() => props.disabled)
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <KSwitch {...rest} disabled={disabled()} class={cx('zx-choice zx-switch', local.class)}>
      <KSwitch.Input />
      <KSwitch.Control class="zx-switch__track">
        <KSwitch.Thumb class="zx-switch__thumb" />
      </KSwitch.Control>
      <KSwitch.Label class="zx-choice__label">{local.children}</KSwitch.Label>
    </KSwitch>
  )
}
export type RadioGroupProps = ComponentProps<typeof KRadio<'div'>> & FieldContent
export function RadioGroup(props: RadioGroupProps) {
  const disabled = fieldsetDisabled(() => props.disabled)
  const [local, rest] = splitProps(props, [
    'class',
    'label',
    'description',
    'errorMessage',
    'children',
  ])
  return (
    <KRadio {...rest} disabled={disabled()} class={cx('zx-field zx-choice-group', local.class)}>
      <Show when={local.label}>
        <KRadio.Label class="zx-label">{local.label}</KRadio.Label>
      </Show>
      <div class="zx-choice-group__options">{local.children}</div>
      <Show when={local.description}>
        <KRadio.Description class="zx-description">{local.description}</KRadio.Description>
      </Show>
      <KRadio.ErrorMessage class="zx-error-message">{local.errorMessage}</KRadio.ErrorMessage>
    </KRadio>
  )
}
export type RadioProps = Omit<ComponentProps<typeof KRadio.Item<'div'>>, 'children'> & {
  children?: JSX.Element
}
export function Radio(props: RadioProps) {
  const disabled = fieldsetDisabled(() => props.disabled)
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <KRadio.Item {...rest} disabled={disabled()} class={cx('zx-choice zx-radio', local.class)}>
      <KRadio.ItemInput />
      <KRadio.ItemControl class="zx-radio__circle">
        <span />
      </KRadio.ItemControl>
      <KRadio.ItemLabel class="zx-choice__label">{local.children}</KRadio.ItemLabel>
    </KRadio.Item>
  )
}

export type SliderProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'value' | 'onChange'
> & {
  label: string
  value?: number
  onChange?: (value: number) => void
}
export function Slider(props: SliderProps) {
  const [local, rest] = splitProps(props, ['label', 'value', 'onChange', 'class', 'id'])
  const id = createUniqueId()
  return (
    <div class={cx('zx-field zx-slider', local.class)}>
      <div class="zx-slider__header">
        <Label for={local.id ?? id}>{local.label}</Label>
        <output class="zx-slider__output" for={local.id ?? id}>
          {local.value}
        </output>
      </div>
      <input
        {...rest}
        id={local.id ?? id}
        class="zx-slider__native"
        type="range"
        value={local.value}
        onInput={(event) => local.onChange?.(event.currentTarget.valueAsNumber)}
      />
    </div>
  )
}
export function Form(props: JSX.FormHTMLAttributes<HTMLFormElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return <form {...rest} class={cx('zx-form', local.class)} />
}
export function Fieldset(
  props: JSX.FieldsetHTMLAttributes<HTMLFieldSetElement> & { legend?: JSX.Element },
) {
  const disabled = fieldsetDisabled(() => props.disabled)
  const [local, rest] = splitProps(props, ['class', 'legend', 'children'])
  return (
    <fieldset {...rest} class={cx('zx-fieldset', local.class)}>
      <Show when={local.legend}>
        <legend class="zx-fieldset__legend">{local.legend}</legend>
      </Show>
      <FieldsetDisabledContext.Provider value={() => !!disabled()}>
        {local.children}
      </FieldsetDisabledContext.Provider>
    </fieldset>
  )
}

export type InputOTPProps = Omit<TextFieldProps, 'inputProps' | 'multiline' | 'type'> & {
  length?: number
  onComplete?: (value: string) => void
}
export function InputOTP(props: InputOTPProps) {
  const disabled = fieldsetDisabled(() => props.disabled)
  const [local, rest] = splitProps(props, [
    'length',
    'onComplete',
    'onChange',
    'label',
    'description',
    'errorMessage',
    'class',
    'value',
    'defaultValue',
    'variant',
    'size',
    'placeholder',
  ])
  const length = () =>
    Number.isFinite(local.length ?? 6) ? Math.min(8, Math.max(1, Math.floor(local.length ?? 6))) : 6
  const digits = (value: string) => value.replace(/[^0-9]/g, '').slice(0, length())
  return (
    <KText
      {...rest}
      disabled={disabled()}
      value={local.value === undefined ? undefined : digits(local.value)}
      defaultValue={digits(local.defaultValue ?? '')}
      onChange={(value) => local.onChange?.(digits(value))}
      class={cx('zx-field zx-otp', local.class)}
    >
      <Show when={local.label}>
        <KText.Label class="zx-label">{local.label}</KText.Label>
      </Show>
      <div class="zx-otp__viewport">
        <div class="zx-otp__control">
          <div class="zx-otp__slots" aria-hidden="true">
            <For each={Array.from({ length: length() })}>{() => <span class="zx-otp__slot" />}</For>
          </div>
          <KText.Input
            class="zx-otp__input"
            inputMode="numeric"
            autocomplete="one-time-code"
            pattern={`[0-9]{${length()}}`}
            onInput={(event) => {
              const input = event.currentTarget
              const raw = input.value
              const next = digits(raw)
              const caret = digits(raw.slice(0, input.selectionStart ?? raw.length)).length
              input.value = next
              input.setSelectionRange(caret, caret)
              if (next.length === length() && next !== local.value) local.onComplete?.(next)
            }}
          />
        </div>
      </div>
      <Show when={local.description}>
        <KText.Description class="zx-description">{local.description}</KText.Description>
      </Show>
      <KText.ErrorMessage class="zx-error-message">{local.errorMessage}</KText.ErrorMessage>
    </KText>
  )
}

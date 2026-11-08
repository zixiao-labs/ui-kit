import type { ComponentProps, ReactNode, Ref } from 'react'
import { useId } from 'react'
import * as Aria from 'react-aria-components'
import { Check, Magnifier, Minus, Plus, TriangleExclamation, Xmark } from '@gravity-ui/icons'
import { FieldsetDisabledContext, useFieldsetDisabled } from './fieldset-context'

const cx = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ')

interface FieldContent {
  label?: ReactNode
  description?: ReactNode
  errorMessage?: Aria.FieldErrorProps['children']
}

interface ControlAppearance {
  variant?: 'outline' | 'tonal'
  size?: 'md' | 'lg'
}

export type LabelProps = ComponentProps<typeof Aria.Label>

/** Associated automatically inside a field; use htmlFor for a standalone input. */
export function Label({ className, ...props }: LabelProps) {
  return <Aria.Label {...props} className={cx('zx-label', className)} />
}

export type DescriptionProps = ComponentProps<typeof Aria.Text>

export function Description({ className, slot = 'description', ...props }: DescriptionProps) {
  return <Aria.Text {...props} slot={slot} className={cx('zx-description', className)} />
}

export type ErrorMessageProps = ComponentProps<typeof Aria.Text>

/** Always-visible message. Associate via aria-describedby when used outside a field. */
export function ErrorMessage({
  className,
  slot = 'errorMessage',
  children,
  ...props
}: ErrorMessageProps) {
  return (
    <Aria.Text {...props} slot={slot} className={cx('zx-error-message', className)}>
      <TriangleExclamation aria-hidden="true" width={16} height={16} />
      <span>{children}</span>
    </Aria.Text>
  )
}

export type FieldErrorProps = ComponentProps<typeof Aria.FieldError>

/** RAC validation message: only renders when its enclosing field is invalid. */
export function FieldError({ className, children, ...props }: FieldErrorProps) {
  return (
    <Aria.FieldError
      {...props}
      className={Aria.composeRenderProps(className, (value) => cx('zx-error-message', value))}
    >
      {Aria.composeRenderProps(children, (content, validation) => {
        const message = content ?? validation.validationErrors.join(' ')
        return message ? (
          <>
            <TriangleExclamation aria-hidden="true" width={16} height={16} />
            <span>{message}</span>
          </>
        ) : null
      })}
    </Aria.FieldError>
  )
}

function FieldFeedback({
  description,
  errorMessage,
  automaticError = true,
}: Omit<FieldContent, 'label'> & { automaticError?: boolean }) {
  return (
    <>
      {description != null && <Description>{description}</Description>}
      {(automaticError || errorMessage != null) && <FieldError>{errorMessage}</FieldError>}
    </>
  )
}

export type InputProps = Omit<ComponentProps<typeof Aria.Input>, 'size'> &
  ControlAppearance & { htmlSize?: number }

/** Styled RAC input. Use inside TextField, SearchField, NumberField or InputGroup. */
export function Input({
  className,
  variant = 'outline',
  size = 'md',
  htmlSize,
  ...props
}: InputProps) {
  const disabled = useFieldsetDisabled(props.disabled)
  return (
    <Aria.Input
      {...props}
      disabled={disabled}
      size={htmlSize}
      data-variant={variant}
      data-size={size}
      className={Aria.composeRenderProps(className, (value) => cx('zx-input', value))}
    />
  )
}

export type TextAreaProps = ComponentProps<typeof Aria.TextArea> & ControlAppearance

/** Multiline input primitive: compose with TextField for label, value and validation. */
export function TextArea({
  className,
  variant = 'outline',
  size = 'md',
  rows = 4,
  ...props
}: TextAreaProps) {
  const disabled = useFieldsetDisabled(props.disabled)
  return (
    <Aria.TextArea
      {...props}
      disabled={disabled}
      rows={rows}
      data-variant={variant}
      data-size={size}
      className={Aria.composeRenderProps(className, (value) => cx('zx-input zx-textarea', value))}
    />
  )
}

export type InputGroupProps = ComponentProps<typeof Aria.Group> &
  ControlAppearance & {
    startContent?: ReactNode
    endContent?: ReactNode
  }

/** Visual grouping only. Interactive adornments must supply their own accessible name. */
export function InputGroup({
  className,
  variant = 'outline',
  size = 'md',
  startContent,
  endContent,
  children,
  ...props
}: InputGroupProps) {
  const isDisabled = useFieldsetDisabled(props.isDisabled)
  return (
    <Aria.Group
      {...props}
      isDisabled={isDisabled}
      data-variant={variant}
      data-size={size}
      className={Aria.composeRenderProps(className, (value) => cx('zx-input-group', value))}
    >
      {Aria.composeRenderProps(children, (content) => (
        <>
          {startContent != null && (
            <span className="zx-input-group__adornment">{startContent}</span>
          )}
          {content}
          {endContent != null && <span className="zx-input-group__adornment">{endContent}</span>}
        </>
      ))}
    </Aria.Group>
  )
}

export type TextFieldProps = ComponentProps<typeof Aria.TextField> &
  FieldContent &
  ControlAppearance & {
    placeholder?: string
    startContent?: ReactNode
    endContent?: ReactNode
    inputProps?: InputProps
  }

/**
 * Labeled single-line field by default. Children replace the automatic control and
 * default error slot; label/description/explicit errorMessage still render.
 * For compound validation, supply FieldError. onChange receives a string, not an event.
 */
export function TextField({
  className,
  label,
  description,
  errorMessage,
  placeholder,
  startContent,
  endContent,
  inputProps,
  variant = 'outline',
  size = 'md',
  children,
  ...props
}: TextFieldProps) {
  const isDisabled = useFieldsetDisabled(props.isDisabled)
  const control = <Input placeholder={placeholder} variant={variant} size={size} {...inputProps} />
  return (
    <Aria.TextField
      {...props}
      isDisabled={isDisabled}
      className={Aria.composeRenderProps(className, (value) => cx('zx-field', value))}
    >
      {Aria.composeRenderProps(children, (content) => (
        <>
          {label != null && <Label>{label}</Label>}
          {content ??
            (startContent != null || endContent != null ? (
              <InputGroup
                variant={variant}
                size={size}
                startContent={startContent}
                endContent={endContent}
              >
                {control}
              </InputGroup>
            ) : (
              control
            ))}
          <FieldFeedback
            description={description}
            errorMessage={errorMessage}
            automaticError={content == null}
          />
        </>
      ))}
    </Aria.TextField>
  )
}

export type SearchFieldProps = ComponentProps<typeof Aria.SearchField> &
  FieldContent &
  ControlAppearance & {
    placeholder?: string
    inputProps?: InputProps
    clearLabel?: string
  }

/** Includes a search icon and RAC clear button. onSubmit/onClear follow RAC's API. */
export function SearchField({
  className,
  label,
  description,
  errorMessage,
  placeholder,
  inputProps,
  clearLabel = '清除搜索',
  variant = 'outline',
  size = 'md',
  children,
  ...props
}: SearchFieldProps) {
  const isDisabled = useFieldsetDisabled(props.isDisabled)
  return (
    <Aria.SearchField
      {...props}
      isDisabled={isDisabled}
      className={Aria.composeRenderProps(className, (value) =>
        cx('zx-field zx-search-field', value),
      )}
    >
      {Aria.composeRenderProps(children, (content, state) => (
        <>
          {label != null && <Label>{label}</Label>}
          {content ?? (
            <InputGroup
              variant={variant}
              size={size}
              startContent={<Magnifier aria-hidden="true" width={20} height={20} />}
            >
              <Input placeholder={placeholder} {...inputProps} />
              <Aria.Button
                className="zx-field-button zx-search-field__clear"
                aria-label={clearLabel}
                isDisabled={state.isDisabled || state.isEmpty || state.isReadOnly}
              >
                <Xmark aria-hidden="true" width={16} height={16} />
              </Aria.Button>
            </InputGroup>
          )}
          <FieldFeedback
            description={description}
            errorMessage={errorMessage}
            automaticError={content == null}
          />
        </>
      ))}
    </Aria.SearchField>
  )
}

export type NumberFieldProps = ComponentProps<typeof Aria.NumberField> &
  FieldContent &
  ControlAppearance & {
    placeholder?: string
    inputProps?: InputProps
    incrementLabel?: string
    decrementLabel?: string
  }

export function NumberField({
  className,
  label,
  description,
  errorMessage,
  placeholder,
  inputProps,
  incrementLabel = '增加',
  decrementLabel = '减少',
  variant = 'outline',
  size = 'md',
  children,
  ...props
}: NumberFieldProps) {
  const isDisabled = useFieldsetDisabled(props.isDisabled)
  return (
    <Aria.NumberField
      {...props}
      isDisabled={isDisabled}
      className={Aria.composeRenderProps(className, (value) =>
        cx('zx-field zx-number-field', value),
      )}
    >
      {Aria.composeRenderProps(children, (content) => (
        <>
          {label != null && <Label>{label}</Label>}
          {content ?? (
            <InputGroup variant={variant} size={size}>
              <Aria.Button slot="decrement" className="zx-field-button" aria-label={decrementLabel}>
                <Minus aria-hidden="true" width={16} height={16} />
              </Aria.Button>
              <Input placeholder={placeholder} {...inputProps} />
              <Aria.Button slot="increment" className="zx-field-button" aria-label={incrementLabel}>
                <Plus aria-hidden="true" width={16} height={16} />
              </Aria.Button>
            </InputGroup>
          )}
          <FieldFeedback
            description={description}
            errorMessage={errorMessage}
            automaticError={content == null}
          />
        </>
      ))}
    </Aria.NumberField>
  )
}

export type CheckboxProps = ComponentProps<typeof Aria.Checkbox>

export function Checkbox({ className, children, ...props }: CheckboxProps) {
  const isDisabled = useFieldsetDisabled(props.isDisabled)
  return (
    <Aria.Checkbox
      {...props}
      isDisabled={isDisabled}
      className={Aria.composeRenderProps(className, (value) => cx('zx-choice zx-checkbox', value))}
    >
      {Aria.composeRenderProps(children, (content, state) => (
        <>
          <span className="zx-checkbox__box" aria-hidden="true">
            {state.isIndeterminate ? (
              <Minus width={16} height={16} />
            ) : (
              <Check width={16} height={16} />
            )}
          </span>
          <span className="zx-choice__label">{content}</span>
        </>
      ))}
    </Aria.Checkbox>
  )
}

export type CheckboxGroupProps = ComponentProps<typeof Aria.CheckboxGroup> &
  FieldContent & {
    orientation?: 'horizontal' | 'vertical'
  }

export function CheckboxGroup({
  className,
  label,
  description,
  errorMessage,
  orientation = 'vertical',
  children,
  ...props
}: CheckboxGroupProps) {
  const isDisabled = useFieldsetDisabled(props.isDisabled)
  return (
    <Aria.CheckboxGroup
      {...props}
      isDisabled={isDisabled}
      data-orientation={orientation}
      className={Aria.composeRenderProps(className, (value) =>
        cx('zx-field zx-choice-group', value),
      )}
    >
      {Aria.composeRenderProps(children, (content) => (
        <>
          {label != null && <Label>{label}</Label>}
          <div className="zx-choice-group__options">{content}</div>
          <FieldFeedback description={description} errorMessage={errorMessage} />
        </>
      ))}
    </Aria.CheckboxGroup>
  )
}

export type SwitchProps = ComponentProps<typeof Aria.Switch>

export function Switch({ className, children, ...props }: SwitchProps) {
  const isDisabled = useFieldsetDisabled(props.isDisabled)
  return (
    <Aria.Switch
      {...props}
      isDisabled={isDisabled}
      className={Aria.composeRenderProps(className, (value) => cx('zx-choice zx-switch', value))}
    >
      {Aria.composeRenderProps(children, (content) => (
        <>
          <span className="zx-switch__track" aria-hidden="true">
            <span className="zx-switch__thumb" />
          </span>
          <span className="zx-choice__label">{content}</span>
        </>
      ))}
    </Aria.Switch>
  )
}

export type RadioProps = ComponentProps<typeof Aria.Radio>

export function Radio({ className, children, ...props }: RadioProps) {
  const isDisabled = useFieldsetDisabled(props.isDisabled)
  return (
    <Aria.Radio
      {...props}
      isDisabled={isDisabled}
      className={Aria.composeRenderProps(className, (value) => cx('zx-choice zx-radio', value))}
    >
      {Aria.composeRenderProps(children, (content) => (
        <>
          <span className="zx-radio__circle" aria-hidden="true">
            <span />
          </span>
          <span className="zx-choice__label">{content}</span>
        </>
      ))}
    </Aria.Radio>
  )
}

export type RadioGroupProps = ComponentProps<typeof Aria.RadioGroup> & FieldContent

export function RadioGroup({
  className,
  label,
  description,
  errorMessage,
  children,
  ...props
}: RadioGroupProps) {
  const isDisabled = useFieldsetDisabled(props.isDisabled)
  return (
    <Aria.RadioGroup
      {...props}
      isDisabled={isDisabled}
      className={Aria.composeRenderProps(className, (value) =>
        cx('zx-field zx-choice-group', value),
      )}
    >
      {Aria.composeRenderProps(children, (content) => (
        <>
          {label != null && <Label>{label}</Label>}
          <div className="zx-choice-group__options">{content}</div>
          <FieldFeedback description={description} errorMessage={errorMessage} />
        </>
      ))}
    </Aria.RadioGroup>
  )
}

export type SliderProps<T extends number | number[] = number> = Aria.SliderProps<T> & {
  ref?: Ref<HTMLDivElement>
  label?: ReactNode
  description?: ReactNode
  showValue?: boolean
  /** Accessible names for individual thumbs in a range slider. */
  thumbLabels?: string[]
}

/** Number or number[] value; RAC handles keyboard, touch, bounds and RTL. */
export function Slider<T extends number | number[] = number>({
  className,
  label,
  description,
  showValue = true,
  thumbLabels,
  children,
  ...props
}: SliderProps<T>) {
  const descriptionId = useId()
  const isDisabled = useFieldsetDisabled(props.isDisabled)
  return (
    <Aria.Slider
      {...props}
      isDisabled={isDisabled}
      aria-describedby={
        cx(props['aria-describedby'], description != null ? descriptionId : undefined) || undefined
      }
      className={Aria.composeRenderProps(className, (value) => cx('zx-field zx-slider', value))}
    >
      {Aria.composeRenderProps(children, (content) => (
        <>
          <div className="zx-slider__header">
            {label != null && <Label>{label}</Label>}
            {showValue && <Aria.SliderOutput className="zx-slider__output" />}
          </div>
          {content ?? (
            <Aria.SliderTrack className="zx-slider__track">
              {({ state }) => (
                <>
                  <div className="zx-slider__rail">
                    <Aria.SliderFill className="zx-slider__fill" />
                  </div>
                  {state.values.map((_, index) => (
                    <Aria.SliderThumb
                      key={index}
                      index={index}
                      aria-label={
                        thumbLabels?.[index] ??
                        (state.values.length > 1 ? `${index + 1}` : undefined)
                      }
                      className="zx-slider__thumb"
                    />
                  ))}
                </>
              )}
            </Aria.SliderTrack>
          )}
          {description != null && <Description id={descriptionId}>{description}</Description>}
        </>
      ))}
    </Aria.Slider>
  )
}

export type FormProps = ComponentProps<typeof Aria.Form>

export function Form({ className, ...props }: FormProps) {
  return <Aria.Form {...props} className={cx('zx-form', className)} />
}

export type FieldsetProps = ComponentProps<'fieldset'> & { legend?: ReactNode }

/** Native fieldset semantics and disabled cascade, with a styled optional legend. */
export function Fieldset({ className, legend, children, disabled, ...props }: FieldsetProps) {
  const isDisabled = useFieldsetDisabled(disabled)
  return (
    <fieldset {...props} disabled={disabled} className={cx('zx-fieldset', className)}>
      {/* Keep the first legend outside this fieldset's provider: its controls
          remain enabled unless a surrounding fieldset has disabled them. */}
      {legend != null && <legend className="zx-fieldset__legend">{legend}</legend>}
      <FieldsetDisabledContext.Provider value={!!isDisabled}>
        {children}
      </FieldsetDisabledContext.Provider>
    </fieldset>
  )
}

export type InputOTPProps = Omit<
  ComponentProps<typeof Aria.TextField>,
  | 'children'
  | 'type'
  | 'inputMode'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'value'
  | 'defaultValue'
> &
  FieldContent & {
    /** One to eight ASCII digits; defaults to six. */
    length?: number
    value?: string
    defaultValue?: string
    inputRef?: Ref<HTMLInputElement>
    onComplete?: (value: string) => void
  }

const otpDigits = (value: string, length: number) => value.replace(/[^0-9]/g, '').slice(0, length)

function OTPControl({
  length,
  inputRef,
  onComplete,
}: Pick<InputOTPProps, 'inputRef' | 'onComplete'> & { length: number }) {
  // Read the RAC input contract, then replace its context locally to avoid merging
  // onChange twice. The field still owns controlled/uncontrolled state and reset.
  const ownProps: Aria.InputProps = {}
  const [props, ref] = Aria.useContextProps(ownProps, inputRef, Aria.InputContext)
  return (
    <div className="zx-otp__viewport">
      <div className="zx-otp__control">
        <div className="zx-otp__slots" aria-hidden="true">
          {Array.from({ length }, (_, index) => (
            <span key={index} className="zx-otp__slot" />
          ))}
        </div>
        <Aria.InputContext.Provider value={null}>
          <Aria.Input
            {...props}
            ref={ref}
            className="zx-otp__input"
            onChange={(event) => {
              const input = event.currentTarget
              const raw = input.value
              const caret = otpDigits(
                raw.slice(0, input.selectionStart ?? raw.length),
                length,
              ).length
              const next = otpDigits(raw, length)
              input.value = next
              input.setSelectionRange(caret, caret)
              props.onChange?.(event)
              if (next.length === length && next !== String(props.value ?? '')) onComplete?.(next)
            }}
          />
        </Aria.InputContext.Provider>
      </div>
    </div>
  )
}

/**
 * One real text input with visual digit cells, not disconnected inputs. Native
 * selection, arrows, backspace, paste and one-time-code autofill remain available.
 * Non-ASCII digits are removed; pasted content is filtered before truncation.
 * onComplete fires on a user edit reaching length, never on mount/controlled updates.
 */
export function InputOTP({
  className,
  label,
  description,
  errorMessage,
  length: requestedLength = 6,
  value,
  defaultValue,
  inputRef,
  onComplete,
  autoComplete = 'one-time-code',
  ...props
}: InputOTPProps) {
  const isDisabled = useFieldsetDisabled(props.isDisabled)
  const length = Number.isFinite(requestedLength)
    ? Math.min(8, Math.max(1, Math.floor(requestedLength)))
    : 6
  return (
    <Aria.TextField
      {...props}
      isDisabled={isDisabled}
      value={value === undefined ? undefined : otpDigits(value, length)}
      defaultValue={defaultValue === undefined ? undefined : otpDigits(defaultValue, length)}
      type="text"
      inputMode="numeric"
      autoComplete={autoComplete}
      minLength={length}
      pattern={`[0-9]{${length}}`}
      className={Aria.composeRenderProps(className, (name) => cx('zx-field zx-otp', name))}
    >
      {label != null && <Label>{label}</Label>}
      <OTPControl length={length} inputRef={inputRef} onComplete={onComplete} />
      <FieldFeedback description={description} errorMessage={errorMessage} />
    </Aria.TextField>
  )
}

import { For, Show, splitProps } from 'solid-js'
import { Select as KSelect } from '@kobalte/core/select'
import { Combobox as KCombobox } from '@kobalte/core/combobox'
import { Listbox as KListbox } from '@kobalte/core/listbox'
import { Icon } from './icons'
import { fieldsetDisabled } from './fieldset-context'
import { portalTheme } from './portal-theme'
import { cx } from './utils'

export interface SelectOption {
  id: string
  label: string
  disabled?: boolean
  description?: string
}
export interface SelectProps {
  options: SelectOption[]
  label: string
  value?: string | null
  defaultValue?: string
  onChange?: (id: string | null) => void
  placeholder?: string
  description?: string
  errorMessage?: string
  disabled?: boolean
  required?: boolean
  readOnly?: boolean
  validationState?: 'valid' | 'invalid'
  name?: string
  id?: string
  class?: string
}
export function Select(props: SelectProps) {
  const disabled = fieldsetDisabled(() => props.disabled)
  const [local, rest] = splitProps(props, [
    'options',
    'value',
    'defaultValue',
    'onChange',
    'label',
    'placeholder',
    'description',
    'errorMessage',
    'class',
  ])
  const theme = portalTheme()
  const selected = (id: string | null | undefined) =>
    local.options.find((option) => option.id === id) ?? null
  return (
    <span ref={theme.ref} style={{ display: 'contents' }}>
      <KSelect<SelectOption>
        {...rest}
        disabled={disabled()}
        class={cx('zx-field zx-solid', local.class)}
        options={local.options}
        optionValue="id"
        optionTextValue="label"
        optionDisabled="disabled"
        value={local.value === undefined ? undefined : selected(local.value)}
        defaultValue={selected(local.defaultValue) ?? undefined}
        onChange={(option) => local.onChange?.(option?.id ?? null)}
        placeholder={local.placeholder ?? '请选择'}
        itemComponent={(itemProps) => (
          <KSelect.Item item={itemProps.item} class="zx-listbox__item">
            <KSelect.ItemLabel>{itemProps.item.rawValue.label}</KSelect.ItemLabel>
            <KSelect.ItemIndicator class="zx-listbox__check">
              <Icon name="check" />
            </KSelect.ItemIndicator>
          </KSelect.Item>
        )}
      >
        <KSelect.Label class="zx-label">{local.label}</KSelect.Label>
        <KSelect.HiddenSelect />
        <KSelect.Trigger class="zx-input zx-select__trigger">
          <KSelect.Value<SelectOption>>{(state) => state.selectedOption()?.label}</KSelect.Value>
          <KSelect.Icon>
            <Icon name="chevron" />
          </KSelect.Icon>
        </KSelect.Trigger>
        <Show when={local.description}>
          <KSelect.Description class="zx-description">{local.description}</KSelect.Description>
        </Show>
        <KSelect.ErrorMessage class="zx-error-message">{local.errorMessage}</KSelect.ErrorMessage>
        <KSelect.Portal mount={theme.mount()}>
          <KSelect.Content class="zx-popover zx-select__content zx-solid" {...theme.attributes()}>
            <KSelect.Listbox class="zx-menu" />
          </KSelect.Content>
        </KSelect.Portal>
      </KSelect>
    </span>
  )
}
export function ComboBox(props: SelectProps) {
  const disabled = fieldsetDisabled(() => props.disabled)
  const [local, rest] = splitProps(props, [
    'options',
    'value',
    'defaultValue',
    'onChange',
    'label',
    'placeholder',
    'description',
    'errorMessage',
    'class',
  ])
  const theme = portalTheme()
  const selected = (id: string | null | undefined) =>
    local.options.find((option) => option.id === id) ?? null
  return (
    <span ref={theme.ref} style={{ display: 'contents' }}>
      <KCombobox<SelectOption>
        {...rest}
        disabled={disabled()}
        class={cx('zx-field zx-solid', local.class)}
        options={local.options}
        optionValue="id"
        optionTextValue="label"
        optionLabel="label"
        optionDisabled="disabled"
        value={local.value === undefined ? undefined : selected(local.value)}
        defaultValue={selected(local.defaultValue) ?? undefined}
        onChange={(option) => local.onChange?.(option?.id ?? null)}
        itemComponent={(itemProps) => (
          <KCombobox.Item item={itemProps.item} class="zx-listbox__item">
            <KCombobox.ItemLabel>{itemProps.item.rawValue.label}</KCombobox.ItemLabel>
            <KCombobox.ItemIndicator class="zx-listbox__check">
              <Icon name="check" />
            </KCombobox.ItemIndicator>
          </KCombobox.Item>
        )}
      >
        <KCombobox.Label class="zx-label">{local.label}</KCombobox.Label>
        <KCombobox.HiddenSelect />
        <KCombobox.Control class="zx-input-group">
          <KCombobox.Input class="zx-input" placeholder={local.placeholder ?? '搜索选项'} />
          <KCombobox.Trigger class="zx-field-button" aria-label="显示选项">
            <Icon name="chevron" />
          </KCombobox.Trigger>
        </KCombobox.Control>
        <Show when={local.description}>
          <KCombobox.Description class="zx-description">{local.description}</KCombobox.Description>
        </Show>
        <KCombobox.ErrorMessage class="zx-error-message">
          {local.errorMessage}
        </KCombobox.ErrorMessage>
        <KCombobox.Portal mount={theme.mount()}>
          <KCombobox.Content class="zx-popover zx-select__content zx-solid" {...theme.attributes()}>
            <KCombobox.Listbox class="zx-menu" />
          </KCombobox.Content>
        </KCombobox.Portal>
      </KCombobox>
    </span>
  )
}
export interface ListBoxProps {
  options: SelectOption[]
  label: string
  value?: string[]
  defaultValue?: string[]
  onChange?: (value: string[]) => void
  multiple?: boolean
  class?: string
}
export function ListBox(props: ListBoxProps) {
  return (
    <KListbox<SelectOption>
      class={cx('zx-listbox zx-solid', props.class)}
      aria-label={props.label}
      options={props.options}
      optionValue="id"
      optionTextValue="label"
      optionDisabled="disabled"
      selectionMode={props.multiple ? 'multiple' : 'single'}
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={(keys) => props.onChange?.(Array.from(keys))}
      renderItem={(item) => (
        <KListbox.Item item={item} class="zx-listbox__item">
          <KListbox.ItemLabel>{item.rawValue.label}</KListbox.ItemLabel>
          <KListbox.ItemIndicator class="zx-listbox__check">
            <Icon name="check" />
          </KListbox.ItemIndicator>
        </KListbox.Item>
      )}
    />
  )
}
export interface TagGroupProps {
  label: string
  items: { id: string; label: string }[]
  onRemove?: (id: string) => void
  emptyMessage?: string
}
export function TagGroup(props: TagGroupProps) {
  return (
    <fieldset class="zx-tag-group">
      <legend class="zx-tag-group__label">{props.label}</legend>
      <div class="zx-tag-group__list">
        <For
          each={props.items}
          fallback={<span class="zx-tag-group__empty">{props.emptyMessage ?? '暂无标签'}</span>}
        >
          {(item) => (
            <span class="zx-tag">
              {item.label}
              <Show when={props.onRemove}>
                <button
                  class="zx-tag__remove"
                  type="button"
                  aria-label={`移除 ${item.label}`}
                  onClick={() => props.onRemove?.(item.id)}
                >
                  <Icon name="close" />
                </button>
              </Show>
            </span>
          )}
        </For>
      </div>
    </fieldset>
  )
}

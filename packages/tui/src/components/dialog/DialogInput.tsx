/**
 * DialogInput - A search/filter input field for use in dialogs.
 *
 * Provides:
 * - Styled text input with theme colors
 * - Placeholder text support
 * - Search prompt prefix
 *
 * Example rendering:
 * ┌─────────────────────────────────────────┐
 * │ > Search commands...                    │  <- Input with placeholder
 * └─────────────────────────────────────────┘
 */
import { useSemanticColors } from '../../theme.js'

export interface DialogInputProps {
  /** Current input value */
  value: string
  /** Called when input value changes */
  onChange: (value: string) => void
  /** Placeholder text when empty */
  placeholder?: string
  /** Whether the input is focused (controls cursor visibility) */
  focused?: boolean
  /** Width of the input (number only, for OpenTUI input) */
  width?: number
}

/**
 * DialogInput component - A styled input for dialog search/filter.
 *
 * Uses OpenTUI's input element with theme-aware styling.
 * The `focused` prop controls whether the input is active for typing.
 */
export function DialogInput({
  value,
  onChange,
  placeholder = 'Search...',
  focused = false,
  width,
}: DialogInputProps) {
  const colors = useSemanticColors()

  // Calculate input width accounting for the prompt character and gap
  const inputWidth = width !== undefined ? Math.max(1, width - 2) : undefined

  return (
    <box flexDirection="row" alignItems="center" gap={1}>
      <text fg={colors.textMuted}>{'>'}</text>
      <input
        value={value}
        onInput={onChange}
        placeholder={placeholder}
        focused={focused}
        width={inputWidth}
        textColor={colors.text}
        placeholderColor={colors.textMuted}
        cursorColor={colors.accent}
      />
    </box>
  )
}

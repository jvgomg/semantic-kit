/**
 * DialogInput - A search/filter input field for use in dialogs.
 *
 * Provides:
 * - Styled text input with theme colors
 * - Placeholder text support
 * - Consistent gutter alignment with other dialog content
 *
 * Example rendering:
 * ┌─────────────────────────────────────────┐
 * │  Search commands...                     │  <- Input with placeholder
 * │                                         │  <- Blank line (marginBottom)
 * │  Suggested                              │  <- Options start here
 * └─────────────────────────────────────────┘
 */
import { useSemanticColors } from '../../theme.js'
import { useDialogGutter } from './DialogGutterContext.js'

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
 * Aligns with other dialog content using the gutter context.
 */
export function DialogInput({
  value,
  onChange,
  placeholder = 'Search...',
  focused = false,
  width,
}: DialogInputProps) {
  const colors = useSemanticColors()
  const { gutter } = useDialogGutter()

  // Calculate input width accounting for the gutter margins
  const inputWidth =
    width !== undefined ? Math.max(1, width - gutter * 2) : undefined

  return (
    <box paddingLeft={gutter} paddingRight={gutter} marginBottom={1}>
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

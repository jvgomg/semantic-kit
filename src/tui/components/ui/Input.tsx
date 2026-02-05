/**
 * Input - A reusable text input component with label support.
 *
 * Supports two label positions:
 * - 'inline': Label and input on same line (e.g., "Label: [input value]")
 * - 'block': Label on separate line above input
 */
import React from 'react'
import { Box, Text } from 'ink'
import { colors } from '../../theme.js'

// ============================================================================
// Types
// ============================================================================

export interface InputProps {
  /** Input label text */
  label: string
  /** Label position: 'inline' or 'block' */
  labelPosition: 'inline' | 'block'
  /** Current input value */
  value: string
  /** Cursor position within the value */
  cursorPosition: number
  /** Whether this input is focused */
  isFocused: boolean
  /** Available width for rendering */
  width: number
  /** Background color (for consistent modal rendering) */
  backgroundColor?: string
  /** Label color */
  labelColor?: string
  /** Text color */
  textColor?: string
  /** Accent color for cursor */
  accentColor?: string
}

// ============================================================================
// Component
// ============================================================================

export function Input({
  label,
  labelPosition,
  value,
  cursorPosition,
  isFocused,
  width,
  backgroundColor = colors.modalBackground,
  labelColor = colors.textHint,
  textColor = colors.text,
  accentColor = colors.accent,
}: InputProps) {
  if (labelPosition === 'block') {
    // Block layout: label on separate line
    const inputWidth = width - 2 // padding
    return (
      <Box flexDirection="column">
        <Text color={labelColor} backgroundColor={backgroundColor}>
          {(' ' + label).padEnd(width)}
        </Text>
        {renderInputField({
          value,
          cursorPosition,
          isFocused,
          width: inputWidth,
          backgroundColor,
          textColor,
          accentColor,
          paddingLeft: 2,
          totalWidth: width,
        })}
      </Box>
    )
  }

  // Inline layout: label and input on same line
  const labelPrefix = label + ': '
  const inputWidth = width - labelPrefix.length - 2 // padding

  return renderInlineInput({
    labelPrefix,
    value,
    cursorPosition,
    isFocused,
    inputWidth,
    width,
    backgroundColor,
    labelColor,
    textColor,
    accentColor,
  })
}

// ============================================================================
// Helpers
// ============================================================================

interface InputFieldOptions {
  value: string
  cursorPosition: number
  isFocused: boolean
  width: number
  backgroundColor: string
  textColor: string
  accentColor: string
  paddingLeft: number
  totalWidth: number
}

function renderInputField({
  value,
  cursorPosition,
  isFocused,
  width,
  backgroundColor,
  textColor,
  accentColor,
  paddingLeft,
  totalWidth,
}: InputFieldOptions) {
  let displayValue = value
  let displayCursor = cursorPosition

  // Scroll input if too long
  if (displayValue.length > width) {
    const start = Math.max(0, cursorPosition - Math.floor(width / 2))
    displayValue = displayValue.slice(start, start + width)
    displayCursor = cursorPosition - start
  }

  // Pad or truncate to fit
  displayValue = displayValue.slice(0, width).padEnd(width)

  const padding = ' '.repeat(paddingLeft)

  if (isFocused) {
    const before = displayValue.slice(0, displayCursor)
    const cursorChar = displayValue[displayCursor] ?? ' '
    const after = displayValue.slice(displayCursor + 1)
    const trailingPad = totalWidth - paddingLeft - displayValue.length

    return (
      <Text backgroundColor={backgroundColor}>
        {padding}
        <Text color={textColor}>{before}</Text>
        <Text color={accentColor} inverse>
          {cursorChar}
        </Text>
        <Text color={textColor}>{after}</Text>
        {trailingPad > 0 ? ' '.repeat(trailingPad) : ''}
      </Text>
    )
  }

  return (
    <Text color={textColor} backgroundColor={backgroundColor}>
      {(padding + displayValue).padEnd(totalWidth)}
    </Text>
  )
}

interface InlineInputOptions {
  labelPrefix: string
  value: string
  cursorPosition: number
  isFocused: boolean
  inputWidth: number
  width: number
  backgroundColor: string
  labelColor: string
  textColor: string
  accentColor: string
}

function renderInlineInput({
  labelPrefix,
  value,
  cursorPosition,
  isFocused,
  inputWidth,
  width,
  backgroundColor,
  labelColor,
  textColor,
  accentColor,
}: InlineInputOptions) {
  let displayValue = value
  let displayCursor = cursorPosition

  // Scroll input if too long
  if (displayValue.length > inputWidth) {
    const start = Math.max(0, cursorPosition - Math.floor(inputWidth / 2))
    displayValue = displayValue.slice(start, start + inputWidth)
    displayCursor = cursorPosition - start
  }

  // Pad or truncate to fit
  displayValue = displayValue.slice(0, inputWidth).padEnd(inputWidth)

  if (isFocused) {
    const before = displayValue.slice(0, displayCursor)
    const cursorChar = displayValue[displayCursor] ?? ' '
    const after = displayValue.slice(displayCursor + 1)
    const trailingPad = width - 1 - labelPrefix.length - displayValue.length

    return (
      <Text backgroundColor={backgroundColor}>
        <Text color={labelColor}>{' ' + labelPrefix}</Text>
        <Text color={textColor}>{before}</Text>
        <Text color={accentColor} inverse>
          {cursorChar}
        </Text>
        <Text color={textColor}>{after}</Text>
        {trailingPad > 0 ? ' '.repeat(trailingPad) : ''}
      </Text>
    )
  }

  return (
    <Text backgroundColor={backgroundColor}>
      <Text color={labelColor}>{' ' + labelPrefix}</Text>
      <Text color={textColor}>{displayValue}</Text>
      {' '.repeat(Math.max(0, width - 1 - labelPrefix.length - displayValue.length))}
    </Text>
  )
}

import type { ReactNode } from 'react'

/**
 * Props passed to a view's Component
 */
export interface ViewComponentProps<T = unknown> {
  /** The fetched data */
  data: T
  /** Available height for the content area */
  height: number
  /** Whether the view is focused */
  isFocused: boolean
  /** Whether the view is receiving input */
  isActive: boolean
}

/**
 * Sub-tab definition for views with multiple tabs
 */
export interface SubTabDefinition<T = unknown> {
  /** Unique identifier within the view */
  id: string
  /** Tab label displayed in tab bar */
  label: string
  /** Render this sub-tab's content */
  render: (data: T) => string[]
}

/**
 * ViewDefinition interface for self-registering views
 */
export interface ViewDefinition<T = unknown> {
  /** Unique identifier (e.g., 'schema') */
  id: string
  /** Menu label (e.g., 'Schema') */
  label: string
  /** Description shown in the info panel */
  description: string
  /** Data fetcher - takes URL and returns data */
  fetch: (url: string) => Promise<T>
  /** Render data to lines for display (used when Component is not provided) */
  render: (data: T) => string[]
  /** Optional React component for rich rendering (takes precedence over render) */
  Component?: (props: ViewComponentProps<T>) => ReactNode
  /** Optional sub-tabs for views with multiple content panes */
  subTabs?: SubTabDefinition<T>[]
}

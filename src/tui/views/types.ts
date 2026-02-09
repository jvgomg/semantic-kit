/**
 * View type definitions for the TUI.
 */
import type { ReactNode } from 'react'

/**
 * Props passed to a view's Component
 * Note: Components should read focus state from atoms if needed
 */
export interface ViewComponentProps<T = unknown> {
  /** The fetched data */
  data: T
  /** Available height for the content area */
  height: number
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
  /** React component for rendering the view */
  Component: (props: ViewComponentProps<T>) => ReactNode
}

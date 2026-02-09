/**
 * Reusable UI components for OpenTUI.
 */
export { Markdown } from './Markdown.js'
export type { MarkdownProps } from './Markdown.js'
export { SelectWithClick } from './SelectWithClick.js'
export type { SelectWithClickProps } from './SelectWithClick.js'
export { TabBar } from './TabBar.js'
export type { TabBarProps, TabItem } from './TabBar.js'
export { Table } from './Table.js'
export type { TableProps, TableVariant } from './Table.js'

// Expandable sections framework - re-exported from view-display for backwards compatibility
export {
  Section,
  SectionPriority,
  SectionContainer,
  ViewSections,
  boxChars,
  severityToPriority,
  sectionColors,
  getSeverityColor,
} from '../view-display/index.js'
export type {
  SectionProps,
  SectionSeverity,
  SectionContainerProps,
  ViewSectionsProps,
} from '../view-display/index.js'

// Expandable sections framework - Content components
export { Card, CardRow } from './Card.js'
export type { CardProps, CardRowProps, CardAction } from './Card.js'
export { Prose } from './Prose.js'
export type { ProseProps } from './Prose.js'
export { Tree, countTreeNodes, getTreeMaxDepth } from './Tree.js'
export type { TreeProps, TreeNode } from './Tree.js'
export { ClickableLink, createDocsAction } from './ClickableLink.js'
export type { ClickableLinkProps } from './ClickableLink.js'
export { SitemapBrowser, useSitemapBrowserState } from './SitemapBrowser.js'
export type { SitemapBrowserProps, UseSitemapBrowserOptions } from './SitemapBrowser.js'

/**
 * View display components - handles rendering of view states.
 */
export { ViewRenderer } from './ViewRenderer.js'
export type { ViewRendererProps } from './ViewRenderer.js'

export { ViewEmpty } from './ViewEmpty.js'
export type { ViewEmptyProps } from './ViewEmpty.js'

export { ViewError } from './ViewError.js'
export type { ViewErrorProps } from './ViewError.js'

// Expandable sections framework
export { ViewSections, SectionContainer } from './ViewSections.js'
export type {
  ViewSectionsProps,
  SectionContainerProps,
} from './ViewSections.js'

export { Section, SectionPriority } from './Section.js'
export type { SectionProps, SectionSeverity } from './Section.js'

export { boxChars, severityToPriority } from './priorities.js'
export { useSectionColors, getSeverityColor } from './section-theme.js'
export type { SectionColors } from './section-theme.js'

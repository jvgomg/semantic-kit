/**
 * React Context for section registration.
 *
 * Sections self-register on mount, eliminating the need for
 * initialization flags and explicit initialize() calls.
 */
import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { SectionPriority } from '../../components/view-display/priorities.js'

/**
 * Registration info for a section.
 */
export interface SectionRegistration {
  id: string
  defaultExpanded: boolean
  priority: SectionPriority
}

/**
 * Registered section with computed index.
 */
interface RegisteredSection extends SectionRegistration {
  index: number
}

/**
 * Context value for section registry.
 */
interface SectionRegistryContextValue {
  /** Register a section. Called on mount. */
  register: (section: SectionRegistration) => void
  /** Unregister a section. Called on unmount. */
  unregister: (id: string) => void
  /** All registered sections, sorted by priority. */
  sections: RegisteredSection[]
  /** Get the index of a section by ID. Returns -1 if not found. */
  getSectionIndex: (id: string) => number
  /** Total number of registered sections. */
  sectionCount: number
}

const SectionRegistryContext =
  createContext<SectionRegistryContextValue | null>(null)

/**
 * Provider for section registration.
 * Wraps ViewSections and manages the registry of sections.
 */
export function SectionRegistryProvider({
  children,
}: {
  children: ReactNode
}): ReactNode {
  // Map of section ID to registration info
  const [registrations, setRegistrations] = useState<
    Map<string, SectionRegistration>
  >(() => new Map())

  const register = useCallback((section: SectionRegistration) => {
    setRegistrations((prev) => {
      const next = new Map(prev)
      next.set(section.id, section)
      return next
    })
  }, [])

  const unregister = useCallback((id: string) => {
    setRegistrations((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  // Sort sections by priority and compute indices
  const sections = useMemo(() => {
    const sorted = Array.from(registrations.values()).sort(
      (a, b) => a.priority - b.priority,
    )
    return sorted.map((s, index) => ({ ...s, index }))
  }, [registrations])

  const getSectionIndex = useCallback(
    (id: string) => {
      const section = sections.find((s) => s.id === id)
      return section?.index ?? -1
    },
    [sections],
  )

  const value = useMemo(
    () => ({
      register,
      unregister,
      sections,
      getSectionIndex,
      sectionCount: sections.length,
    }),
    [register, unregister, sections, getSectionIndex],
  )

  return (
    <SectionRegistryContext.Provider value={value}>
      {children}
    </SectionRegistryContext.Provider>
  )
}

/**
 * Hook to access the section registry.
 * Must be used within a SectionRegistryProvider.
 */
export function useSectionRegistry(): SectionRegistryContextValue {
  const context = useContext(SectionRegistryContext)
  if (!context) {
    throw new Error(
      'useSectionRegistry must be used within a SectionRegistryProvider',
    )
  }
  return context
}

/**
 * Hook for a section to register itself.
 * Call this in each Section component.
 *
 * @param id - Unique section identifier
 * @param defaultExpanded - Whether section is expanded by default
 * @param priority - Priority for sorting
 * @returns The section's index in the sorted list
 */
export function useSectionRegistration(
  id: string,
  defaultExpanded: boolean,
  priority: SectionPriority,
): number {
  const { register, unregister, getSectionIndex } = useSectionRegistry()

  useEffect(() => {
    register({ id, defaultExpanded, priority })
    return () => unregister(id)
  }, [id, defaultExpanded, priority, register, unregister])

  return getSectionIndex(id)
}

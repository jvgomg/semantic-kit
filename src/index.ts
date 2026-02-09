// semantic-kit
// Developer toolkit for understanding how websites are interpreted by
// search engines, AI crawlers, screen readers, and content extractors

export { validateHtmlCommand } from './commands/validate-html/index.js'

// Result types for programmatic usage
export type {
  // A11y command results
  A11yResult,
  A11ySnapshotState,
  A11yCompareResult,
  // Structure command results
  StructureResult,
  StructureJsResult,
  StructureCompareResult,
  // Bot command results
  ExtractedContent,
  SectionInfo,
  BotComparisonResult,
  BotResult,
  // AI command results
  FrameworkDetection,
  HiddenContentAnalysis,
  AiResult,
  // Schema command results
  MetatagGroupResult,
  SchemaResult,
  // Validation command results
  HtmlValidateResultEntry,
  ValidateHtmlResult,
  SchemaTestResult,
  ValidateSchemaResult,
  AxeNodeResult,
  AxeViolationResult,
  ValidateA11yResult,
} from './lib/results.js'

// Re-export commonly used lib types
export type {
  StructureAnalysis,
  StructureComparison,
  StructureWarning,
  HeadingAnalysis,
  LinkAnalysis,
  LandmarkAnalysis,
} from './lib/structure.js'

export type {
  AriaNode,
  AriaSnapshotAnalysis,
  SnapshotDiff,
} from './lib/aria-snapshot.js'

/**
 * AI View Content Component
 *
 * Custom TUI rendering for the AI command with three sections:
 * 1. Calculated data - tool-generated metrics (word counts, hidden content analysis)
 * 2. Metadata - extracted page metadata (title, author, site name)
 * 3. Body content - the extracted markdown content
 */
import { Box, Text } from 'ink'
import { Table } from '../../components/ui/Table.js'
import { Markdown } from '../../components/ui/Markdown.js'
import type { AiResult } from '../../../lib/results.js'
import type { ViewComponentProps } from '../types.js'

/**
 * Section header component
 */
function SectionHeader({ title }: { title: string }) {
  return (
    <Box marginBottom={1}>
      <Text bold color="cyan">
        {title}
      </Text>
    </Box>
  )
}

/**
 * Calculated data section - tool-generated metrics
 */
function CalculatedDataSection({ data }: { data: AiResult }) {
  const { hiddenContentAnalysis } = data

  const calculatedData = [
    {
      metric: 'Word Count',
      value: data.wordCount.toLocaleString(),
      status: data.wordCount > 0 ? 'OK' : 'Warning',
    },
    {
      metric: 'Readerable',
      value: data.isReaderable ? 'Yes' : 'No',
      status: data.isReaderable ? 'OK' : 'Warning',
    },
    {
      metric: 'Hidden Content',
      value: `${hiddenContentAnalysis.hiddenPercentage}%`,
      status:
        hiddenContentAnalysis.severity === 'none'
          ? 'OK'
          : hiddenContentAnalysis.severity === 'low'
            ? 'Warning'
            : 'Error',
    },
    {
      metric: 'Hidden Words',
      value: hiddenContentAnalysis.hiddenWordCount.toLocaleString(),
      status: hiddenContentAnalysis.hiddenWordCount === 0 ? 'OK' : 'Warning',
    },
    {
      metric: 'Framework',
      value: hiddenContentAnalysis.framework?.name ?? 'None detected',
      status: 'Info',
    },
  ]

  return (
    <Box flexDirection="column" marginBottom={1}>
      <SectionHeader title="Analysis" />
      <Table data={calculatedData} />
    </Box>
  )
}

/**
 * Metadata section - extracted page information
 */
function MetadataSection({ data }: { data: AiResult }) {
  const metadata = [
    { field: 'Title', value: data.title ?? '(not found)' },
    { field: 'Author', value: data.author ?? '(not found)' },
    { field: 'Site', value: data.siteName ?? '(not found)' },
    {
      field: 'Excerpt',
      value: data.excerpt
        ? data.excerpt.length > 60
          ? data.excerpt.slice(0, 57) + '...'
          : data.excerpt
        : '(not found)',
    },
  ]

  return (
    <Box flexDirection="column" marginBottom={1}>
      <SectionHeader title="Metadata" />
      <Table data={metadata} />
    </Box>
  )
}

/**
 * Body content section - the extracted markdown
 */
function BodyContentSection({ data }: { data: AiResult }) {
  if (!data.markdown || data.wordCount === 0) {
    return (
      <Box flexDirection="column">
        <SectionHeader title="Content" />
        <Text color="yellow">
          No content could be extracted from this page.
        </Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <SectionHeader title="Content" />
      <Markdown>{data.markdown}</Markdown>
    </Box>
  )
}

/**
 * Main AI View Content component
 */
export function AiViewContent({ data }: ViewComponentProps<AiResult>) {
  return (
    <Box flexDirection="column" paddingX={1}>
      <CalculatedDataSection data={data} />
      <MetadataSection data={data} />
      <BodyContentSection data={data} />
    </Box>
  )
}

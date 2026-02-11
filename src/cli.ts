import { Command } from 'commander'
import {
  a11yTreeCommand,
  a11yTreeJsCommand,
  a11yTreeCompareCommand,
} from './commands/a11y-tree/index.js'
import { aiCommand } from './commands/ai/index.js'
import { fetchCommand } from './commands/fetch/index.js'
import { googleCommand } from './commands/google/index.js'
import {
  readabilityCommand,
  readabilityJsCommand,
  readabilityCompareCommand,
} from './commands/readability/index.js'
import { readerCommand } from './commands/reader/index.js'
import { schemaCommand, schemaJsCommand } from './commands/schema/index.js'
import { screenReaderCommand } from './commands/screen-reader/index.js'
import { socialCommand } from './commands/social/index.js'
import {
  structureCommand,
  structureJsCommand,
  structureCompareCommand,
} from './commands/structure/index.js'
import { tuiCommand } from './commands/tui.js'
import { validateA11yCommand } from './commands/validate-a11y/index.js'
import { validateHtmlCommand } from './commands/validate-html/index.js'
import { validateSchemaCommand } from './commands/validate-schema/index.js'
import type { OutputModeOptions } from './lib/output-mode.js'
import { handleCommandError } from './lib/run-command.js'
import { VERSION } from './lib/version.js'

const program = new Command()

program
  .name('semantic-kit')
  .description(
    'Developer toolkit for understanding how websites are interpreted by search engines, AI crawlers, screen readers, and content extractors',
  )
  .version(VERSION)
  .option('--plain', 'Disable rich output (no spinners, plain text)')
  .option('--ci', 'CI mode (alias for --plain)')
  .configureHelp({
    // Hide default command list - we'll show grouped commands in custom help text
    visibleCommands: () => [],
  })
  .addHelpText(
    'after',
    `
Lenses (How consumers see your page):
  ai                   Show how AI crawlers extract and see your content
  reader               Show how browser reader modes see your content
  google               Show how Googlebot sees your page (metadata, schema, structure)
  social               Show how social platforms see your page (Open Graph, Twitter Cards)
  screen-reader        Show how screen readers interpret your page

Analysis Tools:
  readability          Raw Readability extraction with full metrics
  readability:js       Readability extraction after JavaScript rendering
  readability:compare  Compare static vs JS-rendered content extraction
  schema               View structured data (JSON-LD, Microdata, Open Graph)
  schema:js            View structured data after JavaScript rendering
  structure            Show page structure (landmarks, headings, links)
  structure:js         Show structure after JavaScript rendering
  structure:compare    Compare static vs hydrated structure
  a11y-tree            Show accessibility tree from static HTML
  a11y-tree:js         Show accessibility tree after JavaScript rendering
  a11y-tree:compare    Compare static vs hydrated accessibility tree

Validation Tools:
  validate:html        Validate HTML markup against W3C standards
  validate:schema      Validate structured data against platform requirements
  validate:a11y        Validate accessibility against WCAG guidelines

Other:
  fetch                Fetch and prettify HTML from a URL
  tui                  Launch interactive terminal UI

Run 'semantic-kit <command> --help' for command-specific options.`,
  )

/**
 * Get global output mode options from program
 */
function getGlobalOptions(): OutputModeOptions {
  const opts = program.opts()
  return {
    plain: opts['plain'],
    ci: opts['ci'],
  }
}

/**
 * Wrap a command action to merge global options and handle errors
 */
function withGlobalOptions<T extends object>(
  action: (target: string, options: T & OutputModeOptions) => Promise<void>,
): (target: string, options: T) => Promise<void> {
  return async (target: string, options: T) => {
    const merged = { ...options, ...getGlobalOptions() }
    try {
      await action(target, merged)
    } catch (error) {
      handleCommandError(error)
    }
  }
}

program
  .command('validate:html')
  .description('Validate HTML markup against W3C standards and best practices')
  .argument('<target>', 'URL or file path to validate')
  .option('--config <path>', 'Path to html-validate config file')
  .option(
    '--format <type>',
    'Output format: full (default, with code context), brief (minimal), compact (grouped), json',
  )
  .action(withGlobalOptions(validateHtmlCommand))

program
  .command('fetch')
  .description('Fetch and prettify HTML from a URL for inspection')
  .argument('<target>', 'URL to fetch')
  .option('-o, --out <path>', 'Save to file instead of terminal')
  .option('--stream', 'Show in terminal even when saving to file')
  .action(withGlobalOptions(fetchCommand))

program
  .command('ai')
  .description(
    'Show how AI crawlers see your page (extracted content as markdown)',
  )
  .argument('<target>', 'URL or file path to analyze')
  .option('--raw', 'Show raw static HTML instead of extracted content')
  .option(
    '--format <type>',
    'Output format: full (default), compact (summary), json',
  )
  .action(withGlobalOptions(aiCommand))

program
  .command('reader')
  .description(
    'Show how browser reader modes see your page (Safari Reader, Pocket, etc.)',
  )
  .argument('<target>', 'URL or file path to analyze')
  .option(
    '--format <type>',
    'Output format: full (default), compact (summary), json',
  )
  .action(withGlobalOptions(readerCommand))

program
  .command('screen-reader')
  .description(
    'Show how screen readers interpret your page (accessibility tree analysis)',
  )
  .argument('<target>', 'URL to analyze')
  .option(
    '--format <type>',
    'Output format: full (default), compact (summary), json',
  )
  .option(
    '--timeout <ms>',
    'Timeout in milliseconds for page to load (default: 5000)',
  )
  .action(withGlobalOptions(screenReaderCommand))

program
  .command('google')
  .description(
    'Show how Googlebot sees your page (metadata, structured data, heading structure)',
  )
  .argument('<target>', 'URL or file path to analyze')
  .option(
    '--format <type>',
    'Output format: full (default), compact (summary), json',
  )
  .action(withGlobalOptions(googleCommand))

program
  .command('social')
  .description(
    'Show how social platforms see your page for link previews (Open Graph, Twitter Cards)',
  )
  .argument('<target>', 'URL or file path to analyze')
  .option(
    '--format <type>',
    'Output format: full (default), compact (summary), json',
  )
  .action(withGlobalOptions(socialCommand))

program
  .command('readability:compare')
  .description(
    'Compare Readability extraction between static and JS-rendered page',
  )
  .argument('<target>', 'URL to analyze')
  .option(
    '--format <type>',
    'Output format: full (default), compact (summary), json',
  )
  .option(
    '--timeout <ms>',
    'Timeout in milliseconds for page to load (default: 5000)',
  )
  .action(withGlobalOptions(readabilityCompareCommand))

program
  .command('readability')
  .description('Raw Readability extraction with full metrics (link density, etc.)')
  .argument('<target>', 'URL or file path to analyze')
  .option(
    '--format <type>',
    'Output format: full (default), compact (summary), json',
  )
  .action(withGlobalOptions(readabilityCommand))

program
  .command('readability:js')
  .description(
    'Readability extraction after JavaScript rendering (requires Playwright)',
  )
  .argument('<target>', 'URL to analyze')
  .option(
    '--format <type>',
    'Output format: full (default), compact (summary), json',
  )
  .option(
    '--timeout <ms>',
    'Timeout in milliseconds for page to load (default: 5000)',
  )
  .action(withGlobalOptions(readabilityJsCommand))

program
  .command('schema')
  .description(
    'View structured data (JSON-LD, Microdata, RDFa, Open Graph, Twitter Cards)',
  )
  .argument('<target>', 'URL or file path to inspect')
  .option(
    '--format <type>',
    'Output format: full (default), compact (summary), json',
  )
  .action(withGlobalOptions(schemaCommand))

program
  .command('schema:js')
  .description(
    'View structured data after JavaScript rendering (requires Playwright)',
  )
  .argument('<target>', 'URL to analyze')
  .option(
    '--format <type>',
    'Output format: full (default), compact (summary), json',
  )
  .option(
    '--timeout <ms>',
    'Timeout in milliseconds for page to load (default: 5000)',
  )
  .action(withGlobalOptions(schemaJsCommand))

program
  .command('validate:schema')
  .description('Validate structured data against platform requirements')
  .argument('<target>', 'URL or file path to validate')
  .option(
    '--presets <names>',
    'Validate against: google, twitter, facebook, social-media (comma-separated)',
  )
  .option(
    '--format <type>',
    'Output format: full (default), compact (summary), json',
  )
  .action(withGlobalOptions(validateSchemaCommand))

program
  .command('validate:a11y')
  .description('Validate accessibility against WCAG guidelines')
  .argument('<target>', 'URL to validate')
  .option('--level <level>', 'WCAG level: A, AA, AAA (default: AA)')
  .option(
    '--format <type>',
    'Output format: full (default), compact (summary), json',
  )
  .option(
    '--timeout <ms>',
    'Timeout in milliseconds for page to load (default: 5000)',
  )
  .option(
    '--ignore-incomplete',
    'Do not exit with error for incomplete checks (still displayed)',
  )
  .action(withGlobalOptions(validateA11yCommand))

program
  .command('structure')
  .description(
    'Show page structure: landmarks, headings, links, skip links, title, and language',
  )
  .argument('<target>', 'URL or file path to analyze')
  .option(
    '--format <type>',
    'Output format: full (default), brief (truncated), compact (summary), json',
  )
  .option(
    '--all-rules',
    'Run all JSDOM-safe accessibility rules (68 rules) instead of just structure rules (14 rules)',
  )
  .action(withGlobalOptions(structureCommand))

program
  .command('structure:js')
  .description(
    'Show page structure after JavaScript rendering (requires Playwright)',
  )
  .argument('<target>', 'URL to analyze')
  .option(
    '--format <type>',
    'Output format: full (default), brief (truncated), compact (summary), json',
  )
  .option(
    '--timeout <ms>',
    'Timeout in milliseconds for page to load (default: 5000)',
  )
  .option(
    '--all-rules',
    'Run all JSDOM-safe accessibility rules (68 rules) instead of just structure rules (14 rules)',
  )
  .action(withGlobalOptions(structureJsCommand))

program
  .command('structure:compare')
  .description(
    'Compare structural differences between static HTML and JavaScript-rendered page',
  )
  .argument('<target>', 'URL to analyze')
  .option(
    '--format <type>',
    'Output format: full (default), brief (truncated), compact (summary), json',
  )
  .option(
    '--timeout <ms>',
    'Timeout in milliseconds for page to load (default: 5000)',
  )
  .action(withGlobalOptions(structureCompareCommand))

program
  .command('a11y-tree')
  .description(
    'Show accessibility tree from static HTML (JavaScript disabled, requires Playwright)',
  )
  .argument('<target>', 'URL to analyze')
  .option('--format <type>', 'Output format: full (default), json')
  .option(
    '--timeout <ms>',
    'Timeout in milliseconds for page to load (default: 5000)',
  )
  .action(withGlobalOptions(a11yTreeCommand))

program
  .command('a11y-tree:js')
  .description(
    'Show accessibility tree after JavaScript rendering (requires Playwright)',
  )
  .argument('<target>', 'URL to analyze')
  .option('--format <type>', 'Output format: full (default), json')
  .option(
    '--timeout <ms>',
    'Timeout in milliseconds for page to load (default: 5000)',
  )
  .action(withGlobalOptions(a11yTreeJsCommand))

program
  .command('a11y-tree:compare')
  .description(
    'Compare accessibility tree differences between static and hydrated page',
  )
  .argument('<target>', 'URL to analyze')
  .option(
    '--format <type>',
    'Output format: full (default), compact (summary), json',
  )
  .option(
    '--timeout <ms>',
    'Timeout in milliseconds for page to load (default: 5000)',
  )
  .action(withGlobalOptions(a11yTreeCompareCommand))

program
  .command('tui')
  .description('Launch interactive terminal UI for exploring semantic data')
  .argument('[url]', 'URL to analyze on startup')
  .action(tuiCommand)

program.parse()

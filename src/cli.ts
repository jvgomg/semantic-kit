import { Command } from 'commander'
import {
  a11yCommand,
  a11yJsCommand,
  a11yCompareCommand,
} from './commands/a11y/index.js'
import { aiCommand } from './commands/ai/index.js'
import { botCommand } from './commands/bot/index.js'
import { fetchCommand } from './commands/fetch/index.js'
import { schemaCommand } from './commands/schema/index.js'
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
  .command('bot')
  .description('Compare static HTML vs JavaScript-rendered content')
  .argument('<target>', 'URL to analyze')
  .option('--content', 'Show extracted markdown content')
  .option(
    '--timeout <ms>',
    'Timeout in milliseconds for page to load (default: 5000)',
  )
  .option(
    '--format <type>',
    'Output format: full (default), compact (summary), json',
  )
  .action(withGlobalOptions(botCommand))

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
  .command('a11y')
  .description(
    'Show accessibility tree from static HTML (JavaScript disabled, requires Playwright)',
  )
  .argument('<target>', 'URL to analyze')
  .option('--format <type>', 'Output format: full (default), json')
  .option(
    '--timeout <ms>',
    'Timeout in milliseconds for page to load (default: 5000)',
  )
  .action(withGlobalOptions(a11yCommand))

program
  .command('a11y:js')
  .description(
    'Show accessibility tree after JavaScript rendering (requires Playwright)',
  )
  .argument('<target>', 'URL to analyze')
  .option('--format <type>', 'Output format: full (default), json')
  .option(
    '--timeout <ms>',
    'Timeout in milliseconds for page to load (default: 5000)',
  )
  .action(withGlobalOptions(a11yJsCommand))

program
  .command('a11y:compare')
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
  .action(withGlobalOptions(a11yCompareCommand))

program
  .command('tui')
  .description('Launch interactive terminal UI for exploring semantic data')
  .argument('[url]', 'URL to analyze on startup')
  .action(tuiCommand)

program.parse()

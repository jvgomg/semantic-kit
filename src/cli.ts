import { Command } from 'commander'
import { a11yCompareView } from './commands/a11y-compare.js'
import { a11yJsView } from './commands/a11y-js.js'
import { a11yView } from './commands/a11y.js'
import { aiCrawlerView } from './commands/ai.js'
import { botView } from './commands/bot.js'
import { fetchHtml } from './commands/fetch.js'
import { schemaView } from './commands/schema.js'
import { structureCompareView } from './commands/structure-compare.js'
import { structureJsView } from './commands/structure-js.js'
import { structureView } from './commands/structure.js'
import { tuiCommand } from './commands/tui.js'
import { validateA11y } from './commands/validate-a11y.js'
import { validateHtml } from './commands/validate-html.js'
import { validateSchema } from './commands/validate-schema.js'

const program = new Command()

program
  .name('semantic-kit')
  .description(
    'Developer toolkit for understanding how websites are interpreted by search engines, AI crawlers, screen readers, and content extractors',
  )
  .version('0.0.16')

program
  .command('validate:html')
  .description('Validate HTML markup against W3C standards and best practices')
  .argument('<target>', 'URL or file path to validate')
  .option('--config <path>', 'Path to html-validate config file')
  .option(
    '--format <type>',
    'Output format: full (default, with code context), brief (minimal), compact (grouped), json',
  )
  .action(validateHtml)

program
  .command('fetch')
  .description('Fetch and prettify HTML from a URL for inspection')
  .argument('<target>', 'URL to fetch')
  .option('-o, --out <path>', 'Save to file instead of terminal')
  .option('--stream', 'Show in terminal even when saving to file')
  .action(fetchHtml)

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
  .action(aiCrawlerView)

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
  .action(botView)

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
  .action(schemaView)

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
  .action(validateSchema)

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
  .action(validateA11y)

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
  .action(structureView)

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
  .action(structureJsView)

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
  .action(structureCompareView)

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
  .action(a11yView)

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
  .action(a11yJsView)

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
  .action(a11yCompareView)

program
  .command('tui')
  .description('Launch interactive terminal UI for exploring semantic data')
  .argument('[url]', 'URL to analyze on startup')
  .action(tuiCommand)

program.parse()

declare module 'structured-data-testing-tool' {
  export interface StructuredDataTestOptions {
    presets?: unknown[]
    schemas?: string[]
    tests?: unknown[]
    auto?: boolean
  }

  export interface StructuredDataTestResult {
    tests: unknown[]
    passed: unknown[]
    failed: unknown[]
    warnings: unknown[]
    optional: unknown[]
    skipped: unknown[]
    groups: string[]
    schemas: string[]
    structuredData: {
      metatags: Record<string, string[]>
      jsonld: Record<string, unknown[]>
      microdata: Record<string, unknown[]>
      rdfa: Record<string, unknown[]>
    }
  }

  export function structuredDataTest(
    input: string | Buffer,
    options?: StructuredDataTestOptions,
  ): Promise<StructuredDataTestResult>

  export function structuredDataTestUrl(
    url: string,
    options?: StructuredDataTestOptions,
  ): Promise<StructuredDataTestResult>

  export function structuredDataTestString(
    html: string,
    options?: StructuredDataTestOptions,
  ): Promise<StructuredDataTestResult>

  export function structuredDataTestHtml(
    html: string,
    options?: StructuredDataTestOptions,
  ): Promise<StructuredDataTestResult>
}

declare module 'structured-data-testing-tool/presets' {
  export interface Preset {
    name: string
    description?: string
    presets?: Preset[]
    tests?: unknown[]
  }

  export const Google: Preset
  export const Twitter: Preset
  export const Facebook: Preset
  export const SocialMedia: Preset
}

declare module 'web-auto-extractor' {
  interface ExtractedData {
    metatags: Record<string, string[]>
    jsonld: Record<string, unknown[]>
    microdata: Record<string, unknown[]>
    rdfa: Record<string, unknown[]>
  }

  interface Extractor {
    parse(html: string): ExtractedData
  }

  function WAE(): Extractor
  export default WAE
}

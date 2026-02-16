/**
 * File system utilities with build-time target switching.
 *
 * Uses Bun APIs when __TARGET_BUN__ is true, node:fs otherwise.
 * The bundler eliminates dead code branches, so:
 * - npm package contains zero Bun.* references
 * - Binary build contains zero node:fs imports for file operations
 */
import { access, readFile, writeFile, mkdir } from 'node:fs/promises'

declare const __TARGET_BUN__: boolean

/**
 * Check if a file exists at the given path.
 */
export async function fileExists(path: string): Promise<boolean> {
  if (__TARGET_BUN__) {
    return Bun.file(path).exists()
  }
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

/**
 * Read a file as text.
 */
export async function readTextFile(path: string): Promise<string> {
  if (__TARGET_BUN__) {
    return Bun.file(path).text()
  }
  return readFile(path, 'utf-8')
}

/**
 * Read and parse a JSON file.
 */
export async function readJsonFile<T>(path: string): Promise<T> {
  if (__TARGET_BUN__) {
    return Bun.file(path).json() as Promise<T>
  }
  const content = await readFile(path, 'utf-8')
  return JSON.parse(content) as T
}

/**
 * Write text content to a file.
 */
export async function writeTextFile(path: string, content: string): Promise<void> {
  if (__TARGET_BUN__) {
    await Bun.write(path, content)
    return
  }
  await writeFile(path, content, 'utf-8')
}

export { mkdir }

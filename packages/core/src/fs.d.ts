/**
 * File system utilities with build-time target switching.
 *
 * Uses Bun APIs when __TARGET_BUN__ is true, node:fs otherwise.
 * The bundler eliminates dead code branches, so:
 * - npm package contains zero Bun.* references
 * - Binary build contains zero node:fs imports for file operations
 */
import { mkdir } from 'node:fs/promises';
/**
 * Check if a file exists at the given path.
 */
export declare function fileExists(path: string): Promise<boolean>;
/**
 * Read a file as text.
 */
export declare function readTextFile(path: string): Promise<string>;
/**
 * Read and parse a JSON file.
 */
export declare function readJsonFile<T>(path: string): Promise<T>;
/**
 * Write text content to a file.
 */
export declare function writeTextFile(path: string, content: string): Promise<void>;
export { mkdir };
//# sourceMappingURL=fs.d.ts.map
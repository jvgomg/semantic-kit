import { homedir } from 'os'
import path from 'path'
import { fileExists, readTextFile } from '@webspecs/core'

const APP_NAME = 'semantic-kit'

/**
 * XDG Base Directory paths
 * https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
 */
export function getConfigPaths() {
  const home = homedir()

  // XDG defaults
  const xdgConfigHome = process.env['XDG_CONFIG_HOME'] || path.join(home, '.config')
  const xdgDataHome = process.env['XDG_DATA_HOME'] || path.join(home, '.local', 'share')
  const xdgCacheHome = process.env['XDG_CACHE_HOME'] || path.join(home, '.cache')

  return {
    // Config: ~/.config/semantic-kit/
    config: path.join(xdgConfigHome, APP_NAME),
    // Data: ~/.local/share/semantic-kit/
    data: path.join(xdgDataHome, APP_NAME),
    // Cache: ~/.cache/semantic-kit/
    cache: path.join(xdgCacheHome, APP_NAME),
  }
}

/**
 * Find config file, checking local directory first, then XDG config home
 */
export async function findConfig(filename: string): Promise<string | null> {
  const localPath = path.join(process.cwd(), `.${APP_NAME}`, filename)
  const xdgPath = path.join(getConfigPaths().config, filename)

  // Check local directory first
  if (await fileExists(localPath)) {
    return localPath
  }

  // Fall back to XDG config home
  if (await fileExists(xdgPath)) {
    return xdgPath
  }

  return null
}

/**
 * Load config, merging local over XDG defaults
 */
export async function loadConfig<T>(filename: string): Promise<T | null> {
  const configPath = await findConfig(filename)
  if (!configPath) return null

  const content = await readTextFile(configPath)
  return JSON.parse(content) as T
}

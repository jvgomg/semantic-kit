/**
 * Reverse proxy for mounted apps
 */

export interface ProxyConfig {
  targetHost: string
  targetPort: number
  stripPrefix?: string
  verbose?: boolean
}

/**
 * Proxy a request to a target server
 */
export async function proxyRequest(
  request: Request,
  config: ProxyConfig,
): Promise<Response> {
  const { targetHost, targetPort, stripPrefix, verbose } = config
  const url = new URL(request.url)

  // Strip the mount prefix from the path
  let path = url.pathname
  if (stripPrefix && path.startsWith(stripPrefix)) {
    path = path.slice(stripPrefix.length) || '/'
  }

  // Build target URL
  const targetUrl = new URL(path, `http://${targetHost}:${targetPort}`)
  targetUrl.search = url.search

  if (verbose) {
    console.log(`[proxy] ${url.pathname} -> ${targetUrl.toString()}`)
  }

  // Clone headers, removing hop-by-hop headers
  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('connection')
  headers.delete('keep-alive')
  headers.delete('transfer-encoding')
  headers.delete('upgrade')

  // Forward the request
  const proxyRequest = new Request(targetUrl.toString(), {
    method: request.method,
    headers,
    body: request.body,
    redirect: 'manual',
  })

  try {
    const response = await fetch(proxyRequest)

    // Clone response headers, removing hop-by-hop headers
    const responseHeaders = new Headers(response.headers)
    responseHeaders.delete('transfer-encoding')
    responseHeaders.delete('connection')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error(`[proxy] Error proxying to ${targetUrl}:`, error)
    return new Response('Bad Gateway', { status: 502 })
  }
}

/**
 * Check if a path matches a mount prefix
 */
export function matchesMount(path: string, mountPath: string): boolean {
  if (path === mountPath) return true
  if (path.startsWith(mountPath + '/')) return true
  return false
}

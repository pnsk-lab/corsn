/**
 * CORSN Client
 * @module
 */

import { parseProxyResponse } from './utils.ts'

/**
 * Create fetch
 */
export const createFetch = (proxy: string | URL): typeof fetch => {
  const proxyUrl = new URL(proxy)

  return async (input, init) => {
    const req = new Request(input, init)

    const urlForFetch = new URL(proxyUrl.href)
    urlForFetch.searchParams.append('url', req.url)
    urlForFetch.searchParams.append('method', req.method)
    urlForFetch.searchParams.append('redirect', req.redirect)

    const headersForFetch = new Headers()
    for (const [k, v] of req.headers) {
      headersForFetch.append(`corsn-${k}`, v)
    }

    const fetched = await fetch(urlForFetch, {
      method: 'POST',
      body: req.body,
      headers: headersForFetch,
    })
    if (!fetched.body) {
      throw new Error('body is null')
    }

    const { info, body } = await parseProxyResponse(fetched.body)

    return new Response(body, {
      headers: info.headers,
      status: info.status,
      statusText: info.statusText,
    })
  }
}

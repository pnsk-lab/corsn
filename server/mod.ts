/**
 * Server handler.
 * @module
 */

import type { ResponseInfo } from '../shared/types.ts'

const makeProxyRequest = (rawReq: Request) => {
  const rawURL = new URL(rawReq.url)

  const proxyMethod = rawURL.searchParams.get('method') ?? 'GET'
  const proxyUrlString = rawURL.searchParams.get('url')
  const proxyRedirect: RequestRedirect =
    rawURL.searchParams.get('redirect') === 'manual' ? 'manual' : 'follow'

  if (!proxyUrlString || !URL.canParse(proxyUrlString)) {
    return null
  }
  const proxyUrl = new URL(proxyUrlString)
  if (proxyUrl.protocol !== 'http:' && proxyUrl.protocol !== 'https:') {
    return null
  }
  const proxyBody = (proxyMethod !== 'GET' && proxyMethod !== 'HEAD')
    ? rawReq.body
    : null

  const proxyHeaders = new Headers()
  for (const [k, v] of rawReq.headers) {
    if (k.startsWith('corsn-')) {
      proxyHeaders.append(k.slice(6), v)
    }
  }

  return new Request(proxyUrl, {
    body: proxyBody,
    headers: proxyHeaders,
    method: proxyMethod,
    redirect: proxyRedirect,
  })
}
const encoder = new TextEncoder()

const makeResponseFromProxyRes = (proxyRes: Response) => {
  const responseInfo: ResponseInfo = {
    headers: [...proxyRes.headers.entries()],
    status: proxyRes.status,
    statusText: proxyRes.statusText,
  }
  const responseInfoJSON = JSON.stringify(responseInfo)

  const resBody = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode(`${responseInfoJSON}\n`))
      if (!proxyRes.body) {
        controller.close()
        return
      }

      for await (const chunk of proxyRes.body) {
        controller.enqueue(chunk)
      }
      controller.close()
    },
  })

  return new Response(resBody, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  })
}

/**
 * fetch-like interface handler
 * @example
 * ```ts
 * import { handler } from '@pnsk-lab/corsn/hander'
 *
 * Deno.serve(handler)
 * Bun.serve({ fetch: handler })
 * ```
 */
export const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'POST') {
    const proxyReq = makeProxyRequest(req)
    if (!proxyReq) {
      return Response.json('Bad Request', {
        status: 400,
      })
    }
    const proxyRes = await fetch(proxyReq)

    return makeResponseFromProxyRes(proxyRes)
  }
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Allow': 'OPTIONS, POST',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST',
        'Access-Control-Allow-Headers': '*',
      },
    })
  }
  return Response.json('Bad request', {
    status: 400,
  })
}

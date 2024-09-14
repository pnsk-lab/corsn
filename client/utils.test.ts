import { parseProxyResponse } from './utils.ts'
import { assertEquals } from '@std/assert'

Deno.test('parseProxyResponse', async () => {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode('{ "status": 200, "statusText": "ok",'))
      controller.enqueue(encoder.encode(' "headers": {} }\nh'))
      controller.enqueue(encoder.encode('ello'))
      controller.enqueue(encoder.encode(' world'))
      controller.close()
    },
  })
  const { json, body } = await parseProxyResponse(stream)
  assertEquals(json, { status: 200, statusText: 'ok', headers: {} })
  assertEquals(await new Response(body).text(), 'hello world')
})

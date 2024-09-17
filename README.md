# CORSN

Useful CORS proxy.

## Features

- Bypass CORS
- Use custom header like `User-Agent` and `Cookie`
- Status Codes
- Supported any methods
- Tiny (minified ~1KB) client

## Installing

```shell
deno add @pnsk-lab/corsn
bunx jsr add @pnsk-lan/corsn
pnpm dlx jsr add @pnsk-lab/corsn
yarn dlx jsr add @pnsk-lab/corsn
npx jsr add @pnsk-lab/corsn
```

Or, you can simply use it on [esm.sh](https://esm.sh)

```html
<script type="module">
  import { createFetch } from 'https://esm.sh/jsr/@pnsk-lab/corsn'
  // ...
</script>
```

## Client

```ts
import { createFetch } from '@pnsk-lab/corsn'

const proxyFetch = createFetch('https://corsn.example.com') // or custom server

await proxyFetch('https://example.com') // same as `fetch`
```

## Server

If you use Deno:

```shell
PORT=1234 deno run -NE jsr:@pnsk-lab/corsn/server/deno
```

Also you can use fetch-like handlers

```ts
import { handler } from '@pnsk-lab/corsn/server'

Bun.serve({ fetch: handler }) // Bun

export default {
  fetch: handler,
} // Cloudflare Workers
```

If you want to use Node.js, you can use
[`@hono/node-server`](https://github.com/honojs/node-server)

```ts
import { serve } from '@hono/node-server'
import { handler } from '@pnsk-lab/corsn/server'

serve({
  fetch: handler,
})
```

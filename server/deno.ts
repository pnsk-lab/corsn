/**
 * Serve for Deno.
 * @module
 */
import { handler } from './mod.ts'

Deno.serve({
  port: Number.parseInt(Deno.env.get('PORT') ?? '8000'),
}, handler)

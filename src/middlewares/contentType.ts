import { oak } from '../deps.ts'

export async function validateContentType(ctx: oak.Context, next: () => Promise<unknown>){
  ctx.assert(ctx.request.headers.get("Content-Type") === "application/json", 400)
  await next()
}

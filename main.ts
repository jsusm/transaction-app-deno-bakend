import "https://deno.land/std@0.177.0/dotenv/load.ts";
import logger from "https://deno.land/x/oak_logger@1.0.0/mod.ts";
import { oak, zod, postgres } from "./deps.ts";
import authRouter from "./auth/auth.router.ts";
import { Session, RedisStore } from "https://deno.land/x/oak_sessions@v4.1.0/mod.ts";
import { redis } from './redis/index.ts'

export type AppState = {
  session: Session,
}

const app = new oak.Application<AppState>();

app.use(logger.logger);
app.use(logger.responseTime);

const redisStore = new RedisStore(redis)
app.use(Session.initMiddleware(redisStore))

function formatZodError(err: zod.ZodError): string{
  const out = err.errors.map((e) =>
    `${e.message} at ${e.path.join(".")}`
  ).join("; ");
  return out
}

// Error handler
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (oak.isHttpError(err)) {
      ctx.response.status = err.status;
    } else if (err instanceof zod.ZodError) {
      ctx.response.status = 400;
      ctx.response.body = { error: formatZodError(err) };
      ctx.response.type = "json";
      return;
    } else if (err instanceof postgres.PostgresError) {
      let errorMessage = "Bad request"
      ctx.response.status = 400
      if(err.fields.code === "23505") {
        errorMessage = err.fields.detail || ''
        ctx.response.status = 409
      }
      ctx.response.body = { error: errorMessage};
      ctx.response.type = "json";
      return
    } else {
      console.log({err})
      ctx.response.status = 500;
    }
    ctx.response.body = { error: err.message };
    ctx.response.type = "json";
  }
});

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

console.log("App listen on port 8080");
app.listen({ port: 8080 });

import "https://deno.land/std@0.177.0/dotenv/load.ts";
import logger from "https://deno.land/x/oak_logger@1.0.0/mod.ts";
import {
  RedisStore,
  Session,
} from "https://deno.land/x/oak_sessions@v4.1.0/mod.ts";
import { oak } from "./deps.ts";
import authRouter from "./auth/auth.router.ts";
import { redis } from "./redis/index.ts";
import {
  DefaultErrorHandler,
  ErrorMiddleware,
} from "./middlewares/errorMiddleware.ts";
import { ZodErrorMiddleware } from "./middlewares/zodErrorMiddleware.ts";

export type AppState = {
  session: Session;
};

const app = new oak.Application<AppState>();

app.use(logger.logger);
app.use(logger.responseTime);

const redisStore = new RedisStore(redis);
app.use(Session.initMiddleware(redisStore));

// Error handler
const errorMiddleware = new ErrorMiddleware()
  .registerErrorHandler(new DefaultErrorHandler())
  .registerErrorHandler(new ZodErrorMiddleware());

app.use(errorMiddleware.middleware);

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

console.log("App listen on port 8080");
app.listen({ port: 8080 });

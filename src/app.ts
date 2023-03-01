import logger from "https://deno.land/x/oak_logger@1.0.0/mod.ts";
import {
  RedisStore,
  Session,
} from "https://deno.land/x/oak_sessions@v4.1.0/mod.ts";
import { oak } from "./deps.ts";
import { redis } from "./redis/index.ts";
import {
  DefaultErrorHandler,
  ErrorMiddleware,
} from "./middlewares/errorMiddleware.ts";
import { ZodErrorMiddleware } from "./middlewares/zodErrorMiddleware.ts";
import routes from "./routes.ts";

export type AppState = {
  session: Session;
  userId?: number;
};

export function bootstrapApp() {
  const app = new oak.Application<AppState>();
  const redisStore = new RedisStore(redis);

  app.use(logger.logger);
  app.use(logger.responseTime);
  app.use(Session.initMiddleware(redisStore));

  // Error handler
  const errorMiddleware = new ErrorMiddleware()
    .registerErrorHandler(new DefaultErrorHandler())
    .registerErrorHandler(new ZodErrorMiddleware());

  app.use(errorMiddleware.middleware);

  app.use(routes.routes());
  app.use(routes.allowedMethods());
  return app
}

export function testApp(){
  const app = new oak.Application<AppState>();
  // use in memory session data
  app.use(Session.initMiddleware())

  const errorMiddleware = new ErrorMiddleware()
    .registerErrorHandler(new DefaultErrorHandler())
    .registerErrorHandler(new ZodErrorMiddleware());

  app.use(errorMiddleware.middleware);
  app.use(routes.routes);
  return app
}

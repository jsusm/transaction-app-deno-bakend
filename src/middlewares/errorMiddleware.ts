import { oak } from "../deps.ts";

export interface ErrorHandler<ErrorType> {
  ownError(error: Error): ErrorType | undefined;
  handleError(ctx: oak.Context, error: ErrorType): void;
}

class ErrorMiddleware {
  private handlers: ErrorHandler<Error>[] = [];
  /**
   * Register a error handler
   * It register as a stack (LIFO)
   * Content type will be set to json
   */
  registerErrorHandler(handler: ErrorHandler<Error>) {
    this.handlers.unshift(handler);
    return this;
  }
  middleware: oak.Middleware = async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      ctx.response.type = "json";
      for (const handler of this.handlers) {
        const handlerError = handler.ownError(error);
        if (handlerError) {
          handler.handleError(ctx, handlerError);
          return;
        }
      }
    }
  };
}

/**
 * Implementation of ErrorHandler
 */
export class DefaultErrorHandler implements ErrorHandler<Error> {
  ownError(error: Error): Error | undefined {
    return error;
  }
  handleError(ctx: oak.Context, error: Error): void {
    if (oak.isHttpError(error)) {
      ctx.response.status = error.status;
    }
    ctx.response.body = { error: error.message };
  }
}

export const errorMiddleware = new ErrorMiddleware();

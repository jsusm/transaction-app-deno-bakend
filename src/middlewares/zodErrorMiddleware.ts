import { ErrorHandler } from "./errorMiddleware.ts";
import { oak, zod } from "../deps.ts";

export class ZodErrorMiddleware implements ErrorHandler<zod.ZodError> {
  formatError(error: zod.ZodError) {
    const out = error.errors
      .map((e) => `${e.message} at ${e.path.join(".")}`).join("; ");
    return out;
  }
  ownError(error: Error): zod.ZodError | undefined {
    if (error instanceof zod.ZodError) {
      return error;
    }
    return;
  }
  handleError(ctx: oak.Context, error: zod.ZodError): void {
    ctx.response.status = 400
    ctx.response.body = { error: this.formatError(error) }
  }
}

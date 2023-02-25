import { oak, postgres } from "../deps.ts";
import { ErrorHandler } from "./errorMiddleware.ts";

export class PostgresErrorMiddleware implements ErrorHandler<postgres.PostgresError> {
  ownError(error: Error): postgres.PostgresError | undefined {
    if (error instanceof postgres.PostgresError) {
      return error;
    }
  }
  handleError(ctx: oak.Context, error: postgres.PostgresError): void {
    ctx.response.status = 500;

    let errorMessage = "Bad request";
    if (error.fields.code === "23505") {
      errorMessage = error.fields.detail || "";
      ctx.response.status = 409;
    }
    ctx.response.body = { error: errorMessage };
  }
}

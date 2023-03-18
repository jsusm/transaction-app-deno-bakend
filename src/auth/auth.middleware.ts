import { AppState } from "../app.ts";
import { oak } from "../deps.ts";

export const isAuthenticated: oak.Middleware<AppState> = async (ctx, next) => {
  const userId = ctx.state.session.get("userId");
  if (!userId || typeof userId !== "number") {
    ctx.response.status = 401;
    return;
  }
  ctx.state.userId = userId;
  await next();
};

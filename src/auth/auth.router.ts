import { bcrypt, oak, postgres } from "../deps.ts";
import { signinSchema, signupSchema } from "./auth.schema.ts";
import { UserPostgresRepository } from "./user.postgres.ts";
import { AppState } from "../app.ts";
import { validateContentType } from "../middlewares/contentType.ts";
import {
  ErrorHandler,
  ErrorMiddleware,
} from "../middlewares/errorMiddleware.ts";

class AuthPostgresErrorHandler implements ErrorHandler<postgres.PostgresError> {
  ownError(error: Error): postgres.PostgresError | undefined {
    if (error instanceof postgres.PostgresError) {
      if (error.fields.code == "23505") return error;
    }
  }
  handleError(ctx: oak.Context, _error: postgres.PostgresError): void {
    ctx.response.status = oak.Status.Conflict;
    ctx.response.body = { error: "Email is already in use" };
  }
}

const router = new oak.Router<AppState>({
  prefix: "/auth",
});

const userRepository = new UserPostgresRepository();

router
  .post(
    "/signup",
    new ErrorMiddleware()
      .registerErrorHandler(new AuthPostgresErrorHandler())
      .middleware,
    validateContentType,
    async (ctx: oak.Context<AppState>) => {
      const body = ctx.request.body({ type: "json" });
      const data = signupSchema.parse(await body.value);
      // encrypt password
      const hashedPassword = await bcrypt.hash(data.password);

      const user = await userRepository.createUser({
        ...data,
        password: hashedPassword,
      });
      ctx.state.session.set("userId", user.id);

      const { password: _, ...res } = user;
      ctx.response.body = res;
      ctx.response.status = 201;
    },
  )
  .post("/signin", validateContentType, async (ctx: oak.Context<AppState>) => {
    const body = ctx.request.body({ type: "json" });
    const data = signinSchema.parse(await body.value);

    const user = await userRepository.findUnique({ email: data.email });
    ctx.assert(user, 400, "User and password don't match");

    const matchPassword = await bcrypt.compare(data.password, user.password);
    ctx.assert(matchPassword, 400, "User and password don't match");

    ctx.state.session.set("userId", user.id);
    const { password: _, ...res } = user;
    ctx.response.body = res;
  })
  .post("/logout", async (ctx: oak.Context<AppState>) => {
    await ctx.state.session.deleteSession();
    ctx.response.status = 200;
  })
  .get("/state", async (ctx: oak.Context<AppState>) => {
    if(!ctx.state.userId) ctx.throw(401)
    const user = await userRepository.findUnique({ id: ctx.state.userId })
    if(!user) {
      ctx.throw(401)
    }
    ctx.response.body = user
  });

export default router;

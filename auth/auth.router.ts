import { oak, bcrypt } from "../deps.ts";
import { createUserSchema } from './user.schema.ts'
import { UserPostgresRepository } from './user.postgres.ts'
import { AppState } from "../main.ts";

const router = new oak.Router<AppState>({
  prefix: "/auth"
})

const userRepository = new UserPostgresRepository()

router
  .post('/signup', async (ctx: oak.Context<AppState>) => {
    ctx.assert(ctx.request.headers.get("Content-Type") === "application/json", 400)
    const body = ctx.request.body({ type: "json" })
    const data = createUserSchema.parse(await body.value)
    // encrypt password
    const hashedPassword = await bcrypt.hash(data.password)

    const user = await userRepository.createUser({...data, password: hashedPassword})
    ctx.state.session.set("userId", user.id.toString())

    const { password: _, ...res } = user
    ctx.response.body = res
  })
  .get('/protected', (ctx: oak.Context<AppState>) => {
    ctx.assert(ctx.state.session.get("userId") !== undefined, oak.Status.Unauthorized)
    ctx.response.body = "You are login your userId is: " + ctx.state.session.get("userId")
  })


export default router

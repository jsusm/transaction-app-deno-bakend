import { oak, bcrypt } from "../deps.ts";
import { signinSchema, signupSchema } from './auth.schema.ts'
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
    const data = signupSchema.parse(await body.value)
    // encrypt password
    const hashedPassword = await bcrypt.hash(data.password)

    const user = await userRepository.createUser({...data, password: hashedPassword})
    ctx.state.session.set("userId", user.id)

    const { password: _, ...res } = user
    ctx.response.body = res
  })
  .post('/signin', async (ctx: oak.Context<AppState>) => {
    ctx.assert(ctx.request.headers.get("Content-Type") === "application/json", 400)
    const body = ctx.request.body({type:'json'})
    const data = signinSchema.parse(await body.value)
    const user = await userRepository.findUnique({ email: data.email })
    if(!user){
      ctx.response.status = 400
      ctx.response.body = {error: "Email or password do not match."}
      return
    }
    const matchPassword = await bcrypt.compare(data.password, user.password)
    if(!matchPassword) {
      ctx.response.status = 400
      ctx.response.body = {erro: "Email or password do not match."}
      return
    }
    ctx.state.session.set("userId", user.id)
    const { password: _, ...res } = user
    ctx.response.body = res
  })


export default router

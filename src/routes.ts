import { oak } from "./deps.ts";
import authRouter from './auth/auth.router.ts'
import categoryRouter from './categories/category.router.ts'

const router = new oak.Router()

router.use(authRouter.routes())
router.use(authRouter.allowedMethods())

router.use(categoryRouter.routes())
router.use(categoryRouter.allowedMethods())

export default router

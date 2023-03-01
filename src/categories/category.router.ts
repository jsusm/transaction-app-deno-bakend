import { oak } from "../deps.ts";
import {} from "https://deno.land/x/oak@v11.1.0/helpers.ts";
import { isAuthenticated } from "../auth/auth.middleware.ts";
import { CategoryPostgresRepository } from "./category.postgres.ts";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.model.ts";

const categoryRepository = new CategoryPostgresRepository();

const router = new oak.Router({
  prefix: "/categories",
});

function assert(condition: boolean, status: number, message?: string) {
  if (condition) {
    throw oak.createHttpError(status, message);
  }
}

// protect router operations
router.use(isAuthenticated);

router.get("/", isAuthenticated, async (ctx) => {
  if (!ctx.state.userId) throw ctx.throw(409);
  ctx.response.body = await categoryRepository.find({
    userId: ctx.state.userId,
  });
});

router.get("/:id", isAuthenticated, async (ctx) => {
  assert(!ctx.state.userId, oak.Status.Unauthorized);

  const category = await categoryRepository.findOne(parseInt(ctx.params.id));
  assert(
    !category,
    oak.Status.NotFound,
    `Category with id ${ctx.params.id} does not exits`,
  );

  ctx.response.body = category;
});
router.post("/", isAuthenticated, async (ctx) => {
  assert(!ctx.state.userId, oak.Status.Unauthorized);
  const data = createCategorySchema.parse(
    await ctx.request.body({ type: "json" }).value,
  );
  const category = await categoryRepository.create(data, ctx.state.userId || 0);
  ctx.response.body = category;
  ctx.response.status = oak.Status.Created;
});
router.patch("/:id", isAuthenticated, async (ctx) => {
  assert(!ctx.state.userId, oak.Status.Unauthorized);
  const data = updateCategorySchema.parse(
    await ctx.request.body({ type: "json" }).value,
  );

  const category = await categoryRepository.update(data, {
    id: parseInt(ctx.params.id),
    userId: ctx.state.userId || 0,
  });

  ctx.response.body = category;
  ctx.response.status = oak.Status.OK;
});

router.delete("/:id", isAuthenticated, async (ctx) => {
  assert(!ctx.state.userId, oak.Status.Unauthorized);
  await categoryRepository.deleteOne({
    id: parseInt(ctx.params.id),
    userId: ctx.state.userId || 0,
  });

  ctx.response.status = oak.Status.OK;
});

export default router;

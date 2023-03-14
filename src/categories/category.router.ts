import { oak } from "../deps.ts";
import {} from "https://deno.land/x/oak@v11.1.0/helpers.ts";
import { isAuthenticated } from "../auth/auth.middleware.ts";
import { CategoryPostgresRepository } from "./category.postgres.ts";
import {
  createCategorySchema,
  paginationParams,
  updateCategorySchema,
} from "./category.model.ts";
import { TransactionPostgresRepository } from "../transactions/transaction.postgres.ts";

const categoryRepository = new CategoryPostgresRepository();
const transactionRepository = new TransactionPostgresRepository();

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

  const params = paginationParams.parse({
    limit: ctx.request.url.searchParams.get("limit") || undefined,
    offset: ctx.request.url.searchParams.get("offset") || undefined,
  });

  ctx.response.body = await categoryRepository.find({
    userId: ctx.state.userId,
    ...params,
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

router.get("/:id/transactions", isAuthenticated, async (ctx) => {
  const params = paginationParams.parse({
    limit: ctx.request.url.searchParams.get("limit") || undefined,
    offset: ctx.request.url.searchParams.get("offset") || undefined,
  });

  const transactions = await transactionRepository.find({
    categoryId: parseInt(ctx.params.id),
  }, { ...params });
  const total = await transactionRepository.getTotal({
    categoryId: parseInt(ctx.params.id),
  });
  ctx.response.body = { transactions, total };
});

router.post("/", isAuthenticated, async (ctx) => {
  assert(!ctx.state.userId, oak.Status.Unauthorized);
  const body = await ctx.request.body({ type: "json" }).value;
  console.log(body);
  const data = createCategorySchema.parse(
    body,
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

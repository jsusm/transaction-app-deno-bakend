import { isAuthenticated } from "../auth/auth.middleware.ts";
import { oak } from "../deps.ts";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "./transaction.model.ts";
import { TransactionPostgresRepository } from "./transaction.postgres.ts";

const transactionRepository = new TransactionPostgresRepository();

const router = new oak.Router({
  prefix: "/transactions",
});

router.post("/", isAuthenticated, async (ctx) => {
  const body = createTransactionSchema.parse(
    await ctx.request.body({ type: "json" }).value,
  );
  const transaction = await transactionRepository.create(body);

  ctx.response.body = transaction;
  ctx.response.status = oak.Status.Created;
});

router.patch("/:id", isAuthenticated, async (ctx) => {
  const body = updateTransactionSchema.parse(
    await ctx.request.body({ type: "json" }).value,
  );
  const transaction = await transactionRepository.update(
    body,
    parseInt(ctx.params.id),
  );

  ctx.response.body = transaction;
  ctx.response.status = oak.Status.OK;
});

router.delete("/:id", isAuthenticated, async (ctx) => {
  await transactionRepository.deleteOne(parseInt(ctx.params.id));
  ctx.response.status = oak.Status.OK;
});

export default router;

import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";

export interface Transaction {
  id: number;
  ammount: number;
  categoryId: number;
  createAt: Date;
}

export const createTransactionSchema = z.object({
  ammount: z.number(),
  categoryId: z.number(),
});

export const updateTransactionSchema = createTransactionSchema.omit({
  categoryId: true,
}).partial();

export interface TransactionRepository {
  create(
    data: z.infer<typeof createTransactionSchema>,
    userId: number,
  ): Promise<Transaction>;

  update(
    data: z.infer<typeof updateTransactionSchema>,
    id: number,
  ): Promise<Transaction>;

  deleteOne(id: number): Promise<void>;

  findOne(id: number): Promise<Transaction | undefined>;

  find(where: { categoryId: number }): Promise<Transaction[]>;
}

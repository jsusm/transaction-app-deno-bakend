import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";

export type Category = {
  id: number;
  name: string;
  userId: number;
};

export const createCategorySchema = z.object({
  name: z.string().min(2).max(30),
});

export const updateCategorySchema = createCategorySchema.partial();

export interface CategoryRepository {
  create(
    data: z.infer<typeof createCategorySchema>,
    userId: number,
  ): Promise<Category>;

  update(
    data: z.infer<typeof updateCategorySchema>,
    where: { userId: number; id: number },
  ): Promise<Category | undefined>;

  deleteOne(where: { userId: number; id: number }): Promise<void>;

  findOne(id: number): Promise<Category | undefined>;

  find(where: { userId: number }): Promise<Category[]>;
}

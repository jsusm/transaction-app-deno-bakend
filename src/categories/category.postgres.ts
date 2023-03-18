import { runQuery } from "../postgres/db.ts";
import { Category, CategoryRepository } from "./category.model.ts";
import { makeKeyPairSet } from "../lib/query.ts";

export class CategoryPostgresRepository implements CategoryRepository {
  async create(data: { name: string }, userId: number): Promise<Category> {
    const res = await runQuery<Category>({
      camelcase: true,
      text:
        `INSERT INTO "categories" (name, user_id) VALUES ($name, $userId) RETURNING id, name, user_id`,
      args: { ...data, userId },
    });
    return res.rows[0];
  }

  async findOne(id: number): Promise<Category | undefined> {
    const res = await runQuery<Category>({
      camelcase: true,
      text: `SELECT id, name, user_id FROM "categories" WHERE id=$id`,
      args: { id },
    });
    return res.rows[0];
  }
  async find(where: { userId: number, limit?: number, offset?: number }): Promise<Category[]> {
    const limitClause = where.limit ? "LIMIT $limit" : ""
    const offsetClause = where.limit ? "OFFSET $offset" : ""
    const res = await runQuery<Category>({
      camelcase: true,
      text: `SELECT id, name, user_id FROM "categories" WHERE user_id=$userId ${limitClause} ${offsetClause}`,
      args: where,
    });
    return res.rows;
  }

  async update(
    data: { name?: string },
    where: { userId: number; id: number },
  ): Promise<Category | undefined> {
    const paramsToUpdate = makeKeyPairSet(data, { snakeCase: true });
    const condition = makeKeyPairSet(where, {
      snakeCase: true,
      separator: " AND ",
    });

    const res = await runQuery<Category>({
      text:
        `UPDATE "categories" SET ${paramsToUpdate} WHERE ${condition} RETURNING *`,
      args: { ...data, ...where },
      camelcase: true,
    });
    return res.rows[0];
  }
  async deleteOne(where: { userId: number; id: number; }): Promise<void> {
    const condition = makeKeyPairSet(where, {
      snakeCase: true,
      separator: " AND ",
    });
    await runQuery({
      text: `DELETE FROM "categories" WHERE ${condition}`,
      args: where
    })
  }
}

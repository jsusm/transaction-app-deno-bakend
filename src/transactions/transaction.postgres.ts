import { Transaction, TransactionRepository } from "./transaction.model.ts";
import { runQuery } from "../postgres/db.ts";
import { makeKeyPairSet } from "../lib/query.ts";

export class TransactionPostgresRepository implements TransactionRepository {
  async findOne(id: number): Promise<Transaction | undefined> {
    const res = await runQuery<Transaction>({
      camelcase: true,
      text: `SELECT * FROM "transactions" WHERE id=$id LIMIT 1`,
      args: { id },
    });
    return res.rows[0];
  }

  async find(
    where: { categoryId: number },
    params: { limit?: number; offset?: number } = {},
  ): Promise<Transaction[]> {
    const condition = makeKeyPairSet(where, {
      snakeCase: true,
      separator: " AND ",
    });

    const limitClause = params.limit !== undefined ? "LIMIT $limit" : "";
    const offsetClause = params.offset !== undefined ? "OFFSET $offset" : "";

    const res = await runQuery<Transaction>({
      camelcase: true,
      text:
        `SELECT * FROM "transactions" WHERE ${condition} ORDER BY created_at DESC ${limitClause} ${offsetClause}`,
      args: { ...where, ...params },
    });
    return res.rows;
  }

  async create(
    data: { ammount: number; categoryId: number },
  ): Promise<Transaction> {
    const res = await runQuery<Transaction>({
      camelcase: true,
      text: `INSERT INTO "transactions" (ammount, category_id)
            VALUES ($ammount, $categoryId) 
            RETURNING *`,
      args: { ...data },
    });
    return res.rows[0];
  }

  async update(
    data: { ammount?: number | undefined },
    id: number,
  ): Promise<Transaction> {
    const paramsToUpdate = makeKeyPairSet(data);
    const res = await runQuery<Transaction>({
      camelcase: true,
      text:
        `UPDATE "transactions" SET ${paramsToUpdate} WHERE id=$id RETURNING *`,
      args: { ...data, id },
    });
    return res.rows[0];
  }

  async deleteOne(id: number): Promise<void> {
    await runQuery({
      text: `DELETE FROM "transactions" WHERE id=$id`,
      args: { id },
    });
  }
  async getTotal(where: { categoryId: number }): Promise<number> {
    const condition = makeKeyPairSet(where, {
      snakeCase: true,
      separator: " AND ",
    });
    const res = await runQuery<{ sum: bigint }>({
      text: `SELECT sum(ammount) FROM "transactions" WHERE ${condition}`,
      args: where,
      fields: ["sum"],
    });
    return Number(res.rows[0].sum);
  }
  async getTotalRecords(where: { categoryId: number }): Promise<number> {
    const condition = makeKeyPairSet(where, {
      snakeCase: true,
      separator: " AND ",
    });
    const res = await runQuery<{ count: bigint }>({
      text: `SELECT count(*) FROM "transactions" WHERE ${condition}`,
      args: where,
      fields: ["count"],
    });
    return Number(res.rows[0].count);
  }
}

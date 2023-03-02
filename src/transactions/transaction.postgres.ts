import { Transaction, TransactionRepository } from './transaction.model.ts'
import { runQuery } from "../postgres/db.ts";
import { makeKeyPairSet } from '../lib/query.ts';

export class TransactionPostgresRepository implements TransactionRepository {
  async findOne(id: number): Promise<Transaction | undefined> {
    const res = await runQuery<Transaction>({
      camelcase: true,
      text: `SELECT * FROM "transactions" WHERE id=$id LIMIT 1`,
      args: { id }
    })
    return res.rows[0]
  }

  async find(where: { categoryId: number, limit?: number, offset?: number }): Promise<Transaction[]> {
    const condition = makeKeyPairSet(where, { snakeCase: true, separator: " AND "})

    const limitClause = where.limit ? "LIMIT $limit" : ""
    const offsetClause = where.limit ? "OFFSET $offset" : ""

    const res = await runQuery<Transaction>({
      camelcase: true,
      text: `SELECT * FROM "transactions" WHERE ${condition} ${limitClause} ${offsetClause}`,
      args: where
    })
    return res.rows
  }

  async create(data: { ammount: number; categoryId: number; }): Promise<Transaction> {
    const res = await runQuery<Transaction>({
      camelcase: true,
      text: `INSERT INTO "transactions" (ammount, category_id)
            VALUES ($ammount, $categoryId) 
            RETURNING *`,
      args: { ...data}
    })
    return res.rows[0]
  }

  async update(data: { ammount?: number | undefined; }, id: number): Promise<Transaction> {
    const paramsToUpdate = makeKeyPairSet(data)
    const res = await runQuery<Transaction>({
      camelcase: true,
      text: `UPDATE "transactions" SET ${paramsToUpdate} WHERE id=$id RETURNING *`,
      args: { ...data, id }
    })
    return res.rows[0]
  }

  async deleteOne(id: number): Promise<void> {
    await runQuery({
      text: `DELETE FROM "transactions" WHERE id=$id`,
      args: { id },
    })
  }
}

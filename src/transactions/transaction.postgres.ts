import { Transaction, TransactionRepository } from './transaction.model.ts'
import { runQuery } from "../postgres/db.ts";
import { makeKeyPairSet } from '../lib/query.ts';

export class TransactionPostgresRepository implements TransactionRepository {
  async findOne(id: number): Promise<Transaction | undefined> {
    const res = await runQuery<Transaction>({
      text: `SELECT * FROM "transactions" WHERE id=$id LIMIT 1`,
      args: { id }
    })
    return res.rows[0]
  }

  async find(where: { categoryId: number }): Promise<Transaction[]> {
    const condition = makeKeyPairSet(where, { snakeCase: true, separator: " AND "})

    const res = await runQuery<Transaction>({
      text: `SELECT * FROM "transactions" WHERE ${condition}`,
      args: where
    })
    return res.rows
  }

  async create(data: { ammount: number; categoryId: number; }, userId: number): Promise<Transaction> {
    const res = await runQuery<Transaction>({
      text: `INSERT INTO "transactions" (ammount, categoryId)
            VALUES ($ammount, $categoryId, $userId) 
            RETURNING *`,
      args: { ...data, userId}
    })
    return res.rows[0]
  }

  async update(data: { ammount?: number | undefined; }, id: number): Promise<Transaction> {
    const paramsToUpdate = makeKeyPairSet(data)
    const res = await runQuery<Transaction>({
      text: `UPDATE "transactions" SET ${paramsToUpdate} WHERE id=$id RETURNING *`,
      args: { ...data, id }
    })
    return res.rows[0]
  }

  async deleteOne(id: number): Promise<void> {
    const res = await runQuery({
      text: `DELETE FROM "transactions" WHERE id=$id`,
      args: { id },
    })
    console.log(res)
  }
}

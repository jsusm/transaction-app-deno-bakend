/**
 * This tests depends on user.postgres.test.ts
 * and category.postgres.test.ts file
 */
import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertRejects,
  fail,
} from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { TransactionPostgresRepository } from "../../src/transactions/transaction.postgres.ts";
import { UserPostgresRepository } from "../../src/auth/user.postgres.ts";
import { pool } from "../../src/postgres/db.ts";
import { CategoryPostgresRepository } from "../../src/categories/category.postgres.ts";
// import { postgres } from "../deps.ts";

Deno.test({
  name: "TransactionPostgresRepository",
  sanitizeResources: false,
  fn: async (t) => {
    // clean tables
    const client = await pool.connect();
    await client.queryArray(`DELETE FROM "users"`);
    await client.queryArray(`DELETE FROM "categories"`);
    client.release();
    await client.end();

    // initialize repositories
    const userRepository = new UserPostgresRepository();
    const categoryRepository = new CategoryPostgresRepository();
    const transactionRepository = new TransactionPostgresRepository();
    const dummyUser = await userRepository.createUser({
      name: "testuser",
      email: "test@user.com",
      password: "password",
    });
    const dummyCategory = await categoryRepository.create({
      name: "Transaction Test Category",
    }, dummyUser.id);

    await t.step("Create method should return a transaction", async () => {
      const transaction = await transactionRepository.create({
        ammount: 2,
        categoryId: dummyCategory.id,
      });
      assert(transaction !== undefined);
      assert(transaction !== null);
    });
    await t.step(
      "Create method should throw error if category does not exits",
      () => {
        assertRejects(async () =>
          await transactionRepository.create({ ammount: 2, categoryId: 100000 })
        );
      },
    );
    await t.step("Find method should return an array", async () => {
      const transactions = await transactionRepository.find({
        categoryId: dummyCategory.id,
      });
      assert(transactions instanceof Array);
    });
    await t.step(
      "Find method should result should contain inserted transaction",
      async () => {
        const transaction = await transactionRepository.create({
          ammount: -2,
          categoryId: dummyCategory.id,
        });
        const transactions = await transactionRepository.find({
          categoryId: dummyCategory.id,
        });
        assertArrayIncludes(transactions, [transaction]);
      },
    );
    await t.step(
      "FindOne method should return undefined if resource don't exists",
      async () => {
        const transaction = await transactionRepository.findOne(100000);
        assert(transaction === undefined);
      },
    );
    await t.step(
      "FindOne method should return inserted transaction",
      async () => {
        const transaction = await transactionRepository.create({
          ammount: -2,
          categoryId: dummyCategory.id,
        });
        const foundedTransaction = await transactionRepository.findOne(
          transaction.id,
        );
        if (!foundedTransaction) {
          fail("foundedTransaction should not be undefined");
        }
        assertEquals(foundedTransaction.id, transaction.id);
      },
    );
    await t.step(
      "Update method should return updated transaction",
      async () => {
        const transaction = await transactionRepository.create({
          ammount: -2,
          categoryId: dummyCategory.id,
        });
        const updatedTransaction = await transactionRepository.update({
          ammount: 2,
        }, transaction.id);
        assertEquals(updatedTransaction.ammount, 2);
        assertEquals(updatedTransaction.id, transaction.id);
      },
    );
    await t.step(
      "Update method should return undefined if transaction does not exists",
      async () => {
        const updatedTransaction = await transactionRepository.update({
          ammount: 2,
        }, 100000);
        assertEquals(updatedTransaction, undefined);
      },
    );
    await t.step(
      "Delete method should remove inserted transaction",
      async () => {
        const transaction = await transactionRepository.create({
          ammount: -2,
          categoryId: dummyCategory.id,
        });
        await transactionRepository.deleteOne(transaction.id);
        assertEquals(
          await transactionRepository.findOne(transaction.id),
          undefined,
        );
      },
    );
  },
});

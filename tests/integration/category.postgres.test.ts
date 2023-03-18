/**
 * This tests depends on user.postgres.test.ts file
 */
import { describe, it } from "https://deno.land/std@0.178.0/testing/bdd.ts";
import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertObjectMatch,
  assertRejects,
  fail,
} from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { CategoryPostgresRepository } from "../../src/categories/category.postgres.ts";
import { UserPostgresRepository } from "../../src/auth/user.postgres.ts";
import { pool } from "../../src/postgres/db.ts";
import { UserData } from "../../src/auth/user.model.ts";
import { postgres } from "../../src/deps.ts";

function dummyUserArgs() {
  let i = 0;
  return (): UserData => {
    i++;
    return {
      name: "TestUser",
      email: `test${i}@user.com`,
      password: "randompassword",
    };
  };
}

describe({
  name: "CategoryPostgresRepository",
  sanitizeResources: false,
  beforeAll: async () => {
    // clean tables
    const client = await pool.connect();
    await client.queryArray(`DELETE FROM "users"`);
    await client.queryArray(`DELETE FROM "categories"`);
    client.release();
    await client.end();
  },
  fn: () => {
    const repository = new CategoryPostgresRepository();
    const userRepository = new UserPostgresRepository();
    const dummyUser = dummyUserArgs();

    it("Create method should return a category", async () => {
      const user = await userRepository.createUser(dummyUser());
      const category = await repository.create(
        { name: "Random Category" },
        user.id,
      );
      assert(category !== undefined);
      assert(category !== null);
    });

    it("Create method should throw if user does not exist", () => {
      assertRejects(async () => {
        await repository.create(
          { name: "Random Category" },
          100000, // id that does not exits
        );
      }, postgres.PostgresError);
    });
    it("findOne method should return existing category", async () => {
      const user = await userRepository.createUser(dummyUser());
      const category = await repository.create(
        { name: "Random Category" },
        user.id,
      );
      const foundedCategory = await repository.findOne(category.id);
      if (!foundedCategory) fail("Founded category should not be null");
      assertObjectMatch(foundedCategory, category);
    });

    it("findOne method should return undefined if category does not exist", async () => {
      const category = await repository.findOne(100000);
      assert(!category);
    });

    it("find method should return an array", async () => {
      const categories = await repository.find({ userId: 100000 });
      assert(categories instanceof Array);
    });

    it("find method should return users' categories", async () => {
      const user = await userRepository.createUser(dummyUser());
      const category = await repository.create(
        { name: "Random Category" },
        user.id,
      );
      const categories = await repository.find({ userId: user.id });
      assertArrayIncludes(categories, [category]);
    });
    it("update method should return new category", async () => {
      const user = await userRepository.createUser(dummyUser());
      const category = await repository.create(
        { name: "Random Category" },
        user.id,
      );
      const updatedCategory = await repository.update(
        { name: "Updated Category" },
        { userId: user.id, id: category.id },
      );
      assert(updatedCategory);
    });
    it("update method should return undefined with non-existen category", async () => {
      const user = await userRepository.createUser(dummyUser());
      const updatedCategory = await repository.update(
        { name: "Updated Category" },
        { userId: user.id, id: 100000 },
      );
      assert(updatedCategory == undefined);
    });
    it("delete method should delete existent category", async () => {
      const user = await userRepository.createUser(dummyUser());
      const category = await repository.create({ name: "Category" }, user.id);
      await repository.deleteOne({ userId: user.id, id: category.id });
      assertEquals(await repository.findOne(category.id), undefined);
    });
  },
});

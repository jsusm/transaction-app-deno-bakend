import { UserPostgresRepository } from "./user.postgres.ts";
import {
  assert,
  assertEquals,
  assertObjectMatch,
  assertRejects,
  fail,
} from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.178.0/testing/bdd.ts";
import { pool } from "../postgres/db.ts";

describe({
  name: "UserPostgresRepository",
  sanitizeResources: false,
  sanitizeOps: false,
  beforeAll: (async () => {
    // clean tables
    const client = await pool.connect();
    await client.queryArray(`DELETE FROM "users"`);
    client.release();
    await client.end();
  }),
  fn: () => {
    const repository = new UserPostgresRepository();

    it("Find method should return undefined if user id don't exist", async () => {
      const res = await repository.findUnique({ id: 10000 });
      assert(typeof res === "undefined");
    });

    it("Find method should return undefined if user email don't exist", async () => {
      const res = await repository.findUnique({ email: "dontexist@email.com" });
      assert(typeof res === "undefined");
    });

    it("Insert method should return an user", async () => {
      const res = await repository.createUser({
        name: "user",
        email: "test@user.com",
        password: "password",
      });
      assert(res !== undefined);
    });

    it("Insert method should throw error if email already exist", () => {
      assertRejects(() =>
        repository.createUser({
          name: "user",
          email: "test@user.com",
          password: "password",
        })
      );
    });

    it("Find method should return inserted user", async () => {
      const user = await repository.createUser({
        name: "user",
        email: "test1@user.com",
        password: "password",
      });
      const foundUser = await repository.findUnique({
        id: user.id,
        email: user.email,
      });
      if (!foundUser) fail("Inserted user should be found");
      assertObjectMatch(user, foundUser);
    });

    it("Update method should return updated user", async () => {
      const user = await repository.createUser({
        name: "user",
        email: "test2@user.com",
        password: "password",
      });
      const updatedUser = await repository.updateUser(user.id, 
        { name: "testUser" }
      );
      assertEquals(updatedUser.name, "testUser")
    });

    it("Deleted method", async () => {
      const user = await repository.createUser({
        name: "user",
        email: "test3@user.com",
        password: "password",
      });
      await repository.deleteUser({
        id: user.id,
        email: user.email,
      })
      const notFoundUser = await repository.findUnique({email: user.email})
      assertEquals(notFoundUser, undefined)
    });
  },
});

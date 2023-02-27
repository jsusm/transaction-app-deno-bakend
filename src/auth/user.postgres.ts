import { runQuery } from "../postgres/db.ts";
import { User, UserData, UserRepository } from "./user.model.ts";

export class UserPostgresRepository implements UserRepository {
  async createUser(data: UserData): Promise<User> {
    const res = await runQuery<User>({
      text: `INSERT INTO "users" (name, email, password) 
          VALUES ($name, $email, $password) 
          RETURNING id, name, email, password`,
      args: data,
    });
    return res.rows[0];
  }

  async updateUser(id: number, data: Partial<UserData>): Promise<User> {
    const parametersToUpdate = Object.keys(data)
      .map((k) => `${k}=$${k}`).join(", ");

    const res = await runQuery<User>({
      args: { ...data, id },
      text:
        `Update "users" SET ${parametersToUpdate} WHERE id=$id RETURNING id, name, email, password`,
    });
    return res.rows[0];
  }

  async findUnique(
    where: { id?: number; email?: string },
  ): Promise<User | undefined> {
    // make where
    const condition = Object.keys(where).map((k) => `${k}=$${k}`).join(" AND ");
    const res = await runQuery<User>({
      text:
        `SELECT id, name, email, password FROM "users" WHERE ${condition} LIMIT 1`,
      args: where,
    });
    return res.rows[0];
  }

  async deleteUser(where: { id?: number; email?: string }): Promise<void> {
    const condition = Object.keys(where).map((k) => `${k}=$${k}`).join(" AND ");
    await runQuery({
      text: `DELETE FROM "users" WHERE ${condition}`,
      args: where,
    });
  }
}

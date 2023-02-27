import { pool } from "../postgres/db.ts";
import { User, UserData, UserRepository } from "./user.model.ts";

export class UserPostgresRepository implements UserRepository {
  async createUser(data: UserData): Promise<User> {
    const connection = await pool.connect();
    const res = await connection.queryObject<User>(
      `INSERT INTO "users" (name, email, password) VALUES ($name, $email, $password) RETURNING id, name, email, password`,
      data,
    );
    connection.release();
    return res.rows[0];
  }

  async updateUser(id: number, data: Partial<UserData>): Promise<User> {
    const connection = await pool.connect();
    const parametersToUpdate = Object.keys(data)
      .map((k) => `${k}=$${k}`).join(", ");

    const res = await connection.queryObject<User>(
      `Update "users" SET ${parametersToUpdate} WHERE id=$id RETURNING id, name, email, password`,
      { ...data, id },
    );
    connection.release()
    return res.rows[0];
  }

  async findUnique(
    where: { id?: number; email?: string },
  ): Promise<User | undefined> {
    // make where
    const condition = Object.keys(where).map((k) => `${k}=$${k}`).join(" AND ");
    const connection = await pool.connect();
    const res = await connection.queryObject<User>(
      `SELECT id, name, email, password FROM "users" WHERE ${condition} LIMIT 1`,
      where,
    );
    connection.release();
    return res.rows[0];
  }
  async deleteUser(where: { id?: number; email?: string }): Promise<void> {
    const condition = Object.keys(where).map((k) => `${k}=$${k}`).join(" AND ");
    const connection = await pool.connect();
    await connection.queryArray(
      `DELETE FROM "users" WHERE ${condition}`,
      where,
    );
    connection.release()
  }
}

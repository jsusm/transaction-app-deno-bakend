// deno-lint-ignore-file require-await
import { User, UserData, UserRepository } from "./user.model.ts";

export class UserMockRepository implements UserRepository {
  public mockUser: User = {
    id: 1,
    name: "testUser",
    email: "user@test.com",
    password: "testUserPassword",
  };
  lastId = 0;

  async createUser(data: UserData): Promise<User> {
    return { ...data, id: ++this.lastId };
  }

  async deleteUser(
    _where: { id?: number | undefined; email?: string | undefined },
  ): Promise<void> {}

  async updateUser(id: number, data: Partial<UserData>): Promise<User> {
    return { ...this.mockUser, id, ...data };
  }

  async findUnique(
    where: { id?: number | undefined; email?: string | undefined },
  ): Promise<User | undefined> {
    if (where.id === this.mockUser.id || where.email === this.mockUser.email) {
      return this.mockUser;
    }
  }
}

export interface User extends UserData {
  id: number;
}

export type UserData = {
  name: string;
  password: string;
  email: string;
}

export interface UserRepository {
  createUser(data: UserData): Promise<User>;
  updateUser(id: number, data: Partial<UserData>): Promise<User>;
  findUnique(where: { id?: number; email?: string }): Promise<User | undefined>;
  deleteUser(where: { id?: number; email?: string }): Promise<void>;
}

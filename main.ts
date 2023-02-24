import "https://deno.land/std@0.177.0/dotenv/load.ts";
import { UserPostgresRepository } from "./auth/user.postgres.ts";

const userRepo = new UserPostgresRepository();

// console.log(await userRepo.findUnique({id: 1}))
// console.log(await userRepo.findUnique({email: "jesus@marcano.com", id: 1}))
// console.log(await userRepo.updateUser(1, {name: "Jesus", email:"jesus@gmail.com", password: "randompassword"}))
// console.log(await userRepo.findUnique({id: 1}))

console.log(
  await userRepo.createUser({
    email: "asdf@jhlk.com",
    name: "randomuser",
    password: "randompassword",
  }),
);

const user = await userRepo.findUnique({email: "asdf@jhlk.com"})
console.log(user)

console.log(await userRepo.updateUser(user.id, {name: "importantUser", email: "asdf@gmail.com", password: "alskdjflaksdjf"}))

await userRepo.deleteUser({id: user.id})

console.log(await userRepo.findUnique({email: "asdf@jhlk.com"}))

import { redis as Redis } from "../deps.ts";

export const redis = await Redis.connect({
  hostname: "127.0.0.1",
  port: 6379,
  password: "randompassword"
})

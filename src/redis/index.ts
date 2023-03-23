import { redis as Redis } from "../deps.ts";

export const redis = await Redis.connect({
  hostname: Deno.env.get("REDISHOST") ?? '',
  port: Deno.env.get("REDISPORT"),
  password: Deno.env.get("REDISPASSWORD"),
  username: Deno.env.get("REDISUSER"),
});

import { postgres } from "../deps.ts";

export const pool = new postgres.Pool(Deno.env.get("POSTGRES_URL"), 20, true)

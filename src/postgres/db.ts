import "https://deno.land/std@0.177.0/dotenv/load.ts";
import { postgres } from "../deps.ts";

export const makePool = () => {
  let url = Deno.env.get("POSTGRES_URL")

  if(Deno.env.get("TESTING") === "true"){
    url = Deno.env.get("POSTGRES_TEST_URL")
  }
  return new postgres.Pool(url, 1, true)
}

export const pool = makePool()

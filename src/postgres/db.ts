import { postgres } from "../deps.ts";

export const makePool = () => {
  let url = Deno.env.get("POSTGRES_URL")

  if(Deno.env.get("TESTING") === "true"){
    url = Deno.env.get("POSTGRES_TEST_URL")
  }
  return new postgres.Pool(url, 20, true)
}

export const pool = makePool()

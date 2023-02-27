import "https://deno.land/std@0.177.0/dotenv/load.ts";
import { postgres } from "../deps.ts";
import { QueryOptions } from "https://deno.land/x/postgres@v0.17.0/mod.ts"
import { QueryObjectResult } from "https://deno.land/x/postgres@v0.17.0/query/query.ts";

export const makePool = () => {
  let url = Deno.env.get("POSTGRES_URL")

  if(Deno.env.get("TESTING") === "true"){
    url = Deno.env.get("POSTGRES_TEST_URL")
  }
  return new postgres.Pool(url, 1, true)
}

export const pool = makePool()

export async function runQuery<ResultType = unknown>(options: QueryOptions) {
  const client = await pool.connect()
  let res: QueryObjectResult<ResultType>
  try{
    res = await client.queryObject<ResultType>(options)
  }
  finally{
    client.release()
  }
  return res
}


/*
 * Run this file to load migrations located in ../postgres/migrations
 */
import { postgres } from "../deps.ts";
import { posix } from "https://deno.land/std@0.177.0/path/mod.ts";
import "https://deno.land/std@0.177.0/dotenv/load.ts";

export const __dirname = posix.dirname(posix.fromFileUrl(import.meta.url));

const postgresConnURL = Deno.env.get("POSTGRES_URL");

async function createMigrationTable() {
  await client
    .queryArray`CREATE TABLE IF NOT EXISTS migrations (name varchar(255) UNIQUE, migrated_at timestamp default now());`;
}

async function saveMigration(migrationName: string) {
  await client.queryArray(
    `INSERT INTO migrations (name) VALUES ($migrationName)`,
    { migrationName },
  );
}

async function migrationExist(migrationName: string) {
  const res = await client.queryObject(
    `SELECT name, migrated_at FROM migrations WHERE name=$migrationName`,
    { migrationName },
  );
  return Boolean(res.rowCount);
}

const client = new postgres.Client(postgresConnURL);
await client.connect();
console.log("DB connection stablished.");

await createMigrationTable();

// Run migrations
const migrationsDir = posix.join(__dirname, "../postgres/migrations");

for await (const entry of Deno.readDir(migrationsDir)) {
  if (!entry.isFile) {
    continue;
  }

  if (await migrationExist(entry.name)) {
    continue;
  }

  const content = await Deno.readTextFile(
    posix.join(migrationsDir, entry.name),
  );
  const transaction = client.createTransaction(`migration ${entry.name}`);

  try {
    console.log(`Running migration ${entry.name}.`);
    await transaction.begin();
    await transaction.queryArray(content);
    await transaction.commit();
    console.log(`Migration ${entry.name} was successfull.`);
    saveMigration(entry.name);
  } catch (error) {
    if (error instanceof postgres.TransactionError) {
      console.log(`Error running migration: ${entry.name}`);
      console.group();
      console.log(`Error type: ${error.name}`);
      console.log(`Cause: ${error.cause}`);
      console.groupEnd();
    }
  }
}

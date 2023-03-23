## About this project

This is a simple project that implements cookie base authentication, and base crud operations over a postgres database through a REST api

### Run the project

The server needs an url connection to a postgres database and a redis,
the url is configured through environment variables (see .env.example file)

To run this in local turn on the postgres database and redis with docker compose
```bash
docker compose up -d postgres
docker compose up -d redis
```

I've implemented a basic migration runner (see src/tools/runMigrations.ts)
this script runs sql files under src/postgres/migrations/ directory.
To run the migrations exec the following command
```bash
deno task migrations:run
```

Now just run the project with `deno task start` or for development `deno task dev`

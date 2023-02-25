import "https://deno.land/std@0.177.0/dotenv/load.ts";
import { bootstrapApp } from './app.ts'

const app = bootstrapApp()

console.log("App listen on port 8080");
app.listen({ port: 8080 });

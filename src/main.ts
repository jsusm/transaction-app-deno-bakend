import "https://deno.land/std@0.177.0/dotenv/load.ts";
import { bootstrapApp } from './app.ts'

const app = bootstrapApp()
const PORT = parseInt(Deno.env.get('PORT') || '8080')

console.log("App listen on port: " + PORT);
app.listen({ port: PORT });

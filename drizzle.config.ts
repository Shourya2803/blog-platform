import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config(); // <-- this loads your .env before drizzle reads it

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!, // pull from .env
  },
});

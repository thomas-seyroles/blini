import { defineConfig } from "drizzle-kit";

process.loadEnvFile();

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/server/db/schema.ts",
    out: "./drizzle",
    casing: "snake_case",
    dbCredentials: { url: process.env.DATABASE_URL! },
});

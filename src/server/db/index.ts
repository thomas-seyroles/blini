import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Une seule connexion réutilisée entre les rechargements à chaud du serveur de dev
const global = globalThis as unknown as { pg?: ReturnType<typeof postgres> };
const client = (global.pg ??= postgres(process.env.DATABASE_URL!));

export const db = drizzle(client, { schema, casing: "snake_case" });

import { env } from "@/shared/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as auth from "./schema/auth";

export const schema = {
  ...auth,
};

// Global variable to prevent multiple connection pools during Next.js hot reloading in development
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const client = globalForDb.conn ?? postgres(env.DATABASE_URL);

if (env.NODE_ENV !== "production") {
  globalForDb.conn = client;
}

export const db = drizzle(client, { schema });

export * from "./schema/auth";

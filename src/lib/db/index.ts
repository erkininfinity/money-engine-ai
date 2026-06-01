import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL || "file:dev.db";

export const getDbClient = () => {
  const client = createClient({
    url: databaseUrl,
  });
  return drizzle(client, { schema });
};

export const db = getDbClient();
export * from "./schema";

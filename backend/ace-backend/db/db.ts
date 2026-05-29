import { SQLDatabase } from "encore.dev/storage/sqldb";
import { Bucket } from "encore.dev/storage/objects";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const database = new SQLDatabase("aceyourhirevue", {
  migrations: {
    path: "migrations",
    source: "drizzle",
  },
});

export const db = drizzle(database.connectionString, { schema });

export const responsesBucket = new Bucket("responses", {
  versioned: false,
});

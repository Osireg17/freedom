import { SQLDatabase } from "encore.dev/storage/sqldb";
import { Bucket } from "encore.dev/storage/objects";
import { drizzle } from "drizzle-orm/node-postgres";
import { secret } from "encore.dev/config";
import * as schema from "./schema";

// Initialize Trigger.dev secret key for the SDK
const triggerSecretKey = secret("TriggerSecretKey");
process.env.TRIGGER_SECRET_KEY = triggerSecretKey();


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

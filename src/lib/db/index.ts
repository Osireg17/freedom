import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// For server-side only
const connectionString = process.env.LOCAL_DATABASE_URL! || process.env.NEXT_PUBLIC_DATABASE_URL!
const client = postgres(connectionString, { prepare: true });
export const db = drizzle(client, { schema });

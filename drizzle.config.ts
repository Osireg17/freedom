import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit'


config({ path: '.env.local' });


export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.LOCAL_DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL as string,
  },
  verbose: true,
  strict: true,
});
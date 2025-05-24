import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const connectionString = "postgresql://postgres.jxxrxsiqjjkfrmgnqopg:yRh+LEUJP9SxU4h@aws-0-eu-central-1.pooler.supabase.com:6543/postgres";

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection pool configuration
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the connection
export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
  prepare: false, // Required for some deployment environments
});

// Create the Drizzle client
export const db = drizzle(sql, { schema });

export type Database = typeof db;

// Helper function to close the connection
export const closeConnection = async () => {
  await sql.end();
};

// Export all schema types for use in services
export * from './schema';
export { schema };
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./connection";
import { logger } from "../logger";

export async function runMigrations() {
  try {
    logger.info("Running database migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    logger.info("✅ Database migrations completed successfully");
  } catch (error) {
    logger.error("❌ Database migration failed:", error);
    throw error;
  }
}

// Seed data function for development
export async function seedDatabase() {
  try {
    logger.info("Seeding database with initial data...");

    // Add your seed data here
    // Example: Create default categories, admin user, etc.

    logger.info("✅ Database seeding completed successfully");
  } catch (error) {
    logger.error("❌ Database seeding failed:", error);
    throw error;
  }
}
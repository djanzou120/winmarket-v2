#!/usr/bin/env bun
import * as dotenv from 'dotenv';
dotenv.config();

import { logger } from '../infrastructure/logger';
import { db } from '../infrastructure/database/connection';
import { sql } from 'drizzle-orm';

async function resetDatabase() {
  try {
    logger.info('🔥 Resetting database...');

    // Drop all tables (be careful - this will delete all data!)
    await db.execute(sql`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);

    logger.info('✅ Database reset completed');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

// Safety check - require explicit confirmation
const confirm = process.argv[2];
if (confirm !== '--confirm') {
  logger.error('⚠️ This will DELETE ALL DATA in the database!');
  logger.info('If you are sure, run: bun reset-db.ts --confirm');
  process.exit(1);
}

resetDatabase();
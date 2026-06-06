#!/usr/bin/env bun
import * as dotenv from 'dotenv';
dotenv.config();

import { runMigrations } from '../infrastructure/database/migrations';
import { logger } from '../infrastructure/logger';

async function migrate() {
  try {
    logger.info('🔄 Running database migrations...');
    await runMigrations();
    logger.info('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
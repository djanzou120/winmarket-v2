#!/usr/bin/env bun
import * as dotenv from 'dotenv';
dotenv.config();

import { runSeeds, clearSeeds } from '../infrastructure/database/seeds';
import { logger } from '../infrastructure/logger';

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'run':
      try {
        logger.info('🌱 Running database seeds...');
        await runSeeds();
        logger.info('✅ Seeds completed successfully');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Seeding failed:', error);
        process.exit(1);
      }
      break;

    case 'clear':
      try {
        logger.info('🧹 Clearing seed data...');
        await clearSeeds();
        logger.info('✅ Seed data cleared successfully');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Failed to clear seed data:', error);
        process.exit(1);
      }
      break;

    default:
      logger.info('Usage: bun seed.ts [run|clear]');
      logger.info('  run   - Run database seeds');
      logger.info('  clear - Clear all seed data');
      process.exit(1);
  }
}

main();
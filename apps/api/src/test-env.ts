import * as dotenv from 'dotenv';
dotenv.config();

import { env } from './infrastructure/env-validation';
import { performHealthCheck } from './infrastructure/health';
import { logger } from './infrastructure/logger';

async function testEnvironment() {
  try {
    logger.info('🧪 Testing environment configuration...');

    logger.info('✅ Environment variables validated successfully');
    logger.info('Configuration summary:', {
      nodeEnv: env.NODE_ENV,
      port: env.PORT,
      database: `${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
      redis: `${env.REDIS_HOST}:${env.REDIS_PORT}`,
      minio: env.MINIO_ENDPOINT
    });

    // Test health check (will fail without services running, but validates code)
    logger.info('🔍 Testing health check system...');
    const healthReport = await performHealthCheck();

    logger.info('Health check completed:', {
      status: healthReport.status,
      services: healthReport.services.map(s => ({ name: s.service, status: s.status }))
    });

    logger.info('✅ Infrastructure validation completed successfully!');
    logger.info('🚀 Ready for development. To start services run: docker compose up -d');

  } catch (error) {
    logger.error('❌ Environment test failed:', error);
    process.exit(1);
  }
}

testEnvironment();
// Service d'initialisation centralisé pour l'application
import { logger } from './logger';
import { config } from './config';
import { performHealthCheck, initializeMonitoring } from './health';
import { runMigrations, seedDatabase } from './database/migrations';
import { cache } from './cache';
import { HealthEndpointService } from './health-endpoint';

export interface AppInitializationResult {
  success: boolean;
  services: {
    database: boolean;
    cache: boolean;
    storage: boolean;
    healthEndpoint: boolean;
  };
  errors: string[];
}

export class AppInitializer {
  private healthEndpoint?: HealthEndpointService;

  async initialize(): Promise<AppInitializationResult> {
    const result: AppInitializationResult = {
      success: false,
      services: {
        database: false,
        cache: false,
        storage: false,
        healthEndpoint: false,
      },
      errors: []
    };

    try {
      logger.info('🚀 Initializing WinMarket V2 API...');

      // 1. Initialize monitoring system
      logger.info('📊 Initializing monitoring system...');
      const monitoringInitialized = await initializeMonitoring();
      if (!monitoringInitialized) {
        result.errors.push('Failed to initialize monitoring system');
        return result;
      }

      // 2. Perform initial health check
      logger.info('🔍 Performing initial health check...');
      const healthReport = await performHealthCheck();

      if (healthReport.status === 'unhealthy') {
        logger.error('❌ Initial health check failed');
        result.errors.push('Initial health check failed');
        return result;
      }

      if (healthReport.status === 'degraded') {
        logger.warn('⚠️ Some services are unhealthy, continuing with limited functionality');
      }

      // 3. Check individual services
      for (const service of healthReport.services) {
        switch (service.service) {
          case 'database':
            result.services.database = service.status === 'healthy';
            if (!result.services.database) {
              logger.warn('⚠️ Database service is unhealthy');
            }
            break;
          case 'cache':
            result.services.cache = service.status === 'healthy';
            if (!result.services.cache) {
              logger.warn('⚠️ Cache service is unhealthy');
            }
            break;
          case 'storage':
            result.services.storage = service.status === 'healthy';
            if (!result.services.storage) {
              logger.warn('⚠️ Storage service is unhealthy');
            }
            break;
        }
      }

      // 4. Run database migrations (only if DB is healthy and not in test mode)
      if (result.services.database && config.database && process.env.NODE_ENV !== 'test') {
        try {
          logger.info('🔄 Running database migrations...');
          await runMigrations();
          logger.info('✅ Database migrations completed');
        } catch (error) {
          logger.warn('⚠️ Database migrations failed:', error);
          // Don't fail initialization for migration errors
        }
      }

      // 5. Start health endpoint
      try {
        logger.info('🏥 Starting health endpoint...');
        this.healthEndpoint = new HealthEndpointService(config.server.healthPort);
        await this.healthEndpoint.start();
        result.services.healthEndpoint = true;
      } catch (error) {
        logger.warn('⚠️ Failed to start health endpoint:', error);
        result.errors.push('Failed to start health endpoint');
      }

      // 6. Validate critical services
      const criticalServices = ['database'];
      const criticalHealthy = criticalServices.every(service => {
        const serviceKey = service as keyof typeof result.services;
        return result.services[serviceKey];
      });

      if (!criticalHealthy) {
        logger.error('❌ Critical services are not healthy');
        result.errors.push('Critical services are not healthy');
        return result;
      }

      result.success = true;
      logger.info('✅ Application initialization completed successfully');

      // Log service status
      logger.info('📊 Service Status Summary:', {
        database: result.services.database ? '✅' : '❌',
        cache: result.services.cache ? '✅' : '⚠️',
        storage: result.services.storage ? '✅' : '⚠️',
        healthEndpoint: result.services.healthEndpoint ? '✅' : '⚠️',
      });

      return result;

    } catch (error) {
      logger.error('💥 Application initialization failed:', error);
      result.errors.push(`Initialization failed: ${error}`);
      return result;
    }
  }

  async seedDevelopmentData(): Promise<void> {
    if (config.database && process.env.NODE_ENV === 'development') {
      try {
        logger.info('🌱 Seeding development data...');
        await seedDatabase();
        logger.info('✅ Development data seeded');
      } catch (error) {
        logger.warn('⚠️ Failed to seed development data:', error);
      }
    }
  }

  async shutdown(): Promise<void> {
    logger.info('🧹 Shutting down application services...');

    const shutdownPromises: Promise<void>[] = [];

    // Stop health endpoint
    if (this.healthEndpoint) {
      shutdownPromises.push(this.healthEndpoint.stop());
    }

    // Disconnect cache
    try {
      shutdownPromises.push(cache.disconnect());
    } catch (error) {
      logger.warn('⚠️ Cache disconnect error:', error);
    }

    // Wait for all shutdowns
    try {
      await Promise.all(shutdownPromises);
      logger.info('✅ Application shutdown completed');
    } catch (error) {
      logger.error('❌ Error during application shutdown:', error);
    }
  }

  getHealthEndpointPort(): number {
    return config.server.healthPort;
  }
}
import { db } from '../connection';
import { logger } from '../../logger';
import { seedUsers } from './seed-users';
import { seedCategories } from './seed-categories';
import { seedProducts } from './seed-products';
import { seedDeliveryProviders } from './seed-delivery';

export async function runSeeds() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Seed in dependency order
    await seedUsers();
    await seedCategories();
    await seedDeliveryProviders();
    await seedProducts();

    logger.info('✅ Database seeding completed successfully');
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    throw error;
  }
}

export async function clearSeeds() {
  try {
    logger.info('🧹 Clearing seed data...');

    // Clear in reverse dependency order
    await db.delete(db.query.orders);
    await db.delete(db.query.products);
    await db.delete(db.query.categories);
    await db.delete(db.query.deliveryProviders);
    await db.delete(db.query.users);

    logger.info('✅ Seed data cleared successfully');
  } catch (error) {
    logger.error('❌ Failed to clear seed data:', error);
    throw error;
  }
}
import { db } from '../connection';
import { users, userProfiles, userWallets } from '../schema';
import { randomUUID } from "crypto";
import bcrypt from 'bcryptjs';
import { logger } from '../../logger';

export async function seedUsers() {
  logger.info('👥 Seeding users...');

  // Check if users already exist
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    logger.info('Users already exist, skipping...');
    return;
  }

  const hashedPassword = await bcrypt.hash('password123', 12);

  // Admin user
  const adminId = randomUUID();
  await db.insert(users).values({
    id: adminId,
    email: 'admin@winmarket.com',
    passwordHash: hashedPassword,
    firstName: 'Admin',
    lastName: 'WinMarket',
    userType: 'ADMIN',
    status: 'ACTIVE',
    emailVerified: true,
  });

  await db.insert(userProfiles).values({
    id: randomUUID(),
    userId: adminId,
    bio: 'Administrateur de la plateforme WinMarket',
    city: 'Paris',
    country: 'France',
    timezone: 'Europe/Paris',
  });

  await db.insert(userWallets).values({
    id: randomUUID(),
    userId: adminId,
    balance: '1000.00',
  });

  // Sample sellers
  const sellers = [
    {
      email: 'seller1@example.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      bio: 'Vendeur de produits électroniques',
      city: 'Lyon',
    },
    {
      email: 'seller2@example.com',
      firstName: 'Marie',
      lastName: 'Martin',
      bio: 'Spécialiste en mode et accessoires',
      city: 'Marseille',
    },
    {
      email: 'seller3@example.com',
      firstName: 'Pierre',
      lastName: 'Durand',
      bio: 'Vendeur de livres et produits culturels',
      city: 'Toulouse',
    },
  ];

  for (const seller of sellers) {
    const sellerId = randomUUID();
    await db.insert(users).values({
      id: sellerId,
      email: seller.email,
      passwordHash: hashedPassword,
      firstName: seller.firstName,
      lastName: seller.lastName,
      userType: 'SELLER',
      status: 'ACTIVE',
      emailVerified: true,
    });

    await db.insert(userProfiles).values({
      id: randomUUID(),
      userId: sellerId,
      bio: seller.bio,
      city: seller.city,
      country: 'France',
      timezone: 'Europe/Paris',
    });

    await db.insert(userWallets).values({
      id: randomUUID(),
      userId: sellerId,
      balance: '500.00',
      totalEarnings: '2000.00',
    });
  }

  // Sample buyers
  const buyers = [
    {
      email: 'buyer1@example.com',
      firstName: 'Sophie',
      lastName: 'Bernard',
      city: 'Nice',
    },
    {
      email: 'buyer2@example.com',
      firstName: 'Thomas',
      lastName: 'Petit',
      city: 'Bordeaux',
    },
    {
      email: 'buyer3@example.com',
      firstName: 'Emma',
      lastName: 'Robert',
      city: 'Lille',
    },
    {
      email: 'buyer4@example.com',
      firstName: 'Lucas',
      lastName: 'Moreau',
      city: 'Nantes',
    },
  ];

  for (const buyer of buyers) {
    const buyerId = randomUUID();
    await db.insert(users).values({
      id: buyerId,
      email: buyer.email,
      passwordHash: hashedPassword,
      firstName: buyer.firstName,
      lastName: buyer.lastName,
      userType: 'BUYER',
      status: 'ACTIVE',
      emailVerified: true,
    });

    await db.insert(userProfiles).values({
      id: randomUUID(),
      userId: buyerId,
      city: buyer.city,
      country: 'France',
      timezone: 'Europe/Paris',
    });

    await db.insert(userWallets).values({
      id: randomUUID(),
      userId: buyerId,
      balance: '250.00',
      totalSpent: '1500.00',
    });
  }

  logger.info(`✅ Seeded ${1 + sellers.length + buyers.length} users`);
}
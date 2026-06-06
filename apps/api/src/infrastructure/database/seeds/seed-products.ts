import { db } from '../connection';
import { products, users, categories } from '../schema';
import { randomUUID } from "crypto";
import { logger } from '../../logger';
import { eq } from 'drizzle-orm';

export async function seedProducts() {
  logger.info('📦 Seeding products...');

  // Check if products already exist
  const existingProducts = await db.select().from(products).limit(1);
  if (existingProducts.length > 0) {
    logger.info('Products already exist, skipping...');
    return;
  }

  // Get sellers and categories
  const sellers = await db.select().from(users).where(eq(users.userType, 'SELLER'));
  const allCategories = await db.select().from(categories);

  if (sellers.length === 0 || allCategories.length === 0) {
    logger.warn('No sellers or categories found, skipping product seeding');
    return;
  }

  // Sample products data
  const productsData = [
    // Electronics
    {
      title: 'iPhone 15 Pro Max 256GB',
      slug: 'iphone-15-pro-max-256gb',
      description: 'Le dernier iPhone avec puce A17 Pro, écran Super Retina XDR et système de caméras avancé. Stockage 256GB, design en titane.',
      shortDescription: 'iPhone 15 Pro Max avec 256GB de stockage',
      price: '1399.00',
      originalPrice: '1499.00',
      condition: 'NEW',
      status: 'ACTIVE',
      stock: 15,
      categorySlug: 'smartphones',
      images: JSON.stringify([
        '/images/products/iphone-15-pro-max-1.jpg',
        '/images/products/iphone-15-pro-max-2.jpg',
        '/images/products/iphone-15-pro-max-3.jpg',
      ]),
      tags: JSON.stringify(['smartphone', 'apple', 'ios', 'premium']),
    },
    {
      title: 'MacBook Air M2 13"',
      slug: 'macbook-air-m2-13',
      description: 'MacBook Air avec puce M2, écran 13.6", 8GB RAM, 256GB SSD. Ultra-portable et performant pour tous vos besoins.',
      shortDescription: 'MacBook Air M2 13 pouces, 8GB RAM, 256GB SSD',
      price: '1199.00',
      condition: 'NEW',
      status: 'ACTIVE',
      stock: 8,
      categorySlug: 'ordinateurs-portables',
      images: JSON.stringify([
        '/images/products/macbook-air-m2-1.jpg',
        '/images/products/macbook-air-m2-2.jpg',
      ]),
      tags: JSON.stringify(['laptop', 'apple', 'macos', 'portable']),
    },
    // Fashion
    {
      title: 'Sneakers Nike Air Force 1',
      slug: 'sneakers-nike-air-force-1',
      description: 'Les iconiques sneakers Nike Air Force 1 en cuir blanc. Un classique indémodable pour toutes les occasions.',
      shortDescription: 'Nike Air Force 1 blanc, tailles disponibles',
      price: '99.99',
      condition: 'NEW',
      status: 'ACTIVE',
      stock: 25,
      categorySlug: 'chaussures',
      images: JSON.stringify([
        '/images/products/nike-air-force-1.jpg',
      ]),
      tags: JSON.stringify(['sneakers', 'nike', 'sport', 'casual']),
    },
    {
      title: 'Jean Levi\'s 501 Original',
      slug: 'jean-levis-501-original',
      description: 'Le jean Levi\'s 501 original, coupe droite, 100% coton. Un incontournable du dressing masculin.',
      shortDescription: 'Jean Levi\'s 501 coupe droite, plusieurs tailles',
      price: '89.90',
      originalPrice: '109.90',
      condition: 'NEW',
      status: 'ACTIVE',
      stock: 30,
      categorySlug: 'vetements-homme',
      images: JSON.stringify([
        '/images/products/levis-501-1.jpg',
        '/images/products/levis-501-2.jpg',
      ]),
      tags: JSON.stringify(['jean', 'levis', 'homme', 'classique']),
    },
    // Home & Garden
    {
      title: 'Aspirateur Dyson V15 Detect',
      slug: 'aspirateur-dyson-v15-detect',
      description: 'Aspirateur sans fil Dyson V15 Detect avec technologie laser pour détecter la poussière invisible.',
      shortDescription: 'Aspirateur sans fil Dyson avec détection laser',
      price: '649.00',
      originalPrice: '749.00',
      condition: 'NEW',
      status: 'ACTIVE',
      stock: 5,
      categorySlug: 'electromenager',
      images: JSON.stringify([
        '/images/products/dyson-v15-1.jpg',
        '/images/products/dyson-v15-2.jpg',
      ]),
      tags: JSON.stringify(['aspirateur', 'dyson', 'sans-fil', 'technologie']),
    },
    // Books
    {
      title: 'Dune - Frank Herbert',
      slug: 'dune-frank-herbert',
      description: 'Le chef-d\'œuvre de science-fiction de Frank Herbert. Édition de poche récente en excellent état.',
      shortDescription: 'Roman de science-fiction culte de Frank Herbert',
      price: '12.90',
      condition: 'USED_LIKE_NEW',
      status: 'ACTIVE',
      stock: 3,
      categorySlug: 'livres-culture',
      images: JSON.stringify([
        '/images/products/dune-book.jpg',
      ]),
      tags: JSON.stringify(['livre', 'science-fiction', 'frank-herbert', 'classique']),
    },
  ];

  let productCount = 0;

  for (const productData of productsData) {
    // Find category by slug
    const category = allCategories.find(c => c.slug === productData.categorySlug);
    if (!category) {
      logger.warn(`Category ${productData.categorySlug} not found, skipping product ${productData.title}`);
      continue;
    }

    // Assign to random seller
    const seller = sellers[Math.floor(Math.random() * sellers.length)];

    await db.insert(products).values({
      id: randomUUID(),
      sellerId: seller.id,
      categoryId: category.id,
      title: productData.title,
      slug: productData.slug,
      description: productData.description,
      shortDescription: productData.shortDescription,
      price: productData.price,
      originalPrice: productData.originalPrice,
      condition: productData.condition as any,
      status: productData.status as any,
      stock: productData.stock,
      images: productData.images,
      tags: productData.tags,
      isDigital: false,
      shippingRequired: true,
      allowReviews: true,
      viewCount: Math.floor(Math.random() * 500),
      favoriteCount: Math.floor(Math.random() * 50),
      soldCount: Math.floor(Math.random() * 20),
      averageRating: (3.5 + Math.random() * 1.5).toFixed(2), // Random rating between 3.5 and 5
      reviewCount: Math.floor(Math.random() * 10),
      publishedAt: new Date(),
    });

    productCount++;
  }

  logger.info(`✅ Seeded ${productCount} products`);
}
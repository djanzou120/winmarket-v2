import { db } from '../connection';
import { categories } from '../schema';
import { randomUUID } from "crypto";
import { logger } from '../../logger';

export async function seedCategories() {
  logger.info('📂 Seeding categories...');

  // Check if categories already exist
  const existingCategories = await db.select().from(categories).limit(1);
  if (existingCategories.length > 0) {
    logger.info('Categories already exist, skipping...');
    return;
  }

  // Root categories
  const rootCategories = [
    {
      name: 'Électronique',
      slug: 'electronique',
      description: 'Smartphones, ordinateurs, accessoires électroniques',
      imageUrl: '/images/categories/electronics.jpg',
    },
    {
      name: 'Mode & Accessoires',
      slug: 'mode-accessoires',
      description: 'Vêtements, chaussures, bijoux, sacs',
      imageUrl: '/images/categories/fashion.jpg',
    },
    {
      name: 'Maison & Jardin',
      slug: 'maison-jardin',
      description: 'Meubles, décoration, jardinage, bricolage',
      imageUrl: '/images/categories/home-garden.jpg',
    },
    {
      name: 'Sports & Loisirs',
      slug: 'sports-loisirs',
      description: 'Équipements sportifs, jeux, loisirs créatifs',
      imageUrl: '/images/categories/sports.jpg',
    },
    {
      name: 'Livres & Culture',
      slug: 'livres-culture',
      description: 'Livres, musique, films, produits culturels',
      imageUrl: '/images/categories/books.jpg',
    },
    {
      name: 'Automobile',
      slug: 'automobile',
      description: 'Pièces auto, accessoires, équipements véhicules',
      imageUrl: '/images/categories/auto.jpg',
    },
  ];

  const categoryIds: Record<string, string> = {};

  // Insert root categories
  for (const [index, category] of rootCategories.entries()) {
    const categoryId = randomUUID();
    categoryIds[category.slug] = categoryId;

    await db.insert(categories).values({
      id: categoryId,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      parentId: null,
      isActive: true,
      sortOrder: index,
    });
  }

  // Subcategories for Électronique
  const electronicsSubcategories = [
    { name: 'Smartphones', slug: 'smartphones' },
    { name: 'Ordinateurs portables', slug: 'ordinateurs-portables' },
    { name: 'Tablettes', slug: 'tablettes' },
    { name: 'Casques audio', slug: 'casques-audio' },
    { name: 'Appareils photo', slug: 'appareils-photo' },
  ];

  for (const [index, subcategory] of electronicsSubcategories.entries()) {
    await db.insert(categories).values({
      id: randomUUID(),
      name: subcategory.name,
      slug: subcategory.slug,
      parentId: categoryIds['electronique'],
      isActive: true,
      sortOrder: index,
    });
  }

  // Subcategories for Mode & Accessoires
  const fashionSubcategories = [
    { name: 'Vêtements homme', slug: 'vetements-homme' },
    { name: 'Vêtements femme', slug: 'vetements-femme' },
    { name: 'Chaussures', slug: 'chaussures' },
    { name: 'Bijoux', slug: 'bijoux' },
    { name: 'Sacs & Maroquinerie', slug: 'sacs-maroquinerie' },
  ];

  for (const [index, subcategory] of fashionSubcategories.entries()) {
    await db.insert(categories).values({
      id: randomUUID(),
      name: subcategory.name,
      slug: subcategory.slug,
      parentId: categoryIds['mode-accessoires'],
      isActive: true,
      sortOrder: index,
    });
  }

  // Subcategories for Maison & Jardin
  const homeSubcategories = [
    { name: 'Meubles', slug: 'meubles' },
    { name: 'Décoration', slug: 'decoration' },
    { name: 'Électroménager', slug: 'electromenager' },
    { name: 'Jardinage', slug: 'jardinage' },
    { name: 'Bricolage', slug: 'bricolage' },
  ];

  for (const [index, subcategory] of homeSubcategories.entries()) {
    await db.insert(categories).values({
      id: randomUUID(),
      name: subcategory.name,
      slug: subcategory.slug,
      parentId: categoryIds['maison-jardin'],
      isActive: true,
      sortOrder: index,
    });
  }

  const totalCategories = rootCategories.length + electronicsSubcategories.length + fashionSubcategories.length + homeSubcategories.length;
  logger.info(`✅ Seeded ${totalCategories} categories`);
}
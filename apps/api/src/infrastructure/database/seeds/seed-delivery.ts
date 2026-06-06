import { db } from '../connection';
import { deliveryProviders, deliveryOptions } from '../schema';
import { randomUUID } from "crypto";
import { logger } from '../../logger';

export async function seedDeliveryProviders() {
  logger.info('🚚 Seeding delivery providers...');

  // Check if providers already exist
  const existingProviders = await db.select().from(deliveryProviders).limit(1);
  if (existingProviders.length > 0) {
    logger.info('Delivery providers already exist, skipping...');
    return;
  }

  const providers = [
    {
      name: 'Chronopost',
      slug: 'chronopost',
      description: 'Livraison express et standard partout en France',
      contactEmail: 'contact@chronopost.fr',
      contactPhone: '0969 391 391',
      website: 'https://www.chronopost.fr',
      trackingUrlTemplate: 'https://www.chronopost.fr/tracking-colis?listeNumerosLT={tracking_number}',
      coverageAreas: JSON.stringify(['France métropolitaine', 'Corse', 'DOM-TOM']),
      supportedServices: JSON.stringify(['STANDARD', 'EXPRESS', 'SAME_DAY']),
      commissionRate: '0.0250', // 2.5%
      rating: '4.20',
    },
    {
      name: 'Colissimo',
      slug: 'colissimo',
      description: 'Service de colis de La Poste',
      contactEmail: 'contact@colissimo.fr',
      contactPhone: '3631',
      website: 'https://www.colissimo.fr',
      trackingUrlTemplate: 'https://www.laposte.fr/outils/suivre-vos-envois?code={tracking_number}',
      coverageAreas: JSON.stringify(['France métropolitaine', 'Corse', 'DOM-TOM', 'Europe']),
      supportedServices: JSON.stringify(['STANDARD', 'EXPRESS']),
      commissionRate: '0.0200', // 2%
      rating: '4.10',
    },
    {
      name: 'DPD',
      slug: 'dpd',
      description: 'Livraison rapide et fiable en France et Europe',
      contactEmail: 'info@dpd.fr',
      contactPhone: '0825 10 00 25',
      website: 'https://www.dpd.fr',
      trackingUrlTemplate: 'https://www.dpd.fr/trace/{tracking_number}',
      coverageAreas: JSON.stringify(['France métropolitaine', 'Europe']),
      supportedServices: JSON.stringify(['STANDARD', 'EXPRESS']),
      commissionRate: '0.0275', // 2.75%
      rating: '4.00',
    },
    {
      name: 'Mondial Relay',
      slug: 'mondial-relay',
      description: 'Livraison en points relais partout en Europe',
      contactEmail: 'contact@mondialrelay.fr',
      contactPhone: '09 69 32 23 32',
      website: 'https://www.mondialrelay.fr',
      trackingUrlTemplate: 'https://www.mondialrelay.fr/suivi-de-colis/?numeroCommande={tracking_number}',
      coverageAreas: JSON.stringify(['France métropolitaine', 'Belgique', 'Luxembourg', 'Espagne']),
      supportedServices: JSON.stringify(['PICKUP', 'STANDARD']),
      commissionRate: '0.0150', // 1.5%
      rating: '3.90',
    },
    {
      name: 'UberEats Delivery',
      slug: 'ubereats-delivery',
      description: 'Livraison ultra-rapide dans les grandes villes',
      contactEmail: 'partners@ubereats.com',
      contactPhone: '01 76 49 00 00',
      website: 'https://www.ubereats.com',
      trackingUrlTemplate: 'https://www.ubereats.com/fr/tracking/{tracking_number}',
      coverageAreas: JSON.stringify(['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux']),
      supportedServices: JSON.stringify(['SAME_DAY', 'EXPRESS']),
      commissionRate: '0.0400', // 4%
      rating: '4.30',
    },
  ];

  const providerIds: Record<string, string> = {};

  // Insert providers
  for (const provider of providers) {
    const providerId = randomUUID();
    providerIds[provider.slug] = providerId;

    await db.insert(deliveryProviders).values({
      id: providerId,
      name: provider.name,
      slug: provider.slug,
      description: provider.description,
      contactEmail: provider.contactEmail,
      contactPhone: provider.contactPhone,
      website: provider.website,
      trackingUrlTemplate: provider.trackingUrlTemplate,
      coverageAreas: provider.coverageAreas,
      supportedServices: provider.supportedServices,
      commissionRate: provider.commissionRate,
      status: 'ACTIVE',
      isVerified: true,
      rating: provider.rating,
      totalDeliveries: Math.floor(Math.random() * 10000), // Random for demo
    });
  }

  // Create delivery options for each provider
  const deliveryOptionsData = [
    // Chronopost options
    {
      providerId: providerIds['chronopost'],
      name: 'Livraison Standard',
      type: 'STANDARD',
      description: 'Livraison en 2-3 jours ouvrés',
      baseCost: '6.90',
      estimatedMinHours: 48,
      estimatedMaxHours: 72,
      freeShippingThreshold: '50.00',
    },
    {
      providerId: providerIds['chronopost'],
      name: 'Livraison Express',
      type: 'EXPRESS',
      description: 'Livraison en 24h',
      baseCost: '12.90',
      estimatedMinHours: 20,
      estimatedMaxHours: 28,
      requiresSignature: true,
    },
    // Colissimo options
    {
      providerId: providerIds['colissimo'],
      name: 'Colissimo Standard',
      type: 'STANDARD',
      description: 'Livraison à domicile en 2-3 jours',
      baseCost: '5.50',
      estimatedMinHours: 48,
      estimatedMaxHours: 72,
      freeShippingThreshold: '40.00',
    },
    // Mondial Relay options
    {
      providerId: providerIds['mondial-relay'],
      name: 'Point Relais',
      type: 'PICKUP',
      description: 'Retrait en point relais',
      baseCost: '3.90',
      estimatedMinHours: 48,
      estimatedMaxHours: 96,
      freeShippingThreshold: '30.00',
    },
    // UberEats options
    {
      providerId: providerIds['ubereats-delivery'],
      name: 'Livraison Immédiate',
      type: 'SAME_DAY',
      description: 'Livraison en 1-3 heures',
      baseCost: '8.90',
      costPerKm: '0.50',
      estimatedMinHours: 1,
      estimatedMaxHours: 3,
    },
  ];

  for (const option of deliveryOptionsData) {
    await db.insert(deliveryOptions).values({
      id: randomUUID(),
      providerId: option.providerId,
      name: option.name,
      type: option.type as any,
      description: option.description,
      baseCost: option.baseCost,
      costPerKm: option.costPerKm || '0.0000',
      estimatedMinHours: option.estimatedMinHours,
      estimatedMaxHours: option.estimatedMaxHours,
      freeShippingThreshold: option.freeShippingThreshold,
      requiresSignature: option.requiresSignature || false,
      isActive: true,
    });
  }

  logger.info(`✅ Seeded ${providers.length} delivery providers and ${deliveryOptionsData.length} delivery options`);
}
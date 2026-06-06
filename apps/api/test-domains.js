#!/usr/bin/env node

// Script de test pour vérifier l'intégrité des domaines DDD
console.log('🔍 Test de l\'architecture des domaines...\n');

async function testDomainImports() {
  try {
    console.log('📦 Test des imports des domaines...');

    // Test des imports de base
    try {
      const { baseTypeDefs } = await import('./src/domains/index.ts');
      console.log('✅ baseTypeDefs importé avec succès');
    } catch (error) {
      console.log('❌ Erreur baseTypeDefs:', error.message);
    }

    // Test des domaines individuels
    const domains = [
      'auth', 'users', 'products', 'orders',
      'reviews', 'delivery', 'notifications'
    ];

    for (const domain of domains) {
      try {
        const domainModule = await import(`./src/domains/${domain}/index.ts`);
        console.log(`✅ Domaine ${domain} importé avec succès`);

        // Vérifier les exports attendus
        const expectedExports = [`${domain}TypeDefs`, `${domain}Resolvers`];
        for (const exportName of expectedExports) {
          if (domainModule[exportName]) {
            console.log(`  ✅ ${exportName} exporté`);
          } else {
            console.log(`  ⚠️  ${exportName} manquant`);
          }
        }
      } catch (error) {
        console.log(`❌ Erreur domaine ${domain}:`, error.message);
      }
    }

    console.log('\n📋 Test des schémas...');

    // Test des schémas
    for (const domain of domains) {
      try {
        const schemaModule = await import(`./src/domains/${domain}/schema/${domain}.schema.ts`);
        console.log(`✅ Schéma ${domain} importé avec succès`);
      } catch (error) {
        console.log(`❌ Erreur schéma ${domain}:`, error.message);
      }
    }

    console.log('\n🔧 Test des resolvers...');

    // Test des resolvers
    for (const domain of domains) {
      try {
        const resolverModule = await import(`./src/domains/${domain}/resolvers/${domain}.resolvers.ts`);
        console.log(`✅ Resolvers ${domain} importé avec succès`);
      } catch (error) {
        console.log(`❌ Erreur resolvers ${domain}:`, error.message);
      }
    }

    console.log('\n📝 Test des types...');

    // Test des types
    for (const domain of domains) {
      try {
        const typesModule = await import(`./src/domains/${domain}/types/${domain}.types.ts`);
        console.log(`✅ Types ${domain} importé avec succès`);
      } catch (error) {
        console.log(`❌ Erreur types ${domain}:`, error.message);
      }
    }

  } catch (error) {
    console.log('❌ Erreur globale:', error.message);
  }
}

async function testSchemaIntegrity() {
  console.log('\n🏗️  Test d\'intégrité du schéma global...');

  try {
    const { combinedSchema } = await import('./src/domains/schema.ts');
    console.log('✅ Schéma combiné importé avec succès');

    // Compter les tables
    const tableCount = Object.keys(combinedSchema).length;
    console.log(`📊 Nombre total de tables: ${tableCount}`);

    // Vérifier les domaines
    const expectedDomains = {
      auth: ['authSessions', 'authAttempts', 'passwordResetTokens', 'emailVerificationTokens'],
      users: ['users', 'userProfiles', 'userWallets'],
      products: ['categories', 'products', 'productVariants'],
      orders: ['orders', 'orderItems', 'walletTransactions', 'cartItems'],
      reviews: ['reviews', 'reviewVotes', 'reviewReports', 'reviewResponses'],
      delivery: ['deliveryProviders', 'deliveryOptions', 'deliveryZones', 'deliveryTracking'],
      notifications: ['notifications', 'notificationPreferences', 'deviceTokens', 'notificationTemplates']
    };

    for (const [domain, tables] of Object.entries(expectedDomains)) {
      console.log(`\n🔍 Vérification du domaine ${domain}:`);
      for (const table of tables) {
        if (combinedSchema[table]) {
          console.log(`  ✅ Table ${table} présente`);
        } else {
          console.log(`  ❌ Table ${table} manquante`);
        }
      }
    }

  } catch (error) {
    console.log('❌ Erreur schéma:', error.message);
  }
}

async function testGraphQLIntegration() {
  console.log('\n🚀 Test d\'intégration GraphQL...');

  try {
    const { allTypeDefs, allResolvers } = await import('./src/domains/index.ts');

    console.log(`📝 Nombre de typeDefs: ${allTypeDefs?.length || 0}`);
    console.log(`🔧 Nombre de resolvers: ${allResolvers?.length || 0}`);

    if (allTypeDefs && allTypeDefs.length > 0) {
      console.log('✅ TypeDefs disponibles');
    } else {
      console.log('❌ TypeDefs manquants ou vides');
    }

    if (allResolvers && allResolvers.length > 0) {
      console.log('✅ Resolvers disponibles');
    } else {
      console.log('❌ Resolvers manquants ou vides');
    }

  } catch (error) {
    console.log('❌ Erreur GraphQL:', error.message);
  }
}

async function runAllTests() {
  await testDomainImports();
  await testSchemaIntegrity();
  await testGraphQLIntegration();

  console.log('\n🎯 Tests terminés!');
}

runAllTests().catch(console.error);
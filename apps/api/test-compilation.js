#!/usr/bin/env node

// Script de test pour vérifier la compilation TypeScript et l'intégrité
console.log('🔍 Test de compilation TypeScript...\n');

async function testTypeScriptCompilation() {
  console.log('📝 Test de compilation TypeScript...');

  try {
    // Test simple d'import des types de base
    const typesModule = await import('./src/infrastructure/types.ts');
    console.log('✅ Types d\'infrastructure importés avec succès');

    // Test des contextes
    const contextModule = await import('./src/infrastructure/context.ts');
    console.log('✅ Contexte d\'infrastructure importé avec succès');

    console.log('\n📦 Test des domaines individuels...');

    // Test de chaque domaine individuellement
    const domains = ['auth', 'users', 'products', 'orders', 'reviews', 'delivery', 'notifications'];

    for (const domain of domains) {
      try {
        // Test schema
        await import(`./src/domains/${domain}/schema/${domain}.schema.ts`);
        console.log(`✅ ${domain} - Schema OK`);

        // Test types
        await import(`./src/domains/${domain}/types/${domain}.types.ts`);
        console.log(`✅ ${domain} - Types OK`);

        // Test resolvers
        await import(`./src/domains/${domain}/resolvers/${domain}.resolvers.ts`);
        console.log(`✅ ${domain} - Resolvers OK`);

        // Test index
        await import(`./src/domains/${domain}/index.ts`);
        console.log(`✅ ${domain} - Index OK`);

      } catch (error) {
        console.log(`❌ ${domain} - Erreur:`, error.message);
      }
    }

    console.log('\n🌐 Test du schéma global...');

    try {
      const { combinedSchema } = await import('./src/domains/schema.ts');
      console.log('✅ Schéma combiné OK');
      console.log(`📊 Tables trouvées: ${Object.keys(combinedSchema).length}`);
    } catch (error) {
      console.log('❌ Erreur schéma global:', error.message);
    }

    console.log('\n🚀 Test GraphQL final...');

    try {
      const domainsModule = await import('./src/domains/index.ts');

      if (domainsModule.baseTypeDefs) {
        console.log('✅ baseTypeDefs disponible');
      }

      // Compter les exports
      const exports = Object.keys(domainsModule);
      const typeDefsExports = exports.filter(name => name.includes('TypeDefs'));
      const resolversExports = exports.filter(name => name.includes('Resolvers'));

      console.log(`📝 TypeDefs exportés: ${typeDefsExports.length}`);
      console.log(`🔧 Resolvers exportés: ${resolversExports.length}`);

      console.log('\n🎯 Export des TypeDefs trouvés:');
      typeDefsExports.forEach(name => console.log(`  ✅ ${name}`));

      console.log('\n🎯 Export des Resolvers trouvés:');
      resolversExports.forEach(name => console.log(`  ✅ ${name}`));

    } catch (error) {
      console.log('❌ Erreur GraphQL:', error.message);
    }

  } catch (error) {
    console.log('❌ Erreur de compilation:', error.message);
  }
}

async function testDatabaseIntegrity() {
  console.log('\n🏗️ Test d\'intégrité de la base de données...');

  try {
    const { combinedSchema } = await import('./src/domains/schema.ts');

    const expectedTables = {
      auth: ['authSessions', 'authAttempts', 'passwordResetTokens', 'emailVerificationTokens'],
      users: ['users', 'userProfiles', 'userWallets'],
      products: ['categories', 'products', 'productVariants'],
      orders: ['orders', 'orderItems', 'walletTransactions', 'cartItems'],
      reviews: ['reviews', 'reviewVotes', 'reviewReports', 'reviewResponses'],
      delivery: ['deliveryProviders', 'deliveryOptions', 'deliveryZones', 'deliveryTracking'],
      notifications: ['notifications', 'notificationPreferences', 'deviceTokens', 'notificationTemplates']
    };

    let totalExpected = 0;
    let totalFound = 0;

    for (const [domain, tables] of Object.entries(expectedTables)) {
      console.log(`\n📊 Domaine ${domain}:`);
      for (const table of tables) {
        totalExpected++;
        if (combinedSchema[table]) {
          console.log(`  ✅ ${table}`);
          totalFound++;
        } else {
          console.log(`  ❌ ${table} manquant`);
        }
      }
    }

    console.log(`\n📈 Résultat: ${totalFound}/${totalExpected} tables trouvées (${Math.round(totalFound/totalExpected*100)}%)`);

    if (totalFound === totalExpected) {
      console.log('🎉 Tous les schémas de domaines sont présents !');
    } else {
      console.log('⚠️  Certaines tables de domaines sont manquantes');
    }

  } catch (error) {
    console.log('❌ Erreur test base de données:', error.message);
  }
}

async function runTests() {
  await testTypeScriptCompilation();
  await testDatabaseIntegrity();

  console.log('\n✅ Tests de compilation terminés!');
}

runTests().catch(console.error);
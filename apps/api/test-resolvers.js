#!/usr/bin/env node

// Script de test pour valider les resolvers et leurs dépendances
console.log('🔧 Test des resolvers et dépendances...\n');

async function testResolverStructure() {
  console.log('📋 Test de la structure des resolvers...');

  const domains = ['auth', 'users', 'products', 'orders', 'reviews', 'delivery', 'notifications'];

  for (const domain of domains) {
    try {
      const resolverModule = await import(`./src/domains/${domain}/resolvers/${domain}.resolvers.ts`);
      const resolvers = resolverModule[`${domain}Resolvers`];

      console.log(`\n🔍 Domaine: ${domain}`);

      if (!resolvers) {
        console.log('  ❌ Resolvers non trouvés');
        continue;
      }

      // Vérifier la structure des resolvers
      const sections = ['Query', 'Mutation', 'Subscription'];
      let totalResolvers = 0;

      for (const section of sections) {
        if (resolvers[section]) {
          const resolverNames = Object.keys(resolvers[section]);
          console.log(`  ✅ ${section}: ${resolverNames.length} resolvers`);

          if (resolverNames.length > 0) {
            console.log(`    📝 ${resolverNames.slice(0, 5).join(', ')}${resolverNames.length > 5 ? '...' : ''}`);
          }

          totalResolvers += resolverNames.length;
        } else {
          console.log(`  ⚪ ${section}: non défini`);
        }
      }

      // Vérifier les resolvers de types
      const typeResolvers = Object.keys(resolvers).filter(key =>
        !['Query', 'Mutation', 'Subscription'].includes(key)
      );

      if (typeResolvers.length > 0) {
        console.log(`  ✅ Type resolvers: ${typeResolvers.length}`);
        console.log(`    📝 ${typeResolvers.slice(0, 3).join(', ')}${typeResolvers.length > 3 ? '...' : ''}`);
        totalResolvers += typeResolvers.length;
      }

      console.log(`  📊 Total: ${totalResolvers} resolvers`);

    } catch (error) {
      console.log(`❌ Erreur domaine ${domain}:`, error.message);
    }
  }
}

async function testResolverDependencies() {
  console.log('\n🔗 Test des dépendances des resolvers...');

  try {
    // Test des imports d'infrastructure
    console.log('📦 Test des dépendances d\'infrastructure...');

    try {
      const { requireAuth, requireAdmin } = await import('./src/infrastructure/context.ts');
      console.log('  ✅ Context helpers importés');

      // Test basique des fonctions
      const mockContext = {
        user: { id: '123', userType: 'USER' },
        isAuthenticated: true
      };

      try {
        const user = requireAuth(mockContext);
        console.log('  ✅ requireAuth fonctionne');
      } catch (error) {
        console.log('  ⚠️  requireAuth:', error.message);
      }

      try {
        requireAdmin(mockContext);
        console.log('  ⚠️  requireAdmin devrait échouer pour un USER normal');
      } catch (error) {
        console.log('  ✅ requireAdmin échoue correctement pour non-admin');
      }

    } catch (error) {
      console.log('  ❌ Erreur context:', error.message);
    }

    // Test des imports Drizzle
    try {
      const { eq, and, desc } = await import('drizzle-orm');
      console.log('  ✅ Drizzle ORM importé');
    } catch (error) {
      console.log('  ❌ Erreur Drizzle:', error.message);
    }

    // Test des types
    try {
      const types = await import('./src/infrastructure/types.ts');
      console.log('  ✅ Types d\'infrastructure importés');
    } catch (error) {
      console.log('  ❌ Erreur types:', error.message);
    }

  } catch (error) {
    console.log('❌ Erreur dépendances:', error.message);
  }
}

async function testResolverCompatibility() {
  console.log('\n🔄 Test de compatibilité des resolvers...');

  try {
    // Test de combinaison des resolvers
    const { allResolvers } = await import('./src/domains/index.ts');

    console.log(`📊 Nombre total de resolvers: ${allResolvers.length}`);

    // Analyser les conflits potentiels
    const queryResolvers = {};
    const mutationResolvers = {};
    const typeResolvers = {};

    for (let i = 0; i < allResolvers.length; i++) {
      const resolver = allResolvers[i];

      // Collecter les queries
      if (resolver.Query) {
        for (const [name, func] of Object.entries(resolver.Query)) {
          if (queryResolvers[name]) {
            console.log(`  ⚠️  Conflit Query: ${name} (résolveur ${i})`);
          } else {
            queryResolvers[name] = true;
          }
        }
      }

      // Collecter les mutations
      if (resolver.Mutation) {
        for (const [name, func] of Object.entries(resolver.Mutation)) {
          if (mutationResolvers[name]) {
            console.log(`  ⚠️  Conflit Mutation: ${name} (résolveur ${i})`);
          } else {
            mutationResolvers[name] = true;
          }
        }
      }

      // Collecter les type resolvers
      const types = Object.keys(resolver).filter(key =>
        !['Query', 'Mutation', 'Subscription'].includes(key)
      );

      for (const typeName of types) {
        if (typeResolvers[typeName]) {
          console.log(`  ⚠️  Conflit Type: ${typeName} (résolveur ${i})`);
        } else {
          typeResolvers[typeName] = true;
        }
      }
    }

    console.log(`  ✅ Queries uniques: ${Object.keys(queryResolvers).length}`);
    console.log(`  ✅ Mutations uniques: ${Object.keys(mutationResolvers).length}`);
    console.log(`  ✅ Types uniques: ${Object.keys(typeResolvers).length}`);

    // Afficher quelques exemples
    console.log('\n📋 Exemples de resolvers disponibles:');
    console.log(`  📍 Queries: ${Object.keys(queryResolvers).slice(0, 10).join(', ')}...`);
    console.log(`  🔧 Mutations: ${Object.keys(mutationResolvers).slice(0, 10).join(', ')}...`);
    console.log(`  📦 Types: ${Object.keys(typeResolvers).slice(0, 10).join(', ')}...`);

  } catch (error) {
    console.log('❌ Erreur compatibilité:', error.message);
  }
}

async function testSchemaResolverConsistency() {
  console.log('\n🎯 Test de cohérence schema-resolvers...');

  try {
    // Vérifier que les schémas correspondent aux resolvers
    const { combinedSchema } = await import('./src/domains/schema.ts');
    const schemaKeys = Object.keys(combinedSchema);

    console.log(`📊 Tables dans le schéma: ${schemaKeys.length}`);

    // Grouper par domaine
    const domainTables = {
      auth: schemaKeys.filter(key => key.includes('auth') || key.includes('password') || key.includes('email')),
      users: schemaKeys.filter(key => key.includes('user') && !key.includes('auth')),
      products: schemaKeys.filter(key => key.includes('product') || key.includes('categor')),
      orders: schemaKeys.filter(key => key.includes('order') || key.includes('cart') || key.includes('wallet')),
      reviews: schemaKeys.filter(key => key.includes('review')),
      delivery: schemaKeys.filter(key => key.includes('delivery')),
      notifications: schemaKeys.filter(key => key.includes('notification') || key.includes('device')),
    };

    console.log('\n📋 Répartition des tables par domaine:');
    for (const [domain, tables] of Object.entries(domainTables)) {
      console.log(`  ${domain}: ${tables.length} tables`);
      if (tables.length > 0) {
        console.log(`    📝 ${tables.slice(0, 3).join(', ')}${tables.length > 3 ? '...' : ''}`);
      }
    }

    const totalMapped = Object.values(domainTables).reduce((sum, tables) => sum + tables.length, 0);
    console.log(`\n📈 Tables mappées: ${totalMapped}/${schemaKeys.length} (${Math.round(totalMapped/schemaKeys.length*100)}%)`);

  } catch (error) {
    console.log('❌ Erreur cohérence:', error.message);
  }
}

async function runResolverTests() {
  await testResolverStructure();
  await testResolverDependencies();
  await testResolverCompatibility();
  await testSchemaResolverConsistency();

  console.log('\n✅ Tests des resolvers terminés !');
}

runResolverTests().catch(console.error);
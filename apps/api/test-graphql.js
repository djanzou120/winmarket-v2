#!/usr/bin/env node

// Script de test pour valider les types GraphQL
console.log('🚀 Test de validation GraphQL...\n');

async function testGraphQLSchema() {
  console.log('📝 Test de construction du schéma GraphQL...');

  try {
    // Import des utilitaires GraphQL
    const { makeExecutableSchema } = await import('@graphql-tools/schema');

    // Import de nos typeDefs et resolvers
    const { allTypeDefs, allResolvers } = await import('./src/domains/index.ts');

    console.log(`📊 TypeDefs trouvés: ${allTypeDefs ? allTypeDefs.length : 0}`);
    console.log(`🔧 Resolvers trouvés: ${allResolvers ? allResolvers.length : 0}`);

    // Convertir les typeDefs en strings si nécessaire
    const typeDefs = allTypeDefs.map(td =>
      typeof td === 'string' ? td : td.loc ? td.loc.source.body : td.toString()
    );

    console.log('✅ TypeDefs convertis en strings');

    // Construire le schéma
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers: allResolvers,
    });

    console.log('✅ Schéma GraphQL construit avec succès !');

    // Test d'introspection basique
    const { buildClientSchema, getIntrospectionQuery, graphql } = await import('graphql');

    const introspectionResult = await graphql({
      schema,
      source: getIntrospectionQuery(),
    });

    if (introspectionResult.errors) {
      console.log('❌ Erreurs d\'introspection:', introspectionResult.errors);
    } else {
      console.log('✅ Introspection GraphQL réussie');

      const clientSchema = buildClientSchema(introspectionResult.data);
      const typeMap = clientSchema.getTypeMap();

      // Compter les types
      const types = Object.keys(typeMap).filter(name => !name.startsWith('__'));
      console.log(`📈 Types GraphQL disponibles: ${types.length}`);

      // Types de notre domaine
      const domainTypes = types.filter(name =>
        ['User', 'Product', 'Order', 'Review', 'Notification', 'DeliveryProvider'].includes(name)
      );

      console.log('🎯 Types de domaine trouvés:');
      domainTypes.forEach(type => console.log(`  ✅ ${type}`));

      // Queries disponibles
      const queryType = clientSchema.getQueryType();
      if (queryType) {
        const queryFields = Object.keys(queryType.getFields());
        console.log(`📋 Queries disponibles: ${queryFields.length}`);

        const domainQueries = queryFields.filter(q =>
          ['me', 'users', 'products', 'orders', 'reviews', 'notifications'].includes(q)
        );

        console.log('🔍 Queries principales:');
        domainQueries.forEach(query => console.log(`  ✅ ${query}`));
      }

      // Mutations disponibles
      const mutationType = clientSchema.getMutationType();
      if (mutationType) {
        const mutationFields = Object.keys(mutationType.getFields());
        console.log(`⚡ Mutations disponibles: ${mutationFields.length}`);

        const domainMutations = mutationFields.filter(m =>
          ['login', 'register', 'createProduct', 'createOrder', 'createReview'].includes(m)
        );

        console.log('🔧 Mutations principales:');
        domainMutations.forEach(mutation => console.log(`  ✅ ${mutation}`));
      }
    }

  } catch (error) {
    console.log('❌ Erreur lors de la construction du schéma:', error.message);
    console.log('Stack:', error.stack);
  }
}

async function testGraphQLQueries() {
  console.log('\n🔍 Test de requêtes GraphQL basiques...');

  try {
    const { makeExecutableSchema } = await import('@graphql-tools/schema');
    const { graphql } = await import('graphql');
    const { allTypeDefs, allResolvers } = await import('./src/domains/index.ts');

    const typeDefs = allTypeDefs.map(td =>
      typeof td === 'string' ? td : td.loc ? td.loc.source.body : td.toString()
    );

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers: allResolvers,
    });

    // Test de requête simple
    const simpleQuery = `
      query TestQuery {
        __schema {
          queryType {
            name
          }
          mutationType {
            name
          }
        }
      }
    `;

    const result = await graphql({
      schema,
      source: simpleQuery,
    });

    if (result.errors) {
      console.log('❌ Erreurs dans la requête test:', result.errors);
    } else {
      console.log('✅ Requête GraphQL de base réussie');
      console.log('📊 Types de base:', result.data);
    }

    // Test de la requête me (si disponible)
    const meQuery = `
      query MeQuery {
        me {
          id
          email
          firstName
          lastName
        }
      }
    `;

    const meResult = await graphql({
      schema,
      source: meQuery,
      contextValue: {
        isAuthenticated: false,
        user: null,
      }
    });

    if (meResult.errors) {
      console.log('⚠️  Requête "me" échoue (normal sans auth):', meResult.errors[0]?.message);
    } else {
      console.log('✅ Requête "me" structurée correctement');
    }

  } catch (error) {
    console.log('❌ Erreur dans les tests de requêtes:', error.message);
  }
}

async function runGraphQLTests() {
  await testGraphQLSchema();
  await testGraphQLQueries();

  console.log('\n🎉 Tests GraphQL terminés !');
}

runGraphQLTests().catch(console.error);
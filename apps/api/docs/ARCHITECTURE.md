# Architecture par Domaines Métier

## Vue d'ensemble

L'API WinMarket V2 a été réorganisée selon les principes du **Domain-Driven Design (DDD)** pour une meilleure séparation des responsabilités et une maintenabilité accrue.

## Structure des Domaines

```
src/domains/
├── auth/                   # 🔐 Authentification & Autorisation
│   ├── schema/            # Schémas DB (sessions, tokens, tentatives)
│   ├── types/             # Types GraphQL (mutations auth, 2FA, social)
│   ├── resolvers/         # Resolvers GraphQL
│   └── services/          # Services métier (validation, crypto)
├── users/                 # 👥 Gestion des Utilisateurs
│   ├── schema/            # Schémas DB (users, profiles, wallets)
│   ├── types/             # Types GraphQL (CRUD users, stats)
│   ├── resolvers/         # Resolvers GraphQL
│   └── services/          # Services métier (profils, permissions)
├── products/              # 📦 Catalogue Produits
│   ├── schema/            # Schémas DB (products, categories, variants)
│   ├── types/             # Types GraphQL (recherche, filtres)
│   ├── resolvers/         # Resolvers GraphQL
│   └── services/          # Services métier (catalogue, prix)
├── orders/                # 🛒 Gestion Commandes
│   ├── schema/            # Schémas DB (orders, items, status)
│   ├── types/             # Types GraphQL (checkout, tracking)
│   ├── resolvers/         # Resolvers GraphQL
│   └── services/          # Services métier (workflow, payment)
├── wallet/                # 💳 Portefeuille Numérique
│   ├── schema/            # Schémas DB (transactions, balances)
│   ├── types/             # Types GraphQL (transferts, history)
│   ├── resolvers/         # Resolvers GraphQL
│   └── services/          # Services métier (comptabilité, sécurité)
├── reviews/               # ⭐ Avis & Notations
│   ├── schema/            # Schémas DB (reviews, votes, reports)
│   ├── types/             # Types GraphQL (modération, stats)
│   ├── resolvers/         # Resolvers GraphQL
│   └── services/          # Services métier (scoring, anti-spam)
├── delivery/              # 🚚 Livraison & Logistique
│   ├── schema/            # Schémas DB (providers, options, zones)
│   ├── types/             # Types GraphQL (estimations, tracking)
│   ├── resolvers/         # Resolvers GraphQL
│   └── services/          # Services métier (calculs, APIs externes)
└── notifications/         # 🔔 Notifications & Communication
    ├── schema/            # Schémas DB (notifications, preferences)
    ├── types/             # Types GraphQL (temps réel, canaux)
    ├── resolvers/         # Resolvers GraphQL
    └── services/          # Services métier (envoi, templates)
```

## Avantages de cette Architecture

### 🎯 **Séparation des Responsabilités**
- Chaque domaine est autonome et encapsule sa logique métier
- Réduction du couplage entre les différentes fonctionnalités
- Facilite la maintenance et les évolutions

### 🔧 **Scalabilité**
- Possibilité d'extraire un domaine en microservice
- Équipes peuvent travailler en parallèle sur différents domaines
- Tests isolés par domaine

### 📝 **Lisibilité du Code**
- Structure claire et logique par fonctionnalité métier
- Navigation intuitive dans le code
- Documentation centralisée par domaine

### 🚀 **Déploiement & DevOps**
- Déploiements sélectifs par domaine
- Monitoring et observabilité granulaire
- Gestion des versions indépendante

## Organisation des Fichiers par Domaine

### Schema (Base de Données)
```typescript
// domains/users/schema/users.schema.ts
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: varchar("email").notNull(),
  // ... autres champs
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### Types (GraphQL)
```typescript
// domains/users/types/users.types.ts
export const usersTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    profile: UserProfile
  }

  extend type Query {
    user(id: ID!): User
    users: [User!]!
  }

  extend type Mutation {
    updateUser(input: UpdateUserInput!): User!
  }
`;
```

### Resolvers (GraphQL)
```typescript
// domains/users/resolvers/users.resolvers.ts
export const usersResolvers: Resolvers = {
  Query: {
    user: async (_parent, { id }, context) => {
      return await context.db.query.users.findFirst({
        where: eq(users.id, id)
      });
    },
  },

  Mutation: {
    updateUser: async (_parent, { input }, context) => {
      // Logique métier
    },
  },

  User: {
    profile: async (parent, _args, context) => {
      // Relations avec autres entités
    },
  },
};
```

### Services (Logique Métier)
```typescript
// domains/users/services/users.service.ts
export class UsersService {
  async validateUserData(userData: NewUser) {
    // Validation métier complexe
  }

  async calculateUserStats(userId: string) {
    // Calculs et agrégations
  }
}
```

### Index (Export du Domaine)
```typescript
// domains/users/index.ts
export { usersTypeDefs } from './types/users.types';
export { usersResolvers } from './resolvers/users.resolvers';
export * from './schema/users.schema';
export * from './services/users.service';
```

## Configuration Centralisée

### Schema Principal
```typescript
// domains/schema.ts
export * from './auth/schema/auth.schema';
export * from './users/schema/users.schema';
export * from './products/schema/products.schema';
// ... tous les domaines
```

### Types GraphQL Combinés
```typescript
// domains/index.ts
import { authTypeDefs, usersTypeDefs, productsTypeDefs } from './';

export const allTypeDefs = [
  baseTypeDefs,
  authTypeDefs,
  usersTypeDefs,
  productsTypeDefs,
  // ... tous les domaines
];
```

### Resolvers Combinés
```typescript
// graphql/resolvers.ts
import { authResolvers, usersResolvers } from '../domains';

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...usersResolvers.Query,
    // ... tous les domaines
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...usersResolvers.Mutation,
    // ... tous les domaines
  },
};
```

## Migration Progressive

### Phase 1: Structure de Base ✅
- [x] Création des dossiers par domaine
- [x] Migration Auth et Users
- [x] Configuration centralisée
- [x] Compatibilité avec l'existant

### Phase 2: Domaines Principaux
- [ ] Migration Products complet
- [ ] Migration Orders complet
- [ ] Migration Wallet complet

### Phase 3: Domaines Avancés
- [ ] Migration Reviews complet
- [ ] Migration Delivery complet
- [ ] Migration Notifications complet

### Phase 4: Services & Optimisation
- [ ] Ajout des services métier
- [ ] Optimisation des requêtes
- [ ] Tests par domaine
- [ ] Documentation technique

## Bonnes Pratiques

### 🏗️ **Structure des Domaines**
- Un domaine = une responsabilité métier claire
- Pas de dépendances cycliques entre domaines
- Communication via les resolvers GraphQL

### 📊 **Gestion des Données**
- Schémas de base isolés par domaine
- Relations cross-domain via ID uniquement
- Agrégations dans les resolvers

### 🔄 **Évolution**
- Nouvelles fonctionnalités dans le bon domaine
- Refactoring par domaine sans impact global
- Versioning des APIs par domaine si nécessaire

### 🧪 **Tests**
- Tests unitaires par domaine
- Tests d'intégration cross-domain
- Mocks des dépendances externes

## Exemple Concret: Domaine Users

```
domains/users/
├── schema/
│   └── users.schema.ts      # Tables: users, userProfiles, userWallets
├── types/
│   └── users.types.ts       # Types GraphQL: User, UserProfile, Wallet
├── resolvers/
│   └── users.resolvers.ts   # CRUD users, relations, permissions
├── services/
│   ├── users.service.ts     # Logique métier utilisateurs
│   ├── profiles.service.ts  # Gestion des profils
│   └── permissions.service.ts # Gestion des permissions
└── index.ts                 # Export du domaine
```

Cette architecture permet une **séparation claire des responsabilités** tout en maintenant la **cohésion fonctionnelle** de chaque domaine métier.

## Prochaines Étapes

1. **Compléter la migration** des domaines restants
2. **Ajouter les services métier** avec la logique complexe
3. **Optimiser les performances** avec des requêtes domaine-spécifiques
4. **Documenter chaque domaine** avec ses spécificités métier
5. **Tests complets** par domaine et intégration

Cette nouvelle architecture rend le code **plus maintenable**, **plus testable** et **plus évolutif** pour les futures fonctionnalités de WinMarket V2.
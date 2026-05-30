# PRD - WinMarket V2 Marketplace
## Document de Spécifications Produit

**Version :** 1.0
**Date :** 29 Mai 2026
**Auteur :** Product Team

---

## 1. Vue d'Ensemble du Projet

### 1.1 Vision Produit
WinMarket V2 est une marketplace multi-modèles (B2B/B2C/C2C) permettant aux utilisateurs d'acheter et vendre des produits via une plateforme web moderne et des applications mobiles natives. La plateforme intègre un système de wallet interne pour faciliter les transactions et un système de livraison flexible géré par les vendeurs.

### 1.2 Objectifs Business
- **Modèle de revenus :** Commission sur transactions + publicité/promotions payantes
- **Timeline :** MVP en 12-15 mois avec toutes les plateformes (web, mobile, admin)
- **Cible :** Marketplace généraliste multi-segments
- **Différenciation :** Wallet interne + système de livraison flexible

## 2. Architecture Technique

### 2.1 Stack Technologique
**Backend API (Dockerisé pour Kubernetes)**
- Node.js + TypeScript
- GraphQL API avec resolvers
- PostgreSQL (données) + Redis (cache)
- Better Auth pour l'authentification
- Containers Docker prêts pour déploiement K8s

**Frontend Web**
- Next.js 14+ (App Router)
- TailwindCSS pour le styling
- Better Auth client integration
- Interface responsive (mobile-first)

**Applications Mobile**
- React Native + Expo
- Tamagui pour l'UI cross-platform (Android + iOS)
- Même API GraphQL que le web

**Backoffice Admin**
- Même stack web avec routes protégées
- Dashboard analytics intégré
- Interface de modération

### 2.2 Services Backend (Microservices)
```
├── Auth Service (Better Auth)
├── User/Profile Service
├── Wallet/Transaction Service
├── Product/Catalog Service
├── Order/Payment Service
├── Delivery/Logistics Service
├── Notification Service
└── Admin/Analytics Service
```

## 3. Modèle de Données

### 3.1 Entités Principales

**User**
```graphql
type User {
  id: ID!
  email: String!
  profile: UserProfile!
  wallet: Wallet!
  role: UserRole! # BUYER, SELLER, ADMIN
  createdAt: DateTime!
  isActive: Boolean!
}
```

**Wallet & Transactions**
```graphql
type Wallet {
  id: ID!
  user: User!
  balance: Float!
  currency: String!
  transactions: [WalletTransaction!]!
}

type WalletTransaction {
  id: ID!
  wallet: Wallet!
  type: TransactionType! # DEPOSIT, WITHDRAWAL, PURCHASE, SALE, COMMISSION
  amount: Float!
  description: String!
  status: TransactionStatus! # PENDING, COMPLETED, FAILED
  provider: String # STRIPE, PAYPAL, BANK_TRANSFER
  createdAt: DateTime!
}
```

**Product & Catalog**
```graphql
type Product {
  id: ID!
  seller: User!
  title: String!
  description: String!
  price: Float!
  images: [String!]!
  category: Category!
  stock: Int!
  isActive: Boolean!
  deliveryOptions: [DeliveryOption!]!
  reviews: [Review!]!
  createdAt: DateTime!
}

type DeliveryOption {
  id: ID!
  product: Product!
  type: DeliveryType! # PICKUP, DELIVERY
  provider: DeliveryProvider # null si PICKUP
  price: Float!
  estimatedDays: Int!
  description: String!
}

type DeliveryProvider {
  id: ID!
  seller: User!
  name: String!
  contactInfo: String!
  serviceZones: [String!]!
  isActive: Boolean!
  pricePerDelivery: Float!
}
```

**Orders & Commerce**
```graphql
type Order {
  id: ID!
  buyer: User!
  items: [OrderItem!]!
  subtotal: Float!
  deliveryFee: Float!
  total: Float!
  deliveryMethod: DeliveryType!
  deliveryProvider: DeliveryProvider
  deliveryAddress: Address
  status: OrderStatus! # PENDING, PAID, SHIPPED, DELIVERED, CANCELLED
  trackingInfo: String
  createdAt: DateTime!
  commission: Float! # Visible uniquement admin/seller
}

type OrderItem {
  id: ID!
  order: Order!
  product: Product!
  quantity: Int!
  unitPrice: Float!
  totalPrice: Float!
}
```

## 4. Fonctionnalités MVP

### 4.1 Pour les Acheteurs
**Authentification & Profil**
- Inscription/connexion via Better Auth
- Profil utilisateur modifiable
- Gestion préférences

**Wallet & Paiements**
- Recharge wallet via providers externes (configurés manuellement)
- Consultation solde et historique transactions
- Possibilité de retrait vers comptes externes

**Shopping & Commandes**
- Navigation catalogue avec recherche/filtres avancés
- Ajout panier et achat direct depuis wallet
- Choix options livraison par vendeur :
  - Retrait chez vendeur (gratuit)
  - Livraison via livreurs du vendeur (tarifs vendeur)
- Historique commandes avec suivi
- Système de reviews produits

**Communication**
- Chat basique avec vendeurs
- Système de signalements

### 4.2 Pour les Vendeurs
**Gestion Produits**
- Création/édition produits (photos, descriptions, prix)
- Gestion stock en temps réel
- Publication immédiate (modération réactive)

**Gestion Livraisons**
- Ajout/gestion de livreurs partenaires
- Configuration tarifs livraison par livreur
- Si aucun livreur : seul retrait disponible

**Gestion Commandes**
- Tableau de bord commandes
- Mise à jour statuts et tracking
- Communication avec acheteurs

**Finances**
- Consultation revenus (prix produit - commission plateforme)
- Historique des commissions retenues
- Retrait wallet vers comptes externes

### 4.3 Pour les Admins (Backoffice)
**Dashboard Analytics**
- Métriques globales : utilisateurs, transactions, revenus
- Graphiques ventes et commissions
- KPIs marketplace

**Modération**
- Gestion signalements utilisateurs
- Modération produits signalés
- Suspension/activation comptes

**Configuration**
- Paramétrage taux de commission
- Gestion providers de paiement
- Configuration générale plateforme

## 5. Flows Utilisateur Principaux

### 5.1 Flow d'Achat Standard
1. **Découverte produit** → Catalogue/Recherche
2. **Consultation produit** → Prix + options livraison vendeur
3. **Sélection livraison** :
   - Si vendeur sans livreurs : seul "Retrait" disponible
   - Si vendeur avec livreurs : choix "Retrait" OU liste livreurs
4. **Validation commande** → Prix affiché = produit + livraison
5. **Paiement wallet** → Déduction automatique
6. **Traitement backend** :
   - Commission automatique (invisible acheteur)
   - Versement vendeur = prix produit - commission
7. **Notification vendeur** → Préparation commande

### 5.2 Flow de Vente
1. **Création produit** → Informations + photos
2. **Configuration livraison** :
   - Retrait obligatoire (gratuit)
   - Livreurs optionnels (avec tarifs)
3. **Publication immédiate** → Visible sur marketplace
4. **Réception commande** → Notification + détails
5. **Traitement commande** → Préparation + expédition
6. **Réception paiement** → Versement wallet (moins commission)

### 5.3 Flow Financier (Wallet)
**Recharge Acheteur :**
1. Sélection montant + provider externe
2. Paiement via provider configuré
3. Crédit wallet automatique

**Retrait (Tous utilisateurs) :**
1. Sélection montant + compte destinataire
2. Vérification solde disponible
3. Transfert vers provider externe
4. Débit wallet après confirmation

## 6. Système de Commission & Revenus

### 6.1 Commission sur Transactions
- **Calcul :** Pourcentage configurable du prix produit (hors livraison)
- **Visibilité :**
  - Acheteur : ne voit que prix produit + livraison
  - Vendeur : voit montant reçu (produit - commission)
  - Admin : visibilité complète avec analytics

### 6.2 Publicité & Promotions
**Phase MVP :**
- Système de boost payant pour produits
- Mise en avant dans résultats de recherche
- Analytics basiques pour vendeurs

**Évolutions futures :**
- Bannières publicitaires
- Système d'enchères pour placements
- Targeting avancé

## 7. Sécurité & Modération

### 7.1 Modération Réactive
- **Publication immédiate** des produits
- **Système de signalements** par utilisateurs
- **Modération manuelle** des contenus signalés
- **Actions admin :** suppression, suspension, avertissement

### 7.2 Sécurité Financière
- **Transactions wallet** sécurisées et tracées
- **Providers externes** pour recharges/retraits
- **Audit trail** complet des mouvements financiers
- **Limites configurables** (montants max, fréquence)

## 8. Performance & Scalabilité

### 8.1 Architecture Cloud
- **Deployment Kubernetes** avec auto-scaling
- **Base de données :** PostgreSQL avec réplication
- **Cache :** Redis pour sessions et données fréquentes
- **CDN :** Pour images produits et assets statiques

### 8.2 Optimisations
- **API GraphQL** pour requests optimisées mobile
- **Pagination** sur tous les listings
- **Lazy loading** images et composants
- **Search indexing** pour catalogue produits

## 9. Analytics & Métriques

### 9.1 KPIs Business
- **GMV** (Gross Merchandise Value)
- **Taux de commission** moyen
- **Revenus publicitaires**
- **Rétention utilisateurs** (acheteurs/vendeurs)

### 9.2 KPIs Produit
- **Taux de conversion** catalogue → achat
- **Panier moyen**
- **Utilisation options livraison**
- **Satisfaction** (reviews, signalements)

## 10. Roadmap Détaillée avec Milestones

### 🎯 **MILESTONE 1 : Foundation & Infrastructure (Sprints 1-4)**
**Durée :** 8 semaines | **Objectif :** Base technique solide

#### **Sprint 1 - Infrastructure Setup (2 semaines)**
- [ ] Configuration environnement de développement (Docker Compose)
- [ ] Setup Kubernetes cluster et namespaces
- [ ] Configuration CI/CD pipeline basique
- [ ] Setup PostgreSQL avec réplication
- [ ] Configuration Redis cache
- [ ] Configuration MinIO pour stockage fichiers
- [ ] Setup monitoring basique (logs, métriques)
- [ ] Documentation architecture déployée

#### **Sprint 2 - Database & API Core (2 semaines)**
- [ ] Schema Drizzle ORM complet (12+ tables)
- [ ] Migrations et scripts de seed
- [ ] API GraphQL modulaire (structure de base)
- [ ] Module Auth avec Better Auth
- [ ] Middleware sécurité et rate limiting
- [ ] Tests unitaires infrastructure (>70% couverture)
- [ ] Documentation API (GraphQL Playground)

#### **Sprint 3 - Core Business Logic (2 semaines)**
- [ ] Module Users (CRUD, profils, rôles)
- [ ] Module Products (création, édition, recherche)
- [ ] Module Wallet (transactions, balances)
- [ ] Module Orders (création, états, workflow)
- [ ] Business rules validation
- [ ] DataLoaders pour performance
- [ ] Tests d'intégration modules métier

#### **Sprint 4 - Authentication & Security (2 semaines)**
- [ ] Authentification complète (login/register/reset)
- [ ] Gestion des rôles (BUYER/SELLER/ADMIN)
- [ ] JWT tokens avec refresh
- [ ] OAuth providers (Google, Facebook)
- [ ] Security middleware GraphQL
- [ ] Validation et sanitization inputs
- [ ] Tests sécurité (penetration testing basique)

### 🛍️ **MILESTONE 2 : Core Marketplace (Sprints 5-8)**
**Durée :** 8 semaines | **Objectif :** MVP Marketplace fonctionnel

#### **Sprint 5 - Product Management (2 semaines)**
- [ ] Interface vendeur (création/édition produits)
- [ ] Upload images avec MinIO
- [ ] Gestion catégories et sous-catégories
- [ ] Système de stock temps réel
- [ ] Validation produits (modération réactive)
- [ ] Search full-text PostgreSQL
- [ ] Filtres avancés (prix, catégorie, vendeur)

#### **Sprint 6 - Order Processing (2 semaines)**
- [ ] Panier d'achat (session/persistant)
- [ ] Checkout workflow complet
- [ ] Calcul automatique des commissions
- [ ] États des commandes (workflow)
- [ ] Notifications vendeurs/acheteurs
- [ ] Gestion des annulations
- [ ] Historique des commandes

#### **Sprint 7 - Wallet System (2 semaines)**
- [ ] Recharge wallet (providers externes)
- [ ] Retrait vers comptes externes
- [ ] Transactions internes sécurisées
- [ ] Commission automatique (invisible acheteurs)
- [ ] Historique transactions détaillé
- [ ] Reconciliation financière
- [ ] Audit trail complet

#### **Sprint 8 - Delivery Management (2 semaines)**
- [ ] Gestion livreurs par vendeur
- [ ] Configuration tarifs livraison
- [ ] Option retrait gratuit
- [ ] Calcul frais de port automatique
- [ ] Suivi commandes avec tracking
- [ ] Interface livreur basique
- [ ] Notifications de livraison

### 📱 **MILESTONE 3 : Frontend Applications (Sprints 9-12)**
**Durée :** 8 semaines | **Objectif :** Interfaces utilisateur complètes

#### **Sprint 9 - Web Application Core (2 semaines)**
- [ ] Next.js setup avec App Router
- [ ] Apollo Client configuration
- [ ] Components UI réutilisables
- [ ] Pages authentification (login/register)
- [ ] Navigation et layout responsive
- [ ] Système de notifications toast
- [ ] PWA configuration basique

#### **Sprint 10 - Marketplace Web Interface (2 semaines)**
- [ ] Page d'accueil avec featured products
- [ ] Catalogue produits avec pagination
- [ ] Recherche et filtres avancés
- [ ] Pages détail produit
- [ ] Panier et checkout
- [ ] Profils vendeur publics
- [ ] Système de reviews et ratings

#### **Sprint 11 - Mobile Application (2 semaines)**
- [ ] Expo + EAS configuration
- [ ] Tamagui UI components
- [ ] Navigation React Navigation
- [ ] Écrans authentification
- [ ] Marketplace mobile (produits, recherche)
- [ ] Panier et checkout mobile
- [ ] Push notifications setup

#### **Sprint 12 - Dashboard Interfaces (2 semaines)**
- [ ] Dashboard vendeur (produits, commandes)
- [ ] Dashboard acheteur (commandes, wallet)
- [ ] Interface admin (modération, analytics)
- [ ] Formulaires gestion (produits, profil)
- [ ] Analytics basiques (graphiques)
- [ ] Export données (CSV, PDF)
- [ ] Tests E2E complets (Playwright)

### 🔧 **MILESTONE 4 : Advanced Features (Sprints 13-16)**
**Durée :** 8 semaines | **Objectif :** Features avancées et optimisations

#### **Sprint 13 - Search & Discovery (2 semaines)**
- [ ] Search engine optimisé (Elasticsearch ou PostgreSQL FTS)
- [ ] Autocomplete et suggestions
- [ ] Filtres facetés avancés
- [ ] Recommandations basiques
- [ ] Trending products
- [ ] SEO optimization
- [ ] Analytics de recherche

#### **Sprint 14 - Communication System (2 semaines)**
- [ ] Chat basique vendeur-acheteur
- [ ] Système de messagerie
- [ ] Notifications en temps réel (WebSocket)
- [ ] Support client intégré
- [ ] FAQ automatisée
- [ ] Templates de messages
- [ ] Modération des messages

#### **Sprint 15 - Reviews & Ratings (2 semaines)**
- [ ] Système reviews complet
- [ ] Ratings vendeur et produit
- [ ] Photos dans reviews
- [ ] Modération reviews
- [ ] Réponses vendeurs aux reviews
- [ ] Analytics satisfaction
- [ ] Badges de confiance

#### **Sprint 16 - Analytics & Optimization (2 semaines)**
- [ ] Tableau de bord analytics avancé
- [ ] KPIs temps réel
- [ ] Rapports automatisés
- [ ] A/B testing framework
- [ ] Performance monitoring avancé
- [ ] Caching stratégique
- [ ] Optimisations base de données

### 🚀 **MILESTONE 5 : Production Ready (Sprints 17-18)**
**Durée :** 4 semaines | **Objectif :** Mise en production

#### **Sprint 17 - Production Deployment (2 semaines)**
- [ ] Infrastructure production Kubernetes
- [ ] Configuration SSL/TLS
- [ ] CDN pour assets statiques
- [ ] Backup automatisé base de données
- [ ] Monitoring production (DataDog/Grafana)
- [ ] Alerting et incident response
- [ ] Load testing et stress testing

#### **Sprint 18 - Go-Live & Stabilization (2 semaines)**
- [ ] Déploiement production final
- [ ] Tests de charge réels
- [ ] Onboarding utilisateurs pilots
- [ ] Documentation utilisateur complète
- [ ] Support utilisateur setup
- [ ] Hotfixes et optimisations
- [ ] Validation critères de succès MVP

---

### 📈 **Post-MVP : Évolutions Futures**

#### **Phase 2 - Enhanced Marketplace (Mois 6-9)**
- [ ] **Chat avancé** avec fichiers et notifications push
- [ ] **Système de fidélité** et codes promo
- [ ] **API publique** pour intégrations tierces
- [ ] **Analytics avancées** pour vendeurs
- [ ] **Payment providers** additionnels
- [ ] **Multi-devises** support
- [ ] **Marketplace B2B** features

#### **Phase 3 - Scale & Intelligence (Mois 10-12)**
- [ ] **Intelligence artificielle** pour recommandations
- [ ] **Machine learning** pour détection fraude
- [ ] **International** (multi-langues)
- [ ] **Écosystème partenaires** (logistics, fintech)
- [ ] **Microservices migration** (extraction modules)
- [ ] **Advanced analytics** et business intelligence
- [ ] **Enterprise features** (SLA, support prioritaire)

---

## Critères de Succès MVP

**Technique :**
- [ ] Déploiement K8s fonctionnel
- [ ] Applications web + mobile opérationnelles
- [ ] Système wallet complet (recharge/retrait)
- [ ] Flow achat-vente end-to-end

**Business :**
- [ ] Commission automatique fonctionnelle
- [ ] Système de modération réactif
- [ ] Analytics admin basiques
- [ ] Support multi-providers paiement

**Utilisateur :**
- [ ] Inscription/achat en moins de 3 minutes
- [ ] Publication produit en moins de 2 minutes
- [ ] Système de livraison flexible opérationnel
- [ ] Interface admin complète pour modération

---

*Ce document servira de référence pour l'équipe de développement et sera mis à jour selon les retours utilisateurs et évolutions business.*
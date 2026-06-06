# Guide d'utilisation du Makefile WinMarket V2

Ce Makefile principal orchestrera tous les services du monorepo WinMarket V2.

## 🚀 Démarrage ultra-rapide

```bash
# Installation et configuration complète en une commande
make quick-start

# Démarre tous les services de développement
make dev-full
```

## 🏗️ Architecture du monorepo

```
WinMarket V2/
├── apps/
│   ├── api/           # API GraphQL (Bun + TypeScript)
│   ├── web/           # App Web (Next.js + React)
│   ├── admin/         # Dashboard Admin (Next.js)
│   └── mobile/        # App Mobile (Expo + React Native)
├── packages/          # Packages partagés
└── docker-compose.yml # Services d'infrastructure
```

## 📋 Commandes principales

### 🔧 Setup & Installation
```bash
make install          # Installe toutes les dépendances
make setup            # Configuration complète (Docker + DB)
make quick-start      # Installation + setup + guide
make env-check        # Vérifie l'environnement
```

### 🚀 Développement
```bash
# Développement multi-services
make dev-full         # Lance API + Web + Admin
make dev-api          # Lance uniquement l'API (port 4000)
make dev-web          # Lance uniquement le Web (port 3000)
make dev-admin        # Lance uniquement l'Admin (port 3001)
make dev-mobile       # Lance l'app mobile (Expo)

# Informations
make status           # Statut de tous les services
make help             # Aide complète
```

### 🏗️ Build & Production
```bash
make build-all        # Build complet de tous les services
make build-packages   # Build des packages seulement
make build-apps       # Build des apps seulement
```

### 🧪 Tests & Qualité
```bash
make test-all         # Tous les tests
make lint-all         # Lint tous les projets
make type-check-all   # Vérification TypeScript
make ci               # Pipeline CI complète
```

### 🗄️ Base de données
```bash
make db-up            # Démarre PostgreSQL + Redis + MinIO
make db-status        # Statut des services DB
make db-migrate       # Lance les migrations
make db-seed          # Seed la base de données
make db-studio        # Lance Drizzle Studio
make db-reset         # ⚠️ Remet à zéro la DB
```

### 🐳 Docker
```bash
make docker-up        # Démarre tous les services
make docker-down      # Arrête tous les services
make docker-logs      # Logs en temps réel
make docker-tools     # Lance PgAdmin + Redis Commander
make docker-clean     # ⚠️ Nettoie tout Docker
```

## 🎯 Gestion des services individuels

### API GraphQL
```bash
make api help         # Aide spécifique à l'API
make api dev          # Lance l'API en développement
make api test-all     # Tests d'architecture complets
make api db-migrate   # Migrations via l'API
make api build        # Build de l'API
```

### Web App
```bash
make web help         # Commandes disponibles
make web dev          # Développement (port 3000)
make web build        # Build pour production
make web lint         # Lint du code Web
```

### Admin Dashboard
```bash
make admin dev        # Développement (port 3001)
make admin build      # Build pour production
make admin type-check # Vérification TypeScript
```

### Mobile App
```bash
make mobile dev       # Lance Expo
make mobile android   # Émulateur Android
make mobile ios       # Émulateur iOS
make mobile build:android  # Build Android (EAS)
make mobile build:ios     # Build iOS (EAS)
```

## 🌐 URLs de développement

| Service | URL | Description |
|---------|-----|-------------|
| API GraphQL | http://localhost:4000 | Endpoint GraphQL + Playground |
| Web App | http://localhost:3000 | Application utilisateur |
| Admin Dashboard | http://localhost:3001 | Interface d'administration |
| PgAdmin | http://localhost:5050 | Administration PostgreSQL |
| Redis Commander | http://localhost:8081 | Administration Redis |
| Drizzle Studio | http://localhost:4983 | Explorateur de base de données |

## 🛠️ Outils d'administration

Après `make docker-tools` :

- **PgAdmin** (PostgreSQL)
  - URL: http://localhost:5050
  - Email: admin@winmarket.com
  - Password: admin

- **Redis Commander** (Redis)
  - URL: http://localhost:8081
  - Auto-connecté à Redis

- **Drizzle Studio** (Base de données)
  - Commande: `make db-studio`
  - URL: http://localhost:4983

## 🔄 Workflows recommandés

### Premier lancement
```bash
make quick-start      # Installation complète
make status          # Vérifier que tout est OK
make dev-full        # Démarrer le développement
```

### Développement quotidien
```bash
make db-status       # Vérifier les services
make dev-api         # Lancer l'API
# Dans un autre terminal :
make dev-web         # Lancer le Web
```

### Avant un commit
```bash
make ci              # Pipeline complète
make api test-all    # Tests d'architecture API
```

### Debug base de données
```bash
make docker-tools    # Lancer les outils
make db-studio       # Explorateur Drizzle
# Puis aller sur PgAdmin
```

## 🚨 Commandes de maintenance

```bash
make clean           # Nettoie tous les fichiers générés
make reset           # Remet à zéro et réinstalle
make docker-clean    # ⚠️ Nettoie Docker (destructif)
make deps-check      # Vérifier les dépendances obsolètes
```

## 💡 Astuces

1. **Services individuels** : Utilisez `make <service> <command>` pour cibler un service
2. **Statut global** : `make status` pour voir l'état de tout le projet
3. **Aide contextuelle** : Chaque service a son aide (`make api help`)
4. **Docker indépendant** : Les services DB peuvent tourner sans les apps
5. **Mobile flexible** : `make mobile android` lance directement sur émulateur

## 🆘 En cas de problème

```bash
make env-check       # Vérifier l'environnement
make status          # État des services
make docker-logs     # Logs des services Docker
make reset           # Remise à zéro complète
```

---

🎉 **Le Makefile unifie toute la gestion du monorepo WinMarket V2 !**
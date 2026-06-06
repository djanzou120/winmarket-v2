# Guide d'utilisation du Makefile WinMarket V2 API

Ce Makefile fournit tous les helpers essentiels pour développer l'API GraphQL WinMarket V2.

## 🚀 Démarrage rapide

```bash
# Installation complète en une commande
make quick-start

# Lancer le serveur de développement
make dev
```

## 📋 Commandes principales

### Développement
```bash
make install        # Installe les dépendances
make dev           # Lance le serveur en développement
make build         # Compile l'application
make start         # Lance l'app en production
make clean         # Nettoie les fichiers générés
```

### Tests & Validation
```bash
make test-all      # Lance tous les tests d'architecture
make test-compilation  # Test compilation TypeScript
make test-domains     # Test les domaines métier
make test-graphql     # Test le schéma GraphQL
make test-resolvers   # Test les resolvers

make lint          # Vérification ESLint
make type-check    # Vérification TypeScript
make format        # Formatage du code
```

### Base de données
```bash
make db-up         # Démarre PostgreSQL, Redis, MinIO
make db-status     # Statut des services
make db-migrate    # Lance les migrations
make db-seed       # Seed la base de données
make db-studio     # Lance Drizzle Studio
make db-reset      # Remet à zéro la DB (⚠️ destructif)
```

### Docker
```bash
make docker-up     # Démarre tous les services
make docker-down   # Arrête tous les services
make docker-logs   # Affiche les logs
make docker-tools  # Lance PgAdmin + Redis Commander
make docker-clean  # Nettoie Docker (⚠️ destructif)
```

### Workflows
```bash
make ci            # Pipeline CI (lint + tests)
make ci-full       # Pipeline CI complet (avec type-check)
make deploy-check  # Vérifications avant déploiement
make env-check     # Vérifie l'environnement
```

## 🛠️ Services d'administration

Après `make docker-tools` :
- **PgAdmin** : http://localhost:5050
  - Email: admin@winmarket.com
  - Password: admin
- **Redis Commander** : http://localhost:8081
- **Drizzle Studio** : `make db-studio` puis http://localhost:4983

## 🔧 Configuration

Le Makefile utilise les variables d'environnement :
- `NODE_ENV` (défaut: development)
- `API_PORT` (défaut: 4000)
- `DB_HOST` (défaut: localhost)

## 💡 Conseils

1. **Premier lancement** : `make quick-start`
2. **Développement quotidien** : `make db-up && make dev`
3. **Avant un commit** : `make ci`
4. **Debug DB** : `make docker-tools` puis PgAdmin
5. **Tests complets** : `make test-all`

## 🆘 Aide

```bash
make help          # Affiche toutes les commandes disponibles
make env-check     # Vérifie que tout est bien installé
```

---
💡 **Tip** : Toutes les commandes affichent des couleurs pour une meilleure lisibilité !
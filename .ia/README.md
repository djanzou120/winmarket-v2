# 🤖 Documentation IA - WinMarket V2

Ce dossier contient toute la documentation générée et gérée par l'IA pour le projet WinMarket V2.

## 📁 Structure

```
.ia/
├── docs/                    # Documentation produit et guides
│   ├── PRD.md              # Product Requirements Document complet
│   └── QUICKSTART.md       # Guide de démarrage rapide
├── architecture/           # Documentation architecture
│   └── NEW_STRUCTURE.md    # Architecture modular monolith
├── sessions/               # Historique des sessions IA
└── claude/                 # Configuration Claude spécifique
```

## 📋 Documents Disponibles

### **📊 Documentation Produit**
- **[PRD.md](./docs/PRD.md)** - Spécifications complètes du produit
  - Vision et objectifs business
  - Architecture technique avec Drizzle ORM
  - Fonctionnalités MVP détaillées
  - Modèle de données GraphQL
  - Timeline 12-15 mois

- **[QUICKSTART.md](./docs/QUICKSTART.md)** - Guide de démarrage rapide
  - Installation en 5 minutes
  - Configuration Docker (PostgreSQL, Redis, MinIO)
  - Comptes de test prêts
  - Dépannage commun

### **🏗️ Documentation Architecture**
- **[NEW_STRUCTURE.md](./architecture/NEW_STRUCTURE.md)** - Nouvelle architecture
  - Migration microservices → modular monolith
  - Structure monorepo avec Bun
  - Modules GraphQL prêts pour microservices
  - Intégration MinIO pour stockage

## 🎯 Objectif

Cette structure permet de :
- **Centraliser** toute la documentation IA
- **Séparer** les docs techniques du code source
- **Maintenir** l'historique des décisions architecturales
- **Faciliter** la collaboration avec l'IA sur les specs

## 🔄 Mise à Jour

Les documents sont automatiquement mis à jour lors des sessions IA et reflètent toujours l'état actuel du projet.

---

*Documentation générée et maintenue par Claude AI*
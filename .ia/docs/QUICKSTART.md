# 🚀 WinMarket V2 - Démarrage Rapide

## ⚡ Installation et Démarrage (5 minutes)

### 1. **Prérequis**
```bash
# Installer Bun (recommandé)
curl -fsSL https://bun.sh/install | bash

# Ou utiliser Node.js 18+
node --version  # 18+
```

### 2. **Installation**
```bash
# Cloner le projet
git clone <votre-repo>
cd winmarket-v2

# Installer les dépendances
bun install
```

### 3. **Configuration Infrastructure**
```bash
# Démarrer PostgreSQL, Redis et MinIO avec Docker
docker-compose up -d postgres redis minio

# Attendre que les services soient prêts (30 secondes)
docker-compose logs -f postgres
# Ctrl+C quand vous voyez "database system is ready to accept connections"
```

### 4. **Configuration API**
```bash
# Copier le fichier d'environnement
cp apps/api/.env.example apps/api/.env

# Générer et appliquer les migrations
cd packages/database
bun run generate
bun run migrate
bun run seed
cd ../..
```

### 5. **Démarrer le Développement**
```bash
# Démarrer tous les services
bun run dev
```

### 6. **Accès aux Applications**
- 🌐 **Web :** http://localhost:3000
- 📱 **Mobile :** `bun run dev:mobile` (nécessite Expo CLI)
- ⚙️ **Admin :** http://localhost:3001
- 🔧 **GraphQL API :** http://localhost:4000/graphql
- 🗄️ **pgAdmin :** http://localhost:5050 (admin@winmarket.com / admin)
- 📁 **MinIO Console :** http://localhost:9001 (minioadmin / minioadmin)

---

## 🐛 Dépannage Rapide

### Erreur de Base de Données
```bash
# Redémarrer PostgreSQL
docker-compose restart postgres

# Vérifier la connexion
docker-compose exec postgres psql -U winmarket -d winmarket_v2 -c "SELECT 1;"
```

### Erreur de Cache Redis
```bash
# Redémarrer Redis
docker-compose restart redis

# Vérifier Redis
docker-compose exec redis redis-cli ping
```

### Erreur MinIO File Storage
```bash
# Redémarrer MinIO
docker-compose restart minio

# Vérifier MinIO (doit retourner du XML)
curl http://localhost:9000/minio/health/live
```

### Erreur de Migration
```bash
# Réinitialiser la base (ATTENTION: supprime toutes les données)
cd packages/database
rm -rf migrations/
bun run generate
bun run migrate
bun run seed
```

### Port déjà utilisé
```bash
# Voir quels ports sont utilisés
lsof -i :4000  # API
lsof -i :3000  # Web
lsof -i :5432  # PostgreSQL

# Tuer un processus si nécessaire
kill -9 <PID>
```

---

## 📁 Structure du Projet

```
winmarket-v2/
├── 🎯 apps/
│   ├── api/          # GraphQL API (Port 4000)
│   ├── web/          # Web Marketplace (Port 3000)
│   ├── mobile/       # Apps Mobile (Expo)
│   └── admin/        # Dashboard Admin (Port 3001)
├── 📦 packages/
│   ├── database/     # Drizzle ORM + PostgreSQL
│   ├── shared/       # Types & utilitaires
│   └── ui/           # Composants réutilisables
└── 🐳 docker-compose.yml  # PostgreSQL + Redis
```

---

## 🎯 Prochaines Étapes

1. **Tester l'API :** http://localhost:4000/graphql
2. **Voir les données :** http://localhost:5050 (pgAdmin)
3. **Lire la doc complète :** [README.md](./README.md)
4. **Développer :** Modifier les fichiers dans `apps/` et `packages/`

---

## ⭐ Comptes de Test Créés

```
Admin: admin@winmarket.com (password123)
Vendeur: seller@winmarket.com (password123)
Acheteur: buyer@winmarket.com (password123)
```

**Votre marketplace est maintenant prête pour le développement ! 🎉**
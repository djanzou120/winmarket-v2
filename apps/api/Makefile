# WinMarket V2 API - Makefile
# Helpers pour le développement de l'API GraphQL

.PHONY: help install dev build start clean test lint type-check
.PHONY: db-up db-down db-reset db-migrate db-seed db-studio db-status
.PHONY: docker-up docker-down docker-logs docker-clean docker-tools
.PHONY: test-all test-watch test-domains test-graphql test-resolvers test-compilation
.PHONY: format check-deps security-audit

# Variables
NODE_ENV ?= development
API_PORT ?= 4000
DB_HOST ?= localhost
DB_PORT ?= 5432
DB_NAME ?= winmarket_v2
COMPOSE_FILE = ../../docker-compose.yml
DOCKER_COMPOSE = docker compose

# Couleurs pour l'affichage
RED    = \033[0;31m
GREEN  = \033[0;32m
YELLOW = \033[0;33m
BLUE   = \033[0;34m
PURPLE = \033[0;35m
CYAN   = \033[0;36m
WHITE  = \033[0;37m
NC     = \033[0m # No Color

##@ Aide
help: ## Affiche cette aide
	@echo "$(CYAN)WinMarket V2 API - Commandes disponibles:$(NC)\n"
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make $(CYAN)<target>$(NC)\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(CYAN)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(PURPLE)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Installation & Développement
install: ## Installe les dépendances
	@echo "$(YELLOW)📦 Installation des dépendances...$(NC)"
	@bun install
	@echo "$(GREEN)✅ Dépendances installées$(NC)"

dev: ## Lance le serveur en mode développement
	@echo "$(BLUE)🚀 Démarrage du serveur de développement...$(NC)"
	@bun run dev

build: ## Compile l'application
	@echo "$(YELLOW)🔨 Compilation de l'application...$(NC)"
	@bun run build
	@echo "$(GREEN)✅ Application compilée$(NC)"

start: ## Lance l'application en production
	@echo "$(GREEN)🚀 Démarrage de l'application...$(NC)"
	@bun run start

clean: ## Nettoie les fichiers générés
	@echo "$(RED)🧹 Nettoyage des fichiers...$(NC)"
	@bun run clean
	@rm -rf tsconfig.tsbuildinfo
	@echo "$(GREEN)✅ Nettoyage terminé$(NC)"

##@ Tests & Validation
test: ## Lance tous les tests
	@echo "$(CYAN)🧪 Lancement des tests...$(NC)"
	@bun test

test-watch: ## Lance les tests en mode watch
	@echo "$(CYAN)👀 Tests en mode watch...$(NC)"
	@bun run test:watch

test-all: test-compilation test-domains test-graphql test-resolvers ## Lance tous les tests d'architecture
	@echo "$(GREEN)🎉 Tous les tests d'architecture passés !$(NC)"

test-compilation: ## Test la compilation TypeScript
	@echo "$(YELLOW)🔍 Test de compilation TypeScript...$(NC)"
	@bun test-compilation.js

test-domains: ## Test les domaines métier
	@echo "$(YELLOW)🏗️ Test des domaines métier...$(NC)"
	@bun test-domains.js

test-graphql: ## Test le schéma GraphQL
	@echo "$(YELLOW)🚀 Test du schéma GraphQL...$(NC)"
	@bun test-graphql.js

test-resolvers: ## Test les resolvers GraphQL
	@echo "$(YELLOW)🔧 Test des resolvers...$(NC)"
	@bun test-resolvers.js

lint: ## Vérifie le code avec ESLint
	@echo "$(BLUE)🔍 Vérification du code...$(NC)"
	@bun run lint

type-check: ## Vérifie les types TypeScript
	@echo "$(BLUE)📝 Vérification des types...$(NC)"
	@bun run type-check

type-check-strict: ## Vérifie les types TypeScript (strict)
	@echo "$(BLUE)📝 Vérification stricte des types...$(NC)"
	@tsc --noEmit --strict

format: ## Formate le code
	@echo "$(PURPLE)✨ Formatage du code...$(NC)"
	@bunx prettier --write "src/**/*.{ts,js,json}"

##@ Base de données
db-up: ## Démarre les services de base de données
	@echo "$(GREEN)🗄️ Démarrage des services de base de données...$(NC)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d postgres redis minio

db-down: ## Arrête les services de base de données
	@echo "$(RED)🛑 Arrêt des services de base de données...$(NC)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down

db-status: ## Affiche le statut des services
	@echo "$(CYAN)📊 Statut des services:$(NC)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) ps

db-logs: ## Affiche les logs de la base de données
	@echo "$(CYAN)📋 Logs de la base de données:$(NC)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f postgres

db-migrate: ## Lance les migrations
	@echo "$(YELLOW)🔄 Migration de la base de données...$(NC)"
	@bun run db:migrate-run
	@echo "$(GREEN)✅ Migrations appliquées$(NC)"

db-generate: ## Génère les migrations Drizzle
	@echo "$(YELLOW)⚙️ Génération des migrations...$(NC)"
	@bun run db:generate

db-seed: ## Seed la base de données
	@echo "$(YELLOW)🌱 Seed de la base de données...$(NC)"
	@bun run db:seed
	@echo "$(GREEN)✅ Base de données seedée$(NC)"

db-reset: ## Remet à zéro la base de données
	@echo "$(RED)⚠️ Remise à zéro de la base de données...$(NC)"
	@read -p "Êtes-vous sûr ? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	@bun run db:reset
	@echo "$(GREEN)✅ Base de données remise à zéro$(NC)"

db-studio: ## Lance Drizzle Studio
	@echo "$(PURPLE)🎨 Lancement de Drizzle Studio...$(NC)"
	@bun run db:studio

##@ Docker
docker-up: ## Démarre tous les services Docker
	@echo "$(GREEN)🐳 Démarrage des services Docker...$(NC)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d

docker-down: ## Arrête tous les services Docker
	@echo "$(RED)🛑 Arrêt des services Docker...$(NC)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down

docker-logs: ## Affiche les logs Docker
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f

docker-clean: ## Nettoie les ressources Docker
	@echo "$(RED)🧹 Nettoyage Docker...$(NC)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down -v --remove-orphans
	@docker system prune -f

docker-tools: ## Démarre les outils d'administration
	@echo "$(PURPLE)🛠️ Démarrage des outils d'administration...$(NC)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) --profile tools up -d pgadmin redis-commander
	@echo "$(CYAN)📊 PgAdmin disponible sur: http://localhost:5050$(NC)"
	@echo "$(CYAN)📊 Redis Commander disponible sur: http://localhost:8081$(NC)"

##@ Utilitaires
check-deps: ## Vérifie les dépendances obsolètes
	@echo "$(BLUE)🔍 Vérification des dépendances...$(NC)"
	@bunx npm-check-updates

security-audit: ## Audit de sécurité
	@echo "$(RED)🔒 Audit de sécurité...$(NC)"
	@bun audit

env-check: ## Vérifie l'environnement
	@echo "$(CYAN)🔍 Vérification de l'environnement:$(NC)"
	@echo "Node: $$(node --version)"
	@echo "Bun: $$(bun --version)"
	@echo "Docker: $$(docker --version)"
	@echo "Docker Compose: $$(docker compose version)"

quick-start: install db-up db-migrate db-seed ## Installation rapide complète
	@echo "$(GREEN)🎉 Installation rapide terminée !$(NC)"
	@echo "$(CYAN)Lancez 'make dev' pour démarrer le serveur$(NC)"

##@ Workflow complet
ci: lint test-all ## Pipeline d'intégration continue (sans type-check)
	@echo "$(GREEN)✅ Pipeline CI réussie$(NC)"

ci-full: type-check lint test-all ## Pipeline CI complète avec type-check
	@echo "$(GREEN)✅ Pipeline CI complète réussie$(NC)"

deploy-check: clean build test-all ## Vérifications avant déploiement
	@echo "$(GREEN)✅ Prêt pour le déploiement$(NC)"

# Règles par défaut
.DEFAULT_GOAL := help
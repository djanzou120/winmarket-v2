# WinMarket V2 - Makefile Principal
# Orchestrateur pour tous les services du monorepo

.PHONY: help install dev build start clean test lint type-check
.PHONY: api web admin mobile packages
.PHONY: db-up db-down db-status db-reset db-migrate db-seed db-studio
.PHONY: docker-up docker-down docker-logs docker-clean docker-tools
.PHONY: dev-full dev-api dev-web dev-admin dev-mobile
.PHONY: build-all build-packages build-apps test-all lint-all type-check-all
.PHONY: setup quick-start reset env-check deps-check

# Variables
NODE_ENV ?= development
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
help: ## Affiche l'aide principale du projet
	@echo "$(CYAN)WinMarket V2 - Commandes principales du monorepo:$(NC)\n"
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make $(CYAN)<target>$(NC)\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(CYAN)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(PURPLE)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo "\n$(YELLOW)📱 Services individuels:$(NC)"
	@echo "  $(CYAN)make api <command>     $(NC) Commandes API (ex: make api help)"
	@echo "  $(CYAN)make web <command>     $(NC) Commandes Web App"
	@echo "  $(CYAN)make admin <command>   $(NC) Commandes Admin Dashboard"
	@echo "  $(CYAN)make mobile <command>  $(NC) Commandes Mobile App"

##@ Installation & Setup
install: ## Installe toutes les dépendances
	@echo "$(YELLOW)📦 Installation des dépendances du monorepo...$(NC)"
	@bun install
	@echo "$(GREEN)✅ Installation terminée$(NC)"

setup: install docker-up ## Setup complet du projet
	@echo "$(BLUE)🚀 Configuration complète du projet...$(NC)"
	@$(MAKE) db-migrate
	@echo "$(GREEN)🎉 Projet configuré avec succès !$(NC)"
	@echo "$(CYAN)💡 Lancez 'make dev-full' pour démarrer tous les services$(NC)"

quick-start: setup ## Installation et démarrage rapide
	@echo "$(GREEN)🚀 Démarrage rapide terminé !$(NC)"
	@echo "$(CYAN)Utilisez 'make dev-full' pour démarrer le développement$(NC)"

##@ Développement
dev-full: ## Lance tous les services en développement
	@echo "$(BLUE)🚀 Démarrage de tous les services...$(NC)"
	@echo "$(YELLOW)API: http://localhost:4000$(NC)"
	@echo "$(YELLOW)Web: http://localhost:3000$(NC)"
	@echo "$(YELLOW)Admin: http://localhost:3001$(NC)"
	@bun run dev

dev-api: ## Lance uniquement l'API
	@echo "$(BLUE)🚀 Démarrage de l'API...$(NC)"
	@bun run dev:api

dev-web: ## Lance uniquement l'app Web
	@echo "$(BLUE)🚀 Démarrage de l'app Web...$(NC)"
	@bun run dev:web

dev-admin: ## Lance uniquement l'admin
	@echo "$(BLUE)🚀 Démarrage de l'admin...$(NC)"
	@bun run dev:admin

dev-mobile: ## Lance l'app mobile
	@echo "$(BLUE)📱 Démarrage de l'app mobile...$(NC)"
	@bun run dev:mobile

##@ Build & Production
build-all: clean build-packages build-apps ## Build complet de tous les services
	@echo "$(GREEN)✅ Build complet terminé$(NC)"

build-packages: ## Build tous les packages
	@echo "$(YELLOW)📦 Build des packages...$(NC)"
	@bun run build:packages

build-apps: ## Build toutes les applications
	@echo "$(YELLOW)🏗️ Build des applications...$(NC)"
	@bun run build:apps

##@ Tests & Qualité
test-all: ## Lance tous les tests
	@echo "$(CYAN)🧪 Lancement de tous les tests...$(NC)"
	@bun run test:unit

lint-all: ## Lint tous les projets
	@echo "$(BLUE)🔍 Lint de tous les projets...$(NC)"
	@bun run lint

type-check-all: ## Vérifie les types de tous les projets
	@echo "$(BLUE)📝 Vérification des types...$(NC)"
	@bun run type-check

##@ Base de données (via API)
db-up: ## Démarre les services de base de données
	@echo "$(GREEN)🗄️ Démarrage des services de base de données...$(NC)"
	@$(DOCKER_COMPOSE) up -d postgres redis minio

db-down: ## Arrête les services de base de données
	@echo "$(RED)🛑 Arrêt des services de base de données...$(NC)"
	@$(DOCKER_COMPOSE) down

db-status: ## Statut des services
	@echo "$(CYAN)📊 Statut des services:$(NC)"
	@$(DOCKER_COMPOSE) ps

db-migrate: ## Lance les migrations
	@echo "$(YELLOW)🔄 Migration de la base de données...$(NC)"
	@$(MAKE) -C apps/api db-migrate

db-seed: ## Seed la base de données
	@echo "$(YELLOW)🌱 Seed de la base de données...$(NC)"
	@$(MAKE) -C apps/api db-seed

db-studio: ## Lance Drizzle Studio
	@echo "$(PURPLE)🎨 Lancement de Drizzle Studio...$(NC)"
	@$(MAKE) -C apps/api db-studio

db-reset: ## Remet à zéro la base de données
	@echo "$(RED)⚠️ Remise à zéro de la base de données...$(NC)"
	@$(MAKE) -C apps/api db-reset

##@ Docker
docker-up: ## Démarre tous les services Docker
	@echo "$(GREEN)🐳 Démarrage des services Docker...$(NC)"
	@$(DOCKER_COMPOSE) up -d

docker-down: ## Arrête tous les services Docker
	@echo "$(RED)🛑 Arrêt des services Docker...$(NC)"
	@$(DOCKER_COMPOSE) down

docker-logs: ## Affiche les logs Docker
	@echo "$(CYAN)📋 Logs des services Docker:$(NC)"
	@$(DOCKER_COMPOSE) logs -f

docker-clean: ## Nettoie les ressources Docker
	@echo "$(RED)🧹 Nettoyage Docker...$(NC)"
	@$(DOCKER_COMPOSE) down -v --remove-orphans
	@docker system prune -f

docker-tools: ## Démarre les outils d'administration
	@echo "$(PURPLE)🛠️ Démarrage des outils d'administration...$(NC)"
	@$(DOCKER_COMPOSE) --profile tools up -d pgadmin redis-commander
	@echo "$(CYAN)📊 PgAdmin: http://localhost:5050$(NC)"
	@echo "$(CYAN)📊 Redis Commander: http://localhost:8081$(NC)"

##@ Gestion individuelle des services
api: ## Commandes API (usage: make api <command>)
	@if [ "$(filter-out $@,$(MAKECMDGOALS))" = "" ]; then \
		echo "$(YELLOW)Usage: make api <command>$(NC)"; \
		echo "$(CYAN)Commandes disponibles:$(NC)"; \
		$(MAKE) -C apps/api help; \
	else \
		$(MAKE) -C apps/api $(filter-out $@,$(MAKECMDGOALS)); \
	fi

web: ## Commandes Web App (usage: make web <command>)
	@if [ "$(filter-out $@,$(MAKECMDGOALS))" = "" ]; then \
		echo "$(YELLOW)App Web - Commandes disponibles:$(NC)"; \
		echo "  $(CYAN)dev$(NC)        Lance en mode développement (port 3000)"; \
		echo "  $(CYAN)build$(NC)      Compile l'application"; \
		echo "  $(CYAN)start$(NC)      Lance en mode production"; \
		echo "  $(CYAN)lint$(NC)       Vérifie le code"; \
		echo "  $(CYAN)type-check$(NC) Vérifie les types"; \
		echo "  $(CYAN)clean$(NC)      Nettoie les fichiers"; \
	else \
		cd apps/web && bun run $(filter-out $@,$(MAKECMDGOALS)); \
	fi

admin: ## Commandes Admin Dashboard (usage: make admin <command>)
	@if [ "$(filter-out $@,$(MAKECMDGOALS))" = "" ]; then \
		echo "$(YELLOW)Admin Dashboard - Commandes disponibles:$(NC)"; \
		echo "  $(CYAN)dev$(NC)        Lance en mode développement (port 3001)"; \
		echo "  $(CYAN)build$(NC)      Compile l'application"; \
		echo "  $(CYAN)start$(NC)      Lance en mode production"; \
		echo "  $(CYAN)lint$(NC)       Vérifie le code"; \
		echo "  $(CYAN)type-check$(NC) Vérifie les types"; \
		echo "  $(CYAN)clean$(NC)      Nettoie les fichiers"; \
	else \
		cd apps/admin && bun run $(filter-out $@,$(MAKECMDGOALS)); \
	fi

mobile: ## Commandes Mobile App (usage: make mobile <command>)
	@if [ "$(filter-out $@,$(MAKECMDGOALS))" = "" ]; then \
		echo "$(YELLOW)App Mobile - Commandes disponibles:$(NC)"; \
		echo "  $(CYAN)dev$(NC)           Lance Expo en mode développement"; \
		echo "  $(CYAN)android$(NC)       Lance sur Android"; \
		echo "  $(CYAN)ios$(NC)           Lance sur iOS"; \
		echo "  $(CYAN)web$(NC)           Lance sur Web via Expo"; \
		echo "  $(CYAN)build:android$(NC) Build pour Android (EAS)"; \
		echo "  $(CYAN)build:ios$(NC)     Build pour iOS (EAS)"; \
		echo "  $(CYAN)lint$(NC)          Vérifie le code"; \
		echo "  $(CYAN)type-check$(NC)    Vérifie les types"; \
		echo "  $(CYAN)clean$(NC)         Nettoie les fichiers"; \
	else \
		cd apps/mobile && bun run $(filter-out $@,$(MAKECMDGOALS)); \
	fi

packages: ## Commandes Packages (usage: make packages <command>)
	@if [ "$(filter-out $@,$(MAKECMDGOALS))" = "" ]; then \
		echo "$(YELLOW)Packages disponibles:$(NC)"; \
		echo "  $(CYAN)shared-types$(NC)  Types partagés"; \
		echo "  $(CYAN)database$(NC)      Configuration base de données"; \
		echo "  $(CYAN)config$(NC)        Configuration partagée"; \
		echo "  $(CYAN)ui$(NC)            Composants UI partagés"; \
		echo "  $(CYAN)business$(NC)      Logique métier"; \
		echo "  $(CYAN)shared$(NC)        Utilitaires partagés"; \
	else \
		echo "$(RED)Les packages n'ont pas de commandes individuelles$(NC)"; \
	fi

##@ Utilitaires
clean: ## Nettoie tous les fichiers générés
	@echo "$(RED)🧹 Nettoyage complet...$(NC)"
	@bun run clean
	@rm -rf node_modules/.cache
	@echo "$(GREEN)✅ Nettoyage terminé$(NC)"

reset: clean install ## Remet à zéro et réinstalle
	@echo "$(YELLOW)🔄 Remise à zéro complète...$(NC)"
	@bun run reset
	@echo "$(GREEN)✅ Projet remis à zéro$(NC)"

env-check: ## Vérifie l'environnement de développement
	@echo "$(CYAN)🔍 Vérification de l'environnement:$(NC)"
	@echo "Node: $$(node --version 2>/dev/null || echo 'Non installé')"
	@echo "Bun: $$(bun --version 2>/dev/null || echo 'Non installé')"
	@echo "Docker: $$(docker --version 2>/dev/null || echo 'Non installé')"
	@echo "Docker Compose: $$(docker compose version 2>/dev/null || echo 'Non installé')"
	@echo "Git: $$(git --version 2>/dev/null || echo 'Non installé')"

deps-check: ## Vérifie les dépendances obsolètes
	@echo "$(BLUE)🔍 Vérification des dépendances...$(NC)"
	@bunx npm-check-updates

##@ CI/CD
ci: lint-all type-check-all test-all ## Pipeline d'intégration continue
	@echo "$(GREEN)✅ Pipeline CI réussie$(NC)"

deploy-check: clean build-all test-all ## Vérifications avant déploiement
	@echo "$(GREEN)✅ Prêt pour le déploiement$(NC)"

##@ Informations
status: ## Affiche le statut de tous les services
	@echo "$(CYAN)📊 Statut du projet WinMarket V2:$(NC)\n"
	@echo "$(YELLOW)🗄️ Services Docker:$(NC)"
	@$(DOCKER_COMPOSE) ps 2>/dev/null || echo "Aucun service Docker actif"
	@echo "\n$(YELLOW)📂 Structure du projet:$(NC)"
	@echo "  📱 API GraphQL (Bun + TypeScript)"
	@echo "  🌐 Web App (Next.js + React)"
	@echo "  🛠️ Admin Dashboard (Next.js + React)"
	@echo "  📱 Mobile App (Expo + React Native)"
	@echo "\n$(YELLOW)🔗 URLs en développement:$(NC)"
	@echo "  API GraphQL: http://localhost:4000"
	@echo "  Web App: http://localhost:3000"
	@echo "  Admin: http://localhost:3001"
	@echo "  PgAdmin: http://localhost:5050"
	@echo "  Redis Commander: http://localhost:8081"

# Règle pour ignorer les arguments supplémentaires
%:
	@:

# Règle par défaut
.DEFAULT_GOAL := help
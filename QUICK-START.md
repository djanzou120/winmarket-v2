# 🚀 WinMarket V2 - Quick Start Guide

**Get the complete marketplace API running in 5 minutes!**

## ⚡ One-Command Setup

```bash
# Clone and setup everything
git clone <your-repo>
cd winmarket-v2
make quick-start
```

This will:
- ✅ Install all dependencies
- ✅ Start Docker services (PostgreSQL, Redis, MinIO)
- ✅ Run database migrations
- ✅ Seed development data

## 🚀 Start Development

```bash
# Start all services
make dev-full
```

**Services will be available at:**
- 🔥 **GraphQL API**: http://localhost:4000
- 🌐 **Web App**: http://localhost:3000
- 🛠️ **Admin Dashboard**: http://localhost:3001

## 🎯 Individual Services

```bash
# API only (most common for backend dev)
make api dev

# Web app only
make web dev

# Admin dashboard only
make admin dev

# Mobile app
make mobile dev
```

## 📊 Monitoring & Tools

```bash
# Service status
make status

# Admin tools
make docker-tools
```

**Admin Tools Available:**
- 🗄️ **PgAdmin**: http://localhost:5050 (admin@winmarket.com / admin)
- 📊 **Redis Commander**: http://localhost:8081
- 🎨 **Drizzle Studio**: `make db-studio`

## 🧪 Testing & Validation

```bash
# Test everything
make api test-all

# Individual tests
make api test-compilation
make api test-domains
make api test-graphql
make api test-resolvers
```

## 📚 What's Included

### **Complete GraphQL API** (135+ Operations)
- 👤 **Authentication** - Register, login, 2FA, social auth
- 👥 **User Management** - Profiles, wallets, admin functions
- 📦 **Product Catalog** - Products, categories, variants
- 🛒 **Order System** - Cart, checkout, payment, tracking
- ⭐ **Review System** - Ratings, moderation, responses
- 🚚 **Delivery Management** - Providers, zones, tracking
- 🔔 **Notifications** - Real-time, preferences, templates

### **Business Features**
- 🏪 **Multi-vendor marketplace** (B2B/B2C/C2C)
- 💰 **Integrated wallet system**
- 🚚 **Flexible delivery options**
- ⭐ **Review and rating system**
- 🔔 **Real-time notifications**
- 🛡️ **Comprehensive security**

### **Developer Experience**
- 🎯 **Unified Makefile** commands
- 🧪 **Complete test suite**
- 📊 **Health monitoring**
- 🐳 **Docker containerization**
- 📚 **Comprehensive documentation**

## 🚀 Production Deployment

```bash
# Deploy to production
./scripts/deploy.sh production

# Deploy to staging
./scripts/deploy.sh staging
```

## 🆘 Need Help?

```bash
# Show all available commands
make help

# API-specific commands
make api help

# Check environment
make env-check

# View service logs
make docker-logs
```

## 📖 Full Documentation

- 📋 **Makefile Guide**: [README.makefile.md](./README.makefile.md)
- 🏗️ **Architecture**: Domain-Driven Design with 7 business domains
- 🗄️ **Database**: 26 tables with PostgreSQL + Drizzle ORM
- 🚀 **Deployment**: Docker + automated scripts

## ⚡ Common Commands

| Command | Description |
|---------|-------------|
| `make quick-start` | Complete setup |
| `make dev-full` | All services |
| `make api dev` | API only |
| `make status` | Service status |
| `make api test-all` | Run all tests |
| `make docker-tools` | Admin tools |
| `make help` | Show all commands |

---

**🎉 Welcome to WinMarket V2! Your marketplace API is ready to scale! 🚀**
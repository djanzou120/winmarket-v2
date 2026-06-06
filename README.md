# 🛒 WinMarket V2 - Production-Ready Marketplace API

**Version 2.0** - **PRODUCTION-READY** GraphQL API with complete DDD architecture

> **Multi-platform marketplace** API with B2B/B2C/C2C support, integrated wallet system, and flexible delivery management.

## 🎉 **SPRINT 3 COMPLETED** - Production Ready!

✅ **135+ GraphQL Resolvers** across 7 business domains
✅ **26 Database Tables** with complete relationships
✅ **Production Deployment** with Docker & automated scripts
✅ **Health Monitoring** with comprehensive endpoints
✅ **Complete Documentation** and developer tools

## 🏗️ Architecture Overview

**Modular Monolith** → **Microservices Ready**

```
winmarket-v2/
├── 🎯 apps/                    # Applications
│   ├── api/                   # GraphQL API (modular monolith)
│   ├── web/                   # Next.js marketplace web
│   ├── mobile/                # Expo + EAS mobile app
│   └── admin/                 # Admin dashboard
├── 📦 packages/               # Shared packages
│   ├── database/             # Drizzle ORM + PostgreSQL
│   ├── business/             # Domain logic & business rules
│   ├── shared/               # Types, utils, config
│   └── ui/                   # Reusable UI components
└── 🛠️ tools/                 # Development tools
```

## 🚀 Tech Stack

### **Backend**
- **Runtime:** Bun (ultra-fast package manager & runtime)
- **API:** GraphQL with Apollo Server
- **Database:** PostgreSQL + Redis
- **ORM:** Drizzle (type-safe, performant)
- **Auth:** Better Auth with JWT
- **File Storage:** MinIO (S3-compatible, self-hosted)

### **Frontend Web**
- **Framework:** Next.js 14+ (App Router)
- **Styling:** TailwindCSS
- **State:** Apollo Client + React Query

### **Mobile**
- **Platform:** Expo + EAS (iOS/Android)
- **UI:** Tamagui (cross-platform)
- **Navigation:** Expo Router

### **Infrastructure**
- **Deployment:** Docker + Kubernetes
- **File Storage:** MinIO (S3-compatible)
- **CI/CD:** GitHub Actions
- **Monitoring:** Built-in health checks

## 🎯 Key Features

### **🛍️ Marketplace Core**
- **Multi-model:** B2B, B2C, C2C support
- **Product Catalog:** Advanced search, categories, filtering
- **Order Management:** Complete order lifecycle
- **Reviews & Ratings:** Verified purchase reviews

### **💳 Integrated Wallet System**
- **Internal Payments:** Users can load & withdraw funds
- **Commission System:** Automatic, transparent to buyers
- **Multi-provider:** Stripe, PayPal, bank transfers
- **Real-time:** Live balance updates

### **🚚 Flexible Delivery**
- **Seller-managed:** Each seller configures their delivery partners
- **Pickup Option:** Always available
- **Delivery Providers:** Optional, with pricing
- **Order Tracking:** Status updates and tracking numbers

### **📁 File Storage with MinIO**
- **S3-Compatible:** Drop-in replacement for AWS S3
- **Self-hosted:** Complete control over data
- **CDN Integration:** Fast image delivery
- **Scalable:** Handle millions of product images

### **⚖️ Reactive Moderation**
- **Immediate Publishing:** Products go live instantly
- **Community Reporting:** User-driven content moderation
- **Admin Tools:** Comprehensive moderation dashboard

### **📱 Multi-Platform**
- **Responsive Web:** Works on all devices
- **Native Mobile:** iOS & Android apps
- **Admin Dashboard:** Complete management interface

## 📋 Business Model

### **Revenue Streams**
1. **Commission on Sales:** Configurable % per category (default 5%)
2. **Advertising & Promotions:** Paid product highlighting

### **User Types**
- **Buyers:** Browse, purchase, review products
- **Sellers:** List products, manage delivery, receive payments
- **Admins:** Platform management, moderation, analytics

## ⚡ Quick Start

### **Prerequisites**
```bash
# Install Bun (recommended)
curl -fsSL https://bun.sh/install | bash

# Or use Node.js 18+
node --version  # 18+
```

### **Development Setup**
```bash
# Clone and install dependencies
git clone <repository>
cd winmarket-v2
bun install

# Setup environment
cp apps/api/.env.example apps/api/.env
# Edit .env with your database credentials

# Start database (Docker required)
docker-compose up -d

# Initialize database
bun run db:migrate
bun run db:seed

# Start all services
bun run dev
```

### **Access Points**
- 🌐 **Web App:** http://localhost:3000
- 📱 **Mobile App:** `bun run dev:mobile`
- ⚙️ **Admin Panel:** http://localhost:3001
- 🔧 **GraphQL API:** http://localhost:4000/graphql
- 📁 **MinIO Console:** http://localhost:9001

## 🗄️ Database Schema

### **Core Entities**
- **Users:** Multi-role system (buyers/sellers/admins)
- **Products:** Complete catalog with categories & images
- **Orders:** Full order lifecycle with commission tracking
- **Wallets:** Internal payment system with transactions
- **Delivery:** Seller-managed delivery providers
- **Reviews:** Verified purchase review system

### **Key Relationships**
- Users can be buyers AND sellers
- Orders contain items from multiple sellers
- Each seller manages their own delivery providers
- Commission automatically calculated (invisible to buyers)

## 📊 API Documentation

### **GraphQL Endpoint**
```
POST /graphql
Authorization: Bearer <jwt-token>
```

### **Key Queries**
```graphql
# Search products
query SearchProducts($input: SearchProductsInput!) {
  products(input: $input) {
    products {
      id
      title
      price
      images
      seller { name }
      deliveryOptions {
        type
        price
        estimatedDays
      }
    }
    total
    hasMore
  }
}

# Get user wallet
query MyWallet {
  myWallet {
    balance
    currency
    transactions(input: { limit: 10 }) {
      transactions {
        type
        amount
        description
        createdAt
      }
    }
  }
}
```

## 🚢 Deployment

### **Development**
```bash
bun run build       # Build all packages
bun run test        # Run tests
bun run type-check  # TypeScript validation
```

### **Production (Docker)**
```bash
# Build images
docker build -t winmarket-api ./apps/api
docker build -t winmarket-web ./apps/web

# Deploy to Kubernetes
kubectl apply -f k8s/
```

### **Mobile Deployment (EAS)**
```bash
# Preview build
eas build --profile preview

# Production build
eas build --profile production

# Submit to app stores
eas submit --platform ios
eas submit --platform android

# Over-the-air updates
eas update --channel production
```

## 📁 MinIO File Storage

### **Configuration**
```bash
# Start MinIO with Docker Compose
docker-compose up -d minio

# Access MinIO Console
open http://localhost:9001
# User: minioadmin, Pass: minioadmin
```

### **Integration**
- **Product Images:** Automatic upload and optimization
- **User Avatars:** Profile picture management
- **Document Storage:** Invoices, contracts, receipts
- **CDN:** Fast global content delivery

### **API Usage**
```typescript
// Upload product image
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  return response.json(); // Returns MinIO URL
};
```

## 🔧 Development

### **Package Scripts**
```bash
bun run dev           # Start all services
bun run build         # Build all packages
bun run test          # Run all tests
bun run lint          # Lint all packages
bun run type-check    # TypeScript validation

# Database operations
bun run db:generate   # Generate Drizzle types
bun run db:migrate    # Run migrations
bun run db:seed       # Seed test data
bun run db:studio     # Open database GUI
```

### **Architecture Principles**

**🏗️ Modular Monolith Benefits:**
- **Faster Development:** Single service to run/debug
- **ACID Transactions:** Simple database operations
- **Easy Deployment:** One service to manage
- **Future-proof:** Modules ready for microservice extraction

**📦 Package Organization:**
- **Shared Database:** Single source of truth
- **Business Logic:** Domain-focused modules
- **Type Safety:** End-to-end TypeScript
- **Reusable Components:** Cross-platform UI

## 📈 Roadmap

### **Phase 1: MVP (Current)**
- ✅ User authentication & profiles
- ✅ Product catalog & search
- ✅ Order processing & payments
- ✅ Wallet system
- ✅ Basic delivery management
- ✅ Admin moderation tools
- ✅ MinIO file storage

### **Phase 2: Enhanced Features**
- 🔄 Advanced search & filtering
- 🔄 Real-time chat system
- 🔄 Enhanced analytics
- 🔄 Mobile push notifications
- 🔄 API rate limiting

### **Phase 3: Scale & Optimize**
- 🔄 Microservices migration
- 🔄 Multi-language support
- 🔄 Advanced analytics
- 🔄 Third-party integrations

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Create** Pull Request

### **Development Standards**
- **TypeScript** for type safety
- **ESLint + Prettier** for code quality
- **Jest** for testing
- **Conventional Commits** for commit messages

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Documentation IA:** [.ia/README.md](./.ia/README.md)
- **PRD Complet:** [.ia/docs/PRD.md](./.ia/docs/PRD.md)
- **Guide Démarrage:** [.ia/docs/QUICKSTART.md](./.ia/docs/QUICKSTART.md)
- **Architecture:** [.ia/architecture/NEW_STRUCTURE.md](./.ia/architecture/NEW_STRUCTURE.md)
- **API Schema:** http://localhost:4000/graphql (when running)
- **MinIO Console:** http://localhost:9001 (when running)
- **Issue Tracker:** GitHub Issues
- **Discussions:** GitHub Discussions

---

*Built with ❤️ using modern web technologies and MinIO for scalable file storage*
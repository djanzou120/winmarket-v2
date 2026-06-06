# WinMarket V2 API Documentation

## Overview

WinMarket V2 is a comprehensive French marketplace platform built with a modern GraphQL API using TypeScript, Drizzle ORM, and Better Auth. This API serves as the backend for a multi-sided marketplace supporting buyers, sellers, and administrators.

## Architecture

### Technology Stack
- **Runtime**: Bun (JavaScript runtime)
- **Language**: TypeScript
- **API**: GraphQL with Apollo Server
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with 2FA support
- **Cache**: Redis
- **File Storage**: MinIO (S3-compatible)
- **Security**: Helmet, rate limiting, CORS
- **Testing**: Bun test with >70% coverage

### Project Structure
```
apps/api/src/
├── infrastructure/          # Core infrastructure
│   ├── auth/               # Better Auth configuration
│   ├── database/           # Database schema & connection
│   ├── security/           # Security middleware
│   └── cache/              # Redis cache configuration
├── modules/                # Feature modules
│   ├── auth/               # Authentication & authorization
│   ├── products/           # Product catalog management
│   ├── orders/             # Order processing
│   ├── wallet/             # Digital wallet system
│   ├── reviews/            # Review & rating system
│   ├── delivery/           # Delivery providers & options
│   └── notifications/      # Real-time notifications
└── graphql/                # GraphQL schema & resolvers
```

## Database Schema

The API manages **18 tables** across 6 core domains:

### Users Domain (3 tables)
- **users**: Core user accounts with email, phone, role (BUYER/SELLER/ADMIN)
- **userProfiles**: Extended profile information and preferences
- **userWallets**: Digital wallet with balance and transaction history

### Products Domain (3 tables)
- **categories**: Hierarchical product categories (6 root + subcategories)
- **products**: Product catalog with pricing, stock, and metadata
- **productVariants**: Product variations (size, color, etc.)

### Orders Domain (3 tables)
- **orders**: Purchase orders with status tracking
- **orderItems**: Individual items within orders
- **walletTransactions**: Financial transaction records

### Reviews Domain (3 tables)
- **reviews**: Product reviews with ratings and comments
- **reviewVotes**: Helpful/unhelpful votes on reviews
- **reviewReports**: Moderation reports for inappropriate reviews

### Delivery Domain (3 tables)
- **deliveryProviders**: Shipping companies (Chronopost, Colissimo, DPD, etc.)
- **deliveryOptions**: Shipping methods with pricing and timing
- **deliveryZones**: Geographic coverage areas for providers

### Notifications Domain (3 tables)
- **notifications**: Push/email notifications with delivery status
- **notificationPreferences**: User notification settings by type
- **deviceTokens**: Mobile device tokens for push notifications

## API Features

### Authentication & Security
- **Email/Password Authentication** with email verification
- **Two-Factor Authentication (2FA)** with TOTP and backup codes
- **Social Authentication** (Google, GitHub, Facebook)
- **Session Management** with secure token handling
- **Password Reset** with secure token-based flow
- **Rate Limiting** (100 req/15min general, 5 req/15min auth)
- **Security Headers** (HELMET, CSP, HSTS)
- **Request Size Limiting** (10MB general, 50MB uploads)
- **CORS Configuration** with origin validation
- **Query Complexity Analysis** to prevent expensive operations

### Core Business Logic
- **Multi-sided Marketplace** supporting buyers, sellers, and admins
- **Product Catalog** with categories, variants, and inventory
- **Order Processing** with status tracking and fulfillment
- **Digital Wallet System** with balance management
- **Review & Rating System** with moderation capabilities
- **Delivery Management** with multiple providers and options
- **Real-time Notifications** with multi-channel delivery

### Data & Performance
- **Comprehensive Seed Data** with realistic French marketplace content
- **Database Migrations** with version control
- **Health Check System** monitoring database, Redis, and MinIO
- **Request Logging** with structured JSON output
- **Error Handling** with detailed error responses
- **Caching Strategy** using Redis for performance

## GraphQL API

### Available Modules

#### Auth Module
```graphql
# Authentication Operations
mutation register(input: RegisterInput!): AuthPayload!
mutation login(input: LoginInput!): AuthPayload!
mutation logout: Boolean!
mutation changePassword(input: ChangePasswordInput!): Boolean!

# Email Verification
mutation sendVerificationEmail: EmailVerification!
mutation verifyEmail(input: VerifyEmailInput!): Boolean!

# Two-Factor Authentication
mutation setupTwoFactor: TwoFactorSetup!
mutation enableTwoFactor(input: Enable2FAInput!): Boolean!
mutation disableTwoFactor: Boolean!

# Session Management
query sessions: [Session!]!
mutation revokeSession(sessionId: String!): Boolean!
```

#### Products Module
```graphql
query products(filter: ProductsFilterInput, pagination: PaginationInput): ProductConnection!
query product(id: ID!): Product
query categories: [Category!]!
query searchProducts(query: String!, filters: ProductSearchFilters): ProductConnection!

mutation createProduct(input: CreateProductInput!): Product!
mutation updateProduct(id: ID!, input: UpdateProductInput!): Product!
mutation deleteProduct(id: ID!): Boolean!
```

#### Orders Module
```graphql
query orders(filter: OrdersFilterInput, pagination: PaginationInput): OrderConnection!
query order(id: ID!): Order
query myOrders(pagination: PaginationInput): OrderConnection!

mutation createOrder(input: CreateOrderInput!): Order!
mutation updateOrderStatus(id: ID!, status: OrderStatus!): Order!
mutation cancelOrder(id: ID!, reason: String): Order!
```

#### Reviews Module
```graphql
query reviews(filter: ReviewsFilterInput, pagination: PaginationInput): ReviewConnection!
query reviewStats(productId: ID!): ReviewStats!
query myReviews(pagination: PaginationInput): ReviewConnection!

mutation createReview(input: CreateReviewInput!): Review!
mutation voteReview(input: VoteReviewInput!): ReviewVote!
mutation reportReview(input: ReportReviewInput!): ReviewReport!
```

#### Delivery Module
```graphql
query deliveryProviders(filter: DeliveryProvidersFilterInput): [DeliveryProvider!]!
query deliveryOptions(filter: DeliveryOptionsFilterInput): [DeliveryOption!]!
query estimateDeliveryCosts(input: DeliveryEstimateInput!): [DeliveryCostEstimate!]!

mutation createDeliveryOption(input: CreateDeliveryOptionInput!): DeliveryOption!
```

#### Notifications Module
```graphql
query notifications(filter: NotificationsFilterInput, pagination: PaginationInput): NotificationConnection!
query notificationStats: NotificationStats!
query notificationPreferences: [NotificationPreference!]!

mutation markNotificationRead(id: ID!): Notification!
mutation updateNotificationPreference(input: UpdateNotificationPreferenceInput!): NotificationPreference!

subscription notificationAdded(userId: ID!): Notification!
```

## Development Setup

### Prerequisites
- **Bun** (JavaScript runtime)
- **PostgreSQL** database
- **Redis** cache server
- **MinIO** object storage (or AWS S3)
- **Docker** (optional, for services)

### Environment Configuration
Create `.env` file based on `.env.example`:

```bash
# Server Configuration
NODE_ENV=development
PORT=4000
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/winmarket_dev
DB_HOST=localhost
DB_PORT=5432
DB_USER=winmarket
DB_PASSWORD=your_password
DB_NAME=winmarket_dev

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
BETTER_AUTH_SECRET=your-better-auth-secret-key-minimum-32-characters

# Social Authentication (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# File Storage (MinIO/S3)
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=winmarket-uploads

# Security
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### Installation & Startup

```bash
# Install dependencies
bun install

# Run database migrations
bun run db:migrate-run

# Seed database with sample data
bun run db:seed

# Start development server
bun run dev

# Or run in production
bun run build && bun run start
```

### Available Scripts

```bash
# Development
bun run dev              # Start development server with hot reload
bun run build            # Build production bundle
bun run start            # Start production server

# Database
bun run db:generate      # Generate Drizzle migrations
bun run db:migrate       # Run migrations
bun run db:migrate-run   # Execute migrations script
bun run db:seed          # Populate database with sample data
bun run db:seed:clear    # Clear all seed data
bun run db:reset         # Reset entire database (DANGER!)
bun run db:studio        # Open Drizzle Studio

# Quality & Testing
bun run type-check       # TypeScript type checking
bun run lint             # ESLint code linting
bun run test             # Run test suite
bun run test:watch       # Run tests in watch mode
```

## API Endpoints

### GraphQL Endpoint
- **URL**: `http://localhost:4000/graphql`
- **Playground**: `http://localhost:4000/graphql` (development only)
- **Method**: POST
- **Content-Type**: `application/json`

### Health Check
- **URL**: `http://localhost:4000/health`
- **Method**: GET
- **Response**: JSON health status

### Authentication Routes (Better Auth)
- **Base URL**: `http://localhost:4000/api/auth`
- **Sign In**: `POST /api/auth/sign-in`
- **Sign Up**: `POST /api/auth/sign-up`
- **Sign Out**: `POST /api/auth/sign-out`
- **Reset Password**: `POST /api/auth/reset-password`

## Security Features

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **File Uploads**: 10 uploads per minute
- **GraphQL**: Query complexity analysis

### Security Headers
- **Content Security Policy** (CSP)
- **HTTP Strict Transport Security** (HSTS)
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: enabled
- **Referrer Policy**: strict-origin-when-cross-origin

### Data Protection
- **Password Hashing**: bcryptjs with 12 rounds
- **Session Security**: Secure, HttpOnly cookies
- **CSRF Protection**: Token-based validation
- **Request Size Limits**: 10MB general, 50MB uploads
- **Input Validation**: Zod schema validation

## Error Handling

### GraphQL Errors
```json
{
  "errors": [
    {
      "message": "Authentication required",
      "locations": [{"line": 2, "column": 3}],
      "path": ["me"],
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### HTTP Error Codes
- **400**: Bad Request (invalid input)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **413**: Request Too Large (exceeds size limits)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

## Monitoring & Logging

### Health Monitoring
The API provides comprehensive health checks for:
- Database connectivity and query performance
- Redis cache availability
- MinIO object storage accessibility
- Memory usage and system metrics
- Service dependency status

### Structured Logging
All logs use structured JSON format with:
- **Timestamp**: ISO 8601 format
- **Level**: error, warn, info, debug
- **Service**: "winmarket-api"
- **Message**: Human-readable message
- **Context**: Additional metadata (user ID, IP, etc.)

### Security Auditing
Sensitive operations are logged including:
- Authentication attempts and failures
- Password changes and resets
- Admin access and privilege escalation
- File uploads and downloads
- Rate limit violations

## Performance Considerations

### Database Optimization
- **Indexed Columns**: Foreign keys, email, phone, slug fields
- **Query Optimization**: Use Drizzle query builder for type safety
- **Connection Pooling**: Configured for production load
- **Migration Strategy**: Version-controlled schema changes

### Caching Strategy
- **Redis Cache**: User sessions, frequently accessed data
- **HTTP Caching**: Static assets and API responses
- **Query Optimization**: DataLoader for N+1 query prevention

### Monitoring Metrics
- **Response Time**: P95 < 200ms for simple queries
- **Throughput**: 1000+ requests per minute
- **Error Rate**: < 1% for all endpoints
- **Uptime**: 99.9% availability target

## Contributing

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Standard configuration with custom rules
- **Prettier**: Automated code formatting
- **Test Coverage**: Minimum 70% coverage required

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Run type checking and linting
4. Ensure test coverage > 70%
5. Create pull request with description
6. Code review and approval required
7. Merge to main triggers deployment

### Database Changes
1. Create migration file: `bun run db:generate`
2. Review generated SQL carefully
3. Test migration on development database
4. Update seed data if schema changes
5. Document breaking changes in PR

## Support

### Documentation
- **API Reference**: GraphQL Playground in development
- **Database Schema**: Drizzle Studio at `/studio`
- **Environment Setup**: `.env.example` configuration template

### Troubleshooting
- **Database Issues**: Check connection string and permissions
- **Auth Problems**: Verify JWT secrets and Better Auth configuration
- **Cache Errors**: Ensure Redis is running and accessible
- **File Upload Issues**: Check MinIO configuration and bucket permissions

For additional support, check the repository issues or create a new issue with:
- Error messages and stack traces
- Steps to reproduce the problem
- Environment configuration details
- Expected vs actual behavior
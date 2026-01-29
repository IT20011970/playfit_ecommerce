# 🏃‍♂️ PlayFit - E-Commerce Platform

A modern, scalable e-commerce application built with microservices architecture using GraphQL Federation, NestJS, React, and PostgreSQL with **event-driven architecture** powered by Kafka.

## 📚 Project Information

**University Project**: This project was created as a university assignment to demonstrate modern software engineering practices and enterprise-grade e-commerce architecture.

**DevOps Platform**: This project uses **Azure DevOps** for project management, CI/CD pipelines, and collaborative development workflows.

### 👥 Team Members

| Student ID | Name | Role |
|------------|------|------|
| MSc/CS/2025/013 | B.Gayan | Developer/Architect |
| MSc/CS/2025/016 | K.M.O.V.K.Kekulandara | UI Designer |
| MSc/CS/2025/037 | D.P.U.S.Nissanka | QA Engineer |
| MSc/CS/2025/015 | S.R.P.Kodikara | Project Manager |

### 🌐 Live Demo

**Hosted locally with ngrok tunneling**:

| Service | URL |
|---------|-----|
| **Frontend** | [https://wrongful-shauna-glutinously.ngrok-free.dev/](https://wrongful-shauna-glutinously.ngrok-free.dev/) |
| **GraphQL Playground** | [https://wrongful-shauna-glutinously.ngrok-free.dev/graphql](https://wrongful-shauna-glutinously.ngrok-free.dev/graphql) |
| **Grafana Dashboard** | [https://wrongful-shauna-glutinously.ngrok-free.dev/grafana](https://wrongful-shauna-glutinously.ngrok-free.dev/grafana) |
| **Kafdrop (Kafka UI)** | [https://wrongful-shauna-glutinously.ngrok-free.dev/kafdrop](https://wrongful-shauna-glutinously.ngrok-free.dev/kafdrop) |

*Note: This application is hosted on a local machine and exposed via ngrok tunneling for demonstration purposes.*

---

## 🎯 Features

- **User Authentication**: JWT-based authentication with access tokens
- **Product Inventory**: Complete product catalog with categories, variants, and stock management
- **Shopping Cart**: Persistent cart with support for multiple items, sizes, and colors
- **Order Management**: Full order lifecycle from checkout to fulfillment
- **GraphQL Federation**: Microservices architecture with Apollo Federation Gateway
- **Event-Driven Architecture**: Kafka-based event streaming for loose coupling and scalability
- **Event Processing**: BullMQ-based reliable event processing with transactions
- **Direct Database Access**: Optimized reads with cross-service database connections
- **Admin Dashboard**: Product and order management
- **Responsive UI**: Modern React frontend with TypeScript
- **Docker Support**: Containerized services for easy deployment
- **CI/CD Pipeline**: Automated testing and deployment with GitHub Actions
- **🆕 Full Observability Stack**: Grafana, Loki, Prometheus, and Tempo for logs, metrics, and traces
- **🆕 Cloud Monitoring**: Grafana Cloud integration for remote access to logs and dashboards

---

## 🏗️ Architecture

### Event-Driven Microservices Architecture

The application now implements an **event-driven architecture** using Kafka for asynchronous communication between services:

```
┌─────────────────────────────────────────────────┐
│          React Frontend (Port 5173)             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│     Federation Gateway (Port 4000)              │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┼────────┬────────┬────────┐
        ▼        ▼        ▼        ▼        ▼
┌─────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐
│  User   │ │  Cart  │ │Inventory │ │  Order   │
│Service  │ │Service │ │ Service  │ │ Service  │
│(3000)   │ │(3002)  │ │  (3004)  │ │  (3003)  │
└─────────┘ └────────┘ └────┬─────┘ └────┬─────┘
                             │            │
                             │ Publishes  │ Publishes
                             │ Events     │ Events
                             ▼            ▼
                    ┌────────────────────────┐
                    │    Kafka Broker        │
                    │  inventory-events      │
                    │  order-events          │
                    └───────────┬────────────┘
                                │
                                │ Subscribes
                                ▼
                    ┌───────────────────────┐
                    │  Event Processor      │
                    │    (Port 3005)        │
                    │  ┌─────────────────┐  │
                    │  │ BullMQ Queue    │  │
                    │  └─────────────────┘  │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Event Log DB        │
                    │   (Audit Trail)       │
                    └───────────────────────┘

Infrastructure Services:
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Zookeeper   │  │    Redis     │  │  PostgreSQL  │
│   (Kafka     │  │   (BullMQ    │  │  (Multiple   │
│ Coordination)│  │    Storage)  │  │  Databases)  │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Key Architectural Features

- **Event Publishing**: Inventory and Order services publish domain events to Kafka
- **Direct DB Access**: Order service reads inventory data directly from database (bypasses API for reads)
- **Event Processing**: Dedicated event processor consumes events via Kafka and processes them through BullMQ
- **Transaction Support**: All events processed within database transactions for reliability
- **Idempotency**: Duplicate events are automatically detected and skipped
- **Audit Trail**: All events logged to PostgreSQL for complete system observability

📖 **[Complete Architecture Diagram →](./diagrams/stage%202%20architecture.png)**

---
## 🎯 Design Patterns Implementation

PlayFit implements several enterprise-grade design patterns to ensure scalability, reliability, and maintainability:

### ✅ **Implemented Patterns**

| Pattern | Status | Implementation Details |
|---------|--------|----------------------|
| **Competing Consumer Pattern** | ✔️ **Present** | Kafka message queues enable multiple service instances (event-processor, notification-service) to consume from the same topic/queue for automatic load balancing and fault tolerance. |
| **Consume and Project Pattern** | ✔️ **Present** | Services emit domain events (e.g., OrderCreated, InventoryUpdated) while other services consume these events to update their own views and databases, enabling eventual consistency. |
| **Event Sourcing** | ✔️ **Present** | Event-processor and event-db store all events as immutable facts, enabling event replay for state reconstruction, audit trails, and debugging capabilities. |
| **Async Task Execution** | ✔️ **Present** | Background workers (event-processor, notification-service) process tasks and events asynchronously from BullMQ queues with retry mechanisms and backoff strategies. |
| **Event Aggregation** | ✔️ **Present** | Complex business events are aggregated from multiple fine-grained events, handled by the event-processor for coordinated business logic execution. |
| **Saga Pattern** | ✔️ **Present** | Order saga choreography coordinates multi-step, long-running transactions across services (order → inventory → notification) using event-driven coordination. |
| **CQRS (Selective)** | ✔️ **Present** | Order Service implements "Selective CQRS" - directly reads from Inventory database (optimized reads) while writes go through proper service APIs and event publishing (consistent writes). |
| **API Gateway Pattern** | ✔️ **Present** | Federation Gateway serves as single entry point, handling routing, authentication, and request aggregation across all microservices. |
| **Microservices Pattern** | ✔️ **Present** | Application decomposed into independent services (User, Cart, Inventory, Order) with separate databases and deployment units. |
| **Database per Service** | ✔️ **Present** | Each microservice manages its own PostgreSQL database, ensuring data autonomy and service independence. |
| **Repository Pattern** | ✔️ **Present** | TypeORM repositories abstract database access, providing clean separation between business logic and data persistence. |
| **Dependency Injection** | ✔️ **Present** | NestJS IoC container manages service dependencies, enabling loose coupling and testability. |
| **Observer Pattern** | ✔️ **Present** | Event-driven architecture with publishers (services) and subscribers (event-processor) for decoupled communication. |
| **Facade Pattern** | ✔️ **Present** | GraphQL Federation Gateway provides unified interface hiding complexity of underlying microservices. |
| **Adapter Pattern** | ✔️ **Present** | GraphQL resolvers adapt internal service APIs to unified GraphQL schema interface. |
| **Decorator Pattern** | ✔️ **Present** | NestJS decorators (@Injectable, @Entity, @Resolver) provide cross-cutting concerns like DI and metadata. |
| **Middleware Pattern** | ✔️ **Present** | Authentication middleware intercepts requests for token validation before reaching business logic. |
| **Health Check Pattern** | ✔️ **Present** | Docker health checks and service monitoring ensure system reliability and auto-recovery. |
| **Proxy Pattern** | ✔️ **Present** | Federation Gateway acts as proxy, forwarding GraphQL queries to appropriate microservices. |

### ❌ **Not Implemented**

| Pattern | Status | Reason |
|---------|--------|--------|
| **Transactional Outbox** | ❌ **Not Present** | Current implementation uses direct event publishing. Could be added for guaranteed event delivery in future iterations. |

### 🏗️ **Pattern Benefits**

- **Scalability**: Competing consumers enable horizontal scaling of event processing
- **Resilience**: Event sourcing provides complete audit trail and recovery capabilities  
- **Performance**: Selective CQRS optimizes read operations while maintaining write consistency
- **Decoupling**: Consume and Project pattern ensures loose coupling between services
- **Reliability**: Async task execution with retries ensures eventual processing of all events
- **Coordination**: Saga pattern manages complex business workflows across service boundaries

---
## � BullMQ Queue & Worker Architecture

The Event Processor uses **BullMQ** with **Redis** for reliable message processing with worker threads.

### Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        KAFKA → BULLMQ PROCESSING FLOW                       │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
  │  Inventory   │      │    Order     │      │    Cart      │
  │   Service    │      │   Service    │      │   Service    │
  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘
         │                     │                     │
         │ Publish Events      │ Publish Events      │ Publish Events
         ▼                     ▼                     ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                      KAFKA BROKER                           │
  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
  │  │inventory-events │  │  order-events   │  │ cart-events │  │
  │  │     Topic       │  │     Topic       │  │    Topic    │  │
  │  └─────────────────┘  └─────────────────┘  └─────────────┘  │
  └────────────────────────────┬────────────────────────────────┘
                               │
                               │ Kafka Consumer (KafkaJS)
                               │ Subscribes to all topics
                               ▼
  ┌────────────────────────────────────────────────────────── ───┐
  │                    EVENT PROCESSOR SERVICE                   │
  │  ┌───────────────────────────────────────────────────── ──┐  │
  │  │              Kafka Consumer Service                    │  │
  │  │  • Receives messages from Kafka topics                 │  │
  │  │  • Parses event data (eventId, eventType, payload)     │  │
  │  │  • Adds job to BullMQ queue                            │  │
  │  └───────────────────────┬───────────────────────────── ──┘  │
  │                          │                                   │
  │                          │ eventsQueue.add('process-event')  │
  │                          ▼                                   │
  │  ┌──────────────────────────────────────────────── ───────┐  │
  │  │                   REDIS (BullMQ Storage)               │  │
  │  │  ┌───────────────────────────────────────────── ────┐  │  │
  │  │  │              events-queue                        │  │  │
  │  │  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐         │  │  │
  │  │  │  │Job 1│ │Job 2│ │Job 3│ │Job 4│ │Job 5│ ...     │  │  │
  │  │  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘         │  │  │
  │  │  │                                                  │  │  │
  │  │  │  Features:                                       │  │  │
  │  │  │  • Job persistence (survives restarts)           │  │  │
  │  │  │  • Automatic retries (3 attempts)                │  │  │
  │  │  │  • Exponential backoff (2s, 4s, 8s)              │  │  │
  │  │  │  • Job deduplication via eventId                 │  │  │
  │  │  └─────────────────────────────────────────────── ──┘  │  │
  │  └───────────────────────┬─────────────────────────── ────┘  │
  │                          │                                   │
  │                          │ Worker picks up jobs              │
  │                          ▼                                   │
  │  ┌───────────────────────────────────────────────────────┐   │
  │  │              BullMQ Worker (Event Processor)          │   │
  │  │                                                       │   │
  │  │  @Processor('events-queue')                           │   │
  │  │  class EventProcessor {                               │   │
  │  │    process(job) {                                     │   │
  │  │      • Check idempotency (skip if processed)          │   │
  │  │      • Route to handler based on eventType            │   │
  │  │      • Execute business logic                         │   │
  │  │      • Update database (inventory/orders)             │   │
  │  │      • Log event to audit trail                       │   │
  │  │      • Send notifications via Kafka                   │   │
  │  │    }                                                  │   │
  │  │  }                                                    │   │
  │  └───────────────────────┬───────────────────────────────┘   │
  └──────────────────────────┼───────────────────────────────────┘
                             │
                             │ Database Operations
                             ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                      POSTGRESQL DATABASES                   │
  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
  │  │ Inventory   │  │   Orders    │  │    Event Log        │  │
  │  │   DB        │  │    DB       │  │   (Audit Trail)     │  │
  │  │             │  │             │  │                     │  │
  │  │ • Products  │  │ • Orders    │  │ • eventId           │  │
  │  │ • Stock     │  │ • OrderItems│  │ • eventType         │  │
  │  └─────────────┘  └─────────────┘  │ • payload           │  │
  │                                    │ • status            │  │
  │                                    │ • processedAt       │  │
  │                                    └─────────────────── ─┘  │
  └─────────────────────────────────────────────────────────────┘
```

### Event Types Processed

| Event Type | Source | Action |
|------------|--------|--------|
| `INVENTORY_ITEM_ADDED` | Inventory Service | Create product in DB |
| `INVENTORY_ITEM_UPDATED` | Inventory Service | Update product details |
| `INVENTORY_ITEM_DELETED` | Inventory Service | Remove product from DB |
| `INVENTORY_STOCK_REDUCED` | Inventory Service | Decrease stock quantity |
| `INVENTORY_STOCK_INCREASED` | Inventory Service | Increase stock quantity |
| `ORDER_CREATED` | Order Service | Create order, reduce stock, clear cart |
| `ORDER_CONFIRMED` | Order Service | Update order status |
| `ORDER_SHIPPED` | Order Service | Update shipping info |
| `ORDER_CANCELLED` | Order Service | Restore inventory stock |
| `CART_CLEAR_REQUESTED` | Event Processor | Clear user's cart after order |

### BullMQ Job Configuration

```typescript
{
  jobId: event.eventId,        // Prevents duplicate processing
  attempts: 3,                  // Retry failed jobs 3 times
  backoff: {
    type: 'exponential',
    delay: 2000                 // 2s → 4s → 8s
  },
  removeOnComplete: {
    age: 86400,                 // Keep completed jobs for 24 hours
    count: 1000                 // Keep last 1000 jobs
  },
  removeOnFail: {
    age: 604800                 // Keep failed jobs for 7 days
  }
}
```

### Why BullMQ + Kafka?

| Kafka | BullMQ |
|-------|--------|
| Distributed message streaming | Local job queue with persistence |
| High throughput pub/sub | Controlled processing rate |
| Message replay capability | Retry with backoff |
| Cross-service communication | Worker thread isolation |
| Event sourcing | Job scheduling & prioritization |

**Together they provide:**
- ✅ Reliable message delivery (Kafka)
- ✅ Guaranteed processing (BullMQ retries)
- ✅ Backpressure handling (queue buffering)
- ✅ Fault tolerance (Redis persistence)
- ✅ Horizontal scaling (multiple workers)

---

## 🏆 Architecture Strengths 

### 🔧 **Operational Excellence**
- **Full Observability Stack**: Grafana, Loki, Prometheus, Tempo for logs, metrics, and traces
- **Event-Driven Audit Trail**: Complete event log for debugging and monitoring
- **Docker Compose + Swarm**: Infrastructure as Code approach
- **CI/CD Pipeline**: GitHub Actions for automated deployment
- **Service Health Checks**: Docker health checks and restart policies
- **Centralized Logging**: All services log to Loki with structured format

### 🔒 **Security**
- **JWT Authentication**: Secure token-based auth with expiration
- **Password Hashing**: Salt + SHA256 for user passwords
- **CORS Configuration**: Proper cross-origin settings
- **Database SSL**: SSL connections to PostgreSQL (Neon.tech)
- **Service Isolation**: Microservices in separate containers
- **Secrets Management**: Environment variables for sensitive data

### 🛡️ **Reliability**
- **Event-Driven Architecture**: Loose coupling, fault isolation
- **BullMQ Retries**: 3 attempts with exponential backoff
- **Redis Persistence**: Job queue survives restarts
- **Database Transactions**: ACID compliance for critical operations
- **Idempotency**: Duplicate event detection
- **Auto-Restart Policies**: `restart: unless-stopped` on all services
- **Multiple Replicas**: Swarm mode supports scaling

### ⚡ **Performance Efficiency**
- **Direct Database Access**: Order service bypasses API for reads
- **GraphQL Federation**: Optimized cross-service queries
- **Redis Caching**: BullMQ job storage and potential caching layer
- **Docker Multi-Stage Builds**: Smaller production images
- **Nginx Compression**: gzip enabled for frontend
- **Connection Pooling**: TypeORM connection management

### 💰 **Cost Optimization**
- **Azure Free Tier Strategy**: Documented cost optimization approach
- **Resource Limits**: CPU/Memory limits in Swarm mode
- **Efficient Images**: Multi-stage builds reduce storage costs
- **Serverless Option**: Azure Static Web Apps for frontend (free)
- **Shared Infrastructure**: Multiple services per host

---

## �📚 Documentation
### 📋 Project Documentation
- **[Project Documentation (Word)](https://universityofruhuna-my.sharepoint.com/:w:/g/personal/shashini_fot_ruh_ac_lk/IQDGOsE4p8-yQqbmmAG1X_7kAYDlLGE7Xo-i15alakk1gjE?rtime=HykfXllJ3kg)** - Comprehensive project documentation
- **[Project Presentation (PowerPoint)](https://universityofruhuna-my.sharepoint.com/:p:/g/personal/shashini_fot_ruh_ac_lk/IQCtI-w3qJqCTbcO6SUhxx3dAez2Cpb0qNk3A6e6biGAhjA?e=0hdNPa)** - Project overview and presentation
- **[UI/UX Design Prototype (Figma)](https://www.figma.com/proto/1kDYRBeaBZZrt1gV5632gt/PlayFit?page-id=320%3A2075&node-id=376-4843&viewport=-262%2C177%2C0.22&t=gFvD7UIQxSQpSomJ-1&scaling=scale-down-width&content-scaling=fixed&starting-point-node-id=376%3A4843)** - Interactive design prototype and wireframes
---

## 🛠️ Technologies

**Backend:**
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Apollo Federation](https://www.apollographql.com/docs/federation/) - Distributed GraphQL architecture
- [TypeORM](https://typeorm.io/) - Object-Relational Mapping
- [PostgreSQL](https://www.postgresql.org/) - Relational database (hosted on Neon.tech)
- [JWT](https://jwt.io/) - JSON Web Tokens for authentication
- [KafkaJS](https://kafka.js.org/) - Modern Apache Kafka client
- [BullMQ](https://docs.bullmq.io/) - Premium message queue for Node.js
- [Redis](https://redis.io/) - In-memory data store for BullMQ

**Frontend:**
- [React 18](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Vite](https://vitejs.dev/) - Fast build tool
- [GraphQL](https://graphql.org/) - Query language for APIs

**DevOps:**
- [Docker](https://www.docker.com/) - Containerization
- [Docker Compose](https://docs.docker.com/compose/) - Multi-container orchestration
- [GitHub Actions](https://github.com/features/actions) - CI/CD automation
- [Azure App Service](https://azure.microsoft.com/services/app-service/) - Cloud hosting
- [Azure Static Web Apps](https://azure.microsoft.com/services/app-service/static/) - Frontend hosting

**🆕 Observability:**
- [Grafana](https://grafana.com/) - Metrics visualization and dashboards
- [Loki](https://grafana.com/oss/loki/) - Log aggregation system
- [Prometheus](https://prometheus.io/) - Metrics collection and alerting
- [Tempo](https://grafana.com/oss/tempo/) - Distributed tracing backend
- [Promtail](https://grafana.com/docs/loki/latest/clients/promtail/) - Log shipping agent

---

## 📁 Project Structure

```
PlayFit/
├── backend/
│   ├── shared/                 # 🆕 Shared utilities
│   │   ├── utils/
│   │   │   ├── kafka.client.ts    # Kafka client wrapper
│   │   │   ├── event-types.ts     # Event type definitions
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── login-sdk/              # User authentication service
│   │   ├── src/
│   │   │   ├── user/           # User entity, service, resolver
│   │   │   ├── Db_Encript/     # Database encryption utilities
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── cart_service/           # Shopping cart service
│   │   ├── src/
│   │   │   ├── cart/           # Cart entity, service, resolver
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── inventory_service/      # 🔄 Product inventory service (Kafka Publisher)
│   │   ├── src/
│   │   │   ├── inventory/      # Product entity, service, resolver
│   │   │   ├── kafka/          # 🆕 Kafka producer service
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   ├── .env.example
│   │   └── package.json
│   │
│   ├── order_service/          # 🔄 Order management (Kafka Publisher + Direct DB)
│   │   ├── src/
│   │   │   ├── order/          # Order entity, service, resolver
│   │   │   ├── kafka/          # 🆕 Kafka producer service
│   │   │   ├── entities/       # 🆕 Product entity for direct DB access
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   ├── .env.example
│   │   └── package.json
│   │
│   ├── event_processor/        # 🆕 Event processing service
│   │   ├── src/
│   │   │   ├── kafka/          # Kafka consumer service
│   │   │   ├── processors/     # BullMQ event processor
│   │   │   ├── entities/       # Event log entity
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── federation_gateway/     # Apollo Gateway
│       ├── src/
│       │   ├── app.module.ts   # Gateway configuration
│       │   └── main.ts
│       ├── Dockerfile
│       └── package.json
│
├── Frontend/                   # React application
│   ├── components/             # Reusable UI components
│   ├── pages/                  # Page components
│   ├── graphql/                # GraphQL client and queries
│   ├── context/                # React context providers
│   ├── utils/                  # Utility functions
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── .github/
│   └── workflows/              # CI/CD pipelines
│       ├── docker-build.yml    # Build and push Docker images
│       └── azure-deploy.yml    # Deploy to Azure
│
├── docker-compose.yml          # 🔄 Updated with Kafka, Zookeeper, Redis, Event Processor
├── .env.example                # Environment variables template
├── .dockerignore
├── QUICK_START.md              # Local testing guide
├── AZURE_FREE_TIER_GUIDE.md    # Azure costs and limitations
├── DEPLOYMENT_GUIDE.md         # Step-by-step Azure deployment
└── README.md                   # This file
```

---


##  Current Structure



## 🚀 Quick Start

### Local Development (Without Docker)

1. **Prerequisites:**
   - Node.js 18+
   - PostgreSQL database (or use Neon.tech)

2. **Install dependencies:**
   ```bash
   # Backend services
   cd backend/login-sdk && npm install
   cd ../cart_service && npm install
   cd ../inventory_service && npm install
   cd ../order_service && npm install
   cd ../federation_gateway && npm install

   # Frontend
   cd ../../Frontend && npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Create .env in each backend service
   DATABASE_URL=postgresql://user:password@host/playfit
   JWT_SECRET=your-secret-key
   ```

4. **Start services:**
   ```bash
   # Terminal 1 - User service
   cd backend/login-sdk
   npm run start:dev

   # Terminal 2 - Cart service
   cd backend/cart_service
   npm run start:dev

   # Terminal 3 - Inventory service
   cd backend/inventory_service
   npm run start:dev

   # Terminal 4 - Order service
   cd backend/order_service
   npm run start:dev

   # Terminal 5 - Gateway
   cd backend/federation_gateway
   npm run start:dev

   # Terminal 6 - Frontend
   cd Frontend
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Gateway: http://localhost:4000/graphql

---

### Docker Development (Recommended)

**See [QUICK_START.md](QUICK_START.md) for detailed Docker setup instructions.**

```bash
# 1. Create .env file
copy .env.example .env

# 2. Build images
docker-compose build

# 3. Start all services
docker-compose up -d

# 4. View logs
docker-compose logs -f

# 5. Stop services
docker-compose down
```

---

## ☁️ Deployment

### Azure Cloud (Free Tier)

1. **Understand costs:** Read [AZURE_FREE_TIER_GUIDE.md](AZURE_FREE_TIER_GUIDE.md)
2. **Deploy:** Follow [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

**What you get for FREE:**
- 10 App Service apps (F1 tier) for 12 months
- Azure Static Web Apps (always free)
- $200 credit for 30 days
- Free SSL certificates
- CI/CD with GitHub Actions

**Estimated monthly cost after free tier:**
- With Azure: ~$39/month (3 services on B1 tier)
- Hybrid approach: $0-5/month (using free alternatives)

### Docker Swarm Deployment

Docker Swarm provides container orchestration with built-in load balancing, service discovery, and scaling capabilities.

**1. Initialize Swarm Mode:**
```powershell
docker swarm init
```

**2. Build All Service Images:**
```powershell
docker compose -f docker-compose.swarm.yml build
```

**3. Deploy the Stack:**
```powershell
docker stack deploy -c docker-compose.swarm.yml playfit
```

**4. Verify Services:**
```powershell
docker stack services playfit
```

**5. View Service Logs:**
```powershell
docker service logs playfit_order-service -f
docker service logs playfit_federation-gateway -f
```

**6. Scale Services:**
```powershell
docker service scale playfit_order-service=4
docker service scale playfit_inventory-service=3
```

**7. Update a Service:**
```powershell
docker service update --image playfit-order-service:latest playfit_order-service
```

**8. Remove the Stack:**
```powershell
docker stack rm playfit
```

**Access Points:**
| Service | URL |
|---------|-----|
| Frontend | http://localhost:8088 |
| GraphQL Playground | http://localhost:8088/graphql |
| Grafana Dashboard | http://localhost:8088/grafana |
| Kafka UI | http://localhost:8080 |
| Kafdrop | http://localhost:9000 |

**Swarm Features:**
- ✅ Automatic load balancing across replicas
- ✅ Service discovery via DNS
- ✅ Rolling updates with zero downtime
- ✅ Health checks and auto-restart
- ✅ Overlay networking for secure communication
- ✅ Resource limits (CPU/Memory)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICK_START.md](QUICK_START.md) | Local testing with Docker |
| [AZURE_FREE_TIER_GUIDE.md](AZURE_FREE_TIER_GUIDE.md) | Azure costs, limits, and recommendations |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Complete Azure deployment walkthrough |
| [AUTH_TOKEN_GUIDE.md](Frontend/AUTH_TOKEN_GUIDE.md) | Authentication implementation details |
| [CART_SERVICE_GUIDE.md](backend/cart_service/CART_SERVICE_GUIDE.md) | Cart service documentation |
| [ORDER_SERVICE_GUIDE.md](backend/order_service/ORDER_SERVICE_GUIDE.md) | Order service documentation |

---

## � Microservices Overview

### User Service (login-sdk) - Port 3000
- **Purpose**: User authentication and profile management
- **Features**:
  - User registration and login
  - JWT token generation and validation
  - Password encryption and security
  - User profile management
- **Database**: PostgreSQL (User entity)

### Cart Service - Port 3002
- **Purpose**: Shopping cart management
- **Features**:
  - Add/remove items from cart
  - Update item quantities, sizes, and colors
  - Persistent cart across sessions
  - User-specific cart items
- **Database**: PostgreSQL (Cart entity)
- **Dependencies**: Extends User from User Service

### Inventory Service - Port 3003
- **Purpose**: Product catalog and inventory management
- **Features**:
  - Product CRUD operations
  - Product variants (sizes, colors)
  - Stock management
  - Category and filtering
  - Product search
- **Database**: PostgreSQL (Product entity)

### Order Service - Port 3004
- **Purpose**: Order processing and management
- **Features**:
  - Create orders from cart items
  - Order status tracking
  - Order history
  - Admin order management
  - Integration with cart and inventory services
- **Database**: PostgreSQL (Order entity)
- **Dependencies**: Integrates with Cart and Inventory services

### Federation Gateway - Port 4000
- **Purpose**: Unified GraphQL API gateway
- **Features**:
  - Aggregates all microservices into single graph
  - Handles cross-service queries
  - Authentication middleware
  - Query optimization
- **Technology**: Apollo Federation v2

---

## �🔑 Key Features Explained

### 1. GraphQL Federation

Services are independent but composed into a unified graph:

```graphql
# User Service provides
type User @key(fields: "id") {
  id: ID!
  username: String!
  email: String!
}

# Cart Service extends User
extend type User @key(fields: "id") {
  cartItems: [Cart!]!
}

# Gateway automatically stitches them together
```

### 2. Authentication Flow

```
1. User registers/logs in
2. Backend returns JWT access token
3. Frontend stores token in localStorage
4. Token included in all GraphQL requests (Authorization header)
5. Backend validates token and extracts user ID
6. Protected resolvers can access current user
```

### 3. Cart Persistence

- **Composite Primary Key**: (userId, productId, size, color)
- Allows multiple items with different variants
- Persists across sessions
- Automatically loads on login

### 4. Docker Multi-Stage Builds

Optimized for production:
```dockerfile
# Build stage - install all dependencies, build app
FROM node:18-alpine AS builder
# ... build steps ...

# Production stage - copy only production files
FROM node:18-alpine AS production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
# Result: 200MB instead of 800MB
```

---

## 🧪 Testing

### Run Tests

```bash
# Backend unit tests
cd backend/login-sdk
npm run test

cd ../cart_service
npm run test

# Frontend tests
cd ../../Frontend
npm run test
```

### Test GraphQL APIs

Use GraphQL Playground at http://localhost:4000/graphql

**Sample Queries:**

```graphql
# Register
mutation {
  register(registerInput: {
    username: "john"
    email: "john@example.com"
    password: "Pass123"
    role: "customer"
  }) {
    accessToken
    user { id username }
  }
}

# Add to cart
mutation {
  addToCart(addToCartInput: {
    userId: 1
    productId: 1
    quantity: 2
    size: "M"
    color: "Blue"
  }) {
    id
    quantity
  }
}

# Get user with cart items
query {
  user(id: 1) {
    username
    cartItems {
      id
      productId
      quantity
      size
      color
    }
  }
}
```

---

## 🔧 Configuration

### Environment Variables

**Backend Services (.env):**
```env
DATABASE_URL=postgresql://user:password@host:5432/playfit?sslmode=require
DB_SSL=true
JWT_SECRET=your-super-secret-key-min-32-chars
PORT=3000
```

**Federation Gateway (.env):**
```env
USER_SERVICE_URL=http://localhost:3000/graphql
CART_SERVICE_URL=http://localhost:3002/graphql
CORS_ORIGIN=http://localhost:5173
PORT=4000
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:4000/graphql
```

---

## 🛠️ Development

### Adding a New Microservice

1. Create new NestJS project
2. Install Federation package: `@nestjs/apollo @apollo/subgraph`
3. Configure GraphQL with `ApolloFederationDriver`
4. Add `@key` directives to types
5. Register in Gateway's `app.module.ts`
6. Create Dockerfile
7. Add to `docker-compose.yml`

### Database Migrations

```bash
# Generate migration
cd backend/login-sdk
npm run typeorm migration:generate -- -n MigrationName

# Run migrations
npm run typeorm migration:run

# Revert migration
npm run typeorm migration:revert
```

---

## 📈 Performance

### Current Optimizations

- ✅ Multi-stage Docker builds (smaller images)
- ✅ GraphQL query batching (federation)
- ✅ JWT token caching (localStorage)
- ✅ Nginx gzip compression (frontend)
- ✅ TypeORM connection pooling

### Planned Improvements

- [ ] Redis caching for session data
- [ ] CDN for static assets
- [ ] Database query optimization
- [ ] GraphQL query complexity limits
- [ ] Rate limiting on APIs
- [ ] Payment Gateway

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) for the excellent framework
- [Apollo GraphQL](https://www.apollographql.com/) for Federation
- [Neon](https://neon.tech/) for free PostgreSQL hosting
- [Azure](https://azure.microsoft.com/) for cloud infrastructure

---

## 🎓 Learning Resources

- [GraphQL Federation Tutorial](https://www.apollographql.com/docs/federation/quickstart/setup/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Docker Compose Guide](https://docs.docker.com/compose/gettingstarted/)
- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)

---

**Built with ❤️ using modern technologies**

🚀 Ready to deploy? Start with [QUICK_START.md](QUICK_START.md)

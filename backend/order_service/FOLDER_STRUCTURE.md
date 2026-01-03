# Order Service - Folder Structure

## Overview
The order service backend is organized with clear separation between entities and types/DTOs.

## Folder Structure

```
src/
├── entities/              # Database entities (TypeORM)
│   ├── order.entity.ts
│   ├── order-item.entity.ts
│   └── index.ts          # Barrel export
│
├── types/                # GraphQL input types and enums
│   ├── order-status.enum.ts
│   ├── create-order.input.ts
│   ├── ship-order.input.ts
│   ├── cart-item.input.ts
│   └── index.ts          # Barrel export
│
└── order/                # Order module business logic
    ├── order.service.ts  # Business logic
    ├── order.resolver.ts # GraphQL resolvers
    └── order.module.ts   # Module configuration
```

## Entities Folder (`src/entities/`)

Contains TypeORM database entities with GraphQL ObjectType decorators.

### `order.entity.ts`
- **Purpose**: Main order entity
- **Decorators**: `@Entity()`, `@ObjectType()`
- **Fields**: id, userId, customerName, customerEmail, customerAddress, totalAmount, status, trackingId, shippedBy, createdAt, updatedAt
- **Relationships**: OneToMany with OrderItem

### `order-item.entity.ts`
- **Purpose**: Order line items
- **Decorators**: `@Entity()`, `@ObjectType()`
- **Fields**: id, orderId, productId, productName, productPrice, productImage, quantity, size, color
- **Relationships**: ManyToOne with Order

### `index.ts`
- Barrel export for easy imports: `import { Order, OrderItem } from '../entities';`

## Types Folder (`src/types/`)

Contains GraphQL input types, enums, and DTOs.

### `order-status.enum.ts`
- **Purpose**: Order status enumeration
- **Values**: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- **Decorator**: `registerEnumType()` for GraphQL

### `create-order.input.ts`
- **Purpose**: Input type for creating orders
- **Decorator**: `@InputType()`
- **Fields**: userId, customerName, customerEmail, customerAddress

### `ship-order.input.ts`
- **Purpose**: Input type for shipping orders
- **Decorator**: `@InputType()`
- **Fields**: orderId, trackingId, shippedByAdmin

### `cart-item.input.ts`
- **Purpose**: Input type for cart items when creating order
- **Decorator**: `@InputType()`
- **Fields**: productId, productName, productPrice, productImage, quantity, size, color

### `index.ts`
- Barrel export: `import { OrderStatus, CreateOrderInput, ShipOrderInput, CartItemInput } from '../types';`

## Order Module (`src/order/`)

Contains business logic and GraphQL resolvers.

### `order.service.ts`
- **Purpose**: Order business logic
- **Methods**:
  - `createOrder()` - Create order from cart items
  - `getOrdersByUser()` - Get user's orders
  - `getAllOrders()` - Get all orders (admin)
  - `getOrderById()` - Get single order
  - `shipOrder()` - Ship order with tracking
  - `updateOrderStatus()` - Update order status

### `order.resolver.ts`
- **Purpose**: GraphQL API endpoints
- **Mutations**: createOrder, shipOrder, updateOrderStatus
- **Queries**: ordersByUser, allOrders, order

### `order.module.ts`
- **Purpose**: Module configuration
- **Imports**: TypeOrmModule with Order and OrderItem entities
- **Providers**: OrderService, OrderResolver
- **Exports**: OrderService

## Import Examples

```typescript
// In service or resolver
import { Order, OrderItem } from '../entities';
import { OrderStatus, CreateOrderInput, ShipOrderInput, CartItemInput } from '../types';

// All entities
import { Order, OrderItem } from '../entities';

// All types
import { OrderStatus, CreateOrderInput, ShipOrderInput, CartItemInput } from '../types';
```

## Benefits of This Structure

1. **Clear Separation**: Database entities vs GraphQL types
2. **Easy Navigation**: Know where to find what you need
3. **Barrel Exports**: Clean import statements
4. **Scalability**: Easy to add new entities or types
5. **Maintainability**: Related code grouped together
6. **Type Safety**: TypeScript with proper imports

## Naming Conventions

- **Entities**: `*.entity.ts` - Database tables with TypeORM decorators
- **Input Types**: `*.input.ts` - GraphQL input types for mutations
- **Enums**: `*.enum.ts` - Enumeration types
- **Services**: `*.service.ts` - Business logic
- **Resolvers**: `*.resolver.ts` - GraphQL endpoints
- **Modules**: `*.module.ts` - NestJS modules

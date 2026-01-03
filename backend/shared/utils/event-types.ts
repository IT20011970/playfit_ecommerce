/**
 * Event types for the event-driven architecture
 */

export enum EventType {
  // Inventory Events
  INVENTORY_ITEM_ADDED = 'INVENTORY_ITEM_ADDED',
  INVENTORY_ITEM_UPDATED = 'INVENTORY_ITEM_UPDATED',
  INVENTORY_ITEM_DELETED = 'INVENTORY_ITEM_DELETED',
  INVENTORY_STOCK_REDUCED = 'INVENTORY_STOCK_REDUCED',
  INVENTORY_STOCK_INCREASED = 'INVENTORY_STOCK_INCREASED',

  // Order Events
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  ORDER_SHIPPED = 'ORDER_SHIPPED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
}

export interface BaseEvent {
  eventId: string;
  eventType: EventType;
  timestamp: number;
  data: any;
}

// Inventory Event Interfaces
export interface InventoryItemAddedEvent extends BaseEvent {
  eventType: EventType.INVENTORY_ITEM_ADDED;
  data: {
    productId: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
  };
}

export interface InventoryItemUpdatedEvent extends BaseEvent {
  eventType: EventType.INVENTORY_ITEM_UPDATED;
  data: {
    productId: string;
    changes: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      imageUrl?: string;
    };
  };
}

export interface InventoryItemDeletedEvent extends BaseEvent {
  eventType: EventType.INVENTORY_ITEM_DELETED;
  data: {
    productId: string;
  };
}

export interface InventoryStockReducedEvent extends BaseEvent {
  eventType: EventType.INVENTORY_STOCK_REDUCED;
  data: {
    productId: string;
    quantity: number;
    remainingStock: number;
  };
}

export interface InventoryStockIncreasedEvent extends BaseEvent {
  eventType: EventType.INVENTORY_STOCK_INCREASED;
  data: {
    productId: string;
    quantity: number;
    newStock: number;
  };
}

// Order Event Interfaces
export interface OrderCreatedEvent extends BaseEvent {
  eventType: EventType.ORDER_CREATED;
  data: {
    orderId: string;
    userId: string;
    customerName: string;
    customerEmail: string;
    customerAddress: string;
    totalAmount: number;
    status: string;
    items: Array<{
      productId: string;
      productName: string;
      productPrice: number;
      quantity: number;
      size?: string;
      color?: string;
    }>;
  };
}

export interface OrderConfirmedEvent extends BaseEvent {
  eventType: EventType.ORDER_CONFIRMED;
  data: {
    orderId: string;
    userId: string;
  };
}

export interface OrderShippedEvent extends BaseEvent {
  eventType: EventType.ORDER_SHIPPED;
  data: {
    orderId: string;
    userId: string;
    trackingNumber?: string;
  };
}

export interface OrderDeliveredEvent extends BaseEvent {
  eventType: EventType.ORDER_DELIVERED;
  data: {
    orderId: string;
    userId: string;
  };
}

export interface OrderCancelledEvent extends BaseEvent {
  eventType: EventType.ORDER_CANCELLED;
  data: {
    orderId: string;
    userId: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
  };
}

// Union type for all events
export type DomainEvent =
  | InventoryItemAddedEvent
  | InventoryItemUpdatedEvent
  | InventoryItemDeletedEvent
  | InventoryStockReducedEvent
  | InventoryStockIncreasedEvent
  | OrderCreatedEvent
  | OrderConfirmedEvent
  | OrderShippedEvent
  | OrderDeliveredEvent
  | OrderCancelledEvent;

// Kafka Topics
export const KafkaTopics = {
  INVENTORY_EVENTS: 'inventory-events',
  ORDER_EVENTS: 'order-events',
} as const;

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

// Kafka Topics
export const KafkaTopics = {
  INVENTORY_EVENTS: 'inventory-events',
  ORDER_EVENTS: 'order-events',
} as const;

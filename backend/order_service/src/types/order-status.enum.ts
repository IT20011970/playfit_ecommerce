import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});

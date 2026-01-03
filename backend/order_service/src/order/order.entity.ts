import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { OrderItem } from './order-item.entity';

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

@Entity('orders')
@ObjectType()
export class Order {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column({ name: 'user_id' })
  @Field()
  userId: string;

  @Column({ name: 'customer_name' })
  @Field()
  customerName: string;

  @Column({ name: 'customer_email' })
  @Field()
  customerEmail: string;

  @Column({ name: 'customer_address' })
  @Field()
  customerAddress: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'total_amount' })
  @Field()
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  @Field(() => OrderStatus)
  status: OrderStatus;

  @Column({ name: 'tracking_id', nullable: true })
  @Field({ nullable: true })
  trackingId?: string;

  @Column({ name: 'shipped_by', nullable: true })
  @Field({ nullable: true })
  shippedBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  @Field()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Field()
  updatedAt: Date;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true, eager: true })
  @Field(() => [OrderItem])
  items: OrderItem[];
}

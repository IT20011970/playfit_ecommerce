import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';


export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}


@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'customer_name' })
  customerName: string;

  @Column({ name: 'customer_email' })
  customerEmail: string;

  @Column({ name: 'customer_address' })
  customerAddress: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column({ name: 'tracking_id', nullable: true })
  trackingId?: string;

  @Column({ name: 'shipped_by', nullable: true })
  shippedBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true, eager: true })
  items: OrderItem[];
}

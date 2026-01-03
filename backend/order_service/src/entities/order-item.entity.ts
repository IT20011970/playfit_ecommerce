import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Order } from './order.entity';

@Entity('order_items')
@ObjectType()
export class OrderItem {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @Column({ name: 'product_id' })
  @Field()
  productId: string;

  @Column({ name: 'product_name' })
  @Field()
  productName: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'product_price' })
  @Field()
  productPrice: number;

  @Column({ name: 'product_image' })
  @Field()
  productImage: string;

  @Column()
  @Field()
  quantity: number;

  @Column()
  @Field()
  size: string;

  @Column()
  @Field()
  color: string;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}

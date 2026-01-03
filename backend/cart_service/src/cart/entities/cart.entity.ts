import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'Cart' })
export class Cart {
  // Composite primary key to allow multiple items per user
  @PrimaryColumn({ name: 'UserId', type: 'varchar', length: 50 })
  userId: string;

  @PrimaryColumn({ name: 'ProductId', type: 'varchar', length: 50 })
  productId: string;

  @PrimaryColumn({ name: 'Size', type: 'varchar', length: 20 })
  size: string;

  @PrimaryColumn({ name: 'Color', type: 'varchar', length: 50 })
  color: string;

  @Column({ name: 'Quantity', type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'ProductName', type: 'varchar', length: 200, nullable: true })
  productName: string | null;

  @Column({ name: 'ProductPrice', type: 'decimal', precision: 10, scale: 2, nullable: true })
  productPrice: number | null;

  @Column({ name: 'ProductImage', type: 'text', nullable: true })
  productImage: string | null;

  @CreateDateColumn({ name: 'CreatedAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'UpdatedAt' })
  updatedAt: Date;
}

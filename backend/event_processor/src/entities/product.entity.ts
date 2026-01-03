import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  image: string;

  @Column()
  category: string;

  @Column('int')
  stock: number;

  @Column('simple-array')
  sizes: string[];

  @Column('simple-array')
  colors: string[];

  @Column({ default: false })
  isNewArrival: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

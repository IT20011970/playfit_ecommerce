import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
@Entity('products')
export class Product {
  @Field(() => ID)
  @PrimaryColumn()
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column('text')
  description: string;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Field()
  @Column()
  image: string;

  @Field()
  @Column()
  category: string;

  @Field(() => Int)
  @Column('int')
  stock: number;

  @Field(() => [String])
  @Column('simple-array')
  sizes: string[];

  @Field(() => [String])
  @Column('simple-array')
  colors: string[];

  @Field()
  @Column({ default: false })
  isNewArrival: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

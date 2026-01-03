import { ObjectType, Field, Int, Float, Directive } from '@nestjs/graphql';

@ObjectType({ description: 'Cart item GraphQL type' })
export class CartItemGql {
  @Field(() => String, { description: 'User ID' })
  userId: string;

  @Field(() => String, { description: 'Product ID' })
  productId: string;

  @Field(() => Int, { description: 'Quantity' })
  quantity: number;

  @Field(() => String, { description: 'Selected size' })
  size: string;

  @Field(() => String, { description: 'Selected color' })
  color: string;

  @Field(() => String, { nullable: true, description: 'Product name' })
  productName?: string | null;

  @Field(() => Float, { nullable: true, description: 'Product price' })
  productPrice?: number | null;

  @Field(() => String, { nullable: true, description: 'Product image URL' })
  productImage?: string | null;

  @Field(() => Date, { description: 'Created at timestamp' })
  createdAt: Date;

  @Field(() => Date, { description: 'Updated at timestamp' })
  updatedAt: Date;
}

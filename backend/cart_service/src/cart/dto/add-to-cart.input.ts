import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class AddToCartInput {
  @Field(() => String, { description: 'User ID' })
  userId: string;

  @Field(() => String, { description: 'Product ID' })
  productId: string;

  @Field(() => Int, { description: 'Quantity to add', defaultValue: 1 })
  quantity: number;

  @Field(() => String, { description: 'Selected size' })
  size: string;

  @Field(() => String, { description: 'Selected color' })
  color: string;

  @Field(() => String, { nullable: true, description: 'Product name' })
  productName?: string;

  @Field(() => Float, { nullable: true, description: 'Product price' })
  productPrice?: number;

  @Field(() => String, { nullable: true, description: 'Product image URL' })
  productImage?: string;
}

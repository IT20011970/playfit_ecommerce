import { InputType, Field, Float, Int } from '@nestjs/graphql';

@InputType()
export class CartItemInput {
  @Field()
  productId: string;

  @Field()
  productName: string;

  @Field(() => Float)
  productPrice: number;

  @Field()
  productImage: string;

  @Field(() => Int)
  quantity: number;

  @Field()
  size: string;

  @Field()
  color: string;
}

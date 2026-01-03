import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateCartItemInput {
  @Field(() => String, { description: 'User ID' })
  userId: string;

  @Field(() => String, { description: 'Product ID' })
  productId: string;

  @Field(() => String, { description: 'Size' })
  size: string;

  @Field(() => String, { description: 'Color' })
  color: string;

  @Field(() => Int, { description: 'New quantity' })
  quantity: number;
}

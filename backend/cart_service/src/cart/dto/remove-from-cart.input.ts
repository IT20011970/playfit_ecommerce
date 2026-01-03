import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RemoveFromCartInput {
  @Field(() => String, { description: 'User ID' })
  userId: string;

  @Field(() => String, { description: 'Product ID' })
  productId: string;

  @Field(() => String, { description: 'Size' })
  size: string;

  @Field(() => String, { description: 'Color' })
  color: string;
}

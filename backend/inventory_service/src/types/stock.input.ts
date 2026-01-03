import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class ReduceStockInput {
  @Field()
  productId: string;

  @Field(() => Int)
  quantity: number;
}

@InputType()
export class CheckStockInput {
  @Field()
  productId: string;

  @Field(() => Int)
  quantity: number;
}

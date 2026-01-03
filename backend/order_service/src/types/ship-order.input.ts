import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class ShipOrderInput {
  @Field(() => Int)
  orderId: number;

  @Field()
  trackingId: string;

  @Field()
  shippedByAdmin: string;
}

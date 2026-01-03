import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateOrderInput {
  @Field()
  userId: string;

  @Field()
  customerName: string;

  @Field()
  customerEmail: string;

  @Field()
  customerAddress: string;
}

@InputType()
export class ShipOrderInput {
  @Field()
  orderId: number;

  @Field()
  trackingId: string;

  @Field()
  shippedByAdmin: string;
}

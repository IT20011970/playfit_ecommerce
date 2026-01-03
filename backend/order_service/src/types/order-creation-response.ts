import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class OrderCreationResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  orderId?: string;
}

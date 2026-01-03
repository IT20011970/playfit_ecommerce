import { Field, Int, ObjectType, Directive } from '@nestjs/graphql';
import { CartItemGql } from './cart-item.graphql';

// This extends the User entity from the login-sdk subgraph (UserGql)
@ObjectType('User')
@Directive('@extends')
@Directive('@key(fields: "id")')
export class UserRef {
  @Field(() => Int)
  @Directive('@external')
  id: number;

  @Field(() => [CartItemGql])
  cartItems: CartItemGql[];
}

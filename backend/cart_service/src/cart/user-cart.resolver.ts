import { Resolver, ResolveField, Parent, ResolveReference } from '@nestjs/graphql';
import { CartService } from './cart.service';
import { UserRef } from './types/user.graphql';
import { CartItemGql } from './types/cart-item.graphql';

@Resolver(() => UserRef)
export class UserCartResolver {
  constructor(private readonly cartService: CartService) {}

  // Provide an entity reference resolver so the gateway can hand us a User entity by key
  @ResolveReference()
  resolveReference(reference: { __typename: string; id: number }): Partial<UserRef> {
    // We only need the id to resolve fields for this extension
    return { id: reference.id };
  }

  @ResolveField(() => [CartItemGql])
  async cartItems(@Parent() user: UserRef): Promise<CartItemGql[]> {
    // Our DB stores userId as string; convert numeric id to string for lookup
    const items = await this.cartService.getCartByUserId(String(user.id));
    return items as unknown as CartItemGql[];
  }
}

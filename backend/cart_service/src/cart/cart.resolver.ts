import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CartService } from './cart.service';
import { CartItemGql } from './types/cart-item.graphql';
import { AddToCartInput } from './dto/add-to-cart.input';
import { UpdateCartItemInput } from './dto/update-cart-item.input';
import { RemoveFromCartInput } from './dto/remove-from-cart.input';

@Resolver(() => CartItemGql)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Query(() => [CartItemGql], { name: 'cart', description: 'Get cart items for a user' })
  async getCart(@Args('userId', { type: () => String }) userId: string): Promise<CartItemGql[]> {
    const cartItems = await this.cartService.getCartByUserId(userId);
    return cartItems as CartItemGql[];
  }

  @Mutation(() => CartItemGql, { name: 'addToCart', description: 'Add item to cart' })
  async addToCart(@Args('input') input: AddToCartInput): Promise<CartItemGql> {
    const cartItem = await this.cartService.addToCart(input);
    return cartItem as CartItemGql;
  }

  @Mutation(() => CartItemGql, { name: 'updateCartItem', description: 'Update cart item quantity' })
  async updateCartItem(@Args('input') input: UpdateCartItemInput): Promise<CartItemGql> {
    const cartItem = await this.cartService.updateCartItem(input);
    return cartItem as CartItemGql;
  }

  @Mutation(() => Boolean, { name: 'removeFromCart', description: 'Remove item from cart' })
  async removeFromCart(@Args('input') input: RemoveFromCartInput): Promise<boolean> {
    return this.cartService.removeFromCart(input);
  }

  @Mutation(() => Boolean, { name: 'clearCart', description: 'Clear all cart items for a user' })
  async clearCart(@Args('userId', { type: () => String }) userId: string): Promise<boolean> {
    return this.cartService.clearCart(userId);
  }

  @Query(() => Number, { name: 'cartTotal', description: 'Get total price of cart items' })
  async getCartTotal(@Args('userId', { type: () => String }) userId: string): Promise<number> {
    return this.cartService.getCartTotal(userId);
  }
}

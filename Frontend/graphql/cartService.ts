import { graphqlClient } from './client';
import { ADD_TO_CART, GET_CART, UPDATE_CART_ITEM, REMOVE_FROM_CART, CLEAR_CART, GET_CART_TOTAL } from './cartQueries';

export interface CartItem {
  userId: string;
  productId: string;
  quantity: number;
  size: string;
  color: string;
  productName?: string | null;
  productPrice?: number | null;
  productImage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartInput {
  userId: string;
  productId: string;
  quantity: number;
  size: string;
  color: string;
  productName?: string;
  productPrice?: number;
  productImage?: string;
}

export interface UpdateCartItemInput {
  userId: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export interface RemoveFromCartInput {
  userId: string;
  productId: string;
  size: string;
  color: string;
}

export class CartService {
  /**
   * Get all cart items for a user
   */
  async getCart(userId: string): Promise<CartItem[]> {
    const response = await graphqlClient.query<{ cart: CartItem[] }>(
      GET_CART,
      { userId }
    );
    return response.cart;
  }

  /**
   * Get cart total
   */
  async getCartTotal(userId: string): Promise<number> {
    const response = await graphqlClient.query<{ cartTotal: number }>(
      GET_CART_TOTAL,
      { userId }
    );
    return response.cartTotal;
  }

  /**
   * Add item to cart
   */
  async addToCart(input: AddToCartInput): Promise<CartItem> {
    const response = await graphqlClient.mutate<{ addToCart: CartItem }>(
      ADD_TO_CART,
      { input }
    );
    return response.addToCart;
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(input: UpdateCartItemInput): Promise<CartItem> {
    const response = await graphqlClient.mutate<{ updateCartItem: CartItem }>(
      UPDATE_CART_ITEM,
      { input }
    );
    return response.updateCartItem;
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(input: RemoveFromCartInput): Promise<boolean> {
    const response = await graphqlClient.mutate<{ removeFromCart: boolean }>(
      REMOVE_FROM_CART,
      { input }
    );
    return response.removeFromCart;
  }

  /**
   * Clear all cart items for a user
   */
  async clearCart(userId: string): Promise<boolean> {
    const response = await graphqlClient.mutate<{ clearCart: boolean }>(
      CLEAR_CART,
      { userId }
    );
    return response.clearCart;
  }
}

export const cartService = new CartService();

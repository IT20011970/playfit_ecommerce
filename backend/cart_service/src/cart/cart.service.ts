import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { AddToCartInput } from './dto/add-to-cart.input';
import { UpdateCartItemInput } from './dto/update-cart-item.input';
import { RemoveFromCartInput } from './dto/remove-from-cart.input';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
  ) {}

  /**
   * Get all cart items for a specific user
   */
  async getCartByUserId(userId: string): Promise<Cart[]> {
    return this.cartRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Add item to cart or update quantity if already exists
   */
  async addToCart(input: AddToCartInput): Promise<Cart> {
    const existingItem = await this.cartRepo.findOne({
      where: {
        userId: input.userId,
        productId: input.productId,
        size: input.size,
        color: input.color,
      },
    });

    if (existingItem) {
      existingItem.quantity += input.quantity;
      existingItem.productName = input.productName || existingItem.productName;
      existingItem.productPrice = input.productPrice || existingItem.productPrice;
      existingItem.productImage = input.productImage || existingItem.productImage;
      return this.cartRepo.save(existingItem);
    } else {
      const newCartItem = this.cartRepo.create({
        userId: input.userId,
        productId: input.productId,
        quantity: input.quantity,
        size: input.size,
        color: input.color,
        productName: input.productName,
        productPrice: input.productPrice,
        productImage: input.productImage,
      });
      return this.cartRepo.save(newCartItem);
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(input: UpdateCartItemInput): Promise<Cart> {
    const cartItem = await this.cartRepo.findOne({
      where: {
        userId: input.userId,
        productId: input.productId,
        size: input.size,
        color: input.color,
      },
    });

    if (!cartItem) {
      throw new NotFoundException(
        `Cart item not found for user ${input.userId}, product ${input.productId}`,
      );
    }

    // If quantity is 0 or less, remove the item
    if (input.quantity <= 0) {
      await this.cartRepo.remove(cartItem);
      throw new NotFoundException('Item removed from cart');
    }

    cartItem.quantity = input.quantity;
    return this.cartRepo.save(cartItem);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(input: RemoveFromCartInput): Promise<boolean> {
    const cartItem = await this.cartRepo.findOne({
      where: {
        userId: input.userId,
        productId: input.productId,
        size: input.size,
        color: input.color,
      },
    });

    if (!cartItem) {
      return false;
    }

    await this.cartRepo.remove(cartItem);
    return true;
  }

  /**
   * Clear all cart items for a user
   */
  async clearCart(userId: string): Promise<boolean> {
    const result = await this.cartRepo.delete({ userId });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Get cart total for a user
   */
  async getCartTotal(userId: string): Promise<number> {
    const cartItems = await this.getCartByUserId(userId);
    return cartItems.reduce((total, item) => {
      const price = item.productPrice || 0;
      return total + price * item.quantity;
    }, 0);
  }
}

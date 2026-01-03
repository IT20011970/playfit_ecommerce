import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { InventoryService } from './inventory.service';
import { Product } from '../entities';
import { CreateProductInput, UpdateProductInput, ReduceStockInput, MutationResponse } from '../types';

@Resolver(() => Product)
export class InventoryResolver {
  constructor(private readonly inventoryService: InventoryService) {}

  @Query(() => [Product], { name: 'products' })
  async getProducts(): Promise<Product[]> {
    return this.inventoryService.findAll();
  }

  @Query(() => Product, { name: 'product' })
  async getProduct(@Args('id', { type: () => ID }) id: string): Promise<Product> {
    return this.inventoryService.findOne(id);
  }

  @Query(() => Boolean, { name: 'checkStock' })
  async checkStock(
    @Args('productId') productId: string,
    @Args('quantity', { type: () => Int }) quantity: number,
  ): Promise<boolean> {
    return this.inventoryService.checkStock(productId, quantity);
  }

  @Mutation(() => MutationResponse, { name: 'addProduct' })
  async addProduct(@Args('input') input: CreateProductInput): Promise<{ success: boolean; message: string }> {
    return this.inventoryService.create(input);
  }

  @Mutation(() => MutationResponse, { name: 'updateProduct' })
  async updateProduct(@Args('input') input: UpdateProductInput): Promise<{ success: boolean; message: string }> {
    return this.inventoryService.update(input);
  }

  @Mutation(() => MutationResponse, { name: 'deleteProduct' })
  async deleteProduct(@Args('id', { type: () => ID }) id: string): Promise<{ success: boolean; message: string }> {
    return this.inventoryService.delete(id);
  }

  @Mutation(() => MutationResponse, { name: 'reduceStock' })
  async reduceStock(
    @Args('productId') productId: string,
    @Args('quantity', { type: () => Int }) quantity: number,
  ): Promise<{ success: boolean; message: string }> {
    return this.inventoryService.reduceStock(productId, quantity);
  }

  @Mutation(() => MutationResponse, { name: 'reduceMultipleStock' })
  async reduceMultipleStock(
    @Args({ name: 'items', type: () => [ReduceStockInput] }) items: ReduceStockInput[],
  ): Promise<{ success: boolean; message: string }> {
    return this.inventoryService.reduceMultipleStock(items);
  }

  @Mutation(() => MutationResponse, { name: 'increaseStock' })
  async increaseStock(
    @Args('productId') productId: string,
    @Args('quantity', { type: () => Int }) quantity: number,
  ): Promise<{ success: boolean; message: string }> {
    return this.inventoryService.increaseStock(productId, quantity);
  }

  @Mutation(() => [Product], { name: 'seedProducts' })
  async seedProducts(
    @Args({ name: 'products', type: () => [CreateProductInput] }) products: CreateProductInput[],
  ): Promise<Product[]> {
    return this.inventoryService.seedProducts(products);
  }
}

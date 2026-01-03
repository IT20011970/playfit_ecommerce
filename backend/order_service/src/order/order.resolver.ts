import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { Order } from '../entities';
import { OrderStatus, CreateOrderInput, ShipOrderInput, CartItemInput, OrderCreationResponse } from '../types';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Mutation(() => OrderCreationResponse)
  async createOrder(
    @Args('input') createOrderInput: CreateOrderInput,
    @Args('cartItems', { type: () => [CartItemInput] }) cartItems: CartItemInput[],
  ): Promise<OrderCreationResponse> {
    return this.orderService.createOrder(createOrderInput, cartItems);
  }

  @Query(() => [Order], { name: 'ordersByUser' })
  async getOrdersByUser(
    @Args('userId') userId: string,
  ): Promise<Order[]> {
    return this.orderService.getOrdersByUser(userId);
  }

  @Query(() => [Order], { name: 'allOrders' })
  async getAllOrders(): Promise<Order[]> {
    return this.orderService.getAllOrders();
  }

  @Query(() => Order, { name: 'order' })
  async getOrderById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Order> {
    return this.orderService.getOrderById(id);
  }

  @Mutation(() => Order)
  async shipOrder(
    @Args('input') shipOrderInput: ShipOrderInput,
  ): Promise<Order> {
    return this.orderService.shipOrder(shipOrderInput);
  }

  @Mutation(() => Order)
  async updateOrderStatus(
    @Args('orderId', { type: () => Int }) orderId: number,
    @Args('status', { type: () => String }) status: OrderStatus,
  ): Promise<Order> {
    return this.orderService.updateOrderStatus(orderId, status);
  }
}

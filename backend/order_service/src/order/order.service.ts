import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderItem, Product } from '../entities';
import { OrderStatus, CreateOrderInput, ShipOrderInput, CartItemInput } from '../types';
import { KafkaProducerService } from '../utils/kafka/kafka-producer.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product, 'inventory')
    private readonly productRepository: Repository<Product>,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async createOrder(
    createOrderInput: CreateOrderInput,
    cartItems: CartItemInput[],
  ): Promise<{ success: boolean; message: string; orderId?: string }> {
    // If client didn't send cart items, try to fetch from Cart Service
    if (!cartItems || cartItems.length === 0) {
      this.logger.warn(`No cartItems provided by client. Fetching cart for user ${createOrderInput.userId} from Cart Service...`);
      const fetched = await this.fetchUserCart(createOrderInput.userId);
      if (!fetched || fetched.length === 0) {
        throw new BadRequestException('Cart is empty');
      }
      cartItems = fetched;
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.productPrice * item.quantity,
      0,
    );

    // Generate temporary order ID for tracking
    const tempOrderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Only publish ORDER_CREATED event - Event processor will handle:
    // 1. Check inventory stock
    // 2. Reduce inventory
    // 3. Create order with items
    // 4. Clear cart
    // All in a transaction!
    try {
      await this.kafkaProducer.publishOrderCreated({
        tempOrderId,
        userId: createOrderInput.userId,
        customerName: createOrderInput.customerName,
        customerEmail: createOrderInput.customerEmail,
        customerAddress: createOrderInput.customerAddress,
        totalAmount,
        cartItems,
        status: OrderStatus.PENDING,
      });
    } catch (error) {
      this.logger.error(`Failed to publish ORDER_CREATED event:`, error.message);
      throw new BadRequestException('Failed to create order event');
    }

    return {
      success: true,
      message: 'Order creation event published. You will be notified once processed.',
      orderId: tempOrderId,
    };
  }

  /**
   * Fetch user's cart items from Cart Service
   */
  private async fetchUserCart(userId: string): Promise<CartItemInput[]> {
    const cartServiceUrl = process.env.CART_SERVICE_URL || 'http://localhost:3002/graphql';
    const getCartQuery = `
      query GetCart($userId: String!) {
        cart(userId: $userId) {
          productId
          productName
          productPrice
          productImage
          quantity
          size
          color
        }
      }
    `;

    const response = await fetch(cartServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: getCartQuery,
        variables: { userId },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cart: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data?.cart || [];
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async shipOrder(shipOrderInput: ShipOrderInput): Promise<Order> {
    const order = await this.getOrderById(shipOrderInput.orderId);

    order.status = OrderStatus.SHIPPED;
    order.trackingId = shipOrderInput.trackingId;
    order.shippedBy = shipOrderInput.shippedByAdmin;

    return this.orderRepository.save(order);
  }

  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const order = await this.getOrderById(orderId);
    order.status = status;
    return this.orderRepository.save(order);
  }
}

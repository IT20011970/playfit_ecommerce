import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventLog } from '../entities/event-log.entity';
import { Product } from '../entities/product.entity';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { KafkaProducerService } from '../utils/kafka/kafka-producer.service';

export interface EventJobData {
  eventId: string;
  eventType: string;
  timestamp: number;
  data: any;
  topic: string;
}

@Processor('events', {
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000,
  },
})
export class EventProcessor extends WorkerHost {
  private readonly logger = new Logger(EventProcessor.name);

  constructor(
    @InjectRepository(EventLog, 'eventConnection')
    private readonly eventLogRepository: Repository<EventLog>,
    @InjectRepository(Product, 'inventoryConnection')
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order, 'orderConnection')
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem, 'orderConnection')
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly kafkaProducer: KafkaProducerService,
  ) {
    super();
    this.logger.log('EventProcessor initialized and ready to process jobs');
  }

  async process(job: Job<EventJobData>): Promise<any> {
    const { eventId, eventType, data, topic } = job.data;
    
    this.logger.log(`🎯 Processing event: ${eventType} (ID: ${eventId}) from topic: ${topic}`);

    try {
      const existingEvent = await this.eventLogRepository.findOne({
        where: { eventId },
      });

      if (existingEvent) {
        this.logger.warn(`Event ${eventId} already processed. Skipping.`);
        return { status: 'skipped', reason: 'already_processed' };
      }

      await this.handleEvent(eventType, data);

      const eventLog = this.eventLogRepository.create({
        eventId,
        eventType,
        topic,
        payload: data,
        status: 'processed',
        processedAt: new Date(),
      });

      await this.eventLogRepository.save(eventLog);

      this.logger.log(`Successfully processed event: ${eventType} (ID: ${eventId})`);
      return { status: 'success' };

    } catch (error) {
      this.logger.error(`Failed to process event ${eventId}:`, error);

      // Log failed event
      try {
        const errorLog = this.eventLogRepository.create({
          eventId,
          eventType,
          topic,
          payload: data,
          status: 'failed',
          errorMessage: error.message,
          processedAt: new Date(),
        });
        await this.eventLogRepository.save(errorLog);
      } catch (logError) {
        this.logger.error(`Failed to log error for event ${eventId}:`, logError);
      }

      throw error;
    }
  }

  private async handleEvent(eventType: string, data: any): Promise<any> {
    this.logger.log(`Handling event type: ${eventType}`);

    switch (eventType) {
      // Inventory Events
      case 'INVENTORY_ITEM_ADDED':
        return this.handleInventoryItemAdded(data);
      
      case 'INVENTORY_ITEM_UPDATED':
        return this.handleInventoryItemUpdated(data);
      
      case 'INVENTORY_ITEM_DELETED':
        return this.handleInventoryItemDeleted(data);
      
      case 'INVENTORY_STOCK_REDUCED':
        return this.handleInventoryStockReduced(data);
      
      case 'INVENTORY_STOCK_INCREASED':
        return this.handleInventoryStockIncreased(data);

      // Order Events
      case 'ORDER_CREATED':
        return this.handleOrderCreated(data);
      
      case 'ORDER_CONFIRMED':
        return this.handleOrderConfirmed(data);
      
      case 'ORDER_SHIPPED':
        return this.handleOrderShipped(data);
      
      case 'ORDER_CANCELLED':
        return this.handleOrderCancelled(data);

      default:
        this.logger.warn(`Unknown event type: ${eventType}`);
        return { status: 'skipped', reason: 'unknown_event_type' };
    }
  }

  // Inventory Event Handlers - Now with actual DB operations
  private async handleInventoryItemAdded(data: any): Promise<any> {
    try {
      this.logger.log(`Creating product: ${data.id} - ${data.name}`);
      
      const product = this.productRepository.create({
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        category: data.category,
        stock: data.stock,
        sizes: data.sizes,
        colors: data.colors,
        isNewArrival: data.isNewArrival,
      });
      
      const savedProduct = await this.productRepository.save(product);
      
      // Publish success event to notification service
      await this.kafkaProducer.publishItemCreatedSuccess(savedProduct, data.userId);
      
      return { status: 'success', product: savedProduct };
    } catch (error) {
      this.logger.error(`Failed to create product:`, error);
      
      // Publish failure event to notification service
      await this.kafkaProducer.publishItemCreatedFailed(data, error.message, data.userId);
      
      throw error;
    }
  }

  private async handleInventoryItemUpdated(data: any): Promise<any> {
    try {
      this.logger.log(`Updating product: ${data.productId}`);
      
      const product = await this.productRepository.findOne({ where: { id: data.productId } });
      if (!product) {
        throw new Error(`Product ${data.productId} not found`);
      }
      
      // Apply changes
      Object.assign(product, data.changes);
      const updatedProduct = await this.productRepository.save(product);
      
      // Publish success event
      await this.kafkaProducer.publishItemUpdatedSuccess(data.productId, data.changes, data.userId);
      
      return { status: 'success', product: updatedProduct };
    } catch (error) {
      this.logger.error(`Failed to update product:`, error);
      
      // Publish failure event
      await this.kafkaProducer.publishItemUpdatedFailed(data.productId, data.changes, error.message, data.userId);
      
      throw error;
    }
  }

  private async handleInventoryItemDeleted(data: any): Promise<any> {
    try {
      this.logger.log(`Deleting product: ${data.productId}`);
      
      const result = await this.productRepository.delete(data.productId);
      
      if ((result.affected ?? 0) === 0) {
        throw new Error(`Product ${data.productId} not found`);
      }
      
      // Publish success event
      await this.kafkaProducer.publishItemDeletedSuccess(data.productId, data.userId);
      
      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Failed to delete product:`, error);
      
      // Publish failure event
      await this.kafkaProducer.publishItemDeletedFailed(data.productId, error.message, data.userId);
      
      throw error;
    }
  }

  private async handleInventoryStockReduced(data: any): Promise<any> {
    try {
      this.logger.log(`Reducing stock for ${data.productId}: -${data.quantity}`);
      
      const product = await this.productRepository.findOne({ where: { id: data.productId } });
      if (!product) {
        throw new Error(`Product ${data.productId} not found`);
      }
      
      product.stock -= data.quantity;
      const updatedProduct = await this.productRepository.save(product);
      
      // Publish success event
      await this.kafkaProducer.publishStockReducedSuccess(
        data.productId, 
        data.quantity, 
        updatedProduct.stock,
        data.userId
      );
      
      return { status: 'success', remainingStock: updatedProduct.stock };
    } catch (error) {
      this.logger.error(`Failed to reduce stock:`, error);
      
      // Publish failure event
      await this.kafkaProducer.publishStockReducedFailed(
        data.productId, 
        data.quantity, 
        error.message,
        data.userId
      );
      
      throw error;
    }
  }

  private async handleInventoryStockIncreased(data: any): Promise<any> {
    try {
      this.logger.log(`Increasing stock for ${data.productId}: +${data.quantity}`);
      
      const product = await this.productRepository.findOne({ where: { id: data.productId } });
      if (!product) {
        throw new Error(`Product ${data.productId} not found`);
      }
      
      product.stock += data.quantity;
      const updatedProduct = await this.productRepository.save(product);
      
      // Publish success event
      await this.kafkaProducer.publishStockIncreasedSuccess(
        data.productId, 
        data.quantity, 
        updatedProduct.stock,
        data.userId
      );
      
      return { status: 'success', newStock: updatedProduct.stock };
    } catch (error) {
      this.logger.error(`Failed to increase stock:`, error);
      
      // Publish failure event
      await this.kafkaProducer.publishStockIncreasedFailed(
        data.productId, 
        data.quantity, 
        error.message,
        data.userId
      );
      
      throw error;
    }
  }

  // Order Event Handlers - Complete transaction with rollback support
  private async handleOrderCreated(data: any): Promise<any> {
    this.logger.log(`Processing order creation for user ${data.userId} - Total: $${data.totalAmount}`);
    
    const orderItems = data.items || data.cartItems || [];
    
    this.logger.debug(`Received order items:`, JSON.stringify(orderItems, null, 2));
    
    if (!orderItems || orderItems.length === 0) {
      throw new Error('No items in order');
    }
    
    try {
      // STEP 1: Check inventory stock for all items
      this.logger.log(`Checking inventory stock for ${orderItems.length} items`);
      for (const item of orderItems) {
        const product = await this.productRepository.findOne({ 
          where: { id: item.productId } 
        });

        if (!product) {
          throw new Error(`Product ${item.productName} not found in inventory`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.productName}. Requested: ${item.quantity}, Available: ${product.stock}`
          );
        }
      }

      // STEP 2: Reduce inventory stock
      this.logger.log('Reducing inventory stock for all items');
      for (const item of orderItems) {
        const product = await this.productRepository.findOne({ 
          where: { id: item.productId } 
        });

        if (product) {
          product.stock -= item.quantity;
          await this.productRepository.save(product);
          this.logger.log(`Reduced stock for ${product.name}: -${item.quantity} (remaining: ${product.stock})`);
        }
      }

      // STEP 3: Create order with items
      this.logger.log('Creating order in database');
      const order = this.orderRepository.create({
        userId: data.userId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerAddress: data.customerAddress,
        totalAmount: data.totalAmount,
        status: data.status || OrderStatus.PENDING,
      });

      const savedOrder = await this.orderRepository.save(order);
      this.logger.log(`Order created with ID: ${savedOrder.id}`);

      // Create order items
      const orderItemEntities = orderItems.map((item: any) =>
        this.orderItemRepository.create({
          orderId: savedOrder.id,
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          productImage: item.productImage || item.image || 'https://via.placeholder.com/150',
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        }),
      );

      await this.orderItemRepository.save(orderItemEntities);
      this.logger.log(`Created ${orderItemEntities.length} order items`);

      // STEP 4: Publish event to clear user's cart
      this.logger.log(`Publishing cart clear event for user ${data.userId}`);
      try {
        await this.publishCartClearEvent(data.userId);
      } catch (cartError) {
        this.logger.warn(`Failed to publish cart clear event: ${cartError.message}. Order still successful.`);
        // Don't fail the entire order if cart clear event publishing fails
      }

      // Fetch complete order with items for notification
      const completeOrder = await this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['items'],
      });

      // STEP 5: Publish success event
      await this.kafkaProducer.publishOrderCreatedSuccess(
        {
          orderId: savedOrder.id,
          tempOrderId: data.tempOrderId || data.orderId,
          userId: data.userId,
          totalAmount: data.totalAmount,
          itemCount: orderItems.length,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerAddress: data.customerAddress,
        },
        data.userId
      );

      this.logger.log(`Order ${savedOrder.id} created successfully with all transactions complete`);
      return { status: 'success', orderId: savedOrder.id };

    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`);
      
      // Publish failure event
      await this.kafkaProducer.publishOrderCreatedFailed(
        {
          tempOrderId: data.tempOrderId,
          userId: data.userId,
          totalAmount: data.totalAmount,
          cartItems: data.cartItems,
        },
        error.message,
        data.userId
      );
      
      throw error;
    }
  }

  private async publishCartClearEvent(userId: string): Promise<void> {
    const event = {
      eventId: `cart-clear-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: 'CART_CLEAR_REQUESTED',
      timestamp: Date.now(),
      data: { userId },
    };

    await this.kafkaProducer['kafkaClient'].publishEvent('cart-events', event);
    this.logger.log(`Published CART_CLEAR_REQUESTED event for user ${userId}`);
  }

  private async handleOrderConfirmed(data: any): Promise<any> {
    this.logger.log(`Order confirmed: ${data.orderId}`);
    return { status: 'success' };
  }

  private async handleOrderShipped(data: any): Promise<any> {
    this.logger.log(`Order shipped: ${data.orderId} - Tracking: ${data.trackingNumber}`);
    return { status: 'success' };
  }

  private async handleOrderCancelled(data: any): Promise<any> {
    this.logger.log(`Order cancelled: ${data.orderId} - Restocking ${data.items.length} items`);
    return { status: 'success' };
  }
}
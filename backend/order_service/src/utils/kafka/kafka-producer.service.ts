import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { KafkaClient, EventType, KafkaTopics } from '..';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafkaClient: KafkaClient;

  constructor() {
    const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];

    this.kafkaClient = new KafkaClient({
      clientId: 'order-service',
      brokers,
    });
  }

  async onModuleInit() {
    try {
      await this.kafkaClient.connectProducer();
      this.logger.log('Kafka producer connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect Kafka producer:', error);
    }
  }

  async onModuleDestroy() {
    await this.kafkaClient.disconnect();
  }

  async publishOrderCreated(order: any): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: EventType.ORDER_CREATED,
      timestamp: Date.now(),
      data: {
        orderId: order.tempOrderId || order.id,
        userId: order.userId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerAddress: order.customerAddress,
        totalAmount: order.totalAmount,
        status: order.status,
        items: (order.cartItems || order.items || []).map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
      },
    };

    try {
      await this.kafkaClient.publishEvent(KafkaTopics.ORDER_EVENTS, event);
      this.logger.log(`Published ORDER_CREATED event for order ${order.tempOrderId || order.id}`);
    } catch (error) {
      this.logger.error('Failed to publish ORDER_CREATED event:', error);
      throw error;
    }
  }

  async publishOrderConfirmed(orderId: string, userId: string): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: EventType.ORDER_CONFIRMED,
      timestamp: Date.now(),
      data: {
        orderId,
        userId,
      },
    };

    try {
      await this.kafkaClient.publishEvent(KafkaTopics.ORDER_EVENTS, event);
      this.logger.log(`Published ORDER_CONFIRMED event for order ${orderId}`);
    } catch (error) {
      this.logger.error('Failed to publish ORDER_CONFIRMED event:', error);
    }
  }

  async publishOrderShipped(orderId: string, userId: string, trackingNumber?: string): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: EventType.ORDER_SHIPPED,
      timestamp: Date.now(),
      data: {
        orderId,
        userId,
        trackingNumber,
      },
    };

    try {
      await this.kafkaClient.publishEvent(KafkaTopics.ORDER_EVENTS, event);
      this.logger.log(`Published ORDER_SHIPPED event for order ${orderId}`);
    } catch (error) {
      this.logger.error('Failed to publish ORDER_SHIPPED event:', error);
    }
  }

  async publishOrderCancelled(orderId: string, userId: string, items: any[]): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: EventType.ORDER_CANCELLED,
      timestamp: Date.now(),
      data: {
        orderId,
        userId,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    };

    try {
      await this.kafkaClient.publishEvent(KafkaTopics.ORDER_EVENTS, event);
      this.logger.log(`Published ORDER_CANCELLED event for order ${orderId}`);
    } catch (error) {
      this.logger.error('Failed to publish ORDER_CANCELLED event:', error);
    }
  }
}

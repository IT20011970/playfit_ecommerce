import { Injectable, Logger } from '@nestjs/common';
import { KafkaClient, KafkaTopics, EventType } from '..';

@Injectable()
export class KafkaProducerService {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafkaClient: KafkaClient;

  constructor() {
    const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
    const sasl = process.env.KAFKA_SASL_MECHANISM ? {
      mechanism: process.env.KAFKA_SASL_MECHANISM,
      username: process.env.KAFKA_SASL_USERNAME || '',
      password: process.env.KAFKA_SASL_PASSWORD || '',
    } : undefined;

    this.kafkaClient = new KafkaClient({
      clientId: 'event-processor-producer',
      brokers,
      sasl,
    });
  }

  async onModuleInit() {
    await this.kafkaClient.connectProducer();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.kafkaClient.disconnect();
  }

  private async publishNotificationEvent(eventType: EventType, data: any): Promise<void> {
    const event = {
      eventId: `${eventType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      timestamp: Date.now(),
      data,
    };

    await this.kafkaClient.publishEvent(KafkaTopics.NOTIFICATION_EVENTS, event);
    this.logger.log(`Published notification event: ${eventType}`);
  }

  // Success Events
  async publishItemCreatedSuccess(product: any, userId?: string): Promise<void> {
    await this.publishNotificationEvent(EventType.ITEM_CREATED_SUCCESS, { product, userId });
  }

  async publishItemUpdatedSuccess(productId: string, changes: any, userId?: string): Promise<void> {
    await this.publishNotificationEvent(EventType.ITEM_UPDATED_SUCCESS, { productId, changes, userId });
  }

  async publishItemDeletedSuccess(productId: string, userId?: string): Promise<void> {
    await this.publishNotificationEvent(EventType.ITEM_DELETED_SUCCESS, { productId, userId });
  }

  async publishStockReducedSuccess(productId: string, quantity: number, remainingStock: number, userId?: string): Promise<void> {
    await this.publishNotificationEvent(EventType.STOCK_REDUCED_SUCCESS, { 
      productId, 
      quantity, 
      remainingStock, 
      userId 
    });
  }

  async publishStockIncreasedSuccess(productId: string, quantity: number, newStock: number, userId?: string): Promise<void> {
    await this.publishNotificationEvent(EventType.STOCK_INCREASED_SUCCESS, { 
      productId, 
      quantity, 
      newStock, 
      userId 
    });
  }

  async publishOrderCreatedSuccess(orderData: any, userId: string): Promise<void> {
    await this.publishNotificationEvent(EventType.ORDER_CREATED_SUCCESS, { 
      orderId: orderData.orderId,
      tempOrderId: orderData.tempOrderId,
      totalAmount: orderData.totalAmount,
      itemCount: orderData.itemCount,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerAddress: orderData.customerAddress,
      userId 
    });
  }

  // Failure Events
  async publishItemCreatedFailed(productData: any, error: string, userId?: string): Promise<void> {
    await this.publishNotificationEvent(EventType.ITEM_CREATED_FAILED, { 
      productData, 
      error, 
      userId 
    });
  }

  async publishItemUpdatedFailed(productId: string, changes: any, error: string, userId?: string): Promise<void> {
    await this.publishNotificationEvent(EventType.ITEM_UPDATED_FAILED, { 
      productId, 
      changes, 
      error, 
      userId 
    });
  }

  async publishItemDeletedFailed(productId: string, error: string, userId?: string): Promise<void> {
    await this.publishNotificationEvent(EventType.ITEM_DELETED_FAILED, { 
      productId, 
      error, 
      userId 
    });
  }

  async publishStockReducedFailed(productId: string, quantity: number, error: string, userId?: string): Promise<void> {
    await this.publishNotificationEvent(EventType.STOCK_REDUCED_FAILED, { 
      productId, 
      quantity, 
      error, 
      userId 
    });
  }

  async publishStockIncreasedFailed(productId: string, quantity: number, error: string, userId?: string): Promise<void> {
    await this.publishNotificationEvent(EventType.STOCK_INCREASED_FAILED, { 
      productId, 
      quantity, 
      error, 
      userId 
    });
  }

  async publishOrderCreatedFailed(orderData: any, error: string, userId: string): Promise<void> {
    await this.publishNotificationEvent(EventType.ORDER_CREATED_FAILED, { 
      orderData, 
      error, 
      userId 
    });
  }
}

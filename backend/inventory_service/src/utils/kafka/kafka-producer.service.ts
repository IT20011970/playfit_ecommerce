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
      clientId: 'inventory-service',
      brokers,
    });
  }

  async onModuleInit() {
    try {
      await this.kafkaClient.connectProducer();
      this.logger.log('Kafka producer connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect Kafka producer:', error);
      // Don't throw - allow service to start and auto-reconnect on first publish
      this.logger.warn('Kafka producer will auto-reconnect on first publish attempt');
    }
  }

  async onModuleDestroy() {
    await this.kafkaClient.disconnect();
  }

  async publishInventoryItemAdded(product: any): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: EventType.INVENTORY_ITEM_ADDED,
      timestamp: Date.now(),
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image || product.imageUrl,
        category: product.category,
        sizes: product.sizes,
        colors: product.colors,
        isNewArrival: product.isNewArrival,
        userId: product.userId,
      },
    };

    try {
      await this.kafkaClient.publishEvent(KafkaTopics.INVENTORY_EVENTS, event);
      this.logger.log(`Published INVENTORY_ITEM_ADDED event for product ${product.id}`);
    } catch (error) {
      this.logger.error('Failed to publish INVENTORY_ITEM_ADDED event:', error);
      throw error;
    }
  }

  async publishInventoryItemUpdated(productId: string, changes: any): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: EventType.INVENTORY_ITEM_UPDATED,
      timestamp: Date.now(),
      data: {
        productId,
        changes,
      },
    };

    try {
      await this.kafkaClient.publishEvent(KafkaTopics.INVENTORY_EVENTS, event);
      this.logger.log(`Published INVENTORY_ITEM_UPDATED event for product ${productId}`);
    } catch (error) {
      this.logger.error('Failed to publish INVENTORY_ITEM_UPDATED event:', error);
    }
  }

  async publishInventoryItemDeleted(productId: string): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: EventType.INVENTORY_ITEM_DELETED,
      timestamp: Date.now(),
      data: {
        productId,
      },
    };

    try {
      await this.kafkaClient.publishEvent(KafkaTopics.INVENTORY_EVENTS, event);
      this.logger.log(`Published INVENTORY_ITEM_DELETED event for product ${productId}`);
    } catch (error) {
      this.logger.error('Failed to publish INVENTORY_ITEM_DELETED event:', error);
    }
  }

  async publishInventoryStockReduced(productId: string, quantity: number, remainingStock: number): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: EventType.INVENTORY_STOCK_REDUCED,
      timestamp: Date.now(),
      data: {
        productId,
        quantity,
        remainingStock,
      },
    };

    try {
      await this.kafkaClient.publishEvent(KafkaTopics.INVENTORY_EVENTS, event);
      this.logger.log(`Published INVENTORY_STOCK_REDUCED event for product ${productId}`);
    } catch (error) {
      this.logger.error('Failed to publish INVENTORY_STOCK_REDUCED event:', error);
    }
  }

  async publishInventoryStockIncreased(productId: string, quantity: number, newStock: number): Promise<void> {
    const event = {
      eventId: uuidv4(),
      eventType: EventType.INVENTORY_STOCK_INCREASED,
      timestamp: Date.now(),
      data: {
        productId,
        quantity,
        newStock,
      },
    };

    try {
      await this.kafkaClient.publishEvent(KafkaTopics.INVENTORY_EVENTS, event);
      this.logger.log(`Published INVENTORY_STOCK_INCREASED event for product ${productId}`);
    } catch (error) {
      this.logger.error('Failed to publish INVENTORY_STOCK_INCREASED event:', error);
    }
  }
}

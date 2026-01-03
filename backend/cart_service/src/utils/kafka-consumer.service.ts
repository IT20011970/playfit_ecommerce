import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { KafkaClient } from './kafka.client';
import { CartService } from '../cart/cart.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafkaClient: KafkaClient;

  constructor(private readonly cartService: CartService) {
    const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
    const sasl = process.env.KAFKA_SASL_MECHANISM ? {
      mechanism: process.env.KAFKA_SASL_MECHANISM,
      username: process.env.KAFKA_SASL_USERNAME || '',
      password: process.env.KAFKA_SASL_PASSWORD || '',
    } as any : undefined;
    
    this.kafkaClient = new KafkaClient({
      clientId: 'cart-service',
      brokers,
      sasl,
    });
  }

  async onModuleInit() {
    try {
      await this.kafkaClient.connectConsumer('cart-service-group');
      this.logger.log('Kafka consumer connected successfully');

      // Subscribe to cart-events topic
      const topics = ['cart-events'];
      await this.kafkaClient.subscribe(topics, false);
      this.logger.log(`Subscribed to topics: ${topics.join(', ')}`);

      // Start consuming messages
      await this.kafkaClient.consumeMessages(async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value?.toString() || '{}');
          this.logger.log(`Received event from ${topic}: ${event.eventType}`);

          // Handle cart events
          await this.handleEvent(event);
        } catch (error) {
          this.logger.error('Error processing Kafka message:', error);
        }
      });

      this.logger.log('Started consuming Kafka messages from cart-events');
    } catch (error) {
      this.logger.error('Failed to initialize Kafka consumer:', error);
    }
  }

  private async handleEvent(event: any): Promise<void> {
    const { eventType, data } = event;

    switch (eventType) {
      case 'CART_CLEAR_REQUESTED':
        await this.handleClearCart(data);
        break;
      
      default:
        this.logger.warn(`Unknown event type: ${eventType}`);
    }
  }

  private async handleClearCart(data: any): Promise<void> {
    try {
      this.logger.log(`Clearing cart for user: ${data.userId}`);
      const cleared = await this.cartService.clearCart(data.userId);
      
      if (cleared) {
        this.logger.log(`Successfully cleared cart for user ${data.userId}`);
      } else {
        this.logger.warn(`No cart items found for user ${data.userId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to clear cart for user ${data.userId}:`, error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.kafkaClient.disconnect();
    this.logger.log('Kafka consumer disconnected');
  }
}

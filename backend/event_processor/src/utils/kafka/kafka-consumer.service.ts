import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { KafkaClient, KafkaTopics } from '..';
import { EachMessagePayload } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafkaClient: KafkaClient;

  constructor(
    @InjectQueue('events') private readonly eventsQueue: Queue
  ) {
    const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
    const sasl = process.env.KAFKA_SASL_MECHANISM ? {
      mechanism: process.env.KAFKA_SASL_MECHANISM,
      username: process.env.KAFKA_SASL_USERNAME || '',
      password: process.env.KAFKA_SASL_PASSWORD || '',
    } : undefined;

    this.kafkaClient = new KafkaClient({
      clientId: 'event-processor',
      brokers,
      groupId: 'event-processor-group',
      sasl,
    });
  }

  async onModuleInit() {
    try {
      await this.kafkaClient.connectConsumer();
      
      // Subscribe to all topics
      const topics = [KafkaTopics.INVENTORY_EVENTS, KafkaTopics.ORDER_EVENTS];
      
      await this.kafkaClient.subscribe(topics, this.handleMessage.bind(this));
      
      this.logger.log('Kafka consumer connected and subscribed to topics successfully');
    } catch (error) {
      this.logger.error('Failed to connect Kafka consumer:', error);
      this.logger.error('🔄 Exiting process to trigger Docker restart...');
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.kafkaClient.disconnect();
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;
    
    try {
      const event = JSON.parse(message.value?.toString() || '{}');
      
      this.logger.log(
        `📨 Received message from topic ${topic} [partition ${partition}]: ${event.eventType} (ID: ${event.eventId})`
      );

      await this.eventsQueue.add(
        'process-event',
        {
          eventId: event.eventId,
          eventType: event.eventType,
          timestamp: event.timestamp,
          data: event.data,
          topic,
        },
        {
          jobId: event.eventId,
          removeOnComplete: {
            age: 86400,
            count: 1000,
          },
          removeOnFail: {
            age: 604800,
          },
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }
      );

      this.logger.log(`✅ Event ${event.eventId} added to BullMQ queue for processing`);
    } catch (error) {
      this.logger.error(`❌ Error handling message from topic ${topic}:`, error);
      throw error;
    }
  }
}

import { Kafka, Producer, Consumer, EachMessagePayload, logLevel, SASLOptions } from 'kafkajs';

export interface KafkaConfig {
  clientId: string;
  brokers: string[];
  groupId?: string;
  sasl?: SASLOptions;
}

export class KafkaClient {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private readonly config: KafkaConfig;

  constructor(config: KafkaConfig) {
    this.config = config;

    // Configure SASL if environment variables are present or config is provided
    const saslConfig = config.sasl || this.getSASLConfig();

    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      logLevel: logLevel.ERROR,
      retry: {
        initialRetryTime: 300,
        retries: 8,
      },
      ssl: saslConfig ? true : false,
      sasl: saslConfig,
    });
  }

  private getSASLConfig(): SASLOptions | undefined {
    const mechanism = process.env.KAFKA_SASL_MECHANISM;
    const username = process.env.KAFKA_SASL_USERNAME;
    const password = process.env.KAFKA_SASL_PASSWORD;

    if (mechanism && username && password) {
      return {
        mechanism: mechanism as any,
        username,
        password,
      };
    }

    return undefined;
  }

  /**
   * Initialize and connect the producer
   */
  async connectProducer(): Promise<void> {
    if (!this.producer) {
      console.log('Creating Kafka producer with config:', {
        clientId: this.config.clientId,
        brokers: this.config.brokers,
        hasSasl: !!this.config.sasl,
      });
      this.producer = this.kafka.producer({
        allowAutoTopicCreation: true,
        transactionTimeout: 30000,
      });
      console.log('Connecting producer...');
      await this.producer.connect();
      console.log(`[Kafka Producer] Connected - ClientId: ${this.config.clientId}`);
    }
  }

  /**
   * Publish a message to a Kafka topic
   */
  async publishEvent(topic: string, event: any): Promise<void> {
    if (!this.producer) {
      console.log('Producer not connected, attempting to connect...');
      try {
        await this.connectProducer();
        console.log('Producer connected successfully in publishEvent');
      } catch (error) {
        console.error('Failed to connect producer in publishEvent:', error);
        throw error;
      }
    }

    if (!this.producer) {
      throw new Error('Failed to connect producer');
    }

    const message = {
      key: event.eventId || Date.now().toString(),
      value: JSON.stringify(event),
      timestamp: Date.now().toString(),
    };

    try {
      await this.producer.send({
        topic,
        messages: [message],
      });
      console.log(`[Kafka Producer] Event published to topic "${topic}":`, event.eventType);
    } catch (error) {
      console.error(`[Kafka Producer] Failed to send message to topic "${topic}":`, error);
      throw error;
    }
  }

  /**
   * Publish multiple events in a batch
   */
  async publishBatch(topic: string, events: any[]): Promise<void> {
    if (!this.producer) {
      throw new Error('Producer not connected. Call connectProducer() first.');
    }

    const messages = events.map(event => ({
      key: event.eventId || Date.now().toString(),
      value: JSON.stringify(event),
      timestamp: Date.now().toString(),
    }));

    await this.producer.send({
      topic,
      messages,
    });

    console.log(`[Kafka Producer] ${events.length} events published to topic "${topic}"`);
  }

  /**
   * Initialize and connect the consumer
   */
  async connectConsumer(groupId?: string): Promise<void> {
    if (!this.consumer) {
      const consumerGroupId = groupId || this.config.groupId || `${this.config.clientId}-group`;
      this.consumer = this.kafka.consumer({
        groupId: consumerGroupId,
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
      });
      await this.consumer.connect();
      console.log(`[Kafka Consumer] Connected - GroupId: ${consumerGroupId}`);
    }
  }

  /**
   * Subscribe to topics and process messages
   */
  async subscribe(
    topics: string[],
    messageHandler: (payload: EachMessagePayload) => Promise<void>,
  ): Promise<void> {
    if (!this.consumer) {
      throw new Error('Consumer not connected. Call connectConsumer() first.');
    }

    // Subscribe to all topics
    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
      console.log(`[Kafka Consumer] Subscribed to topic: ${topic}`);
    }

    // Run the consumer
    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          await messageHandler(payload);
        } catch (error) {
          console.error(
            `[Kafka Consumer] Error processing message from topic ${payload.topic}:`,
            error,
          );
        }
      },
    });
  }

  /**
   * Disconnect producer and consumer
   */
  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
      console.log('[Kafka Producer] Disconnected');
    }
    if (this.consumer) {
      await this.consumer.disconnect();
      console.log('[Kafka Consumer] Disconnected');
    }
  }

  /**
   * Get the producer instance
   */
  getProducer(): Producer | null {
    return this.producer;
  }

  /**
   * Get the consumer instance
   */
  getConsumer(): Consumer | null {
    return this.consumer;
  }
}

/**
 * Create a Kafka client instance
 */
export function createKafkaClient(config: KafkaConfig): KafkaClient {
  return new KafkaClient(config);
}

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
    
    // Check if using Azure Event Hubs (detect by broker URL)
    const isEventHubs = config.brokers.some(broker => broker.includes('servicebus.windows.net'));
    const eventHubsConnectionString = process.env.KAFKA_CONNECTION_STRING;
    
    const kafkaConfig: any = {
      clientId: config.clientId,
      brokers: config.brokers,
      logLevel: logLevel.ERROR,
      retry: {
        initialRetryTime: 300,
        retries: 8,
      },
    };
    
    // Configure SASL authentication for Azure Event Hubs
    if (isEventHubs && eventHubsConnectionString) {
      console.log('[Kafka Client] Detected Azure Event Hubs - configuring SASL authentication');
      kafkaConfig.ssl = true;
      kafkaConfig.sasl = {
        mechanism: 'plain',
        username: '$ConnectionString',
        password: eventHubsConnectionString,
      };
    } else if (config.sasl) {
      kafkaConfig.sasl = config.sasl;
    }
    
    this.kafka = new Kafka(kafkaConfig);
  }

  async connectProducer(): Promise<void> {
    if (!this.producer) {
      this.producer = this.kafka.producer({
        allowAutoTopicCreation: true,
        transactionTimeout: 30000,
      });
      await this.producer.connect();
      console.log(`[Kafka Producer] Connected - ClientId: ${this.config.clientId}`);
    }
  }

  async publishEvent(topic: string, event: any): Promise<void> {
    if (!this.producer) {
      throw new Error('Producer not connected. Call connectProducer() first.');
    }

    const message = {
      key: event.eventId || Date.now().toString(),
      value: JSON.stringify(event),
      timestamp: Date.now().toString(),
    };

    await this.producer.send({
      topic,
      messages: [message],
    });

    console.log(`[Kafka Producer] Event published to topic "${topic}":`, event.eventType);
  }

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

  async subscribe(topics: string[], fromBeginning = false): Promise<void> {
    if (!this.consumer) {
      throw new Error('Consumer not connected. Call connectConsumer() first.');
    }

    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning });
      console.log(`[Kafka Consumer] Subscribed to topic: ${topic}`);
    }
  }

  async consumeMessages(
    messageHandler: (payload: EachMessagePayload) => Promise<void>,
  ): Promise<void> {
    if (!this.consumer) {
      throw new Error('Consumer not connected. Call connectConsumer() first.');
    }

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

  getProducer(): Producer | null {
    return this.producer;
  }

  getConsumer(): Consumer | null {
    return this.consumer;
  }
}

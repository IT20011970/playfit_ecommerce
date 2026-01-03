const { Kafka } = require('kafkajs');
const { SchemaRegistry } = require('@kafkajs/confluent-schema-registry');

const kafka = new Kafka({
  clientId: 'kafka-log-viewer',
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
});

const registry = new SchemaRegistry({
  host: process.env.SCHEMA_REGISTRY_URL || 'http://localhost:8081',
});

const consumer = kafka.consumer({ groupId: 'log-viewer-group' });

// ANSI color codes for better readability
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

async function viewKafkaLogs(topics = ['inventory-events', 'order-events']) {
  try {
    await consumer.connect();
    console.log(`${colors.green}✓ Connected to Kafka${colors.reset}`);

    // Subscribe to topics
    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: true });
      console.log(`${colors.cyan}→ Subscribed to topic: ${topic}${colors.reset}`);
    }

    console.log(`\n${colors.bright}${colors.yellow}Listening for messages... (Press Ctrl+C to exit)${colors.reset}\n`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          let value;
          let key = message.key ? message.key.toString() : null;

          // Try to decode Avro, fallback to JSON
          try {
            value = await registry.decode(message.value);
            console.log(`${colors.magenta}[AVRO]${colors.reset}`);
          } catch (avroError) {
            // If not Avro, try JSON
            const jsonString = message.value.toString();
            try {
              value = JSON.parse(jsonString);
              console.log(`${colors.blue}[JSON]${colors.reset}`);
            } catch (jsonError) {
              value = jsonString;
              console.log(`${colors.yellow}[TEXT]${colors.reset}`);
            }
          }

          // Display message
          console.log(`${colors.bright}${colors.cyan}Topic:${colors.reset} ${topic}`);
          console.log(`${colors.cyan}Partition:${colors.reset} ${partition}`);
          console.log(`${colors.cyan}Offset:${colors.reset} ${message.offset}`);
          if (key) {
            console.log(`${colors.cyan}Key:${colors.reset} ${key}`);
          }
          console.log(`${colors.cyan}Timestamp:${colors.reset} ${new Date(parseInt(message.timestamp)).toISOString()}`);
          console.log(`${colors.bright}${colors.green}Value:${colors.reset}`);
          console.log(JSON.stringify(value, null, 2));
          console.log(`${colors.yellow}${'─'.repeat(80)}${colors.reset}\n`);

        } catch (error) {
          console.error(`${colors.red}Error processing message:${colors.reset}`, error.message);
        }
      },
    });

  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error);
    process.exit(1);
  }
}

// Handle graceful shutdown
const shutdown = async () => {
  console.log(`\n${colors.yellow}Shutting down...${colors.reset}`);
  await consumer.disconnect();
  console.log(`${colors.green}✓ Disconnected${colors.reset}`);
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Get topics from command line args or use defaults
const args = process.argv.slice(2);
const topics = args.length > 0 ? args : ['inventory-events', 'order-events'];

console.log(`${colors.bright}${colors.cyan}Kafka Log Viewer${colors.reset}`);
console.log(`${colors.cyan}Topics:${colors.reset} ${topics.join(', ')}\n`);

viewKafkaLogs(topics);

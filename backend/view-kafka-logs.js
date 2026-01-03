/**
 * Kafka Log Viewer
 * Usage: node view-kafka-logs.js [topic-name] [from-beginning]
 * 
 * Examples:
 *   node view-kafka-logs.js inventory-events
 *   node view-kafka-logs.js order-events true
 */

const { Kafka } = require('kafkajs');

const topic = process.argv[2] || 'inventory-events';
const fromBeginning = process.argv[3] === 'true';

const kafka = new Kafka({
  clientId: 'kafka-log-viewer',
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  logLevel: 0, // NOTHING - suppress kafkajs logs
});

const consumer = kafka.consumer({ 
  groupId: `log-viewer-${Date.now()}` // Unique group ID each time
});

const run = async () => {
  console.log(`\n📡 Connecting to Kafka brokers: ${kafka.brokers}\n`);
  
  await consumer.connect();
  console.log(`✅ Connected to Kafka`);
  
  await consumer.subscribe({ topic, fromBeginning });
  console.log(`📬 Subscribed to topic: "${topic}"${fromBeginning ? ' (from beginning)' : ''}\n`);
  console.log('=' .repeat(80));
  console.log('Waiting for messages... (Press Ctrl+C to exit)\n');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const key = message.key?.toString();
      const value = message.value?.toString();
      const timestamp = new Date(parseInt(message.timestamp)).toISOString();
      
      try {
        const parsedValue = JSON.parse(value);
        
        console.log(`\n🔔 New Message:`);
        console.log(`  Topic:     ${topic}`);
        console.log(`  Partition: ${partition}`);
        console.log(`  Offset:    ${message.offset}`);
        console.log(`  Key:       ${key || 'null'}`);
        console.log(`  Timestamp: ${timestamp}`);
        console.log(`  Event Type: ${parsedValue.eventType || 'N/A'}`);
        console.log(`  Event ID:   ${parsedValue.eventId || 'N/A'}`);
        console.log(`\n  📦 Payload:`);
        console.log(JSON.stringify(parsedValue, null, 2).split('\n').map(line => `    ${line}`).join('\n'));
        console.log('\n' + '-'.repeat(80));
      } catch (err) {
        console.log(`\n📨 Raw Message:`);
        console.log(`  Topic:     ${topic}`);
        console.log(`  Partition: ${partition}`);
        console.log(`  Offset:    ${message.offset}`);
        console.log(`  Key:       ${key || 'null'}`);
        console.log(`  Timestamp: ${timestamp}`);
        console.log(`  Value:     ${value}`);
        console.log('\n' + '-'.repeat(80));
      }
    },
  });
};

// Graceful shutdown
const errorTypes = ['unhandledRejection', 'uncaughtException'];
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

errorTypes.forEach(type => {
  process.on(type, async (err) => {
    try {
      console.log(`\n\n${type}: ${err}`);
      await consumer.disconnect();
      process.exit(0);
    } catch (_) {
      process.exit(1);
    }
  });
});

signalTraps.forEach(type => {
  process.once(type, async () => {
    try {
      console.log('\n\n👋 Disconnecting from Kafka...');
      await consumer.disconnect();
      console.log('✅ Disconnected successfully');
      process.exit(0);
    } catch (_) {
      process.exit(1);
    }
  });
});

run().catch(async (err) => {
  console.error('❌ Error:', err);
  try {
    await consumer.disconnect();
  } catch (_) {}
  process.exit(1);
});

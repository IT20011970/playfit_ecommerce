import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaModule } from './utils/kafka/kafka.module';
import { EventLog, Product, Order, OrderItem } from './entities';
import { EventProcessor } from './processors/event.processor';

const eventDbUrl = process.env.EVENT_DB_URL || 'postgresql://neondb_owner:npg_WHJ72IBcyfkF@ep-patient-dew-a4m078xf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const inventoryDbUrl = process.env.INVENTORY_DB_URL || 'postgresql://neondb_owner:npg_WHJ72IBcyfkF@ep-patient-dew-a4m078xf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const orderDbUrl = process.env.ORDER_DB_URL || 'postgresql://neondb_owner:npg_WHJ72IBcyfkF@ep-patient-dew-a4m078xf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const shouldUseSsl = process.env.DB_SSL === 'true';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisPassword = process.env.REDIS_PASSWORD;

@Module({
  imports: [
    // Event logging database
    TypeOrmModule.forRoot({
      name: 'eventConnection',
      type: 'postgres',
      url: eventDbUrl,
      entities: [EventLog],
      synchronize: true,
      logging: ['error', 'warn', 'schema'],
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
    }),
    TypeOrmModule.forRoot({
      name: 'inventoryConnection',
      type: 'postgres',
      url: inventoryDbUrl,
      entities: [Product],
      synchronize: true,
      logging: ['error', 'warn', 'schema'],
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
    }),
    TypeOrmModule.forRoot({
      name: 'orderConnection',
      type: 'postgres',
      url: orderDbUrl,
      entities: [Order, OrderItem],
      synchronize: true,
      logging: ['error', 'warn', 'schema'],
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
    }),
    TypeOrmModule.forFeature([EventLog], 'eventConnection'),
    TypeOrmModule.forFeature([Product], 'inventoryConnection'),
    TypeOrmModule.forFeature([Order, OrderItem], 'orderConnection'),
    // BullMQ for queue management
    BullModule.forRoot({
      connection: {
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        tls: redisPassword ? { 
          servername: redisHost,
          rejectUnauthorized: false 
        } : undefined,
        connectTimeout: 120000,
        commandTimeout: 10000,
        keepAlive: 60000,
        retryStrategy: (times) => {
          if (times > 10) {
            return null; // Stop retrying after 10 attempts
          }
          return Math.min(times * 1000, 10000); // Exponential backoff up to 10 seconds
        },
      },
    }),
    BullModule.registerQueue({
      name: 'events',
    }),
    // Kafka consumer
    KafkaModule,
  ],
  controllers: [AppController],
  providers: [AppService, EventProcessor],
})
export class AppModule {}

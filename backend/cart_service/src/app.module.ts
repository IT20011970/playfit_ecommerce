import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CartModule } from './cart/cart.module';
import { Cart } from './cart/entities/cart.entity';
import { UserRef } from './cart/types/user.graphql';
import { KafkaConsumerService } from './utils/kafka-consumer.service';

const fallbackDatabaseUrl =
  'postgresql://neondb_owner:npg_WHJ72IBcyfkF@ep-patient-dew-a4m078xf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const databaseUrl = (process.env.DATABASE_URL ?? '').trim() || fallbackDatabaseUrl;
const shouldUseSsl = /sslmode=require/i.test(databaseUrl) || process.env.DB_SSL === 'true';

@Module({
  imports: [
    // GraphQL Federation
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        path: join(process.cwd(), 'src/schema.gql'),
        federation: 2,
      },
      playground: true,
      path: '/graphql',
      buildSchemaOptions: {
        orphanedTypes: [UserRef],
      },
    }),

    // TypeORM Database Connection
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: databaseUrl,
      entities: [Cart],
      synchronize: true,
      dropSchema: process.env.DB_DROP_SCHEMA === 'true',
      logging: process.env.TYPEORM_LOGGING === 'true',
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
    }),

    CartModule,
  ],
  controllers: [AppController],
  providers: [AppService, KafkaConsumerService],
})
export class AppModule {}

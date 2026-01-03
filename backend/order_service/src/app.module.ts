import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderModule } from './order/order.module';
import { Product } from './entities';

const fallbackDatabaseUrl =
  'postgresql://neondb_owner:npg_WHJ72IBcyfkF@ep-patient-dew-a4m078xf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const databaseUrl = (process.env.DATABASE_URL ?? '').trim() || fallbackDatabaseUrl;
const shouldUseSsl = /sslmode=require/i.test(databaseUrl) || process.env.DB_SSL === 'true';

const inventoryDatabaseUrl = process.env.INVENTORY_DATABASE_URL || 'postgresql://neondb_owner:npg_WHJ72IBcyfkF@ep-patient-dew-a4m078xf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const shouldUseInventorySsl = process.env.INVENTORY_DB_SSL === 'true';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: databaseUrl,
      autoLoadEntities: true,
      synchronize: true,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
    }),
    TypeOrmModule.forRoot({
      name: 'inventory',
      type: 'postgres',
      url: inventoryDatabaseUrl,
      entities: [Product],
      synchronize: true,
      ssl: shouldUseInventorySsl ? { rejectUnauthorized: false } : false,
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        path: 'src/schema.gql',
        federation: 2,
      },
      playground: true,
      introspection: true,
    }),
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

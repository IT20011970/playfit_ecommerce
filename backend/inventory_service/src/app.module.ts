import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';
import { ImageUploadController } from './image-upload.controller';
import { Product } from './entities';

const fallbackDatabaseUrl =
  'postgresql://neondb_owner:npg_WHJ72IBcyfkF@ep-patient-dew-a4m078xf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const databaseUrl = (process.env.DATABASE_URL ?? '').trim() || fallbackDatabaseUrl;
const shouldUseSsl = /sslmode=require/i.test(databaseUrl) || process.env.DB_SSL === 'true';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: databaseUrl,
      entities: [Product],
      synchronize: true,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
      playground: true,
    }),
    InventoryModule,
  ],
  controllers: [AppController, ImageUploadController],
  providers: [AppService],
})
export class AppModule {}

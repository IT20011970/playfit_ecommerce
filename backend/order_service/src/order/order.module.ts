import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { Order, OrderItem, Product } from '../entities';
import { KafkaModule } from '../utils/kafka/kafka.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    TypeOrmModule.forFeature([Product], 'inventory'), // Use inventory connection
    KafkaModule,
  ],
  providers: [OrderService, OrderResolver],
  exports: [OrderService],
})
export class OrderModule {}

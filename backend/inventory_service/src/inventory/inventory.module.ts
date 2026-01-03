import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities';
import { InventoryService } from './inventory.service';
import { InventoryResolver } from './inventory.resolver';
import { KafkaModule } from 'src/utils/kafka/kafka.module';


@Module({
  imports: [TypeOrmModule.forFeature([Product]), KafkaModule],
  providers: [InventoryService, InventoryResolver],
  exports: [InventoryService],
})
export class InventoryModule {}

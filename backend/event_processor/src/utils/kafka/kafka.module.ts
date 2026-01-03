import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { KafkaConsumerService } from './kafka-consumer.service';
import { KafkaProducerService } from './kafka-producer.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'events',
    }),
  ],
  providers: [KafkaConsumerService, KafkaProducerService],
  exports: [KafkaConsumerService, KafkaProducerService],
})
export class KafkaModule {}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LokiLogger } from './loki-logger';

async function bootstrap() {
  const lokiLogger = new LokiLogger('event-processor');
  const app = await NestFactory.create(AppModule, { logger: lokiLogger });
  await app.listen(process.env.PORT ?? 3005);
  lokiLogger.log(`Event Processor listening on port ${process.env.PORT ?? 3005}`, 'Bootstrap');
}
bootstrap();

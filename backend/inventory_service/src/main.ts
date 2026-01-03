import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LokiLogger } from './loki-logger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const lokiLogger = new LokiLogger('inventory-service');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: lokiLogger });
  
  lokiLogger.log('Inventory Service starting...', 'Bootstrap');
  
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });
  
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  const port = process.env.PORT || 3004;
  await app.listen(port);
  lokiLogger.log(`Inventory Service running on port ${port}`, 'Bootstrap');
}
bootstrap();

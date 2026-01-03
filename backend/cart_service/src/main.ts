import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LokiLogger } from './loki-logger';

async function bootstrap() {
  const lokiLogger = new LokiLogger('cart-service');
  const app = await NestFactory.create(AppModule, { logger: lokiLogger });
  
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });
  
  const port = process.env.PORT || 3002;
  await app.listen(port);
  lokiLogger.log(`Cart Service running on port ${port}`, 'Bootstrap');
}
bootstrap();

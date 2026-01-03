import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LokiLogger } from './loki-logger';

async function bootstrap() {
  const lokiLogger = new LokiLogger('login-sdk');
  const app = await NestFactory.create(AppModule, { logger: lokiLogger });
  
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  lokiLogger.log(`User Service running on port ${port}`, 'Bootstrap');
}

bootstrap();

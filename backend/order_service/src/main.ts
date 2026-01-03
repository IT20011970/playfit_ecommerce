import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { LokiLogger } from './loki-logger';

async function bootstrap() {
  const lokiLogger = new LokiLogger('order-service');
  const app = await NestFactory.create(AppModule, { logger: lokiLogger });
  
  lokiLogger.log('Order Service starting...', 'Bootstrap');
  
  // Middleware
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  
  // CORS configuration
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost,http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  const port = process.env.PORT || 3003;
  await app.listen(port);
  lokiLogger.log(`Order Service running on port ${port}`, 'Bootstrap');
}
bootstrap();

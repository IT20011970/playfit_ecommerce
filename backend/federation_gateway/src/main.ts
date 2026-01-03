import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { LokiLogger } from './loki-logger';

async function bootstrap() {
  const lokiLogger = new LokiLogger('federation-gateway');
  
  if (process.env.NODE_ENV === 'production') {
    lokiLogger.log('Waiting 30 seconds for services to be ready...', 'Bootstrap');
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
  
  const app = await NestFactory.create(AppModule, { logger: lokiLogger });
  
  // Middleware
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  
  // CORS configuration: allow multiple origins via comma-separated env
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost,http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no origin) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Use PORT env variable for Azure (defaults to 8080 on Azure, 4000 locally)
  const port = process.env.PORT || 4000;
  await app.listen(port);
  lokiLogger.log(`Federation Gateway running on port ${port}`, 'Bootstrap');
}
bootstrap();

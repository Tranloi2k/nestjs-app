import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS')?.split(',');

  console.log(allowedOrigins);

  app.enableCors({
    origin: allowedOrigins, // Chỉ cho phép domain này
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức HTTP được phép
    allowedHeaders: 'Content-Type, Accept, Authorization', // Các header được phép
    credentials: true, // Cho phép gửi cookie hoặc thông tin xác thực
  });

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Product API')
    .setDescription('API for managing products')
    .setVersion('1.0')
    .addTag('products') // Thêm tag để nhóm các API liên quan
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Truy cập Swagger UI tại /api

  await app.listen(5000);
}
bootstrap();

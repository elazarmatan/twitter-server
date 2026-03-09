import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('MY TWITTER')
    .setDescription('good application')
    .setVersion('1.0')
    .addTag('posts')
    .build()
  const document = SwaggerModule.createDocument(app,config)
  SwaggerModule.setup('api',app,document)

  // allow automatic type conversion (e.g. arrays) and strip unknown props
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
      enableImplicitConversion: true,
    },
    }),
  );

  // serve uploaded files from the /uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
  const banner = `
 ████████╗██╗    ██╗██╗████████╗████████╗███████╗██████╗ 
 ╚══██╔══╝██║    ██║██║╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
    ██║   ██║ █╗ ██║██║   ██║      ██║   █████╗  ██████╔╝
    ██║   ██║███╗██║██║   ██║      ██║   ██╔══╝  ██╔══██╗
    ██║   ╚███╔███╔╝██║   ██║      ██║   ███████╗██║  ██║
    ╚═╝    ╚══╝╚══╝ ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

        🚀 Server is running on http://localhost:${process.env.PORT ?? 3000}
        🐦 TWITTER SERVER READY
  `;
  console.log(banner)
}
bootstrap();

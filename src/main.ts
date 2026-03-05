import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('MY TWITTER')
    .setDescription('good application')
    .setVersion('1.0')
    .addTag('posts')
    .build()
  const document = SwaggerModule.createDocument(app,config)
  SwaggerModule.setup('api',app,document)

  app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true}))
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

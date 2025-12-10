import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de CORS (para que se conecte a front)
  app.enableCors();

  //CONFIGURACIÓN DE SWAGGER
  const config = new DocumentBuilder()
    .setTitle('API Tienda E-commerce')
    .setDescription('Documentación para tienda online')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  // 'docs' es la ruta. Entrar por http://localhost:3000/docs
  //FIN CONFIGURACIÓN SWAGGER


  const port = process.env.PORT || 8080;

  await app.listen(port);

  console.log(' Aplicación corriendo en: http://localhost:' + port);
  console.log(' Swagger UI:           http://localhost:' + port + '/docs');
}
bootstrap();
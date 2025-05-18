import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//import { getBotToken } from 'nestjs-telegraf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //const bot = app.get(getBotToken());
  app.enableCors({
    origin: '*', // Reemplaza con el origen permitido
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false, // Si necesitas cookies o autenticación
  });

  //app.use(bot.webhookCallback('/secret-path'));
  await app.listen(4125);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();

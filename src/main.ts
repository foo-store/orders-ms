import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './config/envs.config';

async function bootstrap() {
  const logger = new Logger('OrdersMicroservice');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: [envs.natsUrl],
      },
    },
  );

  await app.listen();

  logger.log(`Orders microservice is running on ${envs.natsUrl}`);
}
bootstrap();

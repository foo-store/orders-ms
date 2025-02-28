import { Provider } from '@nestjs/common';
import { RABBITMQ_CLIENT } from '../constants';
import {
  ClientOptions,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { envs } from 'src/config/envs.config';

export const rabbitmqProvider: Provider = {
  provide: RABBITMQ_CLIENT,
  useFactory: () => {
    const config: ClientOptions = {
      transport: Transport.RMQ,
      options: {
        urls: [envs.rabbitMQUrl],
        queue: 'payments_queue',
        queueOptions: {
          durable: true,
        },
      },
    };
    return ClientProxyFactory.create(config);
  },
};

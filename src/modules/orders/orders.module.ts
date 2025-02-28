import { Module } from '@nestjs/common';
import { natsProvider } from 'src/common/providers/nats.provider';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { rabbitmqProvider } from 'src/common/providers/rabbitmq.provider';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, natsProvider, rabbitmqProvider],
})
export class OrdersModule {}

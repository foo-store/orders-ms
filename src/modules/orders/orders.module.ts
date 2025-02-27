import { Module } from '@nestjs/common';
import { natsProvider } from 'src/common/providers/nats.provider';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, natsProvider],
})
export class OrdersModule {}

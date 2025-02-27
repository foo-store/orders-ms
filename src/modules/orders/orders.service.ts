import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_CLIENT } from 'src/common/constants';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private logger = new Logger('OrdersService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  constructor(@Inject(NATS_CLIENT) private readonly clientProxy: ClientProxy) {
    super();
  }

  create(createOrderDto: CreateOrderDto) {
    return createOrderDto;
  }
}

import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Order, PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { NATS_CLIENT, RABBITMQ_CLIENT } from 'src/common/constants';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product } from './interfaces';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private logger = new Logger('OrdersService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  constructor(
    @Inject(NATS_CLIENT) private readonly natsProxy: ClientProxy,
    @Inject(RABBITMQ_CLIENT) private readonly rabbitmqProxy: ClientProxy,
  ) {
    super();
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    let products: Product[];

    try {
      products = await firstValueFrom(
        this.natsProxy.send<Product[], number[]>(
          'product.verify',
          createOrderDto.items.map((item) => item.productId),
        ),
      );
    } catch (error: any) {
      throw new RpcException(error);
    }

    const totalAmount = products
      .map((product) => {
        const quantity = createOrderDto.items.find(
          (item) => item.productId === product.id,
        )!.quantity;
        return quantity * product.price;
      })
      .reduce((acc, curr) => acc + curr);

    const newOrder = await this.order.create({
      data: {
        userId: createOrderDto.userId,
        total: totalAmount,
        OrderDetail: {
          create: products.map((product) => ({
            productId: product.id,
            quantity: createOrderDto.items.find(
              (item) => item.productId === product.id,
            )!.quantity,
            productName: product.name,
            productPrice: product.price,
          })),
        },
      },
    });

    this.rabbitmqProxy
      .emit('payment.create', {
        message: 'Emit event from Orders Service',
      })
      .subscribe();

    return newOrder;
  }
}

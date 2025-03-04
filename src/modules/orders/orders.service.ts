import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderStatus, Prisma, PrismaClient } from '@prisma/client';
import { catchError, firstValueFrom } from 'rxjs';
import { NATS_CLIENT, RABBITMQ_CLIENT } from 'src/common/constants';
import {
  CreatePaymentSessionDto,
  OrderStatusDto,
  PaymentSessionDto,
  PaymentSucceededDto,
} from './dto';
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

  async create(
    createOrderDto: CreateOrderDto,
  ): Promise<Prisma.OrderGetPayload<{ include: { OrderDetail: true } }>> {
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

    return await this.order.create({
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
      include: { OrderDetail: true },
    });
  }

  async createPaymentSession(
    order: Prisma.OrderGetPayload<{ include: { OrderDetail: true } }>,
  ): Promise<any> {
    try {
      return await firstValueFrom(
        this.rabbitmqProxy.send<PaymentSessionDto, CreatePaymentSessionDto>(
          'payment.session.create',
          {
            orderId: order.id,
            currency: 'usd',
            items: order.OrderDetail.map((item) => ({
              name: item.productName,
              price: item.productPrice,
              quantity: item.quantity,
            })),
          },
        ),
      );
    } catch (error) {
      console.error({ error });
    }
  }

  async paymentSucceeded(paymentSucceededDto: PaymentSucceededDto) {
    const { orderId, ...rest } = paymentSucceededDto;

    await this.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAID,
        paidAt: new Date(),
        PaymentOrder: {
          create: rest,
        },
      },
    });
  }

  async listFiltered(orderStatusDto: OrderStatusDto) {
    const { status } = orderStatusDto;
    return await this.order.findMany({ where: { status } });
  }
}

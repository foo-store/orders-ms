import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { OrderStatusDto, PaymentSucceededDto } from './dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('order.create')
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    const session = await this.ordersService.createPaymentSession(order);
    return { order, session };
  }

  @EventPattern('payment.succeeded')
  paymentSucceeded(@Payload() paymentSucceededDto: PaymentSucceededDto) {
    return this.ordersService.paymentSucceeded(paymentSucceededDto);
  }

  @MessagePattern('order.list-filtered')
  orderList(@Payload() orderStatus: OrderStatusDto) {
    return this.ordersService.listFiltered(orderStatus);
  }
}

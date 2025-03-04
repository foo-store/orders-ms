import { IsNotEmpty } from 'class-validator';

export class PaymentSucceededDto {
  @IsNotEmpty()
  stripePaymentId: string;

  @IsNotEmpty()
  orderId: string;

  @IsNotEmpty()
  receiptUrl: string;
}

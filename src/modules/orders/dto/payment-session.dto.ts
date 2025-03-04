import { IsNotEmpty, IsUrl } from 'class-validator';

export class PaymentSessionDto {
  @IsNotEmpty()
  @IsUrl()
  cancelUrl: string;

  @IsNotEmpty()
  @IsUrl()
  successUrl: string;

  @IsNotEmpty()
  @IsUrl()
  url: string;
}

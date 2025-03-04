import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreatePaymentSessionDto {
  @IsNotEmpty()
  @IsUUID('4')
  orderId: string;

  @IsNotEmpty()
  currency: string;

  @IsNotEmpty()
  @Type(() => PaymentSessionItemDto)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  items: PaymentSessionItemDto[];
}

export class PaymentSessionItemDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity: number;
}

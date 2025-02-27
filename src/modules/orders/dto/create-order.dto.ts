import { Type } from 'class-transformer';
import { ArrayMinSize, IsNotEmpty, ValidateNested } from 'class-validator';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  @Type(() => OrderItemDto)
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  items: OrderItemDto[];
}
